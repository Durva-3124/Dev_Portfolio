import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGithub, FiExternalLink } from 'react-icons/fi';

interface Project { title: string; role: string; description: string; tags: string[]; }
interface Props { project: Project | null; onClose: () => void; }

export default function ProjectModal({ project, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="glass-card max-w-lg w-full p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-heading font-bold text-white">{project.title}</h3>
                <span className="text-accent-tint text-sm">{project.role}</span>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white"><FiX size={20} /></button>
            </div>
            <p className="text-white/70 leading-relaxed">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.tags.map(t => (
                <span key={t} className="px-2 py-1 text-xs bg-accent/20 text-accent-tint rounded border border-accent/30">{t}</span>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <a href="#" className="flex items-center gap-2 px-4 py-2 border border-accent/40 text-white/70 rounded-lg hover:border-accent-tint hover:text-accent-tint transition-colors text-sm">
                <FiGithub size={14} /> GitHub
              </a>
              <a href="#" className="flex items-center gap-2 px-4 py-2 border border-accent/40 text-white/70 rounded-lg hover:border-accent-tint hover:text-accent-tint transition-colors text-sm">
                <FiExternalLink size={14} /> Live
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
