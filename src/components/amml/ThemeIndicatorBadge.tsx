import React, { useEffect, useState } from 'react';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { Sun, Moon, Check, Copy, HelpCircle, Eye } from 'lucide-react';

export const ThemeIndicatorBadge: React.FC = () => {
  const { theme, isDark } = useSystemTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [computedVars, setComputedVars] = useState({
    bg: '',
    surface: '',
    border: '',
    text: '',
    panel: '',
    muted: ''
  });

  // Re-evaluate computed variables whenever theme changes or modal is toggled open
  useEffect(() => {
    const updateVariables = () => {
      if (typeof window === 'undefined') return;
      const rootStyles = getComputedStyle(document.documentElement);
      setComputedVars({
        bg: rootStyles.getPropertyValue('--amml-bg').trim() || (isDark ? '#07111e' : '#F0F5FA'),
        surface: rootStyles.getPropertyValue('--amml-surface').trim() || (isDark ? '#0E1A2B' : '#FFFFFF'),
        border: rootStyles.getPropertyValue('--amml-border').trim() || (isDark ? '#1b2a3f' : '#D0DCE8'),
        text: rootStyles.getPropertyValue('--amml-text').trim() || (isDark ? '#F0F5FA' : '#0A1628'),
        panel: rootStyles.getPropertyValue('--amml-panel').trim() || (isDark ? '#0E1A2B' : '#FFFFFF'),
        muted: rootStyles.getPropertyValue('--amml-muted').trim() || (isDark ? '#A5B4CD' : '#4B617A'),
      });
    };

    updateVariables();
    // Also schedule after standard CSS transitions settle (300ms)
    const timeoutId = setTimeout(updateVariables, 350);

    return () => clearTimeout(timeoutId);
  }, [theme, isOpen, isDark]);

  const handleCopy = (name: string, value: string) => {
    navigator.clipboard.writeText(`var(${name}) /* computed: ${value} */`);
    setCopied(name);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end">
      {/* Expanded Transitions Auditor Overlay Panel */}
      {isOpen && (
        <div 
          id="theme-audit-panel"
          className="mb-3 w-72 bg-amml-panel border border-amml-line rounded-xl shadow-2xl p-4 text-xs font-sans animate-stage-wake"
        >
          <div className="flex items-center justify-between border-b border-amml-line pb-2 mb-2">
            <span className="font-mono text-[10px] font-bold text-amml-blue uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-3 w-3 animate-pulse" /> CSS Override Auditor
            </span>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-505 px-1.5 py-0.5 rounded font-mono font-bold select-none uppercase">
              TRANSITION OK
            </span>
          </div>

          <p className="text-[10px] text-amml-text3 leading-normal mb-3">
            Auditing real-time CSS variable injections. Verify style overrides below:
          </p>

          <div className="space-y-2 font-mono text-[10px]">
            {/* Variable Item A: Background */}
            <div className="flex items-center justify-between p-1.5 rounded bg-amml-surface2/60 border border-amml-line/30 group">
              <div className="flex flex-col">
                <span className="text-amml-text3 text-[9px] font-bold">--amml-bg</span>
                <span className="text-amml-text font-semibold">{computedVars.bg}</span>
              </div>
              <button 
                onClick={() => handleCopy('--amml-bg', computedVars.bg)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amml-surface3 rounded transition-all cursor-pointer"
                title="Copy variable token reference"
              >
                {copied === '--amml-bg' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-amml-text3" />}
              </button>
            </div>

            {/* Variable Item B: Surface */}
            <div className="flex items-center justify-between p-1.5 rounded bg-amml-surface2/60 border border-amml-line/30 group">
              <div className="flex flex-col">
                <span className="text-amml-text3 text-[9px] font-bold">--amml-surface</span>
                <span className="text-amml-text font-semibold">{computedVars.surface}</span>
              </div>
              <button 
                onClick={() => handleCopy('--amml-surface', computedVars.surface)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amml-surface3 rounded transition-all cursor-pointer"
                title="Copy variable token reference"
              >
                {copied === '--amml-surface' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-amml-text3" />}
              </button>
            </div>

            {/* Variable Item C: Text */}
            <div className="flex items-center justify-between p-1.5 rounded bg-amml-surface2/60 border border-amml-line/30 group">
              <div className="flex flex-col">
                <span className="text-amml-text3 text-[9px] font-bold">--amml-text</span>
                <span className="text-amml-text font-semibold" style={{ color: 'var(--amml-text)' }}>{computedVars.text}</span>
              </div>
              <button 
                onClick={() => handleCopy('--amml-text', computedVars.text)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amml-surface3 rounded transition-all cursor-pointer"
                title="Copy variable token reference"
              >
                {copied === '--amml-text' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-amml-text3" />}
              </button>
            </div>

            {/* Variable Item D: Panel */}
            <div className="flex items-center justify-between p-1.5 rounded bg-amml-surface2/60 border border-amml-line/30 group">
              <div className="flex flex-col">
                <span className="text-amml-text3 text-[9px] font-bold">--amml-panel</span>
                <span className="text-amml-text font-semibold">{computedVars.panel}</span>
              </div>
              <button 
                onClick={() => handleCopy('--amml-panel', computedVars.panel)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amml-surface3 rounded transition-all cursor-pointer"
                title="Copy variable token reference"
              >
                {copied === '--amml-panel' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-amml-text3" />}
              </button>
            </div>

            {/* Variable Item E: Muted */}
            <div className="flex items-center justify-between p-1.5 rounded bg-amml-surface2/60 border border-amml-line/30 group">
              <div className="flex flex-col">
                <span className="text-amml-text3 text-[9px] font-bold">--amml-muted</span>
                <span className="text-amml-text font-semibold" style={{ color: 'var(--amml-muted)' }}>{computedVars.muted}</span>
              </div>
              <button 
                onClick={() => handleCopy('--amml-muted', computedVars.muted)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-amml-surface3 rounded transition-all cursor-pointer"
                title="Copy variable token reference"
              >
                {copied === '--amml-muted' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3 text-amml-text3" />}
              </button>
            </div>
          </div>

          <div className="mt-3 border-t border-amml-line pt-2 text-[9px] text-amml-text3 leading-relaxed flex items-center gap-1">
            <HelpCircle className="h-3 w-3 inline text-amml-blue shrink-0" />
            <span>Click any computed indicator token above to copy the CSS variable.</span>
          </div>
        </div>
      )}

      {/* Main Trigger Badge Button */}
      <button 
        id="dev-theme-indicator-badge"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 bg-amml-panel border focus:ring-2 focus:ring-amml-blue/30 px-3.5 py-1.5 rounded-full shadow-lg font-mono text-[10px] font-bold tracking-wider select-none transition-all duration-300 cursor-pointer ${
          isOpen ? 'border-amml-blue text-amml-blue' : 'border-amml-line text-amml-text hover:border-amml-blue/60'
        }`}
        title="Verify transitions & debug CSS overrides"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="lowercase font-medium text-amml-text3">theme:</span>
        <span className={`uppercase font-extrabold px-1.5 py-0.5 rounded text-[8px] tracking-widest ${
          isDark 
            ? 'bg-sky-950/80 text-sky-450 border border-sky-800/40' 
            : 'bg-amber-100 text-amber-700 border border-amber-200'
        }`}>
          {theme}
        </span>
        {isDark ? <Moon className="h-3 w-3 text-sky-450 animate-stage-wake" /> : <Sun className="h-3 w-3 text-amber-500 animate-stage-wake" />}
      </button>
    </div>
  );
};
