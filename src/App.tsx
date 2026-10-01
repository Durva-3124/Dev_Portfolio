import { Suspense } from 'react';
import GalleryWorld from '@/gallery/GalleryWorld';

// ─── Phase 1: Full-screen 3D gallery world ────────────────────────────────────
// The existing portfolio sections (Hero, About, Skills, etc.) are preserved in
// src/sections/ and will be integrated in Phase 6 as in-world content panels.
// App.tsx is intentionally minimal for Phase 1.

function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0d0709',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem',
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '2px solid rgba(224,184,120,0.15)',
        borderTop: '2px solid #e0b878',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{
        color: 'rgba(224,184,120,0.6)',
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.75rem',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}>
        Loading world…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}>
      <Suspense fallback={<LoadingScreen />}>
        <GalleryWorld />
      </Suspense>
    </div>
  );
}
