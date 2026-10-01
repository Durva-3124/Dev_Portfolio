import { useRef } from 'react';
import { useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { ARTWORKS } from './constants';

// ─── Artwork spotlights ───────────────────────────────────────────────────────
function ArtworkSpotlight({
  position,
  targetPosition,
}: {
  position: [number, number, number];
  targetPosition: [number, number, number];
}) {
  const targetRef = useRef<THREE.Object3D>(null);
  return (
    <>
      <object3D ref={targetRef} position={targetPosition} />
      <spotLight
        position={position}
        target={targetRef.current ?? undefined}
        color={0xfff8f0}
        intensity={35}
        angle={0.35}
        penumbra={0.7}
        distance={12}
        decay={2}
        castShadow={false}
      />
    </>
  );
}

export default function GalleryLighting() {
  return (
    <>
      {/* ── Hemisphere: sky warm white, ground warm grey ─────────────────── */}
      <hemisphereLight
        args={[0xfff8f0, 0xd8d1c5, 0.85]}
      />

      {/* ── Key directional — simulates high window / skylight ───────────── */}
      <directionalLight
        color={0xfff5e8}
        intensity={1.4}
        position={[8, 22, 12]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* ── Fill from opposite side — softer, cooler ─────────────────────── */}
      <directionalLight
        color={0xf0f4ff}
        intensity={0.35}
        position={[-12, 10, -8]}
        castShadow={false}
      />

      {/* ── Entrance vestibule — soft overhead ───────────────────────────── */}
      <pointLight
        position={[0, 4.5, 22]}
        color={0xfff8f0}
        intensity={12}
        distance={14}
        decay={2}
        castShadow
        shadow-mapSize-width={256}
        shadow-mapSize-height={256}
        shadow-camera-near={0.2}
        shadow-camera-far={14}
        shadow-bias={-0.002}
      />

      {/* ── Main gallery ground — two overhead fills ─────────────────────── */}
      <pointLight position={[-2, 8, 4]}  color={0xfff8f0} intensity={18} distance={18} decay={2} />
      <pointLight position={[ 2, 8, -8]} color={0xfff8f0} intensity={18} distance={18} decay={2} />

      {/* ── Stair hall overhead ───────────────────────────────────────────── */}
      <pointLight position={[3, 11, -22]} color={0xfff8f0} intensity={22} distance={20} decay={2} castShadow={false} />

      {/* ── Stair under-step warm glow ────────────────────────────────────── */}
      <pointLight position={[3, 1.5, -16]} color={0xffe8c0} intensity={6} distance={8} decay={2} />
      <pointLight position={[3, 3.5, -20]} color={0xffe8c0} intensity={6} distance={8} decay={2} />

      {/* ── Upper gallery — bright, clean ────────────────────────────────── */}
      <pointLight position={[0, 10.5, -32]} color={0xfff8f0} intensity={28} distance={22} decay={2} />
      <pointLight position={[0, 10.5, -40]} color={0xfff8f0} intensity={28} distance={22} decay={2} />

      {/* ── Artwork spotlights ────────────────────────────────────────────── */}
      {/* meetsync-AI — left wall */}
      <ArtworkSpotlight
        position={[-6, 8, -2]}
        targetPosition={[-9.2, 3.2, -2]}
      />
      {/* BullSight — right wall */}
      <ArtworkSpotlight
        position={[6, 8, -6]}
        targetPosition={[9.2, 3.2, -6]}
      />
      {/* TejaLens — upper gallery back wall */}
      <ArtworkSpotlight
        position={[0, 11, -36]}
        targetPosition={[0, 8.2, -40]}
      />
    </>
  );
}
