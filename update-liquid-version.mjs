#!/usr/bin/env node
// update-liquid-version.mjs — bump the canonical Liquid version + URLs.
//
// What this does:
//   - Updates `data/liquid-version.json::liquid.version`.
//   - Regenerates `scriptUrl`, `stylesheetUrl`, `componentStylesheetUrl`,
//     `cdnBase`, and the URLs
//     under `environments.{production,staging,development,intranet}` from
//     each environment's `host` + the canonical asset-path pattern
//     (`<host>/dist/design-system-<version>/{design-system.bundle.min.js,
//     reset.bundle.min.css,design-system.bundle.min.css}`) — verified upstream in
//     `<liquid-repo>/src/meta/brad-dsys.metadata.js` and
//     `<liquid-repo>/src/docs/introduction/brad-introduction-1.stories.docs.mdx`.
//   - Refuses to run unless `data/liquid-catalog/<X.Y.Z>.json` exists —
//     the catalog file must be dropped in by the operator BEFORE bumping
//     (the catalog ships with the Liquid release).
//   - Optional `--env <production|staging|development|intranet>` rewrites
//     the top-level default (`scriptUrl`/`stylesheetUrl`/
//     `componentStylesheetUrl`/`cdnHost`/`cdnBase`)
//     to the chosen environment. Default is `production`.
//
// What this does NOT do:
//   - Does NOT fetch anything from the network. Operator-driven.
//   - Does NOT regenerate the catalog. Operator drops in
//     `data/liquid-catalog/<X.Y.Z>.json` themselves.
//   - Does NOT change `defaultThemeClass` or `package`. Those are stable
//     across versions.
//
// Usage:
//   node <pluginRoot>/scripts/update-liquid-version.mjs --version 2.3.0
//   node <pluginRoot>/scripts/update-liquid-version.mjs --version 2.3.0 --env staging
//   node <pluginRoot>/scripts/update-liquid-version.mjs --dry-run --version 2.3.0

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const PLUGIN_ROOT = resolve(SCRIPT_DIR, '..');
const VALID_ENVS = ['production', 'staging', 'development', 'intranet'];

// ─── argv ──────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { version: null, env: 'production', dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--version') out.version = argv[++i];
    else if (a === '--env') out.env = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '-h' || a === '--help') { printHelp(); process.exit(0); }
    else { console.error(`unknown arg: ${a}`); printHelp(); process.exit(2); }
  }
  return out;
}

function printHelp() {
  console.log(`Usage: update-liquid-version.mjs --version <X.Y.Z> [--env <env>] [--dry-run]

  --version  Required. Liquid version (e.g., 2.3.0). Must be SemVer-shaped.
             A file at data/liquid-catalog/<X.Y.Z>.json must exist before
             running — the catalog is operator-supplied per release.

  --env      Optional. One of: production (default), staging, development,
             intranet. Sets the top-level default scriptUrl/stylesheetUrl/
             componentStylesheetUrl/cdnBase to that environment's URLs. The
             full environments map is always regenerated regardless.

  --dry-run  Print the rewritten file to stdout instead of writing it.

Sources: data/liquid-version.json (target file), with hosts read from
the existing environments[].host fields. Asset-path pattern is fixed:
<host>/dist/design-system-<version>/{design-system.bundle.min.js,reset.bundle.min.css,design-system.bundle.min.css}.`);
}

// ─── helpers ───────────────────────────────────────────────────────────────

function emit(payload) { console.log(JSON.stringify(payload)); }

function exitError(reason, details) {
  emit({ name: 'update-liquid-version', status: 'error', reason, details });
  process.exit(1);
}

function exitOk(payload) {
  emit({ name: 'update-liquid-version', status: 'ok', ...payload });
  process.exit(0);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function isSemverShape(v) {
  return typeof v === 'string' && /^\d+\.\d+\.\d+(-[A-Za-z0-9.-]+)?$/.test(v);
}

function buildAssetUrls(host, version) {
  // Strip trailing slash on host to keep concatenation deterministic.
  const h = host.replace(/\/+$/, '');
  return {
    host,
    scriptUrl: `${h}/dist/design-system-${version}/design-system.bundle.min.js`,
    stylesheetUrl: `${h}/dist/design-system-${version}/reset.bundle.min.css`,
    componentStylesheetUrl: `${h}/dist/design-system-${version}/design-system.bundle.min.css`,
  };
}

// ─── main ─────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv);

  if (!args.version) exitError('missing required --version', { usage: 'update-liquid-version.mjs --version <X.Y.Z>' });
  if (!isSemverShape(args.version)) exitError('version must be SemVer (X.Y.Z, optionally with -prerelease)', { got: args.version });
  if (!VALID_ENVS.includes(args.env)) exitError('invalid --env', { got: args.env, valid: VALID_ENVS });

  // §1 — verify the catalog file exists for the new version (operator-supplied).
  const catalogPath = join(PLUGIN_ROOT, 'data', 'liquid-catalog', `${args.version}.json`);
  if (!existsSync(catalogPath)) {
    exitError('catalog missing for new version — drop it in before bumping', {
      expected: posix.join('data', 'liquid-catalog', `${args.version}.json`),
      hint: `Catalog ships with each Liquid release. Get it from the upstream dsys-fed-liquid build artifacts (or html-custom-data.json) and place at data/liquid-catalog/${args.version}.json before re-running this script.`,
    });
  }

  // §2 — read current liquid-version.json.
  const targetPath = join(PLUGIN_ROOT, 'data', 'liquid-version.json');
  let current;
  try { current = readJson(targetPath); }
  catch (e) { exitError('failed to read data/liquid-version.json', { error: String(e) }); }

  const currentLiquid = current.liquid || {};
  const currentEnvs = currentLiquid.environments || {};

  // §3 — build the new environments map: keep each environment's `host` from
  // the current file (those are stable); regenerate runtime asset URLs from
  // host + version.
  const envsOut = {};
  for (const envName of VALID_ENVS) {
    const cur = currentEnvs[envName];
    if (!cur || typeof cur.host !== 'string') {
      exitError(`environments.${envName}.host missing in current liquid-version.json`, {
        envName, currentEnv: cur || null,
        hint: 'Each environment must declare host. Restore the current file from git or rebuild it from the canonical hosts in src/meta/brad-dsys.metadata.js (TRANSACTIONAL_HOSTS, INTRANET_HOSTS).',
      });
    }
    envsOut[envName] = buildAssetUrls(cur.host, args.version);
  }

  // §4 — top-level defaults from the chosen env.
  const def = envsOut[args.env];
  const liquidOut = {
    package: currentLiquid.package || 'dsys-fed-liquid',
    version: args.version,
    scriptUrl: def.scriptUrl,
    stylesheetUrl: def.stylesheetUrl,
    componentStylesheetUrl: def.componentStylesheetUrl,
    cdnHost: def.host.replace(/\/+$/, ''),
    cdnBase: `${def.host.replace(/\/+$/, '')}/dist/design-system-${args.version}`,
    defaultThemeClass: currentLiquid.defaultThemeClass || 'brad-theme-classic',
    environments: envsOut,
  };

  const out = {
    schemaVersion: current.schemaVersion || '1.0',
    _source: current._source || '',
    liquid: liquidOut,
  };

  const serialized = JSON.stringify(out, null, 2) + '\n';

  // §5 — dry-run vs write.
  if (args.dryRun) {
    process.stdout.write(serialized);
    process.exit(0);
  }

  writeFileSync(targetPath, serialized, 'utf8');

  exitOk({
    version: args.version,
    env: args.env,
    scriptUrl: liquidOut.scriptUrl,
    stylesheetUrl: liquidOut.stylesheetUrl,
    componentStylesheetUrl: liquidOut.componentStylesheetUrl,
    catalog: posix.join('data', 'liquid-catalog', `${args.version}.json`),
    target: posix.join('data', 'liquid-version.json'),
  });
}

main();
