import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { education, certifications, personal, wallPoint } from '../constants';

const CARD = 'rgba(242,237,228,0.92)';
const F = '"Helvetica Neue",Inter,Arial,sans-serif';

export default function UpperGalleryRoom() {
  // Room 06 = the upper gallery (z −38 → −58, floor 5.2). Everything is placed
  // relative to the room's own walls through `wallPoint` — no literals here.
  const label = useMemo(() => wallPoint('upper', 'back', 5.9, 0), []);

  const edu = useMemo(() => education.map((ed, i) => ({
    ed, p: wallPoint('upper', 'left', 3.4 - i * 0.9, -5 + i * 3),
  })), []);

  const certs = useMemo(() => certifications.map((cert, i) => ({
    cert,
    p: wallPoint('upper', 'right', 4.6 - Math.floor(i / 2) * 1.1, -8 + (i % 2) * 3.2),
  })), []);

  const interests = useMemo(() => personal.interests.map((it, i) => ({
    it, p: wallPoint('upper', 'back', 3.2 - i * 1.1, 6.6),
  })), []);

  return (
    <group>
      <Html position={label.position} rotation={[0, label.yaw, 0]} distanceFactor={16}
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ fontFamily: F, textAlign: 'center' }}>
          <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#6F1028', textTransform: 'uppercase', marginBottom: 6 }}>
            Room 06 — Upper Gallery
          </div>
          <div style={{ fontSize: 20, fontWeight: 200, letterSpacing: '0.12em', color: '#1A1614', textTransform: 'uppercase' }}>
            Education &amp; Beyond
          </div>
          <div style={{ width: 32, height: 1, background: '#6F1028', margin: '8px auto 0' }} />
        </div>
      </Html>

      {/* Education — upper gallery LEFT wall */}
      {edu.map(({ ed, p }) => (
        <Html key={ed.degree} position={p.position} rotation={[0, p.yaw, 0]} distanceFactor={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ fontFamily: F, width: 220, background: CARD, padding: '8px 12px', borderLeft: '2px solid #B08F52' }}>
            <div style={{ fontSize: 9, letterSpacing: '0.18em', color: '#B08F52', textTransform: 'uppercase', marginBottom: 3 }}>
              {ed.period}
            </div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#1A1614', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {ed.degree}
            </div>
            <div style={{ fontSize: 9.5, color: 'rgba(26,22,20,0.60)', marginTop: 2 }}>{ed.institution}</div>
            <div style={{ fontSize: 9, color: '#6F1028', marginTop: 2, letterSpacing: '0.08em' }}>
              {ed.score}{ed.honors ? ` · ${ed.honors}` : ''}
            </div>
          </div>
        </Html>
      ))}

      {/* Certifications — upper gallery RIGHT wall */}
      {certs.map(({ cert, p }) => (
        <Html key={cert.name} position={p.position} rotation={[0, p.yaw, 0]} distanceFactor={9}
          style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ fontFamily: F, width: 180, background: 'rgba(242,237,228,0.90)', padding: '6px 10px', borderLeft: '2px solid rgba(111,16,40,0.35)' }}>
            <div style={{ fontSize: 9, fontWeight: 500, color: '#1A1614', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {cert.name}
            </div>
            <div style={{ fontSize: 8, color: 'rgba(26,22,20,0.50)', marginTop: 2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {cert.issuer}
            </div>
          </div>
        </Html>
      ))}

      {/* Beyond the code — back wall, left of TejaLens */}
      {interests.map(({ it, p }) => (
        <Html key={it.name} position={p.position} rotation={[0, p.yaw, 0]} distanceFactor={10}
          style={{ pointerEvents: 'none', userSelect: 'none' }}>
          <div style={{ fontFamily: F, width: 150, background: CARD, border: '1px solid rgba(111,16,40,0.15)', padding: '8px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 500, color: '#1A1614', textTransform: 'uppercase', letterSpacing: '0.10em', marginBottom: 4 }}>
              {it.name}
            </div>
            <div style={{ fontSize: 8.5, lineHeight: 1.55, color: 'rgba(26,22,20,0.55)', fontWeight: 300 }}>
              {it.desc}
            </div>
          </div>
        </Html>
      ))}
    </group>
  );
}
