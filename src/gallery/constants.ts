import * as THREE from 'three';

// ─── Material palette ─────────────────────────────────────────────────────────
// Walls: warm off-white stone. Floor: dark polished. Ceiling: near-black.
// Burgundy only in lighting. Gold only in thin trim.
export const MAT = {
  // Warm off-white stone for main wall surfaces
  stone:      { color: 0xd4c9bc, roughness: 0.88, metalness: 0.0  },
  // Slightly darker stone for secondary surfaces / soffits
  stoneDark:  { color: 0x9e9189, roughness: 0.92, metalness: 0.0  },
  // Dark polished concrete/stone floor
  floor:      { color: 0x1a1614, roughness: 0.18, metalness: 0.45 },
  // Near-black ceiling
  ceiling:    { color: 0x0e0c0b, roughness: 0.95, metalness: 0.0  },
  // Charcoal structural metal (columns, beams)
  metal:      { color: 0x1c1a1a, roughness: 0.55, metalness: 0.75 },
  // Champagne gold — used ONLY for thin trim lines
  gold:       { color: 0xc8a96e, roughness: 0.25, metalness: 0.9,
                emissive: 0xc8a96e, emissiveIntensity: 0.06 },
  // Matte plaster for exhibit walls — large blank canvases
  exhibit:    { color: 0xe8e0d6, roughness: 0.95, metalness: 0.0  },
  // Stair treads — slightly lighter than floor
  stair:      { color: 0x2a2422, roughness: 0.35, metalness: 0.3  },
  // Glass railing — transparent
  glass:      { color: 0x8ab0c0, roughness: 0.05, metalness: 0.1,
                transparent: true, opacity: 0.18 },
} as const;

// ─── Spatial layout ───────────────────────────────────────────────────────────
// All Z values: positive = toward camera start (entrance), negative = deeper in
export const SPACES = {
  entrance: {
    w: 14, h: 5.5, d: 10,
    cx: 0, cy: 0, cz: 23,          // front wall at Z=18, flush with atrium south wall
  },
  atrium: {
    w: 34, h: 14, d: 36,
    cx: 0, cy: 0, cz: 0,
  },
  mezzanine: {
    y: 5.2,                         // floor level of upper gallery
    railH: 1.1,
    depth: 8,                       // how far back the mezzanine extends
    cz: -10,
  },
  stair: {
    startZ:  10,                    // bottom of stair (atrium side)
    endZ:    -6,                    // top landing Z
    startY:  0,
    endY:    5.2,
    width:   5.5,
    cx:      12,                    // offset to right side of atrium
  },
  leftWing: {
    w: 14, h: 8, d: 20,
    cx: -24, cy: 0, cz: 0,
  },
  rightWing: {
    w: 14, h: 8, d: 20,
    cx:  24, cy: 0, cz: 0,
  },
} as const;

// ─── Camera ───────────────────────────────────────────────────────────────────
export const CAMERA = {
  fov:        60,
  near:       0.08,
  far:        140,
  eyeHeight:  1.65,
  moveSpeed:  4.2,                  // slower, cinematic walk
  lookSensX:  0.0016,
  lookSensY:  0.0013,
  pitchLimit: Math.PI / 2.1,
  // Start just inside entrance, facing into the atrium (-Z direction)
  startPos:   [0, 1.65, 25] as [number, number, number],
  startYaw:   Math.PI,              // face -Z
} as const;

// ─── Fog ─────────────────────────────────────────────────────────────────────
export const FOG = {
  color: 0x0d0b0a,
  near:  22,
  far:   85,
} as const;

// ─── Lighting colours ─────────────────────────────────────────────────────────
export const LIGHT = {
  ambient:    { color: 0xfff0e0, intensity: 0.22 },
  key:        { color: 0xfff5e8, intensity: 0.55 },
  burgundy:   0xb01030,
  gold:       0xe0b060,
  warmWhite:  0xfff0d8,
  coolWhite:  0xf0f4ff,
  stairGlow:  0xd08040,
} as const;

// ─── Collision zones (axis-aligned boxes) ────────────────────────────────────
// Each zone defines where the player CAN be. The controller picks the active
// zone(s) and clamps within their union. More zones added as rooms are built.
export interface CollisionZone {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
  minY?: number; maxY?: number;
}

const pad = 0.55; // wall padding

export const COLLISION_ZONES: CollisionZone[] = [
  // Entrance hall
  {
    minX: -(SPACES.entrance.w / 2) + pad,
    maxX:  (SPACES.entrance.w / 2) - pad,
    minZ:  SPACES.entrance.cz - SPACES.entrance.d / 2 + pad,
    maxZ:  SPACES.entrance.cz + SPACES.entrance.d / 2 - pad,
  },
  // Central atrium
  {
    minX: -(SPACES.atrium.w / 2) + pad,
    maxX:  (SPACES.atrium.w / 2) - pad,
    minZ: -(SPACES.atrium.d / 2) + pad,
    maxZ:  (SPACES.atrium.d / 2) - pad,
  },
  // Left wing
  {
    minX: SPACES.leftWing.cx - SPACES.leftWing.w / 2 + pad,
    maxX: SPACES.leftWing.cx + SPACES.leftWing.w / 2 - pad,
    minZ: -(SPACES.leftWing.d / 2) + pad,
    maxZ:  (SPACES.leftWing.d / 2) - pad,
  },
  // Right wing
  {
    minX: SPACES.rightWing.cx - SPACES.rightWing.w / 2 + pad,
    maxX: SPACES.rightWing.cx + SPACES.rightWing.w / 2 - pad,
    minZ: -(SPACES.rightWing.d / 2) + pad,
    maxZ:  (SPACES.rightWing.d / 2) - pad,
  },
];

// ─── Helper: build a MeshStandardMaterial from MAT entry ─────────────────────
type MatEntry = typeof MAT[keyof typeof MAT];
export function makeMat(entry: MatEntry): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({
    color:     entry.color,
    roughness: entry.roughness,
    metalness: entry.metalness,
  });
  if ('emissive' in entry && entry.emissive !== undefined) {
    m.emissive = new THREE.Color(entry.emissive as number);
    m.emissiveIntensity = (entry as { emissiveIntensity: number }).emissiveIntensity;
  }
  if ('transparent' in entry && entry.transparent) {
    m.transparent = true;
    m.opacity = (entry as { opacity: number }).opacity;
  }
  return m;
}
