import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, LucideIcon } from 'lucide-react';

export type TelemetryStatus = 'normal' | 'warning' | 'critical';

export interface TelemetryMetric {
  label: string;
  value: string | number;
}

interface TelemetryCardProps {
  id: string;
  title: string;
  icon?: LucideIcon;
  status: TelemetryStatus;
  metrics: TelemetryMetric[];
  lastUpdated?: string;
  className?: string;
}

export const TelemetryCard: React.FC<TelemetryCardProps> = ({
  id,
  title,
  icon: Icon,
  status,
  metrics,
  lastUpdated,
  className = '',
}) => {
  // Determine color theme based on status
  const getStatusStyles = () => {
    switch (status) {
      case 'critical':
        return {
          border: 'border-rose-500/30 hover:border-rose-500/60 bg-rose-950/10',
          text: 'text-rose-450',
          badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          iconColor: 'text-rose-500',
          dot: 'bg-rose-500',
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)]',
          label: 'CRITICAL',
        };
      case 'warning':
        return {
          border: 'border-amber-500/30 hover:border-amber-500/60 bg-amber-950/10',
          text: 'text-amber-450',
          badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          iconColor: 'text-amber-500',
          dot: 'bg-amber-500',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.08)]',
          label: 'WARNING',
        };
      case 'normal':
      default:
        return {
          border: 'border-emerald-500/25 hover:border-emerald-500/50 bg-emerald-950/5',
          text: 'text-emerald-450',
          badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          iconColor: 'text-emerald-500',
          dot: 'bg-emerald-500 animate-pulse',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.05)]',
          label: 'NORMAL',
        };
    }
  };

  const style = getStatusStyles();

  return (
    <div
      id={`telemetry-card-${id}`}
      className={`border rounded-xl p-5 ${style.border} ${style.glow} transition-all duration-300 flex flex-col justify-between h-full bg-[#0E1A2B]/45 backdrop-blur-sm ${className}`}
    >
      <div className="space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className={`p-2 rounded bg-white/5 border border-white/10 ${style.iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
            )}
            <div>
              <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                {title}
              </h4>
              <p className="font-mono text-[8px] text-slate-500 uppercase mt-0.5">
                NODE_REF: {id.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border text-[9px] font-mono font-extrabold tracking-widest ${style.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            <span>{style.label}</span>
          </div>
        </div>

        {/* Metrics Key-Value Pairs Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {metrics.map((m, idx) => (
            <div key={idx} className="space-y-1">
              <span className="block font-mono text-[9px] text-slate-400 uppercase tracking-wide leading-tight">
                {m.label}
              </span>
              <span className="block font-mono text-[11px] font-semibold text-slate-100 truncate leading-normal">
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Timestamp */}
      {lastUpdated && (
        <div className="border-t border-white/5 pt-3 mt-4 flex items-center justify-between text-[9px] font-mono text-slate-500 uppercase">
          <span>SOURCE: TELEMETRY_DAEMON</span>
          <span className="text-slate-400 font-bold">{lastUpdated}</span>
        </div>
      )}
    </div>
  );
};
