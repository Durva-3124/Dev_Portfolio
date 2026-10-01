import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiMapPin, FiChevronDown } from 'react-icons/fi';
import MagneticButton from '@/components/ui/MagneticButton';
import SceneCanvas from '@/three/SceneCanvas';
import SceneFallback from '@/three/SceneFallback';
import Hero3DScene from '@/three/Hero3DScene';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hero } from '@/data';
import { useTypewriter } from '@/hooks/useTypewriter';

export default function Hero() {
  const reduced = useReducedMotion();
  const role = useTypewriter(hero.roles, 2200, 60);

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center py-24">
        {/* Text column */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="order-2 md:order-1 space-y-6"
        >
          <p className="text-accent-tint font-medium tracking-widest uppercase text-sm">{hero.label}</p>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-white leading-tight">
            {hero.name}
          </h1>
          <div className="h-10 flex items-center">
            <span className="text-2xl text-accent-secondary font-heading">{role}<span className="animate-pulse">|</span></span>
          </div>
          {hero.oneLiner && (
            <p className="text-white/70 text-lg max-w-md leading-relaxed">{hero.oneLiner}</p>
          )}
          <div className="flex flex-wrap gap-4 pt-2">
            <MagneticButton>
              <a href="#projects" className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-tint transition-colors">
                View Projects
              </a>
            </MagneticButton>
            <MagneticButton>
              <a href="#contact" className="px-6 py-3 border border-accent text-accent-tint rounded-lg font-medium hover:bg-accent/10 transition-colors">
                Get in Touch
              </a>
            </MagneticButton>
          </div>
          <div className="flex items-center gap-5 pt-2">
            <a href={hero.socials.github} target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent-tint transition-colors">
              <FiGithub size={22} />
            </a>
            <a href={hero.socials.linkedin} target="_blank" rel="noreferrer" className="text-white/60 hover:text-accent-tint transition-colors">
              <FiLinkedin size={22} />
            </a>
            <span className="flex items-center gap-1 text-white/40 text-sm">
              <FiMapPin size={14} /> {hero.location}
            </span>
          </div>
        </motion.div>

        {/* 3D column */}
        <div className="order-1 md:order-2 h-[420px] md:h-[520px] w-full">
          {reduced ? (
            <SceneFallback />
          ) : (
            <Suspense fallback={<SceneFallback />}>
              <SceneCanvas>
                <Hero3DScene />
              </SceneCanvas>
            </Suspense>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.a
        href="#about"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-accent-tint transition-colors"
      >
        <FiChevronDown size={28} />
      </motion.a>
    </section>
  );
}
