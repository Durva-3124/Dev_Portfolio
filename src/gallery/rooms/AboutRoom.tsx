import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { about, wallPoint } from '../constants';

/**
 * Counter — animated statistic.
 *
 * IMPORTANT: this component renders INSIDE a drei `<Html>` overlay, and drei's
 * Html mounts its children into a *separate* React root
 * (`ReactDOM.createRoot(el)` in drei/web/Html.js). A second root has no
 * react-three-fiber context, so ANY R3F hook here throws
 * "R3F: Hooks can only be used within the Canvas component!".
 * The animation is therefore driven by requestAnimationFrame writing straight
 * to a DOM node — which also keeps it out of React state (PART B.10).
 */
function Counter({ label, target, suffix, armed }: {
  label: string; target: number; suffix: string; armed: boolean;
}) {
  const valueRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!armed || doneRef.current) return;
    doneRef.current = true;
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const t = Math.min((performance.now() - t0) / 1800, 1);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const v = eased * target;
      const shown = target < 10
        ? (Math.round(v * 100) / 100).toFixed(2)
        : Math.floor(v).toLocaleString();
      const el = valueRef.current;
      if (el) el.textContent = shown + suffix;
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed, target, suffix]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div ref={valueRef} style={{
        fontSize: 28, fontWeight: 100, color: '#1A1614',
        letterSpacing: '-0.02em', lineHeight: 1,
      }}>
        {target < 10 ? '0.00' : '0'}{suffix}
      </div>
      <div style={{
        fontSize: 8, letterSpacing: '0.22em', color: '#6F1028',
        textTransform: 'uppercase', marginTop: 4,
      }}>
        {label}
      </div>
    </div>
  );
}

function AboutWall() {
  const groupRef   = useRef<THREE.Group>(null);
  const triggeredRef = useRef(false);
  const [triggered, setTriggered] = useState(false);

  // Everything below is anchored to the main gallery's LEFT wall (layout.ts).
  const plaque   = useMemo(() => wallPoint('gallery', 'left', 4.6, 7), []);
  const counters = useMemo(() => wallPoint('gallery', 'left', 0.9, 7), []);
  const stats    = useMemo(() => wallPoint('gallery', 'left', 3.0, 7), []);

  useFrame(({ camera }) => {
    if (!groupRef.current || triggeredRef.current) return;
    if (camera.position.distanceTo(groupRef.current.position) < 12) {
      triggeredRef.current = true;
      setTriggered(true);
    }
  });

  return (
    <group ref={groupRef} position={plaque.position}>
      {/* About text plaque */}
      <Html
        position={plaque.position}
        rotation={[0, plaque.yaw, 0]}
        distanceFactor={14}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{ fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif', width: 320 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#6F1028', marginBottom: 8, textTransform: 'uppercase' }}>
            Room 02 — About
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.75, color: '#2A2420', fontWeight: 300 }}>
            {about.text}
          </div>
        </div>
      </Html>

      {/* Three highlight frames, stacked down the same wall */}
      {about.highlights.map((h, i) => {
        const p = wallPoint('gallery', 'left', stats.position[1] - i * 1.35, 7);
        return (
          <Html
            key={h.title}
            position={p.position}
            rotation={[0, p.yaw, 0]}
            distanceFactor={10}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div style={{
              fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif',
              width: 240,
              borderLeft: '2px solid #6F1028',
              paddingLeft: 10,
            }}>
              <div style={{ fontSize: 9, letterSpacing: '0.18em', color: '#6F1028', textTransform: 'uppercase', marginBottom: 4 }}>
                {h.title}
              </div>
              <div style={{ fontSize: 10, lineHeight: 1.6, color: 'rgba(26,22,20,0.65)', fontWeight: 300 }}>
                {h.text}
              </div>
            </div>
          </Html>
        );
      })}

      {/* Counters */}
      <Html
        position={counters.position}
        rotation={[0, counters.yaw, 0]}
        distanceFactor={10}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{
          fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif',
          display: 'flex', gap: 32,
        }}>
          {about.counters.map(c => (
            <Counter key={c.label} label={c.label} target={c.value} suffix={c.suffix} armed={triggered} />
          ))}
        </div>
      </Html>
    </group>
  );
}

export default function AboutRoom() {
  return <AboutWall />;
}
