import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { about, personal } from '@/data';
import { FaBuilding, FaBookOpen, FaCompass } from 'react-icons/fa6';

function formatNumber(value: number, suffix: string): string {
  return (value % 1 !== 0 ? value.toFixed(2) : Math.round(value).toLocaleString('en-US')) + suffix;
}

function Counter({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => formatNumber(v, suffix));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(count, value, { duration: 2, ease: 'easeOut' });
    return controls.stop;
  }, [isInView, count, value]);

  return (
    <GlassCard className="p-6 text-center" ref={ref}>
      <motion.div className="text-4xl font-extrabold gradient-text">
        <motion.span>{rounded}</motion.span>
      </motion.div>
      <div className="text-sm text-gray-400 mt-2 uppercase tracking-wider">{label}</div>
    </GlassCard>
  );
}

export function About() {
  const { building, learning, exploring } = personal.currently;
  const showCurrently = building.trim() || learning.trim() || exploring.trim();

  return (
    <section id="about" className="py-24 px-6 md:px-10 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">A little about me</h2>
      <div className="w-24 h-1 bg-gradient-to-r from-accent via-accentTint to-accentSecondary mb-12" />

      <p className="text-gray-300 max-w-3xl leading-relaxed mb-12 text-lg">{about.text}</p>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {about.highlights.map((h, i) => (
          <GlassCard key={i} className="p-6" hoverable>
            <h3 className="text-xl font-heading font-bold text-accentTint mb-3">{h.title}</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{h.text}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 md:gap-8 mb-12">
        {about.counters.map((c, i) => (
          <Counter key={i} value={c.value} suffix={c.suffix} label={c.label} />
        ))}
      </div>

      {showCurrently && (
        <div>
          <h4 className="text-xl font-heading font-bold mb-4">Currently</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {building && (
              <GlassCard className="p-5" hoverable>
                <div className="flex items-center gap-2 mb-2"><FaBuilding className="text-accentTint" /><span className="font-semibold text-accentTint">Building</span></div>
                <p className="text-gray-300 text-sm">{building}</p>
              </GlassCard>
            )}
            {learning && (
              <GlassCard className="p-5" hoverable>
                <div className="flex items-center gap-2 mb-2"><FaBookOpen className="text-accentTint" /><span className="font-semibold text-accentTint">Learning</span></div>
                <p className="text-gray-300 text-sm">{learning}</p>
              </GlassCard>
            )}
            {exploring && (
              <GlassCard className="p-5" hoverable>
                <div className="flex items-center gap-2 mb-2"><FaCompass className="text-accentTint" /><span className="font-semibold text-accentTint">Exploring</span></div>
                <p className="text-gray-300 text-sm">{exploring}</p>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default About;
