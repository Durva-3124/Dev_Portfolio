import type { CSSProperties } from 'react';
import { ROOM_ZONES, zoneForProgress, type RoomZone } from '../constants';

const F: CSSProperties = {
  fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
  pointerEvents: 'none',
  userSelect: 'none',
};

interface Props {
  progress: number;
  onRoomJump: (t: number) => void;
}

function currentRoom(progress: number): RoomZone {
  return zoneForProgress(progress);
}

export default function MuseumUI({ progress, onRoomJump }: Props) {
  const room = currentRoom(progress);

  return (
    <>
      {/* Top-left monogram */}
      <div style={{
        position: 'fixed', top: '1.8rem', left: '2rem',
        zIndex: 20, ...F,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 300, letterSpacing: '0.18em',
          color: 'rgba(26,22,20,0.75)', textTransform: 'uppercase',
        }}>
          DP
        </div>
      </div>

      {/* Top-right room name */}
      <div style={{
        position: 'fixed', top: '1.8rem', right: '2rem',
        zIndex: 20, textAlign: 'right', ...F,
      }}>
        <div style={{
          fontSize: 9, letterSpacing: '0.28em', color: '#6F1028',
          textTransform: 'uppercase', marginBottom: 3,
        }}>
          {String(room.index).padStart(2, '0')} / {String(ROOM_ZONES.length).padStart(2, '0')}
        </div>
        <div style={{
          fontSize: 11, letterSpacing: '0.14em', color: 'rgba(26,22,20,0.55)',
          textTransform: 'uppercase', fontWeight: 300,
        }}>
          {room.label.split('—')[1]?.trim() ?? room.label}
        </div>
      </div>

      {/* Bottom progress ticks */}
      <div style={{
        position: 'fixed', bottom: '1.8rem', left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex', gap: '0.5rem', alignItems: 'center',
        zIndex: 20, ...F,
      }}>
        {ROOM_ZONES.map(r => {
          const active = r.id === room.id;
          const passed = progress > r.tRange[1];
          return (
            <div
              key={r.id}
              onClick={() => onRoomJump((r.tRange[0] + r.tRange[1]) / 2)}
              style={{
                width: active ? 24 : 6,
                height: 2,
                background: active
                  ? '#6F1028'
                  : passed
                    ? 'rgba(111,16,40,0.35)'
                    : 'rgba(26,22,20,0.15)',
                transition: 'width 0.3s ease, background 0.3s ease',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            />
          );
        })}
      </div>

      {/* Bottom-left minimap */}
      <div style={{
        position: 'fixed', bottom: '1.8rem', left: '2rem',
        zIndex: 20, ...F,
      }}>
        <svg width={48} height={120} viewBox="0 0 48 120">
          {/* Gallery spine */}
          <line x1={24} y1={4} x2={24} y2={116} stroke="rgba(26,22,20,0.15)" strokeWidth={1} />
          {ROOM_ZONES.map((r, i) => {
            const y = 4 + (i / (ROOM_ZONES.length - 1)) * 112;
            const active = r.id === room.id;
            const passed = progress > r.tRange[1];
            return (
              <g key={r.id}
                style={{ cursor: 'pointer', pointerEvents: 'auto' }}
                onClick={() => onRoomJump((r.tRange[0] + r.tRange[1]) / 2)}
              >
                <circle
                  cx={24} cy={y} r={active ? 5 : 3}
                  fill={active ? '#6F1028' : passed ? 'rgba(111,16,40,0.45)' : 'rgba(26,22,20,0.18)'}
                />
              </g>
            );
          })}
          {/* Camera dot */}
          <circle
            cx={24}
            cy={4 + progress * 112}
            r={2}
            fill="#C8A96E"
          />
        </svg>
      </div>
    </>
  );
}
