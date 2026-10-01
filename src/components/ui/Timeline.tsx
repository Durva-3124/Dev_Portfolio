import type { ReactNode } from 'react';
import { Children } from 'react';

interface TimelineProps {
  children: ReactNode;
}

export function Timeline({ children }: TimelineProps) {
  const childrenArray = Children.toArray(children);

  return (
    <div className="relative py-8 pl-4 md:pl-0">
      <div className="absolute left-4 md:left-1/2 w-0.5 bg-gradient-to-b from-accent via-accentTint to-accentSecondary h-full -translate-x-1/2" />

      {childrenArray.map((child, index) => {
        const isEven = index % 2 === 0;

        return (
          <div
            key={index}
            className={`relative mb-12 last:mb-0 ${
              isEven
                ? 'md:pr-[50%] pr-0 md:translate-x-[-40px] pl-12 md:pl-0 md:flex md:justify-end'
                : 'pl-4 md:pl-[50%] md:translate-x-[40px]'
            }`}
          >
            <div
              className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-accent to-accentTint border-4 border-backgroundDark -translate-x-1/2 top-6 z-10"
            />
            <div className="lg:relative w-full md:w-auto">{child}</div>
          </div>
        );
      })}
    </div>
  );
}

export default Timeline;
