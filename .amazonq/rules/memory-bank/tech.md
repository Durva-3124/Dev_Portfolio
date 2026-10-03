# Technology Stack

## Core Languages & Runtime
- **TypeScript** ~6.0.2 — strict mode, ES2023 target, `erasableSyntaxOnly`
- **JavaScript (ESM)** — `"type": "module"` in package.json
- **JSX/TSX** — React JSX transform (`react-jsx`, no explicit React import needed)

## Frontend Framework
- **React** ^19.2.8 — latest with concurrent features, Suspense for 3D loading
- **React DOM** ^19.2.7

## 3D / WebGL
- **Three.js** ^0.186.1 — core 3D engine
- **@react-three/fiber** ^9.8.1 — React renderer for Three.js
- **@react-three/drei** ^10.7.9 — Three.js helpers (OrbitControls, useGLTF, etc.)
- 3D models served from `public/models/` as `.glb`/`.gltf` (included via `assetsInclude` in Vite)

## Animation
- **Framer Motion** ^13.4.6 — React component animations, layout transitions
- **GSAP** ^3.15.0 — timeline-based animations, scroll triggers
- **Lenis** ^1.3.26 — smooth scroll library

## Styling
- **Tailwind CSS** ^3.4.19 — utility-first CSS, `darkMode: 'class'`
- **PostCSS** ^8.5.28 + **Autoprefixer** ^10.6.1
- Custom Tailwind theme extensions:
  - Colors: `accent (#800020)`, `accent-tint (#c2274f)`, `accent-secondary (#e0b878)`, `backgroundDark (#0d0709)`, `backgroundLight (#fbf6f4)`
  - Fonts: `heading` (Sora, Space Grotesk), `body` (Inter)
  - Shadows: `glow`, `glowGold`
  - Animations: `pulse-glow`, `float`, `shimmer`

## Build System
- **Vite** ^8.3.0 — dev server + bundler
- **@vitejs/plugin-react** ^6.1.1 — Babel/Oxc React transform
- Path alias: `@` → `./src` (configured in both vite.config.ts and tsconfig.app.json)
- Manual chunks: `three` (Three.js + R3F), `motion` (Framer Motion)
- Build target: `es2020`, sourcemaps disabled in production

## Linting
- **Oxlint** ^1.81.0 — fast Rust-based linter
- Config: `.oxlintrc.json`

## Utilities
- **react-icons** ^5.7.0 — icon library
- **canvas-confetti** ^1.9.4 — confetti animation effect

## Deployment
- **Vercel** — `vercel.json` present, `public/_redirects` for SPA routing

## TypeScript Configuration
- `strict: true`, `noFallthroughCasesInSwitch: true`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports
- `moduleResolution: "bundler"` — Vite-compatible resolution
- `allowImportingTsExtensions: true`

## Development Commands
```bash
npm run dev        # Start Vite dev server
npm run build      # tsc -b && vite build
npm run typecheck  # tsc --noEmit
npm run lint       # oxlint
npm run preview    # vite preview
```
