import { useEffect } from 'react';
import { useReducedMotion } from './useReducedMotion';

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

export function useKonami(onKonami: () => void) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let idx = 0;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'd' || e.key === 'D') { onKonami(); idx = 0; return; }
      if (e.key === KONAMI[idx]) { idx++; if (idx === KONAMI.length) { onKonami(); idx = 0; } }
      else idx = 0;
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onKonami, reduced]);
}
