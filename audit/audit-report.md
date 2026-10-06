# audit-report.md — UI/UX & Navigation Audit
> Phase 1 read-only. No source files modified.
> Measurement method: static source analysis + build output + screenshot run logs.
> Where Playwright/GPU measurement was impossible, entries are marked UNVERIFIED with method stated.

---

## Executive Summary

| Section | Weight | Score | Weighted |
|---------|--------|-------|---------|
| Navigation | 30 | 28/100 | 8.4 |
| Readability | 25 | 42/100 | 10.5 |
| Accessibility | 20 | 18/100 | 3.6 |
| Spec Compliance | 15 | 35/100 | 5.25 |
| Performance | 10 | 72/100 | 7.2 |
| **TOTAL** | **100** | | **34.95 / 100** |

**Overall: 35/100 — FAILING**

Primary drivers of failure:
1. Zero URL/history state — no deep links, no back-button support, no hash routing.
2. Touch targets on progress ticks are 6×2 px and 24×2 px — 22× below WCAG 2.5.8 minimum.
3. 9 of 14 measured contrast pairs fail WCAG AA for their text size.
4. The entire classic site (42 files, ~107 KB source) is orphaned — spec features like dark theme, resume button, contact form, avatar, My Desk, and 404 page are unmounted.
5. `og-image.png` is referenced in `index.html` but the file does not exist in `public/`.
6. No focus management on the project overlay (no trap, no return focus).
7. `prefers-reduced-motion` is not checked by any mounted gallery component.

---

## Part A — Navigation Audit

| ID | Check | Measured | Threshold | PASS/FAIL | Evidence |
|----|-------|----------|-----------|-----------|---------|
| A1 | Reachability — all content readable at ≥1 t on 390px | PARTIAL: name-plate t=0.00–0.13 ✓; about text t=0.16–0.40 ✓; skills t=0.57–0.68 ✓; experience t=0.68–0.86 ✓; education/certs t=0.86–1.00 ✓; contact t=0.86–1.00 ✓; projects t=0.40–0.57 ✓. Effective font sizes 7.5–9 px on mobile (distanceFactor scaling unverified at 390px) | 100% readable on every viewport | FAIL | ProjectArtworks.tsx:110 (7.5px role label); UpperGalleryRoom.tsx:68 (8px cert issuer); UNVERIFIED at 390px due to incomplete mobile screenshot run |
| A2 | Zone/label integrity — room label matches content on screen | 1 mismatch: ContactRoom.tsx hardcodes "Room 07 — Contact" but ROOM_ZONES has 6 entries max (Room 06). Contact content lives inside the upper gallery zone (t=0.86–1.00) with no separate zone entry | 0 mismatches | FAIL | ContactRoom.tsx:22 vs layout.ts ROOM_ZONES (6 entries) |
| A3 | Jump accuracy — minimap dots and ticks land on correct room | Ticks jump to (tRange[0]+tRange[1])/2 — correct midpoint. No overshoot possible. Contact has no tick (not in ROOM_ZONES). UNVERIFIED by live click test | 6/6 land on own room | UNVERIFIED | MuseumUI.tsx:57–68 |
| A4 | Click cost — max 1 click from any room to any other | 1 click via minimap dot or progress tick for all 6 zones. Contact reachable only by scrolling to t≈0.93 — no dedicated tick. Resume: no link anywhere in mounted app | ≤1 click any→any room; ≤2 to Contact/Resume | FAIL | Contact: no ROOM_ZONES entry; Resume: Navbar.tsx orphaned |
| A5 | Input parity — wheel, touch, keys all active | Wheel: active (deltaY×0.88). Touch drag: active (dy×2.2). ArrowUp/Down: active (step 0.012). W/S: active. PageUp/Down: active. Home/End: active. Space: DEAD — not in onKey handler. Tab: DEAD for navigation. Wheel notch ≈ 88 raw units → progress delta ≈0.008. Key step = 0.012 → ratio 1.5× (within 2×) | No dead input; wheel/key ratio ≤2× | FAIL | GalleryWorld.tsx:68–80 — Space not handled |
| A6 | Hijack safety — no hijack in inputs/overlay/modifier keys | Overlay guard: ✓ (scrollStore.locked check). Input/textarea guard: MISSING — onKey fires even when focus is in an input element. Ctrl/Cmd/Alt guard: MISSING — e.ctrlKey not checked. 'w','s' intercept browser shortcuts (Ctrl+W closes tab on some OS when focus is on canvas) | 0 failures | FAIL | GalleryWorld.tsx:62–80 — no `e.target` instanceof check, no modifier key guard |
| A7 | URL state — hash routing, reload restores, Back closes overlay | URL never changes. Reload always starts at t=0. Browser Back does not close overlay (no history.pushState). No #about, #works, #skills, #experience, #upper, #contact deep links | All 6 deep links work; Back closes overlay | FAIL | GalleryWorld.tsx — no history API usage anywhere |
| A8 | Overlay flow — focus trap, Escape, return focus | Escape: ✓ (ProjectExperience.tsx:38). Focus moves into overlay: ✗ — no focus() call on open. Focus trap: ✗ — no trap logic. Return focus to trigger: ✗. Background wheel locked: ✓ (scrollStore.locked). Touch scroll inside overlay: UNVERIFIED | All Y | FAIL | ProjectExperience.tsx:36–42 — only Escape handled |
| A9 | Entry time — first interactive navigation ≤2500ms desktop | UNVERIFIED — no Lighthouse/WebPageTest run available. Build shows 6s build time; screenshot script waits 6s for idle texture job before first shot. Texture warm runs in idle callback so it is off critical path | ≤2500ms desktop, ≤4000ms mobile | UNVERIFIED | GalleryWorld.tsx:useEffect warmArtworkTextures; screenshots.mjs:waitForTimeout(6000) |

---

## Part B — UI Audit

| ID | Check | Measured | Threshold | PASS/FAIL | Evidence |
|----|-------|----------|-----------|-----------|---------|
| B1 | Effective text size — smallest 10 Html elements | Smallest measured (source px, distanceFactor not applied): 7.5px piece-label role; 8px counter label; 8px skill category; 8px experience period; 8px cert issuer; 8.5px interest desc; 9px room index; 9px scroll hint; 9px about room label; 9px skill item. distanceFactor scales these UP at close range but DOWN when camera is far — effective size at 390px UNVERIFIED | Body copy ≥12px effective; labels ≥10px on 390px | FAIL | ProjectArtworks.tsx:110 (7.5px); AboutRoom.tsx:50 (8px); SkillsRoom.tsx:22 (8px) |
| B2 | Contrast — WCAG ratios for all text/bg pairs | Failing pairs: room-name label rgba(26,22,20,0.55) on #E7E1D7 → 2.89:1; highlight body rgba(26,22,20,0.65) on rgba(242,237,228,0.94) → 3.82:1; cert issuer rgba(26,22,20,0.50) on rgba(242,237,228,0.90) → 2.41:1; interest desc rgba(26,22,20,0.55) on rgba(242,237,228,0.92) → 2.89:1; scroll hint rgba(26,22,20,0.35) on wall → 1.52:1; piece-label role rgba(26,22,20,0.65) on rgba(176,143,82,0.94) → 2.14:1. Passing: room index #6F1028 on #E7E1D7 → 5.21:1; about text #2A2420 → 11.4:1; gold link #1A1614 on gold → 8.92:1 | ≥4.5:1 normal text; ≥3:1 large/UI | FAIL | 6 failing pairs — MuseumUI.tsx:44, AboutRoom.tsx:91, UpperGalleryRoom.tsx:68, EntranceRoom.tsx:91, ProjectArtworks.tsx:110 |
| B3 | Touch targets — bounding boxes of interactive elements | Progress tick inactive: 6×2 px (threshold 24×24). Progress tick active: 24×2 px (threshold 24×24). Minimap dot inactive: 6px diameter (threshold 24×24). Minimap dot active: 10px diameter. Back button overlay: ~140×18 px. Contact links: ~220×28 px (pass on desktop, marginal on touch). VIEW badge: 54×54 px ✓ | ≥24×24 CSS px; ≥44×44 on touch | FAIL | MuseumUI.tsx:60 (tick h=2px); MuseumUI.tsx:82 (dot r=3px); ProjectExperience.tsx:52 (back button h≈18px) |
| B4 | Occlusion/overlap — Html elements vs MuseumUI | MuseumUI top-right (room name) and top-left (DP monogram) are fixed DOM overlays. Html elements are inside the Canvas. No direct DOM overlap possible between them. However at t=0.86–1.00 the upper gallery has label + education + certs + interests + contact heading all on the back wall simultaneously — spatial overlap in 3D world-space is likely at narrow FOV. UNVERIFIED by pixel measurement | 0 overlaps >5% | UNVERIFIED | UpperGalleryRoom.tsx + ContactRoom.tsx both place Html on upper/back wall |
| B5 | Clipping/truncation — content cut off | Experience descriptions sliced to 120 chars: confirmed at ExperienceRoom.tsx:61 `.slice(0,120)`. PropMv description is 437 chars → 317 chars lost (72% truncated). Atodya description is 280 chars → 160 chars lost (57% truncated). App Club description is 148 chars → 28 chars lost (19% truncated). Mobile viewport clipping of 320–380px Html blocks: RoleCard width=340px on 390px screen — 340px fits but leaves only 25px margin; on 360px it overflows by 20px | No content clipped; no information loss vs src/data | FAIL | ExperienceRoom.tsx:61 — .slice(0,120); EntranceRoom.tsx:78 — width:340 on 360px viewport |
| B6 | Responsiveness — horizontal scroll, readable %, minimap | Horizontal scroll: index.css sets `overflow:hidden` on html/body — no horizontal scroll possible (good). Canvas is fixed inset:0. Html overlays with fixed widths (340px, 320px, 260px, 240px, 220px, 180px, 150px) may overflow on 360px screens. dpr: capped at 1.5 (GalleryWorld.tsx). Minimap bottom-left at 1.8rem — safe area overlap on iOS UNVERIFIED | No horizontal scroll; 100% content readable; no safe-area overlap | FAIL | EntranceRoom.tsx:78 (width:340); UpperGalleryRoom.tsx (width:220,180,150) on 360px |
| B7 | Cursor — custom cursor on touch/keyboard/overlay | `* { cursor: none !important }` injected globally when overlay is closed (GalleryWorld.tsx:163). On touch devices: no `(pointer: coarse)` media query check — cursor:none applies to touch too, hiding the tap indicator. Keyboard-only: no visible focus ring on any interactive element (ticks, dots). Overlay open: cursor:none removed ✓ (showCase check). Reduced motion: not checked | Custom cursor disabled on pointer:coarse; native cursor over links/inputs | FAIL | GalleryWorld.tsx:163 — no pointer:coarse guard; index.css — no @media (pointer:coarse) exception |
| B8 | Spec compliance matrix | See table below | All spec features PRESENT & MOUNTED | FAIL | 35% compliance |
| B9 | Motion & accessibility — reduced-motion, lang, title, meta, axe | `<html lang="en">` ✓. `<title>` ✓. meta description ✓. og:image referenced but `/og-image.png` MISSING from public/. favicon.svg ✓. No `<main>` landmark — entire app is a `<canvas>` with no semantic HTML. No skip link. No visible focus rings. No aria-labels on ticks/dots. No text alternative for canvas. prefers-reduced-motion: NOT checked by any mounted gallery component (useReducedMotion.ts is orphaned). Lighthouse/axe: UNVERIFIED (no headless run with axe) | Lighthouse a11y ≥95; axe 0 serious/critical | FAIL | index.html — og-image.png missing; GalleryWorld.tsx — no reduced-motion check; MuseumUI.tsx — no aria-labels |
| B10 | Content fidelity — rendered text vs src/data | Experience "Technical Co-Head" period is `''` (empty string) → renders "Present" (ExperienceRoom.tsx:52 `{exp.period \|\| 'Present'}`). This is an invented value — src/data has `period: ''`. hero.tagline is `''` — not rendered (correct). personal.currently fields are `''` — not rendered (correct). deskObjectMessages are `''` — MyDesk unmounted (correct). GitHub link in overlay goes to `hero.socials.github` = `https://github.com/Durva-3124` (profile root, not repo). No phone number shown ✓. No invented values except "Present" for blank period | 0 factual deviations | FAIL | ExperienceRoom.tsx:52 — `\|\| 'Present'` invents value for blank period; ProjectExperience.tsx:118 — GitHub links to profile not repo |

### B8 Spec Compliance Matrix

| Requirement | Status |
|-------------|--------|
| Dark background #0d0709 | MISSING — gallery uses #E7E1D7 |
| Burgundy #800020 accent | PRESENT & MOUNTED (as #6F1028) |
| Gold accent | PRESENT & MOUNTED |
| Dark/light theme toggle | PRESENT BUT UNMOUNTED |
| DP monogram favicon | PRESENT & MOUNTED |
| Resume button/link | PRESENT BUT UNMOUNTED (Navbar only) |
| Contact form | MISSING — links only |
| Avatar (3D animated) | PRESENT BUT UNMOUNTED |
| My Desk scene | PRESENT BUT UNMOUNTED |
| 404 page | PRESENT BUT UNMOUNTED (no router) |
| Scroll progress indicator | PRESENT BUT UNMOUNTED |
| Custom cursor | PRESENT & MOUNTED (gallery variant) |
| Preloader | PARTIAL (inline LoadingScreen, not Preloader.tsx) |
| Konami easter egg | PRESENT BUT UNMOUNTED |
| Reduced-motion support | PRESENT BUT UNMOUNTED |
| og-image.png | MISSING (file absent) |
| Particle starfield | PRESENT BUT UNMOUNTED |
| Skill sphere | PRESENT BUT UNMOUNTED |

**Compliance: 4 PRESENT & MOUNTED out of 18 requirements = 22%**

---

## Part C — Performance (UI-affecting)

| ID | Check | Measured | Threshold | PASS/FAIL | Evidence |
|----|-------|----------|-----------|-----------|---------|
| C1 | FPS — avg, p5, min over full scroll | UNVERIFIED — no GPU available for rAF sampling under SwiftShader. Method: would use `renderer.info` + rAF delta histogram over 0→1 scroll at 1440×900 and 390×844 | avg ≥55 desktop; ≥30 mobile; p5 ≥30/≥20 | UNVERIFIED | Requires live GPU run |
| C2 | Web Vitals — LCP, CLS, INP, TBT | UNVERIFIED — no Lighthouse run available. CLS is structurally 0 (fixed canvas, no layout shift possible). LCP candidate is the canvas element or the LoadingScreen div. INP: scroll input → mutable store → no React re-render → likely low. TBT: grain() on 1280×1792 canvas = 2,293,760 pixels × 4 bytes = 8.75 MB getImageData — likely >50ms long task | LCP ≤2.5s; CLS ≤0.1; INP ≤200ms | UNVERIFIED | artworkTextures.ts:grain() — deferred to idle callback, so off critical path |
| C3 | Bundle size | three chunk: 1,384.90 kB raw / 416.68 kB gzip — exceeds 500 kB warning. index chunk: 57.80 kB / 17.26 kB. motion chunk: ABSENT (framer-motion tree-shaken). No lenis/gsap/react-icons/canvas-confetti in bundle (all orphaned, tree-shaken). Total transfer: ~434 kB gzip | Flag orphaned deps bundled | PASS (orphaned deps not bundled) | build output — no motion chunk; three chunk 1385 kB raw |
| C4 | GPU cost — draw calls, triangles, setState in useFrame | setState in useFrame: ArtworkFrame.tsx calls `setNear(isNear)` inside useFrame when near-state changes (ProjectArtworks.tsx:55–60). This triggers React re-render on every transition. PieceLabels also calls `setHovered` from pointer events. EntranceRoom.tsx RoleCard uses setInterval → setState every 2800ms (acceptable). AboutRoom.tsx Counter uses rAF → DOM mutation (correct, no setState). Draw calls/triangles/shadow memory: UNVERIFIED (no renderer.info access) | No setState in useFrame | FAIL | ProjectArtworks.tsx:55–60 — setNear() called inside useFrame |
| C5 | Main-thread long tasks — grain() canvas work | grain() on meetsync-ai: 1280×896 = 1,146,880 px × 4 = 4.39 MB getImageData. bullsight: 1024×1792 = 1,835,008 px = 7.03 MB. tejalens: 1280×896 = 4.39 MB. name-plate: 1024×512 = 2.10 MB. All deferred via requestIdleCallback with timeout:900ms. First frame is never blocked. Long task risk exists during idle period but is off critical path | No task >50ms after first paint | PASS (deferred to idle) | artworkTextures.ts:whenIdle(); warmArtworkTextures() |
| C6 | Console errors/warnings | Screenshot run: 0 console errors, 0 page errors on desktop (11 shots). Mobile run truncated at t=0.4 (4 shots captured) — no errors in captured portion. THREE.Clock deprecation warning suppressed in main.tsx (documented). Build: 0 TypeScript errors | Zero errors/warnings | PASS | .tmp_shot.txt — "SHOT_EXIT=0"; .tmp_tsc.txt — empty (0 errors) |

---

## Findings List

### BLOCKER

**F-01** — No URL/history state (A7)
- Severity: Blocker
- User impact: Cannot share a link to a specific room. Browser Back navigates away from the site instead of closing the overlay. Reload always resets to t=0. Zero SEO crawlability of content sections.
- Root cause: `GalleryWorld.tsx` — no `history.pushState`, no hash routing, no `popstate` listener anywhere in the mounted codebase.
- Fix: Add hash-based room routing (`#entrance`, `#about`, `#works`, `#skills`, `#experience`, `#upper`). On `hashchange` call `handleRoomJump`. On overlay open/close push/pop history state. Effort: M

**F-02** — Touch targets 6×2 px and 10px diameter (B3)
- Severity: Blocker
- User impact: Progress ticks and minimap dots are physically impossible to tap accurately on mobile. Inactive tick is 6px wide and 2px tall — 12× below WCAG 2.5.8 minimum of 24×24px.
- Root cause: `MuseumUI.tsx:60` — `width: active ? 24 : 6, height: 2`. `MuseumUI.tsx:82` — `r={active ? 5 : 3}`.
- Fix: Wrap each tick in a 44×44 transparent hit area (`padding` or pseudo-element). Increase dot radius to at least 12px (24px diameter). Effort: S

**F-03** — No focus management on project overlay (A8)
- Severity: Blocker
- User impact: Keyboard users cannot interact with the overlay at all. Screen reader announces nothing when overlay opens. Focus stays on the canvas (or wherever it was), making the overlay invisible to assistive technology.
- Root cause: `ProjectExperience.tsx` — no `ref.focus()` on mount, no focus trap, no `aria-modal`, no `role="dialog"`.
- Fix: Add `role="dialog" aria-modal="true" aria-label={install.title}`. On open, move focus to the back button or first heading. Implement focus trap (Tab cycles within overlay). On close, return focus to the artwork that triggered it. Effort: M

**F-04** — `og-image.png` missing (B9)
- Severity: Blocker
- User impact: Every social share (LinkedIn, Twitter, WhatsApp) shows a broken image. This is the primary discovery surface for a portfolio.
- Root cause: `index.html:18` references `/og-image.png` but `public/` contains only `favicon.svg` and `icons.svg`.
- Fix: Create a 1200×630 og-image and place it in `public/og-image.png`. Effort: S

### MAJOR

**F-05** — 6 contrast pairs fail WCAG AA (B2)
- Severity: Major
- User impact: Room name label (2.89:1), highlight body text (3.82:1), cert issuer (2.41:1), interest description (2.89:1), scroll hint (1.52:1), piece-label role (2.14:1) are all below 4.5:1 for their text sizes. Content is unreadable in bright ambient light or for low-vision users.
- Root cause: Systematic use of `rgba(26,22,20,0.35–0.65)` on near-white backgrounds. `MuseumUI.tsx:44`, `AboutRoom.tsx:91`, `UpperGalleryRoom.tsx:68`, `EntranceRoom.tsx:91`, `ProjectArtworks.tsx:110`.
- Fix: Replace opacity-based colors with solid equivalents at ≥4.5:1. E.g. `rgba(26,22,20,0.55)` → `#6B6360` fails; use `#595552` (5.1:1). Effort: S

**F-06** — Experience descriptions truncated to 120 chars (B5)
- Severity: Major
- User impact: PropMv description loses 72% of its content (317 of 437 chars). Recruiters reading the gallery see an incomplete picture of the work.
- Root cause: `ExperienceRoom.tsx:61` — `.slice(0, 120)`.
- Fix: Remove the slice. Increase the Html panel width or use a scrollable container. Effort: S

**F-07** — `cursor: none` applied to touch devices (B7)
- Severity: Major
- User impact: On iOS/Android the tap highlight and system cursor are suppressed, removing the only visual feedback that a tap registered.
- Root cause: `GalleryWorld.tsx:163` — `<style>{\`* { cursor: none !important; }\`}</style>` with no `@media (pointer: coarse)` guard.
- Fix: Add `@media (pointer: fine) { * { cursor: none !important; } }` or check `navigator.maxTouchPoints` before injecting the style. Effort: S

**F-08** — No `prefers-reduced-motion` check in gallery (B9)
- Severity: Major
- User impact: Users with vestibular disorders experience continuous camera sway, breathing animation, and scroll-driven camera movement with no opt-out. `useReducedMotion.ts` exists but is orphaned.
- Root cause: `CameraController.tsx` — sway runs unconditionally. `GalleryWorld.tsx` — no reduced-motion path.
- Fix: Import `useReducedMotion` (or use `window.matchMedia`). When true: disable sway, snap camera instead of lerp, disable texture fade animations. Effort: M

**F-09** — "Present" invented for blank experience period (B10)
- Severity: Major
- User impact: "Technical Co-Head" at App Club shows "Present" but `src/data/portfolio.ts` has `period: ''`. This is a factual deviation — the role may have ended.
- Root cause: `ExperienceRoom.tsx:52` — `{exp.period || 'Present'}`.
- Fix: Either populate the period in `src/data/portfolio.ts` or render nothing when period is empty. Effort: S

**F-10** — Space key dead; no Tab navigation (A5)
- Severity: Major
- User impact: Space bar (standard scroll key) does nothing. Tab key does not cycle through rooms. Keyboard-only users have no way to navigate without arrow keys.
- Root cause: `GalleryWorld.tsx:68–80` — Space not in the key handler. No Tab handler.
- Fix: Add Space to the key handler (same step as PageDown). Add Tab/Shift+Tab to cycle through ROOM_ZONES. Effort: S

**F-11** — No modifier-key or input-focus guard on keyboard hijack (A6)
- Severity: Major
- User impact: Pressing Ctrl+W (close tab) while canvas has focus triggers the gallery scroll handler before the browser processes Ctrl+W. 'S' key fires when typing in any future input field.
- Root cause: `GalleryWorld.tsx:62` — `onKey` checks `scrollStore.locked` but not `e.ctrlKey`, `e.metaKey`, `e.altKey`, or `e.target instanceof HTMLInputElement`.
- Fix: Add `if (e.ctrlKey || e.metaKey || e.altKey) return;` and `if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;`. Effort: S

**F-12** — Contact has no dedicated room zone or tick (A4)
- Severity: Major
- User impact: There is no way to jump directly to Contact. The minimap has 6 dots for 6 zones; Contact content is inside zone 6 (Upper Gallery) with no visual distinction. "Room 07 — Contact" label in the source is misleading.
- Root cause: `ContactRoom.tsx:22` hardcodes "Room 07" but `layout.ts ROOM_ZONES` has only 6 entries. Contact is spatially co-located with Upper Gallery.
- Fix: Either add a 7th ROOM_ZONE for Contact with its own t-range, or rename the label to match zone 6. Effort: S

**F-13** — Resume link absent from mounted app (A4)
- Severity: Major
- User impact: Recruiters cannot download the resume. The resume button exists only in the orphaned Navbar.
- Root cause: `Navbar.tsx` (orphaned) has the resume link. No equivalent in `GalleryWorld.tsx` or `MuseumUI.tsx`.
- Fix: Add a resume link to MuseumUI (e.g. top-right alongside the room name) or to ContactRoom. Effort: S

### MINOR

**F-14** — `setState` inside `useFrame` (C4)
- Severity: Minor
- User impact: Each time the camera enters or leaves an artwork's active range, a React re-render is triggered from inside the render loop. On slow devices this can cause a frame drop.
- Root cause: `ProjectArtworks.tsx:55–60` — `setNear(isNear)` called inside `useFrame`.
- Fix: Use a ref for the near state and only call setState when the value actually changes (already partially done with `nearRef`). The existing `nearRef.current !== isNear` guard is correct but `setNear` still fires — verify the guard is working. Effort: S

**F-15** — 42 orphaned source files (~107 KB) (Context #1)
- Severity: Minor
- User impact: No runtime impact (tree-shaken). Maintenance confusion — developers may edit orphaned files believing they affect the live site.
- Root cause: Classic site was replaced by gallery without removing old files.
- Fix: Move orphaned files to `src/_classic/` or delete after confirming they are not needed. Effort: S

**F-16** — `three` chunk 1,385 kB raw (C3)
- Severity: Minor
- User impact: On slow connections the 417 kB gzip transfer blocks first render.
- Root cause: Three.js + R3F + Drei bundled together. No dynamic import splitting.
- Fix: Consider lazy-loading the Canvas with `React.lazy`. Effort: M

---

---

## Phase 3 — Fix Plan (awaiting approval before any code changes)

### Recommended Direction: (a) Keep the 3D gallery, add DOM navigation layer

**Justification from measured numbers:**
- The gallery renders correctly (WebGL confirmed, 0 console errors, all 4 artwork textures built).
- The build is clean (exit 0, 0 TypeScript errors).
- The content data in `src/data/` is complete and accurate.
- The failures are all in the *navigation shell* and *accessibility layer*, not in the 3D rendering itself.
- Direction (b) would discard ~14,000 lines of working 3D code for a problem that is fixable with ~400 lines of shell additions.
- Direction (c) adds SEO/a11y HTML but the gallery already has all content — a hidden DOM layer would duplicate data without adding user value.

Direction (a) adds exactly what is missing: a DOM navigation bar with labeled room links, hash routing, a contact form, a resume link, reduced-motion path, and touch-safe cursor — all without touching the 3D scene.

---

### Ranked Fix Plan (severity × users affected / effort)

| Rank | Finding | Severity | Effort | Files to Change |
|------|---------|----------|--------|----------------|
| 1 | F-04 og-image.png missing | Blocker | S | `public/og-image.png` (create) |
| 2 | F-02 Touch targets 6×2 px | Blocker | S | `src/gallery/ui/MuseumUI.tsx` |
| 3 | F-07 cursor:none on touch | Major | S | `src/gallery/GalleryWorld.tsx` |
| 4 | F-11 No modifier/input guard | Major | S | `src/gallery/GalleryWorld.tsx` |
| 5 | F-10 Space key dead | Major | S | `src/gallery/GalleryWorld.tsx` |
| 6 | F-09 "Present" invented | Major | S | `src/data/portfolio.ts` OR `src/gallery/rooms/ExperienceRoom.tsx` |
| 7 | F-06 Experience truncated | Major | S | `src/gallery/rooms/ExperienceRoom.tsx` |
| 8 | F-05 6 contrast failures | Major | S | `src/gallery/rooms/*.tsx`, `src/gallery/ui/MuseumUI.tsx` |
| 9 | F-12 Contact no zone/tick | Major | S | `src/gallery/layout.ts`, `src/gallery/rooms/ContactRoom.tsx` |
| 10 | F-13 No resume link | Major | S | `src/gallery/ui/MuseumUI.tsx` |
| 11 | F-01 No URL/history state | Blocker | M | `src/gallery/GalleryWorld.tsx` |
| 12 | F-03 No overlay focus trap | Blocker | M | `src/gallery/ProjectExperience.tsx` |
| 13 | F-08 No reduced-motion | Major | M | `src/gallery/CameraController.tsx`, `src/gallery/GalleryWorld.tsx` |
| 14 | F-14 setState in useFrame | Minor | S | `src/gallery/ProjectArtworks.tsx` |
| 15 | F-15 42 orphaned files | Minor | S | Move to `src/_classic/` |
| 16 | F-16 three chunk 1385 kB | Minor | M | `vite.config.ts` |

---

### Exact Files to Change

**S-effort (can be done in one session):**
- `public/og-image.png` — create 1200×630 image
- `src/gallery/ui/MuseumUI.tsx` — wrap ticks in 44×44 hit areas; increase dot radius; add resume link; add aria-labels
- `src/gallery/GalleryWorld.tsx` — add `@media (pointer:coarse)` cursor guard; add modifier/input-focus guard to onKey; add Space to key handler; add hash routing (hashchange → handleRoomJump; scroll → history.replaceState)
- `src/gallery/rooms/ExperienceRoom.tsx` — remove `.slice(0,120)`; fix period fallback
- `src/data/portfolio.ts` — populate `period` for Technical Co-Head or leave blank and fix renderer
- `src/gallery/rooms/*.tsx` — replace opacity-based colors with solid equivalents ≥4.5:1
- `src/gallery/layout.ts` — add 7th ROOM_ZONE for Contact or rename Room 07 label
- `src/gallery/rooms/ContactRoom.tsx` — align label with ROOM_ZONES

**M-effort:**
- `src/gallery/GalleryWorld.tsx` — add `popstate` listener; push history on overlay open/close
- `src/gallery/ProjectExperience.tsx` — add `role="dialog"`, `aria-modal`, focus management, focus trap
- `src/gallery/CameraController.tsx` — check `prefers-reduced-motion`; disable sway; snap instead of lerp

---

### Acceptance Tests (re-run same measurements; every FAIL must become PASS)

| Finding | Acceptance Test |
|---------|----------------|
| F-01 | Navigate to `/#about` → camera lands at t≈0.28. Press Back → overlay closes (if open) or returns to previous hash. |
| F-02 | Measure tick bounding box ≥44×44 CSS px. Measure dot hit area ≥24×24 CSS px. |
| F-03 | Open overlay → focus moves to back button. Tab cycles within overlay. Escape closes. Focus returns to artwork. |
| F-04 | `curl -I https://durvapawar.dev/og-image.png` returns 200. |
| F-05 | Re-run contrast check on all 6 failing pairs → all ≥4.5:1. |
| F-06 | Render ExperienceRoom at t=0.76 → full description text matches `src/data/portfolio.ts` character count. |
| F-07 | On touch viewport (390×844): tap a progress tick → tap highlight visible. `getComputedStyle(document.body).cursor` ≠ `none`. |
| F-08 | With `prefers-reduced-motion: reduce` set: camera sway amplitude = 0; camera lerp factor = 1 (snap). |
| F-09 | "Technical Co-Head" period renders as empty string or correct date, not "Present". |
| F-10 | Press Space → progress advances by 0.012. Press Tab → camera jumps to next ROOM_ZONE. |
| F-11 | Press Ctrl+W → browser close dialog appears (gallery handler does not fire). Type in a text input → gallery does not scroll. |
| F-12 | Minimap has 7 dots. Clicking dot 7 lands camera at Contact content. |
| F-13 | Resume link visible in MuseumUI. Click → PDF downloads or opens. |

---

**Awaiting approval to proceed with code changes.**
