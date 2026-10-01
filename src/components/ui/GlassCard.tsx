import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function GlassCard({ children, className = '', hoverable = false }: GlassCardProps) {
  return (
    <div
      className={`glass rounded-2xl transition-all duration-300 ${
        hoverable ? 'glass-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default GlassCard;
