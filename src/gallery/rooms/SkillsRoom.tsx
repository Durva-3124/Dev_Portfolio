import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { skills, wallPoint } from '../constants';

function SkillFrame({ category, items, position, yaw }: {
  category: string;
  items: string[];
  position: [number, number, number];
  yaw: number;
}) {
  return (
    <Html
      position={position}
      rotation={[0, yaw, 0]}
      distanceFactor={10}
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <div style={{
        fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif',
        width: 140,
        background: 'rgba(242,237,228,0.94)',
        border: '1px solid rgba(111,16,40,0.18)',
        padding: '10px 12px',
      }}>
        <div style={{
          fontSize: 8, letterSpacing: '0.22em', color: '#6F1028',
          textTransform: 'uppercase', marginBottom: 7, fontWeight: 500,
        }}>
          {category}
        </div>
        {items.map(item => (
          <div key={item} style={{
            fontSize: 9.5, color: '#2A2420', lineHeight: 1.7, fontWeight: 300,
          }}>
            {item}
          </div>
        ))}
      </div>
    </Html>
  );
}

export default function SkillsRoom() {
  // Room 04 lives on the STAIR-HALL LEFT wall (layout.ts). Two columns of four,
  // climbing with the staircase so the board is read on the way up.
  // `wallPoint` gives both the position and the yaw that faces the room.
  const COLS = 2;
  const frames = useMemo(() => skills.map((s, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      category: s.category,
      items: s.items,
      p: wallPoint('stairhall', 'left', 8.4 - row * 1.9, -3.6 + col * 3.6),
    };
  }), []);

  const label = useMemo(() => wallPoint('stairhall', 'left', 10.6, -3.6), []);

  return (
    <group>
      <Html
        position={label.position}
        rotation={[0, label.yaw, 0]}
        distanceFactor={16}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{ fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#6F1028', textTransform: 'uppercase', marginBottom: 6 }}>
            Room 04 — Skills
          </div>
          <div style={{ fontSize: 22, fontWeight: 200, letterSpacing: '0.12em', color: '#1A1614', textTransform: 'uppercase' }}>
            What I Work With
          </div>
          <div style={{ width: 32, height: 1, background: '#6F1028', marginTop: 8 }} />
        </div>
      </Html>

      {frames.map(f => (
        <SkillFrame
          key={f.category}
          category={f.category}
          items={f.items}
          position={f.p.position}
          yaw={f.p.yaw}
        />
      ))}
    </group>
  );
}
