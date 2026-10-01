import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import TiltCard from '@/components/ui/TiltCard';
import ProjectModal from '@/components/ui/ProjectModal';
import { projects } from '@/data';

type Project = typeof projects[number];

export default function Projects() {
  const [modal, setModal] = useState<Project | null>(null);

  return (
    <section id="projects" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-heading font-bold text-white mb-16 text-center"
        >
          Things I've made
        </motion.h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <TiltCard className="glass-card h-full p-5 flex flex-col gap-4">
                <div>
                  <span className="text-xs px-2 py-1 bg-accent/20 text-accent-tint rounded border border-accent/30">{p.role}</span>
                  <h3 className="text-xl font-heading font-bold text-white mt-3">{p.title}</h3>
                  <p className="text-white/60 text-sm mt-2 line-clamp-3">{p.description}</p>
                </div>
                <div className="flex flex-wrap gap-1 mt-auto">
                  {p.tags.slice(0, 4).map(t => (
                    <span key={t} className="px-2 py-0.5 text-xs bg-surface/50 text-white/60 rounded">{t}</span>
                  ))}
                  {p.tags.length > 4 && <span className="text-xs text-white/40">+{p.tags.length - 4}</span>}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setModal(p)}
                    className="flex-1 py-2 text-sm bg-accent/20 hover:bg-accent/40 text-accent-tint rounded-lg transition-colors"
                  >
                    Details
                  </button>
                  <a href="#" className="p-2 border border-accent/30 text-white/50 hover:text-accent-tint rounded-lg transition-colors"><FiGithub size={16} /></a>
                  <a href="#" className="p-2 border border-accent/30 text-white/50 hover:text-accent-tint rounded-lg transition-colors"><FiExternalLink size={16} /></a>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
      <ProjectModal project={modal} onClose={() => setModal(null)} />
    </section>
  );
}
