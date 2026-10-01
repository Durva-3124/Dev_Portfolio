import { motion, AnimatePresence } from 'framer-motion';
import Timeline from '@/components/ui/Timeline';
import GlassCard from '@/components/ui/GlassCard';
import { experience } from '@/data';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export function Experience() {
  return (
    <section id="experience" className="max-w-5xl mx-auto py-24 px-6 md:px-10">
      <div className="mb-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 gradient-text">
          Where I&apos;ve been building
        </h2>
        <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-accent via-accentTint to-accentSecondary" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          <Timeline>
            {experience.map((exp, index) => (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard className="p-6 mb-8 relative glass-hover" hoverable>
                  <h3 className="text-xl font-bold text-accentTint mb-1">{exp.role}</h3>
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <span className="font-semibold text-accentSecondary">{exp.company}</span>
                    <span className="italic text-gray-400 text-sm">{exp.period}</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{exp.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </Timeline>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export default Experience;
