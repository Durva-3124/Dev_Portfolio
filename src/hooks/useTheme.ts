import { useCallback, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export function useTheme(): UseThemeReturn {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  });

  const applyTheme = useCallback((nextTheme: Theme) => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reducedMotion) {
      root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    }

    root.classList.remove('dark', 'light');
    root.classList.add(nextTheme);

    if (!reducedMotion) {
      const clear = window.setTimeout(() => {
        root.style.transition = '';
        window.clearTimeout(clear);
      }, 300);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback((nextTheme: Theme) => {
    localStorage.setItem('theme', nextTheme);
    setThemeState(nextTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return {
    theme,
    toggleTheme,
    setTheme,
  };
}
