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

// ─── Camera path ──────────────────────────────────────────────────────────────
// Cinematically composed — camera is NEVER pointing at a blank wall.
// Each position has a deliberate look target that reveals the next space.
//
// World layout (Z axis, negative = deeper):
//   Z=30..14  Entrance corridor
//   Z=14..6   Hero arch threshold
//   Z=6..-14  Main gallery (artworks on X=-9.2 and X=+9.2)
//   Z=-14..-30 Stair hall + staircase
//   Z=-30..-46 Upper gallery (TejaLens at Z=-40, Y=8.2+5.2=13.4)
//
// Camera is offset from centre so it never travels dead-centre through rooms.

export const PATH_POINTS: THREE.Vector3[] = [
  // 0.00 — start: slightly left of centre, outside arch, looking through it
  new THREE.Vector3( -1.5,  1.70,  26),
  // 0.08 — drift right, arch fills frame
  new THREE.Vector3(  0.5,  1.70,  20),
  // 0.16 — pass through arch threshold
  new THREE.Vector3(  0.5,  1.70,  13),
  // 0.24 — gallery opens, drift left toward left artwork
  new THREE.Vector3( -2.5,  1.70,   5),
  // 0.32 — left-of-centre, left artwork visible on wall
  new THREE.Vector3( -3.5,  1.70,  -2),
  // 0.40 — cross to right side, right artwork visible
  new THREE.Vector3(  2.0,  1.70,  -8),
  // 0.48 — approach stair, offset left so stair fills right frame
  new THREE.Vector3( -1.5,  1.70, -13),
  // 0.56 — ascending: camera rises with stair
  new THREE.Vector3(  1.5,  2.80, -17),
  // 0.64 — mid-stair, looking up toward landing
  new THREE.Vector3(  3.0,  4.20, -21),
  // 0.72 — upper landing, looking into upper gallery
  new THREE.Vector3(  1.5,  6.90, -26),
  // 0.80 — upper gallery, drift left
  new THREE.Vector3( -1.5,  6.90, -31),
  // 0.88 — approach TejaLens, centred
  new THREE.Vector3(  0.0,  6.90, -36),
  // 1.00 — final: comfortable viewing distance from TejaLens
  new THREE.Vector3(  0.0,  6.90, -33),
];

// Look-at targets — deliberately ahead of and above camera position
// so the camera always has a visual destination.
export const LOOKAT_POINTS: THREE.Vector3[] = [
  // 0.00 — look through arch into gallery
  new THREE.Vector3(  0.0,  2.20,  10),
  // 0.08 — look at arch opening
  new THREE.Vector3(  0.0,  3.50,   8),
  // 0.16 — look into gallery, slight upward
  new THREE.Vector3( -1.0,  2.20,   0),
  // 0.24 — look toward left artwork on wall
  new THREE.Vector3( -8.0,  3.20,  -2),
  // 0.32 — look at left artwork directly
  new THREE.Vector3( -9.2,  3.20,  -2),
  // 0.40 — look toward right artwork
  new THREE.Vector3(  9.2,  3.20,  -6),
  // 0.48 — look up toward stair landing
  new THREE.Vector3(  3.0,  4.50, -18),
  // 0.56 — look up toward upper arch opening
  new THREE.Vector3(  3.0,  5.50, -22),
  // 0.64 — look toward upper gallery opening
  new THREE.Vector3(  2.0,  7.20, -26),
  // 0.72 — look into upper gallery, TejaLens hint
  new THREE.Vector3(  0.0,  8.00, -34),
  // 0.80 — look at TejaLens
  new THREE.Vector3(  0.0,  8.20+5.20, -40),
  // 0.88 — look at TejaLens centre
  new THREE.Vector3(  0.0,  8.20+5.20, -40),
  // 1.00 — look at TejaLens, comfortable framing
  new THREE.Vector3(  0.0,  8.20+5.20, -40),
];

// ─── Floor surfaces ───────────────────────────────────────────────────────────
export interface FloorSurface {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
  y: number;
}

export const EYE_HEIGHT = 1.70;

// Stair geometry: 12 steps, rise=0.18, depth=0.36
// Flight 1: Z=-14 → Z=-18.32, Y=0→2.16
// Landing:  Z=-18.32 → Z=-20, Y=2.16
// Flight 2: Z=-20 → Z=-24.32, Y=2.16→4.32
// Upper:    Y=5.20 (raised platform)
const STAIR_RISE  = 0.18;
const STAIR_DEPTH = 0.36;
const STAIR_COUNT = 12;

export const FLOOR_SURFACES: FloorSurface[] = [
  { minX: -20, maxX: 20, minZ: -14, maxZ: 32, y: 0 },
  ...Array.from({ length: STAIR_COUNT }, (_, i) => ({
    minX:  -1, maxX: 10,
    minZ: -14 - i * STAIR_DEPTH,
    maxZ: -14 - i * STAIR_DEPTH + STAIR_DEPTH,
    y:     i * STAIR_RISE,
  })),
  { minX: -2, maxX: 12, minZ: -20, maxZ: -14, y: STAIR_COUNT * STAIR_RISE },
  ...Array.from({ length: STAIR_COUNT }, (_, i) => ({
    minX:  -1, maxX: 10,
    minZ: -20 - i * STAIR_DEPTH,
    maxZ: -20 - i * STAIR_DEPTH + STAIR_DEPTH,
    y:     STAIR_COUNT * STAIR_RISE + i * STAIR_RISE,
  })),
  { minX: -16, maxX: 16, minZ: -46, maxZ: -24, y: 5.20 },
];

// ─── Artwork definitions ──────────────────────────────────────────────────────
export interface ArtworkDef {
  id:       string;
  title:    string;
  role:     string;
  position: [number, number, number];
  rotation: [number, number, number];
  width:    number;
  height:   number;
  slug:     string;
}

// Artworks are on the walls, not floating.
// Left wall X=-9.8 (wall inner face), right wall X=+9.8
// Upper gallery back wall Z=-44.5 (wall inner face), floor Y=5.20
export const ARTWORKS: ArtworkDef[] = [
  {
    id:       'meetsync-ai',
    title:    projects[0].title,
    role:     projects[0].role,
    position: [-9.8, 3.0, -2.0],
    rotation: [0, Math.PI / 2, 0],
    width:    4.8,
    height:   3.4,
    slug:     projects[0].slug,
  },
  {
    id:       'bullsight',
    title:    projects[1].title,
    role:     projects[1].role,
    position: [9.8, 3.0, -6.0],
    rotation: [0, -Math.PI / 2, 0],
    width:    4.8,
    height:   3.4,
    slug:     projects[1].slug,
  },
  {
    id:       'tejalens',
    title:    projects[2].title,
    role:     projects[2].role,
    // Upper gallery: floor Y=5.20, artwork centre at Y=5.20+3.0=8.20
    position: [0, 5.20 + 3.0, -44.5],
    rotation: [0, 0, 0],
    width:    6.0,
    height:   4.2,
    slug:     projects[2].slug,
  },
];

// ─── Camera config ────────────────────────────────────────────────────────────
export const CAM = {
  fov:          52,
  near:         0.08,
  far:          160,
  scrollDamp:   0.055,
  parallaxAmt:  0.014,
  // Approach stops 2.8 units in front of artwork — frame fills ~75% of viewport
  approachDist: 2.8,
} as const;

// Stair geometry constants — exported so Architecture can use them
export const STAIR = {
  rise:    STAIR_RISE,
  depth:   STAIR_DEPTH,
  count:   STAIR_COUNT,
  width:   8.0,
  offsetX: 3.0,   // centre X of staircase
  startZ:  -14.0, // Z where first step begins
} as const;
