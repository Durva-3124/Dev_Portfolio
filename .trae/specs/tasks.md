# Durva Pawar 3D Portfolio - Implementation Plan

## Task 1: Project Bootstrap (Vite + React + TypeScript)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Initialize Vite React TypeScript project in cwd
  - Install all core dependencies: tailwindcss, postcss, autoprefixer, @react-three/fiber, @react-three/drei, three, framer-motion, @studio-freight/lenis, react-icons, canvas-confetti, @types/three, @types/react, @types/node
  - Configure vite.config.ts with path alias (@/* -> src/*) and assets optimizations
  - Configure tsconfig.json with strict mode and path resolution
  - Create index.html with SEO meta tags, OG tags, proper title, favicon placeholder
  - Verify npm run dev starts without errors
- **Acceptance Criteria Addressed**: AC-1, AC-15, AC-16
- **Test Requirements**:
  - `rule` TR-1.1: `npm install` completes with exit code 0; evidence: terminal output
  - `rule` TR-1.2: `npm run dev` starts Vite on localhost with no console errors; evidence: server output + browser console
  - `rule` TR-1.3: `npx tsc --noEmit` passes with no TypeScript errors; evidence: terminal output
  - `rule` TR-1.4: index.html contains <title>, SEO meta, OpenGraph tags, and DP monogram favicon link; evidence: browser view source
- **Notes**: Folder structure: src/components, src/sections, src/three, src/data, src/hooks, src/utils, public/models

## Task 2: Theme Configuration (Tailwind + CSS Variables + Data Layer)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - Configure tailwind.config.js with burgundy theme tokens (colors from spec: accent, accent-tint, accent-secondary, background, surface, etc.) and font families (Space Grotesk/Sora for headings, Inter for body)
  - Create src/index.css with :root CSS variables, dark/light theme class switching, glassmorphism utilities, gradient classes, and base imports
  - Setup PostCSS config
  - Create src/data/personal.ts with personal object: accentColor (#800020), accentTint (#c2274f), accentSecondary (#e0b878), tagline (empty safe), avatarQuotes, deskObjectMessages { laptop, mug, plant }, interests [{name:painting, icon, desc}, {name:flute, ...}, {name:sleeping, ...}], currently { building, learning, exploring }
  - Create src/data/portfolio.ts with all sections data: hero roles, about counters, skills grouped, experience timeline, projects, education, certifications, contact info
  - Create src/data/index.ts exporting all data modules
- **Acceptance Criteria Addressed**: AC-2, AC-6, AC-17
- **Test Requirements**:
  - `rule` TR-2.1: Tailwind classes `bg-accent`, `text-accent-tint`, `bg-surface/glass` resolve to correct colors via DevTools; evidence: CSS inspector screenshot
  - `rule` TR-2.2: Light mode toggle (via class `.light` on <html>) switches background to #fbf6f4, text to #1a0d10; evidence: before/after screenshots
  - `rule` TR-2.3: All data objects in personal.ts and portfolio.ts match exact content from spec (skills exact, projects exact, experience exact, education exact, 7 certifications exact); evidence: file diff against spec content
  - `rule` TR-2.4: WCAG AA contrast: text-accent-tint on bg-[#0d0709] passes AA (4.5:1 minimum); evidence: contrast checker result
- **Notes**: Personal.ts fields can be empty; components must handle empty/undefined gracefully

## Task 3: Core Layout Utilities (Navbar, Footer, Custom Cursor, Scroll)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2
- **Description**:
  - Create src/hooks/useSmoothScroll.ts: Lenis integration with scroll event callbacks, scroll progress tracking
  - Create src/hooks/useActiveSection.ts: IntersectionObserver-based active section detection
  - Create src/hooks/useTheme.ts: dark/light theme toggle hook with localStorage persistence, prefers-color-scheme detection
  - Create src/hooks/useReducedMotion.ts: respects prefers-reduced-motion media query
  - Create src/components/layout/Navbar.tsx: Sticky glass navbar, logo "DP", nav links (Hero/About/Skills/Experience/Projects/Contact), Download Resume button linking to /resume.pdf, active-link underline in burgundy, mobile hamburger menu with Framer Motion overlay animation
  - Create src/components/layout/Footer.tsx: "© 2026 Durva Pawar", social icons (GitHub/LinkedIn/Email), BackToTop button (scroll to 0 with smooth scroll)
  - Create src/components/layout/ScrollProgress.tsx: Top-of-page thin progress bar (burgundy gradient)
  - Create src/components/ui/CustomCursor.tsx: Custom cursor div with glow, scales and color shifts on links/buttons, disabled for reduced-motion/touch
  - Create src/components/ui/GlassCard.tsx: Reusable glassmorphism card component with hover glow effect
  - Create src/components/ui/MagneticButton.tsx: Framer Motion magnetic hover effect for primary buttons
  - Create src/App.tsx wrapping sections in Navbar + main + Footer with scroll/nav/cursor providers
- **Acceptance Criteria Addressed**: AC-10, AC-13, AC-17
- **Test Requirements**:
  - `rule` TR-3.1: Navbar remains sticky at top with glass background; clicking each link smoothly scrolls to correct section via anchor IDs; evidence: scroll video
  - `rule` TR-3.2: Mobile hamburger (< 768px) opens overlay with vertical nav; closes on link click or X; evidence: mobile viewport screenshots
  - `rule` TR-3.3: ScrollProgress bar width maps to scroll percentage continuously; evidence: screenshot at ~50% scroll with bar at ~50%
  - `rule` TR-3.4: BackToTop button appears after scrolled, click smooth-scrolls to top; evidence: interaction video clip
  - `rubric` TR-3.5: Custom cursor; scale 1-5; anchors 1=no cursor, 3=cursor but doesn't react to hovers, 5=smooth follow with scale/glow reaction on all <a>/<button>/hoverables; threshold >= 4; evidence: cursor interaction video
- **Notes**: Nav active state uses useActiveSection; Resume download link is a placeholder to /public/resume.pdf

## Task 4: 3D Foundation (Canvas Wrapper, Fallbacks, Performance)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - Create src/three/SceneCanvas.tsx: R3F Canvas wrapper with gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}; DPR capped at Math.min(window.devicePixelRatio, 2); pause rendering when canvas off-screen via IntersectionObserver; children render pattern
  - Create src/three/SceneFallback.tsx: Static CSS gradient fallback (burgundy→gold 135deg) with centered text icon, used when WebGL unavailable or reduced-motion
  - Create src/hooks/useThreePerformance.ts: Detects mobile via userAgent → reduces particle count, disables postprocessing; hooks for visibility state
  - Create src/three/Lights.tsx: Reusable Three.js lights (ambient + directional + point with accentSecondary tint) for all 3D scenes
  - Create src/utils/sectionScrollProgress.ts: Utility returning 0-1 scroll progress normalized to each section bounds, used to drive 3D scene hue shifts and camera motion
  - Create src/three/Preloader3D.tsx: Loading overlay showing avatar silhouette (SVG DP monogram) filling with color progress as R3F resources load (useProgress from drei)
- **Acceptance Criteria Addressed**: AC-20, AC-21, AC-12, AC-17
- **Test Requirements**:
  - `rule` TR-4.1: Canvas does not render when off-screen (pause = true); resumes when in view; evidence: console log toggling
  - `rule` TR-4.2: prefers-reduced-motion active OR WebGL check fails → renders SceneFallback gradient instead of canvas; evidence: DevTools emulation screenshot
  - `rule` TR-4.3: DPR on Retina display capped at 2 (evidenced via renderer.getPixelRatio()); evidence: DevTools console log
  - `rule` TR-4.4: Preloader3D displays progress bar during initial assets load, then fades out; evidence: network slow-throttled video clip
- **Notes**: Wrap all R3F components in Suspense boundaries; drei has useProgress built in

## Task 5: Hero 3D Scene (Node Graph + Particles)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 4
- **Description**:
  - Create src/three/Hero3DScene.tsx: Procedural neural node graph
    - Distorted icosahedron geometry (subdivided + noise displacement) as base shape
    - N spheres (glowing MeshStandardMaterial with emissive accent-tint) sampled on surface
    - Lines (LineGeometry/LineMaterial from drei) connecting nearby spheres (distance threshold)
    - Slow auto-rotation group; mouse parallax via normalized mouse position → group rotation lerp
    - Gentle pulse scale via sin(time) on sphere emissive intensity
  - Create src/three/ParticleStarfield.tsx: 2000/500 (desktop/mobile) particles distributed in sphere volume, accent/accent-secondary colored, subtle drift
  - Create src/three/SectionScrollHueShift.tsx: Hook subscribing to scroll position → shifts material color between accent (#800020) and accentSecondary (#e0b878) as user scrolls between sections via lerp
  - Create src/sections/Hero.tsx: Full height min-h-screen section; left column text (label "Hi there, I'm", name "Durva Pawar", rotating typewriter roles via Framer Motion / useTypewriter effect, tagline, one-liner, 2 MagneticButtons "View Projects" / "Get in Touch", GitHub & LinkedIn icons, location Pune, India); right column 3D canvas with Hero3DScene + ParticleStarfield; on mobile: 3D canvas above text; add Framer Motion scroll-down chevron indicator
- **Acceptance Criteria Addressed**: AC-3, AC-6, AC-10, AC-14
- **Test Requirements**:
  - `rule` TR-5.1: Node graph renders entirely procedural (no glb imports); spheres + lines visible, rotate continuously; evidence: 10s video clip
  - `rule` TR-5.2: Moving mouse within hero section causes parallax tilt of scene; pausing input returns to center smoothly; evidence: mouse interaction clip
  - `rule` TR-5.3: Typewriter cycles through exactly 3 roles "Full-Stack Engineer" → "AI/ML Engineer" → "Backend Developer"; evidence: role transition video
  - `rule` TR-5.4: Scroll-down indicator present; clicking "View Projects" scrolls to projects section; evidence: scroll trigger test
  - `rule` TR-5.5: Hue of node graph materials shifts visibly between burgundy and gold as user scrolls the page; evidence: scroll video showing color change
- **Notes**: Node graph performance: cap spheres at ~60-80 desktop, ~30 mobile; lines with only adjacent connections (O(n^2) dangerous)

## Task 6: 3D Avatar System (Fallback, Poses, Interactions)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 5
- **Description**:
  - Create src/three/Avatar.tsx:
    - Attempts useGLTF('/models/durva.glb') with ErrorBoundary
    - On fail → renders ProceduralAvatar (low-poly): rounded head sphere, hair shape (flattened torus), simple body (cylinder/rounded box for hoodie), optional glasses (thin torus rings)
    - Idle animations: breathing scale sin wave, blink material opacity flicker on sphere eyes every 3-4s, head sway small rotation
    - Load animation: right arm (child group) rotates up/down wave gesture for 2s on mount
    - Head+eye follow: useThree pointer → lerp head bone rotation clamped [-0.4, 0.4] rad x/y; touch tracks last tap
    - Click: add jump impulse + 180 spin, trigger speech bubble with random quote from personal.avatarQuotes
  - Create src/components/ui/SpeechBubble.tsx: Glassmorphism bubble positioned near avatar, typewriter text reveal, Framer Motion enter/exit, auto-dismiss after 4s
  - Create src/three/FloatingWidget.tsx: Fixed bottom-right 200x200px corner canvas container with collapsible minimize button; renders avatar at smaller scale; changes pose based on active section (About→wave, Skills→add floating laptop mesh with screen texture, Experience→badge mesh attachment, Projects→pointing arrow, Contact→thumbs up pose + speech bubble "Let's talk!")
  - Pose implementations: if GLB morph targets/animations unavailable, use procedural group rotations + attach floating prop meshes via <Html> overlays or small 3D primitive props
- **Acceptance Criteria Addressed**: AC-4, AC-12, AC-2
- **Test Requirements**:
  - `rule` TR-6.1: With /public/models/durva.glb absent, page still renders ProceduralAvatar correctly (no white screen/error); evidence: screenshot with console clean
  - `rule` TR-6.2: Moving cursor → avatar head visibly tracks (smooth lerp, clamped); on touch device last tap position tracked; evidence: cursor-follow video
  - `rule` TR-6.3: Click avatar → jump + spin + speech bubble with random quote from personal.avatarQuotes appears; dismisses after 4s; evidence: click interaction video
  - `rule` TR-6.4: FloatingWidget visible in bottom-right after hero scroll; minimize button collapses it; avatar visibly changes pose/props as active section changes; evidence: section scroll through all poses
  - `rule` TR-6.5: reduced-motion → avatar frozen in neutral pose, no dance animations trigger; evidence: reduced-motion mode screenshot
- **Notes**: Speech bubble on FloatingWidget Contact pose: use fixed phrase "Let's talk!" regardless of quotes array

## Task 7: About & Skills Sections
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 6
- **Description**:
  - Create src/sections/About.tsx:
    - Heading "A little about me" with gradient accent underline
    - About text paragraph with exact content from prompt
    - 3 GlassCards in grid (md:cols-3) titled "Backend & Systems", "AI & Computer Vision", "Web & Mobile" with exact descriptions
    - AnimatedCounter x3: CGPA 9.47, "35,000+" images trained, "2" internships. Counter animates from 0 to target with Framer Motion while in view
    - "Currently" widget: 3-card mini-grid (Building / Learning / Exploring) fed from personal.currently; widget section hidden entirely if all 3 fields empty strings
  - Create src/three/SkillSphere.tsx:
    - Interactive 3D sphere of skill labels using drei <Html> with text (or SpriteText fallback) placed on Fibonacci sphere surface
    - Auto-rotate when idle; drei <OrbitControls enableZoom={false} enablePan={false} enableRotate drag to rotate manually
    - Colors: labels in accent-tint, sphere wireframe dashed lines in accent with low opacity
    - Mobile: reduced label count, auto-rotate only, no drag
  - Create src/sections/Skills.tsx:
    - Heading "What I work with"
    - SkillSphere embedded with canvas height 420px, lazy load
    - Below sphere: grouped categorized skill list exactly 8 categories from spec (Languages, Frontend & Mobile, Backend & Frameworks, Databases & ORM, Real-Time & Async, AI/ML & Vision, Security & Ops, Core CS); each category a GlassCard with chip-style badges for each skill
- **Acceptance Criteria Addressed**: AC-6, AC-7
- **Test Requirements**:
  - `rule` TR-7.1: All 3 About highlight cards contain exact prompt text; counters animate on scroll into view to correct values; evidence: screenshot + counter animation clip
  - `rule` TR-7.2: "Currently" widget absent when personal.currently all empty strings; present (with filled fields shown) when at least one non-empty; evidence: toggle fields in personal.ts + screenshots both states
  - `rule` TR-7.3: SkillSphere renders on Fibonacci distribution with all skill labels auto-rotating; user can drag to rotate; evidence: interaction video
  - `rule` TR-7.4: Categorized skill list renders exactly 8 categories with exact skill names per spec (order preserved); no extra skills added; evidence: list screenshot matched against spec
- **Notes**: SkillSphere chip count: ~40 text labels total. Animate in stagger fade when list scrolls into view

## Task 8: Experience Timeline + My Desk 3D Scene
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 7
- **Description**:
  - Create src/components/ui/Timeline.tsx: Vertical timeline component (relative container, left/right alternating entries with connecting vertical line + dot); Framer Motion reveal stagger (each entry slides in from opposite direction + fade when in view)
  - Create src/sections/Experience.tsx:
    - Heading "Where I've been building"
    - Timeline with 3 exact entries:
      1. Web Developer Intern, PropMv (July 2026 – Present): exact description
      2. AI/ML Intern, Atodya (July 2026 – Present): exact description
      3. Technical Co-Head, App Club, PESMCOE: exact description
  - Create src/three/MyDeskScene.tsx:
    - Procedural desk geometry: wooden desk box, laptop (keyboard plane + screen plane with scrolling <Html> iframe-text of code), glowing lamp (cone + pointLight warm), coffee mug (cylinder) with steam (small particle emitter of translucent upward sprites), plant (pot cylinder + leaf spheres/icosahedra)
    - 3 clickable groups: onClick → trigger callback to show popup with corresponding message from personal.deskObjectMessages (laptop/mug/plant keys)
  - Create src/components/ui/DeskObjectPopup.tsx: GlassCard popup anchored near clicked object, Framer Motion scale enter, close on X / outside click, shows object name + message if message non-empty
  - Create src/sections/MyDesk.tsx: Heading, intro line, 3D canvas containing MyDeskScene with DeskObjectPopup state
- **Acceptance Criteria Addressed**: AC-6, AC-5, AC-9
- **Test Requirements**:
  - `rule` TR-8.1: Experience renders all 3 entries with exact role/company/dates/description text; timeline layout alternating; entries stagger animate in; evidence: screenshot + scroll video
  - `rule` TR-8.2: MyDesk renders 4 objects (laptop, mug, plant, lamp) fully procedural; mug shows upward particles; laptop screen shows scrolling text; evidence: desk scene screenshot
  - `rule` TR-8.3: Clicking laptop → popup shows personal.deskObjectMessages.laptop (or "Laptop" if empty). Same for mug/plant; clicking outside or X closes popup; evidence: video of 3 popups
  - `rule` TR-8.4: mobile < 768px: timeline entries stack centered, single column; evidence: mobile view screenshot
- **Notes**: Steam particle count capped low (20-30)

## Task 9: Projects (3D Tilt Cards + Modal) & Education
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 8
- **Description**:
  - Create src/components/ui/TiltCard.tsx: Project wrapper with Framer Motion perspective rotateX/Y based on normalized mouse position (vanilla-tilt style); glare overlay (radial gradient) tracking mouse position, opacity 0→0.25 on hover
  - Create src/components/ui/ProjectModal.tsx: Full modal overlay, Framer Motion fade/scale in, shows full project description, tech tags, GitHub/Live placeholder buttons, close on escape/X/outside
  - Create src/sections/Projects.tsx:
    - Heading "Things I've made"
    - 3 TiltCard components (grid md:cols-2 lg:cols-3) with exact project content:
      1. meetsync-AI (Full-Stack Developer): exact description + tech tags (Node.js, Express, TypeScript, MongoDB, Redis, BullMQ, Python, Circuit Breaker, Zod, Docx/PDF)
      2. BullSight (Backend Developer): exact description + tech tags (Spring Boot 3, Java 21, PostgreSQL, WebSocket, Finnhub, OkHttp, Spring Security)
      3. TejaLens (AI/ML, Atodya): exact description + tech tags (U-Net, EfficientNet-B0, Swin Transformer, PyTorch, 35,000+ Images)
    - Each card: header with role chip, description snippet, tech tag row, "Details" button (opens ProjectModal), GitHub icon button (placeholder #), Live icon button (placeholder #)
  - Create src/sections/Education.tsx: GlassCard grid of 3 entries with institution + score badges, exact content (B.Tech AI&ML CGPA 9.47 with Advanced Web Dev Honors, HSC 76.17%, SSC 91.40%)
- **Acceptance Criteria Addressed**: AC-6, AC-8
- **Test Requirements**:
  - `rule` TR-9.1: 3 Project cards render with exact title, role, description, tech tags; 3D tilt rotates card with perspective + glare follows mouse; evidence: hover interaction video
  - `rule` TR-9.2: Clicking "Details" on any card → ProjectModal opens with full project description; Escape key or click outside or X closes modal; evidence: modal open/close video
  - `rule` TR-9.3: GitHub and Live icon buttons present on every card as visual placeholders (no-op or href="#"); evidence: card close-up screenshot
  - `rule` TR-9.4: Education section shows all 3 entries with exact scores; Honors badge displayed on B.Tech; evidence: section screenshot
- **Notes**: TiltCard: clamp rotateX/Y to ±12deg; perspective 1000px

## Task 10: Certifications, Beyond the Code, Contact Sections
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 9
- **Description**:
  - Create src/sections/Certifications.tsx:
    - Heading "Certifications & Workshops"
    - Compact badge grid: 7 certifications as glass-badge chips with gradient icon, name, issuer
      List (exact): AI Fundamentals (IBM), Data Analytics Job Simulation (Deloitte), AI for Beginners (HP LIFE), Python Training (IIT Bombay), C Training (IIT Bombay), Foundation C Beginner Skill Assessment (TechGig), Hands-on Git & GitHub Workshop (IEEE Student Branch, PESMCOE)
  - Create src/sections/BeyondCode.tsx:
    - Heading "Beyond the code"
    - 3 GlassCards fed from personal.interests [{painting}, {flute}, {sleeping}] — each card with icon, interest name, short description (fallbacks if description missing)
    - Section hidden if personal.interests empty
  - Create src/sections/Contact.tsx:
    - Heading "Say hi" (above heading: "Let's build something together.")
    - Contact form: fields name (required, min 2), email (required, email regex), message (required, min 10). All validation client-side with visible error messages
    - Form submit → opens mailto:pawardurva273@gmail.com?subject=Portfolio%20Contact%20from%20{name}&body={message} (URL-encoded) in new tab
    - Contact info sidebar: Email link to pawardurva273@gmail.com, LinkedIn link to linkedin.com/in/durva-pawar-04640b34a, GitHub link to github.com/Durva-3124. No phone number displayed
- **Acceptance Criteria Addressed**: AC-6, AC-11
- **Test Requirements**:
  - `rule` TR-10.1: Certifications grid renders exactly 7 badges with exact names + issuers; visual style consistent; evidence: screenshot
  - `rule` TR-10.2: Beyond the code renders 3 cards from personal.interests array; if array emptied in personal.ts → entire section hidden; evidence: toggle test screenshots
  - `rule` TR-10.3: Submit empty contact form → error messages under each field appear (no submit); Submit invalid email → email field error only; evidence: validation state screenshots
  - `rule` TR-10.4: Valid form submit triggers mailto window/tab with correct To: pawardurva273@gmail.com, subject contains name, body contains message text; evidence: browser popup + network log
  - `rule` TR-10.5: 3 social links (email/LinkedIn/GitHub) point to exact URLs from spec; no phone element exists in DOM; evidence: DevTools elements panel search for "tel:" + phone pattern
- **Notes**: Form validation: use HTML5 + custom JS state; all errors show inline below field in accent-tint text

## Task 11: Polish (Preloader, Section Animations, Konami, 404, Light Mode)
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 10
- **Description**:
  - Create src/components/ui/Preloader.tsx: Animated preloader that runs before site content (overlay). Shows DP monogram SVG silhouette fills with burgundy→gold gradient as progress (0→100) from useProgress; completes and fades out after progress 100 + minimum 800ms duration to avoid flash; stored in sessionStorage so it doesn't re-run on route changes SPA-style
  - Create src/components/ui/SectionReveal.tsx: HOC wrapping each section; applies Framer Motion stagger fade-up (opacity 0→1, y=40→0) to all children with staggerChildren 0.08
  - Create src/hooks/useKonami.ts: Hook listening for konami code ↑↑↓↓←→←→BA or key "D" → fires onKonami callback; blocked in reduced-motion
  - Create src/hooks/useConfetti.ts: canvas-confetti wrapper with burgundy + gold confetti burst; call on Konami trigger
  - Create src/pages/NotFound.tsx: Custom 404 with avatar shrugging pose, "Oops, this page wandered off." message, "Go Home" button to /; route via simple 404 mechanism (create 404.html Netlify/Vercel style + internal fallback)
  - Implement dark/light theme toggle button in Navbar: sun/moon icons, toggles .light class on <html>, persists in localStorage, respects prefers-color-scheme initial
  - Create src/main.tsx entry: wrap <App /> with all providers (SmoothScroll, Theme, CustomCursor, Preloader, Konami)
  - Run all sections through SectionReveal wrapper for staggered entrance
- **Acceptance Criteria Addressed**: AC-12, AC-2, AC-16
- **Test Requirements**:
  - `rule` TR-11.1: First page load shows Preloader with DP silhouette animating, then fades to site; refresh → sessionStorage skips preloader (immediate); evidence: first-load video + refresh test
  - `rule` TR-11.2: Scrolling through page, each section's elements stagger fade-up as they enter viewport (not all at once); evidence: page scroll video
  - `rule` TR-11.3: Type ↑↑↓↓←→←→BA OR press "D" key → confetti burst fires + avatar dance jump/spin triggers in FloatingWidget; reduced-motion → neither triggers; evidence: keyboard interaction video
  - `rule` TR-11.4: Visiting non-existent-route.html → shows NotFound 404 with shrugging avatar + home button; Home button returns to hero; evidence: 404 screenshots
  - `rule` TR-11.5: Light mode toggle in navbar switches color scheme (all variables swap correctly); persists after refresh; system preference matched initially; evidence: theme toggle video
- **Notes**: Avatar dance = existing jump+spin from click, just programmatic trigger

## Task 12: Production Build Verification, README, Final QA
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 11
- **Description**:
  - Run `npm run build` and fix any TypeScript/build errors
  - Create or update root README.md with:
    - Project description
    - Tech stack list
    - Setup instructions (Node 18+, npm install, npm run dev, npm run build, npm run preview)
    - Customization guide: editing src/data/personal.ts and src/data/portfolio.ts, adding durva.glb to public/models, adding resume.pdf to public, replacing GitHub/Live placeholder links
    - Deploy instructions for Vercel (import repo, build command `npm run build`, output `dist`) and Netlify (build cmd `npm run build`, publish `dist`, _redirects for SPA)
    - Browser support and performance notes
  - Create public/_redirects file for Netlify SPA fallback: `/* /index.html 200`
  - Create vercel.json with SPA rewrites
  - Create 404.html in dist via build copy or vite plugin (for SPA fallbacks on static hosts)
  - Manual QA checklist: verify every section renders at 360/768/1024/1920 widths; no horizontal overflow; all buttons work; all AC evidence compiled
  - Run Lighthouse in Chrome DevTools for Performance/Accessibility/SEO scores; fix any critical PWA/SEO/accessibility items below thresholds
- **Acceptance Criteria Addressed**: AC-14, AC-15, AC-16, AC-1
- **Test Requirements**:
  - `rule` TR-12.1: `npm run build` exits code 0, no TS errors, no warnings promoted. `npx tsc --noEmit` returns clean; dist/ directory created; evidence: build log
  - `rule` TR-12.2: README.md contains: setup instructions, data customization guide, Vercel + Netlify deploy instructions; evidence: README file screenshot
  - `rule` TR-12.3: public/_redirects (Netlify) and vercel.json present with SPA fallback rewrite; evidence: both files read
  - `rubric` TR-12.4: Responsive design; scale 1-5; anchors 1=breakage at 360 or 4K, 3=works 768-1920 but issues at extremes, 5=all breakpoints 360px through 3840px render with zero horizontal overflow and correct layouts; threshold >= 4; evidence: screenshots at 360/768/1024/1920/3840
  - `rubric` TR-12.5: Lighthouse audit; scale 1-5; anchors 1=<70 all scores, 3=passes SEO only, 5=Performance >= 90, Accessibility >= 95, SEO = 100; threshold >= 4; evidence: Lighthouse report screenshot
- **Notes**: If performance < 90 investigate: bundle splitting on 3D libraries, lazy load all sections via React.lazy + Suspense, compress assets, reduce polygon counts
