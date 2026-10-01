import * as THREE from 'three';
import { projects } from '@/data';

// ─── Gallery colour palette ───────────────────────────────────────────────────
export const C = {
  bg:          '#F2EFE7',
  wall:        '#EEEAE1',
  wallLight:   '#F7F4ED',
  floor:       '#D8D1C5',
  floorLight:  '#E4DED3',
  shadow:      '#A9A197',
  dark:        '#171717',
  text:        '#181818',
  accent:      '#800020',
  frame:       '#1a1816',
  ceilingSoft: '#E8E4DB',
} as const;

// Three.js hex equivalents
export const CH = {
  bg:        0xF2EFE7,
  wall:      0xEEEAE1,
  wallLight: 0xF7F4ED,
  floor:     0xD8D1C5,
  ceiling:   0xE8E4DB,
  dark:      0x171717,
  frame:     0x1a1816,
  accent:    0x800020,
} as const;

// ─── Camera path waypoints ────────────────────────────────────────────────────
// The scroll-driven camera follows a CatmullRomCurve3 through these points.
// Y = eye height above the floor at that point.
// Scroll 0→1 maps to t=0→1 along the curve.
export const PATH_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(  0,  1.68,  28),   // 0.00 — entrance, looking in
  new THREE.Vector3(  0,  1.68,  20),   // 0.08 — mid entrance
  new THREE.Vector3(  0,  1.68,  14),   // 0.16 — approach arch
  new THREE.Vector3(  0,  1.68,   6),   // 0.24 — pass arch, gallery opens
  new THREE.Vector3( -3,  1.68,  -2),   // 0.32 — drift left, see stair
  new THREE.Vector3( -2,  1.68,  -8),   // 0.40 — stair approach
  new THREE.Vector3(  4,  2.40,  -12),  // 0.48 — ascending stair (Y rises)
  new THREE.Vector3(  6,  3.80,  -16),  // 0.56 — mid stair
  new THREE.Vector3(  5,  5.20,  -20),  // 0.64 — upper landing
  new THREE.Vector3(  2,  6.85,  -24),  // 0.72 — upper gallery floor
  new THREE.Vector3( -2,  6.85,  -28),  // 0.80 — upper gallery, artwork ahead
  new THREE.Vector3(  0,  6.85,  -34),  // 0.88 — approach featured artwork
  new THREE.Vector3(  0,  6.85,  -38),  // 1.00 — final position
];

// Look-at targets paired with each path point
export const LOOKAT_POINTS: THREE.Vector3[] = [
  new THREE.Vector3(  0,  1.68,  20),
  new THREE.Vector3(  0,  1.68,  12),
  new THREE.Vector3(  0,  1.68,   4),
  new THREE.Vector3( -2,  1.68,  -4),
  new THREE.Vector3( -2,  1.68, -10),
  new THREE.Vector3(  3,  2.20, -14),
  new THREE.Vector3(  5,  3.50, -18),
  new THREE.Vector3(  5,  5.00, -22),
  new THREE.Vector3(  2,  6.50, -26),
  new THREE.Vector3( -1,  6.85, -30),
  new THREE.Vector3(  0,  6.85, -36),
  new THREE.Vector3(  0,  6.85, -40),
  new THREE.Vector3(  0,  6.85, -44),
];

// ─── Floor surfaces for Y-elevation ──────────────────────────────────────────
// Each surface defines a rectangular region and its Y floor level.
// The camera Y = surface.y + eyeHeight when inside that region.
export interface FloorSurface {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
  y: number;   // floor Y
}

export const EYE_HEIGHT = 1.68;

export const FLOOR_SURFACES: FloorSurface[] = [
  // Ground floor — entrance + main gallery
  { minX: -20, maxX: 20, minZ: -14, maxZ: 32, y: 0 },
  // Stair step surfaces (16 steps, each ~0.32 deep, ~0.18 high)
  ...Array.from({ length: 16 }, (_, i) => ({
    minX:  2,
    maxX: 12,
    minZ: -14 - i * 0.32,
    maxZ: -14 - i * 0.32 + 0.32,
    y:     i * 0.18,
  })),
  // Upper landing
  { minX: -2, maxX: 14, minZ: -20, maxZ: -14, y: 2.88 },
  // Upper gallery floor
  { minX: -16, maxX: 16, minZ: -46, maxZ: -20, y: 5.20 },
];

// ─── Project artwork positions ────────────────────────────────────────────────
export interface ArtworkDef {
  id:       string;
  title:    string;
  role:     string;
  position: [number, number, number];
  rotation: [number, number, number]; // Euler YXZ
  width:    number;
  height:   number;
  slug:     string;
}

export const ARTWORKS: ArtworkDef[] = [
  {
    id:       'meetsync-ai',
    title:    projects[0].title,
    role:     projects[0].role,
    position: [-9.2, 3.2, -2],
    rotation: [0, Math.PI / 2, 0],
    width:    5.5,
    height:   3.8,
    slug:     projects[0].slug,
  },
  {
    id:       'bullsight',
    title:    projects[1].title,
    role:     projects[1].role,
    position: [9.2, 3.2, -6],
    rotation: [0, -Math.PI / 2, 0],
    width:    5.5,
    height:   3.8,
    slug:     projects[1].slug,
  },
  {
    id:       'tejalens',
    title:    projects[2].title,
    role:     projects[2].role,
    position: [0, 8.2, -40],
    rotation: [0, 0, 0],
    width:    7.0,
    height:   4.5,
    slug:     projects[2].slug,
  },
];

// ─── Camera config ────────────────────────────────────────────────────────────
export const CAM = {
  fov:          50,
  near:         0.05,
  far:          160,
  scrollDamp:   0.06,   // how fast scroll progress catches up
  parallaxAmt:  0.018,  // mouse parallax strength
  approachDist: 4.5,    // distance at which artwork interaction activates
} as const;
