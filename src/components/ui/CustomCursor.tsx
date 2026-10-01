import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);
  const ringX = useMotionValue(0);
  const ringY = useMotionValue(0);
  const ringScale = useMotionValue(1);
  const springRingX = useSpring(ringX, { stiffness: 150, damping: 20, mass: 0.2 });
  const springRingY = useSpring(ringY, { stiffness: 150, damping: 20, mass: 0.2 });
  const springRingScale = useSpring(ringScale, { stiffness: 200, damping: 20, mass: 0.1 });
  const hoverSetRef = useRef<Set<Element>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      ringX.set(e.clientX);
      ringY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest && target.closest('a, button, [role=button]')) {
        const el = target.closest('a, button, [role=button]') as Element;
        hoverSetRef.current.add(el);
        ringScale.set(1.5);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as Element;
      if (target.closest && target.closest('a, button, [role=button]')) {
        const el = target.closest('a, button, [role=button]') as Element;
        hoverSetRef.current.delete(el);
        if (hoverSetRef.current.size === 0) {
          ringScale.set(1);
        }
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [reducedMotion, dotX, dotY, ringX, ringY, ringScale]);

  if (typeof window !== 'undefined') {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice || reducedMotion) return null;
  }

  return (
    <>
      <motion.div
        className="w-4 h-4 rounded-full bg-accentTint/80 mix-blend-difference fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: dotX,
          y: dotY,
          transform: 'translate(-50%, -50%)',
        }}
      />
      <motion.div
        className="w-10 h-10 border-2 border-accentTint/50 rounded-full fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{
          x: springRingX,
          y: springRingY,
          scale: springRingScale,
          transform: 'translate(-50%, -50%)',
          borderColor:
            ringScale.get() > 1 ? 'rgba(224, 184, 120, 0.7)' : 'rgba(194, 39, 79, 0.5)',
        }}
      />
    </>
  );
}

export default CustomCursor;
