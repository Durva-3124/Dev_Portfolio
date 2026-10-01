import { Suspense } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import SceneCanvas from '@/three/SceneCanvas';
import SkillSphere from '@/three/SkillSphere';
import SceneFallback from '@/three/SceneFallback';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { skills } from '@/data';

export default function Skills() {
  const reduced = useReducedMotion();

  return (
    <section id="skills" className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-heading font-bold text-white mb-16 text-center"
        >
          What I work with
        </motion.h2>

        {/* 3D Skill Sphere */}
        <div className="h-[420px] w-full mb-16">
          {reduced ? (
            <SceneFallback />
          ) : (
            <Suspense fallback={<SceneFallback />}>
              <SceneCanvas>
                <SkillSphere />
              </SceneCanvas>
            </Suspense>
          )}
        </div>

        {/* Categorized skill list */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {skills.map((group, i) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <GlassCard className="h-full p-4">
                <h3 className="text-accent-tint font-semibold text-sm mb-3 uppercase tracking-wider">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(skill => (
                    <span key={skill} className="px-2 py-1 text-xs bg-accent/20 text-white/80 rounded-md border border-accent/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
