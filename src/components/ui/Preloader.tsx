import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '@react-three/drei';

export default function Preloader() {
  const { progress } = useProgress();
  const [done, setDone] = useState(() => sessionStorage.getItem('preloader_done') === '1');

  useEffect(() => {
    if (progress >= 100 && !done) {
      const t = setTimeout(() => {
        setDone(true);
        sessionStorage.setItem('preloader_done', '1');
      }, 800);
      return () => clearTimeout(t);
    }
  }, [progress, done]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="mb-6">
            <defs>
              <linearGradient id="dpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#800020" />
                <stop offset="100%" stopColor="#e0b878" />
              </linearGradient>
              <clipPath id="dpClip">
                <rect x="0" y={80 - (progress / 100) * 80} width="80" height="80" />
              </clipPath>
            </defs>
            <text x="50%" y="68" textAnchor="middle" fontSize="56" fontWeight="bold" fontFamily="serif" fill="rgba(255,255,255,0.1)">DP</text>
            <text x="50%" y="68" textAnchor="middle" fontSize="56" fontWeight="bold" fontFamily="serif" fill="url(#dpGrad)" clipPath="url(#dpClip)">DP</text>
          </svg>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent to-accent-secondary rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/30 text-sm mt-3">{Math.round(progress)}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
