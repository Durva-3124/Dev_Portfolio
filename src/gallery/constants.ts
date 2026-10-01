// ─── Palette ────────────────────────────────────────────────────────────────
export const COLORS = {
  accent:          0x800020,
  accentTint:      0xc2274f,
  accentSecondary: 0xe0b878,
  bg:              0x0d0709,
  wallDark:        0x110a0c,
  wallMid:         0x1a0f12,
  floor:           0x0f0b0d,
  ceiling:         0x0d0709,
  goldLight:       0xe0b878,
  warmWhite:       0xfff5e8,
  fogColor:        0x0d0709,
} as const;

// ─── Room geometry ───────────────────────────────────────────────────────────
export const ROOM = {
  width:          28,
  height:          7,
  depth:          60,
  wallThickness: 0.3,
} as const;

// ─── Camera / player ─────────────────────────────────────────────────────────
export const CAMERA = {
  fov:        65,
  near:       0.1,
  far:        120,
  eyeHeight:  1.7,
  moveSpeed:  6,
  sprintMult: 1.8,
  lookSensX:  0.0018,
  lookSensY:  0.0015,
  pitchLimit: Math.PI / 2.2,
  startPos:   [0, 1.7, 26] as [number, number, number],
  startYaw:   Math.PI,
} as const;

// ─── Collision bounds ────────────────────────────────────────────────────────
export const BOUNDS = {
  minX: -(ROOM.width  / 2) + 0.6,
  maxX:  (ROOM.width  / 2) - 0.6,
  minZ: -(ROOM.depth  / 2) + 0.6,
  maxZ:  (ROOM.depth  / 2) - 0.6,
} as const;

// ─── Fog ─────────────────────────────────────────────────────────────────────
export const FOG = {
  near: 18,
  far:  72,
} as const;
