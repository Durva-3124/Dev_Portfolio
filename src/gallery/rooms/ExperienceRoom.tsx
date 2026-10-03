import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { experience, wallPoint } from '../constants';

export default function ExperienceRoom() {
  // Room 05 rides the STAIR HALL RIGHT wall (layout.ts) — each entry sits one
  // step higher and further along, so the timeline climbs with the visitor.
  // `wallPoint` supplies the position AND the into-the-room yaw.
  const entries = useMemo(() => experience.map((exp, i) => ({
    exp,
    p: wallPoint('stairhall', 'right', 3.0 + i * 1.9, 8.0 - i * 4.2),
  })), []);

  const label = useMemo(() => wallPoint('stairhall', 'right', 10.8, 8.0), []);

  return (
    <group>
      <Html
        position={label.position}
        rotation={[0, label.yaw, 0]}
        distanceFactor={14}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div style={{ fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#6F1028', textTransform: 'uppercase', marginBottom: 6 }}>
            Room 05 — Experience
          </div>
          <div style={{ fontSize: 20, fontWeight: 200, letterSpacing: '0.12em', color: '#1A1614', textTransform: 'uppercase' }}>
            Career Timeline
          </div>
          <div style={{ width: 32, height: 1, background: '#6F1028', marginTop: 8 }} />
        </div>
      </Html>

      {entries.map(({ exp, p }) => (
        <Html
          key={exp.role}
          position={p.position}
          rotation={[0, p.yaw, 0]}
          distanceFactor={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            fontFamily: '"Helvetica Neue",Inter,Arial,sans-serif',
            width: 260,
            borderLeft: '2px solid #6F1028',
            paddingLeft: 10,
          }}>
            <div style={{ fontSize: 8, letterSpacing: '0.22em', color: '#6F1028', textTransform: 'uppercase', marginBottom: 3 }}>
              {exp.period || 'Present'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#1A1614', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {exp.role}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(26,22,20,0.55)', marginBottom: 5, letterSpacing: '0.08em' }}>
              {exp.company}
            </div>
            <div style={{ fontSize: 9.5, lineHeight: 1.65, color: 'rgba(26,22,20,0.60)', fontWeight: 300, maxWidth: 240 }}>
              {exp.description.slice(0, 120)}{exp.description.length > 120 ? '…' : ''}
            </div>
          </div>
        </Html>
      ))}
    </group>
  );
}
