/**
 * constants.ts — a thin adapter over layout.ts.
 * ─────────────────────────────────────────────────────────────────────────────
 * NOT ONE COORDINATE lives here. Every position, size, height, wall face and
 * camera point is defined in `layout.ts` and re-exported below, so one import
 * keeps every consumer honest:
 *
 *     import { MAT, ARTWORKS, ROOM_ZONES, ... } from './constants';
 *
 * The only things that genuinely belong to this file are the material palette,
 * the camera's *rendering* config (fov / damping / exposure) and the mutable
 * input store.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import {
  hero, about, skills, experience,
  projects, education, certifications, contact, personal,
} from '@/data';
import { SHOTS, artworkById, type ArtworkMount } from './layout';

// ─── Re-export the content layer (unchanged; src/data is never edited) ───────
export { hero, about, skills, experience, projects, education, certifications, contact, personal };

// ─── Re-export the SINGLE SOURCE OF TRUTH ────────────────────────────────────
// Rooms, boundaries, arches, walls, floors, stairs, camera spline, artwork
// manifest, floor query, room zones and every helper function.
export * from './layout';

export { makeArchWall, makeArchGeo } from './arch';

// ─── Material palette ────────────────────────────────────────────────────────
// Deliberately less luminous than before so that with exposure 0.9 the plaster
// shows soft gradients and real shadow instead of clipping to white.
export const MAT = {
  plaster:   { color: 0xE4DCD0, roughness: 0.92, metalness: 0.00 },
  stone:     { color: 0xC9BFB0, roughness: 0.74, metalness: 0.00 },
  darkMetal: { color: 0x1A1614, roughness: 0.38, metalness: 0.60 },
  burgundy:  { color: 0x6F1028, roughness: 0.55, metalness: 0.00 },
  gold:      { color: 0xB08F52, roughness: 0.34, metalness: 0.62 },
  carpet:    { color: 0x55101E, roughness: 0.96, metalness: 0.00 },
} as const;

export const BG_COLOR = '#E7E1D7';

// ─── Camera *rendering* config (positions live in layout.ts) ─────────────────
export const CAM = {
  fov:      52,
  near:     0.2,
  far:      200,
  maxYaw:   0.022,
  maxPitch: 0.014,
  /** tone-mapping exposure — reduced from 1.02 so walls are never clipped */
  exposure: 0.9,
} as const;

// ─── Layer used to tag everything the floor raycast may stand on (PART B.5) ──
export const LAYER_FLOOR = 1;

// ─── Mutable input store (PART B.10) ─────────────────────────────────────────
// Read inside useFrame; NEVER drives a React re-render. React state is reserved
// for discrete UI switches (project overlay, room label, cursor).
export interface InputStore {
  /** accumulated wheel/touch pixels */
  raw: number;
  /** 0–1 travel */
  progress: number;
  /** px/frame, used for the UI label fade */
  velocity: number;
  /** true while the project overlay owns the scroll */
  locked: boolean;
  /** pointer, normalised −1…1 */
  mouseX: number;
  mouseY: number;
  /** ?t=0..1 in the URL pins progress for screenshot testing */
  testT: number | null;
}

export const scrollStore: InputStore = {
  raw: 0, progress: 0, velocity: 0, locked: false,
  mouseX: 0, mouseY: 0, testT: null,
};

export const SCROLL_TOTAL = 11000;

/** Pointer is over an artwork → the custom cursor becomes "VIEW". */
export const cursorStore = { view: false };

// ─── Installations: the artwork manifest joined to the project content ───────
// Positions/rotations/sizes come 100% from `ARTWORKS` in layout.ts. Nothing is
// re-stated here — only the *content* is attached.
export interface InstallDef {
  id: string;
  slug: string;
  title: string;
  role: string;
  tags: string[];
  desc: string;
  mount: ArtworkMount;
  /** progress window in which this piece is the subject of the camera */
  activeRange: [number, number];
}

/** Derived from the `frames` flag on the camera shots — never hand-typed. */
export function activeRangeFor(id: string): [number, number] {
  const ts = SHOTS.filter(s => s.frames === id).map(s => s.t);
  if (ts.length === 0) return [0, 0];
  return [Math.max(0, Math.min(...ts) - 0.07), Math.min(1, Math.max(...ts) + 0.07)];
}

const INSTALL_IDS = ['meetsync-ai', 'bullsight', 'tejalens'] as const;

export const INSTALLS: InstallDef[] = INSTALL_IDS.map(id => {
  const mount = artworkById(id);
  const p = projects.find(x => x.slug === id)!;
  return {
    id,
    slug: p.slug,
    title: p.title,
    role: p.role,
    tags: p.tags,
    desc: p.description,
    mount,
    activeRange: activeRangeFor(id),
  };
});
