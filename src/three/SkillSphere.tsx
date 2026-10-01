import { useMemo, useRef } from 'react';
import { Html, OrbitControls } from '@react-three/drei';
import { Group } from 'three';
import { skills } from '@/data';
import { useIsMobile } from '@/hooks/useThreePerformance';

function fibonacciSphere(samples: number, radius: number): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < samples; i++) {
    const y = 1 - (i / (samples - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    positions.push([x * radius, y * radius, z * radius]);
  }
  return positions;
}

export function SkillSphere() {
  const isMobile = useIsMobile();
  const groupRef = useRef<Group>(null);

  const skillLabels = useMemo(() => {
    return skills.flatMap((category) => category.items);
  }, []);

  const sampleCount = isMobile ? Math.min(skillLabels.length, 20) : Math.min(skillLabels.length, 40);
  const radius = isMobile ? 1.6 : 2;
  const positions = useMemo(() => fibonacciSphere(sampleCount, radius), [sampleCount, radius]);

  const labels = useMemo(() => {
    const shuffled = [...skillLabels];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, sampleCount);
  }, [skillLabels, sampleCount]);

  return (
    <>
      <group ref={groupRef}>
        <mesh>
          <icosahedronGeometry args={[radius - 0.05, 2]} />
          <meshBasicMaterial
            color="#800020"
            wireframe
            transparent
            opacity={0.1}
          />
        </mesh>

        {positions.map((pos, idx) => {
          const [x, y, z] = pos;
          const label = labels[idx % labels.length];
          return (
            <Html
            key={idx}
            position={[x, y, z]}
            transform
            distanceFactor={8}
            style={{
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
            center
            >
            <span
              className="font-heading font-bold text-xs md:text-sm backdrop-blur px-2 py-1 rounded bg-[rgba(13,7,9,0.7)] border border-[rgba(194,39,79,0.3)] text-[#c2274f] whitespace-nowrap"
            >
              {label}
            </span>
          </Html>
          );
        })}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        enableRotate={!isMobile}
      />
    </>
  );
}

export default SkillSphere;
