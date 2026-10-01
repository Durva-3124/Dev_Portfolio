import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus } from 'react-icons/fi';
import SceneCanvas from '@/three/SceneCanvas';
import Avatar from '@/three/Avatar';
import SpeechBubble from '@/components/ui/SpeechBubble';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { personal } from '@/data';

const sectionQuotes: Record<string, string> = {
  contact: "Let's talk!",
};

export default function FloatingWidget() {
  const [minimized, setMinimized] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const activeSection = useActiveSection();
  const reduced = useReducedMotion();

  const handleAvatarClick = () => {
    if (reduced) return;
    const quote = sectionQuotes[activeSection] ??
      personal.avatarQuotes[Math.floor(Math.random() * personal.avatarQuotes.length)];
    setBubble(quote);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative w-[180px] h-[180px] glass-card overflow-hidden cursor-pointer"
            onClick={handleAvatarClick}
          >
            {bubble && <SpeechBubble text={bubble} onDismiss={() => setBubble(null)} />}
            <Suspense fallback={null}>
              <SceneCanvas>
                <Avatar section={activeSection} />
              </SceneCanvas>
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setMinimized(m => !m)}
        className="mt-2 ml-auto flex items-center justify-center w-8 h-8 glass-card text-white/60 hover:text-accent-tint transition-colors"
      >
        {minimized ? <FiPlus size={14} /> : <FiMinus size={14} />}
      </button>
    </div>
  );
}
