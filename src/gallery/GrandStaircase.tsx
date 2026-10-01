import { useMemo } from 'react';
import * as THREE from 'three';
import { MAT, SPACES, makeMat, LIGHT } from './constants';

const STEP_COUNT = 16;

export default function GrandStaircase() {
  const mStair  = useMemo(() => makeMat(MAT.stair),  []);
  const mMetal  = useMemo(() => makeMat(MAT.metal),  []);
  const mGold   = useMemo(() => makeMat(MAT.gold),   []);
  const mGlass  = useMemo(() => makeMat(MAT.glass),  []);

  const { startZ, endZ, startY, endY, width, cx } = SPACES.stair;

  const totalZ   = startZ - endZ;          // depth span
  const totalY   = endY - startY;
  const stepD    = totalZ / STEP_COUNT;    // depth per step
  const stepH    = totalY / STEP_COUNT;    // height per step
  const stepW    = width;

  // Landing at top
  const landingZ = endZ;
  const landingY = endY;

  const steps = useMemo(() => {
    const arr = [];
    for (let i = 0; i < STEP_COUNT; i++) {
      const z = startZ - i * stepD - stepD / 2;
      const y = startY + i * stepH + stepH / 2;
      arr.push({ z, y, i });
    }
    return arr;
  }, [startZ, startY, stepD, stepH]);

  // Railing posts — every 3 steps
  const railPosts = useMemo(() => {
    const posts = [];
    for (let i = 0; i <= STEP_COUNT; i += 3) {
      const z = startZ - i * stepD;
      const y = startY + i * stepH;
      posts.push({ z, y });
    }
    return posts;
  }, [startZ, startY, stepD, stepH]);

  return (
    <group position={[cx, 0, 0]}>
      {/* Steps */}
      {steps.map(({ z, y, i }) => (
        <group key={i}>
          {/* Tread */}
          <mesh castShadow receiveShadow position={[0, y, z]}>
            <boxGeometry args={[stepW, stepH * 0.35, stepD + 0.02]} />
            <primitive object={mStair} attach="material" />
          </mesh>
          {/* Riser */}
          <mesh castShadow position={[0, y - stepH * 0.32, z + stepD / 2]}>
            <boxGeometry args={[stepW, stepH * 0.65, 0.04]} />
            <primitive object={mMetal} attach="material" />
          </mesh>
          {/* Under-step warm glow light — every 4th step */}
          {i % 4 === 0 && (
            <pointLight
              position={[0, y - stepH * 0.5, z + stepD * 0.3]}
              color={LIGHT.stairGlow}
              intensity={1.8}
              distance={3.5}
              decay={2}
            />
          )}
        </group>
      ))}

      {/* Landing platform */}
      <mesh castShadow receiveShadow position={[0, landingY + 0.12, landingZ - 2]}>
        <boxGeometry args={[stepW, 0.24, 4]} />
        <primitive object={mStair} attach="material" />
      </mesh>

      {/* Stringer — solid side wall under stair (left side) */}
      <mesh castShadow receiveShadow
        position={[-stepW / 2 + 0.12, totalY / 2, (startZ + endZ) / 2]}>
        <boxGeometry args={[0.24, totalY + 0.5, totalZ + 0.5]} />
        <primitive object={mMetal} attach="material" />
      </mesh>

      {/* Railing posts (open side — right) */}
      {railPosts.map(({ z, y }, idx) => (
        <mesh key={idx} castShadow
          position={[stepW / 2 - 0.06, y + 0.55, z]}>
          <boxGeometry args={[0.06, 1.1, 0.06]} />
          <primitive object={mMetal} attach="material" />
        </mesh>
      ))}

      {/* Handrail — top rail along open side */}
      <mesh castShadow
        position={[stepW / 2 - 0.06, totalY / 2 + 1.05, (startZ + endZ) / 2]}
        rotation={[0, 0, -Math.atan2(totalY, totalZ)]}>
        <boxGeometry args={[0.06, 0.06, Math.sqrt(totalZ * totalZ + totalY * totalY) + 1]} />
        <primitive object={mGold} attach="material" />
      </mesh>

      {/* Glass railing panel — open side */}
      <mesh
        position={[stepW / 2 - 0.06, totalY / 2 + 0.5, (startZ + endZ) / 2]}
        rotation={[0, 0, -Math.atan2(totalY, totalZ)]}>
        <boxGeometry args={[0.04, 0.9, Math.sqrt(totalZ * totalZ + totalY * totalY)]} />
        <primitive object={mGlass} attach="material" />
      </mesh>
    </group>
  );
}
