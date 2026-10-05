/**
 * ProjectExperience.tsx — PART B.11
 * ─────────────────────────────────────────────────────────────────────────────
 * The placeholder visual is gone. The overlay shows the SAME procedurally
 * generated artwork that hangs in the museum (`getArtworkDataURL` returns the
 * exact canvas `getArtworkTexture` uploads to the GPU, so the wall and the
 * overlay can never disagree).
 *
 * Scroll: GalleryWorld's wheel/touch handlers bail out BEFORE preventDefault()
 * while `scrollStore.locked` is true, so this panel's scroller works normally.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { hero, type InstallDef } from './constants';
import { getArtworkDataURL } from './artworkTextures';

interface Props {
  install: InstallDef | null;
  onReturn: () => void;
}

const SANS = '"Helvetica Neue", Inter, Arial, sans-serif';

function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: '2.5rem' }}>
      <div style={{
        fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
        color: 'rgba(26,22,20,0.35)', marginBottom: '0.8rem',
      }}>
        {heading}
      </div>
      {children}
    </section>
  );
}

export default function ProjectExperience({ install, onReturn }: Props) {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (install) {
      setVisible(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setExpanded(true)));
    } else {
      setExpanded(false);
      const t = setTimeout(() => setVisible(false), 500);
      return () => clearTimeout(t);
    }
  }, [install]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onReturn(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onReturn]);

  // Same pixels as the artwork on the wall (PART B.11)
  const image = useMemo(() => (install ? getArtworkDataURL(install.id) : ''), [install]);

  if (!visible || !install) return null;

  const aspect = install.mount.width / install.mount.height;
  const num = String(
    install.mount.id === 'meetsync-ai' ? 1 : install.mount.id === 'bullsight' ? 2 : 3,
  ).padStart(2, '0');

  return (
    <div className="project-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: '#EDE8DF',
      clipPath: expanded ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
      transition: 'clip-path 0.55s cubic-bezier(0.76,0,0.24,1)',
      overflowY: 'auto',
      fontFamily: SANS,
    }}>
      <button onClick={onReturn} style={{
        position: 'fixed', top: '2rem', left: '2.5rem',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: 'inherit', fontSize: 11, letterSpacing: '0.22em',
        textTransform: 'uppercase', color: 'rgba(26,22,20,0.50)',
        padding: 0, zIndex: 101,
      }}>
        ← Back to Gallery
      </button>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '7rem 2.5rem 6rem' }}>
        <div style={{ fontSize: 11, letterSpacing: '0.28em', color: '#6F1028', marginBottom: '1.5rem' }}>
          {num} — SELECTED WORK
        </div>
        {image && (
          <img
            src={image}
            alt={`${install.title} artwork`}
            style={{
              display: 'block', width: '100%',
              aspectRatio: String(aspect),
              objectFit: 'cover',
              border: '1px solid rgba(26,22,20,0.10)',
              boxShadow: '0 24px 60px rgba(26,22,20,0.14)',
              marginBottom: '2.75rem',
            }}
          />
        )}

        <h1 style={{
          fontSize: 'clamp(2.6rem,6.5vw,5rem)', fontWeight: 100,
          letterSpacing: '-0.02em', color: '#1A1614',
          margin: '0 0 0.5rem', lineHeight: 1.0, textTransform: 'uppercase',
        }}>
          {install.title}
        </h1>
        <div style={{
          fontSize: 12, letterSpacing: '0.18em', color: 'rgba(26,22,20,0.45)',
          marginBottom: '2.5rem', textTransform: 'uppercase',
        }}>
          {install.role}
        </div>
        <div style={{ width: 50, height: 1, background: '#6F1028', marginBottom: '2.5rem' }} />

        <Section heading="Overview">
          <p style={{ fontSize: 15, lineHeight: 1.8, color: '#2A2826', fontWeight: 300, maxWidth: 640 }}>
            {install.desc}
          </p>
        </Section>

        <Section heading="Technology">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {install.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                color: '#1A1614', border: '1px solid rgba(26,22,20,0.18)',
                padding: '0.3rem 0.7rem',
              }}>
                {tag}
              </span>
            ))}
          </div>
        </Section>

        <div style={{ width: '100%', height: 1, background: 'rgba(26,22,20,0.08)', margin: '2.5rem 0' }} />

        <div style={{ display: 'flex', gap: '2rem' }}>
          {/* Phase 3, Step 1: `src/data/portfolio.ts` has NO per-project
              repository URL field, so the GitHub link is hidden here rather
              than pointed at the GitHub *profile* root (hero.socials.github),
              which would misrepresent a specific project. */}
          <a href={`mailto:${hero.socials.email}`} style={{
            fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
            color: 'rgba(26,22,20,0.45)', textDecoration: 'none',
            borderBottom: '1px solid rgba(26,22,20,0.18)', paddingBottom: '0.2rem',
          }}>
            Ask me about it ↗
          </a>
        </div>
      </div>
    </div>
  );
}