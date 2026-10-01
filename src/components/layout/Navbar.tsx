import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaSun,
  FaMoon,
  FaFileDownload,
  FaMapPin,
} from 'react-icons/fa';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useTheme } from '@/hooks/useTheme';
import { hero } from '@/data';

const NAV_SECTIONS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

export function Navbar() {
  const { activeSectionId } = useActiveSection();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[rgba(13,7,9,0.75)] border-b border-[rgba(194,39,79,0.15)] px-6 py-3 md:px-10">
        <div className="flex justify-between items-center">
          <div className="rounded-full w-10 h-10 flex items-center justify-center border border-accentTint/30">
            <span className="gradient-text font-heading font-bold text-lg">DP</span>
          </div>

          <div className="md:flex hidden items-center gap-8">
            {NAV_SECTIONS.map((section) => {
              const isActive = activeSectionId === section.id;
              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(section.id);
                  }}
                  className={`relative font-medium transition-colors duration-300 ${
                    isActive
                      ? 'text-accentTint'
                      : 'text-gray-300 hover:text-accentTint'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 border-b-2 border-accentTint" />
                  )}
                  {section.label}
                </a>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full glass flex items-center justify-center text-gray-300 hover:text-accentTint transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <FaSun size={16} /> : <FaMoon size={16} />}
            </button>

            <a
              href="/resume.pdf"
              download
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-br from-accent to-accentTint text-white font-medium hover:shadow-glow transition-all"
            >
              <FaFileDownload size={14} />
              Resume
            </a>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-10 h-10 rounded-full glass flex items-center justify-center text-gray-300 hover:text-accentTint transition-all"
              aria-label="Open menu"
            >
              <FaBars size={18} />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-backgroundDark/98 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center justify-center gap-8 h-full relative px-6">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-5 right-6 w-10 h-10 rounded-full glass flex items-center justify-center text-gray-300 hover:text-accentTint transition-all"
                aria-label="Close menu"
              >
                <FaTimes size={18} />
              </button>

              <div className="rounded-full w-16 h-16 flex items-center justify-center border border-accentTint/30 mb-4">
                <span className="gradient-text font-heading font-bold text-2xl">DP</span>
              </div>

              {NAV_SECTIONS.map((section, idx) => {
                const isActive = activeSectionId === section.id;
                return (
                  <motion.a
                    key={section.id}
                    href={`#${section.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * idx }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(section.id);
                    }}
                    className={`text-2xl font-heading font-medium transition-colors duration-300 ${
                      isActive
                        ? 'text-accentTint'
                        : 'text-gray-200 hover:text-accentTint'
                    }`}
                  >
                    {section.label}
                  </motion.a>
                );
              })}

              <div className="flex gap-5 mt-8">
                <a
                  href={hero.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-accentTint transition-colors"
                  aria-label="GitHub"
                >
                  <FaGithub size={22} />
                </a>
                <a
                  href={hero.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-accentTint transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={22} />
                </a>
                <a
                  href={`mailto:${hero.socials.email}`}
                  className="text-gray-400 hover:text-accentTint transition-colors"
                  aria-label="Email"
                >
                  <FaEnvelope size={22} />
                </a>
              </div>

              <div className="flex items-center gap-2 text-gray-500 text-sm mt-4">
                <FaMapPin size={14} />
                <span>{hero.location}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
