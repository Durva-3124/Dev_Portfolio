/**
 * EntranceRoom.tsx — Room 01, the vestibule.
 * Every position is derived from layout.ts:
 *   • the "DURVA" name plate itself lives in the artwork manifest and is drawn
 *     by ProjectArtworks on the vestibule LEFT wall, facing into the room
 *   • the rotating role + one-liner hang UNDER that plate on the same wall
 *   • the bust stands at HALF_W − 2.8 on the opposite side of the vestibule axis
 * The pointer is read from the mutable store in useFrame (PART B.10).
 */
import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import {
  HALF_W, ROOMS_LAYOUT, hero, roomCentreZ, scrollStore, wallPoint,
} from '../constants';

// ─── Procedural bust on a plinth ─────────────────────────────────────────────
function ProceduralBust() {
  const headRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!headRef.current) return;
    headRef.current.rotation.y = THREE.MathUtils.lerp(
      headRef.current.rotation.y, scrollStore.mouseX * 0.4, 0.05,
    );
    headRef.current.rotation.x = THREE.MathUtils.lerp(
      headRef.current.rotation.x, -scrollStore.mouseY * 0.15, 0.05,
    );
  });

  const burgundy = useMemo(() => new THREE.MeshStandardMaterial({ color: 0x6F1028, roughness: 0.55, metalness: 0 }), []);
  const gold     = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xB08F52, roughness: 0.34, metalness: 0.62 }), []);
  const stone    = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xC9BFB0, roughness: 0.68, metalness: 0 }), []);

  const v = ROOMS_LAYOUT.vestibule;
  const pos = useMemo<[number, number, number]>(
    () => [HALF_W - 2.8, v.floorY, roomCentreZ(v) - 2.5],
    [v],
  );

  return (
    <group position={pos}>
      <mesh receiveShadow castShadow position={[0, 0.55, 0]}>
        <boxGeometry args={[0.9, 1.1, 0.9]} />
        <primitive object={stone} attach="material" />
      </mesh>
      <mesh receiveShadow castShadow position={[0, 1.12, 0]}>
        <boxGeometry args={[1.0, 0.06, 1.0]} />
        <primitive object={gold} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.55, 8]} />
        <primitive object={burgundy} attach="material" />
      </mesh>
      <mesh castShadow position={[0, 2.08, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.22, 8]} />
        <primitive object={burgundy} attach="material" />
      </mesh>
      <group ref={headRef} position={[0, 2.38, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.22, 16, 12]} />
          <primitive object={burgundy} attach="material" />
        </mesh>
        <mesh castShadow position={[0, 0.06, 0.18]}>
          <boxGeometry args={[0.30, 0.04, 0.06]} />
          <primitive object={burgundy} attach="material" />
        </mesh>
      </group>
    </group>
  );
}

// ─── Role / one-liner, hung under the name plate on the same wall ────────────
function RoleCard() {
  const [roleIdx, setRoleIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setRoleIdx(i => (i + 1) % hero.roles.length), 2800);
    return () => clearInterval(id);
  }, []);

  const { position, yaw } = wallPoint('vestibule', 'left', 1.25, 0);

  return (
    <Html
      position={position}
      rotation={[0, yaw, 0]}
      distanceFactor={16}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{ fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif', width: 340 }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.22em', color: '#6F1028',
          textTransform: 'uppercase', minHeight: 18, transition: 'opacity 0.4s',
        }}>
          {hero.roles[roleIdx]}
        </div>
        <div style={{ width: 40, height: 1, background: '#6F1028', margin: '12px 0' }} />
        <div style={{ fontSize: 11, lineHeight: 1.7, color: 'rgba(26,22,20,0.65)', fontWeight: 300, maxWidth: 300 }}>
          {hero.oneLiner}
        </div>
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 1, height: 26, background: 'rgba(26,22,20,0.20)', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '45%',
              background: 'rgba(26,22,20,0.50)',
              animation: 'scrollPulse 1.9s ease-in-out infinite',
            }} />
          </div>
          <div style={{ fontSize: 9, letterSpacing: '0.22em', color: 'rgba(26,22,20,0.35)', textTransform: 'uppercase' }}>
            Scroll to enter
          </div>
        </div>
        <style>{`@keyframes scrollPulse{0%{transform:translateY(-100%)}100%{transform:translateY(300%)}}`}</style>
      </div>
    </Html>
  );
}

export default function EntranceRoom() {
  return (
    <group>
      <RoleCard />
      <ProceduralBust />
    </group>
  );
}