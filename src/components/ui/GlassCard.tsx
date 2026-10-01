import { forwardRef, type ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className = '', hoverable = false }, ref) => (
    <div
      ref={ref}
      className={`glass rounded-2xl transition-all duration-300 ${hoverable ? 'glass-hover cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
export { GlassCard };
