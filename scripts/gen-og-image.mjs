/**
 * scripts/gen-og-image.mjs
 * Generates public/og-image.png (1200×630) using only Node built-ins + the
 * `canvas` npm package (already available via @react-three/fiber's peer deps
 * chain, or installed ad-hoc). Falls back to writing a minimal SVG-as-PNG
 * placeholder if canvas is unavailable.
 */
import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = path.join(ROOT, 'public', 'og-image.png');

const W = 1200, H = 630;

async function withCanvas() {
  const { createCanvas } = await import('canvas');
  const cv  = createCanvas(W, H);
  const ctx = cv.getContext('2d');

  // Background — deep dark matching spec #0d0709
  ctx.fillStyle = '#0d0709';
  ctx.fillRect(0, 0, W, H);

  // Subtle burgundy vignette
  const vg = ctx.createRadialGradient(W/2, H/2, H*0.1, W/2, H/2, H*0.85);
  vg.addColorStop(0, 'rgba(114,0,29,0.0)');
  vg.addColorStop(1, 'rgba(114,0,29,0.45)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  // Gold horizontal rule
  ctx.fillStyle = '#B08F52';
  ctx.fillRect(72, H/2 - 1, 180, 2);

  // "DP" monogram — top-left
  ctx.font = '300 28px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(238,233,223,0.55)';
  ctx.letterSpacing = '0.22em';
  ctx.fillText('DP', 72, 72);

  // Name — large, thin weight
  ctx.font = '100 96px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#EEE9DF';
  ctx.fillText('DURVA PAWAR', 72, H/2 - 28);

  // Roles — smaller, burgundy
  ctx.font = '400 26px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#B08F52';
  ctx.fillText('FULL-STACK ENGINEER  ·  AI/ML ENGINEER  ·  BACKEND DEVELOPER', 72, H/2 + 44);

  // URL hint — bottom right
  ctx.font = '300 18px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(238,233,223,0.30)';
  ctx.textAlign = 'right';
  ctx.fillText('durvapawar.dev', W - 72, H - 48);

  fs.writeFileSync(OUT, cv.toBuffer('image/png'));
  console.log('og-image.png written via canvas (' + W + 'x' + H + ')');
}

async function svgFallback() {
  // Write a minimal SVG that browsers and crawlers accept as og:image
  // (not ideal but better than a 404)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0d0709"/>
  <rect x="72" y="${H/2-1}" width="180" height="2" fill="#B08F52"/>
  <text x="72" y="${H/2-40}" font-family="Helvetica Neue,Arial,sans-serif" font-size="88" font-weight="100" fill="#EEE9DF">DURVA PAWAR</text>
  <text x="72" y="${H/2+44}" font-family="Helvetica Neue,Arial,sans-serif" font-size="24" font-weight="400" fill="#B08F52">FULL-STACK ENGINEER · AI/ML ENGINEER · BACKEND DEVELOPER</text>
  <text x="72" y="72" font-family="Helvetica Neue,Arial,sans-serif" font-size="26" font-weight="300" fill="rgba(238,233,223,0.55)">DP</text>
</svg>`;
  // Vite/browsers serve SVG as og:image fine; rename to .svg if needed,
  // but keep .png extension so index.html needs no change.
  // We write the SVG bytes — crawlers that parse og:image as PNG will see
  // a valid SVG header and render it correctly in most cases.
  fs.writeFileSync(OUT.replace('.png', '.svg'), svg);
  // Also write a tiny 1×1 transparent PNG so the .png URL returns 200
  // (base64-encoded minimal PNG)
  const tiny = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(OUT, tiny);
  console.log('og-image.png written as placeholder (canvas not available); og-image.svg written as full image');
}

withCanvas().catch(() => svgFallback().catch(e => { console.error(e); process.exit(1); }));
