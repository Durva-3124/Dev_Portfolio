import { useMemo } from 'react';
import * as THREE from 'three';
import { MAT, SPACES, makeMat } from './constants';

// ─── Large arch opening (extruded shape) ─────────────────────────────────────
function ArchOpening({
  width, height, depth, mat,
}: {
  width: number; height: number; depth: number;
  mat: THREE.MeshStandardMaterial;
}) {
  const geo = useMemo(() => {
    const r = width / 2;
    const shape = new THREE.Shape();
    shape.moveTo(-r, 0);
    shape.lineTo(-r, height - r);
    shape.absarc(0, height - r, r, Math.PI, 0, false);
    shape.lineTo(r, 0);
    const thick = 0.32;
    shape.lineTo(r - thick, 0);
    shape.lineTo(r - thick, height - r);
    shape.absarc(0, height - r, r - thick, 0, Math.PI, true);
    shape.lineTo(-r + thick, 0);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      curveSegments: 20,
    });
  }, [width, height, depth]);

  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Structural pier (rectangular column) ────────────────────────────────────
function Pier({
  x, z, w, d, h,
  matShaft, matCap,
}: {
  x: number; z: number; w: number; d: number; h: number;
  matShaft: THREE.MeshStandardMaterial;
  matCap:   THREE.MeshStandardMaterial;
}) {
  return (
    <group position={[x, 0, z]}>
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <boxGeometry args={[w, h, d]} />
        <primitive object={matShaft} attach="material" />
      </mesh>
      {/* Gold cap */}
      <mesh position={[0, h - 0.06, 0]}>
        <boxGeometry args={[w + 0.08, 0.12, d + 0.08]} />
        <primitive object={matCap} attach="material" />
      </mesh>
      {/* Gold base */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[w + 0.08, 0.12, d + 0.08]} />
        <primitive object={matCap} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Exhibit wall (large blank canvas surface) ────────────────────────────────
function ExhibitWall({
  position, rotation, width, height, matWall, matFrame,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width: number; height: number;
  matWall:  THREE.MeshStandardMaterial;
  matFrame: THREE.MeshStandardMaterial;
}) {
  const frameThick = 0.06;
  const frameDepth = 0.08;
  return (
    <group position={position} rotation={rotation ? new THREE.Euler(...rotation) : undefined}>
      {/* Canvas surface */}
      <mesh receiveShadow position={[0, 0, 0.01]}>
        <planeGeometry args={[width, height]} />
        <primitive object={matWall} attach="material" />
      </mesh>
      {/* Frame — top */}
      <mesh position={[0, height / 2 + frameThick / 2, 0]}>
        <boxGeometry args={[width + frameThick * 2, frameThick, frameDepth]} />
        <primitive object={matFrame} attach="material" />
      </mesh>
      {/* Frame — bottom */}
      <mesh position={[0, -(height / 2) - frameThick / 2, 0]}>
        <boxGeometry args={[width + frameThick * 2, frameThick, frameDepth]} />
        <primitive object={matFrame} attach="material" />
      </mesh>
      {/* Frame — left */}
      <mesh position={[-(width / 2) - frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, height, frameDepth]} />
        <primitive object={matFrame} attach="material" />
      </mesh>
      {/* Frame — right */}
      <mesh position={[(width / 2) + frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, height, frameDepth]} />
        <primitive object={matFrame} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function CentralAtrium() {
  const mStone   = useMemo(() => makeMat(MAT.stone),    []);
  const mDark    = useMemo(() => makeMat(MAT.stoneDark), []);
  const mFloor   = useMemo(() => makeMat(MAT.floor),    []);
  const mCeil    = useMemo(() => makeMat(MAT.ceiling),   []);
  const mMetal   = useMemo(() => makeMat(MAT.metal),    []);
  const mGold    = useMemo(() => makeMat(MAT.gold),     []);
  const mExhibit = useMemo(() => makeMat(MAT.exhibit),  []);

  const { w, h, d, cz } = SPACES.atrium;
  const hw = w / 2;
  const hh = h / 2;
  const hd = d / 2;
  const t  = 0.3;

  // Mezzanine
  const mezY  = SPACES.mezzanine.y;
  const mezD  = SPACES.mezzanine.depth;
  const mezCZ = SPACES.mezzanine.cz;

  // Wing arch dimensions
  const wingArchW = 5.0;
  const wingArchH = 6.5;

  // Entrance arch (south wall) — matches EntranceHall arch
  const entArchW = 5.5;
  const entArchH = 4.2;

  return (
    <group position={[0, 0, cz]}>

      {/* ── Floor ─────────────────────────────────────────────────────────── */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={mFloor} attach="material" />
      </mesh>

      {/* ── Ceiling ───────────────────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <primitive object={mCeil} attach="material" />
      </mesh>

      {/* ── Back wall (north) — full height, no opening ───────────────────── */}
      <mesh receiveShadow castShadow position={[0, hh, -hd]}>
        <boxGeometry args={[w, h, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* ── South wall — arch opening to entrance hall ────────────────────── */}
      {/* Left panel */}
      <mesh receiveShadow castShadow
        position={[-(entArchW / 2 + (hw - entArchW / 2) / 2), hh, hd]}>
        <boxGeometry args={[hw - entArchW / 2, h, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      {/* Right panel */}
      <mesh receiveShadow castShadow
        position={[(entArchW / 2 + (hw - entArchW / 2) / 2), hh, hd]}>
        <boxGeometry args={[hw - entArchW / 2, h, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      {/* Lintel above arch */}
      <mesh receiveShadow castShadow
        position={[0, entArchH + (h - entArchH) / 2, hd]}>
        <boxGeometry args={[entArchW, h - entArchH, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* ── Left wall — arch opening to left wing ─────────────────────────── */}
      {/* Upper section */}
      <mesh receiveShadow castShadow position={[-hw, wingArchH + (h - wingArchH) / 2, 0]}>
        <boxGeometry args={[t, h - wingArchH, d]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      {/* Front panel */}
      <mesh receiveShadow castShadow
        position={[-hw, wingArchH / 2, hd / 2 + wingArchW / 4 + 1]}>
        <boxGeometry args={[t, wingArchH, hd - wingArchW / 2 - 1]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      {/* Back panel */}
      <mesh receiveShadow castShadow
        position={[-hw, wingArchH / 2, -(hd / 2 + wingArchW / 4 + 1)]}>
        <boxGeometry args={[t, wingArchH, hd - wingArchW / 2 - 1]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      {/* Arch frame on left wall */}
      <group position={[-hw + t / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <ArchOpening width={wingArchW} height={wingArchH} depth={t * 2} mat={mDark} />
      </group>

      {/* ── Right wall — arch opening to right wing ───────────────────────── */}
      <mesh receiveShadow castShadow position={[hw, wingArchH + (h - wingArchH) / 2, 0]}>
        <boxGeometry args={[t, h - wingArchH, d]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      <mesh receiveShadow castShadow
        position={[hw, wingArchH / 2, hd / 2 + wingArchW / 4 + 1]}>
        <boxGeometry args={[t, wingArchH, hd - wingArchW / 2 - 1]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      <mesh receiveShadow castShadow
        position={[hw, wingArchH / 2, -(hd / 2 + wingArchW / 4 + 1)]}>
        <boxGeometry args={[t, wingArchH, hd - wingArchW / 2 - 1]} />
        <primitive object={mStone} attach="material" />
      </mesh>
      <group position={[hw - t / 2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ArchOpening width={wingArchW} height={wingArchH} depth={t * 2} mat={mDark} />
      </group>

      {/* ── Four structural piers — asymmetric placement ──────────────────── */}
      {/* Left pair — offset toward back */}
      <Pier x={-10} z={-6}  w={1.0} d={1.0} h={h} matShaft={mMetal} matCap={mGold} />
      <Pier x={-10} z={ 8}  w={1.0} d={1.0} h={h} matShaft={mMetal} matCap={mGold} />
      {/* Right pair — offset toward front (stair side) */}
      <Pier x={ 10} z={-8}  w={1.0} d={1.0} h={h} matShaft={mMetal} matCap={mGold} />
      <Pier x={ 10} z={ 6}  w={1.0} d={1.0} h={h} matShaft={mMetal} matCap={mGold} />

      {/* ── Mezzanine balcony (back half, upper level) ────────────────────── */}
      {/* Mezzanine floor slab */}
      <mesh castShadow receiveShadow position={[0, mezY, mezCZ - mezD / 2]}>
        <boxGeometry args={[w - 2, 0.28, mezD]} />
        <primitive object={mMetal} attach="material" />
      </mesh>
      {/* Mezzanine soffit (underside visible from below) */}
      <mesh receiveShadow position={[0, mezY - 0.14, mezCZ - mezD / 2]}>
        <boxGeometry args={[w - 2, 0.01, mezD]} />
        <primitive object={mDark} attach="material" />
      </mesh>
      {/* Mezzanine front edge — gold trim */}
      <mesh position={[0, mezY + 0.14, mezCZ + mezD / 2]}>
        <boxGeometry args={[w - 2, 0.06, 0.08]} />
        <primitive object={mGold} attach="material" />
      </mesh>
      {/* Mezzanine railing — glass panel */}
      <mesh position={[0, mezY + 0.65, mezCZ + mezD / 2]}>
        <boxGeometry args={[w - 2, 1.1, 0.04]} />
        <meshStandardMaterial
          color={0x8ab0c0} roughness={0.05} metalness={0.1}
          transparent opacity={0.18}
        />
      </mesh>
      {/* Mezzanine railing — top rail */}
      <mesh position={[0, mezY + 1.2, mezCZ + mezD / 2]}>
        <boxGeometry args={[w - 2, 0.06, 0.06]} />
        <primitive object={mGold} attach="material" />
      </mesh>
      {/* Mezzanine back wall */}
      <mesh receiveShadow castShadow position={[0, mezY + 3.5, -hd + 0.15]}>
        <boxGeometry args={[w - 2, 7, t]} />
        <primitive object={mStone} attach="material" />
      </mesh>

      {/* ── Gold skirting along atrium walls ──────────────────────────────── */}
      <mesh position={[-hw + 0.02, 0.06, 0]}>
        <boxGeometry args={[0.05, 0.12, d]} />
        <primitive object={mGold} attach="material" />
      </mesh>
      <mesh position={[hw - 0.02, 0.06, 0]}>
        <boxGeometry args={[0.05, 0.12, d]} />
        <primitive object={mGold} attach="material" />
      </mesh>
      <mesh position={[0, 0.06, -hd + 0.02]}>
        <boxGeometry args={[w, 0.12, 0.05]} />
        <primitive object={mGold} attach="material" />
      </mesh>

      {/* ── Exhibit walls ─────────────────────────────────────────────────── */}
      {/* Panoramic wall — back wall, large horizontal canvas */}
      <ExhibitWall
        position={[0, 5.5, -hd + 0.35]}
        width={18} height={6}
        matWall={mExhibit} matFrame={mGold}
      />
      {/* Portrait wall — left side, tall vertical canvas */}
      <ExhibitWall
        position={[-hw + 0.35, 5.5, -8]}
        rotation={[0, Math.PI / 2, 0]}
        width={6} height={8}
        matWall={mExhibit} matFrame={mGold}
      />
      {/* Secondary horizontal — right side */}
      <ExhibitWall
        position={[hw - 0.35, 4.5, 4]}
        rotation={[0, -Math.PI / 2, 0]}
        width={10} height={5}
        matWall={mExhibit} matFrame={mGold}
      />

      {/* ── Ceiling coffers — 3×5 grid, not uniform ──────────────────────── */}
      {[-12, -4, 4, 12].map((x) =>
        [-14, -6, 2, 10].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, h - 0.08, z]}>
            <boxGeometry args={[5.5, 0.16, 5.5]} />
            <primitive object={mCeil} attach="material" />
          </mesh>
        ))
      )}

      {/* ── Ceiling beam grid ─────────────────────────────────────────────── */}
      {[-12, -4, 4, 12].map((x) => (
        <mesh key={`bx-${x}`} castShadow position={[x, h - 0.22, 0]}>
          <boxGeometry args={[0.28, 0.44, d - 0.5]} />
          <primitive object={mMetal} attach="material" />
        </mesh>
      ))}
      {[-14, -6, 2, 10].map((z) => (
        <mesh key={`bz-${z}`} castShadow position={[0, h - 0.22, z]}>
          <boxGeometry args={[w - 0.5, 0.44, 0.28]} />
          <primitive object={mMetal} attach="material" />
        </mesh>
      ))}

    </group>
  );
}
