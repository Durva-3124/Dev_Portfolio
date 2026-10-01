import { motion, useScroll } from 'framer-motion';
import { FaGithub, FaLinkedin, FaEnvelope, FaChevronUp } from 'react-icons/fa';
import { hero } from '@/data';

export function Footer() {
  const { scrollY } = useScroll();

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-24 pt-16 pb-10 px-6 md:px-10 border-t border-[rgba(194,39,79,0.15)]">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-sm text-gray-400">
          © 2026 Durva Pawar
        </div>

        <div className="flex gap-5">
          <a
            href={hero.socials.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-accentTint transition-colors duration-300"
            aria-label="GitHub"
          >
            <FaGithub size={20} />
          </a>
          <a
            href={hero.socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-accentTint transition-colors duration-300"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={20} />
          </a>
          <a
            href={`mailto:${hero.socials.email}`}
            className="text-gray-400 hover:text-accentTint transition-colors duration-300"
            aria-label="Email"
          >
            <FaEnvelope size={20} />
          </a>
        </div>

        <motion.button
          onClick={handleBackToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: scrollY.get() > 400 ? 1 : 0,
            scale: scrollY.get() > 400 ? 1 : 0.8,
            pointerEvents: scrollY.get() > 400 ? 'auto' : 'none',
          }}
          transition={{ duration: 0.2 }}
          className="rounded-full w-10 h-10 glass glass-hover flex items-center justify-center text-gray-300 hover:text-accentTint transition-all"
          aria-label="Back to top"
        >
          <FaChevronUp size={16} />
        </motion.button>
      </div>
    </footer>
  );
}

export default Footer;
