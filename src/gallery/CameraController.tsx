import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PATH_POINTS, LOOKAT_POINTS,
  FLOOR_SURFACES, EYE_HEIGHT,
  CAM, type ArtworkDef,
} from './constants';

// ─── Spline curves ────────────────────────────────────────────────────────────
const posCurve    = new THREE.CatmullRomCurve3(PATH_POINTS,    false, 'catmullrom', 0.5);
const lookCurve   = new THREE.CatmullRomCurve3(LOOKAT_POINTS,  false, 'catmullrom', 0.5);

// ─── Floor height at (x, z) ───────────────────────────────────────────────────
function getFloorY(x: number, z: number): number {
  let best = 0;
  for (const s of FLOOR_SURFACES) {
    if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) {
      if (s.y > best) best = s.y;
    }
  }
  return best;
}

interface CameraControllerProps {
  scrollProgress: number;          // 0–1, driven by parent
  mouseNorm:      { x: number; y: number }; // -1..1
  artworkTarget:  ArtworkDef | null;
  onApproachDone: () => void;
  enabled:        boolean;
}

export default function CameraController({
  scrollProgress,
  mouseNorm,
  artworkTarget,
  onApproachDone,
  enabled,
}: CameraControllerProps) {
  const { camera } = useThree();

  // Smoothed scroll progress
  const smoothT    = useRef(0);
  // Smoothed look-at
  const smoothLook = useRef(new THREE.Vector3());
  // Approach animation
  const approaching   = useRef(false);
  const approachDone  = useRef(false);
  const approachStart = useRef<THREE.Vector3>(new THREE.Vector3());
  const approachLook  = useRef<THREE.Vector3>(new THREE.Vector3());
  const approachAlpha = useRef(0);

  // WASD hidden fallback
  const keys = useRef({ w: false, a: false, s: false, d: false });
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = true;
      if (e.code === 'KeyA') keys.current.a = true;
      if (e.code === 'KeyS') keys.current.s = true;
      if (e.code === 'KeyD') keys.current.d = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = false;
      if (e.code === 'KeyA') keys.current.a = false;
      if (e.code === 'KeyS') keys.current.s = false;
      if (e.code === 'KeyD') keys.current.d = false;
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  // Trigger approach when artworkTarget changes
  useEffect(() => {
    if (!artworkTarget) {
      approaching.current  = false;
      approachDone.current = false;
      approachAlpha.current = 0;
      return;
    }
    approaching.current   = true;
    approachDone.current  = false;
    approachAlpha.current = 0;
    approachStart.current.copy(camera.position);
    approachLook.current.set(...artworkTarget.position);
  }, [artworkTarget, camera]);

  useFrame((_, delta) => {
    if (!enabled) return;

    // ── Artwork approach animation ──────────────────────────────────────
    if (approaching.current && artworkTarget) {
      approachAlpha.current = Math.min(1, approachAlpha.current + delta * 0.9);
      const t = easeInOut(approachAlpha.current);

      // Target: 1.5 units in front of artwork
      const artPos = new THREE.Vector3(...artworkTarget.position);
      const artRot = new THREE.Euler(...artworkTarget.rotation);
      const forward = new THREE.Vector3(0, 0, 1).applyEuler(artRot);
      const target  = artPos.clone().add(forward.multiplyScalar(1.5));
      target.y = artPos.y;

      camera.position.lerpVectors(approachStart.current, target, t);
      const look = new THREE.Vector3().lerpVectors(approachStart.current, artPos, t);
      camera.lookAt(look);

      if (approachAlpha.current >= 1 && !approachDone.current) {
        approachDone.current = true;
        onApproachDone();
      }
      return;
    }

    // ── Scroll-driven path ──────────────────────────────────────────────
    // Damp scroll progress
    smoothT.current += (scrollProgress - smoothT.current) * Math.min(1, delta / CAM.scrollDamp);
    const t = THREE.MathUtils.clamp(smoothT.current, 0, 1);

    // WASD nudge on top of scroll (hidden fallback)
    const wasdDelta = delta * 3.5;
    if (keys.current.w) smoothT.current = Math.min(1, smoothT.current + wasdDelta * 0.008);
    if (keys.current.s) smoothT.current = Math.max(0, smoothT.current - wasdDelta * 0.008);

    // Sample path
    const pathPos  = posCurve.getPoint(t);
    const pathLook = lookCurve.getPoint(t);

    // Floor elevation
    const floorY = getFloorY(pathPos.x, pathPos.z);
    pathPos.y = floorY + EYE_HEIGHT;

    // Mouse parallax — offset perpendicular to travel direction
    const tangent = posCurve.getTangent(t);
    const right   = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    const parallaxOffset = right.multiplyScalar(mouseNorm.x * CAM.parallaxAmt * 2);
    parallaxOffset.y += mouseNorm.y * CAM.parallaxAmt;

    // Apply to camera
    camera.position.lerp(pathPos.add(parallaxOffset), Math.min(1, delta * 5));

    // Smooth look-at
    smoothLook.current.lerp(pathLook, Math.min(1, delta * 4));
    camera.lookAt(smoothLook.current);
  });

  return null;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
