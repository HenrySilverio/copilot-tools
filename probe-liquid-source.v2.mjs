#!/usr/bin/env node
// probe-liquid-source.v2.mjs
//
// CORREÇÃO da v1. Dois bugs na v1:
//   1. `package.json` estava classificado como TIER-0 — ele não carrega metadado
//      de componente nenhum. Virou TIER-3 (informativo).
//   2. O path pattern estava errado. A verdade veio do próprio
//      update-liquid-version.mjs de vocês:
//         <host>/dist/design-system-<version>/design-system.bundle.min.js
//      NÃO `<host>/dist/` nem `<host>/dist/liquid/`.
//      Todos os 404 da v1 foram eu batendo na porta errada.
//
// O alvo real é `html-custom-data.json` — o mesmo arquivo que o
// build-liquid-catalog.mjs de vocês já consome.
//
// Uso:
//   node probe-liquid-source.v2.mjs --version=3.2.0 --out=probe-v2.json

import { writeFile } from 'node:fs/promises';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const VERSION = args.version ?? '3.2.0';
const ORIGIN = args.origin ?? 'https://static.bradesco.com.br';
const DIST = `${ORIGIN}/dsysliquid/dist`;
const DS = `${DIST}/design-system-${VERSION}`;

/**
 * TIER-0 = contrato tipado/estruturado. É o que alimenta o IR.
 * TIER-1 = índice do Storybook (topologia, sem argTypes garantidos).
 * TIER-2 = DOM renderizado. Último recurso.
 * TIER-3 = informativo (oráculo de versão), NÃO serve como fonte de catálogo.
 */
const CANDIDATES = [
  // ── TIER 0 — o alvo real, no diretório correto ──
  { tier: 0, kind: 'vscode-html-custom-data', url: `${DS}/html-custom-data.json` },
  { tier: 0, kind: 'vscode-html-custom-data', url: `${DIST}/html-custom-data.json` },
  { tier: 0, kind: 'vscode-css-custom-data', url: `${DS}/css-custom-data.json` },
  { tier: 0, kind: 'custom-elements-manifest', url: `${DS}/custom-elements.json` },
  { tier: 0, kind: 'stencil-docs-json', url: `${DS}/docs.json` },
  { tier: 0, kind: 'types', url: `${DS}/index.d.ts` },
  { tier: 0, kind: 'native-federation-remote', url: `${DS}/remoteEntry.json` },
  { tier: 0, kind: 'ds-bundle', url: `${DS}/design-system.bundle.min.js` },
  { tier: 0, kind: 'ds-stylesheet', url: `${DS}/design-system.bundle.min.css` },
  { tier: 0, kind: 'ds-reset', url: `${DS}/reset.bundle.min.css` },
  { tier: 0, kind: 'ds-package', url: `${DS}/package.json` },

  // ── TIER 1 — índice do Storybook (já usado pelo scrapper.js) ──
  { tier: 1, kind: 'storybook-index-v7', url: `${DIST}/storybook-${VERSION}/index.json` },

  // ── TIER 3 — oráculo de versão. NÃO é catálogo. ──
  { tier: 3, kind: 'version-oracle', url: `${DIST}/package.json` },
];

async function probe({ tier, kind, url }) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-4095' } });
    const peek = res.ok ? (await res.text()).slice(0, 500) : null;
    return {
      tier, kind, url,
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type'),
      contentLength: res.headers.get('content-range') ?? res.headers.get('content-length'),
      lastModified: res.headers.get('last-modified'),
      ms: Date.now() - t0,
      peek,
    };
  } catch (err) {
    return { tier, kind, url, ok: false, error: String(err?.cause?.message ?? err.message), ms: Date.now() - t0 };
  }
}

const results = [];
for (const c of CANDIDATES) {
  const r = await probe(c);
  results.push(r);
  console.log(`${r.ok ? '✅' : '❌'} T${r.tier} ${String(r.status ?? r.error).padEnd(6)} ${r.kind.padEnd(26)} ${r.url}`);
}

// Só tiers 0..2 contam como fonte de catálogo. Tier 3 é ruído informativo.
const catalogHits = results.filter((r) => r.ok && r.tier <= 2);
const bestTier = catalogHits.length ? Math.min(...catalogHits.map((r) => r.tier)) : null;
const hcd = results.find((r) => r.ok && r.kind === 'vscode-html-custom-data');

const verdict = hcd
  ? `html-custom-data.json ESTÁ no CDN (${hcd.url}). build-liquid-catalog.mjs pode virar fetch-first. Apague o scrapper.js.`
  : bestTier === 0
    ? 'Outro artefato TIER-0 disponível. Sem scraper.'
    : bestTier === 1
      ? 'Só o índice do Storybook. html-custom-data.json fica operator-supplied (repo do Liquid / pipeline do time do DS).'
      : bestTier === 2
        ? 'Só DOM. Isole o scraper atrás de um adapter e trave o gate de erro.'
        : 'Nada acessível. Confirme o path pattern com o time do DS.';

console.log(`\n--- VEREDITO ---\n${verdict}\n`);

const report = { generatedAt: new Date().toISOString(), version: VERSION, origin: ORIGIN, bestTier, verdict, results };
if (args.out) {
  await writeFile(args.out, JSON.stringify(report, null, 2));
  console.log(`Relatório: ${args.out}`);
}
process.exit(bestTier === null ? 1 : 0);
