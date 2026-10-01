import { Suspense, useEffect, useRef, useState, type FC } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import useReducedMotion from '@/hooks/useReducedMotion';
import SceneFallback from './SceneFallback';
import Lights from './Lights';

interface SceneCanvasProps {
  children: React.ReactNode;
  className?: string;
  height?: string;
  dprLimit?: number;
  fallbackMessage?: string;
}

function detectWebgl(): boolean {
  if (typeof document === 'undefined') return true;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

function VisibilityController(): null {
  const { performance } = useThree();
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let canvas: HTMLCanvasElement | null = null;
    const findCanvas = () => {
      const c = document.querySelector('canvas');
      if (c) {
        canvas = c as HTMLCanvasElement;
        wrapperRef.current = canvas.parentElement;
      }
    };
    findCanvas();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          performance.minimize = !entry.isIntersecting;
        }
      },
      { threshold: 0 },
    );

    const target = wrapperRef.current ?? canvas;
    if (target) {
      observer.observe(target);
    } else {
      const timeout = setTimeout(() => {
        findCanvas();
        const t = wrapperRef.current ?? canvas;
        if (t) observer.observe(t);
      }, 100);
      return () => {
        clearTimeout(timeout);
        observer.disconnect();
      };
    }

    return () => {
      observer.disconnect();
    };
  }, [performance]);

  return null;
}

const SceneCanvas: FC<SceneCanvasProps> = ({
  children,
  className,
  height,
  dprLimit = 2,
  fallbackMessage: _fallbackMessage,
}) => {
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
        <VisibilityController />
        <Suspense fallback={null}>
          <Lights />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default SceneCanvas;
