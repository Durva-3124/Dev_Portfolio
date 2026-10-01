import { useEffect, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { projects } from '@/data';
import type { ArtworkDef } from './constants';

interface Props {
  artwork: ArtworkDef | null;
  onReturn: () => void;
}

const s: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 30,
    overflowY: 'auto',
    background: '#F2EFE7',
    color: '#181818',
    fontFamily: '"Helvetica Neue", Inter, Arial, sans-serif',
  },
  content: {
    width: 'min(1100px, 88vw)',
    margin: '0 auto',
    padding: '10vh 0 14vh',
  },
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    color: '#181818',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    marginBottom: '8vh',
    opacity: 0.55,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.28em',
    textTransform: 'uppercase' as const,
    color: '#800020',
    marginBottom: '1.2rem',
  },
  title: {
    fontSize: 'clamp(48px, 8vw, 120px)',
    fontWeight: 400,
    lineHeight: 0.88,
    letterSpacing: '-0.055em',
    marginBottom: '4vh',
  },
  role: {
    fontSize: 13,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: '#888',
    marginBottom: '6vh',
  },
  divider: {
    width: 40,
    height: 1,
    background: '#181818',
    opacity: 0.2,
    margin: '4vh 0',
  },
  body: {
    fontSize: 'clamp(15px, 1.6vw, 18px)',
    lineHeight: 1.75,
    color: '#333',
    maxWidth: 680,
    marginBottom: '6vh',
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: '8vh',
  },
  tag: {
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
    color: '#181818',
    border: '1px solid rgba(24,24,24,0.25)',
    padding: '5px 12px',
  },
  canvas: {
    width: '100%',
    aspectRatio: '16/7',
    background: '#E4DED3',
    marginBottom: '8vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#A9A197',
    fontSize: 12,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
  },
};

export default function ProjectExperience({ artwork, onReturn }: Props) {
  const project = artwork
    ? projects.find((p) => p.slug === artwork.slug) ?? null
    : null;

  // Escape key returns to gallery
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onReturn();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onReturn]);

  return (
    <AnimatePresence>
      {artwork && project && (
        <motion.div
          key={artwork.id}
          style={s.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        >
          <div style={s.content}>
            {/* Back button */}
            <motion.button
              style={s.back}
              onClick={onReturn}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 0.55, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ opacity: 1 }}
            >
              ← Return to gallery
            </motion.button>

            {/* Eyebrow */}
            <motion.p
              style={s.eyebrow}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {project.role}
            </motion.p>

            {/* Title */}
            <motion.h1
              style={s.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.55 }}
            >
              {project.title}
            </motion.h1>

            {/* Visual canvas placeholder */}
            <motion.div
              style={s.canvas}
              initial={{ opacity: 0, scaleX: 0.96 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Project Visual
            </motion.div>

            <div style={s.divider} />

            {/* Description */}
            <motion.p
              style={s.body}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {project.description}
            </motion.p>

            {/* Tags */}
            <motion.div
              style={s.tagRow}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {project.tags.map((tag) => (
                <span key={tag} style={s.tag}>{tag}</span>
              ))}
            </motion.div>

            {/* Links */}
            <motion.div
              style={{ display: 'flex', gap: 24 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
            >
              <a
                href="#"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#181818',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(24,24,24,0.3)',
                  paddingBottom: 2,
                }}
              >
                GitHub ↗
              </a>
              <a
                href="#"
                style={{
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#181818',
                  textDecoration: 'none',
                  borderBottom: '1px solid rgba(24,24,24,0.3)',
                  paddingBottom: 2,
                }}
              >
                Live Demo ↗
              </a>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
