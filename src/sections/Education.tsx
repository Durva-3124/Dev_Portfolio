import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { education } from '@/data';

export default function Education() {
  return (
    <section id="education" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-heading font-bold text-white mb-16 text-center"
        >
          Education
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {education.map((edu, i) => (
            <motion.div
              key={edu.degree}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-5 h-full flex flex-col gap-3">
                <div>
                  <h3 className="text-white font-semibold font-heading">{edu.degree}</h3>
                  <p className="text-white/50 text-sm mt-1">{edu.institution}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="px-2 py-1 text-xs bg-accent/20 text-accent-tint rounded border border-accent/30 font-medium">
                    {edu.score}
                  </span>
                  {'honors' in edu && edu.honors && (
                    <span className="px-2 py-1 text-xs bg-accent-secondary/20 text-accent-secondary rounded border border-accent-secondary/30">
                      {edu.honors}
                    </span>
                  )}
                  {edu.period && (
                    <span className="px-2 py-1 text-xs bg-white/5 text-white/40 rounded">{edu.period}</span>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
