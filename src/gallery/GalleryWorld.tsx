import {
  Suspense, useRef, useState, useEffect, useCallback,
  type CSSProperties,
} from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { CAM, C, type ArtworkDef } from './constants';
import GalleryArchitecture from './GalleryArchitecture';
import GalleryLighting     from './GalleryLighting';
import CameraController    from './CameraController';
import ProjectArtworks     from './ProjectArtworks';
import ProjectExperience   from './ProjectExperience';

// ─── Scroll progress hook ─────────────────────────────────────────────────────
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const touchStartY = useRef(0);
  const accumulated = useRef(0);

  useEffect(() => {
    // Desktop wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      accumulated.current += e.deltaY * 0.00045;
      accumulated.current  = Math.max(0, Math.min(1, accumulated.current));
      setProgress(accumulated.current);
    };
    // Mobile touch
    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = touchStartY.current - e.touches[0].clientY;
      touchStartY.current = e.touches[0].clientY;
      accumulated.current += dy * 0.0012;
      accumulated.current  = Math.max(0, Math.min(1, accumulated.current));
      setProgress(accumulated.current);
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true  });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });
    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
    };
  }, []);

  return progress;
}

// ─── Mouse normalised position ────────────────────────────────────────────────
function useMouseNorm() {
  const [norm, setNorm] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setNorm({
        x: (e.clientX / window.innerWidth)  * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return norm;
}

// ─── Custom cursor ────────────────────────────────────────────────────────────
function GalleryCursor({ hovered }: { hovered: boolean }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const size = hovered ? 48 : 8;
  return (
    <div style={{
      position: 'fixed',
      left: pos.x,
      top:  pos.y,
      width:  size,
      height: size,
      borderRadius: '50%',
      border: hovered ? '1px solid rgba(24,24,24,0.5)' : 'none',
      background: hovered ? 'transparent' : 'rgba(24,24,24,0.75)',
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
      zIndex: 50,
      transition: 'width 0.18s ease, height 0.18s ease, background 0.18s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 8,
      letterSpacing: '0.14em',
      color: '#181818',
    }}>
      {hovered ? 'VIEW' : null}
    </div>
  );
}

// ─── Scroll indicator ─────────────────────────────────────────────────────────
function ScrollIndicator({ progress }: { progress: number }) {
  if (progress > 0.04) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem',
      pointerEvents: 'none',
      zIndex: 10,
      opacity: Math.max(0, 1 - progress * 25),
      transition: 'opacity 0.3s',
    }}>
      <div style={{
        width: 1,
        height: 40,
        background: 'rgba(24,24,24,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          background: 'rgba(24,24,24,0.6)',
          animation: 'scrollPulse 1.8s ease-in-out infinite',
          height: '40%',
        }} />
      </div>
      <p style={{
        fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
        fontSize: 10,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'rgba(24,24,24,0.45)',
      }}>
        Scroll
      </p>
      <style>{`
        @keyframes scrollPulse {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(300%); }
        }
      `}</style>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      background: 'rgba(24,24,24,0.08)',
      zIndex: 10,
      pointerEvents: 'none',
    }}>
      <div style={{
        height: '100%',
        width: `${progress * 100}%`,
        background: 'rgba(24,24,24,0.35)',
        transition: 'width 0.1s linear',
      }} />
    </div>
  );
}

// ─── Scene setup ──────────────────────────────────────────────────────────────
function SceneSetup() {
  return (
    <>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 45, 110]} />
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryWorld() {
  const scrollProgress = useScrollProgress();
  const mouseNorm      = useMouseNorm();

  const [selectedArtwork,  setSelectedArtwork]  = useState<ArtworkDef | null>(null);
  const [approachingArt,   setApproachingArt]   = useState<ArtworkDef | null>(null);
  const [showProject,      setShowProject]       = useState(false);
  const [cursorHovered,    setCursorHovered]     = useState(false);
  const savedScrollRef     = useRef(0);

  // Artwork selected → start cinematic approach
  const handleArtworkSelect = useCallback((def: ArtworkDef) => {
    savedScrollRef.current = scrollProgress;
    setApproachingArt(def);
    setSelectedArtwork(def);
    setCursorHovered(false);
  }, [scrollProgress]);

  // Approach animation done → show project overlay
  const handleApproachDone = useCallback(() => {
    setShowProject(true);
  }, []);

  // Return from project
  const handleReturn = useCallback(() => {
    setShowProject(false);
    // Small delay so overlay fades before camera pulls back
    setTimeout(() => {
      setApproachingArt(null);
      setSelectedArtwork(null);
    }, 400);
  }, []);

  // Cursor: detect pointer over canvas (artworks set hovered via Html)
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const over = () => {};
    const out  = () => setCursorHovered(false);
    canvas.addEventListener('pointerover', over);
    canvas.addEventListener('pointerout',  out);
    return () => {
      canvas.removeEventListener('pointerover', over);
      canvas.removeEventListener('pointerout',  out);
    };
  }, []);

  const canvasStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100vw',
    height: '100vh',
    display: 'block',
    cursor: 'none',
  };

  return (
    <>
      {/* Hide default cursor */}
      <style>{`* { cursor: none !important; }`}</style>

      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        camera={{ fov: CAM.fov, near: CAM.near, far: CAM.far }}
        style={canvasStyle}
      >
        <SceneSetup />
        <Suspense fallback={null}>
          <GalleryLighting />
          <GalleryArchitecture />
          <ProjectArtworks onSelect={handleArtworkSelect} />
        </Suspense>
        <CameraController
          scrollProgress={scrollProgress}
          mouseNorm={mouseNorm}
          artworkTarget={approachingArt}
          onApproachDone={handleApproachDone}
          enabled={!showProject}
        />
      </Canvas>

      <GalleryCursor hovered={cursorHovered} />
      <ScrollIndicator progress={scrollProgress} />
      <ProgressBar     progress={scrollProgress} />

      {/* Project detail overlay */}
      <ProjectExperience
        artwork={showProject ? selectedArtwork : null}
        onReturn={handleReturn}
      />
    </>
  );
}
