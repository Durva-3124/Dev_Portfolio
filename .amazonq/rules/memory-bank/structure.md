# Project Structure

## Directory Layout

```
Dev_Portfolio/
├── public/
│   ├── models/          # 3D model assets (GLTF/GLB files)
│   ├── favicon.svg
│   ├── icons.svg
│   └── _redirects       # Netlify/Vercel SPA redirect rule
├── src/
│   ├── App.tsx          # Root — mounts GalleryWorld in full-screen Suspense
│   ├── main.tsx         # React DOM entry point
│   ├── index.css        # Global styles
│   ├── App.css
│   ├── assets/          # Static images (hero.png, SVGs)
│   ├── components/
│   │   ├── layout/      # Structural UI: Navbar, Footer, ScrollProgress
│   │   └── ui/          # Reusable UI primitives (see below)
│   ├── data/            # Static content/data layer
│   │   ├── portfolio.ts # Projects, skills, experience data
│   │   ├── personal.ts  # Personal info, bio
│   │   └── index.ts     # Re-exports
│   ├── gallery/         # 3D gallery world (active Phase 1 entry point)
│   │   ├── GalleryWorld.tsx       # Top-level R3F Canvas + scene composition
│   │   ├── GalleryArchitecture.tsx # Gallery room geometry/meshes
│   │   ├── GalleryLighting.tsx    # Scene lighting setup
│   │   ├── PlayerController.tsx   # Player movement & camera control
│   │   └── constants.ts           # Gallery dimensions, config constants
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route-level pages (NotFound)
│   ├── sections/        # Portfolio content sections (preserved, Phase 6)
│   ├── three/           # Reusable Three.js/R3F components
│   └── utils/           # Pure utility functions
├── .amazonq/rules/memory-bank/  # Memory Bank documentation
├── .trae/specs/         # Project specs and task tracking
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── .oxlintrc.json
└── vercel.json
```

## Core Components & Relationships

### Entry Flow
`main.tsx` → `App.tsx` → `GalleryWorld` (R3F Canvas) → `GalleryArchitecture` + `GalleryLighting` + `PlayerController` + `Avatar`

### UI Components (`src/components/ui/`)
| Component | Purpose |
|---|---|
| CustomCursor | Replaces default cursor with branded cursor |
| GlassCard | Glassmorphism card container |
| MagneticButton | Button with magnetic hover effect |
| Preloader | Initial loading screen |
| ProjectModal | Full-screen project detail overlay |
| SectionReveal | Scroll-triggered reveal animation wrapper |
| SpeechBubble | Tooltip/speech bubble UI element |
| TiltCard | 3D tilt-on-hover card |
| Timeline | Vertical timeline for experience/education |

### Three.js Components (`src/three/`)
| Component | Purpose |
|---|---|
| Avatar | Animated 3D character |
| FloatingWidget | Floating 3D UI element |
| Hero3DScene | Hero section 3D background |
| Lights | Reusable lighting presets |
| MyDeskScene | Interactive desk scene |
| ParticleStarfield | Particle background effect |
| Preloader3D | 3D loading animation |
| SceneCanvas | R3F Canvas wrapper with defaults |
| SceneFallback | Fallback for WebGL unavailability |
| SkillSphere | Skill tags on a 3D sphere |

### Hooks (`src/hooks/`)
| Hook | Purpose |
|---|---|
| useActiveSection | Tracks which section is in viewport |
| useKonami | Detects Konami code input |
| useReducedMotion | Respects prefers-reduced-motion |
| useSmoothScroll | Lenis smooth scroll integration |
| useTheme | Theme state management |
| useThreePerformance | R3F performance monitoring |
| useTypewriter | Typewriter text animation |

## Architectural Patterns
- **Phase-based development**: App.tsx comment documents phases; sections preserved for future integration
- **Data/UI separation**: All content lives in `src/data/`, components are purely presentational
- **Path alias**: `@/` maps to `src/` (configured in vite.config.ts and tsconfig)
- **Lazy loading**: `Suspense` wraps the entire 3D world for async model loading
- **Component co-location**: Gallery-specific logic stays in `src/gallery/`, reusable 3D in `src/three/`
