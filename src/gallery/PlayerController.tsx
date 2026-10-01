import { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAMERA, COLLISION_ZONES, type CollisionZone } from './constants';

interface PlayerControllerProps {
  onLockChange?: (locked: boolean) => void;
  enabled?: boolean;
}

// Returns true if point (x, z) is inside any collision zone
function inAnyZone(x: number, z: number, zones: CollisionZone[]): boolean {
  for (const z_ of zones) {
    if (x >= z_.minX && x <= z_.maxX && z >= z_.minZ && z <= z_.maxZ) return true;
  }
  return false;
}

export default function PlayerController({
  onLockChange,
  enabled = true,
}: PlayerControllerProps) {
  const { camera, gl } = useThree();

  const keys      = useRef({ w: false, a: false, s: false, d: false });
  const yaw       = useRef(CAMERA.startYaw);
  const pitch     = useRef(0);
  const locked    = useRef(false);
  const velocity  = useRef(new THREE.Vector3());

  // ── Init camera ──────────────────────────────────────────────────────────
  useEffect(() => {
    camera.position.set(...CAMERA.startPos);
    const pc = camera as THREE.PerspectiveCamera;
    pc.fov  = CAMERA.fov;
    pc.near = CAMERA.near;
    pc.far  = CAMERA.far;
    pc.updateProjectionMatrix();
    // Apply initial yaw so camera faces into the atrium
    camera.quaternion.setFromEuler(
      new THREE.Euler(0, CAMERA.startYaw, 0, 'YXZ')
    );
  }, [camera]);

  // ── Pointer lock ─────────────────────────────────────────────────────────
  const requestLock = useCallback(() => {
    if (!enabled) return;
    gl.domElement.requestPointerLock();
  }, [gl, enabled]);

  useEffect(() => {
    const handler = () => {
      locked.current = document.pointerLockElement === gl.domElement;
      onLockChange?.(locked.current);
    };
    document.addEventListener('pointerlockchange', handler);
    return () => document.removeEventListener('pointerlockchange', handler);
  }, [gl, onLockChange]);

  // ── Mouse look ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!locked.current) return;
      yaw.current   -= e.movementX * CAMERA.lookSensX;
      pitch.current -= e.movementY * CAMERA.lookSensY;
      pitch.current  = THREE.MathUtils.clamp(
        pitch.current, -CAMERA.pitchLimit, CAMERA.pitchLimit
      );
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  // ── Keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp')    keys.current.w = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.current.a = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown')  keys.current.s = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.d = true;
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp')    keys.current.w = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.current.a = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown')  keys.current.s = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.current.d = false;
    };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup',   up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  // ── Click to lock ────────────────────────────────────────────────────────
  useEffect(() => {
    gl.domElement.addEventListener('click', requestLock);
    return () => gl.domElement.removeEventListener('click', requestLock);
  }, [gl, requestLock]);

  // ── Per-frame ────────────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!enabled) return;

    // Rotation
    camera.quaternion.setFromEuler(
      new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ')
    );

    // Desired direction
    const dir = new THREE.Vector3();
    if (keys.current.w) dir.z -= 1;
    if (keys.current.s) dir.z += 1;
    if (keys.current.a) dir.x -= 1;
    if (keys.current.d) dir.x += 1;
    if (dir.lengthSq() > 0) dir.normalize();

    // Rotate by yaw only
    dir.applyQuaternion(
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw.current, 0, 'YXZ'))
    );
    dir.multiplyScalar(CAMERA.moveSpeed);

    // Smooth deceleration — higher lerp factor = snappier, lower = floatier
    velocity.current.lerp(dir, Math.min(1, delta * 9));

    const nx = camera.position.x + velocity.current.x * delta;
    const nz = camera.position.z + velocity.current.z * delta;

    // Multi-zone collision: only move if destination is inside a valid zone
    const cx = camera.position.x;
    const cz = camera.position.z;

    camera.position.x = inAnyZone(nx, cz, COLLISION_ZONES) ? nx : cx;
    camera.position.z = inAnyZone(camera.position.x, nz, COLLISION_ZONES) ? nz : cz;
    camera.position.y = CAMERA.eyeHeight;
  });

  return null;
}
