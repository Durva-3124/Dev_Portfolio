import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-8xl">🤷</div>
        <h1 className="text-6xl font-heading font-bold text-white">404</h1>
        <p className="text-white/50 text-lg">Oops, this page wandered off.</p>
        <a
          href="/"
          className="inline-block px-6 py-3 bg-accent hover:bg-accent-tint text-white rounded-lg font-medium transition-colors"
        >
          Go Home
        </a>
      </motion.div>
    </div>
  );
}
