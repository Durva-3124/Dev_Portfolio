import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { useThree } from '@react-three/fiber';

// Initialise RectAreaLight uniforms once
RectAreaLightUniformsLib.init();

// ─── RectAreaLight wrapper ────────────────────────────────────────────────────
function RectArea({
  position, rotation, color, intensity, width, height,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: number;
  intensity: number;
  width: number;
  height: number;
}) {
  const lightRef = useRef<THREE.RectAreaLight>(null);
  const { scene } = useThree();

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    scene.add(light);
    return () => { scene.remove(light); };
  }, [scene]);

  return (
    <rectAreaLight
      ref={lightRef}
      position={position}
      rotation={new THREE.Euler(...rotation)}
      color={color}
      intensity={intensity}
      width={width}
      height={height}
    />
  );
}

// ─── Artwork spotlight with proper target ───────────────────────────────────
function ArtSpot({
  from, to, intensity = 55, angle = 0.30,
}: {
  from: [number,number,number];
  to:   [number,number,number];
  intensity?: number;
  angle?: number;
}) {
  const targetRef = useRef<THREE.Object3D>(null);
  return (
    <>
      <object3D ref={targetRef} position={to} />
      <spotLight
        position={from}
        target={targetRef.current ?? undefined}
        color={0xfff5e0}
        intensity={intensity}
        angle={angle}
        penumbra={0.65}
        distance={18}
        decay={2}
        castShadow={false}
      />
    </>
  );
}

// ─── Main lighting ────────────────────────────────────────────────────────────
export default function GalleryLighting() {
  return (
    <>
      {/* ── Hemisphere: warm sky, cool ground ───────────────────────────── */}
      <hemisphereLight args={[0xfff5e8, 0xd0c8bc, 0.70]} />

      {/* ── Primary sun — strong diagonal from upper-right ──────────────── */}
      {/* Creates large shadow shapes across floors and stairs */}
      <directionalLight
        color={0xfff5e0}
        intensity={2.2}
        position={[14, 28, 18]}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      {/* ── Secondary fill — opposite side, cooler ───────────────────────── */}
      <directionalLight
        color={0xe8f0ff}
        intensity={0.28}
        position={[-10, 12, -6]}
        castShadow={false}
      />

      {/* ── Skylight fill — soft overhead for each major space ───────────── */}
      {/* Entrance */}
      <pointLight position={[0, 4.2, 22]}  color={0xfff8f0} intensity={8}  distance={14} decay={2} />
      {/* Main gallery — two fills */}
      <pointLight position={[-2, 8, 4]}    color={0xfff8f0} intensity={14} distance={20} decay={2} />
      <pointLight position={[ 2, 8, -8]}   color={0xfff8f0} intensity={14} distance={20} decay={2} />
      {/* Stair hall */}
      <pointLight position={[3, 10, -22]}  color={0xfff8f0} intensity={18} distance={22} decay={2} />
      {/* Upper gallery */}
      <pointLight position={[0, 10, -32]}  color={0xfff8f0} intensity={22} distance={24} decay={2} />
      <pointLight position={[0, 10, -40]}  color={0xfff8f0} intensity={22} distance={24} decay={2} />

      {/* ── Artwork RectAreaLights — warm, directional ───────────────────── */}
      {/* meetsync-AI — left wall, facing right (+X) */}
      <RectArea
        position={[-8.0, 3.2, -2]}
        rotation={[0, Math.PI / 2, 0]}
        color={0xfff5e8}
        intensity={12}
        width={4.0}
        height={3.2}
      />
      {/* BullSight — right wall, facing left (-X) */}
      <RectArea
        position={[8.0, 3.2, -6]}
        rotation={[0, -Math.PI / 2, 0]}
        color={0xfff5e8}
        intensity={12}
        width={4.0}
        height={3.2}
      />
      {/* TejaLens — upper gallery back wall, facing forward (+Z) */}
      <RectArea
        position={[0, 8.2, -43.5]}
        rotation={[0, 0, 0]}
        color={0xfff8f2}
        intensity={16}
        width={6.0}
        height={4.0}
      />

      {/* ── Accent spotlights — tighter cone on each artwork ─────────────── */}
      <ArtSpot from={[-5.5, 8.5, -2]}  to={[-9.2, 3.2, -2]}  />
      <ArtSpot from={[ 5.5, 8.5, -6]}  to={[ 9.2, 3.2, -6]}  />
      <ArtSpot from={[0, 10.8, -36]}   to={[0, 8.2+5.2, -40]} intensity={70} angle={0.28} />
    </>
  );
}
