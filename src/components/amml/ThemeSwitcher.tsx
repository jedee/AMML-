import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { ThemeMode } from '../../lib/theme';

interface ThemeSwitcherProps {
  variant?: 'compact' | 'expanded' | 'segmented';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ 
  variant = 'segmented',
  className = '' 
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme, isDark } = useSystemTheme();

  if (variant === 'compact') {
    return (
      <button
        type="button"
        id="btn-compact-theme-toggle"
        onClick={toggleTheme}
        className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-2 ${
          isDark 
            ? 'bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800' 
            : 'bg-white border-slate-200 text-sky-600 hover:bg-slate-50 shadow-xs'
        } ${className}`}
        title={`Current mode: ${resolvedTheme.toUpperCase()} (Click to switch to ${isDark ? 'Light' : 'Dark'})`}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        <span className="font-mono text-[10px] font-bold uppercase tracking-wider hidden sm:inline">
          {resolvedTheme}
        </span>
      </button>
    );
  }

  const options: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
    { mode: 'light', label: 'Light', icon: <Sun className="h-3.5 w-3.5" /> },
    { mode: 'dark', label: 'Dark', icon: <Moon className="h-3.5 w-3.5" /> },
    { mode: 'system', label: 'System', icon: <Laptop className="h-3.5 w-3.5" /> },
  ];

  return (
    <div 
      id="theme-switcher-segmented"
      className={`inline-flex items-center p-1 bg-amml-surface2 border border-amml-line rounded-lg ${className}`}
      role="radiogroup"
      aria-label="Theme mode selector"
    >
      {options.map((opt) => {
        const isActive = theme === opt.mode;
        return (
          <button
            key={opt.mode}
            type="button"
            id={`theme-btn-${opt.mode}`}
            onClick={() => setTheme(opt.mode)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer select-none ${
              isActive
                ? 'bg-amml-blue text-white shadow-sm font-bold'
                : 'text-amml-muted hover:text-amml-text hover:bg-amml-surface3'
            }`}
            role="radio"
            aria-checked={isActive}
            title={`Switch theme to ${opt.label} mode`}
          >
            {opt.icon}
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};
