/**
 * HeroArch.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Monumental contemporary gallery arch.
 *
 * GEOMETRY STRATEGY
 * ─────────────────
 * One single ExtrudeGeometry built from a THREE.Shape with one hole.
 *
 *   Shape  = outer wall rectangle  (9 × 10)
 *   Hole   = opening profile       (6.3 wide, straight legs to Y=4.8,
 *                                   then an elliptical crown rx=3.15 ry=2.6)
 *
 * ExtrudeGeometry extrudes this 2-D profile along +Z by 1.4 units.
 * The result is a single mesh that has:
 *   • front face  (the 2-D shape, facing -Z)
 *   • back face   (facing +Z)
 *   • outer side walls
 *   • inner reveal walls  ← the curved tunnel surface, part of the extrusion
 *
 * NO separate tube.  NO separate reveal mesh.
 * The inner reveal is the extrusion side geometry of the hole.
 *
 * ORIGIN
 * ──────
 * Group origin = ground-centre of the arch.
 * Y = 0 → floor.
 * X = 0 → horizontal centre.
 * Z = 0 → front face of arch.
 * Front faces +Z (camera approaches from +Z).
 *
 * MATERIAL
 * ────────
 * Single MeshStandardMaterial, warm ivory plaster.
 * Procedural roughness map (256 px canvas noise) breaks up the flat look
 * under grazing light without any visible pattern.
 */

import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame }          from '@react-three/fiber';
import { RectAreaLightUniformsLib }  from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import * as THREE                    from 'three';

RectAreaLightUniformsLib.init();

// ─── Constants ────────────────────────────────────────────────────────────────

const WALL_W   = 9.0;   // outer width
const WALL_H   = 10.0;  // outer height
const DEPTH    = 1.4;   // extrusion depth (wall thickness)

const OPEN_W   = 6.3;   // opening width
const SPRING_Y = 4.8;   // height at which straight legs transition to curve
const CROWN_RX = OPEN_W / 2;   // 3.15 — ellipse horizontal semi-axis
const CROWN_RY = 2.6;           // ellipse vertical semi-axis
                                 // crown apex = SPRING_Y + CROWN_RY = 7.4

const CURVE_SEG = 72;   // ellipse arc segments — no visible faceting

// ─── Geometry builder ─────────────────────────────────────────────────────────

function buildArchGeo(): THREE.ExtrudeGeometry {
  // ── Outer silhouette ────────────────────────────────────────────────────
  // Simple rectangle.  The arch character comes entirely from the hole.
  const shape = new THREE.Shape();
  shape.moveTo(-WALL_W / 2, 0);
  shape.lineTo( WALL_W / 2, 0);
  shape.lineTo( WALL_W / 2, WALL_H);
  shape.lineTo(-WALL_W / 2, WALL_H);
  shape.closePath();

  // ── Opening hole ────────────────────────────────────────────────────────
  // Path: bottom-left → up left leg → ellipse crown (left→right) → down right leg → close
  //
  // The ellipse is parameterised as:
  //   x(θ) = cos(θ) * CROWN_RX
  //   y(θ) = SPRING_Y + sin(θ) * CROWN_RY
  // θ goes from π (left side, sin=0) through π/2 (apex, sin=1) to 0 (right side, sin=0).
  // This traces the upper half of the ellipse left-to-right.

  const hole = new THREE.Path();

  // Bottom-left corner of opening
  hole.moveTo(-CROWN_RX, 0);

  // Left vertical leg
  hole.lineTo(-CROWN_RX, SPRING_Y);

  // Elliptical crown — θ: π → 0
  for (let i = 1; i <= CURVE_SEG; i++) {
    const theta = Math.PI * (1 - i / CURVE_SEG);   // π → 0
    const x = Math.cos(theta) * CROWN_RX;
    const y = SPRING_Y + Math.sin(theta) * CROWN_RY;
    hole.lineTo(x, y);
  }

  // Right vertical leg (we are now at CROWN_RX, SPRING_Y after the loop)
  hole.lineTo(CROWN_RX, 0);

  // Close back to bottom-left
  hole.closePath();

  shape.holes.push(hole);

  // ── Extrude ─────────────────────────────────────────────────────────────
  return new THREE.ExtrudeGeometry(shape, {
    depth:          DEPTH,
    bevelEnabled:   true,
    bevelThickness: 0.055,   // catches highlights, not visibly rounded
    bevelSize:      0.042,
    bevelSegments:  4,
    curveSegments:  CURVE_SEG,
  });
}

// ─── Plaster material ─────────────────────────────────────────────────────────

function buildPlasterMat(): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color:     new THREE.Color('#EEE9DF'),
    roughness: 0.87,
    metalness: 0,
    side:      THREE.FrontSide,
  });

  // Procedural roughness map — 256 px canvas with scattered noise.
  // Breaks up the perfectly flat look under grazing light.
  // No visible pattern at normal viewing distances.
  const SZ  = 256;
  const cv  = document.createElement('canvas');
  cv.width  = SZ;
  cv.height = SZ;
  const ctx = cv.getContext('2d')!;

  // Mid-grey base (roughness map: 0.5 = neutral multiplier)
  ctx.fillStyle = '#828282';
  ctx.fillRect(0, 0, SZ, SZ);

  // Sparse noise pixels — 30% coverage, very narrow value range
  for (let i = 0; i < SZ * SZ * 0.30; i++) {
    const px = Math.floor(Math.random() * SZ);
    const py = Math.floor(Math.random() * SZ);
    const v  = 120 + Math.floor(Math.random() * 18);   // 120–138
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(px, py, 1, 1);
  }

  const tex        = new THREE.CanvasTexture(cv);
  tex.wrapS        = THREE.RepeatWrapping;
  tex.wrapT        = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  mat.roughnessMap = tex;

  return mat;
}

// ─── HeroArch component ───────────────────────────────────────────────────────

export interface HeroArchProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?:    number;
}

export default function HeroArch({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale    = 1,
}: HeroArchProps) {
  const geo = useMemo(() => buildArchGeo(), []);
  const mat = useMemo(() => buildPlasterMat(), []);

  // ExtrudeGeometry places the shape origin at (0,0) in the 2-D plane,
  // which maps to (0,0,0) in 3-D, and extrudes toward +Z.
  //
  // Our shape was drawn with X centred on 0 and Y starting at 0.
  // So the mesh already has:
  //   X: centred on 0  ✓
  //   Y: 0 = floor     ✓
  //   Z: 0 = front face, DEPTH = back face
  //
  // We shift Z by -DEPTH/2 so the arch is centred on Z=0 (front at -0.7, back at +0.7).
  // This makes the component's origin sit at the mid-depth of the wall,
  // which is more natural for placement in the scene.

  return (
    <group
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <mesh
        castShadow
        receiveShadow
        geometry={geo}
        position={[0, 0, -DEPTH / 2]}
      >
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Preview scene ────────────────────────────────────────────────────────────
// Self-contained inspection environment.
// Mount via PREVIEW_ARCH = true in App.tsx.
// Contains NO lights, ground, or camera that would ship to production.

const VIEWS = [
  {
    label: 'Frontal',
    pos:   [-1.5, 2.2, 12.0] as [number, number, number],
    look:  [ 0.0, 4.5,  0.0] as [number, number, number],
    desc:  'Straight-on. Verify opening curve and outer silhouette.',
  },
  {
    label: 'Cinematic 45°',
    pos:   [-5.5, 2.4,  9.0] as [number, number, number],
    look:  [ 0.5, 4.2,  0.0] as [number, number, number],
    desc:  'Near leg creates foreground depth. Opening reveals space behind.',
  },
  {
    label: 'Inner reveal',
    pos:   [-0.5, 2.2,  0.5] as [number, number, number],
    look:  [ 0.0, 5.0, -4.0] as [number, number, number],
    desc:  'Camera inside the tunnel. Verify 1.4 m depth is visible.',
  },
  {
    label: 'Eye level',
    pos:   [ 0.0, 1.7,  8.5] as [number, number, number],
    look:  [ 0.0, 4.8,  0.0] as [number, number, number],
    desc:  'Human eye level. Arch should feel monumental.',
  },
] as const;

function PreviewScene({ viewIdx }: { viewIdx: number }) {
  const v = VIEWS[viewIdx];

  useFrame(({ camera }) => {
    const targetPos  = new THREE.Vector3(...v.pos);
    const targetLook = new THREE.Vector3(...v.look);

    camera.position.lerp(targetPos, 0.055);

    // Smoothly rotate toward look target
    const dir = targetLook.clone().sub(camera.position).normalize();
    const currentDir = new THREE.Vector3();
    camera.getWorldDirection(currentDir);
    currentDir.lerp(dir, 0.055).normalize();
    camera.lookAt(camera.position.clone().addScaledVector(currentDir, 10));
  });

  return (
    <>
      <color attach="background" args={['#EDE8DF']} />

      {/* Warm sky / cool ground */}
      <hemisphereLight args={[0xFFF5E8, 0xD4CCC0, 0.82]} />

      {/* Primary directional — upper left/front, casts shadow */}
      <directionalLight
        color={0xFFF8EE}
        intensity={1.45}
        position={[9, 20, 14]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={55}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
        shadow-normalBias={0.022}
        shadow-radius={5}
      />

      {/* Soft cool fill from opposite side — prevents pure-black shadows */}
      <directionalLight
        color={0xECF0FF}
        intensity={0.25}
        position={[-6, 8, -8]}
        castShadow={false}
      />

      {/* Large RectAreaLight — soft frontal fill, simulates gallery skylight */}
      <rectAreaLight
        position={[0, 7, 11]}
        rotation={new THREE.Euler(0, Math.PI, 0)}
        color={0xFFFAF2}
        intensity={7}
        width={14}
        height={12}
      />

      {/* Ground plane */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#CEC6B8" roughness={0.74} metalness={0} />
      </mesh>

      {/* THE ARCH */}
      <HeroArch position={[0, 0, 0]} />
    </>
  );
}

export function ArchPreview() {
  const [viewIdx, setViewIdx] = useState(0);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#EDE8DF' }}>
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{
          antialias:            true,
          toneMapping:          THREE.ACESFilmicToneMapping,
          toneMappingExposure:  0.95,
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        camera={{ fov: 52, near: 0.1, far: 120, position: VIEWS[0].pos }}
      >
        <PreviewScene viewIdx={viewIdx} />
      </Canvas>

      {/* View switcher */}
      <div style={{
        position:  'absolute',
        bottom:    '2.5rem',
        left:      '50%',
        transform: 'translateX(-50%)',
        display:   'flex',
        gap:       '0.6rem',
      }}>
        {VIEWS.map((v, i) => (
          <button
            key={v.label}
            onClick={() => setViewIdx(i)}
            style={{
              fontFamily:    '"Helvetica Neue", Inter, Arial, sans-serif',
              fontSize:      10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding:       '0.5rem 1.1rem',
              background:    i === viewIdx ? 'rgba(24,23,22,0.82)' : 'rgba(24,23,22,0.07)',
              color:         i === viewIdx ? '#EEE9DF' : 'rgba(24,23,22,0.50)',
              border:        'none',
              cursor:        'pointer',
              transition:    'background 0.2s, color 0.2s',
            }}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* View label + description */}
      <div style={{
        position:      'absolute',
        top:           '2rem',
        left:          '2.5rem',
        fontFamily:    '"Helvetica Neue", Inter, Arial, sans-serif',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontSize:      10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color:         'rgba(24,23,22,0.32)',
          marginBottom:  '0.4rem',
        }}>
          HERO ARCH — {VIEWS[viewIdx].label}
        </div>
        <div style={{
          fontSize:      11,
          color:         'rgba(24,23,22,0.45)',
          maxWidth:      320,
          lineHeight:    1.6,
        }}>
          {VIEWS[viewIdx].desc}
        </div>
      </div>
    </div>
  );
}
