import { useMemo } from 'react';
import * as THREE from 'three';
import { COLORS, ROOM } from './constants';

// Ceiling pendant lights spaced along the hall
function PendantLights() {
  const positions = useMemo<[number, number, number][]>(() => {
    const pts: [number, number, number][] = [];
    const zSteps = [-22, -14, -6, 2, 10, 18];
    for (const z of zSteps) {
      pts.push([0, ROOM.height - 0.3, z]);
    }
    return pts;
  }, []);

  return (
    <>
      {positions.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          {/* Visible pendant geometry */}
          <mesh castShadow>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={COLORS.warmWhite}
              emissive={new THREE.Color(COLORS.warmWhite)}
              emissiveIntensity={2.5}
              roughness={0.1}
              metalness={0.4}
            />
          </mesh>
          {/* Actual light */}
          <pointLight
            color={COLORS.warmWhite}
            intensity={18}
            distance={14}
            decay={2}
            castShadow
            shadow-mapSize-width={256}
            shadow-mapSize-height={256}
            shadow-camera-near={0.1}
            shadow-camera-far={14}
          />
        </group>
      ))}
    </>
  );
}

// Burgundy accent wall sconces
function WallSconces() {
  const hw = ROOM.width / 2 - 0.6;
  const zPositions = [-20, -10, 0, 10, 20];
  const sconceMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: COLORS.accentTint,
        emissive: new THREE.Color(COLORS.accentTint),
        emissiveIntensity: 1.2,
        roughness: 0.2,
        metalness: 0.6,
      }),
    []
  );

  return (
    <>
      {zPositions.map((z) => (
        <group key={z}>
          {/* Left sconce */}
          <group position={[-hw, 3.2, z]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.22, 0.22]} />
              <primitive object={sconceMat} attach="material" />
            </mesh>
            <pointLight
              color={COLORS.accentTint}
              intensity={4}
              distance={5}
              decay={2}
            />
          </group>
          {/* Right sconce */}
          <group position={[hw, 3.2, z]}>
            <mesh castShadow>
              <boxGeometry args={[0.08, 0.22, 0.22]} />
              <primitive object={sconceMat} attach="material" />
            </mesh>
            <pointLight
              color={COLORS.accentTint}
              intensity={4}
              distance={5}
              decay={2}
            />
          </group>
        </group>
      ))}
    </>
  );
}

// Gold floor-level accent strip lights
function FloorAccentLights() {
  const hw = ROOM.width / 2 - 0.3;
  const zPositions = [-22, -12, -2, 8, 18];
  return (
    <>
      {zPositions.map((z) => (
        <group key={z}>
          <pointLight
            position={[-hw, 0.15, z]}
            color={COLORS.accentSecondary}
            intensity={2.5}
            distance={4}
            decay={2}
          />
          <pointLight
            position={[hw, 0.15, z]}
            color={COLORS.accentSecondary}
            intensity={2.5}
            distance={4}
            decay={2}
          />
        </group>
      ))}
    </>
  );
}

export default function GalleryLighting() {
  return (
    <>
      {/* Global ambient — very dim, sets the dark mood */}
      <ambientLight color={COLORS.warmWhite} intensity={0.18} />

      {/* Single soft directional for overall shadow direction */}
      <directionalLight
        color={COLORS.warmWhite}
        intensity={0.6}
        position={[4, 12, 8]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.001}
      />

      <PendantLights />
      <WallSconces />
      <FloorAccentLights />
    </>
  );
}
