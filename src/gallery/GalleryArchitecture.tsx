import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CH } from './constants';
import { GenerativeArtwork, TypoArtwork } from './ProjectArtworks';

// ─── Extended material palette ────────────────────────────────────────────────
const MAT_COLORS = {
  wall:       0xEEEAE1,
  wallLight:  0xF7F4ED,
  wallDark:   0xE0DBD0,
  floor:      0xD8D1C5,
  floorLight: 0xE4DED3,
  ceiling:    0xE8E4DB,
  darkStone:  0x272522,
  mattBlack:  0x161616,
  walnut:     0x3A2922,
  burgundy:   0x800020,
  mutedGreen: 0x66705A,
  lightStone: 0xD8D1C5,
  warmStone:  0xC8BFB0,
  metal:      0x2a2826,
  stair:      0xCFC8BC,
  railing:    0x1e1c1a,
  offWhite:   0xF7F4ED,
} as const;

function useMats() {
  return useMemo(() => ({
    wall:      new THREE.MeshStandardMaterial({ color: MAT_COLORS.wall,      roughness: 0.88, metalness: 0.0 }),
    wallLight: new THREE.MeshStandardMaterial({ color: MAT_COLORS.wallLight, roughness: 0.92, metalness: 0.0 }),
    wallDark:  new THREE.MeshStandardMaterial({ color: MAT_COLORS.wallDark,  roughness: 0.85, metalness: 0.0 }),
    floor:     new THREE.MeshStandardMaterial({ color: MAT_COLORS.floor,     roughness: 0.55, metalness: 0.0 }),
    floorLight:new THREE.MeshStandardMaterial({ color: MAT_COLORS.floorLight,roughness: 0.50, metalness: 0.0 }),
    ceiling:   new THREE.MeshStandardMaterial({ color: MAT_COLORS.ceiling,   roughness: 0.95, metalness: 0.0 }),
    darkStone: new THREE.MeshStandardMaterial({ color: MAT_COLORS.darkStone, roughness: 0.75, metalness: 0.05 }),
    mattBlack: new THREE.MeshStandardMaterial({ color: MAT_COLORS.mattBlack, roughness: 0.80, metalness: 0.05 }),
    walnut:    new THREE.MeshStandardMaterial({ color: MAT_COLORS.walnut,    roughness: 0.70, metalness: 0.02 }),
    burgundy:  new THREE.MeshStandardMaterial({ color: MAT_COLORS.burgundy,  roughness: 0.65, metalness: 0.05 }),
    green:     new THREE.MeshStandardMaterial({ color: MAT_COLORS.mutedGreen,roughness: 0.90, metalness: 0.0 }),
    warmStone: new THREE.MeshStandardMaterial({ color: MAT_COLORS.warmStone, roughness: 0.80, metalness: 0.0 }),
    metal:     new THREE.MeshStandardMaterial({ color: MAT_COLORS.metal,     roughness: 0.35, metalness: 0.75 }),
    stair:     new THREE.MeshStandardMaterial({ color: MAT_COLORS.stair,     roughness: 0.65, metalness: 0.0 }),
    railing:   new THREE.MeshStandardMaterial({ color: MAT_COLORS.railing,   roughness: 0.40, metalness: 0.65 }),
    offWhite:  new THREE.MeshStandardMaterial({ color: MAT_COLORS.offWhite,  roughness: 0.92, metalness: 0.0 }),
  }), []);
}

// ─── ThickArch ────────────────────────────────────────────────────────────────
function ThickArch({ wallW, wallH, wallD, openW, openH, mat, position, rotation }: {
  wallW: number; wallH: number; wallD: number;
  openW: number; openH: number;
  mat: THREE.MeshStandardMaterial;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const sideW = (wallW - openW) / 2;
  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      <mesh castShadow receiveShadow position={[-(openW / 2 + sideW / 2), wallH / 2, 0]}>
        <boxGeometry args={[sideW, wallH, wallD]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh castShadow receiveShadow position={[(openW / 2 + sideW / 2), wallH / 2, 0]}>
        <boxGeometry args={[sideW, wallH, wallD]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, openH + (wallH - openH) / 2, 0]}>
        <boxGeometry args={[openW, wallH - openH, wallD]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh receiveShadow position={[0, openH - 0.01, 0]}>
        <boxGeometry args={[openW, 0.02, wallD]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Museum bench ─────────────────────────────────────────────────────────────
function Bench({ position, rotation, mat, seatMat }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  mat: THREE.MeshStandardMaterial;
  seatMat: THREE.MeshStandardMaterial;
}) {
  const L = 2.2, H = 0.44, D = 0.42, legH = 0.38, legT = 0.06;
  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      {/* Seat */}
      <mesh castShadow receiveShadow position={[0, H, 0]}>
        <boxGeometry args={[L, 0.06, D]} />
        <primitive object={seatMat} attach="material" />
      </mesh>
      {/* Legs */}
      {[[-L/2+0.12, legH/2, -D/2+0.08],[L/2-0.12, legH/2, -D/2+0.08],
        [-L/2+0.12, legH/2,  D/2-0.08],[L/2-0.12, legH/2,  D/2-0.08]].map(([x,y,z], i) => (
        <mesh key={i} castShadow receiveShadow position={[x, y, z]}>
          <boxGeometry args={[legT, legH, legT]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
      {/* Stretcher */}
      <mesh castShadow position={[0, 0.12, 0]}>
        <boxGeometry args={[L - 0.3, legT, legT]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Low-poly plant ───────────────────────────────────────────────────────────
function Plant({ position, scale = 1, mat }: {
  position: [number, number, number];
  scale?: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const potMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xC8BFB0, roughness: 0.85, metalness: 0 }), []);
  return (
    <group position={position} scale={scale}>
      {/* Pot */}
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.44, 8]} />
        <primitive object={potMat} attach="material" />
      </mesh>
      {/* Main stem cluster — 5 leaf cones */}
      {[
        [0, 1.1, 0, 0, 0.55, 0.55],
        [0.18, 0.85, 0.12, 0.3, 0.42, 0.42],
        [-0.15, 0.90, -0.10, -0.25, 0.38, 0.38],
        [0.08, 1.35, -0.08, 0.15, 0.32, 0.32],
        [-0.10, 1.20, 0.14, -0.2, 0.36, 0.36],
      ].map(([x, y, z, rx, sy, sz], i) => (
        <mesh key={i} castShadow position={[x, y, z]} rotation={[rx, 0, 0]}>
          <coneGeometry args={[sy, sz * 2.2, 6]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Tall architectural planter ───────────────────────────────────────────────
function TallPlanter({ position, mat, plantMat }: {
  position: [number, number, number];
  mat: THREE.MeshStandardMaterial;
  plantMat: THREE.MeshStandardMaterial;
}) {
  return (
    <group position={position}>
      {/* Planter box */}
      <mesh castShadow receiveShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.55, 1.1, 0.55]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Tall grass blades */}
      {Array.from({ length: 9 }, (_, i) => {
        const angle = (i / 9) * Math.PI * 2;
        const r = 0.12 + (i % 3) * 0.06;
        return (
          <mesh key={i} castShadow
            position={[Math.cos(angle)*r, 1.1 + 0.4 + (i%3)*0.18, Math.sin(angle)*r]}
            rotation={[Math.cos(angle)*0.35, 0, Math.sin(angle)*0.35]}>
            <boxGeometry args={[0.025, 0.8 + (i%3)*0.2, 0.025]} />
            <primitive object={plantMat} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Abstract ribbon sculpture ────────────────────────────────────────────────
function RibbonSculpture({ position, mat }: {
  position: [number, number, number];
  mat: THREE.MeshStandardMaterial;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.04;
  });

  const segments = useMemo(() => {
    const pts: [number,number,number,number,number,number][] = [];
    const N = 18;
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const angle = t * Math.PI * 3.5;
      const r = 0.55 + Math.sin(t * Math.PI * 2) * 0.22;
      const x = Math.cos(angle) * r;
      const y = t * 2.8;
      const z = Math.sin(angle) * r;
      const rx = Math.sin(t * Math.PI) * 0.4;
      const ry = angle;
      const rz = Math.cos(t * Math.PI * 2) * 0.3;
      pts.push([x, y, z, rx, ry, rz]);
    }
    return pts;
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {segments.map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={i} castShadow position={[x, y, z]} rotation={[rx, ry, rz]}>
          <boxGeometry args={[0.28, 0.18, 0.06]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Floating ring installation ───────────────────────────────────────────────
function FloatingRing({ position, mat }: {
  position: [number, number, number];
  mat: THREE.MeshStandardMaterial;
}) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.06;
      groupRef.current.rotation.x += dt * 0.02;
    }
  });

  const torusGeo = useMemo(() => new THREE.TorusGeometry(1.1, 0.055, 16, 64), []);

  return (
    <group ref={groupRef} position={position}>
      <mesh castShadow geometry={torusGeo}>
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Inner ring — slightly tilted */}
      <mesh castShadow rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.65, 0.035, 12, 48]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Stacked stone forms ──────────────────────────────────────────────────────
function StackedStones({ position, mat }: {
  position: [number, number, number];
  mat: THREE.MeshStandardMaterial;
}) {
  const stones = [
    { y: 0.18, sx: 0.55, sy: 0.36, sz: 0.42, ry: 0.2 },
    { y: 0.62, sx: 0.44, sy: 0.28, sz: 0.36, ry: 0.6 },
    { y: 0.98, sx: 0.36, sy: 0.24, sz: 0.30, ry: 1.1 },
    { y: 1.28, sx: 0.28, sy: 0.20, sz: 0.24, ry: 0.4 },
    { y: 1.54, sx: 0.20, sy: 0.16, sz: 0.18, ry: 0.9 },
  ];
  return (
    <group position={position}>
      {stones.map(({ y, sx, sy, sz, ry }, i) => (
        <mesh key={i} castShadow receiveShadow position={[0, y, 0]} rotation={[0, ry, 0]}>
          <boxGeometry args={[sx, sy, sz]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Floor tile grid (subtle seams) ──────────────────────────────────────────
function FloorTiles({ cx, cz, w, d, tileSize, mat }: {
  cx: number; cz: number; w: number; d: number;
  tileSize: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const seamMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xC8C0B4, roughness: 0.9, metalness: 0,
  }), []);

  const cols = Math.ceil(w / tileSize);
  const rows = Math.ceil(d / tileSize);
  const startX = cx - w / 2;
  const startZ = cz - d / 2;

  return (
    <group>
      {/* Base floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.001, cz]}>
        <planeGeometry args={[w, d]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Seam lines X */}
      {Array.from({ length: cols + 1 }, (_, i) => (
        <mesh key={`x${i}`} receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[startX + i * tileSize, 0.002, cz]}>
          <planeGeometry args={[0.012, d]} />
          <primitive object={seamMat} attach="material" />
        </mesh>
      ))}
      {/* Seam lines Z */}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <mesh key={`z${i}`} receiveShadow
          rotation={[-Math.PI / 2, 0, 0]}
          position={[cx, 0.002, startZ + i * tileSize]}>
          <planeGeometry args={[w, 0.012]} />
          <primitive object={seamMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Ceiling beam ─────────────────────────────────────────────────────────────
function CeilingBeam({ x, y, z, length, axis, mat }: {
  x: number; y: number; z: number;
  length: number; axis: 'x' | 'z';
  mat: THREE.MeshStandardMaterial;
}) {
  const size: [number,number,number] = axis === 'x'
    ? [length, 0.18, 0.22]
    : [0.22, 0.18, length];
  return (
    <mesh castShadow receiveShadow position={[x, y, z]}>
      <boxGeometry args={size} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Skylight opening ─────────────────────────────────────────────────────────
function Skylight({ cx, cy, cz, w, d, wallMat }: {
  cx: number; cy: number; cz: number;
  w: number; d: number;
  wallMat: THREE.MeshStandardMaterial;
}) {
  const T = 0.35; // frame thickness
  const depth = 0.5;
  const emissiveMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xFFF8F0,
    emissive: new THREE.Color(0xFFF8F0),
    emissiveIntensity: 0.55,
    roughness: 1,
  }), []);

  return (
    <group position={[cx, cy, cz]}>
      {/* North frame */}
      <mesh castShadow position={[0, 0, -(d/2 + T/2)]}>
        <boxGeometry args={[w + T*2, depth, T]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* South frame */}
      <mesh castShadow position={[0, 0, d/2 + T/2]}>
        <boxGeometry args={[w + T*2, depth, T]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* West frame */}
      <mesh castShadow position={[-(w/2 + T/2), 0, 0]}>
        <boxGeometry args={[T, depth, d]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* East frame */}
      <mesh castShadow position={[w/2 + T/2, 0, 0]}>
        <boxGeometry args={[T, depth, d]} />
        <primitive object={wallMat} attach="material" />
      </mesh>
      {/* Bright fill plane */}
      <mesh position={[0, depth/2 - 0.01, 0]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={emissiveMat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Wall niche ───────────────────────────────────────────────────────────────
function WallNiche({ position, rotation, w, h, d, mat }: {
  position: [number,number,number];
  rotation?: [number,number,number];
  w: number; h: number; d: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const backMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xE0DBD0, roughness: 0.95, metalness: 0,
  }), []);
  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      {/* Left reveal */}
      <mesh receiveShadow position={[-(w/2 + 0.06), h/2, -d/2]}>
        <boxGeometry args={[0.12, h, d]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Right reveal */}
      <mesh receiveShadow position={[w/2 + 0.06, h/2, -d/2]}>
        <boxGeometry args={[0.12, h, d]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Top reveal */}
      <mesh receiveShadow position={[0, h + 0.06, -d/2]}>
        <boxGeometry args={[w + 0.24, 0.12, d]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Back */}
      <mesh receiveShadow position={[0, h/2, -d]}>
        <planeGeometry args={[w, h]} />
        <primitive object={backMat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Entrance vestibule ───────────────────────────────────────────────────────
function EntranceVestibule({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 12, H = 5, D = 16, CZ = 22;
  const hw = W / 2, hd = D / 2;
  const T = 1.2;

  return (
    <group position={[0, 0, CZ]}>
      <FloorTiles cx={0} cz={0} w={W} d={D} tileSize={2.5} mat={m.floor} />
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
      {/* Front arch */}
      <ThickArch wallW={W} wallH={H} wallD={T} openW={5.5} openH={4.2}
        mat={m.wall} position={[0, 0, -hd]} />
      {/* Ceiling beam across entrance */}
      <CeilingBeam x={0} y={H - 0.09} z={0} length={W} axis="x" mat={m.darkStone} />
      {/* Baseboard */}
      <mesh position={[-hw + T/2 + 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      <mesh position={[hw - T/2 - 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      {/* Plant — right corner near entrance */}
      <Plant position={[4.2, 0, -5.5]} scale={1.1} mat={m.green} />
      {/* Typographic artwork on back wall */}
      <TypoArtwork position={[0, 2.6, hd - T/2 - 0.08]} />
    </group>
  );
}

// ─── Main gallery — ground floor ──────────────────────────────────────────────
function MainGalleryGround({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 20, H = 9, D = 32, CZ = -2;
  const hw = W / 2, hd = D / 2;
  const T = 1.0;

  return (
    <group position={[0, 0, CZ]}>
      <FloorTiles cx={0} cz={0} w={W} d={D} tileSize={3.0} mat={m.floor} />
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.ceiling} attach="material" />
      </mesh>
      {/* Skylight — centred in ceiling */}
      <Skylight cx={0} cy={H} cz={0} w={6} d={10} wallMat={m.ceiling} />
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
      {/* North arch into stair hall */}
      <ThickArch wallW={W} wallH={H} wallD={T} openW={7} openH={7}
        mat={m.wall} position={[0, 0, -hd]} />
      {/* Ceiling beams — structural feel */}
      {[-10, -2, 6, 14].map((z, i) => (
        <CeilingBeam key={i} x={0} y={H - 0.09} z={z} length={W} axis="x" mat={m.darkStone} />
      ))}
      {/* Projecting wall panel — left, creates depth for artwork */}
      <mesh castShadow receiveShadow position={[-hw + T/2 + 0.18, H/2, -2]}>
        <boxGeometry args={[0.36, H, 8]} />
        <primitive object={m.wallDark} attach="material" />
      </mesh>
      {/* Projecting wall panel — right */}
      <mesh castShadow receiveShadow position={[hw - T/2 - 0.18, H/2, -6]}>
        <boxGeometry args={[0.36, H, 8]} />
        <primitive object={m.wallDark} attach="material" />
      </mesh>
      {/* Baseboard left */}
      <mesh position={[-hw + T/2 + 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      {/* Baseboard right */}
      <mesh position={[hw - T/2 - 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      {/* Bench — in front of left artwork */}
      <Bench position={[-5.5, 0, -2]} rotation={[0, Math.PI/2, 0]}
        mat={m.mattBlack} seatMat={m.walnut} />
      {/* Bench — in front of right artwork */}
      <Bench position={[5.5, 0, -6]} rotation={[0, -Math.PI/2, 0]}
        mat={m.mattBlack} seatMat={m.walnut} />
      {/* Ribbon sculpture — central foreground */}
      <RibbonSculpture position={[0, 0, 4]} mat={m.burgundy} />
      {/* Tall planter — left side near arch */}
      <TallPlanter position={[-6, 0, -12]} mat={m.darkStone} plantMat={m.green} />
      {/* Generative artwork — right wall, upper section */}
      <GenerativeArtwork position={[hw - T/2 - 0.22, 5.8, 8]} rotation={[0, -Math.PI/2, 0]}
        width={4.0} height={2.8} />
      {/* Wall niche — left wall, decorative recess */}
      <WallNiche position={[-hw + T/2 + 0.01, 0, 10]} rotation={[0, Math.PI/2, 0]}
        w={2.2} h={3.0} d={0.28} mat={m.wall} />
      {/* Stacked stones in niche */}
      <StackedStones position={[-hw + T/2 + 0.22, 0, 10]} mat={m.warmStone} />
    </group>
  );
}

// ─── Stair hall ───────────────────────────────────────────────────────────────
function StairHall({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 22, H = 12, D = 20, CZ = -24;
  const hw = W / 2, hd = D / 2;
  const T = 1.0;

  return (
    <group position={[0, 0, CZ]}>
      <FloorTiles cx={0} cz={0} w={W} d={D} tileSize={3.0} mat={m.floor} />
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.ceiling} attach="material" />
      </mesh>
      {/* Large skylight over stair void */}
      <Skylight cx={3} cy={H} cz={0} w={7} d={12} wallMat={m.ceiling} />
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
      {/* Back wall */}
      <mesh castShadow receiveShadow position={[0, H / 2, -hd]}>
        <boxGeometry args={[W, H, T]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* South arch from main gallery */}
      <ThickArch wallW={W} wallH={H} wallD={T} openW={7} openH={7}
        mat={m.wall} position={[0, 0, hd]} />
      {/* Ceiling beams */}
      <CeilingBeam x={0} y={H - 0.09} z={-6} length={W} axis="x" mat={m.darkStone} />
      <CeilingBeam x={0} y={H - 0.09} z={4}  length={W} axis="x" mat={m.darkStone} />
      {/* Floating ring installation — high in stair void */}
      <FloatingRing position={[3, 8.5, -2]} mat={m.metal} />
      {/* Plant — left corner */}
      <Plant position={[-8, 0, -7]} scale={1.3} mat={m.green} />
      {/* Tall planter — right side */}
      <TallPlanter position={[8, 0, 4]} mat={m.warmStone} plantMat={m.green} />
      {/* Baseboard */}
      <mesh position={[-hw + T/2 + 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      <mesh position={[hw - T/2 - 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Monumental staircase ─────────────────────────────────────────────────────
const STEP_W  = 7.5;
const STEP_H  = 0.18;
const STEP_D  = 0.32;
const STEPS_1 = 16;
const STEPS_2 = 16;
const STAIR_X = 3;

function StaircaseFlight({ startX, startY, startZ, steps, m }: {
  startX: number; startY: number; startZ: number;
  steps: number;
  m: ReturnType<typeof useMats>;
}) {
  return (
    <group>
      {Array.from({ length: steps }, (_, i) => {
        const y = startY + i * STEP_H + STEP_H / 2;
        const z = startZ - i * STEP_D - STEP_D / 2;
        return (
          <group key={i}>
            <mesh castShadow receiveShadow position={[startX, y, z]}>
              <boxGeometry args={[STEP_W, STEP_H * 0.5, STEP_D + 0.01]} />
              <primitive object={m.stair} attach="material" />
            </mesh>
            <mesh castShadow position={[startX, y - STEP_H * 0.25, z + STEP_D / 2]}>
              <boxGeometry args={[STEP_W, STEP_H * 0.5, 0.03]} />
              <primitive object={m.wall} attach="material" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function MonumentalStaircase({ m }: { m: ReturnType<typeof useMats> }) {
  const f1StartZ = -14;
  const f1EndY   = STEPS_1 * STEP_H;
  const landingZ = f1StartZ - STEPS_1 * STEP_D;
  const landingD = 2.0;
  const f2StartZ = landingZ - landingD;
  const totalD1  = STEPS_1 * STEP_D;
  const totalD2  = STEPS_2 * STEP_D;

  return (
    <group>
      <StaircaseFlight startX={STAIR_X} startY={0} startZ={f1StartZ} steps={STEPS_1} m={m} />
      {/* Landing */}
      <mesh castShadow receiveShadow
        position={[STAIR_X, f1EndY + STEP_H / 4, landingZ - landingD / 2]}>
        <boxGeometry args={[STEP_W, STEP_H / 2, landingD]} />
        <primitive object={m.stair} attach="material" />
      </mesh>
      <StaircaseFlight startX={STAIR_X} startY={f1EndY} startZ={f2StartZ} steps={STEPS_2} m={m} />
      {/* Left stringer flight 1 */}
      <mesh castShadow receiveShadow
        position={[STAIR_X - STEP_W/2 + 0.15, f1EndY/2, f1StartZ - totalD1/2]}>
        <boxGeometry args={[0.3, f1EndY + 0.3, totalD1 + 0.1]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Left stringer flight 2 */}
      <mesh castShadow receiveShadow
        position={[STAIR_X - STEP_W/2 + 0.15, f1EndY + STEPS_2*STEP_H/2, f2StartZ - totalD2/2]}>
        <boxGeometry args={[0.3, STEPS_2*STEP_H + 0.3, totalD2 + 0.1]} />
        <primitive object={m.wall} attach="material" />
      </mesh>
      {/* Handrail flight 1 */}
      <mesh castShadow
        position={[STAIR_X + STEP_W/2 - 0.1, f1EndY/2 + 1.0, f1StartZ - totalD1/2]}
        rotation={[0, 0, Math.atan2(f1EndY, totalD1)]}>
        <boxGeometry args={[0.05, 0.05, Math.sqrt(totalD1**2 + f1EndY**2) + 0.5]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
      {/* Handrail flight 2 */}
      <mesh castShadow
        position={[STAIR_X + STEP_W/2 - 0.1, f1EndY + STEPS_2*STEP_H/2 + 1.0, f2StartZ - totalD2/2]}
        rotation={[0, 0, Math.atan2(STEPS_2*STEP_H, totalD2)]}>
        <boxGeometry args={[0.05, 0.05, Math.sqrt(totalD2**2 + (STEPS_2*STEP_H)**2) + 0.5]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
      {/* Vertical balusters — flight 1 */}
      {Array.from({ length: 8 }, (_, i) => {
        const frac = (i + 0.5) / 8;
        const bz = f1StartZ - frac * totalD1;
        const by = frac * f1EndY;
        return (
          <mesh key={i} castShadow position={[STAIR_X + STEP_W/2 - 0.1, by + 0.55, bz]}>
            <boxGeometry args={[0.03, 1.1, 0.03]} />
            <primitive object={m.railing} attach="material" />
          </mesh>
        );
      })}
      {/* Stacked stones near stair base */}
      <StackedStones position={[STAIR_X - STEP_W/2 - 0.6, 0, -13.5]} mat={m.warmStone} />
    </group>
  );
}

// ─── Upper landing ────────────────────────────────────────────────────────────
function UpperLanding({ m }: { m: ReturnType<typeof useMats> }) {
  const FLOOR_Y = 5.20;
  return (
    <group>
      <mesh castShadow receiveShadow position={[STAIR_X, FLOOR_Y - 0.12, -26]}>
        <boxGeometry args={[STEP_W + 2, 0.24, 6]} />
        <primitive object={m.stair} attach="material" />
      </mesh>
      {/* Balcony railing post */}
      <mesh position={[STAIR_X + STEP_W/2 + 0.8, FLOOR_Y + 0.55, -26]}>
        <boxGeometry args={[0.05, 1.1, 6]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
      {/* Top rail */}
      <mesh position={[STAIR_X + STEP_W/2 + 0.8, FLOOR_Y + 1.1, -26]}>
        <boxGeometry args={[0.05, 0.05, 6]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
      {/* Vertical balusters on landing */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} castShadow
          position={[STAIR_X + STEP_W/2 + 0.8, FLOOR_Y + 0.55, -23.5 + i * 1.2]}>
          <boxGeometry args={[0.03, 1.1, 0.03]} />
          <primitive object={m.railing} attach="material" />
        </mesh>
      ))}
      {/* Plant on landing */}
      <Plant position={[STAIR_X - 2, FLOOR_Y, -24.5]} scale={0.9} mat={m.green} />
    </group>
  );
}

// ─── Upper gallery ────────────────────────────────────────────────────────────
function UpperGallery({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 18, H = 6, D = 22, CZ = -35;
  const hw = W / 2, hd = D / 2;
  const T = 1.0;
  const FLOOR_Y = 5.20;

  return (
    <group position={[0, FLOOR_Y, CZ]}>
      <FloorTiles cx={0} cz={0} w={W} d={D} tileSize={2.5} mat={m.floorLight} />
      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, H, 0]}>
        <planeGeometry args={[W, D]} />
        <primitive object={m.ceiling} attach="material" />
      </mesh>
      {/* Skylight — centred over featured artwork */}
      <Skylight cx={0} cy={H} cz={-6} w={5} d={8} wallMat={m.ceiling} />
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
      {/* Back wall — featured artwork */}
      <mesh castShadow receiveShadow position={[0, H / 2, -hd]}>
        <boxGeometry args={[W, H, T]} />
        <primitive object={m.wallLight} attach="material" />
      </mesh>
      {/* Projecting panel behind featured artwork — creates depth */}
      <mesh castShadow receiveShadow position={[0, H/2, -hd + T/2 + 0.22]}>
        <boxGeometry args={[10, H, 0.44]} />
        <primitive object={m.offWhite} attach="material" />
      </mesh>
      {/* Balcony edge beam */}
      <mesh castShadow position={[0, 0.12, hd]}>
        <boxGeometry args={[W, 0.24, T]} />
        <primitive object={m.darkStone} attach="material" />
      </mesh>
      {/* Ceiling beams */}
      <CeilingBeam x={0} y={H - 0.09} z={-4} length={W} axis="x" mat={m.darkStone} />
      <CeilingBeam x={0} y={H - 0.09} z={4}  length={W} axis="x" mat={m.darkStone} />
      {/* Baseboard */}
      <mesh position={[-hw + T/2 + 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      <mesh position={[hw - T/2 - 0.01, 0.06, 0]}>
        <boxGeometry args={[0.04, 0.12, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      {/* Bench — facing featured artwork */}
      <Bench position={[0, 0, -4]} rotation={[0, Math.PI, 0]}
        mat={m.darkStone} seatMat={m.warmStone} />
      {/* Wall niche — left wall */}
      <WallNiche position={[-hw + T/2 + 0.01, 0, 4]} rotation={[0, Math.PI/2, 0]}
        w={2.0} h={2.8} d={0.24} mat={m.wall} />
      {/* Stacked stones in niche */}
      <StackedStones position={[-hw + T/2 + 0.22, 0, 4]} mat={m.warmStone} />
      {/* Plant — right corner */}
      <Plant position={[6, 0, 8]} scale={1.0} mat={m.green} />
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryArchitecture() {
  const m = useMats();
  return (
    <group>
      <EntranceVestibule    m={m} />
      <MainGalleryGround    m={m} />
      <StairHall            m={m} />
      <MonumentalStaircase  m={m} />
      <UpperLanding         m={m} />
      <UpperGallery         m={m} />
    </group>
  );
}
