import { Suspense, useRef, useState, type FC } from 'react';
import { Canvas } from '@react-three/fiber';
import useReducedMotion from '@/hooks/useReducedMotion';
import SceneFallback from './SceneFallback';
import Lights from './Lights';

interface SceneCanvasProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
  dprLimit?: number;
}

function detectWebgl(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

const SceneCanvas: FC<SceneCanvasProps> = ({ children, className, height, dprLimit = 2 }) => {
  const reducedMotion = useReducedMotion();
  const [webglSupported] = useState(detectWebgl);
  const wrapperRef = useRef<HTMLDivElement>(null);

  if (reducedMotion || !webglSupported) {
    return <SceneFallback className={className} height={height} />;
  }

  const dprMax = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, dprLimit);

  return (
    <div ref={wrapperRef} className={className} style={{ height: height || '100%', width: '100%' }}>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, dprMax]}
        shadows
        frameloop="always"
        camera={{ position: [0, 0, 5], fov: 45 }}
        style={{ height: '100%', width: '100%' }}
      >
        <Suspense fallback={null}>
          <Lights />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
