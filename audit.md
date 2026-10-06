Audit Report — Durva Pawar 3D Portfolio
Phase 1 — Static Checks
1.1 TypeScript (tsc --noEmit)
Exit 0 — no type errors. (Evidence: npm run typecheck output above)

1.2 Build (npm run build)
Exit 0 — build succeeds. One warning:

(!) Some chunks are larger than 500 kB after minification.
vite.config.ts:10:25 — __dirname not supported by native configLoader

Copy
The manualChunks function splits three + @react-three/* into one chunk but framer-motion never gets its own chunk because the motion chunk key is never triggered — framer-motion is only used in ProjectExperience.tsx and SpeechBubble.tsx (orphaned), and the import path doesn't contain the string 'framer-motion' in the module ID in the way Rolldown resolves it. Result: everything lands in three-D3jOQzW2.js at 1,384 kB gzip 417 kB. The motion chunk is never emitted.

1.3 Lint (npm run lint)
1 error, 18 warnings. Breakdown:

#	Severity	Rule	File	Line	In gallery path?
E1	Error	rules-of-hooks — useGLTF called conditionally inside try	src/three/Avatar.tsx	429	No (orphaned)
W1	Warning	set-state-in-effect	src/hooks/useActiveSection.ts	35	No (orphaned)
W2	Warning	set-state-in-effect	src/components/ui/SpeechBubble.tsx	10	No (orphaned)
W3	Warning	set-state-in-effect	src/hooks/useSmoothScroll.ts	16	No (orphaned)
W4	Warning	react-hooks/exhaustive-deps — missing DEPTH, RISE	src/gallery/GalleryArchitecture.tsx	233	YES
W5	Warning	react/purity — Math.random in render	src/three/SkillSphere.tsx	36	No (orphaned)
W6	Warning	no-unused-vars — useRef imported unused	src/gallery/assets/HeroArch.tsx	39	No (preview only)
W7	Warning	set-state-in-effect	src/gallery/ProjectExperience.tsx	16	YES
W8	Warning	no-unused-vars — useState	src/three/Hero3DScene.tsx	1	No (orphaned)
W9	Warning	only-export-components — useSectionHue exported from component file	src/three/Hero3DScene.tsx	12	No (orphaned)
W10	Warning	react/purity — Math.random in render	src/three/Hero3DScene.tsx	105	No (orphaned)
W11–W14	Warning	react/purity — Math.random in render (×4)	src/three/ParticleStarfield.tsx	17–23	No (orphaned)
W15	Warning	no-unused-expressions — ternary expression result discarded	src/gallery/ProjectArtworks.tsx	58	YES
W16	Warning	no-unused-vars — Html imported unused	src/three/Avatar.tsx	3	No (orphaned)
W17	Warning	react/purity — Math.random in render	src/three/Avatar.tsx	59	No (orphaned)
W18	Warning	set-state-in-effect	src/three/Avatar.tsx	76	No (orphaned)
3 lint issues are in the live gallery path (W4, W7, W15). All others are in orphaned files.

1.4 Dead Code / Orphaned Files
The entire src/sections/, src/three/, src/components/, src/hooks/useActiveSection.ts, src/hooks/useSmoothScroll.ts, src/hooks/useTheme.ts, src/hooks/useTypewriter.ts, src/hooks/useKonami.ts, src/utils/sectionScrollProgress.ts, and src/pages/NotFound.tsx are not reachable from main.tsx → App.tsx → GalleryWorld. They are compiled into the bundle anyway because TypeScript include: ["src"] compiles everything, but Rollup/Rolldown tree-shakes them — they do NOT appear in the final bundle (confirmed: only 2 JS chunks emitted, total 51 kB + 1384 kB).

Packages that are dead weight in the gallery path:

Package	Used by	Status
gsap ^3.15.0	src/sections/* only	Orphaned — not in bundle
@types/gsap ^1.20.2	Nothing (gsap ships its own types)	Doubly orphaned
lenis ^1.3.26	src/hooks/useSmoothScroll.ts only	Orphaned
canvas-confetti ^1.9.4	src/sections/* only	Orphaned
react-icons ^5.7.0	src/sections/*, src/components/* only	Orphaned
framer-motion ^13.4.6	ProjectExperience.tsx imports it but uses zero motion.* components — only CSS clip-path transition	Effectively unused in gallery
tsconfig oddities:

"ignoreDeprecations": "6.0" — suppresses TypeScript 6.0 deprecation warnings. Unverified what it's hiding; likely erasableSyntaxOnly interaction.

"noUnusedLocals": false and "noUnusedParameters": false — intentionally disabled, which is why the orphaned code doesn't produce TS errors.

"baseUrl": "." — redundant alongside paths, but harmless.

vite.config.ts warning: __dirname usage triggers a native configLoader warning. Should be import.meta.dirname.

1.5 Build Size
Chunk	Raw	Gzip
three-D3jOQzW2.js	1,384 kB	417 kB
index-DvFv24h8.js	51 kB	13 kB
rolldown-runtime.js	0.7 kB	0.4 kB
index.css	21 kB	4.8 kB
The motion manual chunk is never emitted — framer-motion is bundled into index.js (51 kB). The three chunk at 1.38 MB raw / 417 kB gzip is expected for Three.js + R3F + Drei. No top-10 module breakdown available without rollup-plugin-visualizer (not installed).

Phase 2 — Runtime Checks
UNVERIFIED — No headless browser (Playwright/Puppeteer) is available in this environment. The following are static-analysis inferences, clearly labelled.

2.1 Console errors/warnings (static inference)
404 /og-image.png — index.html references /og-image.png in <meta property="og:image"> and <meta name="twitter:image">. File does not exist in public/. Will 404 on every page load. (Evidence: dir public shows no og-image.png)

/models/durva.glb 404 — src/three/Avatar.tsx calls useGLTF('/models/durva.glb'). public/models/ is empty. However Avatar.tsx is orphaned (not imported by gallery path), so this 404 will not occur in production. (Evidence: dir public\models = 0 files)

RectAreaLightUniformsLib.init() called twice — GalleryLighting.tsx and HeroArch.tsx and ReferenceScene.tsx all call RectAreaLightUniformsLib.init() at module scope. In production only GalleryLighting.tsx is active, so this fires once. In dev with HMR it may fire multiple times. Harmless but wasteful.

cursor: none !important — The <style> tag in GalleryWorld hides the cursor globally. This will hide the cursor inside ProjectExperience overlay too, where the user needs to click links. (Static analysis — unverified at runtime)

2.2 Scroll progress debug hook (UNVERIFIED — no browser available)
Cannot take screenshots. Static analysis of what each shot range shows:

t	Shot	Expected view	Likely issue
0.00	0	Outside arch, looking through	Camera at X=-5.5 — left of centre, arch visible. Probably OK
0.10	lerp 1→2	Pushing through arch	OK
0.20	lerp 2→3	Inside vestibule, hero wall	Hero wall Html at X=-8.5 — camera at X≈-1.5, 7 units away. Readable
0.30	lerp 4→5	About wall	About wall at X=-8.5, camera at X≈-2.3. OK
0.40	lerp 5→6	MeetSync artwork	Artwork at X=-10.4 — inside wall by 0.8 units. Frame may clip through wall
0.50	lerp 6→7	BullSight + Skills	BullSight at X=+10.4 — inside wall by 0.8 units
0.54	Shot 8	Skills wall	Camera at Z=-34, looking at Z=-40 — looking through StairArchBottom arch wall
0.60	Shot 9	Stair hall	Camera at Y=2.5, Z=-40 — floating over void (no floor in stair hall left side)
0.70	lerp 10→11	Rising stair	Camera Y≈5.2, transitioning to upper floor
0.80	lerp 11→12	Upper gallery	OK
0.90	lerp 12→13	TejaLens + education	OK
1.00	Shot 14	Contact	Camera at Z=-66 — same Z as TejaLens artwork — artwork behind camera
2.3 Cursor (static analysis)
GalleryWorld renders <style>{* { cursor: none !important; }}</style> — hides cursor globally including inside ProjectExperience overlay. Users cannot see cursor when clicking GitHub/LinkedIn links.

GalleryCursor (7px dot) is the replacement. It does NOT change appearance when hovering artworks — the "VIEW" ring is an Html element inside the Canvas, not the cursor itself.

The "VIEW" state: ArtworkFrame sets hovered=true on onPointerOver. This works for mouse but not for touch (no touch events on R3F meshes by default without touch-action configuration).

On touch devices: cursor: none is irrelevant (no cursor), but the GalleryCursor div still renders and tracks nothing.

2.4 Artwork interaction (static analysis)
Approach animation: No dedicated approach animation exists. scrollStore.locked = true is set immediately on click, freezing the camera. There is no tween to move the camera closer to the artwork before opening the overlay.

Overlay scroll: ProjectExperience has overflowY: 'auto' on the outer div. However, useScrollInput in GalleryWorld calls e.preventDefault() on wheel events on window — this will block scrolling inside the overlay because the wheel event bubbles to window and is cancelled before the overlay's scroll handler fires.

Escape key: Implemented correctly in ProjectExperience via keydown listener.

Return to gallery: handleReturn sets scrollStore.locked = false after 550ms timeout. Correct.

Re-scroll after return: Should work since locked is cleared. Unverified at runtime.

Phase 3 — Geometry and Camera Audit
All findings below are verified by calculation (see audit_geo.js output above).

3a. StairHall back wall blocking TejaLens
REFUTED. There is no explicit "StairHall back wall at Z=-34." The StairHallWalls component places walls at Z=-44±6 = Z=-38 to -50 (sides only, no back wall). The DividerArch2 at Z=-31.6 has an arch opening. TejaLens is at Z=-66, well past the stair hall. The camera path from shot 11 onward (Z=-52 to -66) has clear line of sight to TejaLens. However, at t=1.0 the camera is at Z=-66 — the same Z as TejaLens — so the artwork is at the camera's near plane and effectively behind it.

3b. Staircase cutting through arch opening
CONFIRMED. The staircase left edge is at X=2.25. The StairArchBottom arch opening is 6.5 wide centred at X=0, so it spans X=-3.25 to +3.25. The staircase left edge (X=2.25) is inside the arch opening, meaning the staircase visually blocks part of the passage. Additionally, the staircase wedge geometry spans world X=2.25 to 14.25, penetrating the right wall (inner face X=9.6) by 4.65 units. The wedge is invisible inside the wall but wastes geometry and may cause shadow artefacts.

3c. Flight 2 / floor Y mismatch
CONFIRMED with nuance. The staircase landing is at Y=4.92 (4.8 + 0.12 cap). The upper gallery floor plane is at Y=4.8. The 0.12 unit gap means the landing sits above the floor plane — a small visible step/gap at the transition. Not a catastrophic pop but visually incorrect.

3d. UpperGallery / StairHall volume overlap
CONFIRMED. StairHallWalls (box center Z=-44, half-depth 6) ends at Z=-50. UpperWalls (box center Z=-60, half-depth 10) starts at Z=-50. They share an exact coplanar face at Z=-50, causing Z-fighting. Similarly, LeftWallGround ends at Z=-38 and StairHallWalls starts at Z=-38 — another coplanar Z-fight.

3e. Z-fighting / coplanar faces
CONFIRMED at 3 locations:

StairHallWalls ↔ UpperWalls at Z=-50 (both side walls)

LeftWallGround ↔ StairHallWalls at Z=-38

All 4 DividerArch meshes (22 units wide) overlap the LeftWallGround and RightWallGround geometry in the wall thickness region (X=-11 to -9.6 and X=9.6 to 11) — the arch wall and the side wall are coplanar in those strips.

3f. Artwork offset from wall faces
CONFIRMED — both ground-floor artworks are inside the wall.

MeetSync at X=-10.4, left wall inner face at X=-9.6 → 0.8 units inside the wall

BullSight at X=+10.4, right wall inner face at X=+9.6 → 0.8 units inside the wall

TejaLens at Z=-66, back wall inner face at Z=-70.0 → 4.0 units in front. Correct.

The correct X for artworks on the left wall should be ≤ -9.6 (e.g. -9.5 to sit flush on the inner face). At X=-10.4 the artwork plane is embedded in the wall geometry — the frame and canvas will be partially or fully occluded by the wall mesh depending on render order.

Additional geometry findings
G1 — No floor in stair hall left side. The ground floor plane ends at Z=-38. The upper floor plane starts at Y=4.8 (not Y=0). The staircase wedge only covers X=2.25 to 8.75. The left side of the stair hall (X=-9.6 to 2.25, Z=-38 to -50) has no floor geometry. Camera shots 9 and 10 traverse this void at Y=2.5–4.2 — the camera is floating over an open hole.

G2 — TejaLens camera overshoot. Shot 14 (t=1.0) places the camera at Z=-66, the same Z as TejaLens. The artwork faces +Z (toward the camera), but at t=1.0 the camera has passed through it and is looking at Z=-72 (past the artwork). The artwork is behind the camera at the final scroll position.

G3 — Contact room heading inside back wall. ContactRoom places the heading Html at Z=-70.2. The back wall inner face is at Z=-70.0. The Html anchor is 0.2 units inside the wall geometry.

G4 — Contact Html too close to camera. At t=1.0 the camera is at Z=-66. The contact plaques are at Z=-67.5 — only 1.5 units from the camera with distanceFactor=10. The HTML will render at enormous scale.

G5 — Shadow camera too small for world. The directional light shadow camera is ±28 orthographic. The world is 86 units long (Z=+16 to -70). The upper gallery (Z=-52 to -70) is ~88 units from the light's Z position (Z=18). The shadow camera far=110 covers the depth, but the orthographic bounds ±28 only cover a 56-unit-wide frustum. The upper gallery and contact room likely receive no shadows from the primary directional light.

Phase 4 — Performance and React Architecture
4.1 Re-renders per second
useMouseNorm — calls setSnap via requestAnimationFrame on every mousemove. At 60fps mouse movement this is ~60 setState calls/second on GalleryWorld. Each re-render re-renders the entire component tree including all room components and the Canvas wrapper. Confirmed by code analysis.

useProgressSnap — has a stale closure bug: the useEffect has no dependency array, so it re-registers the setInterval on every render. The progress variable captured in the interval closure is always the value from the render that registered it. This means the Math.abs(scrollStore.progress - progress) > 0.002 check compares against a stale value and may never update after the first render. The UI progress bar and room name may be frozen at 0. (Evidence: GalleryWorld.tsx lines 68–76)

GalleryCursor — calls setPos on every mousemove event (no RAF throttle). This is a separate setState per mouse event, causing additional re-renders of the cursor div. Combined with useMouseNorm, there are 2 setState calls per mousemove event at the GalleryWorld level.

4.2 setState in useFrame
AboutRoom Counter — setVal is called inside useFrame every frame for 1800ms while the counter is animating. At 60fps this is ~108 setState calls. Each call re-renders the Counter component. There are 3 counters, so **324 setState calls** during the about room animation. (Evidence: AboutRoom.tsx lines 14–22)

ProjectArtworks ArtworkFrame — setNear is guarded by nearRef. Fires at most twice per artwork (enter/exit proximity). Acceptable.

4.3 Renderer info / frame time (UNVERIFIED — no browser)
Static estimates:

Draw calls: Each Html component from Drei creates a separate DOM portal. There are ~25+ Html components across all rooms, all mounted simultaneously. Each is a separate React tree. This is a significant DOM overhead.

Shadow map: 1 shadow-casting directional light with 2048×2048 map. Acceptable.

Geometries: ~40+ meshes in GalleryArchitecture + 3 artworks + room content. Moderate.

Textures: 3 CanvasTextures at 2048×1280 (MeetSync, TejaLens) and 1280×1792 (BullSight). Total ~25 MB uncompressed GPU memory.

4.4 Spotlight targets (N/A)
No spotlights are used. All lights are hemisphereLight, directionalLight, and rectAreaLight. No target pattern issue.

4.5 Memory — inline object allocation in useFrame
CameraController.tsx — evalShots creates new THREE.Vector3(...) on every call (2 per frame for a.pos/b.pos, 2 more for lerp targets = 4 Vector3 allocations per frame = 240/second). The right, up, toTarget, finalLook vectors are also new THREE.Vector3() per frame = 4 more = 480 allocations/second total. This will cause GC pressure. (Evidence: CameraController.tsx lines 9–16, 44–52)

GalleryArchitecture.tsx Staircase — stepGeos creates 20 BoxGeometry objects in useMemo. The useMemo dep array is [] so this is fine — created once. However the lint warning W4 (DEPTH and RISE missing from deps) is technically correct; since they're constants defined inside the component, they never change, so it's safe but sloppy.

Phase 5 — Input, UX, Accessibility, Responsiveness
5.1 Wheel/touch blocking overlay scroll
CONFIRMED. useScrollInput registers wheel with { passive: false } and calls e.preventDefault() on window. When ProjectExperience is open, scrollStore.locked = true so scrollStore.raw is not updated — but e.preventDefault() is still called before the locked check:

const onWheel = (e: WheelEvent) => {
  e.preventDefault();          // ← always called, even when locked
  if (scrollStore.locked) return;
  ...
};

Copy
ts
This means the overlay's overflowY: 'auto' scroll is completely blocked while the overlay is open. Users cannot scroll the project description. (Evidence: GalleryWorld.tsx lines 24–27)

5.2 Touch on 390×844 (UNVERIFIED — no device)
Static analysis:

touchmove calls e.preventDefault() — same overlay scroll blocking issue as above.

100vh on iOS: The canvas uses height: '100vh' via canvasStyle. On iOS Safari, 100vh includes the address bar height, causing the canvas to be taller than the visible viewport on first load. The address bar resize will cause a layout jump.

Touch sensitivity: dy * 2.2 multiplier on touch. Unverified if this feels natural.

5.3 Keyboard navigation
Arrow/W/S keys modify scrollStore.raw directly. This works correctly.

Tab navigation: All interactive elements (artworks, contact links) are inside the R3F Canvas or Html components with pointerEvents: 'none'. Tab cannot reach them. The contact links in ContactRoom have pointerEvents: 'auto' but are inside a 3D Html component — keyboard focus behaviour is unverified.

No visible focus states anywhere.

5.4 Reduced motion / WebGL fallback / loading state
useReducedMotion is not used anywhere in the gallery path. CameraController animates regardless. ProceduralBust animates regardless.

WebGL fallback: GalleryWorld has no <ErrorBoundary> or WebGL detection. If WebGL is unavailable, the Canvas will throw and crash the app with a blank screen.

Loading screen: App.tsx wraps GalleryWorld in <Suspense fallback={<LoadingScreen />}>. However, GalleryWorld itself does not suspend — it renders synchronously. The LoadingScreen will never show because nothing inside GalleryWorld throws a Promise. The <Suspense> in GalleryWorld's Canvas wraps GalleryLighting etc. but those don't suspend either (no useGLTF, no async resources). The loading screen is dead code.

5.5 Content not visible in museum
Data field	Visible in museum?
hero.name	✅ EntranceRoom HeroWall
hero.roles	✅ EntranceRoom rotating role
hero.oneLiner	✅ EntranceRoom
hero.location	✅ EntranceRoom
hero.socials	❌ Not shown anywhere in gallery
about.text	✅ AboutRoom
about.highlights	✅ AboutRoom
about.counters	✅ AboutRoom
skills	✅ SkillsRoom
experience	✅ ExperienceRoom
projects[0..2]	✅ ProjectArtworks + ProjectExperience
education	✅ UpperGalleryRoom
certifications	✅ UpperGalleryRoom
personal.interests	✅ UpperGalleryRoom
contact.email	✅ ContactRoom
contact.linkedin	✅ ContactRoom
contact.github	✅ ContactRoom
projects[*].github	❌ ProjectExperience links to href="#" (hardcoded placeholder)
projects[*].live	❌ Same — href="#"
personal.currently.*	❌ All empty strings in data
personal.deskObjectMessages.*	❌ All empty strings in data
index.html leftovers from old design:

class="dark" on <html> — the gallery uses a light plaster palette; this class has no effect on the gallery but would affect any Tailwind dark-mode classes if orphaned components were ever re-enabled.

theme-color: #0d0709 — dark background from old design, inconsistent with gallery's #EDE8DF palette.

og:image → /og-image.png — file does not exist (404).

og:url → https://durvapawar.dev — placeholder domain.

5.6 Visual quality (static analysis)
Exposure: toneMappingExposure: 1.02 with ACESFilmic. The hemisphere + directional (1.45) + 7 RectAreaLights is a heavy light rig. Likely overexposed in the entrance and ground gallery. Unverified without browser.

Fog: fog args={[BG_COLOR, 55, 120]}. Camera far is 200. Fog starts at 55 units — the stair hall (Z=-38 to -50) is 51–63 units from the entrance camera (Z=+13). The stair hall will be partially fogged even when the camera is in the ground gallery looking toward it.

Html label legibility: distanceFactor={14} on WallLabel at 7–12 units distance renders at ~9–22px effective size. Readable at close range, invisible at distance. No LOD or fade-out.

Artwork readability: 2048×1280 textures on 7×4.5 unit planes. At 8 units distance the texel density is ~256 texels/unit — very sharp. Good.

Phase 6 — Report
One-Paragraph Diagnosis
The three root causes of "something feels wrong" are, in order of impact: (1) The artworks are embedded inside the wall geometry — both MeetSync and BullSight are placed 0.8 units inside their respective walls, so the frames and canvases are partially or fully occluded by the wall mesh, making the core content of the portfolio invisible or glitchy; (2) The scroll-driven camera path has three critical failures — the Skills room shot (t=0.54) places the camera past the divider arch looking through a solid arch wall, the stair hall has no floor on the left side so the camera floats over a void, and the final shot (t=1.0) places the camera at the same Z as TejaLens so the artwork is behind the camera at the end of the experience; (3) The overlay scroll is completely broken — e.preventDefault() is called unconditionally on every wheel event before the locked check, so when a user opens a project detail and tries to scroll the description, the browser scroll is cancelled and the overlay is unscrollable, making the project detail page non-functional.

Findings Table
ID	Severity	Area	Evidence	File:line	Proposed Fix	Effort
G1	P0	Geometry	MeetSync X=-10.4, wall inner face X=-9.6 → 0.8 units inside wall	constants.ts:113	Change pos to [-9.4, 3.2, -20.0] (flush on inner face)	S
G2	P0	Geometry	BullSight X=+10.4, wall inner face X=+9.6 → 0.8 units inside wall	constants.ts:121	Change pos to [9.4, 3.5, -26.0]	S
G3	P0	Camera	Shot 14 (t=1.0) camera at Z=-66 = TejaLens Z → artwork behind camera	constants.ts:88	Move shot 14 to Z=-60, look at Z=-66; add shot 15 at Z=-62 for contact	S
G4	P0	Input	e.preventDefault() called before locked check → overlay unscrollable	GalleryWorld.tsx:25	Move e.preventDefault() inside if (!scrollStore.locked) block	S
G5	P1	Geometry	No floor in stair hall left side (X=-9.6 to 2.25, Z=-38 to -50)	GalleryArchitecture.tsx	Add a floor plane at Y=0 covering the stair hall area	S
G6	P1	Camera	Shot 8 (t=0.54) camera at Z=-34 looking through StairArchBottom (Z=-37.6)	constants.ts:80	Move shot 8 pos to Z=-30, look to Z=-36 (skills wall)	S
G7	P1

