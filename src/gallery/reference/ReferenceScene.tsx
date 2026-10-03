/**
 * ReferenceScene.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ONE static architectural hero frame.
 * Camera is fixed. No scroll. No UI. No projects. No text.
 *
 * WORLD COORDINATE SYSTEM
 * ───────────────────────
 *   +X  right
 *   +Y  up
 *   -Z  into scene (depth)
 *   Y=0 floor
 *
 * COMPOSITION LAYERS
 * ──────────────────
 *   FOREGROUND  Z = +4 .. +8   Massive arch, left-cropped
 *   MIDGROUND   Z = -2 .. -14  Atrium floor, staircase, curved wall, column
 *   BACKGROUND  Z = -18 .. -32 Second opening, far wall, burgundy artwork
 *
 * CAMERA
 * ──────
 *   position  [-8, 3.2, 11]
 *   lookAt    [0, 3, -6]
 *   FOV       38°
 */

import { useMemo }                   from 'react';
import { Canvas }                    from '@react-three/fiber';
import { RectAreaLightUniformsLib }  from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import * as THREE                    from 'three';

RectAreaLightUniformsLib.init();

// ─── Material palette ─────────────────────────────────────────────────────────

const C = {
  plaster:  0xEAE3D8,   // warm mineral plaster
  floor:    0xCFC5B7,   // warm limestone
  burgundy: 0x6F1028,   // deep burgundy accent
  bg:       '#E8E1D6',  // scene background / fog colour
} as const;

function plasterMat(darken = 0, roughness = 0.87) {
  const col = new THREE.Color(C.plaster);
  if (darken) col.multiplyScalar(1 - darken);
  return new THREE.MeshStandardMaterial({ color: col, roughness, metalness: 0 });
}

function floorMat() {
  // Subtle procedural roughness variation — no repeating tile pattern
  const mat = new THREE.MeshStandardMaterial({
    color:     new THREE.Color(C.floor),
    roughness: 0.72,
    metalness: 0,
  });
  const SZ = 512;
  const cv = document.createElement('canvas');
  cv.width = cv.height = SZ;
  const ctx = cv.getContext('2d')!;
  ctx.fillStyle = '#b8b0a8';
  ctx.fillRect(0, 0, SZ, SZ);
  for (let i = 0; i < SZ * SZ * 0.18; i++) {
    const v = 160 + Math.floor(Math.random() * 24);
    ctx.fillStyle = `rgb(${v},${v-2},${v-4})`;
    ctx.fillRect(Math.random() * SZ | 0, Math.random() * SZ | 0, 2, 2);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  mat.roughnessMap = tex;
  return mat;
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

/** Arch wall: outer rectangle with elliptical-crown hole */
function makeArchGeo(
  wallW: number, wallH: number, depth: number,
  openW: number, springY: number, crownRY: number,
  seg = 72,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-wallW / 2, 0);
  shape.lineTo( wallW / 2, 0);
  shape.lineTo( wallW / 2, wallH);
  shape.lineTo(-wallW / 2, wallH);
  shape.closePath();

  const rx = openW / 2;
  const hole = new THREE.Path();
  hole.moveTo(-rx, 0);
  hole.lineTo(-rx, springY);
  for (let i = 1; i <= seg; i++) {
    const θ = Math.PI * (1 - i / seg);
    hole.lineTo(Math.cos(θ) * rx, springY + Math.sin(θ) * crownRY);
  }
  hole.lineTo(rx, 0);
  hole.closePath();
  shape.holes.push(hole);

  return new THREE.ExtrudeGeometry(shape, {
    depth, bevelEnabled: true,
    bevelThickness: 0.06, bevelSize: 0.045, bevelSegments: 4,
    curveSegments: seg,
  });
}

/** Curved wall: arc cross-section extruded vertically */
function makeCurvedWallGeo(
  radius: number, height: number, thickness: number,
  arcStart: number, arcEnd: number, seg = 48,
): THREE.ExtrudeGeometry {
  const inner = radius - thickness / 2;
  const outer = radius + thickness / 2;
  const shape = new THREE.Shape();

  shape.moveTo(Math.cos(arcStart) * outer, Math.sin(arcStart) * outer);
  for (let i = 1; i <= seg; i++) {
    const a = arcStart + (arcEnd - arcStart) * (i / seg);
    shape.lineTo(Math.cos(a) * outer, Math.sin(a) * outer);
  }
  for (let i = seg; i >= 0; i--) {
    const a = arcStart + (arcEnd - arcStart) * (i / seg);
    shape.lineTo(Math.cos(a) * inner, Math.sin(a) * inner);
  }
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: height, bevelEnabled: false, curveSegments: 1,
  });
}

/** Staircase: solid wedge underside + individual step blocks */
function makeStaircaseGeo(steps: number, totalRise: number, totalDepth: number, width: number) {
  const rise  = totalRise  / steps;
  const depth = totalDepth / steps;

  // Solid wedge underside
  const wedgeShape = new THREE.Shape();
  wedgeShape.moveTo(0, 0);
  wedgeShape.lineTo(totalDepth, 0);
  wedgeShape.lineTo(totalDepth, totalRise);
  wedgeShape.closePath();
  const wedge = new THREE.ExtrudeGeometry(wedgeShape, { depth: width, bevelEnabled: false });

  // Step blocks (height = cumulative rise from floor)
  const stepGeos = Array.from({ length: steps }, (_, i) =>
    new THREE.BoxGeometry(width, (i + 1) * rise, depth)
  );

  return { wedge, stepGeos, rise, depth };
}

// ─── Scene components ─────────────────────────────────────────────────────────

/** FOREGROUND — massive arch, left-cropped */
function ForegroundArch() {
  // Wall: 11 × 11.5, depth 1.8, opening 7.2 wide, spring 5.2, crown ry 2.8
  const geo = useMemo(() => makeArchGeo(11, 11.5, 1.8, 7.2, 5.2, 2.8), []);
  const mat = useMemo(() => plasterMat(0, 0.88), []);

  // Positioned so only the LEFT ~25% of the arch is in frame.
  // Camera is at X=-8, arch centre at X=-4 → left leg at X=-9.5 (off-screen left)
  // Right leg at X=+1.5 (visible in frame)
  // Z=6 puts it in the foreground, close to camera at Z=11
  return (
    <mesh castShadow receiveShadow geometry={geo}
      position={[-4, 0, 6 - 1.8 / 2]}
    >
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** FLOOR — large limestone plane */
function Floor() {
  const mat = useMemo(() => floorMat(), []);
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -12]}>
      <planeGeometry args={[32, 50]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** LEFT WALL — thick, stepped profile */
function LeftWall() {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(1.6, 0);
    s.lineTo(1.6, 7.0); s.lineTo(1.1, 7.0);
    s.lineTo(1.1, 10.5); s.lineTo(0, 10.5);
    s.closePath();
    return new THREE.ExtrudeGeometry(s, { depth: 46, bevelEnabled: false });
  }, []);
  const mat = useMemo(() => plasterMat(0, 0.88), []);
  return (
    <mesh castShadow receiveShadow geometry={geo}
      position={[-12, 0, 8]} rotation={[0, -Math.PI / 2, 0]}
    >
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** RIGHT WALL — thinner, recedes into background */
function RightWall() {
  const mat = useMemo(() => plasterMat(0.02, 0.86), []);
  return (
    <mesh castShadow receiveShadow position={[11, 5.25, -12]}>
      <boxGeometry args={[1.4, 10.5, 46]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** CEILING */
function Ceiling() {
  const mat = useMemo(() => plasterMat(0.03, 0.90), []);
  // Skylight void — emissive bright opening
  const emMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xFFF8F0,
    emissive: new THREE.Color(0xFFF8F0),
    emissiveIntensity: 0.65,
    roughness: 1,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 10.5, -12]}>
        <planeGeometry args={[24, 46]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Skylight — upper left, source of the diagonal sunbeam */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[-3, 10.45, -4]}>
        <planeGeometry args={[6, 8]} />
        <primitive object={emMat} attach="material" />
      </mesh>
      {/* Second skylight — midground */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[2, 10.45, -16]}>
        <planeGeometry args={[5, 7]} />
        <primitive object={emMat} attach="material" />
      </mesh>
    </group>
  );
}

/** SCULPTURAL STAIRCASE — wide, gently curving trajectory */
function Staircase() {
  const STEPS = 18;
  const TOTAL_RISE  = 4.2;
  const TOTAL_DEPTH = 9.0;
  const WIDTH = 6.5;
  // Positioned right-of-centre, Z=-2 to Z=-11
  const CX = 4.5;
  const START_Z = -2.0;

  const { wedge, stepGeos, rise, depth } = useMemo(
    () => makeStaircaseGeo(STEPS, TOTAL_RISE, TOTAL_DEPTH, WIDTH),
    []
  );
  const mat = useMemo(() => plasterMat(0.04, 0.82), []);

  return (
    <group>
      {/* Solid wedge underside */}
      <mesh castShadow receiveShadow geometry={wedge}
        position={[CX - WIDTH / 2, 0, START_Z]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Step treads */}
      {stepGeos.map((geo, i) => (
        <mesh key={i} castShadow receiveShadow geometry={geo}
          position={[CX, (i + 1) * rise / 2, START_Z - i * depth - depth / 2]}
        >
          <primitive object={mat} attach="material" />
        </mesh>
      ))}

      {/* Upper landing slab */}
      <mesh castShadow receiveShadow
        position={[CX, TOTAL_RISE + 0.12, START_Z - TOTAL_DEPTH - 2.5]}
      >
        <boxGeometry args={[WIDTH + 1.5, 0.22, 5]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

/** LARGE CURVED WALL — guides eye toward background opening */
function CurvedWall() {
  // Arc: radius 10, height 8.5, thickness 1.2
  // Arc from ~160° to ~290° (sweeps behind staircase, opens toward right)
  const geo = useMemo(() =>
    makeCurvedWallGeo(10, 8.5, 1.2, Math.PI * 0.88, Math.PI * 1.62, 52),
  []);
  const mat = useMemo(() => plasterMat(0.01, 0.86), []);

  return (
    <mesh castShadow receiveShadow geometry={geo}
      position={[2, 0, -10]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** LARGE COLUMN — left of staircase, creates vertical rhythm */
function Column() {
  const mat = useMemo(() => plasterMat(0.02, 0.85), []);
  // Octagonal column via LatheGeometry
  const geo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.55, 0),
      new THREE.Vector2(0.58, 0.15),
      new THREE.Vector2(0.58, 9.2),
      new THREE.Vector2(0.55, 9.4),
      new THREE.Vector2(0.52, 9.5),
    ];
    return new THREE.LatheGeometry(pts, 8);
  }, []);

  return (
    <mesh castShadow receiveShadow geometry={geo} position={[0.5, 0, -3]}>
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** LEVEL CHANGE — raised platform in midground */
function Platform() {
  const mat = useMemo(() => plasterMat(0.05, 0.80), []);
  return (
    <group>
      {/* Platform slab */}
      <mesh receiveShadow position={[-3, 0.55, -10]}>
        <boxGeometry args={[8, 1.1, 6]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Step up */}
      <mesh castShadow receiveShadow position={[-3, 0.28, -6.8]}>
        <boxGeometry args={[8, 0.55, 0.5]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

/** BACKGROUND ARCH OPENING — second space visible through it */
function BackgroundOpening() {
  // Arch wall at Z=-20, opening 5.5 wide, spring 4.0, crown ry 2.2
  const geo = useMemo(() => makeArchGeo(14, 10.5, 1.4, 5.5, 4.0, 2.2, 64), []);
  const mat = useMemo(() => plasterMat(0.06, 0.88), []);

  return (
    <mesh castShadow receiveShadow geometry={geo}
      position={[0, 0, -20 - 1.4 / 2]}
    >
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** FAR WALL — visible through background arch */
function FarWall() {
  const mat = useMemo(() => plasterMat(0.08, 0.90), []);
  return (
    <mesh receiveShadow position={[0, 5.25, -30]}>
      <boxGeometry args={[18, 10.5, 1.2]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** BACKGROUND FLOOR — extends into far space */
function BackgroundFloor() {
  const mat = useMemo(() => floorMat(), []);
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -26]}>
      <planeGeometry args={[14, 12]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** BURGUNDY ARTWORK — single vertical panel in background, ~8% of viewport */
function BurgundyArtwork() {
  const mat = useMemo(() => {
    // Simple canvas: deep burgundy with subtle vertical gradient
    const W = 512, H = 768;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d')!;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#7A1030');
    g.addColorStop(0.5, '#5C0820');
    g.addColorStop(1, '#3E0415');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // Subtle horizontal lines
    ctx.strokeStyle = 'rgba(255,220,200,0.06)';
    ctx.lineWidth = 1;
    for (let y = 40; y < H; y += 38) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(cv);
    return new THREE.MeshStandardMaterial({
      map: tex, roughness: 0.88, metalness: 0,
    });
  }, []);

  return (
    // Centred in the background arch opening, slightly right of centre
    <mesh receiveShadow position={[1.2, 4.2, -29.2]}>
      <planeGeometry args={[2.2, 3.3]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/** LIGHTING */
function Lighting() {
  return (
    <>
      {/* Warm sky / cool ground — restrained, not flat */}
      <hemisphereLight args={[0xFFF0DC, 0xC8BFB2, 0.55]} />

      {/* PRIMARY SUNLIGHT — upper left, creates diagonal floor patch + stair shadows */}
      <directionalLight
        color={0xFFF6E8}
        intensity={1.55}
        position={[-12, 22, 16]}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={80}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0003}
        shadow-normalBias={0.018}
        shadow-radius={6}
      />

      {/* Soft cool fill — prevents pure-black shadows, reads as sky bounce */}
      <directionalLight
        color={0xDDE8FF}
        intensity={0.22}
        position={[10, 6, -8]}
        castShadow={false}
      />

      {/* RectAreaLight — simulates skylight above foreground arch */}
      <rectAreaLight
        position={[-3, 10, 2]}
        rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
        color={0xFFFAF0}
        intensity={8}
        width={8}
        height={6}
      />

      {/* RectAreaLight — illuminates background arch opening */}
      <rectAreaLight
        position={[0, 7, -18]}
        rotation={new THREE.Euler(0, 0, 0)}
        color={0xFFF8F0}
        intensity={10}
        width={7}
        height={8}
      />

      {/* RectAreaLight — warm fill on curved wall */}
      <rectAreaLight
        position={[8, 5, -8]}
        rotation={new THREE.Euler(0, Math.PI * 0.75, 0)}
        color={0xFFF5E8}
        intensity={6}
        width={6}
        height={7}
      />
    </>
  );
}

// ─── Main scene ───────────────────────────────────────────────────────────────

function Scene() {
  return (
    <>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 35, 70]} />

      <Lighting />

      {/* FOREGROUND */}
      <ForegroundArch />

      {/* MIDGROUND */}
      <Floor />
      <LeftWall />
      <RightWall />
      <Ceiling />
      <Staircase />
      <CurvedWall />
      <Column />
      <Platform />

      {/* BACKGROUND */}
      <BackgroundOpening />
      <FarWall />
      <BackgroundFloor />
      <BurgundyArtwork />
    </>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function ReferenceScene() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{
          antialias:           true,
          alpha:               false,
          powerPreference:     'high-performance',
          toneMapping:         THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        camera={{
          fov:      38,
          near:     0.3,
          far:      120,
          position: [-8, 3.2, 11],
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 3, -6);
        }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
