import { Suspense } from 'react';
import GalleryWorld from '@/gallery/GalleryWorld';

function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#F2EFE7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1.2rem',
    }}>
      <div style={{
        width: 1,
        height: 48,
        background: 'rgba(24,24,24,0.15)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '40%',
          background: 'rgba(24,24,24,0.5)',
          animation: 'loadPulse 1.4s ease-in-out infinite',
        }} />
      </div>
      <p style={{
        fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
        fontSize: 10,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: 'rgba(24,24,24,0.4)',
      }}>
        Loading
      </p>
      <style>{`@keyframes loadPulse { 0%{transform:translateY(-100%)} 100%{transform:translateY(300%)} }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <GalleryWorld />
    </Suspense>
  );
}
