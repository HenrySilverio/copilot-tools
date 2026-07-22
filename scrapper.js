'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const STORYBOOK_VERSION = process.argv[2];
if (!STORYBOOK_VERSION || !/^\d+\.\d+\.\d+$/.test(STORYBOOK_VERSION)) {
  console.error('Uso: node webscrape-storybook.js <versão>');
  console.error('Exemplo: node webscrape-storybook.js 2.2.0');
  process.exit(1);
}
const BASE_URL = `https://static.bradesco.com.br/dsysliquid/dist/storybook-${STORYBOOK_VERSION}`;
const INDEX_URL = `${BASE_URL}/index.json`;
const FINAL_DIR = path.join(__dirname, '..', 'design-system');
const STAGING_ROOT = path.join(__dirname, '__ds_tmp__');
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE || '10', 10);
const TIMEOUT_MS = parseInt(process.env.TIMEOUT_MS || '45000', 10);

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizeLabel(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function sanitizePathSegment(value) {
  return normalizeLabel(value)
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[ .]+$/, '')
    .trim();
}

function splitTitleSegments(value) {
  return String(value || '')
    .split('/')
    .map(part => sanitizePathSegment(part))
    .filter(Boolean);
}

function getOutputRelativePath(entry) {
  const titleSegments = splitTitleSegments(entry.title || entry.id);
  const docName = sanitizePathSegment(entry.name);
  const pathSegments = titleSegments.slice();

  if (docName && !/^docs$/i.test(docName)) {
    pathSegments.push(docName);
  }

  if (pathSegments.length === 0) {
    pathSegments.push(sanitizePathSegment(entry.id) || 'doc');
  }

  const fileName = `${pathSegments[pathSegments.length - 1]}.md`;
  if (pathSegments.length === 1) {
    return fileName;
  }

  return path.join(...pathSegments.slice(0, -1), fileName);
}

function getComponentName(entry) {
  const titleSegments = splitTitleSegments(entry.title || entry.id);

  if (titleSegments[0] === 'DesignSystem' && titleSegments[1]) {
    return titleSegments[2] || titleSegments[1];
  }

  return titleSegments[1] || titleSegments[0] || sanitizePathSegment(entry.name) || sanitizePathSegment(entry.id);
}

function printProgress(done, total, errors) {
  const pct = ((done / total) * 100).toFixed(1);
  const bar = '█'.repeat(Math.round(done / total * 30)).padEnd(30, '░');
  process.stdout.write(`\r[${bar}] ${pct}% (${done}/${total}) errors: ${errors}   `);
}

function swapStagingToFinal(stagingDir, finalDir) {
  // 1. Remove old final dir entirely
  if (fs.existsSync(finalDir)) {
    fs.rmSync(finalDir, { recursive: true, force: true });
  }
  // 2. Rename staging dir to final dir (atomic on same volume)
  fs.renameSync(stagingDir, finalDir);
  // 3. Clean up staging root
  fs.rmSync(STAGING_ROOT, { recursive: true, force: true });
}

async function extractDocsEntry(browser, entry, baseUrl = BASE_URL) {
  const url = `${baseUrl}/iframe.html?id=${encodeURIComponent(entry.id)}&viewMode=docs`;
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();
  page.on('console', () => {});
  page.on('pageerror', () => {});

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    await page
      .waitForSelector('.sbdocs-wrapper, #docs-root, [class*="docsWrapper"]', { timeout: 25000 })
      .catch(() => {});
    await page.waitForTimeout(2000);

    // Extra wait for pages with dynamically-loaded web components (e.g. brad-release-notes)
    await page.waitForFunction(
      () => {
        const el = document.querySelector('.brad-releases-notes_versions .versions, .brad-release-notes main');
        return !el || el.children.length > 0;
      },
      { timeout: 8000 }
    ).catch(() => {});

    // Phase 1: click Show code buttons, remove noise, convert tables.
    await page.evaluate(() => {
      document.querySelectorAll('button').forEach(btn => {
        if (/show code/i.test(btn.innerText)) btn.click();
      });
      document.querySelectorAll('.docs-story').forEach(el => el.remove());
      document.querySelectorAll('a[target="_self"]').forEach(a => a.remove());
      document.querySelectorAll('table').forEach(table => {
        const escape = s => s.replace(/\|/g, '\\|').replace(/\n/g, ' ').trim();
        const headerCells = Array.from(table.querySelectorAll('thead th, thead td'));
        const headers = headerCells.map(th => escape(th.innerText));
        const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr =>
          Array.from(tr.querySelectorAll('td, th')).map(td => escape(td.innerText))
        ).filter(r => r.some(c => c));
        let mdLines = [];
        if (headers.length > 0) {
          mdLines.push('| ' + headers.join(' | ') + ' |');
          mdLines.push('| ' + headers.map(() => '---').join(' | ') + ' |');
        } else if (rows.length > 0) {
          const firstRow = rows.shift();
          mdLines.push('| ' + firstRow.join(' | ') + ' |');
          mdLines.push('| ' + firstRow.map(() => '---').join(' | ') + ' |');
        }
        rows.forEach(row => {
          const cols = Math.max(headers.length, row.length);
          const padded = Array.from({ length: cols }, (_, i) => row[i] || '');
          mdLines.push('| ' + padded.join(' | ') + ' |');
        });
        const pre = document.createElement('pre');
        pre.dataset.mdTable = 'true';
        pre.textContent = '\n' + mdLines.join('\n') + '\n';
        table.replaceWith(pre);
      });
    });

    await page.waitForTimeout(2000);

    // Phase 2: wrap all <pre> code blocks with ``` fences.
    await page.evaluate(() => {
      document.querySelectorAll('pre:not([data-md-table])').forEach(pre => {
        const code = pre.innerText.trim();
        if (!code) return;
        const wrapper = document.createElement('div');
        const fence1 = document.createElement('div');
        fence1.textContent = '```';
        const codePre = document.createElement('pre');
        codePre.textContent = code;
        const fence2 = document.createElement('div');
        fence2.textContent = '```';
        wrapper.appendChild(fence1);
        wrapper.appendChild(codePre);
        wrapper.appendChild(fence2);
        pre.replaceWith(wrapper);
      });
    });
    await page.waitForTimeout(500);

    const rawText = await page.evaluate(() => {
      const container =
        document.querySelector('.sbdocs-wrapper') ||
        document.querySelector('#docs-root') ||
        document.querySelector('[class*="docsWrapper"]') ||
        document.body;
      return container.innerText.trim();
    });

    // Convert plain text to markdown
    const lines = rawText.split('\n');
    const mdLines = [];
    let inFence = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed === '```') { inFence = !inFence; mdLines.push('```'); continue; }
      if (inFence) { mdLines.push(line); continue; }
      if (!trimmed) { mdLines.push(''); continue; }
      if (/^(copy|hide code|show code)$/i.test(trimmed)) continue;
      const prev = (lines[i - 1] || '').trim();
      const next = (lines[i + 1] || '').trim();
      const isHeading = trimmed.length < 60 &&
        !trimmed.startsWith('|') &&
        !trimmed.endsWith('.') &&
        !trimmed.endsWith(',') &&
        !trimmed.includes('\\|') &&
        (!prev || !next);
      if (isHeading) {
        const level = (i === 0 || !prev) && trimmed.length < 30 ? '#' : '##';
        mdLines.push(`${level} ${trimmed}`);
      } else {
        mdLines.push(line);
      }
    }
    if (inFence) mdLines.push('```');

    return mdLines.join('\n');
  } catch (err) {
    return null;
  } finally {
    await context.close();
  }
}

async function main() {
  const stagingDir = path.join(STAGING_ROOT, `versao-${STORYBOOK_VERSION}`);

  console.log('--------------------------------------------------');
  console.log(` Storybook -> Markdown - Bradesco Design System ${STORYBOOK_VERSION}`);
  console.log('--------------------------------------------------');
  console.log(`Target  : ${BASE_URL}`);
  console.log(`Output  : ${FINAL_DIR}`);
  console.log(`Staging : ${stagingDir}`);
  console.log('--------------------------------------------------');
  console.log(`Batch   : ${BATCH_SIZE} parallel pages`);
  console.log('');

  const CHROME_PATHS = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.CHROME_PATH,
  ].filter(Boolean);
  const systemChrome = CHROME_PATHS.find(p => fs.existsSync(p));
  if (systemChrome) console.log(`Using system Chrome: ${systemChrome}\n`);

  const browser = await chromium.launch({
    headless: true,
    executablePath: systemChrome || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  // Fetch index.json via browser to bypass bot protection
  console.log('Fetching index.json...');
  const bootstrapCtx = await browser.newContext({ locale: 'pt-BR' });
  const bootstrapPage = await bootstrapCtx.newPage();
  await bootstrapPage.goto(BASE_URL + '/', { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
  const indexRaw = await bootstrapPage.evaluate(async (url) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }, INDEX_URL);
  await bootstrapPage.close();
  await bootstrapCtx.close();

  const index = JSON.parse(indexRaw);

  // Keep only docs entries, skip any whose id ends with --default
  const docsEntries = Object.values(index.entries).filter(
    e => e.type === 'docs' && !e.id.endsWith('--default')
  );

  console.log(`Found ${docsEntries.length} docs entries to process.\n`);

  fs.mkdirSync(stagingDir, { recursive: true });
  fs.mkdirSync(FINAL_DIR, { recursive: true });

  let done = 0;
  let errors = 0;
  const componentNames = new Set();

  for (let i = 0; i < docsEntries.length; i += BATCH_SIZE) {
    const batch = docsEntries.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(batch.map(async entry => {
      const markdown = await extractDocsEntry(browser, entry, BASE_URL);
      return { entry, markdown };
    }));

    for (const { entry, markdown } of results) {
      done++;
      if (!markdown) {
        errors++;
        process.stdout.write(`\n ❌ ${entry.id}\n`);
        continue;
      }
      const filePath = path.join(stagingDir, getOutputRelativePath(entry));
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, markdown, 'utf8');
      componentNames.add(getComponentName(entry));
    }

    printProgress(done, docsEntries.length, errors);
  }

  // Save listComponents.md and scrape_version.md in staging
  const listContent = [...componentNames].sort().join('\n') + '\n';
  fs.writeFileSync(path.join(stagingDir, "listComponents.md"), listContent, 'utf8');
  fs.writeFileSync(path.join(stagingDir, "scrape_version.md"), `Versão local: ${STORYBOOK_VERSION}\n`, 'utf8');

  // Swap staging -> final
  console.log('\n\nMovendo arquivos para a pasta final...');
  swapStagingToFinal(stagingDir, FINAL_DIR);

  await browser.close();

  console.log('\n--------------------------------------------------');
  console.log(' Done!');
  console.log(` ✅ Saved   : ${(done - errors)} markdown files`);
  console.log(` ❌ Errors  : ${errors}`);
  console.log(` Output dir : ${FINAL_DIR}`);
  console.log('--------------------------------------------------\n');
}

main().catch(err => {
  console.error('\nFatal error:', err.message || err);
  process.exit(1);
});