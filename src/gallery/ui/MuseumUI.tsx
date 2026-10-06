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

// Short label for aria — strip "Room 0N — " prefix.
function shortLabel(zone: RoomZone): string {
  return zone.label.split('—')[1]?.trim() ?? zone.label;
}

export default function MuseumUI({ progress, onRoomJump }: Props) {
  const room = currentRoom(progress);

  return (
    <>
      {/* Top-right room name — purely decorative, aria-hidden */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed', top: '3.8rem', right: '2rem',
          zIndex: 20, textAlign: 'right', ...F,
        }}
      >
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
          {shortLabel(room)}
        </div>
      </div>

      {/* Bottom progress ticks — each is a ≥ 44 × 44 px button */}
      <nav
        aria-label="Jump to room"
        style={{
          position: 'fixed', bottom: '1.8rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center',
          zIndex: 20,
          pointerEvents: 'auto',
        }}
      >
        {ROOM_ZONES.map(r => {
          const active = r.id === room.id;
          const passed = progress > r.tRange[1];
          return (
            <button
              key={r.id}
              onClick={() => onRoomJump((r.tRange[0] + r.tRange[1]) / 2)}
              aria-label={`Go to ${shortLabel(r)}`}
              aria-current={active ? 'true' : undefined}
              style={{
                // 44 × 44 hit area; the visible tick is centred inside it.
                width: 44, height: 44,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0,
                fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
              }}
            >
              <span style={{
                display: 'block',
                width: active ? 24 : 6,
                height: 2,
                background: active
                  ? '#6F1028'
                  : passed
                    ? 'rgba(111,16,40,0.35)'
                    : 'rgba(26,22,20,0.15)',
                transition: 'width 0.3s ease, background 0.3s ease',
                borderRadius: 1,
              }} />
            </button>
          );
        })}
      </nav>

      {/* Bottom-left minimap — dots are buttons */}
      <nav
        aria-label="Gallery minimap"
        style={{
          position: 'fixed', bottom: '1.8rem', left: '2rem',
          zIndex: 20,
          fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
          userSelect: 'none',
          pointerEvents: 'auto',
        } as CSSProperties}
      >
        <svg
          width={48}
          height={120}
          viewBox="0 0 48 120"
          aria-hidden="true"
          style={{ display: 'block', overflow: 'visible' }}
        >
          {/* Gallery spine */}
          <line x1={24} y1={4} x2={24} y2={116} stroke="rgba(26,22,20,0.15)" strokeWidth={1} />

          {ROOM_ZONES.map((r, i) => {
            const y = 4 + (i / (ROOM_ZONES.length - 1)) * 112;
            const active = r.id === room.id;
            const passed = progress > r.tRange[1];
            return (
              <g key={r.id}>
                {/* Invisible 44 × 44 hit rect centred on the dot */}
                <rect
                  x={24 - 22} y={y - 22} width={44} height={44}
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  role="button"
                  aria-label={`Go to ${shortLabel(r)}`}
                  aria-current={active ? 'true' : undefined}
                  tabIndex={0}
                  onClick={() => onRoomJump((r.tRange[0] + r.tRange[1]) / 2)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onRoomJump((r.tRange[0] + r.tRange[1]) / 2);
                    }
                  }}
                />
                <circle
                  cx={24} cy={y} r={active ? 5 : 3}
                  fill={active ? '#6F1028' : passed ? 'rgba(111,16,40,0.45)' : 'rgba(26,22,20,0.18)'}
                  style={{ pointerEvents: 'none' }}
                />
              </g>
            );
          })}

          {/* Camera dot — purely decorative */}
          <circle
            cx={24}
            cy={4 + progress * 112}
            r={2}
            fill="#C8A96E"
            aria-hidden="true"
          />
        </svg>
      </nav>
    </>
  );
}
