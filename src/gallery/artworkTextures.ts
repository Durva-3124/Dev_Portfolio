/**
 * artworkTextures.ts — PART B.8
 * ─────────────────────────────────────────────────────────────────────────────
 * Every texture is a procedural CanvasTexture. Rules enforced here, once:
 *   • `colorSpace = THREE.SRGBColorSpace`  (no washed-out, no gamma-crushed art)
 *   • `anisotropy = 8`                     (no smear at grazing gallery angles)
 *   • canvas dimensions DERIVED from the artwork's aspect ratio in layout.ts,
 *     so TejaLens is generated at exactly 1280 × 896 for its 6 × 4.2 plane
 *   • generation is deferred to an idle callback, so the first rendered frame is
 *     never blocked by ~12 MB of canvas work
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { artworkById } from './layout';
import { hero, projects } from '@/data';

export const ANISOTROPY = 8;

/** height in pixels chosen per artwork; width follows from the layout aspect. */
const BASE_HEIGHT: Record<string, number> = {
  'meetsync-ai': 1280,
  'bullsight':   1792,
  'tejalens':    896,
  'name-plate':  512,
};

/** [w, h] derived from the artwork's real plane size (never hand-typed). */
export function textureSize(id: string): [number, number] {
  const a = artworkById(id);
  const h = BASE_HEIGHT[id] ?? 1024;
  return [Math.round((h * a.width) / a.height), h];
}

// ─── shared paint helpers ───────────────────────────────────────────────────
function grain(ctx: CanvasRenderingContext2D, w: number, h: number, s = 0.04) {
  const d = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 22 * s * 25;
    d.data[i]     = Math.max(0, Math.min(255, d.data[i]     + n));
    d.data[i + 1] = Math.max(0, Math.min(255, d.data[i + 1] + n));
    d.data[i + 2] = Math.max(0, Math.min(255, d.data[i + 2] + n));
  }
  ctx.putImageData(d, 0, 0);
  const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, h * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, `rgba(0,0,0,${s * 1.2})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

function grid(ctx: CanvasRenderingContext2D, w: number, h: number, step: number, alpha: number) {
  ctx.save();
  ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
  ctx.lineWidth = 0.8;
  for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
  ctx.restore();
}

const SANS = '"Helvetica Neue", Inter, Arial, sans-serif';

/** Page furniture common to every project piece. */
function plate(ctx: CanvasRenderingContext2D, w: number, h: number, idx: string, title: string, sub: string, dark: boolean) {
  ctx.textAlign = 'left';
  ctx.fillStyle = dark ? 'rgba(238,233,223,0.55)' : 'rgba(24,23,22,0.45)';
  ctx.font = `400 ${Math.round(h * 0.022)}px ${SANS}`;
  ctx.fillText(idx, w * 0.06, h * 0.075);
  ctx.textAlign = 'right';
  ctx.fillText('DURVA PAWAR', w * 0.94, h * 0.075);
  ctx.textAlign = 'left';
  ctx.fillStyle = dark ? '#EEE9DF' : '#181716';
  ctx.font = `100 ${Math.round(h * 0.155)}px ${SANS}`;
  ctx.fillText(title, w * 0.06, h * 0.30);
  ctx.fillStyle = '#72001D';
  ctx.fillRect(w * 0.06, h * 0.335, w * 0.16, Math.max(3, h * 0.004));
  ctx.font = `400 ${Math.round(h * 0.024)}px ${SANS}`;
  ctx.fillStyle = dark ? 'rgba(238,233,223,0.55)' : 'rgba(24,23,22,0.5)';
  ctx.fillText(sub, w * 0.06, h * 0.395);
}
// ─── 01 MeetSync ────────────────────────────────────────────────────────────
function drawMeetSync(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1A1714');
  bg.addColorStop(1, '#1D1A16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.strokeStyle = 'rgba(238,233,223,0.05)';
  ctx.lineWidth = 0.8;
  for (let x = 0; x < W; x += W / 22) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += W / 22) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  ctx.restore();

  const nodes = [
    { x: W * 0.16, y: H * 0.30 }, { x: W * 0.86, y: H * 0.26 },
    { x: W * 0.18, y: H * 0.78 }, { x: W * 0.84, y: H * 0.74 },
    { x: W * 0.50, y: H * 0.52 },
  ];
  ctx.strokeStyle = 'rgba(114,0,29,0.30)';
  ctx.lineWidth = 1.6;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const mx = (nodes[i].x + nodes[j].x) / 2 + (Math.random() - 0.5) * W * 0.06;
      const my = (nodes[i].y + nodes[j].y) / 2 + (Math.random() - 0.5) * H * 0.06;
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.quadraticCurveTo(mx, my, nodes[j].x, nodes[j].y);
      ctx.stroke();
    }
  }
  // transcript waveform, centrepiece
  ctx.save();
  ctx.strokeStyle = '#EEE9DF';
  ctx.lineWidth = Math.max(1.5, H * 0.0022);
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  for (let x = W * 0.08; x < W * 0.92; x += W / 400) {
    const t = (x - W * 0.08) / (W * 0.84);
    const env = Math.sin(t * Math.PI) * 0.9 + 0.1;
    const y = H * 0.56 + env * H * 0.07 * Math.sin(t * Math.PI * 7) * Math.cos(x * 0.01);
    if (x === W * 0.08) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();

  nodes.forEach(({ x, y }, i) => {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#72001D';
    ctx.beginPath(); ctx.arc(x, y, H * 0.04, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = i === 4 ? '#C05070' : '#72001D';
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(x, y, H * 0.04, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  });

  plate(ctx, W, H, '01 / SELECTED WORK', 'MEETSYNC', 'AI MEETING ORCHESTRATION', true);
  grain(ctx, W, H, 0.05);
}

// ─── 02 BullSight ───────────────────────────────────────────────────────────
function drawBullSight(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#F6F1E9');
  bg.addColorStop(1, '#EAE2D6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  grid(ctx, W, H, W / 20, 0.05);

  // candlestick chart
  const n = 34;
  let price = 0.52;
  const x0 = W * 0.08, span = W * 0.84;
  for (let i = 0; i < n; i++) {
    const cx = x0 + (i / (n - 1)) * span;
    const open = price;
    price = Math.max(0.14, Math.min(0.86, price + (Math.random() - 0.48) * 0.09));
    const close = price;
    const hi = Math.max(open, close) + Math.random() * 0.04;
    const lo = Math.min(open, close) - Math.random() * 0.04;
    const y = (v: number) => H * 0.30 + v * H * 0.50;
    ctx.strokeStyle = 'rgba(114,0,29,0.55)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(cx, y(hi)); ctx.lineTo(cx, y(lo)); ctx.stroke();
    ctx.fillStyle = close >= open ? 'rgba(114,0,29,0.85)' : 'rgba(24,23,22,0.55)';
    const bw = span / n * 0.55;
    ctx.fillRect(cx - bw / 2, y(Math.max(open, close)), bw, Math.max(2, Math.abs(y(open) - y(close))));
  }
  // moving average
  ctx.strokeStyle = 'rgba(24,23,22,0.35)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const cx = x0 + (i / (n - 1)) * span;
    const cy = H * 0.30 + (0.30 + 0.22 * Math.sin(i * 0.42)) * H * 0.50;
    if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
  }
  ctx.stroke();
  ctx.setLineDash([]);

  plate(ctx, W, H, '02 / SELECTED WORK', 'BULLSIGHT', 'REAL-TIME MARKET INTELLIGENCE', false);

  // ticker tape strip at the base
  ctx.fillStyle = 'rgba(24,23,22,0.9)';
  ctx.fillRect(0, H * 0.905, W, H * 0.052);
  ctx.fillStyle = 'rgba(238,233,223,0.75)';
  const tags = projects[1].tags.join('   ');
  ctx.font = `400 ${Math.round(H * 0.024)}px ${SANS}`;
  ctx.fillText(tags, W * 0.06, H * 0.938);
  grain(ctx, W, H, 0.04);
}
// ─── 03 TejaLens ────────────────────────────────────────────────────────────
function drawTejaLens(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.85);
  bg.addColorStop(0, '#2A0810');
  bg.addColorStop(0.5, '#1E0509');
  bg.addColorStop(1, '#120205');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = '#8B3A4A';
  ctx.beginPath(); ctx.ellipse(W / 2, H / 2, W * 0.24, H * 0.30, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;

  // concentric iris rings
  const rings = [
    { rx: 0.22, ry: 0.27, rot: 0.08, color: '#72001D', a: 0.62, lw: 2.6 },
    { rx: 0.16, ry: 0.20, rot: -0.12, color: '#A03050', a: 0.48, lw: 2.0 },
    { rx: 0.10, ry: 0.13, rot: 0.25, color: '#C05070', a: 0.38, lw: 1.6 },
  ];
  rings.forEach(({ rx, ry, rot, color, a, lw }) => {
    const RX = rx * W, RY = ry * H;
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(rot);
    ctx.globalAlpha = a;
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.moveTo(RX, 0);
    ctx.bezierCurveTo(RX, -RY * 0.55, RX * 0.55, -RY, 0, -RY);
    ctx.bezierCurveTo(-RX * 0.55, -RY, -RX, -RY * 0.55, -RX, 0);
    ctx.bezierCurveTo(-RX, RY * 0.55, -RX * 0.55, RY, 0, RY);
    ctx.bezierCurveTo(RX * 0.55, RY, RX, RY * 0.55, RX, 0);
    ctx.stroke();
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  const spot = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, H * 0.11);
  spot.addColorStop(0, 'rgba(255,248,244,0.72)');
  spot.addColorStop(1, 'rgba(255,248,244,0)');
  ctx.fillStyle = spot;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, H * 0.11, 0, Math.PI * 2); ctx.fill();

  plate(ctx, W, H, '03 / SELECTED WORK', 'TEJALENS', 'AI SKIN ANALYSIS', true);

  ctx.fillStyle = 'rgba(238,233,223,0.6)';
  ctx.font = `400 ${Math.round(H * 0.023)}px ${SANS}`;
  ctx.fillText('U-NET  ·  EFFICIENTNET-B0  ·  SWIN TRANSFORMER  ·  35,000+ IMAGES', W * 0.06, H * 0.93);
  grain(ctx, W, H, 0.05);
}

// ─── Name plate (the "DURVA" typographic piece) ─────────────────────────────
function drawNamePlate(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#F6F1E9');
  bg.addColorStop(1, '#EAE1D5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#6F1028';
  ctx.fillRect(0, 0, W * 0.012, H);

  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(24,23,22,0.40)';
  ctx.font = `400 ${Math.round(H * 0.045)}px ${SANS}`;
  ctx.fillText('ROOM 01 — ENTRANCE', W * 0.06, H * 0.17);

  ctx.fillStyle = '#1A1614';
  ctx.font = `100 ${Math.round(H * 0.30)}px ${SANS}`;
  ctx.fillText(hero.name.toUpperCase(), W * 0.058, H * 0.52);

  ctx.fillStyle = '#6F1028';
  ctx.fillRect(W * 0.06, H * 0.575, W * 0.14, Math.max(2, H * 0.012));

  ctx.fillStyle = '#6F1028';
  ctx.font = `400 ${Math.round(H * 0.062)}px ${SANS}`;
  ctx.fillText(hero.roles.join('  ·  ').toUpperCase(), W * 0.06, H * 0.72);

  ctx.fillStyle = 'rgba(24,23,22,0.55)';
  ctx.font = `300 ${Math.round(H * 0.052)}px ${SANS}`;
  ctx.fillText(hero.location.toUpperCase(), W * 0.06, H * 0.87);
  grain(ctx, W, H, 0.03);
}
const DRAWERS: Record<string, (ctx: CanvasRenderingContext2D, w: number, h: number) => void> = {
  'meetsync-ai': drawMeetSync,
  'bullsight':   drawBullSight,
  'tejalens':    drawTejaLens,
  'name-plate':  drawNamePlate,
};

const canvasCache = new Map<string, HTMLCanvasElement>();
const texCache = new Map<string, THREE.CanvasTexture>();
const urlCache = new Map<string, string>();

/** The shared canvas, so the texture and the overlay <img> are the same image. */
export function getArtworkCanvas(id: string): HTMLCanvasElement {
  let cv = canvasCache.get(id);
  if (!cv) {
    const [w, h] = textureSize(id);
    cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    const ctx = cv.getContext('2d')!;
    DRAWERS[id](ctx, w, h);
    canvasCache.set(id, cv);
  }
  return cv;
}

/** PART B.8 — sRGB + anisotropy 8 on every CanvasTexture. */
export function getArtworkTexture(id: string): THREE.CanvasTexture {
  let t = texCache.get(id);
  if (!t) {
    t = new THREE.CanvasTexture(getArtworkCanvas(id));
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = ANISOTROPY;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    texCache.set(id, t);
  }
  return t;
}

/** Same pixels, as a data URL — used by the project overlay (PART B.11). */
export function getArtworkDataURL(id: string): string {
  let u = urlCache.get(id);
  if (!u) {
    u = getArtworkCanvas(id).toDataURL('image/jpeg', 0.82);
    urlCache.set(id, u);
  }
  return u;
}

/** Which textures are already built — used by the screenshot harness. */
export function readyTextureIds(): string[] {
  return [...texCache.keys()];
}

/** Defer to an idle callback so the first frame is never blocked. */
function whenIdle(cb: () => void): void {
  const ric = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (typeof ric === 'function') ric(cb, { timeout: 900 });
  else setTimeout(cb, 1);
}

/**
 * Lazy texture hook — returns null on the first paint, then the real texture
 * once the browser is idle. Frames simply render the frame without the canvas
 * for one or two frames instead of stalling the whole first render.
 */
export function useArtworkTexture(id: string): THREE.CanvasTexture | null {
  const [tex, setTex] = useState<THREE.CanvasTexture | null>(() => texCache.get(id) ?? null);
  useEffect(() => {
    if (texCache.has(id)) {
      setTex(texCache.get(id)!);
      return;
    }
    let alive = true;
    whenIdle(() => { if (alive) setTex(getArtworkTexture(id)); });
    return () => { alive = false; };
  }, [id]);
  return tex;
}

/** Pre-generate every artwork while the browser is idle (used once at startup). */
export function warmArtworkTextures(ids: string[]): void {
  let i = 0;
  const next = () => {
    if (i >= ids.length) return;
    getArtworkTexture(ids[i++]);
    whenIdle(next);
  };
  whenIdle(next);
}