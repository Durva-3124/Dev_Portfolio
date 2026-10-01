import { useRef } from 'react';
import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';

RectAreaLightUniformsLib.init();

// Spotlight with proper object3D target
function ArtSpot({ from, to, intensity = 40, angle = 0.28 }: {
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
        color={0xfff8f0}
        intensity={intensity}
        angle={angle}
        penumbra={0.75}
        distance={20}
        decay={2}
        castShadow={false}
      />
    </>
  );
}

export default function GalleryLighting() {
  return (
    <>
      {/* Hemisphere — warm sky, neutral ground */}
      <hemisphereLight args={[0xfff8f0, 0xd8d0c4, 0.90]} />

      {/* Primary directional — soft daylight from upper-left */}
      {/* Intensity 1.2 — enough for defined shadows without clipping */}
      <directionalLight
        color={0xfff8ee}
        intensity={1.2}
        position={[10, 24, 14]}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={2}
        shadow-camera-far={100}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0006}
        shadow-normalBias={0.03}
        shadow-radius={2}
      />

      {/* Soft fill from opposite side */}
      <directionalLight
        color={0xeef2ff}
        intensity={0.32}
        position={[-8, 10, -10]}
        castShadow={false}
      />

      {/* Per-space ambient fills — keep them gentle */}
      <pointLight position={[0,  4.0,  22]} color={0xfff8f0} intensity={6}  distance={14} decay={2} />
      <pointLight position={[0,  7.5,   2]} color={0xfff8f0} intensity={10} distance={22} decay={2} />
      <pointLight position={[0,  7.5,  -8]} color={0xfff8f0} intensity={10} distance={22} decay={2} />
      <pointLight position={[3, 10.0, -22]} color={0xfff8f0} intensity={14} distance={24} decay={2} />
      <pointLight position={[0,  9.5, -32]} color={0xfff8f0} intensity={16} distance={26} decay={2} />
      <pointLight position={[0,  9.5, -40]} color={0xfff8f0} intensity={16} distance={26} decay={2} />

      {/* Artwork RectAreaLights — warm wash across canvas */}
      <rectAreaLight
        position={[-7.5, 3.0, -2]}
        rotation={new THREE.Euler(0, Math.PI / 2, 0)}
        color={0xfff5e8}
        intensity={8}
        width={3.5}
        height={3.0}
      />
      <rectAreaLight
        position={[7.5, 3.0, -6]}
        rotation={new THREE.Euler(0, -Math.PI / 2, 0)}
        color={0xfff5e8}
        intensity={8}
        width={3.5}
        height={3.0}
      />
      <rectAreaLight
        position={[0, 8.2 + 5.2, -42]}
        rotation={new THREE.Euler(0, 0, 0)}
        color={0xfff8f2}
        intensity={10}
        width={5.0}
        height={3.8}
      />

      {/* Artwork accent spotlights */}
      <ArtSpot from={[-5.0, 8.0, -2]}  to={[-9.8, 3.0, -2]}  />
      <ArtSpot from={[ 5.0, 8.0, -6]}  to={[ 9.8, 3.0, -6]}  />
      <ArtSpot from={[0, 10.5, -37]}   to={[0, 8.2+5.2, -44.5]} intensity={50} angle={0.26} />
    </>
  );
}
