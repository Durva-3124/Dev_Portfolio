import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ARTWORKS, CAM, type ArtworkDef } from './constants';

// ─── Grain overlay helper ─────────────────────────────────────────────────────
function addGrain(ctx: CanvasRenderingContext2D, w: number, h: number, alpha = 0.04) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 28;
    data[i]     = Math.max(0, Math.min(255, data[i]     + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);
  // Vignette
  const vg = ctx.createRadialGradient(w/2, h/2, h*0.25, w/2, h/2, h*0.72);
  vg.addColorStop(0, `rgba(0,0,0,0)`);
  vg.addColorStop(1, `rgba(0,0,0,${alpha})`);
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h);
}

// ─── MeetSync-AI ──────────────────────────────────────────────────────────────
// Visual language: conversation, audio waveform, connected participants, AI mesh
function makeMeetSyncTexture(): THREE.CanvasTexture {
  const W = 1024, H = 720;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  // Warm cream ground with subtle gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#F0EBE0');
  bg.addColorStop(1, '#E8E2D6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Participant nodes — 4 circles representing connected people ──────
  const nodes = [
    { x: 180, y: 200 }, { x: 820, y: 180 },
    { x: 200, y: 520 }, { x: 800, y: 540 },
    { x: 512, y: 360 }, // centre — AI node
  ];

  // Connection lines between nodes
  ctx.strokeStyle = 'rgba(128,0,32,0.18)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < nodes.length - 1; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      // Slight curve via control point
      const mx = (nodes[i].x + nodes[j].x) / 2 + (Math.random() - 0.5) * 60;
      const my = (nodes[i].y + nodes[j].y) / 2 + (Math.random() - 0.5) * 60;
      ctx.quadraticCurveTo(mx, my, nodes[j].x, nodes[j].y);
      ctx.stroke();
    }
  }

  // Participant circles
  nodes.slice(0, 4).forEach(({ x, y }) => {
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#800020';
    ctx.beginPath(); ctx.arc(x, y, 38, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = '#800020';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(x, y, 38, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Centre AI node — larger, more prominent
  const cx = nodes[4].x, cy = nodes[4].y;
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#800020';
  ctx.beginPath(); ctx.arc(cx, cy, 72, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.70;
  ctx.strokeStyle = '#800020';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, 72, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.30;
  ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Audio waveform — horizontal band across middle ───────────────────
  const waveY = 360;
  ctx.strokeStyle = '#3A2922';
  ctx.lineWidth = 1.8;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  for (let x = 60; x < W - 60; x += 2) {
    const t = (x - 60) / (W - 120);
    // Envelope: louder in middle
    const env = Math.sin(t * Math.PI) * 0.85 + 0.15;
    const amp = env * 55 * Math.sin(t * Math.PI * 3);
    const y = waveY + amp * Math.sin(x * 0.18) * Math.cos(x * 0.07);
    if (x === 60) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Transcription lines — thin horizontal rules below waveform ───────
  ctx.globalAlpha = 0.14;
  ctx.strokeStyle = '#1a1410';
  ctx.lineWidth = 1;
  [430, 460, 490, 520, 550, 580].forEach(y => {
    const lineW = 200 + Math.random() * 400;
    const lineX = 80 + Math.random() * (W - 80 - lineW);
    ctx.beginPath(); ctx.moveTo(lineX, y); ctx.lineTo(lineX + lineW, y); ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // ── Large expressive burgundy mark — top-left ─────────────────────────
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#800020';
  ctx.beginPath();
  ctx.ellipse(120, 120, 180, 90, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Small label — bottom right ────────────────────────────────────────
  ctx.font = '500 11px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(26,20,16,0.35)';
  ctx.textAlign = 'right';
  ctx.fillText('MEETSYNC — AI', W - 48, H - 40);

  addGrain(ctx, W, H, 0.06);
  return new THREE.CanvasTexture(cv);
}

// ─── BullSight ────────────────────────────────────────────────────────────────
// Visual language: candlestick abstraction, market curves, real-time signals
function makeBullSightTexture(): THREE.CanvasTexture {
  const W = 1024, H = 720;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  // Deep charcoal ground
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#0D1117');
  bg.addColorStop(1, '#111820');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Fine grid ─────────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 0.6;
  for (let x = 0; x < W; x += 52) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 52) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // ── Market curve — main price line ───────────────────────────────────
  const pricePoints: [number, number][] = [];
  let price = 380;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    price += (Math.random() - 0.44) * 28;
    price = Math.max(200, Math.min(520, price));
    pricePoints.push([60 + (i / steps) * (W - 120), H - 80 - (price / 600) * (H - 160)]);
  }

  // Gradient fill under curve
  const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
  fillGrad.addColorStop(0, 'rgba(74,127,165,0.22)');
  fillGrad.addColorStop(1, 'rgba(74,127,165,0)');
  ctx.fillStyle = fillGrad;
  ctx.beginPath();
  ctx.moveTo(pricePoints[0][0], H - 80);
  pricePoints.forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.lineTo(pricePoints[pricePoints.length - 1][0], H - 80);
  ctx.closePath();
  ctx.fill();

  // Price line
  ctx.strokeStyle = '#4a9fd4';
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  pricePoints.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.stroke();
  ctx.globalAlpha = 1;

  // ── Candlestick bars — abstract, not realistic ────────────────────────
  const barCount = 18;
  for (let i = 0; i < barCount; i++) {
    const bx = 80 + (i / barCount) * (W - 160);
    const open  = 200 + Math.random() * 280;
    const close = open + (Math.random() - 0.48) * 60;
    const high  = Math.max(open, close) + Math.random() * 30;
    const low   = Math.min(open, close) - Math.random() * 30;
    const toY = (v: number) => H - 80 - (v / 600) * (H - 160);
    const isUp = close > open;

    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = isUp ? '#4adf8a' : '#df4a6a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx, toY(high)); ctx.lineTo(bx, toY(low)); ctx.stroke();

    ctx.fillStyle = isUp ? 'rgba(74,223,138,0.35)' : 'rgba(223,74,106,0.35)';
    const barH = Math.abs(toY(close) - toY(open));
    ctx.fillRect(bx - 5, Math.min(toY(open), toY(close)), 10, Math.max(barH, 2));
    ctx.globalAlpha = 1;
  }

  // ── Signal dots on price line ─────────────────────────────────────────
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = 0.8;
  [8, 16, 24, 32].forEach(i => {
    const [x, y] = pricePoints[i];
    ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
  });
  ctx.globalAlpha = 1;

  // ── Label ─────────────────────────────────────────────────────────────
  ctx.font = '500 11px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.textAlign = 'right';
  ctx.fillText('BULLSIGHT — REAL TIME', W - 48, H - 40);

  addGrain(ctx, W, H, 0.03);
  return new THREE.CanvasTexture(cv);
}

// ─── TejaLens ─────────────────────────────────────────────────────────────────
// Visual language: dermoscopic imagery, segmentation contours, cellular structures
function makeTejaLensTexture(): THREE.CanvasTexture {
  const W = 900, H = 1100;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  // Warm off-white ground
  const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, H*0.65);
  bg.addColorStop(0, '#F5EEE8');
  bg.addColorStop(1, '#EDE4DC');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Dermoscopic base — large organic ellipse ──────────────────────────
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = '#8B3A4A';
  ctx.beginPath();
  ctx.ellipse(W/2, H/2, 310, 380, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Segmentation contours — irregular closed paths ────────────────────
  const contours = [
    { cx: W/2, cy: H/2,      rx: 260, ry: 320, rot: 0.1,  color: '#800020', a: 0.55, lw: 2.0 },
    { cx: W/2, cy: H/2,      rx: 180, ry: 230, rot: -0.1, color: '#a03050', a: 0.40, lw: 1.5 },
    { cx: W/2-40, cy: H/2+30, rx: 110, ry: 140, rot: 0.3, color: '#c05070', a: 0.30, lw: 1.2 },
    { cx: W/2+30, cy: H/2-40, rx: 70,  ry: 90,  rot: -0.2,color: '#d07080', a: 0.25, lw: 1.0 },
  ];
  contours.forEach(({ cx, cy, rx, ry, rot, color, a, lw }) => {
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(rot);
    ctx.globalAlpha = a;
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    // Irregular ellipse via bezier
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.bezierCurveTo(rx, -ry*0.55, rx*0.55, -ry, 0, -ry);
    ctx.bezierCurveTo(-rx*0.55, -ry, -rx, -ry*0.55, -rx, 0);
    ctx.bezierCurveTo(-rx, ry*0.55, -rx*0.55, ry, 0, ry);
    ctx.bezierCurveTo(rx*0.55, ry, rx, ry*0.55, rx, 0);
    ctx.stroke();
    ctx.restore();
  });
  ctx.globalAlpha = 1;

  // ── Cellular texture — small irregular cells ──────────────────────────
  for (let i = 0; i < 55; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 240;
    const cx = W/2 + Math.cos(angle) * r;
    const cy = H/2 + Math.sin(angle) * r;
    const cr = 8 + Math.random() * 22;
    ctx.globalAlpha = 0.08 + Math.random() * 0.12;
    ctx.fillStyle = Math.random() > 0.5 ? '#800020' : '#3A1520';
    ctx.beginPath();
    ctx.ellipse(cx, cy, cr, cr * (0.6 + Math.random() * 0.8), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ── Radial measurement lines — computer vision feel ───────────────────
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#800020';
  ctx.lineWidth = 0.8;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(W/2 + Math.cos(a) * 270, H/2 + Math.sin(a) * 330);
    ctx.lineTo(W/2 + Math.cos(a) * 310, H/2 + Math.sin(a) * 380);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // ── Central bright spot — lens highlight ─────────────────────────────
  const spot = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 60);
  spot.addColorStop(0, 'rgba(255,248,244,0.85)');
  spot.addColorStop(1, 'rgba(255,248,244,0)');
  ctx.fillStyle = spot;
  ctx.beginPath(); ctx.arc(W/2, H/2, 60, 0, Math.PI * 2); ctx.fill();

  // ── Label ─────────────────────────────────────────────────────────────
  ctx.font = '500 11px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = 'rgba(26,20,16,0.30)';
  ctx.textAlign = 'right';
  ctx.fillText('TEJALENS — COMPUTER VISION', W - 48, H - 40);

  addGrain(ctx, W, H, 0.05);
  return new THREE.CanvasTexture(cv);
}

// ─── Animated generative artwork ─────────────────────────────────────────────
function useGenerativeTexture(w: number, h: number) {
  const texRef = useRef<THREE.CanvasTexture | null>(null);
  const cvRef  = useRef<HTMLCanvasElement | null>(null);
  const tRef   = useRef(0);

  if (!cvRef.current) {
    const cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    cvRef.current = cv;
    texRef.current = new THREE.CanvasTexture(cv);
  }

  const tick = useCallback((dt: number) => {
    tRef.current += dt * 0.15;
    const cv = cvRef.current!;
    const ctx = cv.getContext('2d')!;
    const t = tRef.current;

    ctx.fillStyle = '#F0EBE2';
    ctx.fillRect(0, 0, w, h);

    const N = 70;
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2 + t * 0.25;
      const r = 90 + Math.sin(i * 0.8 + t * 0.4) * 65;
      const px = w / 2 + Math.cos(angle) * r;
      const py = h / 2 + Math.sin(angle * 1.4) * r * 0.55;
      const size = 1.8 + Math.sin(i * 0.5 + t) * 1.2;
      ctx.globalAlpha = 0.25 + Math.sin(i * 0.35 + t * 0.6) * 0.20;
      ctx.fillStyle = i % 3 === 0 ? '#800020' : i % 3 === 1 ? '#3A2922' : '#66705A';
      ctx.beginPath(); ctx.arc(px, py, size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 0.07;
    ctx.strokeStyle = '#800020';
    ctx.lineWidth = 0.7;
    for (let i = 0; i < N - 1; i += 4) {
      const a1 = (i / N) * Math.PI * 2 + t * 0.25;
      const a2 = ((i + 4) / N) * Math.PI * 2 + t * 0.25;
      const r1 = 90 + Math.sin(i * 0.8 + t * 0.4) * 65;
      const r2 = 90 + Math.sin((i+4) * 0.8 + t * 0.4) * 65;
      ctx.beginPath();
      ctx.moveTo(w/2 + Math.cos(a1)*r1, h/2 + Math.sin(a1*1.4)*r1*0.55);
      ctx.lineTo(w/2 + Math.cos(a2)*r2, h/2 + Math.sin(a2*1.4)*r2*0.55);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    texRef.current!.needsUpdate = true;
  }, [w, h]);

  return { tex: texRef.current!, tick };
}

function makeTypoTexture(): THREE.CanvasTexture {
  const W = 600, H = 900;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  ctx.fillStyle = '#F7F4ED';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#181818';
  ctx.textAlign = 'center';
  const letters = ['D', 'U', 'R', 'V', 'A'];
  letters.forEach((l, i) => {
    ctx.font = `300 ${160 - i * 4}px Georgia, "Times New Roman", serif`;
    ctx.globalAlpha = 0.78 - i * 0.03;
    ctx.fillText(l, W / 2, 155 + i * 158);
  });

  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#800020';
  ctx.lineWidth = 0.8;
  for (let y = 0; y < H; y += 28) {
    ctx.beginPath(); ctx.moveTo(36, y); ctx.lineTo(W - 36, y); ctx.stroke();
  }

  ctx.globalAlpha = 0.85;
  ctx.fillStyle = '#800020';
  ctx.fillRect(W / 2 - 1.5, 55, 3, H - 110);

  addGrain(ctx, W, H, 0.04);
  return new THREE.CanvasTexture(cv);
}

// ─── Texture cache ────────────────────────────────────────────────────────────
const textureCache: Record<string, THREE.CanvasTexture> = {};
function getTexture(id: string): THREE.CanvasTexture {
  if (!textureCache[id]) {
    if (id === 'meetsync-ai') textureCache[id] = makeMeetSyncTexture();
    else if (id === 'bullsight') textureCache[id] = makeBullSightTexture();
    else if (id === 'tejalens') textureCache[id] = makeTejaLensTexture();
  }
  return textureCache[id];
}

// ─── Frame material variants ──────────────────────────────────────────────────
const FRAME_STYLES: Record<string, { color: number; roughness: number; metalness: number }> = {
  'meetsync-ai': { color: 0x1a1816, roughness: 0.55, metalness: 0.05 },
  'bullsight':   { color: 0x2a2420, roughness: 0.30, metalness: 0.60 },
  'tejalens':    { color: 0x3A2922, roughness: 0.68, metalness: 0.02 },
};

// ─── Museum plaque ────────────────────────────────────────────────────────────
function MuseumPlaque({ def }: { def: ArtworkDef }) {
  return (
    <Html
      position={[def.width / 2 + 0.12, -(def.height / 2) + 0.28, 0.06]}
      distanceFactor={5}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{
        background: 'rgba(242,239,231,0.94)',
        border: '1px solid rgba(24,24,24,0.10)',
        padding: '5px 9px',
        width: 105,
        fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
      }}>
        <div style={{ fontSize: 8.5, letterSpacing: '0.14em', color: '#181818', fontWeight: 600, textTransform: 'uppercase' }}>
          {def.title}
        </div>
        <div style={{ fontSize: 7.5, letterSpacing: '0.08em', color: '#999', marginTop: 2 }}>2026</div>
        <div style={{ fontSize: 7, letterSpacing: '0.10em', color: '#bbb', marginTop: 1, textTransform: 'uppercase' }}>
          {def.role}
        </div>
      </div>
    </Html>
  );
}

// ─── Single artwork frame ─────────────────────────────────────────────────────
function ArtworkFrame({ def, onSelect }: { def: ArtworkDef; onSelect: (d: ArtworkDef) => void }) {
  const { camera } = useThree();
  const groupRef   = useRef<THREE.Group>(null);
  const [near, setNear]       = useState(false);
  const [hovered, setHovered] = useState(false);

  const ft = 0.10, fd = 0.16, gap = 0.05;
  const tex = useMemo(() => getTexture(def.id), [def.id]);
  const fs  = FRAME_STYLES[def.id] ?? { color: 0x1a1816, roughness: 0.55, metalness: 0.05 };

  useFrame(() => {
    if (!groupRef.current) return;
    setNear(camera.position.distanceTo(groupRef.current.position) < CAM.approachDist * 3.0);
  });

  return (
    <group
      ref={groupRef}
      position={[def.position[0], def.position[1], def.position[2] + gap]}
      rotation={new THREE.Euler(...def.rotation)}
      onClick={() => onSelect(def)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Backing board */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[def.width + 0.06, def.height + 0.06, 0.05]} />
        <meshStandardMaterial color={0x0e0c0a} roughness={0.9} metalness={0} />
      </mesh>
      {/* Canvas */}
      <mesh receiveShadow castShadow>
        <planeGeometry args={[def.width, def.height]} />
        <meshStandardMaterial map={tex} roughness={0.85} metalness={0} />
      </mesh>
      {/* Frame sides */}
      {(['top','bottom','left','right'] as const).map(side => {
        const pos: [number,number,number] =
          side === 'top'    ? [0,  def.height/2 + ft/2, fd/2 - 0.02] :
          side === 'bottom' ? [0, -def.height/2 - ft/2, fd/2 - 0.02] :
          side === 'left'   ? [-def.width/2 - ft/2, 0,  fd/2 - 0.02] :
                              [ def.width/2 + ft/2, 0,  fd/2 - 0.02];
        const size: [number,number,number] =
          side === 'top' || side === 'bottom'
            ? [def.width + ft*2, ft, fd]
            : [ft, def.height + ft*2, fd];
        return (
          <mesh key={side} castShadow position={pos}>
            <boxGeometry args={size} />
            <meshStandardMaterial {...fs} />
          </mesh>
        );
      })}
      {near && <MuseumPlaque def={def} />}
      {hovered && (
        <Html position={[0, 0, 0.20]} center distanceFactor={6}>
          <div style={{
            width: 50, height: 50, borderRadius: '50%',
            border: '1px solid rgba(24,24,24,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
            fontSize: 8.5, letterSpacing: '0.18em', color: '#181818',
            textTransform: 'uppercase',
            background: 'rgba(242,239,231,0.78)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}>VIEW</div>
        </Html>
      )}
    </group>
  );
}

// ─── Generative animated artwork (wall installation) ─────────────────────────
export function GenerativeArtwork({ position, rotation, width = 3.2, height = 2.4 }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}) {
  const { tex, tick } = useGenerativeTexture(512, 384);
  useFrame((_, dt) => tick(dt));
  const ft = 0.06, fd = 0.10;

  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      <mesh castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={tex} roughness={0.9} metalness={0} />
      </mesh>
      {(['top','bottom','left','right'] as const).map(side => {
        const pos: [number,number,number] =
          side === 'top'    ? [0,  height/2 + ft/2, fd/2-0.01] :
          side === 'bottom' ? [0, -height/2 - ft/2, fd/2-0.01] :
          side === 'left'   ? [-width/2 - ft/2, 0,  fd/2-0.01] :
                              [ width/2 + ft/2, 0,  fd/2-0.01];
        const size: [number,number,number] =
          side === 'top' || side === 'bottom' ? [width+ft*2, ft, fd] : [ft, height+ft*2, fd];
        return (
          <mesh key={side} castShadow position={pos}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={0x1a1816} roughness={0.55} metalness={0.05} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Typographic artwork ──────────────────────────────────────────────────────
export function TypoArtwork({ position, rotation }: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const tex = useMemo(() => makeTypoTexture(), []);
  const W = 2.2, H = 3.3, ft = 0.07, fd = 0.11;

  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      <mesh castShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={tex} roughness={0.88} metalness={0} />
      </mesh>
      {(['top','bottom','left','right'] as const).map(side => {
        const pos: [number,number,number] =
          side === 'top'    ? [0,  H/2 + ft/2, fd/2-0.01] :
          side === 'bottom' ? [0, -H/2 - ft/2, fd/2-0.01] :
          side === 'left'   ? [-W/2 - ft/2, 0,  fd/2-0.01] :
                              [ W/2 + ft/2, 0,  fd/2-0.01];
        const size: [number,number,number] =
          side === 'top' || side === 'bottom' ? [W+ft*2, ft, fd] : [ft, H+ft*2, fd];
        return (
          <mesh key={side} castShadow position={pos}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={0x1a1816} roughness={0.60} metalness={0.08} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function ProjectArtworks({ onSelect }: { onSelect: (def: ArtworkDef) => void }) {
  return (
    <>
      {ARTWORKS.map(def => (
        <ArtworkFrame key={def.id} def={def} onSelect={onSelect} />
      ))}
    </>
  );
}
