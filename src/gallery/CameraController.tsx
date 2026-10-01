import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  PATH_POINTS, LOOKAT_POINTS,
  FLOOR_SURFACES, EYE_HEIGHT,
  CAM, type ArtworkDef,
} from './constants';

const posCurve  = new THREE.CatmullRomCurve3(PATH_POINTS,   false, 'catmullrom', 0.5);
const lookCurve = new THREE.CatmullRomCurve3(LOOKAT_POINTS, false, 'catmullrom', 0.5);

function getFloorY(x: number, z: number): number {
  let best = 0;
  for (const s of FLOOR_SURFACES) {
    if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) {
      if (s.y > best) best = s.y;
    }
  }
  return best;
}

interface Props {
  scrollProgress: number;
  mouseNorm:      { x: number; y: number };
  artworkTarget:  ArtworkDef | null;
  onApproachDone: () => void;
  enabled:        boolean;
}

export default function CameraController({
  scrollProgress, mouseNorm, artworkTarget, onApproachDone, enabled,
}: Props) {
  const { camera } = useThree();

  const smoothT    = useRef(0);
  const smoothLook = useRef(new THREE.Vector3());

  // Approach state
  const approaching    = useRef(false);
  const approachDone   = useRef(false);
  const approachAlpha  = useRef(0);
  const holdTimer      = useRef(0);
  const approachStart  = useRef(new THREE.Vector3());
  const approachTarget = useRef(new THREE.Vector3());
  const approachLookAt = useRef(new THREE.Vector3());

  // WASD fallback
  const keys = useRef({ w: false, s: false });
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = true;
      if (e.code === 'KeyS') keys.current.s = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'KeyW') keys.current.w = false;
      if (e.code === 'KeyS') keys.current.s = false;
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  useEffect(() => {
    if (!artworkTarget) {
      approaching.current   = false;
      approachDone.current  = false;
      approachAlpha.current = 0;
      holdTimer.current     = 0;
      return;
    }
    approaching.current   = true;
    approachDone.current  = false;
    approachAlpha.current = 0;
    holdTimer.current     = 0;
    approachStart.current.copy(camera.position);

    // Stop 2.8 units in front of artwork face
    const artPos = new THREE.Vector3(...artworkTarget.position);
    const artRot = new THREE.Euler(...artworkTarget.rotation);
    const fwd    = new THREE.Vector3(0, 0, 1).applyEuler(artRot);
    approachTarget.current.copy(artPos).addScaledVector(fwd, CAM.approachDist);
    approachTarget.current.y = artPos.y; // eye level = artwork centre
    approachLookAt.current.copy(artPos);
  }, [artworkTarget, camera]);

  useFrame((_, delta) => {
    if (!enabled) return;

    // ── Approach animation ──────────────────────────────────────────────
    if (approaching.current && artworkTarget) {
      if (approachAlpha.current < 1) {
        approachAlpha.current = Math.min(1, approachAlpha.current + delta * 0.75);
        const t = easeInOut(approachAlpha.current);
        camera.position.lerpVectors(approachStart.current, approachTarget.current, t);
        const lk = new THREE.Vector3().lerpVectors(
          approachStart.current, approachLookAt.current, t,
        );
        camera.lookAt(lk);
      } else {
        // Hold for 220ms then fire done
        holdTimer.current += delta;
        camera.position.copy(approachTarget.current);
        camera.lookAt(approachLookAt.current);
        if (holdTimer.current > 0.22 && !approachDone.current) {
          approachDone.current = true;
          onApproachDone();
        }
      }
      return;
    }

    // ── Scroll path ─────────────────────────────────────────────────────
    smoothT.current += (scrollProgress - smoothT.current) * Math.min(1, delta / CAM.scrollDamp);
    const t = THREE.MathUtils.clamp(smoothT.current, 0, 1);

    if (keys.current.w) smoothT.current = Math.min(1, smoothT.current + delta * 0.012);
    if (keys.current.s) smoothT.current = Math.max(0, smoothT.current - delta * 0.012);

    const pathPos  = posCurve.getPoint(t);
    const pathLook = lookCurve.getPoint(t);

    // Y elevation from floor surfaces
    const floorY = getFloorY(pathPos.x, pathPos.z);
    pathPos.y = floorY + EYE_HEIGHT;

    // Mouse parallax — perpendicular to travel
    const tangent = posCurve.getTangent(Math.max(0.001, Math.min(0.999, t)));
    const right   = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    pathPos.addScaledVector(right, mouseNorm.x * CAM.parallaxAmt * 1.5);
    pathPos.y += mouseNorm.y * CAM.parallaxAmt * 0.5;

    camera.position.lerp(pathPos, Math.min(1, delta * 6));
    smoothLook.current.lerp(pathLook, Math.min(1, delta * 5));
    camera.lookAt(smoothLook.current);
  });

  return null;
}

function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
