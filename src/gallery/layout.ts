/**
 * layout.ts — SINGLE SOURCE OF TRUTH for the gallery's physical layout.
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTHING else under src/gallery may hard-code a position, size or height.
 * Walls, arches, floors, the staircase, the camera spline, artwork mounting,
 * light targets and UI room zones are ALL derived from the tables below.
 *
 * This module is deliberately dependency-free (no `three`, no React, no
 * `@/data`) so the headless verification script (`scripts/verify-layout.mjs`)
 * can import it directly through Node's native TypeScript type-stripping and
 * re-derive exactly the same geometry the renderer builds.
 *
 * Only erasable TypeScript syntax is allowed here (tsconfig has
 * `erasableSyntaxOnly`) — no enums, no namespaces, no parameter properties.
 *
 * COORDINATES
 *   +X right     +Y up     -Z into the gallery (the camera travels toward -Z)
 *   Y = 0 is the ground gallery floor. The upper gallery floor is Y = 5.2.
 *
 * ROOM STACK (all rooms share interior width 20, wall thickness 1.2)
 *   vestibule   z  30 →  14   H 6.0   floor 0
 *   gallery     z  14 → -14   H 9.0   floor 0
 *   stair hall  z -14 → -38   H 13.0  floor 0 → 5.2 (stairs)
 *   upper       z -38 → -58   H 6.5   floor 5.2
 * Rooms never overlap in Z: every boundary is a single wall shared by exactly
 * two rooms, and each shared wall carries exactly one arch.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Global masonry constants ────────────────────────────────────────────────
export const WALL_T = 1.2;                  // every wall is 1.2 thick
export const INTERIOR_W = 20;               // every room is 20 wide (inner face to inner face)
export const HALF_W = INTERIOR_W / 2;       // 10   → X of every side-wall INNER face
export const WALL_CX = HALF_W + WALL_T / 2; // 10.6 → X of every side-wall centre line
export const OUTER_HALF_W = HALF_W + WALL_T;// 11.2 → X of every side-wall OUTER face
export const EYE_HEIGHT = 1.7;              // camera height above the floor surface
export const UPPER_FLOOR_Y = 5.2;           // upper gallery floor === top of the staircase

// ─── Rooms ───────────────────────────────────────────────────────────────────
export type RoomId = 'vestibule' | 'gallery' | 'stairhall' | 'upper';

export interface RoomLayout {
  id: RoomId;
  label: string;
  /** boundary wall centre-line on the +Z (entry) side */
  zNear: number;
  /** boundary wall centre-line on the -Z (far) side */
  zFar: number;
  floorY: number;
  /** ceiling height measured above floorY */
  height: number;
  ceilingY: number;
}

export const ROOMS_LAYOUT: Record<RoomId, RoomLayout> = {
  vestibule: { id: 'vestibule', label: 'Vestibule',    zNear:  30, zFar:  14, floorY: 0, height: 6,   ceilingY: 6 },
  gallery:   { id: 'gallery',   label: 'Main Gallery', zNear:  14, zFar: -14, floorY: 0, height: 9,   ceilingY: 9 },
  stairhall: { id: 'stairhall', label: 'Stair Hall',   zNear: -14, zFar: -38, floorY: 0, height: 13,  ceilingY: 13 },
  upper:     { id: 'upper',     label: 'Upper Gallery', zNear: -38, zFar: -58, floorY: UPPER_FLOOR_Y, height: 6.5, ceilingY: UPPER_FLOOR_Y + 6.5 },
};

export const ROOM_ORDER: RoomId[] = ['vestibule', 'gallery', 'stairhall', 'upper'];

export function roomById(id: RoomId): RoomLayout {
  return ROOMS_LAYOUT[id];
}

/** Z of the room's midpoint (origin for the `offset` argument of artworkOnWall). */
export function roomCentreZ(room: RoomLayout): number {
  return (room.zNear + room.zFar) / 2;
}

/** Z of a room's INNER face on one of its two cross walls. */
export function roomInnerZ(room: RoomLayout, side: 'near' | 'far'): number {
  return side === 'near' ? room.zNear - WALL_T / 2 : room.zFar + WALL_T / 2;
}

/** X of a room's INNER wall face. Every room shares the same width. */
export function wallInnerX(room: RoomLayout | RoomId, side: 'left' | 'right'): number {
  void (typeof room === 'string' ? roomById(room) : room);
  return side === 'left' ? -HALF_W : HALF_W;
}
// ─── Shared walls (exactly one arch per shared wall) ─────────────────────────
export type WallSide = 'left' | 'right' | 'back' | 'front';

export interface Boundary {
  id: string;
  /** wall centre-line */
  z: number;
  wallW: number;
  /** TOP of the wall panel, in world Y */
  topY: number;
  /** BOTTOM of the wall panel, in world Y (0 except for the upper arch sill) */
  baseY: number;
  arch: boolean;
  /** arch opening width (0 when `arch` is false) */
  openW: number;
  /** arch crown height, measured UP FROM the panel base */
  openH: number;
  /** straight leg height = openH − openW/2. MUST be >= 0 (see PART B.1). */
  spring: number;
  rooms: RoomId[];
}

function archWall(
  id: string, z: number, topY: number, baseY: number,
  openW: number, openH: number, rooms: RoomId[],
): Boundary {
  return { id, z, rooms, wallW: INTERIOR_W, topY, baseY, arch: true, openW, openH, spring: openH - openW / 2 };
}

export const BOUNDARIES: Boundary[] = [
  // Vestibule front (exterior) — the light source at the head of the axis.
  archWall('front',  30,  6,  0,             9.0, 5.4, ['vestibule']),
  // Vestibule ⇄ main gallery — closes the vestibule/gallery gap.
  archWall('vg',     14,  9,  0,             6.0, 4.8, ['vestibule', 'gallery']),
  // Main gallery ⇄ stair hall.
  archWall('gs',    -14, 13,  0,             7.5, 7.5, ['gallery', 'stairhall']),
  // Stair hall ⇄ upper gallery — SILL AT Y = 5.2 so the camera can walk through.
  archWall('su',    -38, 13,  UPPER_FLOOR_Y, 7.5, 5.6, ['stairhall', 'upper']),
  // Upper gallery back wall (solid) — TejaLens hangs here.
  { id: 'ub', z: -58, rooms: ['upper'], wallW: INTERIOR_W, topY: UPPER_FLOOR_Y + 6.5, baseY: UPPER_FLOOR_Y, arch: false, openW: 0, openH: 0, spring: 0 },
];

export function boundaryById(id: string): Boundary {
  const b = BOUNDARIES.find(x => x.id === id);
  if (!b) throw new Error('layout: unknown boundary ' + id);
  return b;
}

// ─── Box descriptors: shared by the renderer *and* by the verifier ───────────
export interface Box {
  id: string;
  cx: number; cy: number; cz: number;
  w: number; h: number; d: number;
}

export function box(id: string, cx: number, cy: number, cz: number, w: number, h: number, d: number): Box {
  return { id, cx, cy, cz, w, h, d };
}

/**
 * Every solid masonry volume in the building, as axis-aligned boxes.
 *
 * This is the *collision / verification* proxy for the walls: the two side
 * walls of each room are exact boxes, and each arch wall is decomposed into
 * its two piers plus the lintel above the opening. Those boxes are strictly
 * INSIDE the real masonry, so "camera inside a wall-panel box" is a
 * conservative test for "camera inside a wall" — it can never report a false
 * positive from the arch curve.
 */
export function wallPanels(): Box[] {
  const out: Box[] = [];

  // Side walls — one segment per room so the heights follow the ceilings.
  for (const id of ROOM_ORDER) {
    const r = ROOMS_LAYOUT[id];
    const d = Math.abs(r.zNear - r.zFar);
    const cz = roomCentreZ(r);
    const cy = r.floorY + r.height / 2;
    out.push(box(id + '-wall-left',  -WALL_CX, cy, cz, WALL_T, r.height, d));
    out.push(box(id + '-wall-right',  WALL_CX, cy, cz, WALL_T, r.height, d));
  }

  // Cross walls — decomposed into piers + lintel (arch) or one solid slab.
  for (const b of BOUNDARIES) {
    const h = b.topY - b.baseY;
    const cy = (b.topY + b.baseY) / 2;
    if (!b.arch) {
      out.push(box(b.id + '-wall', 0, cy, b.z, b.wallW, h, WALL_T));
      continue;
    }
    const pierW = (b.wallW - b.openW) / 2;          // 5.5 / 7 / 6.25 …
    const pierX = b.openW / 2 + pierW / 2;
    out.push(box(b.id + '-pier-l', -pierX, cy, b.z, pierW, h, WALL_T));
    out.push(box(b.id + '-pier-r',  pierX, cy, b.z, pierW, h, WALL_T));
    const lintelH = b.topY - (b.baseY + b.openH);
    if (lintelH > 1e-6) {
      out.push(box(b.id + '-lintel', 0, b.baseY + b.openH + lintelH / 2, b.z, b.wallW, lintelH, WALL_T));
    }
  }
  return out;
}

export function ceilingBoxes(): Box[] {
  return ROOM_ORDER.map(id => {
    const r = ROOMS_LAYOUT[id];
    return box(id + '-ceiling', 0, r.ceilingY, roomCentreZ(r),
      INTERIOR_W + 2 * WALL_T, 0.4, Math.abs(r.zNear - r.zFar) + WALL_T);
  });
}
// ─── Staircase ───────────────────────────────────────────────────────────────
// Two flights of 15 steps. Flight 1 runs from z = -16; flight 2 ends exactly at
// the upper floor height. Every block is SOLID from y = 0 up to its own tread,
// which is what makes the renderer, the floor raycast and the analytic floor
// model below agree to the millimetre.
export const STAIR = {
  stepsPerFlight: 15,
  totalSteps: 30,
  depth: 0.36,                       // going (tread depth) of one step
  width: 8,                          // flight width  → x ∈ [-4, +4]
  centreX: 0,
  zStart: -16,                       // z of the toe of step 1 (flight 1 starts here)
  landingDepth: 2,
  totalRise: UPPER_FLOOR_Y,          // 5.2 over 30 steps  → rise = 5.2/30
  railHeight: 0.95,
  railThickness: 0.09,
} as const;

export const RISE = STAIR.totalRise / STAIR.totalSteps;          // 0.173333…
const RUN1 = STAIR.stepsPerFlight * STAIR.depth;                 // 5.4
export const FLIGHT1_END_Z = STAIR.zStart - RUN1;                // -21.4
export const LANDING_Z0 = FLIGHT1_END_Z;                         // -21.4
export const LANDING_Z1 = FLIGHT1_END_Z - STAIR.landingDepth;    // -23.4
export const FLIGHT2_END_Z = LANDING_Z1 - RUN1;                  // -28.8
/** Top of the last tread of flight 1 === top of the landing. */
export const FLIGHT1_END_Y = (STAIR.stepsPerFlight * STAIR.totalRise) / STAIR.totalSteps; // 2.6
export const FLIGHT2_END_Y = (STAIR.totalSteps * STAIR.totalRise) / STAIR.totalSteps;     // 5.2 exactly
/** Handrail pitch about X — the rail rises as it travels toward −Z. */
export const RAIL_ANGLE = Math.atan2(FLIGHT1_END_Y, RUN1);       // ≈ 0.4499 rad (25.8°)

/** Top surface (world Y) of step `i` (1-based, 1…30). Exact at i = 30. */
export function stepTopY(i: number): number {
  return (i * STAIR.totalRise) / STAIR.totalSteps;
}

/** Z centre of step `i` (1-based, 1…30). */
export function stepCentreZ(i: number): number {
  if (i <= STAIR.stepsPerFlight) {
    return STAIR.zStart - (i - 0.5) * STAIR.depth;
  }
  const j = i - STAIR.stepsPerFlight;               // 1…15
  return LANDING_Z1 - (j - 0.5) * STAIR.depth;
}

/** Solid stair blocks: y from 0 up to each tread, plus the landing slab. */
export function stairBoxes(): Box[] {
  const out: Box[] = [];
  for (let i = 1; i <= STAIR.totalSteps; i++) {
    const top = stepTopY(i);
    out.push(box('stair-' + i, STAIR.centreX, top / 2, stepCentreZ(i),
      STAIR.width, top, STAIR.depth));
  }
  // Landing slab — centre y = FLIGHT1_END_Y / 2, so its TOP === the last tread.
  out.push(box('stair-landing', STAIR.centreX, FLIGHT1_END_Y / 2,
    (LANDING_Z0 + LANDING_Z1) / 2, STAIR.width, FLIGHT1_END_Y, STAIR.landingDepth));
  return out;
}

/** Handrails: one per side per flight (pitched about X) + one on the landing. */
export interface RailDef { id: string; cx: number; cy: number; cz: number; length: number; rotationX: number }

export function stairRails(): RailDef[] {
  const len = Math.hypot(RUN1, FLIGHT1_END_Y);
  const x = STAIR.width / 2 + 0.06;
  return [
    { id: 'rail-f1-l', cx: -x, cy: FLIGHT1_END_Y / 2 + STAIR.railHeight, cz: (STAIR.zStart + FLIGHT1_END_Z) / 2, length: len,  rotationX: RAIL_ANGLE },
    { id: 'rail-f1-r', cx:  x, cy: FLIGHT1_END_Y / 2 + STAIR.railHeight, cz: (STAIR.zStart + FLIGHT1_END_Z) / 2, length: len,  rotationX: RAIL_ANGLE },
    { id: 'rail-l1-l', cx: -x, cy: FLIGHT1_END_Y + STAIR.railHeight,     cz: (LANDING_Z0 + LANDING_Z1) / 2,        length: STAIR.landingDepth, rotationX: 0 },
    { id: 'rail-l1-r', cx:  x, cy: FLIGHT1_END_Y + STAIR.railHeight,     cz: (LANDING_Z0 + LANDING_Z1) / 2,        length: STAIR.landingDepth, rotationX: 0 },
    { id: 'rail-f2-l', cx: -x, cy: (FLIGHT1_END_Y + FLIGHT2_END_Y) / 2 + STAIR.railHeight, cz: (LANDING_Z1 + FLIGHT2_END_Z) / 2, length: len, rotationX: RAIL_ANGLE },
    { id: 'rail-f2-r', cx:  x, cy: (FLIGHT1_END_Y + FLIGHT2_END_Y) / 2 + STAIR.railHeight, cz: (LANDING_Z1 + FLIGHT2_END_Z) / 2, length: len, rotationX: RAIL_ANGLE },
  ];
}

// ─── Floors ──────────────────────────────────────────────────────────────────
/**
 * The exact set of surfaces the runtime floor raycast may hit.
 *   • ground slab      top = y 0   (vestibule + gallery + stair-hall floor)
 *   • upper platform   top = y 5.2 (stair-hall landing corridor AND upper gallery)
 *   • stair + landing blocks (solid, tops are the treads)
 * The upper platform starts exactly at FLIGHT2_END_Z, so the stair edge meets
 * the upper floor with no gap.
 */
export function floorBoxes(): Box[] {
  const groundZ0 = ROOMS_LAYOUT.vestibule.zNear + WALL_T / 2;   // 30.6
  const groundZ1 = ROOMS_LAYOUT.stairhall.zFar - WALL_T / 2;    // -38.6
  const upperZ0  = ROOMS_LAYOUT.upper.zFar - WALL_T / 2;        // -58.6
  const out: Box[] = [
    box('floor-ground', 0, -0.175, (groundZ0 + groundZ1) / 2,
      INTERIOR_W + 2 * WALL_T, 0.35, groundZ0 - groundZ1),
    box('floor-upper', 0, UPPER_FLOOR_Y / 2, (upperZ0 + FLIGHT2_END_Z) / 2,
      INTERIOR_W + 2 * WALL_T, UPPER_FLOOR_Y, FLIGHT2_END_Z - upperZ0),
  ];
  return out.concat(stairBoxes());
}

/**
 * Analytic floor height — the CPU twin of the runtime downward raycast.
 * Used by scripts/verify-layout.mjs to place the camera at eye height while
 * checking the spline. It is derived from `floorBoxes()`, never hand-typed.
 */
export function floorHeightAt(x: number, z: number): number {
  let best = Number.NEGATIVE_INFINITY;
  for (const b of floorBoxes()) {
    const top = b.cy + b.h / 2;
    if (Math.abs(x - b.cx) <= b.w / 2 && Math.abs(z - b.cz) <= b.d / 2) {
      if (top > best) best = top;
    }
  }
  return best === Number.NEGATIVE_INFINITY ? -Infinity : best;
}
// ─── Artwork mounting ────────────────────────────────────────────────────────
/**
 * A wall face in world space, with the outward normal that points INTO the room
 * the artwork belongs to. Everything an artwork needs — position, yaw, offset
 * direction — is derived from one of these.
 */
export interface WallFace {
  id: string;
  room: RoomId;
  point: [number, number, number];
  /** outward normal pointing into the room */
  normal: [number, number, number];
  /** yaw the artwork plane must adopt to face the room (Math.PI / -Math.PI/2 …) */
  yaw: number;
  floorY: number;
}

/**
 * Yaw is derived from the normal so that R_y(yaw)·(0,0,1) === normal, i.e. a
 * default-facing PlaneGeometry (whose front face looks along +Z) always ends up
 * looking INTO the room. BullSight/TejaLens style "facing away" bugs cannot be
 * expressed here.
 */
export function wallFace(room: RoomId, wall: WallSide): WallFace {
  const r = ROOMS_LAYOUT[room];
  switch (wall) {
    case 'left':  return { id: room + '-left',  room, point: [-HALF_W, r.floorY, roomCentreZ(r)], normal: [ 1, 0, 0], yaw:  Math.PI / 2, floorY: r.floorY };
    case 'right': return { id: room + '-right', room, point: [ HALF_W, r.floorY, roomCentreZ(r)], normal: [-1, 0, 0], yaw: -Math.PI / 2, floorY: r.floorY };
    case 'back':  return { id: room + '-back',  room, point: [0, r.floorY, roomInnerZ(r, 'far')],  normal: [0, 0,  1], yaw:  0,           floorY: r.floorY };
    case 'front': return { id: room + '-front', room, point: [0, r.floorY, roomInnerZ(r, 'near')], normal: [0, 0, -1], yaw:  Math.PI,     floorY: r.floorY };
  }
}

/** World position of an artwork hung on `wall` with its centre at floorY + y, `offset` along the wall. */
export function artworkOnWall(room: RoomId, wall: WallSide, y: number, offset = 0): [number, number, number] {
  const f = wallFace(room, wall);
  // `offset` runs to the viewer's right as they look at the wall.
  const right: [number, number, number] =
    wall === 'left'  ? [0, 0, -1] :
    wall === 'right' ? [0, 0,  1] :
    wall === 'back'  ? [-1, 0, 0] :
                       [ 1, 0, 0];
  return [
    f.point[0] + right[0] * offset,
    f.floorY + y,
    f.point[2] + right[2] * offset,
  ];
}

export interface ArtworkMount {
  id: string;
  room: RoomId;
  wall: WallSide;
  /** centre of the CANVAS plane, in world space */
  surface: [number, number, number];
  /** outward normal — always points into the room */
  normal: [number, number, number];
  yaw: number;
  /** front-face normal of the canvas, declared literally then verified */
  front: [number, number, number];
  /** the group rotation that makes the canvas front face `front` */
  rotation: [number, number, number];
  width: number;
  height: number;
  floorY: number;
}

/** Gap between the wall face and the back of the picture frame (metres). */
export const ARTWORK_CLEARANCE = 0.04;
/** Depth of the frame/backing box behind the canvas plane. */
export const ARTWORK_BACK_DEPTH = 0.16;
/** Distance from the wall face to the artwork group origin. */
export const ARTWORK_GROUP_OFFSET = ARTWORK_CLEARANCE + ARTWORK_BACK_DEPTH;

function mount(
  id: string, room: RoomId, wall: WallSide, y: number, offset: number,
  width: number, height: number, front: [number, number, number],
): ArtworkMount {
  const f = wallFace(room, wall);
  const surface = artworkOnWall(room, wall, y, offset);
  return {
    id, room, wall, surface,
    normal: f.normal,
    yaw: f.yaw,
    front,
    rotation: [0, f.yaw, 0],
    width, height,
    floorY: f.floorY,
  };
}

/**
 * THE ARTWORK MANIFEST — the only place any artwork position may be stated.
 * Every mount is verified to (a) sit on a real wall face, (b) have a front face
 * pointing into its room, (c) be visible from at least one camera position, and
 * (d) have an unobstructed sight-line from the camera position that frames it.
 */
export const ARTWORKS: ArtworkMount[] = [
  // ── Gallery RIGHT wall — 1st project (MeetSync), landscape ───────────────
  // face x=+10, z=−5 → framed from the gallery shot at (−4, 0)
  mount('meetsync-ai', 'gallery',   'right', 3.2, -5.0, 7.0, 4.5, [-1, 0, 0]),
  // ── Gallery LEFT wall — 2nd project (BullSight), portrait ────────────────
  // height 6.3 so the 1280 × 1792 canvas maps 1:1 with no stretch
  mount('bullsight',   'gallery',   'left',  3.5, -4.0, 4.5, 6.3, [ 1, 0, 0]),
  // ── Upper gallery BACK wall — 3rd project (TejaLens) ────────────────────
  // centre y = floorY + 3.0 = 5.2 + 3.0 = 8.2, exactly as PART B.4 requires
  mount('tejalens',    'upper',     'back',  3.0,  0.0, 6.0, 4.2, [ 0, 0, 1]),
  // ── "DURVA" typographic piece — vestibule LEFT wall ─────────────────────
  // Rotated to face into the vestibule, and hung on the wall the camera passes
  // first. Sized so it stays inside the frame on a 390 px portrait viewport.
  mount('name-plate',  'vestibule', 'left',  3.2,  0.0, 4.6, 2.0, [ 1, 0, 0]),
];

export function artworkById(id: string): ArtworkMount {
  const a = ARTWORKS.find(x => x.id === id);
  if (!a) throw new Error('layout: unknown artwork ' + id);
  return a;
}

/** World-space centre of the artwork GROUP (canvas plane pushed off the wall). */
export function artworkGroupCentre(a: ArtworkMount): [number, number, number] {
  return [
    a.surface[0] + a.normal[0] * ARTWORK_GROUP_OFFSET,
    a.surface[1] + a.normal[1] * ARTWORK_GROUP_OFFSET,
    a.surface[2] + a.normal[2] * ARTWORK_GROUP_OFFSET,
  ];
}

/**
 * Axis-aligned bounding box of an artwork's VISIBLE volume — the outer picture
 * frame plus the canvas. The near face is exactly `ARTWORK_CLEARANCE` off the
 * wall; `verify-layout.mjs` proves no such box intersects masonry.
 */
export interface Aabb { min: [number, number, number]; max: [number, number, number] }

export function artworkBounds(a: ArtworkMount): Aabb {
  const halfW = a.width / 2 + 0.14;          // frame outer edge
  const halfH = a.height / 2 + 0.14;
  const t: [number, number, number] = a.normal[0] !== 0 ? [0, 0, 1] : [1, 0, 0];
  const near = ARTWORK_CLEARANCE;            // 0.04 off the wall face
  const far = ARTWORK_GROUP_OFFSET + 0.03;   // 0.23 (canvas plane + a hair)
  const lo: [number, number, number] = [0, 0, 0];
  const hi: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    const s = a.surface[i];
    if (i === 1) { lo[i] = s - halfH; hi[i] = s + halfH; continue; }
    if (t[i] !== 0) { lo[i] = s - halfW; hi[i] = s + halfW; continue; }
    if (a.normal[i] !== 0) {
      const d0 = s + a.normal[i] * near;
      const d1 = s + a.normal[i] * far;
      lo[i] = Math.min(d0, d1); hi[i] = Math.max(d0, d1); continue;
    }
    lo[i] = s; hi[i] = s;
  }
  return { min: lo, max: hi };
}

// ─── UI / label mounting on a wall ───────────────────────────────────────────
/**
 * Placement for a wall-hung panel or an <Html> label.
 * `yaw` is chosen so R_y(yaw)·(0,0,1) === the wall's inward normal, i.e. the
 * panel always reads into its room — the same guarantee the artworks get.
 */
export function wallPoint(room: RoomId, wall: WallSide, y: number, offset = 0): {
  position: [number, number, number]; yaw: number;
} {
  return { position: artworkOnWall(room, wall, y, offset), yaw: wallFace(room, wall).yaw };
}

// ─── Camera spline ───────────────────────────────────────────────────────────
export interface CameraShot {
  t: number;
  /** camera x — the camera Y is NOT authored: it is the floor raycast + EYE_HEIGHT */
  x: number;
  z: number;
  look: [number, number, number];
  /** which floor surface the camera is standing on (documentation + check) */
  standingOn: RoomId | 'stairs';
  /** the artwork this shot exists to frame, if any */
  frames?: string;
}

/**
 * Look-at points for every artwork-framed shot are DERIVED from the artwork
 * mounts — never typed. PART B.4's "TejaLens look-at must be the artwork centre
 * (y = floorY + 3.0), not 8.2+5.2" is therefore true by construction.
 */
const LOOK_NAME = artworkGroupCentre(artworkById('name-plate'));
const LOOK_BULL = artworkGroupCentre(artworkById('bullsight'));
const LOOK_MEET = artworkGroupCentre(artworkById('meetsync-ai'));
const LOOK_TEJA = artworkGroupCentre(artworkById('tejalens'));

/**
 * The scroll-driven camera path. Purely a list of (x, z) + look-at points.
 * The camera's height comes from `floorHeightAt` at runtime, so the path
 * automatically climbs the staircase — there is no authored Y to drift.
 */
export const SHOTS: CameraShot[] = [
  // ── 01 Vestibule — opens ON the "DURVA" name piece, then pans to the arch ─
  { t: 0.00, x:  0.0, z:  29.0, look: LOOK_NAME,              standingOn: 'vestibule', frames: 'name-plate' },
  { t: 0.07, x:  0.2, z:  26.5, look: LOOK_NAME,              standingOn: 'vestibule', frames: 'name-plate' },
  { t: 0.13, x: -0.3, z:  23.5, look: [-7.5, 3.2,  21.0],     standingOn: 'vestibule' },
  { t: 0.20, x: -0.6, z:  18.5, look: [ 0.0, 3.4,  12.0],     standingOn: 'vestibule' },
  // ── through the vestibule ⇄ gallery arch, onto the main axis ─────────────
  { t: 0.27, x:  0.0, z:  11.0, look: [ 0.0, 3.5,  -4.0],     standingOn: 'gallery' },
  // ── 02 About — gallery left wall ─────────────────────────────────────────
  { t: 0.34, x:  0.6, z:   7.0, look: [-3.0, 3.4,  -7.0],     standingOn: 'gallery' },
  // ── 03 Selected Works — BullSight, then MeetSync ─────────────────────────
  { t: 0.42, x: -1.6, z:   4.0, look: LOOK_BULL,              standingOn: 'gallery', frames: 'bullsight' },
  { t: 0.50, x: -4.0, z:   0.0, look: LOOK_MEET,              standingOn: 'gallery', frames: 'meetsync-ai' },
  { t: 0.57, x: -1.0, z:  -6.0, look: [ 0.0, 3.5, -16.0],     standingOn: 'gallery' },
  // ── 04 Skills — targeted at the stair-hall walls ─────────────────────────
  { t: 0.64, x:  0.0, z: -12.0, look: [ 0.0, 3.0, -21.0],     standingOn: 'gallery' },
  { t: 0.70, x:  0.0, z: -16.6, look: [ 0.0, 4.0, -26.0],     standingOn: 'stairs' },
  // ── 05 Experience — climbing ─────────────────────────────────────────────
  { t: 0.76, x:  0.0, z: -22.4, look: [ 0.0, 5.6, -33.0],     standingOn: 'stairs' },
  { t: 0.84, x:  0.0, z: -28.5, look: [ 0.0, 7.2, -40.0],     standingOn: 'upper' },
  // ── 06 Upper gallery — education / certifications, then TejaLens ─────────
  { t: 0.91, x: -2.5, z: -46.0, look: [-10.0, 8.6, -50.0],    standingOn: 'upper' },
  { t: 1.00, x:  0.0, z: -50.0, look: LOOK_TEJA,              standingOn: 'upper', frames: 'tejalens' },
];

function lerp(a: number, b: number, e: number): number { return a + (b - a) * e; }

/**
 * Position + look target of the spline at progress `t`.
 * The camera Y is `floorHeightAt(x, z) + EYE_HEIGHT` — the analytic twin of the
 * runtime downward raycast (PART B.5), so the verifier walks the identical path.
 * Between shots the ground height is damped rather than linearly blended so the
 * camera never dips into a tread.
 */
export function evalSpline(t: number): { pos: [number, number, number]; look: [number, number, number] } {
  const n = SHOTS.length;
  let a = SHOTS[0];
  let b = SHOTS[0];
  if (t <= SHOTS[0].t) { a = b = SHOTS[0]; }
  else if (t >= SHOTS[n - 1].t) { a = b = SHOTS[n - 1]; }
  else {
    for (let i = 0; i < n - 1; i++) {
      if (t >= SHOTS[i].t && t <= SHOTS[i + 1].t) { a = SHOTS[i]; b = SHOTS[i + 1]; break; }
    }
  }
  const span = b.t - a.t;
  const e = span > 0 ? (t - a.t) / span : 0;
  const x = lerp(a.x, b.x, e);
  const z = lerp(a.z, b.z, e);
  const ground = Math.max(floorHeightAt(x, z), floorHeightAt(a.x, a.z));
  return {
    pos: [x, ground + EYE_HEIGHT, z],
    look: [lerp(a.look[0], b.look[0], e), lerp(a.look[1], b.look[1], e), lerp(a.look[2], b.look[2], e)],
  };
}

// ─── UI room zones ───────────────────────────────────────────────────────────
export interface RoomZone { id: string; index: number; label: string; tRange: [number, number] }

export const ROOM_ZONES: RoomZone[] = [
  { id: 'vestibule',  index: 1, label: 'Room 01 — Entrance',       tRange: [0.00, 0.16] },
  { id: 'about',      index: 2, label: 'Room 02 — About',         tRange: [0.16, 0.40] },
  { id: 'works',      index: 3, label: 'Room 03 — Selected Works', tRange: [0.40, 0.57] },
  { id: 'skills',     index: 4, label: 'Room 04 — Skills',         tRange: [0.57, 0.68] },
  { id: 'experience', index: 5, label: 'Room 05 — Experience',     tRange: [0.68, 0.86] },
  { id: 'upper',      index: 6, label: 'Room 06 — Upper Gallery',  tRange: [0.86, 1.00] },
];

export function zoneForProgress(t: number): RoomZone {
  return ROOM_ZONES.find(r => t >= r.tRange[0] && t <= r.tRange[1]) ?? ROOM_ZONES[0];
}
// __APPEND_6__