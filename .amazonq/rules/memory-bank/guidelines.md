# Development Guidelines

## Code Quality Standards

### TypeScript Conventions
- `strict: true` is enforced — no implicit `any`, strict null checks always apply
- Use `verbatimModuleSyntax`: import types with `import type { Foo }` not `import { Foo }`
- Non-null assertion `!` is acceptable when context guarantees non-null (e.g., canvas `getContext('2d')!`)
- `as const` used on config objects to preserve literal types:
  ```ts
  export const MAT = { plaster: { color: 0xEEE9DF, roughness: 0.88 } } as const;
  ```
- Interfaces preferred for component props; type aliases for unions/primitives:
  ```ts
  export type AvatarPose = 'idle' | 'wave' | 'type' | 'badge' | 'point' | 'thumbsup' | 'shrug';
  interface AvatarProps { pose?: AvatarPose; small?: boolean; }
  ```

### Naming Conventions
- Components: PascalCase (`ProjectArtworks`, `GalleryWorld`, `ProceduralAvatar`)
- Hooks: camelCase with `use` prefix (`useTypewriter`, `useVirtualScroll`, `useMouseNorm`)
- Constants: SCREAMING_SNAKE_CASE for module-level config (`SHOTS`, `INSTALLS`, `SCROLL_TOTAL`, `BG_COLOR`, `CAM`, `MAT`)
- Helper functions: camelCase, verb-first (`applyGrain`, `makeMeetSyncTexture`, `getTex`)
- Event handlers: `handle` prefix (`handleClick`, `handleReturn`)
- Boolean state: descriptive (`isJumping`, `isSpinning`, `isWaving`, `showCase`)

### File Organization
- One default export per file = the primary component/hook
- Named exports for secondary exports (types, utilities, sub-components)
- Section dividers with ASCII banners for long files:
  ```ts
  // ─── Section title ────────────────────────────────────────────────────────────
  ```
- Helper functions defined above the component that uses them (not inside)
- Texture factory functions (`makeMeetSyncTexture`) defined at module scope, not inside components

## Component Patterns

### React Component Structure
```tsx
// 1. Imports (React, R3F, Three, local)
// 2. Types/interfaces
// 3. Helper functions / sub-components
// 4. Main component (default export)
```

### Props with Defaults
```tsx
function ProceduralAvatar({
  small = false,
  pose: poseProp = 'idle',
  section,
}: AvatarProps) { ... }
```

### Conditional Rendering — return null pattern
```tsx
function ProjectLabel({ def, visible }: { def: InstallDef; visible: boolean }) {
  if (!visible) return null;
  return (...);
}
```

### Graceful Degradation / Error Boundaries
- Wrap 3D components in custom error boundaries + `<Suspense>` with procedural fallbacks
- Pattern: try GLTF load → timeout fallback → procedural geometry fallback:
  ```tsx
  export function Avatar(props: AvatarProps) {
    return (
      <AvatarErrorBoundary fallback={<ProceduralAvatar {...props} />}>
        <Suspense fallback={<ProceduralAvatar {...props} />}>
          <GLTFAvatar {...props} />
        </Suspense>
      </AvatarErrorBoundary>
    );
  }
  ```

### Inline Styles for 3D Overlays
- HTML overlays inside R3F use inline `style` objects (not Tailwind) since they render inside Canvas context
- `CSSProperties` type used for style objects:
  ```tsx
  const canvasStyle: CSSProperties = { position: 'fixed', inset: 0, ... };
  ```
- Font stack for overlays: `"Helvetica Neue", Inter, Arial, sans-serif`
- Text always `uppercase` with wide `letterSpacing` (`0.18em`–`0.28em`) for editorial aesthetic

## Three.js / React Three Fiber Patterns

### useFrame for Animations
- All per-frame logic in `useFrame((_state, delta) => { ... })`
- Use `delta` (not elapsed) for frame-rate-independent animations
- Lerp for smooth transitions: `THREE.MathUtils.lerp(current, target, factor)`
- Exponential decay lerp for spring-like feel: `1 - Math.pow(0.01, dt)`
  ```tsx
  meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 1 - Math.pow(0.01, dt));
  ```

### Refs over State for 3D Objects
- Use `useRef<THREE.Mesh>(null)` / `useRef<THREE.Group>(null)` for 3D object references
- Mutate `.rotation`, `.position`, `.scale` directly in `useFrame` — never setState for per-frame values
- Clock ref for elapsed time: `const clockRef = useRef(new THREE.Clock())`

### Reduced Motion Accessibility
- Always check `useReducedMotion()` before running animations:
  ```tsx
  const reducedMotion = useReducedMotion();
  if (!reducedMotion) { /* animate */ }
  ```

### Canvas Textures
- Generate procedural textures with `document.createElement('canvas')` + 2D context
- Cache textures in a module-level object to avoid regeneration:
  ```ts
  const cache: Record<string, THREE.CanvasTexture> = {};
  function getTex(id: string) {
    if (!cache[id]) cache[id] = makeTexture();
    return cache[id];
  }
  ```
- Wrap texture creation in `useMemo` at component level: `const tex = useMemo(() => getTex(def.id), [def.id])`

### Material Conventions
- Use `meshStandardMaterial` for all PBR surfaces
- Burgundy accent: `color: 0x72001D` or `'#72001D'`
- Plaster/gallery walls: `color: 0xEEE9DF, roughness: 0.88, metalness: 0`
- Emissive for glowing elements: `emissive="#800020" emissiveIntensity={0.15}`

### Canvas Configuration (GalleryWorld pattern)
```tsx
<Canvas
  shadows={{ type: THREE.PCFSoftShadowMap }}
  gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.92 }}
  dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
>
```

## Custom Hooks Patterns

### Hook Return Types
- Hooks return a single value or destructured object — never classes
- `useTypewriter` returns `string`; `useVirtualScroll` returns `number` (progress 0–1)

### Event Listener Cleanup
- Always return cleanup function from `useEffect`:
  ```ts
  useEffect(() => {
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);
  ```
- Use `{ passive: false }` when calling `e.preventDefault()` inside the handler

### Timer Cleanup
```ts
useEffect(() => {
  const timer = setTimeout(() => { ... }, 500);
  return () => clearTimeout(timer);
}, [deps]);
```

### State Machine Pattern in Hooks
- `useTypewriter` uses multiple state variables (`wordIdx`, `charIdx`, `deleting`) as a mini state machine
- Prefer explicit state variables over a single reducer for simple animations

## Data Layer Conventions

### Content as Plain Objects
- All portfolio content in `src/data/portfolio.ts` as named `const` exports
- No classes, no functions — pure data objects and arrays
- Re-exported from `src/data/index.ts` for clean imports: `import { projects } from '@/data'`

### Data Shape Consistency
- Arrays of objects with consistent shapes (no optional fields unless truly optional)
- Slug field for URL-safe identifiers: `slug: 'meetsync-ai'`
- Tags as `string[]` arrays on project objects

### Constants File Pattern (gallery/constants.ts)
- Material palette, camera config, shot definitions, and install definitions all in one `constants.ts`
- TypeScript interfaces exported alongside data: `export interface InstallDef { ... }`
- Geometry/layout data references `@/data` for content, keeping 3D config separate from content

## Styling Conventions

### Tailwind vs Inline Styles
- Tailwind for all standard HTML/React components (sections, layout, UI components)
- Inline `style` objects for: R3F Html overlays, dynamic values, animation-driven styles
- Never mix Tailwind classes with inline styles on the same element

### Color Usage
- Primary accent: `#800020` (Tailwind: `accent`) / Three.js: `0x72001D`
- Accent tint: `#c2274f` (Tailwind: `accent-tint`)
- Gold accent: `#e0b878` (Tailwind: `accent-secondary`)
- Dark background: `#0d0709` (Tailwind: `backgroundDark`)
- Gallery background: `#EDE8DF` / `#EEE9DF`

### Typography
- Heading font: Sora, Space Grotesk (Tailwind: `font-heading`)
- Body font: Inter (Tailwind: `font-body`)
- Overlay/editorial text: `"Helvetica Neue", Inter, Arial, sans-serif` (inline)
- Editorial style: thin weight (100–300), wide letter-spacing, uppercase

## Import Conventions
- Path alias `@/` maps to `src/` — always use for cross-directory imports
- Group imports: React/R3F → Three.js → local data/hooks/components
- `import * as THREE from 'three'` for Three.js namespace
