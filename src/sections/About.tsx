import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { about, personal } from '@/data';
import { FaBuilding, FaBookOpen, FaCompass } from 'react-icons/fa6';

function formatNumber(value: number, suffix: string): string {
  const hasDecimal = value % 1 !== 0;
  if (hasDecimal) {
    return value.toFixed(2) + suffix;
  }
  return value.toLocaleString('en-US') + suffix;
}

interface CounterProps {
  value: number;
  suffix: string;
  label: string;
}

function Counter({ value, suffix, label }: CounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <GlassCard className="p-6 text-center" ref={ref}>
      <motion.div
        className="text-4xl font-extrabold gradient-text"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isInView && (
          <AnimatedCount value={value} suffix={suffix} />
        )}
      </motion.div>
      <div className="text-sm text-gray-400 mt-2 uppercase tracking-wider">{label}</div>
    </GlassCard>
  );
}

function AnimatedCount({ value, suffix }: { value: number; suffix: string }) {
  return (
    <motion.span
      initial={{ count: 0 }}
      animate={{ count: value }}
      transition={{ duration: 2, ease: 'easeOut' }}
    >
      {({ count }) => formatNumber(count as number, suffix)}
    </motion.span>
  );
}

export function About() {
  const hasBuilding = personal.currently.building.trim() !== '';
  const hasLearning = personal.currently.learning.trim() !== '';
  const hasExploring = personal.currently.exploring.trim() !== '';
  const showCurrently = hasBuilding || hasLearning || hasExploring;

  return (
    <section id="about" className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
        A little about me
      </h2>
      <div className="w-24 h-1 bg-gradient-to-r from-accent via-accentTint to-accentSecondary mb-12" />

      <p className="text-gray-300 max-w-3xl leading-relaxed mb-12 text-lg">
        {about.text}
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {about.highlights.map((highlight, idx) => (
          <GlassCard key={idx} className="p-6" hoverable>
            <h3 className="text-xl font-heading font-bold text-accentTint mb-3">
              {highlight.title}
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {highlight.text}
            </p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12">
        {about.counters.map((counter, idx) => (
          <Counter
            key={idx}
            value={counter.value}
            suffix={counter.suffix}
            label={counter.label}
          />
        ))}
      </div>

      {showCurrently && (
        <div>
          <h4 className="text-xl font-heading font-bold mb-4">Currently</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {hasBuilding && (
              <GlassCard className="p-5" hoverable>
                <div className="flex items-center gap-2 mb-2">
                  <FaBuilding className="text-accentTint" />
                  <span className="font-semibold text-accentTint">Building</span>
                </div>
                <p className="text-gray-300 text-sm">{personal.currently.building}</p>
              </GlassCard>
            )}
            {hasLearning && (
              <GlassCard className="p-5" hoverable>
                <div className="flex items-center gap-2 mb-2">
                  <FaBookOpen className="text-accentTint" />
                  <span className="font-semibold text-accentTint">Learning</span>
                </div>
                <p className="text-gray-300 text-sm">{personal.currently.learning}</p>
              </GlassCard>
            )}
            {hasExploring && (
              <GlassCard className="p-5" hoverable>
                <div className="flex items-center gap-2 mb-2">
                  <FaCompass className="text-accentTint" />
                  <span className="font-semibold text-accentTint">Exploring</span>
                </div>
                <p className="text-gray-300 text-sm">{personal.currently.exploring}</p>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default About;
