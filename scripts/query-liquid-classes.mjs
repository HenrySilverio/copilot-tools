#!/usr/bin/env node
/**
 * Consulta pontual ao índice de classes Liquid — gerado por extract-liquid-classes.mjs.
 * Uso: node scripts/query-liquid-classes.mjs <termo> [--group] [--dir=<diretorio>]
 *
 * Objetivo: dar ao Copilot Chat/CLI uma forma de buscar classes SEM carregar
 * o liquid-classes-index.json inteiro no contexto. Só o resultado filtrado
 * é impresso no stdout — é isso que deve ser lido, não o arquivo fonte.
 *
 * Ex.:
 *   node scripts/query-liquid-classes.mjs btn --dir=../liquid-catalog  -> classes que contêm "btn"
 *   node scripts/query-liquid-classes.mjs card --group                -> só os grupos que contêm "card"
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';

const term = process.argv[2];
const groupOnly = process.argv.includes('--group');
const dirArg = process.argv.find((a) => a.startsWith('--dir='));
const DIR = dirArg ? dirArg.replace('--dir=', '') : '.';

if (!term) {
  console.error('Uso: node scripts/query-liquid-classes.mjs <termo> [--group] [--dir=<diretorio>]');
  process.exit(1);
}

async function main() {
  const raw = await readFile(path.join(DIR, 'liquid-classes-index.json'), 'utf-8');
  const index = JSON.parse(raw);
  const needle = term.toLowerCase();

  const matchedGroups = Object.keys(index.groups).filter((g) =>
    g.toLowerCase().includes(needle)
  );

  if (groupOnly) {
    console.log(matchedGroups.length ? matchedGroups.join('\n') : `(nenhum grupo contém "${term}")`);
    return;
  }

  let found = 0;
  for (const group of Object.keys(index.groups)) {
    const matches = index.groups[group].filter((c) => c.toLowerCase().includes(needle));
    if (matches.length) {
      console.log(`# ${group}`);
      for (const c of matches) console.log(`  .${c}`);
      found += matches.length;
    }
  }

  if (found === 0) {
    console.log(`(nenhuma classe encontrada contendo "${term}" — tente um termo mais curto ou rode --group)`);
  } else {
    console.error(`\n${found} classe(s) encontrada(s).`);
  }
}

main().catch((err) => {
  console.error('Erro:', err.message);
  console.error('Rode extract-liquid-classes.mjs primeiro para gerar liquid-classes-index.json.');
  process.exit(1);
});