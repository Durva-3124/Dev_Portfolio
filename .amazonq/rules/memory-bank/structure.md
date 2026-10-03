# Project Structure

## Directory Layout
```
Dev_Portfolio/
├── public/
│   ├── models/          # 3D model assets (.glb/.gltf)
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/          # Static images (hero.png, svgs)
│   ├── components/
│   │   ├── layout/      # Navbar, Footer, ScrollProgress
│   │   └── ui/          # Reusable UI: GlassCard, TiltCard, MagneticButton,
│   │                    #   CustomCursor, Preloader, ProjectModal,
│   │                    #   SectionReveal, SpeechBubble, Timeline
│   ├── data/
│   │   ├── portfolio.ts # All portfolio content (hero, about, skills,
│   │   │                #   experience, projects, education, certifications, contact)
│   │   ├── personal.ts  # Personal branding (accent colors, avatar quotes, interests)
│   │   └── index.ts     # Re-exports from data files
│   ├── gallery/         # 3D gallery world (core feature)
│   │   ├── assets/
│   │   │   └── HeroArch.tsx        # Architectural 3D arch element
│   │   ├── GalleryWorld.tsx        # Root gallery scene orchestrator
│   │   ├── GalleryArchitecture.tsx # Gallery walls/floor/ceiling geometry
│   │   ├── GalleryLighting.tsx     # Three.js lighting setup
│   │   ├── ProjectArtworks.tsx     # Project cards rendered as gallery artworks
│   │   ├── ProjectExperience.tsx   # Project detail experience layer
│   │   ├── CameraController.tsx    # Camera movement and navigation
│   │   └── constants.ts            # Gallery layout constants
│   ├── hooks/
│   │   ├── useActiveSection.ts     # Tracks active scroll section
│   │   ├── useKonami.ts            # Konami code easter egg
│   │   ├── useReducedMotion.ts     # Accessibility: prefers-reduced-motion
│   │   ├── useSmoothScroll.ts      # Lenis smooth scroll integration
│   │   ├── useTheme.ts             # Dark/light theme management
│   │   ├── useThreePerformance.ts  # Three.js performance monitoring
│   │   └── useTypewriter.ts        # Typewriter text animation
│   ├── pages/
│   │   └── NotFound.tsx            # 404 page
│   ├── sections/        # Full-page portfolio sections
│   │   ├── Hero.tsx, About.tsx, Skills.tsx, Experience.tsx
│   │   ├── Projects.tsx, Education.tsx, Certifications.tsx
│   │   ├── BeyondCode.tsx, MyDesk.tsx, Contact.tsx
│   ├── three/           # Standalone Three.js/R3F components
│   │   ├── Avatar.tsx          # Animated 3D avatar character
│   │   ├── FloatingWidget.tsx  # Floating 3D UI element
│   │   ├── Hero3DScene.tsx     # Hero section 3D scene
│   │   ├── Lights.tsx          # Reusable lighting component
│   │   ├── MyDeskScene.tsx     # Interactive desk 3D scene
│   │   ├── ParticleStarfield.tsx # Particle system background
│   │   ├── Preloader3D.tsx     # 3D loading animation
│   │   ├── SceneCanvas.tsx     # R3F Canvas wrapper
│   │   ├── SceneFallback.tsx   # Fallback for WebGL failures
│   │   └── SkillSphere.tsx     # 3D skill visualization
│   ├── utils/
│   │   └── sectionScrollProgress.ts # Scroll progress calculation
│   ├── App.tsx          # Root component — mounts GalleryWorld in Suspense
│   ├── main.tsx         # Entry point
│   ├── App.css          # Global app styles
│   └── index.css        # Tailwind base + custom CSS variables
├── .amazonq/rules/memory-bank/  # Memory Bank documentation
├── .trae/specs/         # Project specs and tasks
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .oxlintrc.json       # Oxlint configuration
└── vercel.json          # Vercel deployment config
```

## Core Architectural Patterns

### 1. Gallery-First Architecture
App.tsx → GalleryWorld (3D canvas) is the primary entry point. Traditional sections are embedded within or alongside the 3D world, not the other way around.

### 2. Data/View Separation
All content lives in `src/data/` as plain TypeScript objects. Components consume data via imports — no prop drilling of raw strings.

### 3. Three.js Layer Separation
- `src/three/` — generic, reusable 3D components (Avatar, Lights, SceneCanvas)
- `src/gallery/` — domain-specific 3D gallery world components

### 4. Custom Hooks for Side Effects
All browser APIs, scroll logic, animation state, and performance monitoring are encapsulated in `src/hooks/`.

### 5. Component Hierarchy
```
App
└── GalleryWorld (R3F Canvas)
    ├── GalleryArchitecture
    ├── GalleryLighting
    ├── ProjectArtworks
    ├── CameraController
    └── Avatar / FloatingWidget / ParticleStarfield
```
Traditional sections (Hero, About, etc.) render as HTML overlays or within the gallery flow.
