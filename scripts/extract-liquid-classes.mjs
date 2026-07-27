#!/usr/bin/env node
/**
 * Extrai todas as classes CSS dos bundles Liquid e gera um índice categorizado.
 * Uso: node scripts/extract-liquid-classes.mjs [versao] [--out=<diretorio>]
 * Ex.:  node scripts/extract-liquid-classes.mjs 3.1.0 --out=../liquid-catalog
 *
 * O diretório de saída é criado automaticamente se não existir. Sem --out,
 * escreve no diretório atual (cwd).
 *
 * Saída:
 *   liquid-classes-index.json   -> índice completo, agrupado por prefixo (uso: consulta pontual, NUNCA carregar inteiro no Copilot)
 *   liquid-classes-summary.md   -> só nomes de grupo + contagem (leve, pode ficar sempre-ativo se quiser)
 *
 * Limitação conhecida: extração é por regex sobre o CSS bruto, não por AST completo.
 * Cobre o caso comum (seletores de classe simples e combinados), mas pode:
 *   - incluir classes usadas só internamente pelo bundle (nao querendo dizer q sao "publicas")
 *   - não capturar classes geradas dinamicamente via JS (o bundle .js registra custom elements
 *     e pode aplicar classes em runtime que não aparecem no CSS estático)
 * Trate o índice como ponto de partida para busca, não como contrato formal do design system.
 */

const args = process.argv.slice(2).filter((a) => !a.startsWith('--out='));
const outArg = process.argv.find((a) => a.startsWith('--out='));
const VERSION = args[0] ?? '3.1.0';
const OUT_DIR = outArg ? outArg.replace('--out=', '') : '.';
const BASE = `https://static.bradesco.com.br/dsysliquid/dist/design-system-${VERSION}`;
const SOURCES = [
  { name: 'reset', url: `${BASE}/reset.bundle.min.css` },
  { name: 'design-system', url: `${BASE}/design-system.bundle.min.css` },
];

import http from 'node:http';
import https from 'node:https';
import tls from 'node:tls';

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

function getProxyUrl() {
  return (
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy ||
    null
  );
}

/**
 * Busca uma URL HTTPS através de um proxy corporativo, via túnel CONNECT manual.
 * Zero dependências externas — só http/https/tls nativos do Node. Isso existe porque
 * o fetch nativo do Node NÃO respeita HTTP_PROXY/HTTPS_PROXY (diferente de curl), e
 * adicionar um pacote (ex.: undici com EnvHttpProxyAgent) significaria instalar e manter
 * essa dependência em cada repo do harness, além de aparecer no scan do Mend à toa.
 */
function fetchThroughProxy(targetUrl, proxyUrlStr) {
  return new Promise((resolve, reject) => {
    const target = new URL(targetUrl);
    const proxy = new URL(proxyUrlStr);

    const connectReq = http.request({
      host: proxy.hostname,
      port: proxy.port || 80,
      method: 'CONNECT',
      path: `${target.hostname}:${target.port || 443}`,
      headers: { Host: `${target.hostname}:${target.port || 443}` },
      timeout: 15000,
    });

    connectReq.on('connect', (proxyRes, socket) => {
      if (proxyRes.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`Proxy recusou o túnel CONNECT: HTTP ${proxyRes.statusCode}`));
        return;
      }

      const tlsSocket = tls.connect({ socket, servername: target.hostname }, () => {
        const req = https.request(
          {
            method: 'GET',
            hostname: target.hostname,
            path: target.pathname + target.search,
            headers: {
              Host: target.hostname,
              'User-Agent': USER_AGENT,
              Accept: 'text/css,*/*;q=0.1',
            },
            createConnection: () => tlsSocket,
          },
          (response) => {
            if (response.statusCode !== 200) {
              response.resume();
              reject(new Error(`Falha ao buscar ${targetUrl}: ${response.statusCode}`));
              return;
            }
            const chunks = [];
            response.on('data', (c) => chunks.push(c));
            response.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
            response.on('error', reject);
          }
        );
        req.on('error', reject);
        req.end();
      });
      tlsSocket.on('error', reject);
    });

    connectReq.on('timeout', () => connectReq.destroy(new Error('Timeout ao conectar no proxy')));
    connectReq.on('error', reject);
    connectReq.end();
  });
}

async function fetchText(url) {
  const proxyUrl = getProxyUrl();
  if (proxyUrl) {
    return fetchThroughProxy(url, proxyUrl);
  }
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/css,*/*;q=0.1',
    },
  });
  if (!res.ok) throw new Error(`Falha ao buscar ${url}: ${res.status}`);
  return res.text();
}

/**
 * Extrai seletores de classe de um bloco de CSS.
 * Estratégia: separa por '}' para isolar regras, pega o texto ANTES de cada '{'
 * (o seletor), e dentro dele captura tokens .algumaCoisa.
 * Isso evita capturar coisas dentro de propriedades (ex: url(), content: ".foo").
 */
function extractClassSelectors(css) {
  const classes = new Set();
  // remove comentários
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  // captura pares seletor{...} — simplificado, ignora @media/@supports como delimitador
  // (a regex abaixo pega qualquer coisa antes de '{' que não seja outro '{' ou '}')
  const ruleRegex = /([^{}]+)\{[^{}]*\}/g;
  let match;
  while ((match = ruleRegex.exec(noComments)) !== null) {
    const selectorBlock = match[1];
    const classMatches = selectorBlock.match(/\.-?[_a-zA-Z][_a-zA-Z0-9-]*/g);
    if (classMatches) {
      for (const c of classMatches) {
        classes.add(c.slice(1)); // remove o '.'
      }
    }
  }
  return classes;
}

/**
 * Agrupa por prefixo até o segundo hífen (heurística).
 * Ex.: brad-btn-primary, brad-btn-outline -> grupo "brad-btn"
 * Ajuste PREFIX_DEPTH se a convenção real de vocês usar mais/menos segmentos.
 */
function groupByPrefix(classNames, prefixDepth = 2) {
  const groups = {};
  for (const name of classNames) {
    const parts = name.split('-');
    const key = parts.slice(0, Math.min(prefixDepth, parts.length)).join('-') || name;
    if (!groups[key]) groups[key] = [];
    groups[key].push(name);
  }
  for (const key of Object.keys(groups)) {
    groups[key].sort();
  }
  return groups;
}

async function main() {
  const allClasses = new Set();
  const perSource = {};

  for (const source of SOURCES) {
    console.error(`Buscando ${source.url} ...`);
    const css = await fetchText(source.url);
    const classes = extractClassSelectors(css);
    perSource[source.name] = classes.size;
    for (const c of classes) allClasses.add(c);
  }

  const sorted = Array.from(allClasses).sort();
  const groups = groupByPrefix(sorted);

  const index = {
    _meta: {
      version: VERSION,
      extractedAt: new Date().toISOString(),
      totalClasses: sorted.length,
      perSource,
      note: 'Extração por regex sobre CSS estático. Não cobre classes aplicadas via JS em runtime.',
    },
    groups,
  };

  const fs = await import('node:fs/promises');
  const path = await import('node:path');
  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, 'liquid-classes-index.json'), JSON.stringify(index, null, 2));

  const summaryLines = [
    `# Índice de classes Liquid (v${VERSION})`,
    '',
    `Total de classes extraídas: ${sorted.length}`,
    '',
    '| Grupo | Qtd. classes |',
    '|---|---|',
    ...Object.entries(groups)
      .sort((a, b) => b[1].length - a[1].length)
      .map(([group, list]) => `| ${group} | ${list.length} |`),
    '',
    'Para consultar classes de um grupo específico, use: `node scripts/query-liquid-classes.mjs <termo>`',
    'Não abra o `liquid-classes-index.json` inteiro no editor/contexto do Copilot — ele é grande por natureza (design system atômico). Consulte por termo.',
  ];
  await fs.writeFile(path.join(OUT_DIR, 'liquid-classes-summary.md'), summaryLines.join('\n'));

  console.error(`OK: ${sorted.length} classes em ${Object.keys(groups).length} grupos.`);
  console.error(`Gerado em ${OUT_DIR}/: liquid-classes-index.json (consulta) e liquid-classes-summary.md (visão geral, leve).`);
}

main().catch((err) => {
  console.error('Erro:', err.message);
  if (err.cause) {
    console.error('Causa raiz:', err.cause.code ?? err.cause.message ?? err.cause);
  }
  if (err.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || err.message.includes('CONNECT')) {
    console.error('');
    console.error('Falha relacionada a proxy/túnel CONNECT. Sanity check: curl -v <url> no mesmo terminal —');
    console.error('se curl funcionar mas o script não, confirme HTTP_PROXY/HTTPS_PROXY no ambiente onde o Node roda');
    console.error('(não só num terminal diferente) e se o proxy exige autenticação (usuário:senha na URL do proxy).');
  }
  process.exit(1);
});