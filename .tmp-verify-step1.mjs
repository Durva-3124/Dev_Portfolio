/**
 * .tmp-verify-step1.mjs — TEMPORARY Step-1 acceptance measurement harness.
 * Deleted before commit; exists only to produce real numbers.
 * Measures: F-06 (full description), F-09 (no invented "Present"),
 *           overlay GitHub link presence, console cleanliness.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { experience } from './src/data/portfolio.ts';

const ROOT = path.resolve('.');
const DIST = path.join(ROOT, 'dist');
const PORT = 4181;
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json',
};

function serve() {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || '/').split('?')[0]);
      let file = path.join(DIST, url === '/' ? 'index.html' : url);
      if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(DIST, 'index.html');
      res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(PORT, () => resolve(server));
  });
}

let failures = 0;
const check = (name, pass, detail) => {
  if (!pass) failures++;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`);
};

async function main() {
  const { chromium } = await import('playwright');
  const server = await serve();
  const browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=angle',
           '--ignore-gpu-blocklist', '--no-sandbox'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await context.route('**/*', route => {
    const u = route.request().url();
    if (u.startsWith(`http://localhost:${PORT}`)) { route.continue(); return; }
    if (u.includes('fonts.googleapis.com')) { route.fulfill({ status: 200, contentType: 'text/css', body: '' }); return; }
    if (u.includes('fonts.gstatic.com')) { route.fulfill({ status: 200, contentType: 'font/woff2', body: '' }); return; }
    route.abort();
  });
  const consoleMsgs = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(`${m.type()}: ${m.text()}`); });
  page.on('pageerror', e => consoleMsgs.push(`pageerror: ${e.stack || String(e)}`));

  await page.goto(`http://localhost:${PORT}/?t=0.76`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => !!(window).__gallery, null, { timeout: 90000 });
  await page.waitForTimeout(5000);

  // ── F-06: full description present, no 120-char truncation ────────────────
  const dom = await page.evaluate(() => document.body.textContent || '');
  console.log('\n=== F-06 Experience description ===');
  for (const e of experience) {
    check(`"${e.role}" description rendered in full`,
      dom.includes(e.description),
      `data=${e.description.length} chars, present=${dom.includes(e.description)}`);
  }
  const prefix120 = experience[0].description.slice(0, 120);
  check('120-char truncated prefix is NOT the rendered whole', !(dom.includes(prefix120) && !dom.includes(experience[0].description)),
    `prefix120 present=${dom.includes(prefix120)}`);
  check('no truncation ellipsis "…" anywhere in the DOM', !dom.includes('…'));

  // ── F-09: blank period renders nothing (no invented "Present") ────────────
  console.log('\n=== F-09 invented "Present" ===');
  const blank = experience.filter(e => !e.period).map(e => e.role);
  for (const role of blank) {
    const panelText = await page.evaluate((r) => {
      const els = [...document.querySelectorAll('div')]
        .filter(d => (d.textContent || '').includes(r))
        .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
      const roleEl = els[0];
      const panel = roleEl && roleEl.closest('div[style*="border-left"]');
      return panel ? panel.textContent : (roleEl ? roleEl.parentElement.textContent : '');
    }, role);
    check(`"${role}" (period='') shows no "Present"`, !/Present/i.test(panelText),
      `panel text starts: ${JSON.stringify((panelText || '').slice(0, 70))}`);
  }

  // ── Overlay: GitHub link must be hidden (no per-project repo field) ───────
  console.log('\n=== Overlay GitHub link ===');
  await page.evaluate(() => (window).__gallery.setT(0.5));
  await page.waitForTimeout(2500);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(1500);
  const overlay = await page.evaluate(() => {
    const el = document.querySelector('.project-overlay');
    return el ? el.textContent : null;
  });
  check('overlay opened by clicking the framed artwork', overlay !== null,
    overlay === null ? 'no .project-overlay in DOM' : `${overlay.length} chars`);
  if (overlay) {
    check('overlay contains NO GitHub link text', !/GitHub/i.test(overlay));
    check('overlay still offers the mailto contact affordance', /Ask me about it/i.test(overlay));
    const ghLinks = await page.evaluate(() =>
      [...document.querySelectorAll('.project-overlay a')].map(a => a.getAttribute('href')));
    check('no overlay anchor points at the GitHub profile root',
      !ghLinks.some(h => h && /github\.com\/Durva-3124/i.test(h)),
      `anchors: ${JSON.stringify(ghLinks)}`);
  }

  await browser.close();
  server.close();

  console.log('\n=== CONSOLE (errors/warnings) ===');
  console.log(consoleMsgs.length === 0 ? '(clean)' : consoleMsgs.join('\n'));
  console.log(`\n=== STEP 1: ${failures === 0 ? 'ALL CHECKS PASS' : failures + ' FAILURE(S)'} ===`);
  if (failures || consoleMsgs.length) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exit(1); });