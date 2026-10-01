import { useMemo } from 'react';

export function useIsMobile(): boolean {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);
}

// alias used by ParticleStarfield
export function useThreePerformance() {
  const isMobile = useIsMobile();
  return { isMobile };
}

export function usePerformance() {
  const isMobile = useIsMobile();
  return useMemo(() => {
    if (isMobile) return { particleCount: 500, dpr: [1, 1.5] as [number, number], polygonBudget: 5000 };
    return { particleCount: 2000, dpr: [1, 2] as [number, number], polygonBudget: 20000 };
  }, [isMobile]);
}
