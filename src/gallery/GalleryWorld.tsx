import { Suspense, useRef, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA, COLORS, FOG } from './constants';
import GalleryArchitecture from './GalleryArchitecture';
import GalleryLighting from './GalleryLighting';
import PlayerController from './PlayerController';

// ─── Scene inner (needs useThree) ────────────────────────────────────────────
function SceneSetup() {
  return (
    <>
      <fog attach="fog" args={[COLORS.fogColor, FOG.near, FOG.far]} />
      <color attach="background" args={[COLORS.bg]} />
    </>
  );
}

// ─── Click-to-enter overlay ───────────────────────────────────────────────────
function ClickOverlay({ locked }: { locked: boolean }) {
  if (locked) return null;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(13,7,9,0.55)',
        backdropFilter: 'blur(2px)',
        zIndex: 10,
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      <p style={{
        color: '#e0b878',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.85rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        opacity: 0.9,
      }}>
        Click to explore
      </p>
      <p style={{
        color: 'rgba(245,239,233,0.4)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.72rem',
        letterSpacing: '0.15em',
        marginTop: '0.5rem',
      }}>
        W A S D · Mouse look · Shift to sprint
      </p>
    </div>
  );
}

// ─── HUD controls hint ────────────────────────────────────────────────────────
function HUD({ locked }: { locked: boolean }) {
  if (!locked) return null;
  return (
    <div style={{
      position: 'absolute',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '1.5rem',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      {[
        { key: 'W', label: 'Forward' },
        { key: 'A', label: 'Left' },
        { key: 'S', label: 'Back' },
        { key: 'D', label: 'Right' },
        { key: 'Shift', label: 'Sprint' },
        { key: 'Esc', label: 'Release' },
      ].map(({ key, label }) => (
        <div key={key} style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.2rem',
        }}>
          <span style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(224,184,120,0.3)',
            borderRadius: '4px',
            padding: '2px 8px',
            color: '#e0b878',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.7rem',
            letterSpacing: '0.05em',
          }}>{key}</span>
          <span style={{
            color: 'rgba(245,239,233,0.35)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.6rem',
            letterSpacing: '0.08em',
          }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Crosshair ────────────────────────────────────────────────────────────────
function Crosshair({ locked }: { locked: boolean }) {
  if (!locked) return null;
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 16,
      height: 16,
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: 0,
        right: 0,
        height: 1,
        background: 'rgba(224,184,120,0.6)',
        transform: 'translateY(-50%)',
      }} />
      <div style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        bottom: 0,
        width: 1,
        background: 'rgba(224,184,120,0.6)',
        transform: 'translateX(-50%)',
      }} />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryWorld() {
  const [locked, setLocked] = useState(false);
  const handleLockChange = useCallback((l: boolean) => setLocked(l), []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
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
        <PlayerController onLockChange={handleLockChange} enabled />
      </Canvas>

      <ClickOverlay locked={locked} />
      <Crosshair    locked={locked} />
      <HUD          locked={locked} />
    </div>
  );
}
