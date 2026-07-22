#!/usr/bin/env node
// build-liquid-catalog.mjs — regenerate `liquid-migrator/data/liquid-catalog/<version>.json`
// from the canonical IDE custom-data file shipped with dsys-fed-liquid.
//
// What this does:
//   - Reads `<liquid-repo>/html-custom-data.json` (the canonical web-component
//     surface — every `brad-*` tag with its attributes, used by IDEs for
//     autocomplete; richer than any hand-derived catalog).
//   - Maps each tag into a `{name, tag, kind:'web-component', props}` entry
//     per `liquid-migrator/schemas/liquid-catalog.schema.json`.
//   - Reads the EXISTING catalog at `data/liquid-catalog/<version>.json`,
//     PRESERVES every entry whose `kind !== 'web-component'` (services,
//     component-parts, css-utility, primitives — html-custom-data doesn't
//     describe these), and replaces all `kind: 'web-component'` entries
//     with the freshly-built ones.
//   - Sorts the resulting components alphabetically by `name` for diff
//     stability.
//   - Writes back, or prints to stdout under `--dry-run`.
//
// Why this script lives in `scripts-dev/` (not `scripts/`):
//   It's plugin-development tooling. The runtime pipeline doesn't use it.
//   It runs once per Liquid version bump, alongside the `--version` flag
//   on `scripts/update-liquid-version.mjs`.
//
// Usage:
//   node scripts-dev/build-liquid-catalog.mjs --html-custom-data <path>
//   node scripts-dev/build-liquid-catalog.mjs --html-custom-data <path> --version 2.3.0
//   node scripts-dev/build-liquid-catalog.mjs --html-custom-data <path> --dry-run

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = resolve(SCRIPT_DIR, '..');
const PLUGIN_ROOT = resolve(WORKSPACE_ROOT, 'liquid-migrator');

// ─── argv ──────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = { htmlCustomData: null, version: null, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--html-custom-data') out.htmlCustomData = argv[++i];
    else if (a === '--version') out.version = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '-h' || a === '--help') { printHelp(); process.exit(0); }
    else { console.error(`unknown arg: ${a}`); printHelp(); process.exit(2); }
  }
  return out;
}

function printHelp() {
  console.log(`Usage: build-liquid-catalog.mjs --html-custom-data <path> [--version <X.Y.Z>] [--dry-run]

  --html-custom-data  Required. Path to <liquid-repo>/html-custom-data.json
                      (the canonical IDE custom-data file shipped with
                      dsys-fed-liquid; every brad-* tag with attributes).

  --version           Optional. Catalog version to write. Defaults to
                      data/liquid-version.json::liquid.version.

  --dry-run           Print the rebuilt catalog to stdout instead of
                      overwriting data/liquid-catalog/<version>.json.

This script preserves entries with kind != 'web-component' (services,
component-parts, etc.) from the existing catalog, and replaces only the
web-component entries with fresh data from html-custom-data.json.`);
}

// ─── helpers ───────────────────────────────────────────────────────────────

function readJson(path) { return JSON.parse(readFileSync(path, 'utf8')); }

function exitErr(msg, details) {
  console.error(JSON.stringify({ name: 'build-liquid-catalog', status: 'error', reason: msg, details }, null, 2));
  process.exit(1);
}

// brad-accordion-content → BradAccordionContent
function tagToPascalName(tag) {
  return tag.split('-').filter(Boolean).map(p => p[0].toUpperCase() + p.slice(1)).join('');
}

// ─── main ─────────────────────────────────────────────────────────────────

function main() {
  const args = parseArgs(process.argv);

  if (!args.htmlCustomData) {
    exitErr('missing required --html-custom-data', { hint: 'Pass the path to <liquid-repo>/html-custom-data.json' });
  }
  if (!existsSync(args.htmlCustomData)) {
    exitErr('html-custom-data file not found', { path: args.htmlCustomData });
  }

  // §1 — resolve target version.
  const liquidVersionPath = join(PLUGIN_ROOT, 'data', 'liquid-version.json');
  let liquidVersion;
  try { liquidVersion = readJson(liquidVersionPath); }
  catch (e) { exitErr('failed to read data/liquid-version.json', { error: String(e) }); }
  const version = args.version || (liquidVersion.liquid && liquidVersion.liquid.version);
  if (!version) {
    exitErr('no version (use --version or set data/liquid-version.json::liquid.version)', {});
  }

  // §2 — read html-custom-data.
  let hcd;
  try { hcd = readJson(args.htmlCustomData); }
  catch (e) { exitErr('failed to parse html-custom-data', { error: String(e), path: args.htmlCustomData }); }
  const tags = Array.isArray(hcd.tags) ? hcd.tags : [];
  if (tags.length === 0) {
    exitErr('html-custom-data has no tags[] — wrong file?', { path: args.htmlCustomData });
  }

  // §3 — read existing catalog (for preservation of non-web-component kinds).
  const catalogPath = join(PLUGIN_ROOT, 'data', 'liquid-catalog', `${version}.json`);
  let existing = null;
  if (existsSync(catalogPath)) {
    try { existing = readJson(catalogPath); }
    catch (e) { exitErr('failed to read existing catalog (corrupt?)', { error: String(e), path: catalogPath }); }
  }
  const preserved = (existing && Array.isArray(existing.components))
    ? existing.components.filter(c => c.kind && c.kind !== 'web-component')
    : [];

  // §4 — build web-component entries from html-custom-data.
  // For each tag: name = PascalCase, tag preserved, props = attributes[].name (deduped, sorted).
  const seen = new Set();
  const webComponents = [];
  for (const t of tags) {
    if (!t || typeof t.name !== 'string' || !/^brad-[a-z0-9-]+$/.test(t.name)) continue;
    if (seen.has(t.name)) continue;
    seen.add(t.name);
    const props = Array.from(new Set(
      (Array.isArray(t.attributes) ? t.attributes : [])
        .map(a => (a && typeof a.name === 'string') ? a.name : null)
        .filter(Boolean)
    )).sort();
    webComponents.push({
      name: tagToPascalName(t.name),
      tag: t.name,
      kind: 'web-component',
      props,
      events: [],
      slots: [],
      classes: [],
      tokens: [],
      formAssociated: false,
      riskFlags: [],
    });
  }

  // §5 — assemble + sort by name for diff stability.
  const components = [...webComponents, ...preserved]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const out = {
    schemaVersion: '1.0.0',
    packageName: 'dsys-fed-liquid',
    version,
    components,
  };

  // Validate against schema constraints inline (no ajv-cli runtime dep).
  const tagPattern = /^brad-[a-z0-9-]+$/;
  const validKinds = new Set(['web-component', 'service-driven', 'component-part', 'primitive', 'scss', 'css-utility', 'css-pattern', 'icon', 'enum']);
  for (const c of components) {
    if (typeof c.name !== 'string' || !c.name) exitErr('component missing name', { component: c });
    if (!validKinds.has(c.kind)) exitErr('invalid kind', { name: c.name, kind: c.kind });
    if (c.tag && !tagPattern.test(c.tag)) exitErr('invalid tag pattern', { name: c.name, tag: c.tag });
  }

  const serialized = JSON.stringify(out, null, 2) + '\n';

  if (args.dryRun) {
    process.stdout.write(serialized);
    process.exit(0);
  }

  writeFileSync(catalogPath, serialized, 'utf8');

  console.log(JSON.stringify({
    name: 'build-liquid-catalog',
    status: 'ok',
    target: posix.join('liquid-migrator', 'data', 'liquid-catalog', `${version}.json`),
    version,
    counts: {
      total: components.length,
      webComponents: webComponents.length,
      preservedNonWebComponent: preserved.length,
      tagsInSource: tags.length,
    },
    sourceHtmlCustomData: args.htmlCustomData,
  }, null, 2));
}

main();
