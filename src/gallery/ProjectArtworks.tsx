import { useRef, useState, useCallback, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ARTWORKS, CH, CAM, type ArtworkDef } from './constants';

// ─── Procedural canvas textures ───────────────────────────────────────────────

function makeMeetSyncTexture(): THREE.CanvasTexture {
  const W = 1024, H = 700;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  // Cream ground
  ctx.fillStyle = '#F0EBE0';
  ctx.fillRect(0, 0, W, H);

  // Large expressive burgundy strokes
  const strokes = [
    { x: 180, y: 120, w: 520, h: 38, r: 0.18, a: 0.82 },
    { x: 80,  y: 220, w: 680, h: 28, r: 0.12, a: 0.65 },
    { x: 260, y: 340, w: 440, h: 55, r: 0.22, a: 0.90 },
    { x: 120, y: 460, w: 600, h: 22, r: 0.08, a: 0.55 },
    { x: 300, y: 560, w: 380, h: 42, r: 0.30, a: 0.75 },
  ];
  strokes.forEach(({ x, y, w, h, r, a }) => {
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(r * (Math.random() > 0.5 ? 1 : -1) * 0.15);
    ctx.globalAlpha = a;
    ctx.fillStyle = '#800020';
    ctx.beginPath();
    ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Black accent marks
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = '#1a1410';
  ctx.beginPath(); ctx.ellipse(640, 180, 90, 18, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(200, 500, 60, 12, -0.3, 0, Math.PI * 2); ctx.fill();

  // Thin horizontal lines
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#800020';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    const ly = 80 + i * 78;
    ctx.beginPath(); ctx.moveTo(60, ly); ctx.lineTo(W - 60, ly); ctx.stroke();
  }

  // Subtle cream wash overlay
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, 'rgba(240,235,224,0.18)');
  grad.addColorStop(1, 'rgba(240,235,224,0.38)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  return new THREE.CanvasTexture(cv);
}

function makeBullSightTexture(): THREE.CanvasTexture {
  const W = 1024, H = 700;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  // Deep near-black ground
  ctx.fillStyle = '#0E1218';
  ctx.fillRect(0, 0, W, H);

  // Grid of fine lines — technological feel
  ctx.strokeStyle = '#1e2a38';
  ctx.lineWidth = 0.8;
  for (let x = 0; x < W; x += 48) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 48) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Diagonal accent lines
  ctx.strokeStyle = '#2a3d55';
  ctx.lineWidth = 1.2;
  for (let i = -4; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 120, 0);
    ctx.lineTo(i * 120 + H, H);
    ctx.stroke();
  }

  // Large circle — target / bull's eye
  ctx.strokeStyle = '#4a7fa5';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 200, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.4;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 130, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.25;
  ctx.beginPath(); ctx.arc(W / 2, H / 2, 60, 0, Math.PI * 2); ctx.stroke();

  // Crosshair
  ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#6aafdf';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W / 2, H / 2 - 220); ctx.lineTo(W / 2, H / 2 + 220); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W / 2 - 220, H / 2); ctx.lineTo(W / 2 + 220, H / 2); ctx.stroke();

  // Data points
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#4a7fa5';
  const pts = [[200,150],[780,200],[350,500],[650,420],[500,280],[820,550],[180,480]];
  pts.forEach(([px, py]) => {
    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
  });

  // Connecting lines between points
  ctx.globalAlpha = 0.25;
  ctx.strokeStyle = '#4a7fa5';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < pts.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(pts[i][0], pts[i][1]);
    ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
    ctx.stroke();
  }

  // Bright accent dot at centre
  ctx.globalAlpha = 1;
  const radGrad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 30);
  radGrad.addColorStop(0, '#8fd4ff');
  radGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = radGrad;
  ctx.beginPath(); ctx.arc(W/2, H/2, 30, 0, Math.PI*2); ctx.fill();

  return new THREE.CanvasTexture(cv);
}

function makeTejaLensTexture(): THREE.CanvasTexture {
  const W = 700, H = 900;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  // Warm off-white ground
  ctx.fillStyle = '#F5EEE8';
  ctx.fillRect(0, 0, W, H);

  // Organic cell-like forms — biological / vision
  const cells = [
    { x: 350, y: 200, rx: 160, ry: 120, rot: 0.2,  color: '#c04060', a: 0.55 },
    { x: 220, y: 380, rx: 100, ry: 140, rot: -0.4, color: '#e06080', a: 0.45 },
    { x: 480, y: 420, rx: 120, ry: 90,  rot: 0.6,  color: '#a03050', a: 0.50 },
    { x: 350, y: 580, rx: 180, ry: 110, rot: -0.1, color: '#d05070', a: 0.40 },
    { x: 160, y: 600, rx: 80,  ry: 110, rot: 0.8,  color: '#b04060', a: 0.35 },
    { x: 540, y: 650, rx: 90,  ry: 130, rot: -0.5, color: '#e08090', a: 0.38 },
    { x: 350, y: 780, rx: 140, ry: 80,  rot: 0.3,  color: '#c05070', a: 0.42 },
  ];

  cells.forEach(({ x, y, rx, ry, rot, color, a }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = a;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Thin concentric rings — lens / iris
  ctx.globalAlpha = 0.22;
  ctx.strokeStyle = '#800020';
  for (let r = 40; r < 320; r += 38) {
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(350, 450, r, 0, Math.PI * 2); ctx.stroke();
  }

  // Radial lines from centre
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = '#600018';
  ctx.lineWidth = 0.6;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
    ctx.beginPath();
    ctx.moveTo(350, 450);
    ctx.lineTo(350 + Math.cos(a) * 300, 450 + Math.sin(a) * 300);
    ctx.stroke();
  }

  // Central bright spot
  ctx.globalAlpha = 1;
  const cg = ctx.createRadialGradient(350, 450, 0, 350, 450, 55);
  cg.addColorStop(0, 'rgba(255,240,235,0.95)');
  cg.addColorStop(1, 'rgba(255,240,235,0)');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(350, 450, 55, 0, Math.PI * 2); ctx.fill();

  // Vignette
  const vg = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.75);
  vg.addColorStop(0, 'rgba(245,238,232,0)');
  vg.addColorStop(1, 'rgba(200,160,150,0.28)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);

  return new THREE.CanvasTexture(cv);
}

// ─── Animated generative texture (updated each frame via ref) ─────────────────
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
    tRef.current += dt * 0.18;
    const cv = cvRef.current!;
    const ctx = cv.getContext('2d')!;
    const t = tRef.current;

    ctx.fillStyle = '#F2EDE4';
    ctx.fillRect(0, 0, w, h);

    // Flowing particle field
    const N = 80;
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2 + t * 0.3;
      const r = 120 + Math.sin(i * 0.7 + t * 0.5) * 80;
      const px = w / 2 + Math.cos(angle) * r;
      const py = h / 2 + Math.sin(angle * 1.3) * r * 0.6;
      const size = 2 + Math.sin(i * 0.4 + t) * 1.5;
      const alpha = 0.3 + Math.sin(i * 0.3 + t * 0.7) * 0.25;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = i % 3 === 0 ? '#800020' : i % 3 === 1 ? '#3A2922' : '#66705A';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Connecting lines
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#800020';
    ctx.lineWidth = 0.8;
    for (let i = 0; i < N - 1; i += 3) {
      const a1 = (i / N) * Math.PI * 2 + t * 0.3;
      const a2 = ((i + 3) / N) * Math.PI * 2 + t * 0.3;
      const r1 = 120 + Math.sin(i * 0.7 + t * 0.5) * 80;
      const r2 = 120 + Math.sin((i + 3) * 0.7 + t * 0.5) * 80;
      ctx.beginPath();
      ctx.moveTo(w/2 + Math.cos(a1)*r1, h/2 + Math.sin(a1*1.3)*r1*0.6);
      ctx.lineTo(w/2 + Math.cos(a2)*r2, h/2 + Math.sin(a2*1.3)*r2*0.6);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    texRef.current!.needsUpdate = true;
  }, [w, h]);

  return { tex: texRef.current!, tick };
}

// ─── Typographic texture ──────────────────────────────────────────────────────
function makeTypoTexture(): THREE.CanvasTexture {
  const W = 600, H = 900;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d')!;

  ctx.fillStyle = '#F7F4ED';
  ctx.fillRect(0, 0, W, H);

  // Large editorial letters
  ctx.fillStyle = '#181818';
  ctx.font = 'bold 180px Georgia, serif';
  ctx.textAlign = 'center';
  const letters = ['D', 'U', 'R', 'V', 'A'];
  letters.forEach((l, i) => {
    ctx.globalAlpha = 0.82 - i * 0.04;
    ctx.fillText(l, W / 2, 160 + i * 160);
  });

  // Thin rule lines
  ctx.globalAlpha = 0.15;
  ctx.strokeStyle = '#800020';
  ctx.lineWidth = 1;
  for (let y = 0; y < H; y += 30) {
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 40, y); ctx.stroke();
  }

  // Burgundy accent bar
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#800020';
  ctx.fillRect(W / 2 - 2, 60, 4, H - 120);

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
  'meetsync-ai': { color: 0x1a1816, roughness: 0.55, metalness: 0.05 },  // matte black
  'bullsight':   { color: 0x2a2420, roughness: 0.35, metalness: 0.55 },  // brushed metal
  'tejalens':    { color: 0x3A2922, roughness: 0.70, metalness: 0.02 },  // dark walnut
};

// ─── Museum plaque ────────────────────────────────────────────────────────────
function MuseumPlaque({ def }: { def: ArtworkDef }) {
  return (
    <Html
      position={[def.width / 2 + 0.15, -(def.height / 2) + 0.3, 0.08]}
      distanceFactor={5}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{
        background: 'rgba(242,239,231,0.92)',
        border: '1px solid rgba(24,24,24,0.12)',
        padding: '6px 10px',
        width: 110,
        fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
      }}>
        <div style={{ fontSize: 9, letterSpacing: '0.14em', color: '#181818', fontWeight: 600, textTransform: 'uppercase' }}>
          {def.title}
        </div>
        <div style={{ fontSize: 8, letterSpacing: '0.08em', color: '#888', marginTop: 2 }}>
          2026
        </div>
        <div style={{ fontSize: 7.5, letterSpacing: '0.10em', color: '#aaa', marginTop: 1, textTransform: 'uppercase' }}>
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
  const [near, setNear]     = useState(false);
  const [hovered, setHovered] = useState(false);

  const frameThick = 0.10;
  const frameDepth = 0.16;
  const wallGap    = 0.06; // gap between canvas back and wall

  const tex = useMemo(() => getTexture(def.id), [def.id]);
  const fs  = FRAME_STYLES[def.id] ?? { color: 0x1a1816, roughness: 0.55, metalness: 0.05 };

  useFrame(() => {
    if (!groupRef.current) return;
    const dist = camera.position.distanceTo(groupRef.current.position);
    setNear(dist < CAM.approachDist * 2.8);
  });

  return (
    <group
      ref={groupRef}
      position={[def.position[0], def.position[1], def.position[2] + wallGap]}
      rotation={new THREE.Euler(...def.rotation)}
      onClick={() => onSelect(def)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Canvas surface */}
      <mesh receiveShadow castShadow>
        <planeGeometry args={[def.width, def.height]} />
        <meshStandardMaterial map={tex} roughness={0.88} metalness={0.0} />
      </mesh>

      {/* Backing board — slightly larger, dark */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[def.width + 0.04, def.height + 0.04, 0.04]} />
        <meshStandardMaterial color={0x0e0c0a} roughness={0.9} metalness={0.0} />
      </mesh>

      {/* Frame — top */}
      <mesh castShadow position={[0, def.height / 2 + frameThick / 2, frameDepth / 2 - 0.02]}>
        <boxGeometry args={[def.width + frameThick * 2, frameThick, frameDepth]} />
        <meshStandardMaterial {...fs} />
      </mesh>
      {/* Frame — bottom */}
      <mesh castShadow position={[0, -(def.height / 2) - frameThick / 2, frameDepth / 2 - 0.02]}>
        <boxGeometry args={[def.width + frameThick * 2, frameThick, frameDepth]} />
        <meshStandardMaterial {...fs} />
      </mesh>
      {/* Frame — left */}
      <mesh castShadow position={[-(def.width / 2) - frameThick / 2, 0, frameDepth / 2 - 0.02]}>
        <boxGeometry args={[frameThick, def.height + frameThick * 2, frameDepth]} />
        <meshStandardMaterial {...fs} />
      </mesh>
      {/* Frame — right */}
      <mesh castShadow position={[(def.width / 2) + frameThick / 2, 0, frameDepth / 2 - 0.02]}>
        <boxGeometry args={[frameThick, def.height + frameThick * 2, frameDepth]} />
        <meshStandardMaterial {...fs} />
      </mesh>

      {/* Shadow catcher behind frame */}
      <mesh position={[0, 0, -0.12]} receiveShadow>
        <planeGeometry args={[def.width + 0.8, def.height + 0.8]} />
        <meshStandardMaterial color={0xd8d1c5} roughness={1} metalness={0} transparent opacity={0.0} />
      </mesh>

      {/* Museum plaque — only when near */}
      {near && <MuseumPlaque def={def} />}

      {/* VIEW indicator */}
      {hovered && (
        <Html position={[0, 0, 0.18]} center distanceFactor={6}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            border: '1px solid rgba(24,24,24,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
            fontSize: 9, letterSpacing: '0.18em', color: '#181818',
            textTransform: 'uppercase',
            background: 'rgba(242,239,231,0.75)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}>VIEW</div>
        </Html>
      )}
    </group>
  );
}

// ─── Generative animated artwork (wall installation) ─────────────────────────
export function GenerativeArtwork({
  position,
  rotation,
  width = 3.2,
  height = 2.4,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
}) {
  const { tex, tick } = useGenerativeTexture(512, 384);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => tick(dt));

  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial map={tex} roughness={0.9} metalness={0} />
      </mesh>
      {/* Thin dark frame */}
      {(['top','bottom','left','right'] as const).map((side) => {
        const ft = 0.06, fd = 0.10;
        const pos: [number,number,number] =
          side === 'top'    ? [0,  height/2 + ft/2, fd/2-0.01] :
          side === 'bottom' ? [0, -height/2 - ft/2, fd/2-0.01] :
          side === 'left'   ? [-width/2 - ft/2, 0,  fd/2-0.01] :
                              [ width/2 + ft/2, 0,  fd/2-0.01];
        const size: [number,number,number] =
          side === 'top' || side === 'bottom'
            ? [width + ft*2, ft, fd]
            : [ft, height + ft*2, fd];
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

// ─── Typographic artwork (static) ────────────────────────────────────────────
export function TypoArtwork({
  position,
  rotation,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const tex = useMemo(() => makeTypoTexture(), []);
  const W = 2.4, H = 3.6;
  const ft = 0.08, fd = 0.12;

  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      <mesh castShadow>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial map={tex} roughness={0.88} metalness={0} />
      </mesh>
      {(['top','bottom','left','right'] as const).map((side) => {
        const pos: [number,number,number] =
          side === 'top'    ? [0,  H/2 + ft/2, fd/2-0.01] :
          side === 'bottom' ? [0, -H/2 - ft/2, fd/2-0.01] :
          side === 'left'   ? [-W/2 - ft/2, 0,  fd/2-0.01] :
                              [ W/2 + ft/2, 0,  fd/2-0.01];
        const size: [number,number,number] =
          side === 'top' || side === 'bottom'
            ? [W + ft*2, ft, fd]
            : [ft, H + ft*2, fd];
        return (
          <mesh key={side} castShadow position={pos}>
            <boxGeometry args={size} />
            <meshStandardMaterial color={0x1a1816} roughness={0.6} metalness={0.08} />
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
      {ARTWORKS.map((def) => (
        <ArtworkFrame key={def.id} def={def} onSelect={onSelect} />
      ))}
    </>
  );
}
