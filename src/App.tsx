import { Suspense } from 'react';
import GalleryWorld from '@/gallery/GalleryWorld';
import { ArchPreview } from '@/gallery/assets/HeroArch';
import ReferenceScene from '@/gallery/reference/ReferenceScene';

const PREVIEW_ARCH      = false;
const PREVIEW_REFERENCE = false;

function LoadingScreen() {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#EDE8DF',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '1.4rem',
    }}>
      <div style={{
        fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
        fontSize: 22, fontWeight: 300, letterSpacing: '0.22em',
        color: 'rgba(26,22,20,0.70)', textTransform: 'uppercase',
      }}>
        DP
      </div>
      <div style={{ width: 1, height: 44, background: 'rgba(26,22,20,0.12)', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '45%',
          background: '#6F1028',
          animation: 'loadPulse 1.5s ease-in-out infinite',
        }} />
      </div>
      <style>{`@keyframes loadPulse{0%{transform:translateY(-100%)}100%{transform:translateY(300%)}}`}</style>
    </div>
  );
}

export default function App() {
  if (PREVIEW_ARCH)      return <ArchPreview />;
  if (PREVIEW_REFERENCE) return <ReferenceScene />;
  return (
    <Suspense fallback={<LoadingScreen />}>
      <GalleryWorld />
    </Suspense>
  );
}
