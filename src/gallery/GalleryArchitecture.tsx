import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CH, STAIR } from './constants';
import { GenerativeArtwork, TypoArtwork } from './ProjectArtworks';

// ─── Materials ────────────────────────────────────────────────────────────────
function useMats() {
  return useMemo(() => ({
    wall:      new THREE.MeshStandardMaterial({ color: 0xEEEAE1, roughness: 0.88, metalness: 0 }),
    wallLight: new THREE.MeshStandardMaterial({ color: 0xF7F4ED, roughness: 0.92, metalness: 0 }),
    wallDark:  new THREE.MeshStandardMaterial({ color: 0xE0DBD0, roughness: 0.85, metalness: 0 }),
    floor:     new THREE.MeshStandardMaterial({ color: 0xCFC8BC, roughness: 0.58, metalness: 0 }),
    floorUp:   new THREE.MeshStandardMaterial({ color: 0xD8D2C6, roughness: 0.55, metalness: 0 }),
    ceiling:   new THREE.MeshStandardMaterial({ color: 0xEAE6DD, roughness: 0.95, metalness: 0 }),
    darkStone: new THREE.MeshStandardMaterial({ color: 0x272522, roughness: 0.75, metalness: 0.05 }),
    mattBlack: new THREE.MeshStandardMaterial({ color: 0x161616, roughness: 0.80, metalness: 0.05 }),
    walnut:    new THREE.MeshStandardMaterial({ color: 0x3A2922, roughness: 0.70, metalness: 0.02 }),
    burgundy:  new THREE.MeshStandardMaterial({ color: 0x800020, roughness: 0.65, metalness: 0.05 }),
    green:     new THREE.MeshStandardMaterial({ color: 0x66705A, roughness: 0.90, metalness: 0 }),
    warmStone: new THREE.MeshStandardMaterial({ color: 0xC8BFB0, roughness: 0.80, metalness: 0 }),
    metal:     new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.35, metalness: 0.75 }),
    stair:     new THREE.MeshStandardMaterial({ color: 0xD2CBC0, roughness: 0.62, metalness: 0 }),
    railing:   new THREE.MeshStandardMaterial({ color: 0x1e1c1a, roughness: 0.40, metalness: 0.65 }),
    offWhite:  new THREE.MeshStandardMaterial({ color: 0xF7F4ED, roughness: 0.92, metalness: 0 }),
    seamMat:   new THREE.MeshStandardMaterial({ color: 0xBFB8AC, roughness: 0.90, metalness: 0 }),
  }), []);
}

// ─── Curved arch geometry via Shape + ExtrudeGeometry ────────────────────────
// Creates a thick wall section with a true curved arch opening.
// The arch is a rectangle with a semicircular top.
function makeArchShape(wallW: number, wallH: number, openW: number, openH: number, archR: number) {
  // Outer rectangle
  const shape = new THREE.Shape();
  shape.moveTo(-wallW / 2, 0);
  shape.lineTo( wallW / 2, 0);
  shape.lineTo( wallW / 2, wallH);
  shape.lineTo(-wallW / 2, wallH);
  shape.closePath();

  // Hole: rectangle + semicircle top
  const hole = new THREE.Path();
  const hw = openW / 2;
  hole.moveTo(-hw, 0);
  hole.lineTo(-hw, openH - archR);
  // Left curve
  hole.quadraticCurveTo(-hw, openH, -hw + archR, openH);
  // Top arc
  hole.absarc(0, openH - archR, archR + (hw - archR), Math.PI, 0, true);
  // Right curve
  hole.quadraticCurveTo(hw, openH, hw, openH - archR);
  hole.lineTo(hw, 0);
  hole.closePath();
  shape.holes.push(hole);

  return shape;
}

function CurvedArch({
  wallW, wallH, wallD, openW, openH, archR, mat, position, rotation,
}: {
  wallW: number; wallH: number; wallD: number;
  openW: number; openH: number; archR: number;
  mat: THREE.MeshStandardMaterial;
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const geo = useMemo(() => {
    const shape = makeArchShape(wallW, wallH, openW, openH, archR);
    return new THREE.ExtrudeGeometry(shape, {
      depth: wallD,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.018,
      bevelSegments: 3,
    });
  }, [wallW, wallH, wallD, openW, openH, archR]);

  return (
    <mesh
      castShadow
      receiveShadow
      geometry={geo}
      position={[position[0] - 0, position[1], position[2] - wallD / 2]}
      rotation={rotation ? new THREE.Euler(...rotation) : undefined}
    >
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Floor tiles with subtle seams ───────────────────────────────────────────
function FloorTiles({ cx, cz, w, d, tileSize, mat, seamMat }: {
  cx: number; cz: number; w: number; d: number;
  tileSize: number;
  mat: THREE.MeshStandardMaterial;
  seamMat: THREE.MeshStandardMaterial;
}) {
  const cols = Math.ceil(w / tileSize);
  const rows = Math.ceil(d / tileSize);
  const sx = cx - w / 2;
  const sz = cz - d / 2;
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.001, cz]}>
        <planeGeometry args={[w, d]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {Array.from({ length: cols + 1 }, (_, i) => (
        <mesh key={`cx${i}`} receiveShadow rotation={[-Math.PI / 2, 0, 0]}
          position={[sx + i * tileSize, 0.003, cz]}>
          <planeGeometry args={[0.010, d]} />
          <primitive object={seamMat} attach="material" />
        </mesh>
      ))}
      {Array.from({ length: rows + 1 }, (_, i) => (
        <mesh key={`cz${i}`} receiveShadow rotation={[-Math.PI / 2, 0, 0]}
          position={[cx, 0.003, sz + i * tileSize]}>
          <planeGeometry args={[w, 0.010]} />
          <primitive object={seamMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Ceiling with recessed light channel ─────────────────────────────────────
function CeilingWithChannel({ cx, cy, cz, w, d, mat }: {
  cx: number; cy: number; cz: number; w: number; d: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const emissiveMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0xFFF8F0,
    emissive: new THREE.Color(0xFFF8F0),
    emissiveIntensity: 0.45,
    roughness: 1,
  }), []);
  return (
    <group position={[cx, cy, cz]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Recessed light channel — thin emissive strip */}
      <mesh position={[0, -0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, d * 0.7]} />
        <primitive object={emissiveMat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Bench ────────────────────────────────────────────────────────────────────
function Bench({ position, rotation, legMat, seatMat }: {
  position: [number, number, number];
  rotation?: [number, number, number];
  legMat: THREE.MeshStandardMaterial;
  seatMat: THREE.MeshStandardMaterial;
}) {
  const L = 2.0, seatH = 0.44, D = 0.40, legH = 0.40, legT = 0.055;
  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      <mesh castShadow receiveShadow position={[0, seatH, 0]}>
        <boxGeometry args={[L, 0.055, D]} />
        <primitive object={seatMat} attach="material" />
      </mesh>
      {[[-L/2+0.10, legH/2, -D/2+0.07],[L/2-0.10, legH/2, -D/2+0.07],
        [-L/2+0.10, legH/2,  D/2-0.07],[L/2-0.10, legH/2,  D/2-0.07]].map(([x,y,z], i) => (
        <mesh key={i} castShadow receiveShadow position={[x, y, z]}>
          <boxGeometry args={[legT, legH, legT]} />
          <primitive object={legMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Floating ring sculpture ──────────────────────────────────────────────────
function FloatingRing({ position, mat }: {
  position: [number, number, number];
  mat: THREE.MeshStandardMaterial;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.05;
  });
  const geo1 = useMemo(() => new THREE.TorusGeometry(1.2, 0.06, 16, 80), []);
  const geo2 = useMemo(() => new THREE.TorusGeometry(0.72, 0.038, 12, 60), []);
  return (
    <group ref={ref} position={position}>
      <mesh castShadow geometry={geo1}><primitive object={mat} attach="material" /></mesh>
      <mesh castShadow geometry={geo2} rotation={[Math.PI / 2.8, 0, 0]}>
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Ribbon sculpture — single continuous form ────────────────────────────────
function RibbonSculpture({ position, mat }: {
  position: [number, number, number];
  mat: THREE.MeshStandardMaterial;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.035;
  });

  const geo = useMemo(() => {
    // Build a tube along a 3D curve — single recognisable form
    const pts: THREE.Vector3[] = [];
    const N = 60;
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const angle = t * Math.PI * 4;
      const r = 0.5 + Math.sin(t * Math.PI * 2) * 0.25;
      pts.push(new THREE.Vector3(
        Math.cos(angle) * r,
        t * 2.6,
        Math.sin(angle) * r,
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 80, 0.055, 8, false);
  }, []);

  return (
    <group ref={ref} position={position}>
      <mesh castShadow geometry={geo}>
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Entrance vestibule ───────────────────────────────────────────────────────
function EntranceVestibule({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 12, H = 5.5, D = 16, CZ = 22;
  const hw = W / 2, hd = D / 2;
  const T = 1.4;

  return (
    <group position={[0, 0, CZ]}>
      <FloorTiles cx={0} cz={0} w={W} d={D} tileSize={2.5} mat={m.floor} seamMat={m.seamMat} />
      <CeilingWithChannel cx={0} cy={H} cz={0} w={W} d={D} mat={m.ceiling} />
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
      {/* Hero arch — curved, thick, signature element */}
      <CurvedArch
        wallW={W} wallH={H} wallD={T}
        openW={6.0} openH={4.8} archR={3.0}
        mat={m.wall}
        position={[0, 0, -hd]}
      />
      {/* Baseboard */}
      <mesh position={[-hw + T/2 + 0.01, 0.07, 0]}>
        <boxGeometry args={[0.04, 0.14, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      <mesh position={[hw - T/2 - 0.01, 0.07, 0]}>
        <boxGeometry args={[0.04, 0.14, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      {/* Typographic artwork on back wall */}
      <TypoArtwork position={[0, 2.8, hd - T / 2 - 0.10]} />
    </group>
  );
}

// ─── Main gallery ground floor ────────────────────────────────────────────────
function MainGalleryGround({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 20, H = 9, D = 32, CZ = -2;
  const hw = W / 2, hd = D / 2;
  const T = 1.2;

  return (
    <group position={[0, 0, CZ]}>
      <FloorTiles cx={0} cz={0} w={W} d={D} tileSize={3.0} mat={m.floor} seamMat={m.seamMat} />
      <CeilingWithChannel cx={0} cy={H} cz={0} w={W} d={D} mat={m.ceiling} />
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
      {/* North arch — curved, into stair hall */}
      <CurvedArch
        wallW={W} wallH={H} wallD={T}
        openW={7.5} openH={7.5} archR={3.75}
        mat={m.wall}
        position={[0, 0, -hd]}
      />
      {/* Projecting panel behind left artwork — creates depth */}
      <mesh castShadow receiveShadow position={[-hw + T/2 + 0.20, H/2, -2]}>
        <boxGeometry args={[0.40, H, 7.0]} />
        <primitive object={m.wallDark} attach="material" />
      </mesh>
      {/* Projecting panel behind right artwork */}
      <mesh castShadow receiveShadow position={[hw - T/2 - 0.20, H/2, -6]}>
        <boxGeometry args={[0.40, H, 7.0]} />
        <primitive object={m.wallDark} attach="material" />
      </mesh>
      {/* Baseboard */}
      <mesh position={[-hw + T/2 + 0.01, 0.07, 0]}>
        <boxGeometry args={[0.04, 0.14, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      <mesh position={[hw - T/2 - 0.01, 0.07, 0]}>
        <boxGeometry args={[0.04, 0.14, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      {/* Bench in front of left artwork */}
      <Bench position={[-5.0, 0, -2]} rotation={[0, Math.PI / 2, 0]}
        legMat={m.mattBlack} seatMat={m.walnut} />
      {/* Bench in front of right artwork */}
      <Bench position={[5.0, 0, -6]} rotation={[0, -Math.PI / 2, 0]}
        legMat={m.mattBlack} seatMat={m.walnut} />
      {/* Ribbon sculpture — foreground, creates parallax */}
      <RibbonSculpture position={[1.5, 0, 4]} mat={m.burgundy} />
      {/* Generative artwork on right wall */}
      <GenerativeArtwork
        position={[hw - T/2 - 0.22, 5.5, 8]}
        rotation={[0, -Math.PI / 2, 0]}
        width={3.8} height={2.6}
      />
    </group>
  );
}

// ─── Stair hall ───────────────────────────────────────────────────────────────
function StairHall({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 22, H = 12, D = 22, CZ = -25;
  const hw = W / 2, hd = D / 2;
  const T = 1.2;

  return (
    <group position={[0, 0, CZ]}>
      <FloorTiles cx={0} cz={0} w={W} d={D} tileSize={3.0} mat={m.floor} seamMat={m.seamMat} />
      <CeilingWithChannel cx={0} cy={H} cz={0} w={W} d={D} mat={m.ceiling} />
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
      <CurvedArch
        wallW={W} wallH={H} wallD={T}
        openW={7.5} openH={7.5} archR={3.75}
        mat={m.wall}
        position={[0, 0, hd]}
      />
      {/* Floating ring — high in void */}
      <FloatingRing position={[3, 9.0, -2]} mat={m.metal} />
      {/* Baseboard */}
      <mesh position={[-hw + T/2 + 0.01, 0.07, 0]}>
        <boxGeometry args={[0.04, 0.14, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      <mesh position={[hw - T/2 - 0.01, 0.07, 0]}>
        <boxGeometry args={[0.04, 0.14, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
    </group>
  );
}

// ─── SOLID staircase ──────────────────────────────────────────────────────────
// Each step is a SOLID block — full height from floor to tread surface.
// This eliminates the floating-slab appearance entirely.
// Two flights of STAIR.count steps each, with a landing between.
function MonumentalStaircase({ m }: { m: ReturnType<typeof useMats> }) {
  const { rise, depth, count, width, offsetX, startZ } = STAIR;

  // Flight 1: Z = startZ → startZ - count*depth
  // Each step i: block from Y=0 to Y=(i+1)*rise, depth=depth, at Z = startZ - i*depth
  const flight1 = Array.from({ length: count }, (_, i) => ({
    x: offsetX,
    y: ((i + 1) * rise) / 2,          // centre Y of solid block
    z: startZ - i * depth - depth / 2, // centre Z
    h: (i + 1) * rise,                 // full height from floor
    w: width,
    d: depth,
  }));

  const f1EndY = count * rise;
  const f1EndZ = startZ - count * depth;
  const landingD = 2.0;
  const f2StartZ = f1EndZ - landingD;

  // Flight 2
  const flight2 = Array.from({ length: count }, (_, i) => ({
    x: offsetX,
    y: f1EndY + ((i + 1) * rise) / 2,
    z: f2StartZ - i * depth - depth / 2,
    h: (i + 1) * rise,
    w: width,
    d: depth,
  }));

  const f2EndY = f1EndY + count * rise;
  const f2EndZ = f2StartZ - count * depth;

  // Stringer — solid wall under each flight (left side)
  const stringerX = offsetX - width / 2 + 0.18;

  // Handrail posts
  const postCount = 6;

  return (
    <group>
      {/* Flight 1 — solid blocks */}
      {flight1.map(({ x, y, z, h, w, d }, i) => (
        <mesh key={`f1-${i}`} castShadow receiveShadow position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <primitive object={m.stair} attach="material" />
        </mesh>
      ))}

      {/* Landing slab */}
      <mesh castShadow receiveShadow
        position={[offsetX, f1EndY - rise / 2, f1EndZ - landingD / 2]}>
        <boxGeometry args={[width, f1EndY, landingD]} />
        <primitive object={m.stair} attach="material" />
      </mesh>

      {/* Flight 2 — solid blocks */}
      {flight2.map(({ x, y, z, h, w, d }, i) => (
        <mesh key={`f2-${i}`} castShadow receiveShadow position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <primitive object={m.stair} attach="material" />
        </mesh>
      ))}

      {/* Left stringer — flight 1 */}
      <mesh castShadow receiveShadow
        position={[stringerX, f1EndY / 2, startZ - (count * depth) / 2]}>
        <boxGeometry args={[0.32, f1EndY + 0.2, count * depth + 0.1]} />
        <primitive object={m.wallDark} attach="material" />
      </mesh>

      {/* Left stringer — flight 2 */}
      <mesh castShadow receiveShadow
        position={[stringerX, f1EndY + (count * rise) / 2, f2StartZ - (count * depth) / 2]}>
        <boxGeometry args={[0.32, count * rise + 0.2, count * depth + 0.1]} />
        <primitive object={m.wallDark} attach="material" />
      </mesh>

      {/* Handrail — flight 1 */}
      {(() => {
        const railX = offsetX + width / 2 - 0.12;
        const railLen = Math.sqrt((count * depth) ** 2 + f1EndY ** 2);
        const railAngle = Math.atan2(f1EndY, count * depth);
        const midZ = startZ - (count * depth) / 2;
        const midY = f1EndY / 2 + 1.0;
        return (
          <group>
            <mesh castShadow position={[railX, midY, midZ]}
              rotation={[0, 0, railAngle]}>
              <boxGeometry args={[0.045, 0.045, railLen + 0.4]} />
              <primitive object={m.railing} attach="material" />
            </mesh>
            {Array.from({ length: postCount }, (_, i) => {
              const frac = (i + 0.5) / postCount;
              const pz = startZ - frac * count * depth;
              const py = frac * f1EndY;
              return (
                <mesh key={i} castShadow position={[railX, py + 0.55, pz]}>
                  <boxGeometry args={[0.03, 1.1, 0.03]} />
                  <primitive object={m.railing} attach="material" />
                </mesh>
              );
            })}
          </group>
        );
      })()}

      {/* Handrail — flight 2 */}
      {(() => {
        const railX = offsetX + width / 2 - 0.12;
        const railLen = Math.sqrt((count * depth) ** 2 + (count * rise) ** 2);
        const railAngle = Math.atan2(count * rise, count * depth);
        const midZ = f2StartZ - (count * depth) / 2;
        const midY = f1EndY + (count * rise) / 2 + 1.0;
        return (
          <group>
            <mesh castShadow position={[railX, midY, midZ]}
              rotation={[0, 0, railAngle]}>
              <boxGeometry args={[0.045, 0.045, railLen + 0.4]} />
              <primitive object={m.railing} attach="material" />
            </mesh>
            {Array.from({ length: postCount }, (_, i) => {
              const frac = (i + 0.5) / postCount;
              const pz = f2StartZ - frac * count * depth;
              const py = f1EndY + frac * count * rise;
              return (
                <mesh key={i} castShadow position={[railX, py + 0.55, pz]}>
                  <boxGeometry args={[0.03, 1.1, 0.03]} />
                  <primitive object={m.railing} attach="material" />
                </mesh>
              );
            })}
          </group>
        );
      })()}
    </group>
  );
}

// ─── Upper landing ────────────────────────────────────────────────────────────
function UpperLanding({ m }: { m: ReturnType<typeof useMats> }) {
  const { rise, depth, count, width, offsetX, startZ } = STAIR;
  const f1EndY = count * rise;
  const f1EndZ = startZ - count * depth;
  const landingD = 2.0;
  const f2StartZ = f1EndZ - landingD;
  const f2EndZ   = f2StartZ - count * depth;
  const FLOOR_Y  = 5.20;
  const railX    = offsetX + width / 2 + 0.5;

  return (
    <group>
      {/* Upper landing slab */}
      <mesh castShadow receiveShadow position={[offsetX, FLOOR_Y - 0.14, f2EndZ - 3]}>
        <boxGeometry args={[width + 2, 0.28, 6]} />
        <primitive object={m.stair} attach="material" />
      </mesh>
      {/* Balcony railing */}
      <mesh position={[railX, FLOOR_Y + 0.55, f2EndZ - 3]}>
        <boxGeometry args={[0.045, 1.1, 6]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
      <mesh position={[railX, FLOOR_Y + 1.1, f2EndZ - 3]}>
        <boxGeometry args={[0.045, 0.045, 6]} />
        <primitive object={m.railing} attach="material" />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} castShadow
          position={[railX, FLOOR_Y + 0.55, f2EndZ - 0.5 - i * 1.1]}>
          <boxGeometry args={[0.03, 1.1, 0.03]} />
          <primitive object={m.railing} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Upper gallery ────────────────────────────────────────────────────────────
function UpperGallery({ m }: { m: ReturnType<typeof useMats> }) {
  const W = 18, H = 6.5, D = 24, CZ = -36;
  const hw = W / 2, hd = D / 2;
  const T = 1.2;
  const FLOOR_Y = 5.20;

  return (
    <group position={[0, FLOOR_Y, CZ]}>
      <FloorTiles cx={0} cz={0} w={W} d={D} tileSize={2.5} mat={m.floorUp} seamMat={m.seamMat} />
      <CeilingWithChannel cx={0} cy={H} cz={0} w={W} d={D} mat={m.ceiling} />
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
      {/* Back wall — TejaLens hangs here */}
      <mesh castShadow receiveShadow position={[0, H / 2, -hd]}>
        <boxGeometry args={[W, H, T]} />
        <primitive object={m.wallLight} attach="material" />
      </mesh>
      {/* Projecting panel behind TejaLens — separates artwork from wall */}
      <mesh castShadow receiveShadow position={[0, H / 2, -hd + T / 2 + 0.25]}>
        <boxGeometry args={[9.0, H, 0.50]} />
        <primitive object={m.offWhite} attach="material" />
      </mesh>
      {/* Balcony edge */}
      <mesh castShadow position={[0, 0.14, hd]}>
        <boxGeometry args={[W, 0.28, T]} />
        <primitive object={m.darkStone} attach="material" />
      </mesh>
      {/* Baseboard */}
      <mesh position={[-hw + T/2 + 0.01, 0.07, 0]}>
        <boxGeometry args={[0.04, 0.14, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      <mesh position={[hw - T/2 - 0.01, 0.07, 0]}>
        <boxGeometry args={[0.04, 0.14, D]} />
        <primitive object={m.mattBlack} attach="material" />
      </mesh>
      {/* Bench facing TejaLens */}
      <Bench position={[0, 0, -5]} rotation={[0, Math.PI, 0]}
        legMat={m.darkStone} seatMat={m.warmStone} />
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryArchitecture() {
  const m = useMats();
  return (
    <group>
      <EntranceVestibule   m={m} />
      <MainGalleryGround   m={m} />
      <StairHall           m={m} />
      <MonumentalStaircase m={m} />
      <UpperLanding        m={m} />
      <UpperGallery        m={m} />
    </group>
  );
}
