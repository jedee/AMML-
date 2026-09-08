export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_KEY = 'amml_theme';

export function getResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // default to dark in server/fallback
  }
  return mode;
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved as ThemeMode;
    }
  } catch (e) {
    console.warn('Failed to read theme from localStorage', e);
  }
  return 'dark'; // Default preference
}

export function applyTheme(mode: ThemeMode): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  
  const resolved = getResolvedTheme(mode);
  const root = document.documentElement;
  const body = document.body;

  if (resolved === 'dark') {
    root.classList.add('dark');
    body.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
    body.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    body.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    body.setAttribute('data-theme', 'light');
  }

  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch (e) {
    console.warn('Failed to save theme to localStorage', e);
  }

  // Dispatch custom window event for reactive updates across components
  window.dispatchEvent(new CustomEvent('amml-theme-change', { detail: { mode, resolved } }));

  return resolved;
}
