/**
 * CameraController.tsx — PART B.5, B.10
 * ─────────────────────────────────────────────────────────────────────────────
 * The camera's X/Z come from the spline in layout.ts. Its Y does NOT: every
 * frame a ray is fired straight down from the camera's own X/Z against the
 * meshes tagged onto LAYER_FLOOR (ground slab, stair treads, landing, upper
 * platform — see GalleryArchitecture). The hit is turned into
 * `y = hit.y + EYE_HEIGHT` and damped, so stepping onto the staircase is a
 * smooth climb instead of a jump, and FLOOR_SURFACES no longer exists.
 *
 * Pointer and progress are read from the mutable `scrollStore` inside useFrame,
 * so moving the mouse or scrolling never re-renders the React tree.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useMemo, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAM, EYE_HEIGHT, LAYER_FLOOR, SHOTS, evalSpline, scrollStore } from './constants';

/** How fast the camera settles onto a new ground height (higher = snappier). */
const GROUND_LAMBDA = 9;
/** How fast the dolly catches the target position. */
const POS_LAMBDA = 6;

export default function CameraController() {
  const camera = useThree(s => s.camera);
  const scene = useThree(s => s.scene);

  const raycaster = useMemo(() => {
    const r = new THREE.Raycaster();
    r.layers.set(LAYER_FLOOR);   // only "floor" surfaces may be hit
    r.far = 60;
    return r;
  }, []);

  const scratch = useMemo(() => ({
    down: new THREE.Vector3(0, -1, 0),
    worldUp: new THREE.Vector3(0, 1, 0),
    origin: new THREE.Vector3(),
    look: new THREE.Vector3(),
    finalLook: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    right: new THREE.Vector3(),
    up: new THREE.Vector3(),
  }), []);

  const smoothPos = useRef(new THREE.Vector3());
  const smoothLook = useRef(new THREE.Vector3());
  const groundY = useRef(0);
  const swayT = useRef(0);
  const primed = useRef(false);

  useFrame((_, delta) => {
    const t = scrollStore.testT ?? scrollStore.progress;
    const { pos, look } = evalSpline(t);

    // Deterministic mode: `?t=` pins the camera exactly, with no smoothing at
    // all, so screenshots taken at the same t are identical.
    const pinned = scrollStore.testT !== null;

    if (!primed.current || pinned) {
      smoothPos.current.set(pos[0], pos[1], pos[2]);
      smoothLook.current.set(look[0], look[1], look[2]);
      groundY.current = pos[1] - EYE_HEIGHT;
      primed.current = true;
    }

    if (!pinned) {
      const pLerp = 1 - Math.pow(0.006, delta);
      smoothPos.current.x = THREE.MathUtils.lerp(smoothPos.current.x, pos[0], pLerp);
      smoothPos.current.z = THREE.MathUtils.lerp(smoothPos.current.z, pos[2], pLerp);

      const lLerp = 1 - Math.pow(0.004, delta);
      scratch.look.set(look[0], look[1], look[2]);
      smoothLook.current.lerp(scratch.look, lLerp);
    } else {
      smoothLook.current.set(look[0], look[1], look[2]);
    }

    // ── Floor raycast (PART B.5) ────────────────────────────────────────────
    scratch.origin.set(
      smoothPos.current.x,
      smoothPos.current.y + 4,
      smoothPos.current.z,
    );
    raycaster.set(scratch.origin, scratch.down);
    const hits = raycaster.intersectObjects(scene.children, true);
    const hitY = hits.length > 0 ? hits[0].point.y : groundY.current;
    groundY.current = pinned
      ? hitY
      : THREE.MathUtils.damp(groundY.current, hitY, GROUND_LAMBDA, delta);
    smoothPos.current.y = groundY.current + EYE_HEIGHT;

    // ── Breathing sway + pointer parallax, both from the mutable store ──────
    swayT.current += delta * 0.4;
    const swayX = Math.sin(swayT.current * 0.7) * 0.018;
    const swayY = Math.sin(swayT.current * 0.5) * 0.010;

    scratch.toTarget.copy(smoothLook.current).sub(smoothPos.current).normalize();
    scratch.right.crossVectors(scratch.toTarget, scratch.worldUp).normalize();
    scratch.up.crossVectors(scratch.right, scratch.toTarget).normalize();

    scratch.finalLook.copy(smoothLook.current);
    if (!pinned) {
      scratch.finalLook
        .addScaledVector(scratch.right, scrollStore.mouseX * CAM.maxYaw * 3.0 + swayX)
        .addScaledVector(scratch.up, -scrollStore.mouseY * CAM.maxPitch * 2.0 + swayY);
    }

    camera.position.copy(smoothPos.current);
    camera.lookAt(scratch.finalLook);
  });

  return null;
}

/** Exported for the debug harness / tests. */
export const CAMERA_SHOT_COUNT = SHOTS.length;
