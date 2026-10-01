import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { ROOM, COLORS } from './constants';

// ─── Shared materials (created once) ─────────────────────────────────────────
function useMaterials() {
  return useMemo(() => {
    const floor = new THREE.MeshStandardMaterial({
      color: COLORS.floor,
      roughness: 0.15,
      metalness: 0.55,
    });
    const wall = new THREE.MeshStandardMaterial({
      color: COLORS.wallDark,
      roughness: 0.85,
      metalness: 0.05,
    });
    const ceiling = new THREE.MeshStandardMaterial({
      color: COLORS.ceiling,
      roughness: 0.95,
      metalness: 0.0,
    });
    const column = new THREE.MeshStandardMaterial({
      color: COLORS.wallMid,
      roughness: 0.6,
      metalness: 0.2,
    });
    const trim = new THREE.MeshStandardMaterial({
      color: COLORS.accentSecondary,
      roughness: 0.3,
      metalness: 0.8,
      emissive: new THREE.Color(COLORS.accentSecondary),
      emissiveIntensity: 0.08,
    });
    const archInner = new THREE.MeshStandardMaterial({
      color: COLORS.wallMid,
      roughness: 0.7,
      metalness: 0.15,
    });
    return { floor, wall, ceiling, column, trim, archInner };
  }, []);
}

// ─── Floor ────────────────────────────────────────────────────────────────────
function Floor({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[ROOM.width, ROOM.depth, 1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Ceiling ──────────────────────────────────────────────────────────────────
function Ceiling({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <mesh receiveShadow rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM.height, 0]}>
      <planeGeometry args={[ROOM.width, ROOM.depth, 1, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Walls ────────────────────────────────────────────────────────────────────
function Walls({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const hw = ROOM.width / 2;
  const hd = ROOM.depth / 2;
  const hy = ROOM.height / 2;
  const t  = ROOM.wallThickness;
  return (
    <>
      {/* Back wall */}
      <mesh receiveShadow castShadow position={[0, hy, -hd]}>
        <boxGeometry args={[ROOM.width, ROOM.height, t]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Front wall */}
      <mesh receiveShadow castShadow position={[0, hy, hd]}>
        <boxGeometry args={[ROOM.width, ROOM.height, t]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Left wall */}
      <mesh receiveShadow castShadow position={[-hw, hy, 0]}>
        <boxGeometry args={[t, ROOM.height, ROOM.depth]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Right wall */}
      <mesh receiveShadow castShadow position={[hw, hy, 0]}>
        <boxGeometry args={[t, ROOM.height, ROOM.depth]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </>
  );
}

// ─── Single column ────────────────────────────────────────────────────────────
function Column({
  x, z,
  colMat, trimMat,
}: {
  x: number; z: number;
  colMat: THREE.MeshStandardMaterial;
  trimMat: THREE.MeshStandardMaterial;
}) {
  const r = 0.22;
  const h = ROOM.height;
  return (
    <group position={[x, 0, z]}>
      {/* Shaft */}
      <mesh castShadow receiveShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r, r * 1.1, h, 12, 1]} />
        <primitive object={colMat} attach="material" />
      </mesh>
      {/* Base plinth */}
      <mesh castShadow position={[0, 0.15, 0]}>
        <boxGeometry args={[r * 3, 0.3, r * 3]} />
        <primitive object={colMat} attach="material" />
      </mesh>
      {/* Capital */}
      <mesh castShadow position={[0, h - 0.15, 0]}>
        <boxGeometry args={[r * 3, 0.3, r * 3]} />
        <primitive object={trimMat} attach="material" />
      </mesh>
    </group>
  );
}

// ─── Column rows ──────────────────────────────────────────────────────────────
function Columns({
  colMat, trimMat,
}: {
  colMat: THREE.MeshStandardMaterial;
  trimMat: THREE.MeshStandardMaterial;
}) {
  const hw = ROOM.width / 2 - 1.2;
  const zPositions = [-20, -10, 0, 10, 20];
  return (
    <>
      {zPositions.map((z) => (
        <group key={z}>
          <Column x={-hw} z={z} colMat={colMat} trimMat={trimMat} />
          <Column x={ hw} z={z} colMat={colMat} trimMat={trimMat} />
        </group>
      ))}
    </>
  );
}

// ─── Arch between columns ─────────────────────────────────────────────────────
function Arch({
  x, z, width, mat,
}: {
  x: number; z: number; width: number; mat: THREE.MeshStandardMaterial;
}) {
  const archH   = 4.2;
  const archW   = width;
  const thick   = 0.28;
  const segments = 16;

  // Build arch curve geometry imperatively
  const archGeo = useMemo(() => {
    const shape = new THREE.Shape();
    const r = archW / 2;
    shape.moveTo(-r, 0);
    shape.lineTo(-r, archH - r);
    shape.absarc(0, archH - r, r, Math.PI, 0, false);
    shape.lineTo(r, 0);
    shape.lineTo(r - thick, 0);
    shape.lineTo(r - thick, archH - r);
    shape.absarc(0, archH - r, r - thick, 0, Math.PI, true);
    shape.lineTo(-r + thick, 0);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: thick,
      bevelEnabled: false,
      steps: 1,
      curveSegments: segments,
    });
  }, [archW, archH, thick, segments]);

  return (
    <mesh
      geometry={archGeo}
      castShadow
      receiveShadow
      position={[x - thick / 2, 0, z]}
      rotation={[0, Math.PI / 2, 0]}
    >
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Wall arches (decorative recesses) ───────────────────────────────────────
function WallArches({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const hw = ROOM.width / 2 - 0.05;
  const zPositions = [-20, -10, 0, 10, 20];
  return (
    <>
      {zPositions.map((z) => (
        <group key={z}>
          <Arch x={-hw} z={z} width={3.2} mat={mat} />
          <Arch x={ hw} z={z} width={3.2} mat={mat} />
        </group>
      ))}
    </>
  );
}

// ─── Gold trim strips along walls ────────────────────────────────────────────
function TrimStrips({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const hw = ROOM.width / 2;
  const hd = ROOM.depth / 2;
  const y  = 0.04;
  const h  = 0.06;
  return (
    <>
      {/* Floor-level skirting — left/right walls */}
      <mesh position={[-hw + 0.02, y, 0]} castShadow>
        <boxGeometry args={[h, h, ROOM.depth]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[hw - 0.02, y, 0]} castShadow>
        <boxGeometry args={[h, h, ROOM.depth]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Floor-level skirting — front/back walls */}
      <mesh position={[0, y, -hd + 0.02]} castShadow>
        <boxGeometry args={[ROOM.width, h, h]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[0, y, hd - 0.02]} castShadow>
        <boxGeometry args={[ROOM.width, h, h]} />
        <primitive object={mat} attach="material" />
      </mesh>
      {/* Ceiling cornice — left/right */}
      <mesh position={[-hw + 0.02, ROOM.height - 0.06, 0]}>
        <boxGeometry args={[h, h, ROOM.depth]} />
        <primitive object={mat} attach="material" />
      </mesh>
      <mesh position={[hw - 0.02, ROOM.height - 0.06, 0]}>
        <boxGeometry args={[h, h, ROOM.depth]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </>
  );
}

// ─── Central runner (floor stripe) ───────────────────────────────────────────
function FloorRunner({ mat }: { mat: THREE.MeshStandardMaterial }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
      <planeGeometry args={[1.2, ROOM.depth]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

// ─── Ceiling coffers (recessed panels) ───────────────────────────────────────
function CeilingCoffers({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const cofferRef = useRef<THREE.InstancedMesh>(null);
  const cols = 4;
  const rows = 10;
  const geo  = useMemo(() => new THREE.BoxGeometry(4.5, 0.12, 4.5), []);

  useMemo(() => {
    if (!cofferRef.current) return;
    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = (c - (cols - 1) / 2) * 5.5;
        const z = (r - (rows - 1) / 2) * 5.5;
        dummy.position.set(x, ROOM.height - 0.06, z);
        dummy.updateMatrix();
        cofferRef.current.setMatrixAt(idx++, dummy.matrix);
      }
    }
    cofferRef.current.instanceMatrix.needsUpdate = true;
  }, [cols, rows]);

  return (
    <instancedMesh ref={cofferRef} args={[geo, mat, cols * rows]} receiveShadow />
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryArchitecture() {
  const { floor, wall, ceiling, column, trim, archInner } = useMaterials();

  return (
    <group>
      <Floor    mat={floor}    />
      <Ceiling  mat={ceiling}  />
      <Walls    mat={wall}     />
      <Columns  colMat={column} trimMat={trim} />
      <WallArches mat={archInner} />
      <TrimStrips mat={trim}   />
      <FloorRunner mat={trim}  />
      <CeilingCoffers mat={ceiling} />
    </group>
  );
}
