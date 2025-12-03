import { useEffect } from 'react';
import { useAppStore, usePreferences } from '@/store/app-store';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const preferences = usePreferences();
  const updatePreferences = useAppStore((state) => state.updatePreferences);

  const theme = preferences?.theme_mode ?? 'light';

  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    updatePreferences({ theme_mode: newTheme });
  };

  return { theme, setTheme };
}

// Get the resolved theme (actual light/dark value, not 'system')
export function useResolvedTheme(): 'light' | 'dark' {
  const preferences = usePreferences();
  const theme = preferences?.theme_mode ?? 'light';

  if (theme === 'system') {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  return theme;
}
