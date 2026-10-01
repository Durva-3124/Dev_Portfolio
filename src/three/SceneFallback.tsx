import type { FC } from 'react';

interface SceneFallbackProps {
  className?: string;
  height?: string;
}

const SceneFallback: FC<SceneFallbackProps> = ({ className, height = '100%' }) => {
  return (
    <div
      className={`w-full ${className ?? ''}`}
      style={{
        minHeight: height,
        background: 'linear-gradient(135deg, #800020 0%, #c2274f 55%, #e0b878 100%)',
      }}
    >
      <div className="flex h-full flex-col items-center justify-center text-white">
        <div
          className="text-6xl font-bold"
          style={{ textShadow: '0 4px 20px rgba(0, 0, 0, 0.4)' }}
        >
          DP
        </div>
        <div className="mt-3 text-sm opacity-80">
          Interactive 3D Scene
        </div>
      </div>
    </div>
  );
};

export default SceneFallback;
