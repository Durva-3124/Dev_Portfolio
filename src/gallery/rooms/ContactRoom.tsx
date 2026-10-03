import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { contact, roomCentreZ, ROOMS_LAYOUT, wallPoint } from '../constants';

const F = '"Helvetica Neue",Inter,Arial,sans-serif';

export default function ContactRoom() {
  // Room 07 is the right-hand half of the upper gallery's BACK wall, beside
  // TejaLens. Positions come from `wallPoint`; the desk is offset from the
  // room's own centre line. No literals for placement.
  const heading = useMemo(() => wallPoint('upper', 'back', 4.9, -6.5), []);
  const links   = useMemo(() => wallPoint('upper', 'back', 1.6, -6.5), []);

  const u = ROOMS_LAYOUT.upper;
  const desk = useMemo<[number, number, number]>(
    () => [5.6, u.floorY, roomCentreZ(u) + 5.0],
    [u],
  );

  return (
    <group>
      <Html position={heading.position} rotation={[0, heading.yaw, 0]} distanceFactor={18}
        style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{ fontFamily: F, width: 380 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.28em', color: '#6F1028', textTransform: 'uppercase', marginBottom: 10 }}>
            Room 07 — Contact
          </div>
          <div style={{
            fontSize: 30, fontWeight: 100, color: '#1A1614',
            lineHeight: 1.1, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {contact.heading}
          </div>
          <div style={{ width: 40, height: 1, background: '#6F1028', margin: '12px 0' }} />
        </div>
      </Html>

      <Html position={links.position} rotation={[0, links.yaw, 0]} distanceFactor={10}
        style={{ userSelect: 'none' }}>
        <div style={{ fontFamily: F, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href={`mailto:${contact.email}`} style={{
            display: 'block', background: 'rgba(176,143,82,0.92)', padding: '6px 14px',
            fontSize: 10, letterSpacing: '0.18em', color: '#1A1614',
            textDecoration: 'none', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer',
          }}>
            ✉ {contact.email}
          </a>
          <a href={contact.linkedin} target="_blank" rel="noreferrer" style={{
            display: 'block', background: 'rgba(242,237,228,0.92)',
            border: '1px solid rgba(111,16,40,0.25)', padding: '6px 14px',
            fontSize: 10, letterSpacing: '0.18em', color: '#6F1028',
            textDecoration: 'none', textTransform: 'uppercase', fontWeight: 400, cursor: 'pointer',
          }}>
            LinkedIn ↗
          </a>
          <a href={contact.github} target="_blank" rel="noreferrer" style={{
            display: 'block', background: 'rgba(242,237,228,0.92)',
            border: '1px solid rgba(111,16,40,0.25)', padding: '6px 14px',
            fontSize: 10, letterSpacing: '0.18em', color: '#6F1028',
            textDecoration: 'none', textTransform: 'uppercase', fontWeight: 400, cursor: 'pointer',
          }}>
            GitHub ↗
          </a>
        </div>
      </Html>

      {/* Writing desk, positioned from the room's floor + centre line */}
      <mesh castShadow receiveShadow position={[desk[0], desk[1] + 0.56, desk[2]]}>
        <boxGeometry args={[3.5, 0.08, 1.4]} />
        <meshStandardMaterial color={0x32251F} roughness={0.65} metalness={0} />
      </mesh>
      <mesh castShadow receiveShadow position={[desk[0], desk[1], desk[2]]}>
        <boxGeometry args={[3.5, 1.5, 1.4]} />
        <meshStandardMaterial color={0x2A1E1A} roughness={0.70} metalness={0} />
      </mesh>
    </group>
  );
}
