import { useEffect, useState, useCallback } from 'react';
import { ThemeMode, getStoredTheme, getResolvedTheme, applyTheme } from '../lib/theme';

export function useSystemTheme() {
  const [theme, setThemeState] = useState<ThemeMode>(() => getStoredTheme());
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => getResolvedTheme(getStoredTheme()));

  const setTheme = useCallback((newMode: ThemeMode) => {
    setThemeState(newMode);
    const actual = applyTheme(newMode);
    setResolvedTheme(actual);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: ThemeMode = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  // Sync with document state and event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply on initial mount
    const actual = applyTheme(theme);
    setResolvedTheme(actual);

    const handleThemeChange = (e: Event) => {
      const customEv = e as CustomEvent<{ mode: ThemeMode; resolved: 'light' | 'dark' }>;
      if (customEv.detail) {
        setThemeState(customEv.detail.mode);
        setResolvedTheme(customEv.detail.resolved);
      }
    };

    const handleSystemChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const actual = e.matches ? 'dark' : 'light';
        applyTheme('system');
        setResolvedTheme(actual);
      }
    };

    const mediaQuery = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    
    window.addEventListener('amml-theme-change', handleThemeChange);
    window.addEventListener('storage', (e) => {
      if (e.key === 'amml_theme' && e.newValue) {
        const valid = e.newValue as ThemeMode;
        setThemeState(valid);
        setResolvedTheme(applyTheme(valid));
      }
    });

    if (mediaQuery) {
      mediaQuery.addEventListener('change', handleSystemChange);
    }

    return () => {
      window.removeEventListener('amml-theme-change', handleThemeChange);
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleSystemChange);
      }
    };
  }, [theme]);

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    toggleTheme,
    setTheme,
  };
}

