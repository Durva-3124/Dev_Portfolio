import { motion } from 'framer-motion';
import { certifications } from '@/data';

export default function Certifications() {
  return (
    <section id="certifications" className="py-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-heading font-bold text-white mb-16 text-center"
        >
          Certifications & Workshops
        </motion.h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {certifications.map((cert, i) => (
            <motion.div
              key={cert.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass-card p-4 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-secondary flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                {cert.issuer.charAt(0)}
              </div>
              <div>
                <p className="text-white text-sm font-medium leading-snug">{cert.name}</p>
                <p className="text-white/40 text-xs mt-1">{cert.issuer}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
