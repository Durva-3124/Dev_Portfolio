import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA, BOUNDS } from './constants';

// Keys held down
interface Keys {
  w: boolean; a: boolean; s: boolean; d: boolean; shift: boolean;
}

interface PlayerControllerProps {
  /** Called when pointer lock is acquired/released */
  onLockChange?: (locked: boolean) => void;
  enabled?: boolean;
}

export default function PlayerController({
  onLockChange,
  enabled = true,
}: PlayerControllerProps) {
  const { camera, gl } = useThree();

  const keys      = useRef<Keys>({ w: false, a: false, s: false, d: false, shift: false });
  const yaw       = useRef(CAMERA.startYaw);
  const pitch     = useRef(0);
  const locked    = useRef(false);
  const velocity  = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());

  // ── Initialise camera position ──────────────────────────────────────────
  useEffect(() => {
    camera.position.set(...CAMERA.startPos);
    const pCam = camera as THREE.PerspectiveCamera;
    pCam.fov  = CAMERA.fov;
    pCam.near = CAMERA.near;
    pCam.far  = CAMERA.far;
    pCam.updateProjectionMatrix();
  }, [camera]);

  // ── Pointer lock ─────────────────────────────────────────────────────────
  const requestLock = useCallback(() => {
    if (!enabled) return;
    gl.domElement.requestPointerLock();
  }, [gl, enabled]);

  useEffect(() => {
    const onLockChange = () => {
      locked.current = document.pointerLockElement === gl.domElement;
    };
    document.addEventListener('pointerlockchange', onLockChange);
    return () => document.removeEventListener('pointerlockchange', onLockChange);
  }, [gl]);

  // Notify parent of lock state
  useEffect(() => {
    const handler = () => {
      const isLocked = document.pointerLockElement === gl.domElement;
      onLockChange?.(isLocked);
    };
    document.addEventListener('pointerlockchange', handler);
    return () => document.removeEventListener('pointerlockchange', handler);
  }, [gl, onLockChange]);

  // ── Mouse look ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!locked.current) return;
      yaw.current   -= e.movementX * CAMERA.lookSensX;
      pitch.current -= e.movementY * CAMERA.lookSensY;
      pitch.current  = THREE.MathUtils.clamp(
        pitch.current,
        -CAMERA.pitchLimit,
        CAMERA.pitchLimit
      );
    };
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }, []);

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.current.w     = true; break;
        case 'KeyA': case 'ArrowLeft':  keys.current.a     = true; break;
        case 'KeyS': case 'ArrowDown':  keys.current.s     = true; break;
        case 'KeyD': case 'ArrowRight': keys.current.d     = true; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = true; break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    keys.current.w     = false; break;
        case 'KeyA': case 'ArrowLeft':  keys.current.a     = false; break;
        case 'KeyS': case 'ArrowDown':  keys.current.s     = false; break;
        case 'KeyD': case 'ArrowRight': keys.current.d     = false; break;
        case 'ShiftLeft': case 'ShiftRight': keys.current.shift = false; break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup',   onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup',   onKeyUp);
    };
  }, []);

  // ── Click canvas to request pointer lock ─────────────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('click', requestLock);
    return () => canvas.removeEventListener('click', requestLock);
  }, [gl, requestLock]);

  // ── Per-frame update ─────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!enabled) return;

    // Apply yaw/pitch to camera quaternion
    const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);

    // Movement direction in camera-local XZ
    direction.current.set(0, 0, 0);
    if (keys.current.w) direction.current.z -= 1;
    if (keys.current.s) direction.current.z += 1;
    if (keys.current.a) direction.current.x -= 1;
    if (keys.current.d) direction.current.x += 1;

    if (direction.current.lengthSq() > 0) {
      direction.current.normalize();
    }

    const speed = CAMERA.moveSpeed * (keys.current.shift ? CAMERA.sprintMult : 1);

    // Rotate direction by yaw only (no pitch for movement)
    const yawQuat = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, yaw.current, 0, 'YXZ')
    );
    direction.current.applyQuaternion(yawQuat);

    // Smooth velocity with lerp
    velocity.current.lerp(
      direction.current.multiplyScalar(speed),
      Math.min(1, delta * 12)
    );

    // Proposed new position
    const nx = camera.position.x + velocity.current.x * delta;
    const nz = camera.position.z + velocity.current.z * delta;

    // Collision clamp
    camera.position.x = THREE.MathUtils.clamp(nx, BOUNDS.minX, BOUNDS.maxX);
    camera.position.z = THREE.MathUtils.clamp(nz, BOUNDS.minZ, BOUNDS.maxZ);
    camera.position.y = CAMERA.eyeHeight; // lock to eye height
  });

  return null;
}
