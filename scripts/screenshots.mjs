/**
 * screenshots.mjs — PART C.2
 * ─────────────────────────────────────────────────────────────────────────────
 * Serves ./dist, then captures t = 0, 0.1 … 1.0 at 1440×900 and 390×844 using a
 * headless Chromium with software WebGL (SwiftShader), and reports every console
 * message / page error so "the console must be clean" can be checked.
 *
 * Run:  node scripts/screenshots.mjs
 * Out:  screenshots/desktop-t0.5.png, screenshots/mobile-t0.5.png …
 * ─────────────────────────────────────────────────────────────────────────────
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'screenshots');
const PORT = 4173;

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.glb': 'model/gltf-binary', '.json': 'application/json',
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

const TS = process.env.SHOT_TS
  ? process.env.SHOT_TS.split(',').map(Number)
  : [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 },
];

const messages = [];
let failures = 0;

async function main() {
  if (!fs.existsSync(DIST)) {
    console.error('dist/ not found — run `npm run build` first.');
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const { chromium } = await import('playwright');
  const server = await serve();

  const browser = await chromium.launch({
    args: [
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--use-gl=angle',
      '--ignore-gpu-blocklist',
      '--no-sandbox',
    ],
  });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    // index.html requests Google Fonts; there is no outbound network here, so
    // satisfy the CSS request locally rather than letting it fail and pollute
    // the console with a net::ERR_FAILED.
    await context.route('**/*', route => {
      const u = route.request().url();
      if (u.startsWith(`http://localhost:${PORT}`)) { route.continue(); return; }
      if (u.includes('fonts.googleapis.com')) {
        route.fulfill({ status: 200, contentType: 'text/css', body: '' });
        return;
      }
      if (u.includes('fonts.gstatic.com')) {
        route.fulfill({ status: 200, contentType: 'font/woff2', body: '' });
        return;
      }
      route.abort();
    });
    page.on('console', m => {
      messages.push({ vp: vp.name, type: m.type(), text: m.text() });
      if (m.type() === 'error') failures++;
    });
    page.on('pageerror', e => {
      messages.push({ vp: vp.name, type: 'pageerror', text: e.stack || String(e) });
      failures++;
    });

    // One navigation per viewport, then jump progress in-page. Creating and
    // destroying a WebGL context per shot is what made this time out.
    await page.goto(`http://localhost:${PORT}/?t=0`, {
      waitUntil: 'domcontentloaded', timeout: 90000,
    });
    await page.waitForFunction(() => !!document.querySelector('canvas'), null, { timeout: 90000 });
    await page.waitForFunction(
      () => !!(window).__gallery,
      null, { timeout: 90000 },
    );
    await page.waitForTimeout(6000);   // let the idle texture job finish

    const hasGl = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      if (!c) return false;
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    });
    if (!hasGl) { console.error(`NO WEBGL for ${vp.name}`); failures++; }

    const texIds = await page.evaluate(() => (window).__gallery.textures());
    console.log(`[${vp.name}] artwork canvases built: ${JSON.stringify(texIds)}`);

    for (const t of TS) {
      await page.evaluate(v => (window).__gallery.setT(v), t);
      await page.waitForTimeout(2500);
      const file = path.join(OUT, `${vp.name}-t${t.toFixed(1)}.png`);
      try {
        const data = await cdp.send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(file, Buffer.from(data.data, 'base64'));
        console.log(`captured ${path.relative(ROOT, file)}  ${vp.width}x${vp.height}  gl=${hasGl}  t=${t}`);
      } catch (e) {
        failures++;
        console.error(`screenshot FAILED ${vp.name} t=${t}: ${e.message}`);
      }
    }
    await context.close();
  }

  await browser.close();
  server.close();

  console.log('\n=== CONSOLE OUTPUT ===');
  if (messages.length === 0) console.log('(empty — clean console)');
  for (const m of messages) console.log(`[${m.vp}] ${m.type}: ${m.text}`);

  console.log(`\n=== ${failures === 0 ? 'CONSOLE CLEAN' : failures + ' CONSOLE ISSUE(S)'} ===`);
  if (failures) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exit(1); });
