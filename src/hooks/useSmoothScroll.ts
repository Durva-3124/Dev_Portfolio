import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const lenisInstance = new Lenis({
      smoothWheel: true,
      syncTouch: true,
    });

    lenisRef.current = lenisInstance;
    setLenis(lenisInstance);

    let rafId: number;
    const raf = (time: number) => {
      lenisInstance.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    lenisInstance.on('scroll', ({ progress }: { progress: number }) => {
      setScrollProgress(progress);
    });

    return () => {
      cancelAnimationFrame(rafId);
      lenisInstance.destroy();
    };
  }, []);

  const scrollTo = (target: string | number | HTMLElement) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target);
    }
  };

  const getState = () => {
    return lenisRef.current;
  };

  return {
    lenis,
    scrollTo,
    getState,
    scrollProgress,
  };
}
