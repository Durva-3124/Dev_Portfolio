import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SceneCanvas from '@/three/SceneCanvas';
import MyDeskScene from '@/three/MyDeskScene';
import SceneFallback from '@/three/SceneFallback';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { personal } from '@/data';

type ObjKey = 'laptop' | 'mug' | 'plant';
const labels: Record<ObjKey, string> = { laptop: 'Laptop', mug: 'Coffee Mug', plant: 'Plant' };

export default function MyDesk() {
  const reduced = useReducedMotion();
  const [popup, setPopup] = useState<{ key: ObjKey } | null>(null);

  const handleClick = (key: ObjKey) => setPopup({ key });

  return (
    <section id="my-desk" className="py-24 px-6">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h2 className="text-4xl font-heading font-bold text-white mb-3">My Desk</h2>
          <p className="text-white/50">Click on objects to learn more</p>
        </motion.div>

        <div className="relative h-[420px] w-full">
          {reduced ? (
            <SceneFallback />
          ) : (
            <Suspense fallback={<SceneFallback />}>
              <SceneCanvas>
                <MyDeskScene onObjectClick={handleClick} />
              </SceneCanvas>
            </Suspense>
          )}

          <AnimatePresence>
            {popup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="absolute top-4 right-4 glass-card p-4 max-w-xs"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-accent-tint font-semibold">{labels[popup.key]}</h3>
                  <button onClick={() => setPopup(null)} className="text-white/40 hover:text-white ml-4">✕</button>
                </div>
                <p className="text-white/70 text-sm">
                  {personal.deskObjectMessages[popup.key] || `This is my ${labels[popup.key].toLowerCase()}.`}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
