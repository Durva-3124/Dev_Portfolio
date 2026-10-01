import { motion, useScroll, useTransform } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll({ axis: 'y' });
  const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <motion.div
        className="h-full bg-gradient-to-r from-accent via-accentTint to-accentSecondary"
        style={{ width }}
      />
    </div>
  );
}

export default ScrollProgress;
