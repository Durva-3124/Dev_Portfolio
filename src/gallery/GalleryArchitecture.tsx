import { useMemo } from 'react';
import * as THREE from 'three';
import { CH } from './constants';

// ─── Shared materials ─────────────────────────────────────────────────────────
function useMats() {
  return useMemo(() => ({
    wall: new THREE.MeshStandardMaterial({
      color: CH.wall, roughness: 0.88, metalness: 0.0,
    }),
    wallLight: new THREE.MeshStandardMaterial({
      color: CH.wallLight, roughness: 0.92, metalness: 0.0,
    }),
    floor: new THREE.MeshStandardMaterial({
      color: CH.floor, roughness: 0.55, metalness: 0.0,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      color: CH.ceiling, roughness: 0.95, metalness: 0.0,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: CH.dark, roughness: 0.7, metalness: 0.1,
    }),
    frame: new THREE.MeshStandardMaterial({
      color: CH.frame, roughness: 0.55, metalness: 0.05,
    }),
    stair: new THREE.MeshStandardMaterial({
      color: CH.floor, roughness: 0.65, metalness: 0.0,
    }),
    railing: new THREE.MeshStandardMaterial({
      color: CH.dark, roughness: 0.4, metalness: 0.6,
    }),
  }), []);
}

// ─── Thick arch opening ───────────────────────────────────────────────────────
// Creates a rectangular opening with thick reveals (depth = wall thickness).
// The opening itself is empty — geometry is the surrounding wall panels.
function ThickArch({
  wallW, wallH, wallD,
  openW, openH,
  mat,
  position,
  rotation,
}: {
  wallW: number; wallH: number; wallD: number;
  openW: number; openH: number;
  mat: THREE.MeshStandardMaterial;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const sideW = (wallW - openW) / 2;
  return (
    <group
      position={position}
      rotation={rotation ? new THREE.Euler(...rotation) : undefined}
    >
      {/* Left panel */}
      <mesh castShadow receiveShadow position={[-(openW / 2 + sideW / 2), wallH / 2, 0]}>
        <boxGeometry args={[sideW, wallH, wallD]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Right panel */}
      <mesh castShadow receiveShadow position={[(openW / 2 + sideW / 2), wallH / 2, 0]}>
        <boxGeometry args={[sideW, wallH, wallD]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Lintel */}
      <mesh castShadow receiveShadow position={[0, openH + (wallH - openH) / 2, 0]}>
        <boxGeometry args={[openW, wallH - openH, wallD]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Soffit inside opening */}
      <mesh receiveShadow position={[0, openH - 0.01, 0]}>
        <boxGeometry args={[openW, 0.02, wallD]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Entrance vestibule ───────────────────────────────────────────────────────
// Narrow, lower-ceilinged entry that compresses before opening into main gallery
function EntranceVestibule({ m }: { m: ReturnType<typeof useMats> }) {
  // 12 wide × 5 tall × 16 deep, centred at Z=22
  const W = 12, H = 5, D = 16, CZ = 22;
  const hw = W / 2, hd = D / 2;
  const T = 1.2; // thick walls

  return (
    <group position={[0, 0, CZ]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.floor} attach="material" />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.ceiling} attach="material" />
      </mesh>
      {/* Back wall */}
      <mesh castShadow receiveShadow position={[0, H / 2, hd]}>
        <boxGeometry args={[W, H, T]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Left wall */}
      <mesh castShadow receiveShadow position={[-hw, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Right wall */}
      <mesh castShadow receiveShadow position={[hw, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Front wall with arch opening into main gallery */}
      <ThickArch
        wallW={W} wallH={H} wallD={T}
        openW={5.5} openH={4.2}
        mat={m.wall}
        position={[0, 0, -hd]}
      />
    </group>
  );
}

// ─── Main gallery — ground floor ──────────────────────────────────────────────
// Tall, wide, asymmetric. Left wall has two large artworks. Right side opens
// toward staircase. Back wall has a large arch into the upper stair hall.
function MainGalleryGround({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 20, H = 9, D = 32, CZ = -2;
  const hw = W / 2, hd = D / 2;
  const T = 1.0;

  return (
    <group position={[0, 0, CZ]}>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.floor} attach="material" />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.ceiling} attach="material" />
      </mesh>
      {/* Left wall — full, artwork hangs here */}
      <mesh castShadow receiveShadow position={[-hw, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Right wall — full */}
      <mesh castShadow receiveShadow position={[hw, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* South wall — connects to vestibule (open, no geometry needed — vestibule front wall handles it) */}
      {/* North wall — large arch opening toward stair hall */}
      <ThickArch
        wallW={W} wallH={H} wallD={T}
        openW={7} openH={7}
        mat={m.wall}
        position={[0, 0, -hd]}
      />
      {/* Baseboard left */}
      <mesh position={[-hw + T / 2 + 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.dark} attach="material" />
      </mesh>
      {/* Baseboard right */}
      <mesh position={[hw - T / 2 - 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.dark} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Stair hall — the space containing the monumental staircase ───────────────
function StairHall({ m }: { m: ReturnType<typeof useMats> }) {
  // Wider, taller space. Stair occupies right-centre.
  const W = 22, H = 12, D = 20, CZ = -24;
  const hw = W / 2, hd = D / 2;
  const T = 1.0;

  return (
    <group position={[0, 0, CZ]}>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.floor} attach="material" />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.ceiling} attach="material" />
      </mesh>
      {/* Left wall */}
      <mesh castShadow receiveShadow position={[-hw, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Right wall */}
      <mesh castShadow receiveShadow position={[hw, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Back wall — solid, large surface */}
      <mesh castShadow receiveShadow position={[0, H / 2, -hd]}>
        <boxGeometry args={[W, H, T]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* South wall — arch opening from main gallery (matches north arch) */}
      <ThickArch
        wallW={W} wallH={H} wallD={T}
        openW={7} openH={7}
        mat={m.wall}
        position={[0, 0, hd]}
      />
    </group>
  );
}

// ─── Monumental staircase ─────────────────────────────────────────────────────
// 16 steps, 7 wide, rising from Y=0 at Z=-14 to Y=2.88 at Z=-19.12
// Then a landing, then 16 more steps to upper floor at Y=5.20
const STEP_W   = 7.5;
const STEP_H   = 0.18;
const STEP_D   = 0.32;
const STEPS_1  = 16;  // first flight
const STEPS_2  = 16;  // second flight
const STAIR_X  = 3;   // offset from centre

function StaircaseFlight({
  startX, startY, startZ,
  steps, stepW, stepH, stepD,
  m,
}: {
  startX: number; startY: number; startZ: number;
  steps: number; stepW: number; stepH: number; stepD: number;
  m: ReturnType<typeof useMats>;
}) {
  return (
    <group>
      {Array.from({ length: steps }, (_, i) => {
        const y = startY + i * stepH + stepH / 2;
        const z = startZ - i * stepD - stepD / 2;
        return (
          <group key={i}>
            {/* Tread */}
            <mesh castShadow receiveShadow position={[startX, y, z]}>
              <boxGeometry args={[stepW, stepH * 0.5, stepD + 0.01]} />
              <primitive object={m.stair} attach="material" />
            </mesh>
            {/* Riser */}
            <mesh castShadow position={[startX, y - stepH * 0.25, z + stepD / 2]}>
              <boxGeometry args={[stepW, stepH * 0.5, 0.03]} />
              <primitive object={m.wall} attach="material" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function MonumentalStaircase({ m }: { m: ReturnType<typeof useMats> }) {
  // Flight 1: Z=-14 → Z=-19.12, Y=0 → Y=2.88
  const f1StartZ = -14;
  const f1EndZ   = f1StartZ - STEPS_1 * STEP_D;  // -19.12
  const f1EndY   = STEPS_1 * STEP_H;              // 2.88

  // Landing: Z=-19.12 → Z=-21, Y=2.88
  const landingZ  = f1EndZ;
  const landingY  = f1EndY;
  const landingD  = 2.0;

  // Flight 2: Z=-21 → Z=-26.12, Y=2.88 → Y=5.76 (we cap at 5.20)
  const f2StartZ = landingZ - landingD;
  const f2StartY = landingY;

  // Stringer (solid side wall under stair — left side)
  const totalD1 = STEPS_1 * STEP_D;
  const totalD2 = STEPS_2 * STEP_D;

  return (
    <group>
      {/* Flight 1 */}
      <StaircaseFlight
        startX={STAIR_X} startY={0} startZ={f1StartZ}
        steps={STEPS_1} stepW={STEP_W} stepH={STEP_H} stepD={STEP_D}
        m={m}
      />

      {/* Landing */}
      <mesh castShadow receiveShadow
        position={[STAIR_X, landingY + STEP_H / 4, landingZ - landingD / 2]}>
        <boxGeometry args={[STEP_W, STEP_H / 2, landingD]} />
        <primitive object={m.stair} attach="material" />
      </mesh>

      {/* Flight 2 */}
      <StaircaseFlight
        startX={STAIR_X} startY={f2StartY} startZ={f2StartZ}
        steps={STEPS_2} stepW={STEP_W} stepH={STEP_H} stepD={STEP_D}
        m={m}
      />

      {/* Left stringer — solid wall under flight 1 */}
      <mesh castShadow receiveShadow
        position={[STAIR_X - STEP_W / 2 + 0.15, f1EndY / 2, f1StartZ - totalD1 / 2]}>
        <boxGeometry args={[0.3, f1EndY + 0.3, totalD1 + 0.1]} />
        <primitive object={m.wall} attach="material" />
      </mesh>

      {/* Left stringer — flight 2 */}
      <mesh castShadow receiveShadow
        position={[STAIR_X - STEP_W / 2 + 0.15, f2StartY + STEPS_2 * STEP_H / 2, f2StartZ - totalD2 / 2]}>
        <boxGeometry args={[0.3, STEPS_2 * STEP_H + 0.3, totalD2 + 0.1]} />
        <primitive object={m.wall} attach="material" />
      </mesh>

      {/* Handrail — flight 1 */}
      <mesh castShadow
        position={[STAIR_X + STEP_W / 2 - 0.1, f1EndY / 2 + 1.0, f1StartZ - totalD1 / 2]}
        rotation={[0, 0, Math.atan2(f1EndY, totalD1)]}>
        <boxGeometry args={[0.05, 0.05, Math.sqrt(totalD1 ** 2 + f1EndY ** 2) + 0.5]} />
        <primitive object={m.railing} attach="material" />
      </mesh>

      {/* Handrail — flight 2 */}
      <mesh castShadow
        position={[STAIR_X + STEP_W / 2 - 0.1, f2StartY + STEPS_2 * STEP_H / 2 + 1.0, f2StartZ - totalD2 / 2]}
        rotation={[0, 0, Math.atan2(STEPS_2 * STEP_H, totalD2)]}>
        <boxGeometry args={[0.05, 0.05, Math.sqrt(totalD2 ** 2 + (STEPS_2 * STEP_H) ** 2) + 0.5]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Upper gallery ────────────────────────────────────────────────────────────
// Floor at Y=5.20, extends from Z=-26 to Z=-46
function UpperGallery({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 18, H = 6, D = 22, CZ = -35;
  const hw = W / 2, hd = D / 2;
  const T = 1.0;
  const FLOOR_Y = 5.20;

  return (
    <group position={[0, FLOOR_Y, CZ]}>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.floor} attach="material" />
      </mesh>
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.ceiling} attach="material" />
      </mesh>
      {/* Left wall */}
      <mesh castShadow receiveShadow position={[-hw, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Right wall */}
      <mesh castShadow receiveShadow position={[hw, H / 2, 0]}>
        <boxGeometry args={[T, H, D]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Back wall — featured artwork hangs here */}
      <mesh castShadow receiveShadow position={[0, H / 2, -hd]}>
        <boxGeometry args={[W, H, T]} />
        <primitive object={m.wallLight} attach="material" />
      </mesh>
      {/* South opening — balcony edge, no wall */}
      {/* Balcony edge beam */}
      <mesh castShadow position={[0, 0.12, hd]}>
        <boxGeometry args={[W, 0.24, T]} />
        <primitive object={m.dark} attach="material" />
      </mesh>
      {/* Baseboard */}
      <mesh position={[-hw + T / 2 + 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.dark} attach="material" />
      </mesh>
      <mesh position={[hw - T / 2 - 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.dark} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Upper landing / bridge ───────────────────────────────────────────────────
// Connects stair top to upper gallery floor
function UpperLanding({ m }: { m: ReturnType<typeof useMats> }) {
  const FLOOR_Y = 5.20;
  return (
    <group>
      {/* Landing slab */}
      <mesh castShadow receiveShadow position={[STAIR_X, FLOOR_Y - 0.12, -26]}>
        <boxGeometry args={[STEP_W + 2, 0.24, 6]} />
        <primitive object={m.stair} attach="material" />
      </mesh>
      {/* Balcony railing — open side */}
      <mesh position={[STAIR_X + STEP_W / 2 + 0.8, FLOOR_Y + 0.55, -26]}>
        <boxGeometry args={[0.05, 1.1, 6]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
      {/* Top rail */}
      <mesh position={[STAIR_X + STEP_W / 2 + 0.8, FLOOR_Y + 1.1, -26]}>
        <boxGeometry args={[0.05, 0.05, 6]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryArchitecture() {
  const m = useMats();
  return (
    <group>
      <EntranceVestibule m={m} />
      <MainGalleryGround m={m} />
      <StairHall         m={m} />
      <MonumentalStaircase m={m} />
      <UpperLanding      m={m} />
      <UpperGallery      m={m} />
    </group>
  );
}
