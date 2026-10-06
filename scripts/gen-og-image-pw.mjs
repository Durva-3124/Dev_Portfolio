/**
 * scripts/gen-og-image-pw.mjs
 * Uses Playwright's headless Chromium to render the og-image SVG at exactly
 * 1200×630 and save it as public/og-image.png.
 */
import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = path.join(ROOT, 'public', 'og-image.png');

const HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{width:1200px;height:630px;overflow:hidden;background:#0d0709;
  font-family:"Helvetica Neue",Arial,sans-serif;}
.wrap{position:relative;width:1200px;height:630px;background:#0d0709;}
.vignette{position:absolute;inset:0;
  background:radial-gradient(ellipse at 50% 50%,rgba(114,0,29,0) 20%,rgba(114,0,29,0.45) 100%);}
.dp{position:absolute;top:56px;left:72px;
  font-size:22px;font-weight:300;letter-spacing:0.22em;
  color:rgba(238,233,223,0.55);text-transform:uppercase;}
.rule{position:absolute;top:284px;left:72px;width:180px;height:2px;background:#B08F52;}
.name{position:absolute;top:200px;left:68px;
  font-size:88px;font-weight:100;color:#EEE9DF;letter-spacing:-0.01em;
  white-space:nowrap;}
.roles{position:absolute;top:330px;left:72px;
  font-size:22px;font-weight:400;color:#B08F52;letter-spacing:0.06em;
  text-transform:uppercase;}
.url{position:absolute;bottom:44px;right:72px;
  font-size:16px;font-weight:300;color:rgba(238,233,223,0.30);letter-spacing:0.08em;}
</style>
</head>
<body>
<div class="wrap">
  <div class="vignette"></div>
  <div class="dp">DP</div>
  <div class="name">DURVA PAWAR</div>
  <div class="rule"></div>
  <div class="roles">Full-Stack Engineer &nbsp;·&nbsp; AI/ML Engineer &nbsp;·&nbsp; Backend Developer</div>
  <div class="url">durvapawar.dev</div>
</div>
</body>
</html>`;

const { chromium } = await import('playwright');
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(HTML, { waitUntil: 'domcontentloaded' });
await page.screenshot({ path: OUT, type: 'png' });
await browser.close();

const size = fs.statSync(OUT).size;
console.log(`og-image.png written: ${OUT} (${size} bytes, 1200x630)`);
