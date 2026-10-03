import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * ── Upstream notice suppression (documented, not silent) ────────────────────
 * three r186 marks `THREE.Clock` deprecated in favour of `THREE.Timer`, and
 * @react-three/fiber 9.8.1 still constructs one unconditionally when it builds
 * its root store (node_modules/@react-three/fiber/dist/.../events-*.esm.js →
 * `clock: new THREE.Clock()`). There is no `clock` option on <Canvas>, so the
 * notice cannot be avoided from application code.
 *
 * It is filtered by EXACT match on that one message and nothing else, so this
 * cannot hide warnings from our own code. Everything else reaches the console.
 */
const UPSTREAM_NOTICES = [
  'THREE.Clock: This module has been deprecated. Please use THREE.Timer instead.',
]
const _warn = console.warn.bind(console)
console.warn = (...args: unknown[]) => {
  if (typeof args[0] === 'string' && UPSTREAM_NOTICES.includes(args[0])) return
  _warn(...args)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
