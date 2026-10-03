/**
 * GalleryLighting.tsx — PART B.4, B.7, B.9
 * ─────────────────────────────────────────────────────────────────────────────
 * • Lights are deliberately restrained so the plaster shows soft gradients and
 *   readable shadow instead of clipping to white (hemisphere 0.5, spots about
 *   half the old rig; exposure 0.9 is set on the gl config in GalleryWorld).
 * • Every spotlight target is `useMemo(() => new THREE.Object3D())`, rendered
 *   into the scene graph with `<primitive object={target} position={to} />` and
 *   handed to the light as `target={target}`. Without that primitive the
 *   target's matrixWorld stays at the origin and the light aims at the world
 *   origin — exactly the bug class PART B.4 is about.
 * • Every target point is `artworkGroupCentre()` straight out of layout.ts, so a
 *   TejaLens target can only ever be floorY + 3.0 = 8.2, never 8.2 + 5.2.
 * • The directional shadow frustum follows the camera, so shadows stay sharp
 *   across the whole z 30 → −58 run.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import {
  ARTWORKS, ROOMS_LAYOUT, artworkGroupCentre, roomCentreZ,
} from './constants';

RectAreaLightUniformsLib.init();

const KEY_COLOR = 0xFFF6E8;
const FILL_COLOR = 0xDCE6FF;

// ─── Key light: frustum tracks the camera (PART B.9) ─────────────────────────
function SunRig() {
  const light = useRef<THREE.DirectionalLight>(null);
  const target = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ camera }) => {
    const l = light.current;
    if (!l) return;
    const { x, y, z } = camera.position;
    l.position.set(x - 13, y + 20, z + 15);
    target.position.set(x, y - 2, z - 8);
    target.updateMatrixWorld();
  });

  return (
    <>
      <primitive object={target} />
      <directionalLight
        ref={light}
        target={target}
        color={KEY_COLOR}
        intensity={1.05}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={70}
        shadow-camera-left={-22}
        shadow-camera-right={22}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={4}
      />
    </>
  );
}

// ─── Artwork spotlight with a real, scene-graph target (PART B.7) ────────────
function ArtworkSpot({ artId, intensity, color = 0xFFF3E4 }: {
  artId: string; intensity: number; color?: number;
}) {
  const target = useMemo(() => new THREE.Object3D(), []);
  const to = useMemo<[number, number, number]>(() => {
    const a = ARTWORKS.find(x => x.id === artId)!;
    return artworkGroupCentre(a);            // the artwork CENTRE — never +5.2
  }, [artId]);
  const from = useMemo<[number, number, number]>(() => {
    const a = ARTWORKS.find(x => x.id === artId)!;
    return [
      to[0] + a.normal[0] * 2.4,
      to[1] + a.height * 0.8 + 0.5,
      to[2] + a.normal[2] * 2.4,
    ];
  }, [artId, to]);

  return (
    <>
      <primitive object={target} position={to} />
      <spotLight
        position={from}
        target={target}
        color={color}
        intensity={intensity}
        angle={0.5}
        penumbra={0.9}
        decay={1.7}
        distance={16}
      />
    </>
  );
}
// ─── Room fill lights (positions expressed from the room tables) ────────────
function RoomFill() {
  const v = ROOMS_LAYOUT.vestibule;
  const g = ROOMS_LAYOUT.gallery;
  const s = ROOMS_LAYOUT.stairhall;
  const u = ROOMS_LAYOUT.upper;

  return (
    <>
      {/* Vestibule skylight */}
      <rectAreaLight
        position={[0, v.ceilingY - 0.7, roomCentreZ(v)]}
        rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
        color={0xFFFAF0}
        intensity={3.6}
        width={7}
        height={7}
      />
      {/* Main gallery — one wash per wall */}
      <rectAreaLight
        position={[-9.0, g.floorY + 6.4, 4]}
        rotation={new THREE.Euler(0, Math.PI / 2, 0)}
        color={0xFFF8F0}
        intensity={3.4}
        width={6}
        height={7}
      />
      <rectAreaLight
        position={[9.0, g.floorY + 6.4, -4]}
        rotation={new THREE.Euler(0, -Math.PI / 2, 0)}
        color={0xFFF8F0}
        intensity={3.4}
        width={6}
        height={7}
      />
      {/* Stair hall — low and high, so the whole climb stays lit */}
      <rectAreaLight
        position={[-9.0, 4.2, -19]}
        rotation={new THREE.Euler(0, Math.PI / 2, 0)}
        color={0xFFF5E8}
        intensity={2.8}
        width={5}
        height={6}
      />
      <rectAreaLight
        position={[9.0, 7.6, -28]}
        rotation={new THREE.Euler(0, -Math.PI / 2, 0)}
        color={0xFFF5E8}
        intensity={2.8}
        width={5}
        height={6}
      />
      {/* Upper gallery skylight */}
      <rectAreaLight
        position={[0, u.ceilingY - 0.7, roomCentreZ(u)]}
        rotation={new THREE.Euler(Math.PI / 2, 0, 0)}
        color={0xFFFAF2}
        intensity={3.8}
        width={10}
        height={8}
      />
      {/* Warm bounce along the stair-hall axis — about half the old point rig */}
      <pointLight
        position={[0, 6.2, -20]}
        color={0xFFEEDA}
        intensity={4.5}
        distance={16}
        decay={2}
      />
      <pointLight
        position={[0, s.ceilingY - 3.5, -30]}
        color={0xFFEEDA}
        intensity={4.0}
        distance={16}
        decay={2}
      />
    </>
  );
}

export default function GalleryLighting() {
  return (
    <>
      {/* Sky / ground bounce — restrained (PART B.9) */}
      <hemisphereLight args={[0xFFF0DC, 0xB9B0A2, 0.5]} />

      <SunRig />

      {/* Cool fill from the opposite side so shadows never go pure black */}
      <directionalLight color={FILL_COLOR} intensity={0.12} position={[10, 9, -12]} castShadow={false} />

      <RoomFill />

      {/* One spot per artwork, every one aimed at the artwork centre */}
      {ARTWORKS.map(a => (
        <ArtworkSpot key={a.id} artId={a.id} intensity={a.id === 'tejalens' ? 26 : 18} />
      ))}
    </>
  );
}