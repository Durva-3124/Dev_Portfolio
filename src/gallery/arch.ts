/**
 * arch.ts — the ONE way an arch wall is built in this project (PART B.1).
 * ─────────────────────────────────────────────────────────────────────────────
 * A single closed CONTOUR — no holes, no bevel, no separate reveal mesh.
 * The silhouette is traced straight through the opening, so the inner reveal
 * (the curved tunnel surface) is part of the extrusion's side geometry, which
 * is what removes the z-fighting / seam artefacts the hole-based version had.
 *
 *   ┌───────────────┐  ← panel top
 *   │   ╭───────╮   │
 *   │   │       │   │  semicircular crown, radius = openW/2
 *   │   │       │   │
 *   └───┤       ├───┘  ← the legs stop at `spring`
 *
 * A tiny epsilon is subtracted from the radius values fed to absarc so that
 * three.js's `ShapeUtils.isClockWise` validation can never reject the contour
 * or emit a degenerate winding warning.
 */
import * as THREE from 'three';
import { WALL_T } from './layout';

const EPS = 1e-6;

/**
 * PART B.1 — exactly the shape specified in the brief.
 * `openH - openW/2 >= 0` is required (verified in scripts/verify-layout.mjs);
 * for a larger opening the brief's rule is to use a large-radius arch.
 */
export function makeArchWall(
  wallW: number, wallH: number, openW: number, openH: number,
): THREE.Shape {
  const hw = openW / 2;
  const r = hw;
  const spring = openH - r;
  const s = new THREE.Shape();
  s.moveTo(-wallW / 2, 0);
  s.lineTo(-hw, 0);
  s.lineTo(-hw, spring);
  s.absarc(0, spring, r - EPS, Math.PI, 0, true);
  s.lineTo(hw, 0);
  s.lineTo(wallW / 2, 0);
  s.lineTo(wallW / 2, wallH);
  s.lineTo(-wallW / 2, wallH);
  s.closePath();
  return s;
}

/** Extruded, centred on Z (so the panel straddles its boundary plane). */
export function makeArchGeo(
  wallW: number, wallH: number, openW: number, openH: number,
  depth: number = WALL_T,
): THREE.ExtrudeGeometry {
  const geo = new THREE.ExtrudeGeometry(makeArchWall(wallW, wallH, openW, openH), {
    depth,
    bevelEnabled: false,
    curveSegments: 48,
    steps: 1,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}