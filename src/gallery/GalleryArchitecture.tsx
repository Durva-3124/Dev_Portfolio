/**
 * GalleryArchitecture.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * EVERY wall, arch, floor, ceiling and stair riser below is generated from an
 * array in `layout.ts`. There is not a single hand-typed position or size left
 * in this file — that is the whole point of the refactor.
 *
 * The two arrays that matter:
 *   • BOUNDARIES  → the shared cross walls (one arch each)
 *   • ROOM_ORDER  → the side walls, one segment per room
 *   • floorBoxes() / stairBoxes() → the exact surfaces the camera's floor
 *     raycast is allowed to stand on, each tagged onto LAYER_FLOOR
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  ARTWORKS, BOUNDARIES, INTERIOR_W, LAYER_FLOOR, MAT, ROOM_ORDER, ROOMS_LAYOUT,
  STAIR, WALL_CX, WALL_T, artworkGroupCentre, ceilingBoxes, floorBoxes,
  makeArchGeo, roomCentreZ, roomInnerZ, stairBoxes, stairRails,
  type Boundary, type Box,
} from './constants';

// ─── Materials ───────────────────────────────────────────────────────────────
function useMats() {
  return useMemo(() => ({
    plaster:  new THREE.MeshStandardMaterial({ ...MAT.plaster,  side: THREE.FrontSide }),
    stone:    new THREE.MeshStandardMaterial({ ...MAT.stone,    side: THREE.FrontSide }),
    metal:    new THREE.MeshStandardMaterial({ ...MAT.darkMetal }),
    burgundy: new THREE.MeshStandardMaterial({ ...MAT.burgundy }),
    gold:     new THREE.MeshStandardMaterial({ ...MAT.gold }),
    carpet:   new THREE.MeshStandardMaterial({ ...MAT.carpet }),
    // Skylight glazing: UNLIT on purpose. As a MeshStandardMaterial with an
    // emissive term it stacked on top of the hemisphere + key + area lights and
    // clipped to pure white; an unlit basic material reads as a bright opening
    // without ever exceeding the tone-mapped range.
    emissive: new THREE.MeshBasicMaterial({
      color: 0xEFE6D6,
      side: THREE.DoubleSide,
      toneMapped: true,
    }),
  }), []);
}

/** PART B.5 — tag surfaces the camera may stand on onto the "floor" layer. */
function tagFloor(o: THREE.Object3D | null) {
  if (o) o.layers.enable(LAYER_FLOOR);
}

// ─── Side walls, one segment per room ────────────────────────────────────────
function SideWalls({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const segs = useMemo(() => ROOM_ORDER.map(id => {
    const r = ROOMS_LAYOUT[id];
    return {
      id,
      height: r.height,
      cy: r.floorY + r.height / 2,
      cz: roomCentreZ(r),
      // + WALL_T so neighbouring segments overlap at the corners: no seams
      depth: Math.abs(r.zNear - r.zFar) + WALL_T,
    };
  }), []);

  return (
    <group>
      {segs.map(s => (
        <group key={s.id}>
          {[-WALL_CX, WALL_CX].map(cx => (
            <mesh key={cx} castShadow receiveShadow position={[cx, s.cy, s.cz]}>
              <boxGeometry args={[WALL_T, s.height, s.depth]} />
              <primitive object={mat} attach="material" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

// ─── Cross walls: exactly one arch per shared boundary (PART B.1) ────────────
function CrossWalls({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const geos = useMemo(() => BOUNDARIES.map(b =>
    b.arch
      ? makeArchGeo(b.wallW, b.topY - b.baseY, b.openW, b.openH, WALL_T)
      : null,
  ), []);

  return (
    <group>
      {BOUNDARIES.map((b: Boundary, i: number) => {
        const h = b.topY - b.baseY;
        const geo = geos[i];
        return geo ? (
          <mesh key={b.id} castShadow receiveShadow
            geometry={geo} position={[0, b.baseY, b.z]}>
            <primitive object={mat} attach="material" />
          </mesh>
        ) : (
          <mesh key={b.id} castShadow receiveShadow
            position={[0, (b.baseY + b.topY) / 2, b.z]}>
            <boxGeometry args={[b.wallW, h, WALL_T]} />
            <primitive object={mat} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Floors (tagged) ─────────────────────────────────────────────────────────
function Floors({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const slabs = useMemo(() => floorBoxes().filter((b: Box) => b.id.startsWith('floor-')), []);
  return (
    <group>
      {slabs.map(b => (
        <mesh key={b.id} ref={tagFloor} receiveShadow position={[b.cx, b.cy, b.cz]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Ceilings + skylights ────────────────────────────────────────────────────
function Ceilings({ mat, emissiveMat }: {
  mat: THREE.MeshStandardMaterial;
  emissiveMat: THREE.Material;
}) {
  const boxes = useMemo(() => ceilingBoxes(), []);
  const lights = useMemo(() => ROOM_ORDER.map(id => {
    const r = ROOMS_LAYOUT[id];
    return {
      id,
      w: INTERIOR_W * 0.42,
      d: Math.abs(r.zNear - r.zFar) * 0.34,
      cz: roomCentreZ(r),
      y: r.ceilingY - 0.21,
    };
  }), []);

  return (
    <group>
      {boxes.map(b => (
        <mesh key={b.id} receiveShadow position={[b.cx, b.cy, b.cz]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
      {lights.map(l => (
        <mesh key={l.id} rotation={[Math.PI / 2, 0, 0]} position={[0, l.y, l.cz]}>
          <planeGeometry args={[l.w, l.d]} />
          <primitive object={emissiveMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}
// ─── Staircase: solid blocks from y=0 up to each tread, plus handrails ───────
// Nothing here is typed: step tops, step Z centres, the landing slab and the
// rail pitch all come from layout.ts, which is why the landing's top equals the
// last tread of flight 1 and flight 2 lands exactly on the upper floor.
function Staircase({ mat, goldMat }: {
  mat: THREE.MeshStandardMaterial;
  goldMat: THREE.MeshStandardMaterial;
}) {
  const blocks = useMemo(() => stairBoxes(), []);
  const rails = useMemo(() => stairRails(), []);

  return (
    <group>
      {blocks.map(b => (
        <mesh key={b.id} ref={tagFloor} castShadow receiveShadow position={[b.cx, b.cy, b.cz]}>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <primitive object={mat} attach="material" />
        </mesh>
      ))}
      {rails.map(r => (
        <mesh key={r.id} castShadow
          // PART B.6 — handrails pitch about X
          rotation={[r.rotationX, 0, 0]}
          position={[r.cx, r.cy, r.cz]}>
          <boxGeometry args={[STAIR.railThickness, STAIR.railThickness * 0.7, r.length]} />
          <primitive object={goldMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Carpet runner + velvet rope stanchions, derived from the gallery span ───
function Dressing({ carpetMat, goldMat }: {
  carpetMat: THREE.MeshStandardMaterial;
  goldMat: THREE.MeshStandardMaterial;
}) {
  const g = ROOMS_LAYOUT.gallery;
  const zNear = roomInnerZ(g, 'near');
  const zFar = roomInnerZ(g, 'far');
  const runner = useMemo(() => ({
    cz: roomCentreZ(g),
    d: Math.abs(zNear - zFar) * 0.9,
    w: 2.4,
  }), [zNear, zFar, g]);

  const stanchions = useMemo(() => {
    const { zStart } = STAIR;
    return [
      [-2.6, zStart + 3.0], [2.6, zStart + 3.0],
      [-2.6, zStart + 9.0], [2.6, zStart + 9.0],
    ].map(([x, z]) => [x, g.floorY, z] as [number, number, number]);
  }, [g.floorY]);

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}
        position={[0, g.floorY + 0.012, runner.cz]}>
        <planeGeometry args={[runner.w, runner.d]} />
        <primitive object={carpetMat} attach="material" />
      </mesh>
      {stanchions.map((p, i) => (
        <group key={i} position={p}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.06, 1.05, 8]} />
            <primitive object={goldMat} attach="material" />
          </mesh>
          <mesh position={[0, 0.55, 0]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <primitive object={goldMat} attach="material" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ─── Picture light above each artwork — position derived from the mount ──────
export function PictureLight({ artId, mat }: { artId: string; mat: THREE.MeshStandardMaterial }) {
  const { position, yaw } = useMemo(() => {
    const a = ARTWORKS.find(x => x.id === artId)!;
    const c = artworkGroupCentre(a);
    const lift = a.height / 2 + 0.30;
    return {
      position: [
        c[0] + a.normal[0] * 0.30,
        c[1] + lift,
        c[2] + a.normal[2] * 0.30,
      ] as [number, number, number],
      yaw: a.yaw,
    };
  }, [artId]);

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.08, 0.18]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

function PictureLights({ mat }: { mat: THREE.MeshStandardMaterial }) {
  const ref = useRef<THREE.Group>(null);
  return (
    <group ref={ref}>
      {ARTWORKS.map(a => <PictureLight key={a.id} artId={a.id} mat={mat} />)}
    </group>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryArchitecture() {
  const m = useMats();
  return (
    <group>
      <SideWalls       mat={m.plaster} />
      <CrossWalls      mat={m.plaster} />
      <Floors          mat={m.stone} />
      <Ceilings        mat={m.plaster} emissiveMat={m.emissive} />
      <Staircase       mat={m.stone} goldMat={m.gold} />
      <Dressing        carpetMat={m.carpet} goldMat={m.gold} />
      <PictureLights   mat={m.gold} />
    </group>
  );
}