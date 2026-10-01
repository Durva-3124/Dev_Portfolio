import { useEffect, useRef, useState } from 'react';

const DEFAULT_SECTION_IDS = [
  'hero',
  'about',
  'skills',
  'experience',
  'my-desk',
  'projects',
  'education',
  'certifications',
  'contact',
];

interface UseActiveSectionReturn {
  activeSectionId: string;
  sectionRefsMap: Record<string, HTMLElement | null>;
}

export function useActiveSection(
  sectionIds: string[] = DEFAULT_SECTION_IDS,
): UseActiveSectionReturn {
  const [activeSectionId, setActiveSectionId] = useState<string>(sectionIds[0] || '');
  const [sectionRefsMap, setSectionRefsMap] = useState<Record<string, HTMLElement | null>>({});
  const sectionRefsRef = useRef<Record<string, HTMLElement | null>>({});
  const visibilityMap = useRef<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, HTMLElement | null> = {};
    sectionIds.forEach((id) => {
      map[id] = document.getElementById(id);
      visibilityMap.current[id] = 0;
    });
    sectionRefsRef.current = map;
    setSectionRefsMap(map);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          if (id) {
            visibilityMap.current[id] = entry.intersectionRatio;
          }
        });

        let maxRatio = 0;
        let topId = sectionIds[0] || '';
        sectionIds.forEach((id) => {
          const ratio = visibilityMap.current[id] || 0;
          if (ratio > maxRatio) {
            maxRatio = ratio;
            topId = id;
          }
        });

        if (maxRatio > 0) {
          setActiveSectionId(topId);
        }
      },
      {
        threshold: [0.3],
      },
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionIds]);

  return {
    activeSectionId,
    sectionRefsMap,
  };
}
