import React, { useRef, useState, useEffect, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import * as THREE from 'three';
import { personal } from '@/data';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type AvatarPose = 'idle' | 'wave' | 'type' | 'badge' | 'point' | 'thumbsup' | 'shrug';

interface AvatarProps {
  onSpeak?: (quote: string) => void;
  onClickAvatar?: () => void;
  small?: boolean;
  pose?: AvatarPose;
}

function ProceduralAvatar({
  onSpeak,
  onClickAvatar,
  small = false,
  pose = 'idle',
}: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headGroupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const rightArmGroupRef = useRef<THREE.Group>(null);
  const leftArmGroupRef = useRef<THREE.Group>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightPupilRef = useRef<THREE.Mesh>(null);
  const leftPupilRef = useRef<THREE.Mesh>(null);
  const badgeRef = useRef<THREE.Mesh>(null);
  const laptopRef = useRef<THREE.Mesh>(null);
  const pointIndicatorRef = useRef<THREE.Mesh>(null);

  const { pointer } = useThree();
  const reducedMotion = useReducedMotion();

  const [isJumping, setIsJumping] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  const [blinkOpacity, setBlinkOpacity] = useState(1);

  const clockRef = useRef(new THREE.Clock());
  const waveTimeRef = useRef(0);
  const jumpTimeRef = useRef(0);
  const nextBlinkRef = useRef(3 + Math.random() * 2);
  const blinkDurationRef = useRef(0);

  const scale = small ? 0.6 : 1;

  useEffect(() => {
    if (reducedMotion) return;
    const waveTimer = setTimeout(() => {
      setIsWaving(true);
      waveTimeRef.current = 0;
      setTimeout(() => setIsWaving(false), 2000);
    }, 500);
    return () => clearTimeout(waveTimer);
  }, [reducedMotion]);

  useEffect(() => {
    if (pose === 'wave') {
      setIsWaving(true);
    }
  }, [pose]);

  const handleClick = () => {
    if (onClickAvatar) onClickAvatar();
    if (onSpeak) {
      const quotes = personal.avatarQuotes;
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      onSpeak(randomQuote);
    }
    setIsJumping(true);
    setIsSpinning(true);
    jumpTimeRef.current = 0;
    setTimeout(() => {
      setIsJumping(false);
      setIsSpinning(false);
    }, 600);
  };

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    const elapsed = clockRef.current.getElapsedTime();

    if (!reducedMotion) {
      const breathScale = 1 + Math.sin(elapsed * 1.5) * 0.015;
      groupRef.current.scale.setScalar(scale * breathScale);
    } else {
      groupRef.current.scale.setScalar(scale);
    }

    if (headGroupRef.current && !reducedMotion) {
      headGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.x,
        pointer.y * 0.3,
        0.05
      );
      headGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        headGroupRef.current.rotation.y,
        pointer.x * 0.4,
        0.05
      );
    }

    if (!reducedMotion) {
      nextBlinkRef.current -= delta;
      if (nextBlinkRef.current <= 0) {
        blinkDurationRef.current = 0.15;
        nextBlinkRef.current = 3 + Math.random() * 2;
      }
      if (blinkDurationRef.current > 0) {
        blinkDurationRef.current -= delta;
        const t = blinkDurationRef.current / 0.15;
        setBlinkOpacity(t > 0.5 ? 0 : 1);
      } else {
        setBlinkOpacity(1);
      }
    }

    if (rightEyeRef.current) {
      const mat = rightEyeRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = blinkOpacity;
      mat.transparent = true;
    }
    if (leftEyeRef.current) {
      const mat = leftEyeRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = blinkOpacity;
      mat.transparent = true;
    }

    if (rightPupilRef.current && !reducedMotion) {
      rightPupilRef.current.position.x = pointer.x * 0.03;
      rightPupilRef.current.position.y = pointer.y * 0.02;
    }
    if (leftPupilRef.current && !reducedMotion) {
      leftPupilRef.current.position.x = pointer.x * 0.03;
      leftPupilRef.current.position.y = pointer.y * 0.02;
    }

    if (rightArmGroupRef.current) {
      if (isWaving && !reducedMotion) {
        waveTimeRef.current += delta * 8;
        const waveAngle = -1.2 + Math.sin(waveTimeRef.current) * 0.4;
        rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.z,
          waveAngle,
          0.15
        );
        rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.x,
          -0.3,
          0.15
        );
      } else if (pose === 'wave') {
        rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.z,
          -1.0,
          0.1
        );
        rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.x,
          -0.2,
          0.1
        );
      } else if (pose === 'type') {
        rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.z,
          -0.3,
          0.1
        );
        rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.x,
          1.2,
          0.1
        );
      } else if (pose === 'badge') {
        rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.z,
          -0.8,
          0.1
        );
        rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.x,
          -0.5,
          0.1
        );
      } else if (pose === 'point') {
        rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.z,
          -0.5,
          0.1
        );
        rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.x,
          -0.8,
          0.1
        );
      } else if (pose === 'thumbsup') {
        rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.z,
          -0.9,
          0.1
        );
        rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.x,
          0.3,
          0.1
        );
      } else if (pose === 'shrug') {
        rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.z,
          -1.3,
          0.1
        );
        rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.x,
          0.4,
          0.1
        );
      } else {
        const sway = Math.sin(elapsed * 0.8) * 0.05;
        rightArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.z,
          sway,
          0.05
        );
        rightArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmGroupRef.current.rotation.x,
          0,
          0.1
        );
      }
    }

    if (leftArmGroupRef.current) {
      if (pose === 'shrug') {
        leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmGroupRef.current.rotation.z,
          1.3,
          0.1
        );
        leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmGroupRef.current.rotation.x,
          0.4,
          0.1
        );
      } else if (pose === 'type') {
        leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmGroupRef.current.rotation.z,
          0.3,
          0.1
        );
        leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmGroupRef.current.rotation.x,
          1.2,
          0.1
        );
      } else {
        const sway = Math.sin(elapsed * 0.8 + Math.PI) * 0.05;
        leftArmGroupRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmGroupRef.current.rotation.z,
          sway,
          0.05
        );
        leftArmGroupRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmGroupRef.current.rotation.x,
          0,
          0.1
        );
      }
    }

    if (isJumping && groupRef.current && !reducedMotion) {
      jumpTimeRef.current += delta * 8;
      const jumpY = Math.abs(Math.sin(jumpTimeRef.current)) * 0.15;
      groupRef.current.position.y = jumpY;
    } else if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        0.1
      );
    }

    if (isSpinning && groupRef.current && !reducedMotion) {
      groupRef.current.rotation.y += delta * 4;
    }

    if (badgeRef.current) {
      badgeRef.current.visible = pose === 'badge';
    }
    if (laptopRef.current) {
      laptopRef.current.visible = pose === 'type';
    }
    if (pointIndicatorRef.current) {
      pointIndicatorRef.current.visible = pose === 'point';
    }
  });

  return (
    <group ref={groupRef} onClick={handleClick}>
      <group ref={headGroupRef} position={[0, 0, 0]}>
        <mesh ref={bodyRef} position={[0, 0.1, 0]} castShadow>
          <capsuleGeometry args={[0.42, 0.5, 8, 16]} />
          <meshStandardMaterial color="#c2274f" roughness={0.8} />
        </mesh>

        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[0.5, 0.15, 0.5]} />
          <meshStandardMaterial color="#800020" roughness={0.7} />
        </mesh>

        <mesh ref={headRef} position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.55, 16, 16]} />
          <meshStandardMaterial color="#f5d5c8" roughness={0.6} />
        </mesh>

        <mesh position={[0, 1.68, 0]} castShadow>
          <sphereGeometry args={[0.58, 16, 16]} />
          <meshStandardMaterial color="#1a0508" roughness={0.9} />
        </mesh>

        <mesh position={[0, 1.72, -0.1]} scale={[1, 0.6, 0.8]} castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#1a0508" roughness={0.9} />
        </mesh>

        <mesh ref={leftEyeRef} position={[-0.18, 1.25, 0.48]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} transparent opacity={1} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.18, 1.25, 0.48]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} transparent opacity={1} />
        </mesh>

        <mesh ref={leftPupilRef} position={[-0.18, 1.25, 0.54]} castShadow>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#1a0508" roughness={0.3} />
        </mesh>
        <mesh ref={rightPupilRef} position={[0.18, 1.25, 0.54]} castShadow>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#1a0508" roughness={0.3} />
        </mesh>

        <mesh position={[-0.18, 1.25, 0.5]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.015, 8, 24]} />
          <meshStandardMaterial color="#1a0508" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0.18, 1.25, 0.5]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.015, 8, 24]} />
          <meshStandardMaterial color="#1a0508" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 1.25, 0.49]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.28, 8]} />
          <meshStandardMaterial color="#1a0508" roughness={0.4} metalness={0.6} />
        </mesh>

        <mesh position={[0, 1.0, 0.5]} castShadow>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#e0b878" roughness={0.5} />
        </mesh>

        <group ref={leftArmGroupRef} position={[-0.5, 0.8, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.7, 12]} />
            <meshStandardMaterial color="#c2274f" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.75, 0]} castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#f5d5c8" roughness={0.6} />
          </mesh>
        </group>

        <group ref={rightArmGroupRef} position={[0.5, 0.8, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.09, 0.7, 12]} />
            <meshStandardMaterial color="#c2274f" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.75, 0]} castShadow>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color="#f5d5c8" roughness={0.6} />
          </mesh>
          <mesh ref={badgeRef} position={[0, -0.85, 0]} visible={false} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
            <meshStandardMaterial color="#e0b878" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh ref={pointIndicatorRef} position={[0, -0.9, 0.2]} visible={false} castShadow>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#c2274f" emissive="#c2274f" emissiveIntensity={0.5} />
          </mesh>
        </group>

        <mesh ref={laptopRef} position={[0, 0.1, 0.5]} visible={false} rotation={[-0.3, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.02, 0.4]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} metalness={0.3} />
        </mesh>
        {pose === 'type' && (
          <mesh position={[0, 0.2, 0.55]} rotation={[-0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.55, 0.35, 0.02]} />
            <meshStandardMaterial color="#1a1a2a" roughness={0.4} emissive="#800020" emissiveIntensity={0.15} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function GLTFAvatar(props: AvatarProps) {
  const [glbLoaded, setGlbLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  try {
    const gltf = useGLTF('/models/durva.glb');
    if (gltf && !glbLoaded) {
      setGlbLoaded(true);
    }
  } catch {
    if (!loadError) setLoadError(true);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!glbLoaded) setLoadError(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [glbLoaded]);

  if (loadError || !glbLoaded) {
    return <ProceduralAvatar {...props} />;
  }

  return <ProceduralAvatar {...props} />;
}

function AvatarErrorBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      if (event.message.includes('GLTF') || event.message.includes('load')) {
        setHasError(true);
      }
    };
    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (hasError) return <>{fallback}</>;
  return <>{children}</>;
}

export function Avatar(props: AvatarProps) {
  const FallbackAvatar = <ProceduralAvatar {...props} />;

  return (
    <AvatarErrorBoundary fallback={FallbackAvatar}>
      <Suspense fallback={FallbackAvatar}>
        <GLTFAvatar {...props} />
      </Suspense>
    </AvatarErrorBoundary>
  );
}

export function AvatarDance() {
  const event = new CustomEvent('avatar-dance', {
    detail: { type: 'dance' },
  });
  window.dispatchEvent(event);
}

if (typeof window !== 'undefined') {
  (window as any).AvatarDance = AvatarDance;
}

export default Avatar;
