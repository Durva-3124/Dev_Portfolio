import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import { personal } from '@/data';

const iconMap: Record<string, string> = { palette: '🎨', music: '🎵', moon: '🌙' };

export default function BeyondCode() {
  if (!personal.interests.length) return null;

  return (
    <section id="beyond-code" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-heading font-bold text-white mb-16 text-center"
        >
          Beyond the code
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {personal.interests.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="p-6 text-center space-y-3">
                <div className="text-4xl">{iconMap[item.icon] ?? '✨'}</div>
                <h3 className="text-white font-semibold font-heading">{item.name}</h3>
                {item.desc && <p className="text-white/50 text-sm">{item.desc}</p>}
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
