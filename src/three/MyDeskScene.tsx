import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface Props { onObjectClick: (key: 'laptop' | 'mug' | 'plant', pos: [number, number, number]) => void; }

function SteamParticle({ offset }: { offset: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = (clock.getElapsedTime() * 0.4 + offset) % 1;
    ref.current.position.y = 0.3 + t * 0.6;
    (ref.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * (1 - t);
  });
  return (
    <mesh ref={ref} position={[0, 0.3, 0]}>
      <sphereGeometry args={[0.03, 4, 4]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
    </mesh>
  );
}

export default function MyDeskScene({ onObjectClick }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <group position={[0, -0.5, 0]}>
      {/* Desk */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[5, 0.12, 2.5]} />
        <meshStandardMaterial color="#5c3d2e" roughness={0.8} />
      </mesh>

      {/* Laptop */}
      <group
        position={[-0.8, 0.06, 0]}
        onClick={() => onObjectClick('laptop', [-0.8, 0.5, 0])}
        onPointerOver={() => setHovered('laptop')}
        onPointerOut={() => setHovered(null)}
      >
        <mesh position={[0, 0.04, 0.3]}>
          <boxGeometry args={[1.2, 0.04, 0.8]} />
          <meshStandardMaterial color={hovered === 'laptop' ? '#c2274f' : '#2a2a2a'} />
        </mesh>
        <mesh position={[0, 0.35, -0.1]} rotation={[-Math.PI / 6, 0, 0]}>
          <boxGeometry args={[1.2, 0.7, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0, 0.35, -0.08]} rotation={[-Math.PI / 6, 0, 0]}>
          <boxGeometry args={[1.1, 0.6, 0.01]} />
          <meshStandardMaterial color="#0d0709" emissive="#800020" emissiveIntensity={0.3} />
        </mesh>
        {hovered === 'laptop' && (
          <Html position={[0, 0.9, 0]} center>
            <div style={{ color: '#c2274f', fontSize: 12, background: 'rgba(13,7,9,0.8)', padding: '2px 8px', borderRadius: 4, pointerEvents: 'none' }}>Click me!</div>
          </Html>
        )}
      </group>

      {/* Mug */}
      <group
        position={[1.2, 0.06, 0.2]}
        onClick={() => onObjectClick('mug', [1.2, 0.5, 0.2])}
        onPointerOver={() => setHovered('mug')}
        onPointerOut={() => setHovered(null)}
      >
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.12, 0.1, 0.3, 16]} />
          <meshStandardMaterial color={hovered === 'mug' ? '#c2274f' : '#800020'} />
        </mesh>
        {[0, 0.33, 0.66].map(o => <SteamParticle key={o} offset={o} />)}
      </group>

      {/* Plant */}
      <group
        position={[1.8, 0.06, -0.5]}
        onClick={() => onObjectClick('plant', [1.8, 0.5, -0.5])}
        onPointerOver={() => setHovered('plant')}
        onPointerOut={() => setHovered(null)}
      >
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.2, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {[0, 1, 2].map(i => (
          <mesh key={i} position={[Math.sin(i * 2.1) * 0.1, 0.3 + i * 0.1, Math.cos(i * 2.1) * 0.1]}>
            <icosahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial color={hovered === 'plant' ? '#90ee90' : '#228B22'} />
          </mesh>
        ))}
      </group>

      {/* Lamp */}
      <group position={[-1.8, 0.06, -0.5]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
          <meshStandardMaterial color="#888" />
        </mesh>
        <mesh position={[0, 1.05, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.2, 0.3, 12]} />
          <meshStandardMaterial color="#e0b878" emissive="#e0b878" emissiveIntensity={0.5} />
        </mesh>
        <pointLight position={[0, 0.9, 0]} color="#e0b878" intensity={1.5} distance={3} />
      </group>
    </group>
  );
}
