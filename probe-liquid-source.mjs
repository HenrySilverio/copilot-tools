#!/usr/bin/env node
// probe-liquid-source.mjs
// Objetivo: descobrir QUAL camada de extração está disponível no CDN do Liquid
// ANTES de escrever qualquer scraper. Não gera catálogo, não renderiza nada.
// Uso:
//   node probe-liquid-source.mjs --version=3.1.0
//   node probe-liquid-source.mjs --version=3.1.0 --out=probe-report.json
//
// Proxy corporativo: exporte HTTPS_PROXY/HTTP_PROXY. Node >=18 NÃO honra
// proxy env no fetch nativo — este script usa undici ProxyAgent se disponível.

import { writeFile } from 'node:fs/promises';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const VERSION = args.version ?? '3.1.0';
const ORIGIN = args.origin ?? 'https://static.bradesco.com.br';
const DIST = `${ORIGIN}/dsysliquid/dist`;
const SB = `${DIST}/storybook-${VERSION}`;

let dispatcher;
const proxy = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY;
if (proxy) {
  try {
    const { ProxyAgent } = await import('undici');
    dispatcher = new ProxyAgent(proxy);
  } catch {
    console.warn(`[warn] HTTPS_PROXY definido mas 'undici' indisponível: ${proxy}`);
  }
}

/**
 * Tiers em ordem de preferência arquitetural.
 * TIER-0 = artefato de build tipado (contrato real, determinístico, sem browser)
 * TIER-1 = índice estático do Storybook (sem browser, mas contrato instável)
 * TIER-2 = DOM renderizado (browser obrigatório, contrato frágil) -> último recurso
 */
const CANDIDATES = [
  // ---- TIER 0: artefatos de build (Stencil / Custom Elements Manifest) ----
  { tier: 0, kind: 'stencil-docs-json', url: `${DIST}/docs.json` },
  { tier: 0, kind: 'stencil-docs-json', url: `${SB}/docs.json` },
  { tier: 0, kind: 'custom-elements-manifest', url: `${DIST}/custom-elements.json` },
  { tier: 0, kind: 'custom-elements-manifest', url: `${DIST}/liquid/custom-elements.json` },
  { tier: 0, kind: 'stencil-types', url: `${DIST}/components.d.ts` },
  { tier: 0, kind: 'stencil-types', url: `${DIST}/liquid/components.d.ts` },
  { tier: 0, kind: 'stencil-collection', url: `${DIST}/collection/collection-manifest.json` },
  { tier: 0, kind: 'package-manifest', url: `${DIST}/package.json` },
  { tier: 0, kind: 'stencil-loader', url: `${DIST}/liquid/liquid.esm.js` },

  // ---- TIER 1: índice estático do Storybook ----
  { tier: 1, kind: 'storybook-index-v7', url: `${SB}/index.json` },
  { tier: 1, kind: 'storybook-index-v6', url: `${SB}/stories.json` },
  { tier: 1, kind: 'storybook-project', url: `${SB}/project.json` },
  { tier: 1, kind: 'storybook-metadata', url: `${SB}/metadata.json` },

  // ---- TIER 2: shell renderizável (prova que só browser resolve) ----
  { tier: 2, kind: 'storybook-shell', url: `${SB}/iframe.html` },
  { tier: 2, kind: 'storybook-shell', url: `${SB}/index.html` },
];

async function probe({ tier, kind, url }) {
  const t0 = Date.now();
  try {
    // HEAD primeiro (barato). Muitos CDNs respondem 405 -> cai pro GET ranged.
    let res = await fetch(url, { method: 'HEAD', dispatcher, redirect: 'follow' });
    let bodyPeek = null;

    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: 'GET', dispatcher, headers: { Range: 'bytes=0-2047' } });
    }

    if (res.ok) {
      const g = await fetch(url, { method: 'GET', dispatcher, headers: { Range: 'bytes=0-2047' } });
      bodyPeek = (await g.text()).slice(0, 400);
    }

    return {
      tier,
      kind,
      url,
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type'),
      contentLength: res.headers.get('content-length'),
      etag: res.headers.get('etag'),
      lastModified: res.headers.get('last-modified'),
      ms: Date.now() - t0,
      peek: bodyPeek,
    };
  } catch (err) {
    return { tier, kind, url, ok: false, error: String(err?.cause?.message ?? err.message), ms: Date.now() - t0 };
  }
}

const results = [];
for (const c of CANDIDATES) {
  const r = await probe(c);
  results.push(r);
  const mark = r.ok ? '✅' : '❌';
  console.log(`${mark} T${r.tier} ${String(r.status ?? r.error).padEnd(6)} ${r.kind.padEnd(26)} ${r.url}`);
}

const hits = results.filter((r) => r.ok);
const bestTier = hits.length ? Math.min(...hits.map((r) => r.tier)) : null;

const verdict =
  bestTier === 0
    ? 'TIER-0 disponível: NÃO escreva scraper. Baixe o artefato, gere o IR a partir dele.'
    : bestTier === 1
      ? 'TIER-1 disponível: índice do Storybook resolve a topologia. Scraper só p/ argTypes ausentes.'
      : bestTier === 2
        ? 'Só TIER-2: scraping com browser headless é inevitável. Isole atrás de um adapter.'
        : 'Nada acessível deste host/rede. Rode de dentro da rede corporativa ou configure HTTPS_PROXY.';

console.log(`\n--- VEREDITO ---\n${verdict}\n`);

const report = { generatedAt: new Date().toISOString(), version: VERSION, origin: ORIGIN, bestTier, verdict, results };

if (args.out) {
  await writeFile(args.out, JSON.stringify(report, null, 2));
  console.log(`Relatório: ${args.out}`);
}

process.exit(bestTier === null ? 1 : 0);
