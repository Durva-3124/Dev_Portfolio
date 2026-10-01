import { useEffect, useState, type FC } from 'react';
import { useProgress } from '@react-three/drei';
import { AnimatePresence, motion } from 'framer-motion';

interface Preloader3DProps {
  finished: boolean;
  onFinished?: () => void;
}

const Preloader3D: FC<Preloader3DProps> = ({ finished, onFinished }) => {
  const { progress } = useProgress();
  const [shouldShow, setShouldShow] = useState(true);
  const complete = finished || progress >= 100;

  useEffect(() => {
    if (complete) {
      const fadeTimer = setTimeout(() => {
        setShouldShow(false);
      }, 800);
      return () => clearTimeout(fadeTimer);
    }
  }, [complete]);

  useEffect(() => {
    if (!shouldShow && onFinished) {
      onFinished();
    }
  }, [shouldShow, onFinished]);

  const circumference = 2 * Math.PI * 72;
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <AnimatePresence mode="wait">
      {shouldShow && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-backgroundDark"
        >
          <svg width="160" height="160" viewBox="0 0 160 160">
            <defs>
              <linearGradient id="dp-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#800020" />
                <stop offset="55%" stopColor="#c2274f" />
                <stop offset="100%" stopColor="#e0b878" />
              </linearGradient>
            </defs>

            <circle cx="80" cy="80" r="72" fill="rgba(255,255,255,0.03)" />

            <circle
              cx="80"
              cy="80"
              r="72"
              fill="none"
              stroke="url(#dp-gradient)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 0.3s ease' }}
            />

            <text
              x="80"
              y="80"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="52"
              fontWeight="bold"
              fontFamily="Sora, Space Grotesk, sans-serif"
              fill="url(#dp-gradient)"
            >
              DP
            </text>
          </svg>

          <div className="mt-8 h-1 w-64 rounded bg-[rgba(194,39,79,0.2)]">
            <div
              className="h-full rounded bg-gradient-to-r from-accent via-accentTint to-accentSecondary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Loading portfolio... {Math.round(progress)}%
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader3D;
