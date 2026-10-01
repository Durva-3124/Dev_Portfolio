import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { text: string; onDismiss: () => void; }

export default function SpeechBubble({ text, onDismiss }: Props) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const timer = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) clearInterval(timer);
    }, 40);
    const dismiss = setTimeout(onDismiss, 4000);
    return () => { clearInterval(timer); clearTimeout(dismiss); };
  }, [text, onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="absolute bottom-full right-0 mb-3 glass-card px-3 py-2 text-sm text-white/90 max-w-[180px] whitespace-normal"
      >
        {displayed}
        <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-surface/80 rotate-45 border-r border-b border-white/10" />
      </motion.div>
    </AnimatePresence>
  );
}
