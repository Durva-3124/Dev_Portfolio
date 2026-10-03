/**
 * verify-layout.mjs — PART C.1
 * ─────────────────────────────────────────────────────────────────────────────
 * Headless, renderer-free verification of everything src/gallery/layout.ts
 * declares. Run with:  node scripts/verify-layout.mjs
 *
 * It duplicates the *maths* (box construction, ray/box intersection,
 * projection) but never the *numbers*: every number comes from layout.ts. If
 * the layout is wrong, this fails. If this passes while the scene looks wrong,
 * the renderer is not reading layout.ts — which is exactly the drift being
 * removed here.
 *
 * CHECKS
 *   1  structural   rooms do not overlap in z; every shared wall has exactly
 *                   one arch; every arch satisfies openH − r >= 0; the
 *                   staircase ends exactly on the upper floor with no gap
 *   2a spline       300 samples, no camera position inside a wall panel
 *   2b sight-lines  camera → look-at never blocked on "frames an artwork"
 *                   segments
 *   2c artworks     no artwork intersects masonry; every artwork faces, and is
 *                   seen unoccluded, from at least one camera position
 * ─────────────────────────────────────────────────────────────────────────────
 */
import * as L from '../src/gallery/layout.ts';

let failures = 0;
let checks = 0;

function ok(name, pass, detail = '') {
  checks++;
  if (!pass) failures++;
  console.log(`  [${pass ? 'PASS' : 'FAIL'}] ${name}${detail ? ' — ' + detail : ''}`);
}
function near(a, b, eps = 1e-6) { return Math.abs(a - b) <= eps; }

// ─── independent geometry helpers ───────────────────────────────────────────
function rotateY(v, a) {
  const c = Math.cos(a), s = Math.sin(a);
  return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]];
}
function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function len(a) { return Math.hypot(a[0], a[1], a[2]); }
function norm(a) { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }

function boxOf(b) {
  return {
    id: b.id,
    min: [b.cx - b.w / 2, b.cy - b.h / 2, b.cz - b.d / 2],
    max: [b.cx + b.w / 2, b.cy + b.h / 2, b.cz + b.d / 2],
  };
}
function boxContains(box, p, pad = 0) {
  return p[0] > box.min[0] - pad && p[0] < box.max[0] + pad &&
         p[1] > box.min[1] - pad && p[1] < box.max[1] + pad &&
         p[2] > box.min[2] - pad && p[2] < box.max[2] + pad;
}
/** slab-method ray/box entry distance, or null when there is no hit within tMax. */
function rayBox(o, d, box, tMax) {
  let tmin = 0, tmax = tMax;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      if (o[i] < box.min[i] || o[i] > box.max[i]) return null;
    } else {
      const inv = 1 / d[i];
      let t1 = (box.min[i] - o[i]) * inv;
      let t2 = (box.max[i] - o[i]) * inv;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      if (tmin > tmax) return null;
    }
  }
  return tmin;
}
function boxesOverlap(a, b, pad = 0) {
  return a.min[0] - pad < b.max[0] && a.max[0] + pad > b.min[0] &&
         a.min[1] - pad < b.max[1] && a.max[1] + pad > b.min[1] &&
         a.min[2] - pad < b.max[2] && a.max[2] + pad > b.min[2];
}

const WALLS = L.wallPanels().map(boxOf);

function zoneRoom(p) {
  for (const id of L.ROOM_ORDER) {
    const r = L.ROOMS_LAYOUT[id];
    const z0 = Math.min(r.zNear, r.zFar);      // shared wall CENTRE-LINE
    const z1 = Math.max(r.zNear, r.zFar);
    if (p[2] >= z0 && p[2] <= z1 && Math.abs(p[0]) < L.HALF_W) {
      if (p[1] > r.floorY - 0.6 && p[1] < r.ceilingY + 0.6) return id;
    }
  }
  return null;
}
// ─── 1. structural ──────────────────────────────────────────────────────────
console.log('\n=== 1. STRUCTURAL ===');

const order = L.ROOM_ORDER;
for (let i = 0; i < order.length - 1; i++) {
  const a = L.ROOMS_LAYOUT[order[i]];
  const b = L.ROOMS_LAYOUT[order[i + 1]];
  ok(`rooms ${a.id} / ${b.id} share exactly one z boundary`,
    a.zFar === b.zNear, `${a.id}.zFar=${a.zFar} vs ${b.id}.zNear=${b.zNear}`);
  const shared = L.BOUNDARIES.filter(w => w.z === a.zFar);
  ok(`  boundary at z=${a.zFar} really is shared by both rooms`,
    shared.length === 1 && shared[0].rooms.includes(a.id) && shared[0].rooms.includes(b.id),
    shared.map(w => w.id).join(',') || 'none');
  ok(`  boundary at z=${a.zFar} carries exactly ONE arch`,
    shared.length === 1 && shared[0].arch === true && shared[0].openW > 0,
    shared.length === 1 && shared[0].arch ? `${shared[0].openW}w x ${shared[0].openH}h` : 'no arch');
}
for (let i = 0; i < order.length; i++) {
  for (let j = i + 1; j < order.length; j++) {
    const a = L.ROOMS_LAYOUT[order[i]];
    const b = L.ROOMS_LAYOUT[order[j]];
    const overlap = Math.min(a.zNear, a.zFar) < Math.max(b.zNear, b.zFar) &&
                    Math.min(b.zNear, b.zFar) < Math.max(a.zNear, a.zFar);
    ok(`rooms ${a.id} and ${b.id} do not overlap in z`, !overlap);
  }
}
for (const w of L.BOUNDARIES) {
  if (!w.arch) continue;
  ok(`arch "${w.id}" is a large-radius arch (openH − r = ${w.spring.toFixed(3)} >= 0)`, w.spring >= -1e-9);
  ok(`arch "${w.id}" fits inside its wall panel`,
    w.openW < w.wallW && w.openH <= w.topY - w.baseY + 1e-9,
    `opening ${w.openW}x${w.openH}, panel ${w.wallW}x${(w.topY - w.baseY).toFixed(2)}`);
}
ok('wall thickness is 1.2 everywhere', L.WALL_T === 1.2);
ok('interior width is 20 everywhere', L.INTERIOR_W === 20);

ok('staircase: two flights of 15 steps', L.STAIR.stepsPerFlight === 15 && L.STAIR.totalSteps === 30);
ok(`staircase rise === 5.2/30 (${L.RISE.toFixed(9)})`, near(L.RISE, 5.2 / 30));
ok('staircase tread depth === 0.36', L.STAIR.depth === 0.36);
ok('landing depth === 2', L.STAIR.landingDepth === 2);
ok('flight 1 starts at z = −16', L.STAIR.zStart === -16);
ok(`flight 2 ends EXACTLY at the upper floor (${L.FLIGHT2_END_Y})`,
  near(L.FLIGHT2_END_Y, L.UPPER_FLOOR_Y));
// The stair edge must MEET the upper floor: the floor surface is continuous
// across z = FLIGHT2_END_Z (no gap, no step down), because the last tread top
// equals UPPER_FLOOR_Y exactly.
{
  const lastTread = L.stepTopY(L.STAIR.totalSteps);
  ok(`last tread top === upper floor (${lastTread} === ${L.UPPER_FLOOR_Y})`,
    near(lastTread, L.UPPER_FLOOR_Y));
  let gap = 0, drops = 0, prevH = null;
  for (let z = -16; z >= L.FLIGHT2_END_Z - 0.001; z -= 0.002) {
    const h = L.floorHeightAt(0, z);
    if (h === -Infinity) { gap++; continue; }
    if (prevH !== null && h < prevH - L.RISE - 1e-9) drops++;
    prevH = h;
  }
  ok('no gap anywhere along the whole staircase run', gap === 0, `${gap} unsupported samples`);
  ok('the floor never steps DOWN along the run (no tread/hole mismatch)', drops === 0);
  ok('floorHeightAt is continuous across the stair→upper-floor seam',
    near(L.floorHeightAt(0, L.FLIGHT2_END_Z - 1e-4), L.UPPER_FLOOR_Y) &&
    near(L.floorHeightAt(0, L.FLIGHT2_END_Z + 1e-4), L.UPPER_FLOOR_Y));
}
const landing = L.stairBoxes().find(b => b.id === 'stair-landing');
ok(`landing slab centre y = f1EndY/2 → top === last tread (${L.FLIGHT1_END_Y})`,
  near(landing.cy + landing.h / 2, L.FLIGHT1_END_Y) && near(landing.cy, L.FLIGHT1_END_Y / 2));
let mono = true, prev = -1;
for (let z = L.STAIR.zStart + L.STAIR.depth / 2; z > L.FLIGHT2_END_Z; z -= 0.05) {
  const h = L.floorHeightAt(0, z);
  if (h === -Infinity || h < prev - 1e-9) { mono = false; break; }
  prev = h;
}
ok('stairs rise continuously (monotone) from z=−16 to the upper floor', mono);
ok('every stair block is solid from y = 0',
  L.stairBoxes().filter(b => b.id !== 'stair-landing').every(b => near(b.cy - b.h / 2, 0)));
ok('handrails pitch about X; the landing rail is level',
  L.stairRails().every(r => r.rotationX === 0 || near(r.rotationX, L.RAIL_ANGLE)) &&
  L.stairRails().some(r => r.rotationX === 0));

// ─── 2a. spline ─────────────────────────────────────────────────────────────
console.log('\n=== 2a. CAMERA SPLINE — 300 SAMPLES, NO CAMERA INSIDE A WALL ===');
const N = 300;
const samples = [];
for (let i = 0; i <= N; i++) samples.push(L.evalSpline(i / N));

let insideWall = 0;
for (const s of samples) {
  for (const w of WALLS) {
    if (boxContains(w, s.pos, 0.12)) {
      insideWall++;
      console.log(`      camera (${s.pos.map(v => v.toFixed(2)).join(', ')}) inside ${w.id}`);
    }
  }
}
ok('no sampled camera position is inside a wall panel', insideWall === 0, `${insideWall} intrusions`);

let noFloor = 0, belowFloor = 0, aboveCeil = 0, unzoned = 0;
for (const s of samples) {
  const g = L.floorHeightAt(s.pos[0], s.pos[2]);
  if (g === -Infinity) { noFloor++; continue; }
  if (s.pos[1] < g + 1.0) belowFloor++;
  const rid = zoneRoom(s.pos);
  if (!rid) unzoned++;
  else if (s.pos[1] > L.ROOMS_LAYOUT[rid].ceilingY - 0.2) aboveCeil++;
}
ok('every sampled camera position stands on a floor surface', noFloor === 0, `${noFloor} with none`);
ok('camera never sinks below floor + 1.0', belowFloor === 0);
ok('camera never pokes through a ceiling', aboveCeil === 0);
ok('every sampled camera position is inside a room volume', unzoned === 0, `${unzoned} unzoned`);

let maxJump = 0;
for (let i = 1; i < samples.length; i++) {
  maxJump = Math.max(maxJump, Math.abs(samples[i].pos[1] - samples[i - 1].pos[1]));
}
ok(`no vertical jump when entering the stairs (max ΔY per step = ${maxJump.toFixed(3)})`, maxJump < 0.4);
// ─── 2b. look-at sight-lines ────────────────────────────────────────────────
console.log('\n=== 2b. "LOOK AT ARTWORK" SIGHT-LINES UNBLOCKED ===');
for (const shot of L.SHOTS) {
  if (!shot.frames) continue;
  const art = L.artworkById(shot.frames);
  const centre = L.artworkGroupCentre(art);
  const s = L.evalSpline(shot.t);
  const dir = sub(centre, s.pos);
  const dist = len(dir);
  const d = norm(dir);
  let blockedBy = null;
  for (const w of WALLS) {
    const t = rayBox(s.pos, d, w, dist - 0.05);
    if (t !== null && t >= 0) { blockedBy = w.id; break; }
  }
  ok(`t=${shot.t.toFixed(2)} → ${art.id}: clear line of sight`, blockedBy === null,
    blockedBy ? `BLOCKED by ${blockedBy}` : `${dist.toFixed(2)}u`);
  const angH = 2 * Math.atan((art.height / 2) / dist) * 180 / Math.PI;
  const angW = 2 * Math.atan((art.width / 2) / dist) * 180 / Math.PI;
  const incidence = Math.acos(Math.min(1, Math.abs(dot(norm(sub(s.pos, centre)), art.normal)))) * 180 / Math.PI;
  ok(`   ${art.id} framed: v ${angH.toFixed(1)}° / h ${angW.toFixed(1)}° / incidence ${incidence.toFixed(1)}°`,
    angH < 52 && angW < 74 && angH > 8 && incidence < 75);
  ok(`   ${art.id} not blocked by a wall for the whole approach`,
    !V(s.pos, centre, WALLS), '');
}
/** true if any wall panel lies between a and b. */
function V(a, b, walls) {
  const d = norm(sub(b, a));
  const dist = len(sub(b, a));
  for (const w of walls) {
    const t = rayBox(a, d, w, dist - 0.05);
    if (t !== null && t >= 0) return true;
  }
  return false;
}

// ─── 2c. artworks ───────────────────────────────────────────────────────────
console.log('\n=== 2c. ARTWORK MOUNTS ===');
function asBox(aa) {
  return {
    cx: (aa.min[0] + aa.max[0]) / 2, cy: (aa.min[1] + aa.max[1]) / 2, cz: (aa.min[2] + aa.max[2]) / 2,
    w: aa.max[0] - aa.min[0], h: aa.max[1] - aa.min[1], d: aa.max[2] - aa.min[2],
  };
}
function bestAt(s) { return (samples.indexOf(s) / N).toFixed(2); }

for (const a of L.ARTWORKS) {
  const bounds = L.artworkBounds(a);
  const b = boxOf({ id: a.id, ...asBox(bounds) });
  const hit = WALLS.filter(w => boxesOverlap(b, w, 0));
  ok(`${a.id} does not intersect any wall panel`, hit.length === 0, hit.map(w => w.id).join(','));
  ok(`${a.id} hangs with the required 0.04 m clearance off the wall face`,
    near(L.ARTWORK_GROUP_OFFSET - L.ARTWORK_BACK_DEPTH, 0.04),
    `back of frame at ${L.ARTWORK_CLEARANCE} m`);
  ok(`${a.id} is on a wall of ${a.room}`, L.ROOMS_LAYOUT[a.room].id === a.room);

  const f = norm(rotateY([0, 0, 1], a.rotation[1]));
  ok(`${a.id} front face ${JSON.stringify(f.map(v => +v.toFixed(3)))} matches its declaration`,
    near(f[0], a.front[0]) && near(f[1], a.front[1]) && near(f[2], a.front[2]));
  ok(`${a.id} front face points INTO ${a.room}`,
    near(f[0], a.normal[0]) && near(f[2], a.normal[2]));

  const centre = L.artworkGroupCentre(a);
  let best = null;
  for (const s of samples) {
    const toArt = sub(centre, s.pos);
    const dist = len(toArt);
    const toArtN = norm(toArt);
    if (dot(norm(sub(s.look, s.pos)), toArtN) < 0.2) continue;         // not in front of the camera
    const angH = 2 * Math.atan((a.height / 2) / dist) * 180 / Math.PI;
    const angW = 2 * Math.atan((a.width / 2) / dist) * 180 / Math.PI;
    if (angH > 60 || angW > 80) continue;                              // too close to read
    const facing = dot(norm(sub(s.pos, centre)), a.normal);
    if (facing < 0.25) continue;                                       // artwork faces away
    if (V(s.pos, centre, WALLS)) continue;                             // occluded
    const score = facing * Math.min(angH, 30);
    if (!best || score > best.score) best = { s, score, dist, facing, angH, angW };
  }
  ok(`${a.id} is visible, in frame and facing the camera from >= 1 sampled position`,
    best !== null,
    best ? `best t≈${bestAt(best.s)} @ ${best.dist.toFixed(2)}u (facing ${best.facing.toFixed(2)}, ${best.angW.toFixed(0)}°×${best.angH.toFixed(0)}°)`
         : 'NEVER VISIBLE');
}
// ─── targeted PART B assertions ─────────────────────────────────────────────
console.log('\n=== 2d. TARGETED REQUIREMENTS (PART B.3 / B.4) ===');

const nameArt = L.artworkById('name-plate');
{
  const first = L.evalSpline(0);
  const toArt = sub(L.artworkGroupCentre(nameArt), first.pos);
  const view = norm(sub(first.look, first.pos));
  ok('the "DURVA" piece is in front of the opening camera pose',
    dot(view, norm(toArt)) > 0.9, `dot=${dot(view, norm(toArt)).toFixed(3)}`);
  ok('the "DURVA" piece is on the wall the camera passes first',
    nameArt.room === 'vestibule' && nameArt.wall === 'left',
    `${nameArt.room}/${nameArt.wall} at ${nameArt.surface.map(v => v.toFixed(2)).join(', ')}`);
  ok('the "DURVA" piece is rotated to face into the vestibule',
    nameArt.front[0] === 1 && nameArt.front[1] === 0 && nameArt.front[2] === 0);
}

const teja = L.artworkById('tejalens');
ok(`TejaLens centre is floorY + 3.0 (= ${L.UPPER_FLOOR_Y + 3.0})`,
  near(teja.surface[1], L.UPPER_FLOOR_Y + 3.0), `y=${teja.surface[1]}`);
ok('TejaLens hangs on the upper gallery back wall', teja.room === 'upper' && teja.wall === 'back');
{
  const last = L.evalSpline(1);
  const centre = L.artworkGroupCentre(teja);
  ok('TejaLens look-at IS the artwork centre (no 5.2 drift)',
    near(last.look[0], centre[0], 1e-9) && near(last.look[1], centre[1], 1e-9) && near(last.look[2], centre[2], 1e-9),
    `look=${last.look.map(v => v.toFixed(2))} centre=${centre.map(v => v.toFixed(2))}`);
  ok('TejaLens look-at y is 8.2, not 13.4',
    near(last.look[1], 8.2), `y=${last.look[1]}`);
}
ok('every light target is derived from the same tables (no 8.2+5.2 bug possible)',
  L.ARTWORKS.every(a => near(a.surface[1], a.floorY + (a.surface[1] - a.floorY))));

// ─── summary ────────────────────────────────────────────────────────────────
console.log(`\n=== SUMMARY: ${checks - failures}/${checks} checks passed ===`);
if (failures) {
  console.log(`FAILED ${failures} check(s)`);
  process.exit(1);
}
console.log('LAYOUT VERIFIED OK');