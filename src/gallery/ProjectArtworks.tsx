import { useRef, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ARTWORKS, CH, CAM, type ArtworkDef } from './constants';

// Distinct canvas colours per project (abstract colour field, not a screenshot)
const CANVAS_COLORS: Record<string, number> = {
  'meetsync-ai': 0xc8d4e0,
  'bullsight':   0xd4c8c0,
  'tejalens':    0xc8d8c8,
};

function ArtworkFrame({
  def,
  onSelect,
}: {
  def: ArtworkDef;
  onSelect: (def: ArtworkDef) => void;
}) {
  const { camera } = useThree();
  const groupRef   = useRef<THREE.Group>(null);
  const [near, setNear] = useState(false);
  const [hovered, setHovered] = useState(false);

  const frameThick = 0.06;
  const frameDepth = 0.12;
  const canvasColor = CANVAS_COLORS[def.id] ?? 0xe8e4dc;

  useFrame(() => {
    if (!groupRef.current) return;
    const dist = camera.position.distanceTo(groupRef.current.position);
    setNear(dist < CAM.approachDist * 2.5);
  });

  const handleClick = useCallback(() => {
    onSelect(def);
  }, [def, onSelect]);

  return (
    <group
      ref={groupRef}
      position={def.position}
      rotation={new THREE.Euler(...def.rotation)}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Canvas surface */}
      <mesh receiveShadow castShadow>
        <planeGeometry args={[def.width, def.height]} />
        <meshStandardMaterial
          color={canvasColor}
          roughness={0.92}
          metalness={0.0}
        />
      </mesh>

      {/* Frame — top */}
      <mesh castShadow position={[0, def.height / 2 + frameThick / 2, 0]}>
        <boxGeometry args={[def.width + frameThick * 2, frameThick, frameDepth]} />
        <meshStandardMaterial color={CH.frame} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Frame — bottom */}
      <mesh castShadow position={[0, -(def.height / 2) - frameThick / 2, 0]}>
        <boxGeometry args={[def.width + frameThick * 2, frameThick, frameDepth]} />
        <meshStandardMaterial color={CH.frame} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Frame — left */}
      <mesh castShadow position={[-(def.width / 2) - frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, def.height + frameThick * 2, frameDepth]} />
        <meshStandardMaterial color={CH.frame} roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Frame — right */}
      <mesh castShadow position={[(def.width / 2) + frameThick / 2, 0, 0]}>
        <boxGeometry args={[frameThick, def.height + frameThick * 2, frameDepth]} />
        <meshStandardMaterial color={CH.frame} roughness={0.55} metalness={0.05} />
      </mesh>

      {/* Title label — always visible when near */}
      {near && (
        <Html
          position={[0, -(def.height / 2) - 0.35, 0.1]}
          center
          distanceFactor={6}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            textAlign: 'center',
            fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
          }}>
            <div style={{
              fontSize: 13,
              letterSpacing: '0.04em',
              color: '#181818',
              fontWeight: 400,
            }}>
              {def.title}
            </div>
            <div style={{
              fontSize: 10,
              letterSpacing: '0.12em',
              color: '#888',
              textTransform: 'uppercase',
              marginTop: 3,
            }}>
              {def.role}
            </div>
          </div>
        </Html>
      )}

      {/* VIEW indicator — only when hovered */}
      {hovered && (
        <Html position={[0, 0, 0.15]} center distanceFactor={6}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            border: '1px solid rgba(24,24,24,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
            fontSize: 9,
            letterSpacing: '0.18em',
            color: '#181818',
            textTransform: 'uppercase',
            background: 'rgba(242,239,231,0.7)',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            pointerEvents: 'none',
          }}>
            VIEW
          </div>
        </Html>
      )}
    </group>
  );
}

export default function ProjectArtworks({
  onSelect,
}: {
  onSelect: (def: ArtworkDef) => void;
}) {
  return (
    <>
      {ARTWORKS.map((def) => (
        <ArtworkFrame key={def.id} def={def} onSelect={onSelect} />
      ))}
    </>
  );
}
