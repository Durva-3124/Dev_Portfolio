# Durva Pawar 3D Portfolio - Product Requirements Document

## Overview
- **Summary**: Build a production-quality, highly professional 3D portfolio website for Durva Pawar, a Full-Stack & AI/ML Engineer. The site features interactive 3D visuals, a personal avatar character, and a burgundy-gold theme.
- **Purpose**: Showcase Durva's skills, experience, projects, and personality in a premium, award-style developer portfolio that stands out from templates.
- **Target Users**: Recruiters, hiring managers, colleagues, and anyone interested in Durva's professional work.

## Goals
- Deliver a visually stunning, premium-feeling portfolio that demonstrates technical excellence
- Integrate interactive 3D visuals as a core feature (not decoration)
- Create a personal connection through a 3D avatar host with personality
- Ensure production quality: responsiveness, accessibility, SEO, and performance
- Provide an easy-to-edit content architecture via data files

## Non-Goals
- Backend integration (contact form uses mailto/EmailJS only)
- CMS or admin panel (content edited via data files)
- E-commerce, blog, or user accounts
- External 3D model files dependency (procedural fallbacks required)

## Background & Context
- Three markdown prompt files define the requirements:
  - 01_main_website_prompt.md: Core website structure, tech stack, sections, 3D features
  - 02_personal_character_layer_prompt.md: 3D avatar, desk scene, voice/copy, personal touches
  - 03_burgundy_theme_prompt.md: Complete burgundy-gold color system and theme tokens
- Project starts from scratch (empty repo)
- Deploy target: Vercel/Netlify

## Functional Requirements

### Tech Stack & Project Structure
- **FR-1**: React 18 + Vite + TypeScript project with proper folder structure
- **FR-2**: Tailwind CSS configured with burgundy theme tokens (CSS variables)
- **FR-3**: Three.js integration via @react-three/fiber and @react-three/drei
- **FR-4**: Framer Motion for UI animations and scroll reveals
- **FR-5**: Lenis (or equivalent) for smooth scrolling
- **FR-6**: Componentized architecture: /components, /sections, /three, /data
- **FR-7**: All portfolio content centralized in data.ts files for easy editing

### Theme & Visual Design
- **FR-8**: Dark theme default (#0d0709 bg) with light-mode toggle
- **FR-9**: Burgundy (#800020) primary, champagne gold (#e0b878) secondary, burgundy tint (#c2274f) for readable text/links
- **FR-10**: Glassmorphism cards with translucent borders and burgundy hover glow
- **FR-11**: Space Grotesk/Sora for headings, Inter for body text
- **FR-12**: Subtle grain/noise overlay, custom cursor with glow reaction
- **FR-13**: WCAG AA compliant contrast for all text/background pairs
- **FR-14**: Light mode colors: #fbf6f4 bg, #1a0d10 text

### 3D Visuals
- **FR-15**: Hero 3D scene: procedurally built floating distorted icosahedron/neural-network node graph with slow rotation, mouse parallax, pulsing
- **FR-16**: Particle starfield in hero background
- **FR-17**: Scroll-driven 3D scene transitions (camera shifts, hue shifts between burgundy/gold per section)
- **FR-18**: Interactive 3D rotating skill sphere/cloud with draggable auto-rotating labels
- **FR-19**: 3D tilt effect on project cards with perspective and light-reflection glare
- **FR-20**: 3D performance optimizations: lazy-load canvas, DPR capped at 2, reduced particles on mobile, pause when off-screen
- **FR-21**: Static gradient fallback for WebGL unavailable / prefers-reduced-motion

### 3D Avatar (Personal Character Layer)
- **FR-22**: Load durva.glb with useGLTF; procedural low-poly fallback if missing
- **FR-23**: Hero layout: avatar right with text left (mobile: avatar above text)
- **FR-24**: Idle animations: breathing, blinking, head sway; page-load wave animation
- **FR-25**: Head/eyes follow mouse cursor (touch: follow last tap), clamped with smooth lerp
- **FR-26**: Click avatar → speech bubble with random quote (typewriter effect, 4s auto-dismiss) + jump/spin
- **FR-27**: Fixed collapsible avatar widget (bottom-right) after hero section
- **FR-28**: Avatar pose changes per section: About=waves/smiles, Skills=types on holographic laptop, Experience=holds badge/ID, Projects=points to cards, Contact=thumbs up with speech bubble
- **FR-29**: "My Desk" 3D scene (between Experience & Projects): procedural desk with laptop (animated code), coffee mug (steam), plant, lamp; 3 clickable objects with popup messages

### Sections
- **FR-30**: Sticky glass navbar with smooth anchor scroll, active-section highlight, download resume button, mobile hamburger menu
- **FR-31**: Hero section: label, name (Durva Pawar), rotating typewriter roles (Full-Stack Engineer / AI/ML Engineer / Backend Developer), tagline, one-liner, CTA buttons (View Projects, Get in Touch), GitHub/LinkedIn icons, location (Pune, India), scroll-down indicator
- **FR-32**: About section: education/background text, 3 highlight cards (Backend & Systems, AI & CV, Web & Mobile), animated counters (CGPA 9.47, 35,000+ images trained, 2 internships), "Currently" widget (building/learning/exploring)
- **FR-33**: Skills section: 3D skill sphere + grouped categorized skill list below
- **FR-34**: Experience section: vertical animated timeline with 3 entries (Web Dev Intern at PropMv, AI/ML Intern at Atodya, Technical Co-Head at App Club)
- **FR-35**: "My Desk" 3D scene section
- **FR-36**: Projects section: 3D-tilt glass cards for meetsync-AI, BullSight, TejaLens with tech tags, Details modal, GitHub/Live placeholders
- **FR-37**: Education section: 3 entries (B.Tech AI&ML, HSC, SSC)
- **FR-38**: Certifications section: compact badge grid for 7 certifications
- **FR-39**: "Beyond the code" section: personal interests cards (painting, flute, sleeping)
- **FR-40**: Contact section: heading "Let's build something together.", contact form (name/email/message with validation), email pawardurva273@gmail.com, LinkedIn/GitHub links
- **FR-41**: Footer: "© 2026 Durva Pawar", social icons, back-to-top button

### Interactions & Polish
- **FR-42**: Animated preloader (avatar silhouette filling with color as progress increases) before 3D scene
- **FR-43**: Scroll progress bar at top of page
- **FR-44**: Staggered fade-up reveals on every section, magnetic hover on primary buttons
- **FR-45**: Konami code or "D" key → confetti + avatar dance
- **FR-46**: Custom 404 page with avatar shrugging
- **FR-47**: Favicon: "DP" monogram in burgundy
- **FR-48**: prefers-reduced-motion: freeze avatar, disable dance/confetti/cursor tracking

## Non-Functional Requirements
- **NFR-1**: Fully responsive: 360px to 4K, simplified 3D on mobile
- **NFR-2**: Lighthouse targets: Performance 90+, Accessibility 95+, SEO 100
- **NFR-3**: Semantic HTML, alt text on images, keyboard focus states
- **NFR-4**: SEO meta tags, Open Graph tags, proper <title>
- **NFR-5**: Clean, commented, componentized code
- **NFR-6**: Deployable to Vercel/Netlify with documented instructions

## Constraints
- **Technical**: Must use specified tech stack; no backend; data.ts as single content source
- **Business**: Use only the exact skills listed; do not add extra skills or invent personal data
- **Dependencies**: All packages must be available via npm; no proprietary or licensed libraries

## Assumptions
- durva.glb model file is optional; procedural fallback is sufficient for initial delivery
- resume.pdf will be added by user later; /resume.pdf placeholder link is acceptable
- GitHub/Live project links are placeholders to be filled later
- EmailJS optional; mailto: is acceptable default for contact form
- personal.ts fields (funFacts, currently, desk messages) may be empty; components hide accordingly

## Acceptance Criteria

### AC-1: Project Bootstrap & Configuration
- **Type**: `rule`
- **Given**: Empty repository
- **When**: npm install && npm run dev is executed
- **Then**: A Vite + React + TypeScript dev server starts successfully with Tailwind CSS, 3D libraries, and animations configured
- **Pass Condition**: No errors on startup, dev server runs, basic layout renders with burgundy theme
- **Evidence**: Terminal output of successful install + dev server start, browser screenshot of initial render

### AC-2: Burgundy Theme System Implemented
- **Type**: `rule`
- **Given**: Loaded application
- **When**: Inspecting CSS variables, Tailwind config, and rendered components
- **Then**: --accent (#800020), --accent-tint (#c2274f), --accent-secondary (#e0b878), bg (#0d0709 dark / #fbf6f4 light) are consistently applied
- **Pass Condition**: All color references use CSS variables mapped to Tailwind; text/background passes WCAG AA; light-mode toggle works
- **Evidence**: Screenshot of DevTools CSS variables, contrast-check screenshots, light-mode toggle animation

### AC-3: Hero 3D Scene with Node Graph & Particles
- **Type**: `rule`
- **Given**: Hero section visible
- **When**: User views and interacts with hero
- **Then**: Procedurally-built neural node graph (glowing spheres + connecting lines) slowly rotates, reacts to mouse with parallax, pulses; particle starfield exists in background; scene hue shifts subtly between burgundy/gold on scroll
- **Pass Condition**: No external .glb required for scene; interactions responsive; static fallback shown for reduced motion/WebGL fail
- **Evidence**: Video/gif of hero 3D interactions, screenshot of fallback gradient, reduced-motion mode screenshot

### AC-4: 3D Avatar with Full Interactions
- **Type**: `rule`
- **Given**: Hero loaded
- **When**: User loads page, moves mouse, clicks avatar, scrolls through sections
- **Then**: Avatar present (or procedural fallback), waves on load, follows cursor with head/eyes, speech bubble appears on click with random quote from data.ts, bottom-right fixed widget after hero, pose changes per section
- **Pass Condition**: Avatar renders without errors even without durva.glb; all interactions described work; reduced-motion freezes avatar
- **Evidence**: Screenshots of avatar in each section pose, video of click speech bubble, screenshot of procedural fallback

### AC-5: "My Desk" 3D Scene with Interactables
- **Type**: `rule`
- **Given**: Section between Experience and Projects visible
- **When**: User clicks laptop, mug, or plant
- **Then**: Desk scene renders procedurally with 4 objects (laptop with animated code, mug with steam particles, plant, warm-glow lamp); each clickable object shows popup with message from data.ts (or object name if empty)
- **Pass Condition**: All 3 objects clickable, popups appear correctly, no external model files required
- **Evidence**: Screenshot of desk scene, screenshot of each object popup

### AC-6: All 9 Sections Rendered Correctly
- **Type**: `rule`
- **Given**: Application loaded
- **When**: Navigating through Hero, About, Skills, Experience, My Desk, Projects, Education, Certifications + Beyond the code, Contact, Footer
- **Then**: Every section renders with exact content from prompt files; section headings have personality; data sourced from data.ts files
- **Pass Condition**: All sections present in order; content matches specifications exactly; "Currently" widget hides if fields empty
- **Evidence**: Full-page scroll screenshots of each section with content visible

### AC-7: 3D Skill Sphere Interactive
- **Type**: `rule`
- **Given**: Skills section visible
- **When**: User drags or observes skill sphere
- **Then**: 3D sphere/cloud of all skill labels (from exact skill list) auto-rotates and responds to drag; grouped categorized skill list also displayed below
- **Pass Condition**: All 8 skill categories present with exact skill names; sphere interactive on desktop; simplified on mobile
- **Evidence**: Screenshot of skill sphere + list, video of drag interaction

### AC-8: Project Cards with 3D Tilt & Modal
- **Type**: `rule`
- **Given**: Projects section visible
- **When**: User hovers card or clicks "Details"
- **Then**: 3D tilt effect with perspective + glare on hover; tech-tag row on each card; Details modal opens with full description; GitHub/Live buttons render as placeholders
- **Pass Condition**: All 3 projects (meetsync-AI, BullSight, TejaLens) present; tilt smooth; modal works
- **Evidence**: Video of 3D tilt hover, screenshot of Details modal open

### AC-9: Experience Timeline Animated
- **Type**: `rule`
- **Given**: Experience section visible
- **When**: User scrolls into section
- **Then**: Vertical timeline with 3 entries animates in (staggered); each entry shows role, company, dates, and full description
- **Pass Condition**: All 3 experience entries present with exact text; timeline layout correct on mobile and desktop
- **Evidence**: Screenshot of full timeline, mobile view screenshot

### AC-10: Navbar, Scroll, and Navigation UX
- **Type**: `rule`
- **Given**: Any scroll position
- **When**: User scrolls, clicks nav links, opens mobile menu
- **Then**: Sticky glass navbar persists; active section highlighted in nav; smooth anchor scroll; Download Resume button links to /resume.pdf; mobile hamburger with animated overlay works; scroll progress bar at top updates continuously
- **Pass Condition**: All nav links scroll to correct anchors; progress bar animates; mobile menu opens/closes
- **Evidence**: Video of navbar scroll behavior + mobile menu, screenshot of progress bar

### AC-11: Contact Form Validation + Links
- **Type**: `rule`
- **Given**: Contact section visible
- **When**: User submits empty/invalid form, then valid form; clicks email/social links
- **Then**: Client-side validation shows errors on invalid; valid submit triggers mailto: to pawardurva273@gmail.com; LinkedIn and GitHub links open correct URLs; no phone number displayed
- **Pass Condition**: Validation present for all 3 fields; mailto correct; social links correct
- **Evidence**: Screenshot of validation errors, network/log of mailto trigger

### AC-12: Animations, Preloader, Extras
- **Type**: `rule`
- **Given**: Full app lifecycle (load → scroll → interact)
- **When**: User experiences site
- **Then**: Animated preloader (avatar silhouette + progress) shows before 3D content; staggered fade-up on every section entry; magnetic hover on primary buttons; Konami/D key triggers confetti + avatar dance; custom 404 page exists with shrugging avatar
- **Pass Condition**: Preloader displays and completes; section reveals visible; confetti fires correctly (disabled for reduced-motion); 404 route accessible
- **Evidence**: Video of preloader, screenshot of 404, video of Konami confetti

### AC-13: Custom Cursor & prefers-reduced-motion
- **Type**: `rubric`
- **Dimension**: Custom cursor quality and accessibility
- **Scale**: 1-5
- **Anchors**: 1 = no custom cursor, ignores reduced motion; 3 = cursor exists but buggy, partial reduced-motion support; 5 = cursor glow reacts smoothly to all hoverables, reduced-motion gracefully disables cursor and all excessive animations throughout site
- **Pass Threshold**: >= 4
- **Evidence**: Video of cursor over multiple interactive elements, reduced-motion screenshot

### AC-14: Responsiveness & Mobile Experience
- **Type**: `rubric`
- **Dimension**: Responsive design quality across breakpoints
- **Scale**: 1-5
- **Anchors**: 1 = broken below 1024px, 3D unusable on mobile; 3 = works on common sizes but minor overflow/layout issues, 3D simplified but clunky; 5 = fluid 360px-4K, mobile 3D gracefully simplified, no horizontal overflow
- **Pass Threshold**: >= 4
- **Evidence**: Screenshots at 360px, 768px, 1024px, 1920px, 3840px viewport widths

### AC-15: Production Build & Deployment Ready
- **Type**: `rule`
- **Given**: Source code complete
- **When**: Running npm run build
- **Then**: Production build completes without errors, no TypeScript errors, build artifacts output to dist/ folder, deploy instructions included
- **Pass Condition**: Exit code 0, no TS errors, dist/ contains build output; README with run + deploy instructions present
- **Evidence**: Terminal output of npm run build, ls of dist/ directory, README deploy instructions section

### AC-16: SEO, Accessibility & Lighthouse Scores
- **Type**: `rubric`
- **Dimension**: Lighthouse audit scores and accessibility
- **Scale**: 1-5
- **Anchors**: 1 = no meta tags, broken semantics, alt text missing; 3 = basic SEO meta tags present, some alt text, keyboard navigation partial; 5 = Semantic HTML throughout, alt text all images, visible focus states, SEO meta tags + OG tags, Lighthouse Performance >= 90, Accessibility >= 95, SEO = 100
- **Pass Threshold**: >= 4
- **Evidence**: Lighthouse audit screenshot, DevTools accessibility tree screenshot, keyboard nav demo

### AC-17: Code Quality & Maintainability
- **Type**: `rubric`
- **Dimension**: Code organization, cleanliness, and maintainability
- **Scale**: 1-5
- **Anchors**: 1 = files disorganized, no comments, duplicate code; 3 = basic folder structure, some comments, mild duplication; 5 = strict /components, /sections, /three, /data separation; central data.ts content source; clean TypeScript types; meaningful comments; no dead code
- **Pass Threshold**: >= 4
- **Evidence**: Project tree output, sample code screenshots from each folder, TypeScript type definitions

## Open Questions
- [ ] None at this time. All content fields to be empty-safe (hidden when empty per spec).
