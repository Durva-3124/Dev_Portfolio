import { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA, FOG } from './constants';
import GalleryArchitecture from './GalleryArchitecture';
import GalleryLighting     from './GalleryLighting';
import PlayerController    from './PlayerController';

function SceneSetup() {
  return (
    <>
      <fog attach="fog" args={[FOG.color, FOG.near, FOG.far]} />
      <color attach="background" args={[0x0d0b0a]} />
    </>
  );
}

// Minimal, non-game overlay — only shown before pointer lock
function ExplorePrompt({ locked }: { locked: boolean }) {
  if (locked) return null;
  return (
    <div style={{
      position: 'absolute',
      bottom: '2.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.4rem',
      pointerEvents: 'none',
      userSelect: 'none',
      zIndex: 10,
    }}>
      <div style={{
        width: 36,
        height: 36,
        border: '1px solid rgba(200,169,110,0.5)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Simple cursor icon */}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2L12 7L7 8L5 12L2 2Z"
            fill="rgba(200,169,110,0.8)" />
        </svg>
      </div>
      <p style={{
        color: 'rgba(200,169,110,0.7)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '0.7rem',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}>
        Click to explore
      </p>
      <p style={{
        color: 'rgba(245,239,233,0.28)',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '0.62rem',
        letterSpacing: '0.1em',
      }}>
        W A S D &nbsp;·&nbsp; Mouse look
      </p>
    </div>
  );
}

export default function GalleryWorld() {
  const [locked, setLocked] = useState(false);
  const handleLock = useCallback((l: boolean) => setLocked(l), []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 2)]}
        camera={{
          fov:      CAMERA.fov,
          near:     CAMERA.near,
          far:      CAMERA.far,
          position: CAMERA.startPos,
        }}
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        <SceneSetup />
        <Suspense fallback={null}>
          <GalleryLighting />
          <GalleryArchitecture />
        </Suspense>
        <PlayerController onLockChange={handleLock} enabled />
      </Canvas>

      <ExplorePrompt locked={locked} />
    </div>
  );
}
