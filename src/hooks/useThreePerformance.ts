import { useMemo } from 'react';

export function useIsMobile(): boolean {
  return useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);
}

export function usePerformance(): {
  particleCount: number;
  dpr: [number, number];
  polygonBudget: number;
} {
  const isMobile = useIsMobile();
  return useMemo(() => {
    if (isMobile) {
      return {
        particleCount: 500,
        dpr: [1, 1.5],
        polygonBudget: 5000,
      };
    }
    return {
      particleCount: 2000,
      dpr: [1, 2],
      polygonBudget: 20000,
    };
  }, [isMobile]);
}
