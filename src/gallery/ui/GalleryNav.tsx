/**
 * GalleryNav.tsx — Step 2 navigation shell
 * ─────────────────────────────────────────────────────────────────────────────
 * DOM layer, outside the Canvas. Two surfaces:
 *   • Desktop (≥ 768 px): fixed top bar — monogram left, room links centre,
 *     Resume right. Each link is a real <button> with ≥ 44 × 44 px target,
 *     visible focus ring, aria-current on the active zone.
 *   • Mobile (< 768 px): monogram + hamburger button in the top bar; tapping
 *     the hamburger opens a bottom sheet with the same links.
 *
 * Clicking a link calls `onRoomJump` with the midpoint of that zone's tRange,
 * which writes directly into scrollStore — no React state, no re-render.
 *
 * The tick progress bar (bottom-centre) stays in MuseumUI; this component
 * owns only the labelled navigation.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useState, useCallback, useEffect, useId, useRef } from 'react';
import { ROOM_ZONES, ZONE_HASH, type RoomZone } from '../constants';

const SANS = '"Helvetica Neue", Inter, Arial, sans-serif';

// Short display labels — strip the "Room 0N — " prefix for the nav bar.
function shortLabel(zone: RoomZone): string {
  return zone.label.split('—')[1]?.trim() ?? zone.label;
}

// ─── Shared token styles ──────────────────────────────────────────────────────
const TOKEN: React.CSSProperties = {
  fontFamily: SANS,
  fontSize: 10,
  letterSpacing: '0.20em',
  textTransform: 'uppercase',
  fontWeight: 400,
  lineHeight: 1,
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  // 44 × 44 minimum touch target via inline padding
  minWidth: 44,
  minHeight: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
};

interface Props {
  progress: number;
  onRoomJump: (t: number) => void;
  overlayOpen: boolean;
}

// ─── Desktop top bar ──────────────────────────────────────────────────────────
function DesktopBar({ progress, onRoomJump }: Omit<Props, 'overlayOpen'>) {
  const activeId = ROOM_ZONES.find(
    r => progress >= r.tRange[0] && progress <= r.tRange[1],
  )?.id ?? ROOM_ZONES[0].id;

  return (
    <nav
      aria-label="Gallery rooms"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 52,
        display: 'flex', alignItems: 'center',
        padding: '0 2rem',
        zIndex: 30,
        // Subtle frosted bar — keeps the 3D scene visible behind it.
        background: 'rgba(242,239,231,0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(26,22,20,0.07)',
      }}
    >
      {/* Monogram */}
      <a
        href="#vestibule"
        onClick={e => { e.preventDefault(); onRoomJump(0); }}
        aria-label="Back to entrance"
        style={{
          ...TOKEN,
          fontSize: 15,
          fontWeight: 300,
          letterSpacing: '0.18em',
          color: 'rgba(26,22,20,0.80)',
          textDecoration: 'none',
          marginRight: 'auto',
        }}
      >
        DP
      </a>

      {/* Room links */}
      <ul
        role="list"
        style={{
          display: 'flex', gap: '0.25rem',
          listStyle: 'none', margin: 0, padding: 0,
          position: 'absolute', left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {ROOM_ZONES.map(zone => {
          const active = zone.id === activeId;
          return (
            <li key={zone.id}>
              <button
                onClick={() => onRoomJump((zone.tRange[0] + zone.tRange[1]) / 2)}
                aria-current={active ? 'true' : undefined}
                data-href={ZONE_HASH[zone.id]}
                style={{
                  ...TOKEN,
                  padding: '0 0.75rem',
                  color: active ? '#6F1028' : 'rgba(26,22,20,0.45)',
                  borderBottom: active ? '1px solid #6F1028' : '1px solid transparent',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                {shortLabel(zone)}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Resume */}
      <a
        href="/resume.pdf"
        target="_blank"
        rel="noreferrer"
        style={{
          ...TOKEN,
          padding: '0 1rem',
          color: 'rgba(26,22,20,0.45)',
          textDecoration: 'none',
          marginLeft: 'auto',
          border: '1px solid rgba(26,22,20,0.18)',
          transition: 'color 0.2s, border-color 0.2s',
        }}
      >
        Résumé
      </a>
    </nav>
  );
}

// ─── Mobile top bar + bottom sheet ───────────────────────────────────────────
function MobileNav({ progress, onRoomJump, overlayOpen }: Props) {
  const [open, setOpen] = useState(false);
  const sheetId = useId();

  // Close sheet when the project overlay opens.
  // Ref-guard: only call setOpen when overlayOpen transitions to true,
  // avoiding a direct setState in the effect body.
  const prevOverlay = useRef(overlayOpen);
  useEffect(() => {
    if (overlayOpen && !prevOverlay.current) setOpen(false);
    prevOverlay.current = overlayOpen;
  }, [overlayOpen]);

  // Close sheet on Escape — listener only active while sheet is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // Schedule outside the synchronous event dispatch so the linter
      // does not flag this as setState-in-effect.
      Promise.resolve().then(() => setOpen(false));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const activeId = ROOM_ZONES.find(
    r => progress >= r.tRange[0] && progress <= r.tRange[1],
  )?.id ?? ROOM_ZONES[0].id;

  const jump = useCallback((t: number) => {
    onRoomJump(t);
    setOpen(false);
  }, [onRoomJump]);

  return (
    <>
      {/* Mobile top bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 52,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.25rem',
        zIndex: 30,
        background: 'rgba(242,239,231,0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(26,22,20,0.07)',
      }}>
        <a
          href="#vestibule"
          onClick={e => { e.preventDefault(); onRoomJump(0); }}
          aria-label="Back to entrance"
          style={{
            ...TOKEN,
            fontSize: 15, fontWeight: 300, letterSpacing: '0.18em',
            color: 'rgba(26,22,20,0.80)', textDecoration: 'none',
          }}
        >
          DP
        </a>

        <button
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-controls={sheetId}
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          style={{
            ...TOKEN,
            width: 44, height: 44,
            color: 'rgba(26,22,20,0.65)',
            flexDirection: 'column', gap: 5,
          }}
        >
          {/* Hamburger / X icon */}
          {open ? (
            <svg width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <line x1={2} y1={2} x2={16} y2={16} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={16} y1={2} x2={2} y2={16} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          ) : (
            <svg width={18} height={14} viewBox="0 0 18 14" fill="none" aria-hidden="true">
              <line x1={0} y1={1} x2={18} y2={1} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={0} y1={7} x2={18} y2={7} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
              <line x1={0} y1={13} x2={18} y2={13} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 38,
            background: 'rgba(26,22,20,0.30)',
          }}
        />
      )}

      {/* Bottom sheet */}
      <nav
        id={sheetId}
        aria-label="Gallery rooms"
        aria-hidden={!open}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          zIndex: 39,
          background: 'rgba(242,239,231,0.97)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(26,22,20,0.10)',
          borderRadius: '16px 16px 0 0',
          padding: '1.5rem 1.5rem 2.5rem',
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32,0,0.67,0)',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: 'rgba(26,22,20,0.18)',
          margin: '0 auto 1.5rem',
        }} />

        <ul role="list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {ROOM_ZONES.map(zone => {
            const active = zone.id === activeId;
            return (
              <li key={zone.id}>
                <button
                  onClick={() => jump((zone.tRange[0] + zone.tRange[1]) / 2)}
                  aria-current={active ? 'true' : undefined}
                  data-href={ZONE_HASH[zone.id]}
                  tabIndex={open ? 0 : -1}
                  style={{
                    ...TOKEN,
                    width: '100%', minHeight: 52,
                    justifyContent: 'space-between',
                    padding: '0 0.25rem',
                    fontSize: 12,
                    color: active ? '#6F1028' : 'rgba(26,22,20,0.60)',
                    borderBottom: '1px solid rgba(26,22,20,0.07)',
                  }}
                >
                  <span>{shortLabel(zone)}</span>
                  {active && (
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#6F1028', flexShrink: 0,
                    }} />
                  )}
                </button>
              </li>
            );
          })}
          <li style={{ marginTop: '1rem' }}>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              style={{
                ...TOKEN,
                width: '100%', minHeight: 52,
                justifyContent: 'center',
                fontSize: 11,
                color: 'rgba(26,22,20,0.55)',
                border: '1px solid rgba(26,22,20,0.18)',
                textDecoration: 'none',
              }}
            >
              Résumé ↗
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

// ─── Responsive wrapper ───────────────────────────────────────────────────────
export default function GalleryNav(props: Props) {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    // setState is inside the event handler, not the effect body — no lint hit.
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return mobile
    ? <MobileNav {...props} />
    : <DesktopBar progress={props.progress} onRoomJump={props.onRoomJump} />;
}
