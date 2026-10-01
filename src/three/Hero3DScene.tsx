import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { lerpColor, lerp, getScrollProgress } from '@/utils/sectionScrollProgress';
import { useIsMobile } from '@/hooks/useThreePerformance';

const accent = '#800020';
const accentTint = '#c2274f';
const accentSecondary = '#e0b878';

export function useSectionHue() {
  const t = getScrollProgress();
  return {
    color1: lerpColor(accent, accentSecondary, t),
  };
}

function fibonacciSphere(count: number, radius: number): [number, number, number][] {
  const points: [number, number, number][] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    points.push([x * radius, y * radius, z * radius]);
  }
  return points;
}

export default function Hero3DScene() {
  const sceneGroup = useRef<THREE.Group>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const isMobile = useIsMobile();
  const sphereCount = isMobile ? 35 : 70;
  const { pointer } = useThree();
  const mouseRef = useRef({ x: 0, y: 0 });

  const nodePositions = useMemo(() => {
    return fibonacciSphere(sphereCount, 2.0);
  }, [sphereCount]);

  const connections = useMemo(() => {
    const pairs: [number, number][] = [];
    const threshold = 0.8;
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        const dx = nodePositions[i][0] - nodePositions[j][0];
        const dy = nodePositions[i][1] - nodePositions[j][1];
        const dz = nodePositions[i][2] - nodePositions[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          pairs.push([i, j]);
        }
      }
    }
    return pairs;
  }, [nodePositions]);

  useEffect(() => {
    const handleMouseMove = () => {
      mouseRef.current.x = pointer.x;
      mouseRef.current.y = pointer.y;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [pointer]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const progress = getScrollProgress();

    if (sceneGroup.current) {
      sceneGroup.current.rotation.y += 0.0015;
      sceneGroup.current.rotation.x = lerp(
        sceneGroup.current.rotation.x,
        mouseRef.current.y * 0.3,
        0.05
      );
      sceneGroup.current.rotation.y += mouseRef.current.x * 0.002;
    }

    const emissiveColor = lerpColor(accent, accentSecondary, progress);
    const pulsateIntensity = 0.6 + 0.4 * Math.sin(time * 1.3);

    meshesRef.current.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat && mat.emissive) {
        mat.emissive.set(emissiveColor);
        mat.emissiveIntensity = pulsateIntensity;
      }
    });
  });

  return (
    <group ref={sceneGroup}>
      <lineSegments>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(1.8, 1)]} />
        <lineBasicMaterial color={accent} opacity={0.15} transparent />
      </lineSegments>

      {nodePositions.map((pos, i) => {
        const size = 0.06 + Math.random() * 0.02;
        return (
          <mesh
            key={`node-${i}`}
            position={pos}
            ref={(el) => {
              if (el) meshesRef.current[i] = el;
            }}
          >
            <sphereGeometry args={[size, 16, 16]} />
            <meshStandardMaterial
              color={accentTint}
              emissive={accentTint}
              emissiveIntensity={0.8}
              metalness={0.3}
              roughness={0.5}
            />
          </mesh>
        );
      })}

      {connections.map(([i, j], idx) => {
        const startPos = nodePositions[i];
        const endPos = nodePositions[j];
        const points: [number, number, number][] = [
          [startPos[0], startPos[1], startPos[2]],
          [endPos[0], endPos[1], endPos[2]],
        ];
        return (
          <Line
            key={`conn-${idx}`}
            points={points}
            color={accentTint}
            transparent
            opacity={0.6}
            lineWidth={1}
          />
        );
      })}
    </group>
  );
}
