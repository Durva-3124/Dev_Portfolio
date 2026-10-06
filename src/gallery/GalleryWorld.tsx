/**
 * GalleryWorld.tsx — PART B.10, B.11
 * ─────────────────────────────────────────────────────────────────────────────
 * Input rules:
 *   • wheel / touch / keys write into the mutable `scrollStore` and nothing else
 *   • while the project overlay is open (`scrollStore.locked`) the handlers
 *     return BEFORE preventDefault(), so the overlay's own scroller works
 *   • the custom cursor is animated imperatively from a ref — pointer position is
 *     never React state
 *   • `?t=0..1` pins the scroll progress for deterministic screenshot testing
 * ─────────────────────────────────────────────────────────────────────────────
 */
import {
  Suspense, useRef, useState, useEffect, useCallback,
  type CSSProperties,
} from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import {
  ARTWORKS, INSTALLS, BG_COLOR, CAM, SCROLL_TOTAL, cursorStore, scrollStore, type InstallDef,
  ZONE_HASH, zoneForHash, zoneForProgress,
} from './constants';
import { warmArtworkTextures, readyTextureIds } from './artworkTextures';
import GalleryArchitecture from './GalleryArchitecture';
import GalleryLighting     from './GalleryLighting';
import CameraController    from './CameraController';
import ProjectArtworks     from './ProjectArtworks';
import ProjectExperience   from './ProjectExperience';
import EntranceRoom        from './rooms/EntranceRoom';
import AboutRoom           from './rooms/AboutRoom';
import SkillsRoom          from './rooms/SkillsRoom';
import ExperienceRoom      from './rooms/ExperienceRoom';
import UpperGalleryRoom    from './rooms/UpperGalleryRoom';
import ContactRoom         from './rooms/ContactRoom';
import MuseumUI            from './ui/MuseumUI';
import GalleryNav          from './ui/GalleryNav';

// ─── Scroll / pointer / keyboard input → mutable store, zero re-renders ──────
function useGalleryInput() {
  useEffect(() => {
    const release = () => { scrollStore.testT = null; };

    const onWheel = (e: WheelEvent) => {
      // The project overlay owns the scroll while it is open. Returning BEFORE
      // preventDefault() is what makes the overlay scrollable.
      if (scrollStore.locked) return;
      e.preventDefault();
      release();
      scrollStore.raw = Math.max(0, Math.min(SCROLL_TOTAL, scrollStore.raw + e.deltaY * 0.88));
      scrollStore.progress = scrollStore.raw / SCROLL_TOTAL;
      scrollStore.velocity = e.deltaY;
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      if (scrollStore.locked) return;      // same rule as the wheel handler
      e.preventDefault();
      release();
      const dy = touchY - e.touches[0].clientY;
      touchY = e.touches[0].clientY;
      scrollStore.raw = Math.max(0, Math.min(SCROLL_TOTAL, scrollStore.raw + dy * 2.2));
      scrollStore.progress = scrollStore.raw / SCROLL_TOTAL;
      scrollStore.velocity = dy * 10;
    };

    const onKey = (e: KeyboardEvent) => {
      if (scrollStore.locked) return;
      const step = 0.012;
      let p = scrollStore.progress;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'PageDown') p += step;
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === 'PageUp') p -= step;
      else if (e.key === 'Home') p = 0;
      else if (e.key === 'End') p = 1;
      else return;
      e.preventDefault();
      release();
      p = Math.max(0, Math.min(1, p));
      scrollStore.progress = p;
      scrollStore.raw = p * SCROLL_TOTAL;
    };

    const onMove = (e: MouseEvent) => {
      scrollStore.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      scrollStore.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);
}

// ─── Hash routing ────────────────────────────────────────────────────────────
/**
 * On mount: if the URL has a recognised hash, jump the camera there.
 * Returns helpers used by handleSelect / handleReturn.
 */
function useHashRouting(
  onRoomJump: (t: number) => void,
  setShowCase: (v: boolean) => void,
  setActiveInstall: (v: InstallDef | null) => void,
  installs: InstallDef[],
) {
  // On mount — read initial hash.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    // #works/<slug> → open overlay
    const worksMatch = hash.match(/^#works\/(.+)$/);
    if (worksMatch) {
      const slug = worksMatch[1];
      const def = installs.find(i => i.slug === slug);
      if (def) {
        // Jump camera to works zone first, then open overlay.
        const worksZone = zoneForHash('#works');
        if (worksZone) onRoomJump((worksZone.tRange[0] + worksZone.tRange[1]) / 2);
        scrollStore.locked = true;
        cursorStore.view = false;
        setActiveInstall(def);
        setShowCase(true);
      }
      return;
    }
    const zone = zoneForHash(hash);
    if (zone) onRoomJump((zone.tRange[0] + zone.tRange[1]) / 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // popstate — Back button while overlay is open should close it.
  useEffect(() => {
    const onPop = () => {
      // If the new hash is NOT a works/<slug>, close the overlay.
      if (!window.location.hash.startsWith('#works/')) {
        setShowCase(false);
        setTimeout(() => {
          setActiveInstall(null);
          scrollStore.locked = false;
        }, 550);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [setShowCase, setActiveInstall]);
}

// ─── ?t=0..1 debug hook (PART C.2) ──────────────────────────────────────────
function useUrlProgress() {
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('t');
    if (raw === null) return;
    const v = Number(raw);
    if (!Number.isFinite(v)) return;
    const t = Math.max(0, Math.min(1, v));
    scrollStore.testT = t;
    scrollStore.progress = t;
    scrollStore.raw = t * SCROLL_TOTAL;
  }, []);
}

/**
 * Debug harness API (PART C.2). Lets the screenshot script jump the camera to a
 * given progress without re-navigating, which matters because creating and
 * tearing down a WebGL context per shot is prohibitively slow under software
 * rendering. `?t=` remains the primary, spec'd entry point.
 */
function useDebugApi() {
  useEffect(() => {
    (window as unknown as { __gallery?: unknown }).__gallery = {
      setT(t: number) {
        const v = Math.max(0, Math.min(1, t));
        scrollStore.testT = v;
        scrollStore.progress = v;
        scrollStore.raw = v * SCROLL_TOTAL;
        return v;
      },
      getT() { return scrollStore.testT ?? scrollStore.progress; },
      release() { scrollStore.testT = null; },
      /** which artwork canvases are built (diagnostics for PART C.2) */
      textures: readyTextureIds,
      artworks: ARTWORKS.map(a => ({
        id: a.id, room: a.room, wall: a.wall,
        surface: a.surface, normal: a.normal, yaw: a.yaw,
      })),
    };
  }, []);
}

// ─── Throttled progress snapshot — discrete UI only ─────────────────────────
function useUiProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      const p = scrollStore.testT ?? scrollStore.progress;
      setProgress(prev => (Math.abs(p - prev) > 0.004 ? p : prev));
    }, 120);
    return () => clearInterval(id);
  }, []);
  return progress;
}
// ─── Custom cursor — imperative, never React state (PART B.10) ───────────────
function GalleryCursor() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let x = -100, y = -100, lastView: boolean | null = null;
    const onMove = (e: MouseEvent) => { x = e.clientX; y = e.clientY; };
    const tick = () => {
      const el = ref.current;
      if (el) {
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
        if (lastView !== cursorStore.view) {
          lastView = cursorStore.view;
          el.dataset.view = cursorStore.view ? 'true' : 'false';
        }
      }
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', onMove);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div ref={ref} className="gallery-cursor">
      <span className="gallery-cursor__label">VIEW</span>
    </div>
  );
}

// ─── Scene background ────────────────────────────────────────────────────────
function SceneBg() {
  return (
    <>
      <color attach="background" args={[BG_COLOR]} />
      <fog attach="fog" args={[BG_COLOR, 70, 150]} />
    </>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function GalleryWorld() {
  useGalleryInput();
  useUrlProgress();
  useDebugApi();
  const uiProgress = useUiProgress();

  useEffect(() => {
    // PART B.8 — build every canvas while idle, never on the critical path
    warmArtworkTextures(ARTWORKS.map(a => a.id));
  }, []);

  const [activeInstall, setActiveInstall] = useState<InstallDef | null>(null);
  const [showCase, setShowCase] = useState(false);

  const handleRoomJump = useCallback((t: number) => {
    scrollStore.testT = null;
    scrollStore.raw = t * SCROLL_TOTAL;
    scrollStore.progress = t;
  }, []);

  const handleSelect = useCallback((def: InstallDef) => {
    scrollStore.locked = true;
    cursorStore.view = false;
    setActiveInstall(def);
    setShowCase(true);
    history.pushState(null, '', `#works/${def.slug}`);
  }, []);

  const handleReturn = useCallback(() => {
    setShowCase(false);
    setTimeout(() => {
      setActiveInstall(null);
      scrollStore.locked = false;
    }, 550);
    // Only go back if the current entry is a works/<slug> hash.
    if (window.location.hash.startsWith('#works/')) history.back();
  }, []);

  useHashRouting(handleRoomJump, setShowCase, setActiveInstall, INSTALLS);

  // Debounced replaceState — update hash as the camera moves between zones.
  useEffect(() => {
    const id = setTimeout(() => {
      const zone = zoneForProgress(uiProgress);
      const hash = ZONE_HASH[zone.id];
      if (hash && !window.location.hash.startsWith('#works/')) {
        history.replaceState(null, '', hash);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [uiProgress]);

  const canvasStyle: CSSProperties = {
    position: 'fixed', inset: 0,
    width: '100vw', height: '100vh',
    display: 'block', cursor: 'none',
  };

  return (
    <>
      {/* The real cursor is only hidden while the gallery, not the overlay, is up */}
      {!showCase && <style>{`* { cursor: none !important; }`}</style>}

      <Canvas
        // three r186 removed PCFSoftShadowMap; PCFShadowMap is the supported
        // soft-ish option (VSM is the alternative).
        shadows={{ type: THREE.PCFShadowMap }}
        gl={{
          antialias: true, alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: CAM.exposure,      // 0.9 (PART B.9)
        }}
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        camera={{ fov: CAM.fov, near: CAM.near, far: CAM.far }}
        style={canvasStyle}
      >
        <SceneBg />
        <Suspense fallback={null}>
          <GalleryLighting />
          <GalleryArchitecture />
          <ProjectArtworks onSelect={handleSelect} />
          {/* Room content — every position comes from layout.ts */}
          <EntranceRoom />
          <AboutRoom />
          <SkillsRoom />
          <ExperienceRoom />
          <UpperGalleryRoom />
          <ContactRoom />
        </Suspense>
        <CameraController />
      </Canvas>

      <GalleryNav progress={uiProgress} onRoomJump={handleRoomJump} overlayOpen={showCase} />
      <GalleryCursor />
      <MuseumUI progress={uiProgress} onRoomJump={handleRoomJump} />

      <ProjectExperience
        install={showCase ? activeInstall : null}
        onReturn={handleReturn}
      />
    </>
  );
}