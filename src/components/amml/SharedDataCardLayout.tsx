import React, { useState } from 'react';
import { 
  RefreshCw, 
  Layers, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Maximize2, 
  Minimize2,
  Filter, 
  Clock, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BarChart3,
  ListFilter,
  Info,
  Radio
} from 'lucide-react';

// ==========================================
// 1. STANDARDIZED THEME-ADAPTIVE STATUS BADGE
// ==========================================
export interface StatusBadgeProps {
  status: string;
  variant?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate' | 'emerald';
  icon?: React.ElementType;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  icon: Icon,
  className = '',
  dot = true
}) => {
  // Auto-detect variant if not explicitly provided
  const resolvedVariant = variant || (() => {
    const upper = status.toUpperCase();
    if (upper.includes('HEALTHY') || upper.includes('OPTIMAL') || upper.includes('COMPLIANT') || upper.includes('ACTIVE') || upper.includes('SUCCESS') || upper.includes('PASSED')) return 'green';
    if (upper.includes('SYNCING') || upper.includes('WARN') || upper.includes('REVIEW') || upper.includes('PENDING')) return 'amber';
    if (upper.includes('DEGRADED') || upper.includes('ERROR') || upper.includes('CRITICAL') || upper.includes('FLAGGED') || upper.includes('OFFLINE') || upper.includes('DISENGAGED')) return 'red';
    if (upper.includes('INFO') || upper.includes('PERMANENT')) return 'blue';
    if (upper.includes('CONTRACT') || upper.includes('SPECIAL')) return 'purple';
    return 'slate';
  })();

  const colorStyles = {
    green: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    red: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    blue: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30',
    slate: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40',
  };

  const dotColors = {
    green: 'bg-emerald-500 dark:bg-emerald-400',
    amber: 'bg-amber-500 dark:bg-amber-400',
    red: 'bg-rose-500 dark:bg-rose-400',
    blue: 'bg-cyan-500 dark:bg-cyan-400',
    purple: 'bg-purple-500 dark:bg-purple-400',
    slate: 'bg-slate-500 dark:bg-slate-400',
    emerald: 'bg-emerald-500 dark:bg-emerald-300',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold tracking-wider uppercase border transition-colors ${colorStyles[resolvedVariant]} ${className}`}>
      {dot && (
        <span className={`h-1.5 w-1.5 rounded-full ${dotColors[resolvedVariant]} animate-pulse`} />
      )}
      {Icon && <Icon className="h-3 w-3" />}
      <span>{status}</span>
    </span>
  );
};

// ==========================================
// 2. EXPANDABLE DATA CARD COMPONENT
// ==========================================
export interface DataCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  badge?: {
    text: string;
    variant?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate';
  };
  actions?: React.ReactNode;
  children: React.ReactNode;
  expandedContent?: React.ReactNode;
  miniSummary?: React.ReactNode;
  expandable?: boolean;
  defaultExpanded?: boolean;
  isSkeleton?: boolean;
  className?: string;
  footer?: React.ReactNode;
}

export const DataCard: React.FC<DataCardProps> = ({
  id,
  title,
  subtitle,
  icon: Icon,
  badge,
  actions,
  children,
  expandedContent,
  miniSummary,
  expandable = true,
  defaultExpanded = true,
  isSkeleton = false,
  className = '',
  footer
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  return (
    <div 
      id={id}
      className={`relative border border-amml-line bg-amml-panel rounded-xl shadow-xs hover:shadow-md dark:shadow-none transition-all duration-200 overflow-hidden flex flex-col ${className}`}
    >
      {/* Card Header */}
      <div 
        className={`px-4 py-3 border-b border-amml-line/60 bg-gradient-to-r from-amml-surface2/60 via-amml-panel to-amml-surface2/60 flex items-center justify-between gap-3 ${
          expandable ? 'cursor-pointer select-none hover:bg-amml-surface2/80' : ''
        }`}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <div className="p-1.5 rounded-lg bg-amml-surface3/80 text-amml-orange shrink-0">
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-900 dark:text-slate-100 truncate">
                {title}
              </h3>
              {badge && (
                <StatusBadge status={badge.text} variant={badge.variant} />
              )}
            </div>
            {subtitle && (
              <p className="text-[10px] text-amml-muted font-mono truncate mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {actions}
          
          {expandable && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded-md hover:bg-amml-surface3 text-amml-muted hover:text-amml-orange transition-colors"
              title={isExpanded ? "Collapse to Mini View" : "Expand Full Details"}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mini Summary Strip (Shown when Collapsed) */}
      {!isExpanded && miniSummary && (
        <div className="p-3 bg-amml-surface2/40 border-b border-amml-line/30 text-xs font-mono text-slate-700 dark:text-slate-300">
          {miniSummary}
        </div>
      )}

      {/* Card Primary Content */}
      <div className={`p-4 flex-1 flex flex-col relative transition-all duration-300 ${!isExpanded && !miniSummary ? 'py-3' : ''}`}>
        {isSkeleton ? (
          <SkeletonCardOverlay />
        ) : (
          <div>
            {/* Primary View */}
            {children}

            {/* Extra Expanded View (Revealed when expanded) */}
            {isExpanded && expandedContent && (
              <div className="mt-4 pt-3 border-t border-amml-line/50 animate-fadeIn">
                {expandedContent}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Card Footer */}
      {footer && (
        <div className="px-4 py-2 border-t border-amml-line/40 bg-amml-surface2/50 text-[10px] font-mono text-amml-muted flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. EXPANDABLE DATA METRIC TILE
// ==========================================
export interface DataMetricTileProps {
  id?: string;
  label: string;
  value: string | number;
  subtext?: string;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon?: React.ElementType;
  accentColor?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'gold';
  isSkeleton?: boolean;
  progress?: number;
  expandedDetails?: {
    target?: string;
    peak?: string;
    avg?: string;
    statusText?: string;
  };
}

export const DataMetricTile: React.FC<DataMetricTileProps> = ({
  id,
  label,
  value,
  subtext,
  change,
  icon: Icon,
  accentColor = 'green',
  isSkeleton = false,
  progress,
  expandedDetails
}) => {
  const [isTileExpanded, setIsTileExpanded] = useState<boolean>(false);

  const colorMap = {
    green: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
    amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', bar: 'bg-amber-500' },
    red: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', bar: 'bg-rose-500' },
    blue: { text: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', bar: 'bg-cyan-500' },
    purple: { text: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', bar: 'bg-purple-500' },
    gold: { text: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-400/10', border: 'border-amber-400/20', bar: 'bg-amber-400' },
  };

  const style = colorMap[accentColor];

  if (isSkeleton) {
    return (
      <div id={id} className="relative border border-amml-line bg-amml-panel p-3.5 rounded-xl overflow-hidden flex flex-col justify-between min-h-[110px] animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-3 w-24 bg-amml-surface3/80 rounded" />
          <div className="h-4 w-4 bg-amml-surface3/80 rounded-full" />
        </div>
        <div className="my-2 space-y-1.5">
          <div className="h-6 w-32 bg-amml-surface3 rounded" />
          <div className="h-2.5 w-20 bg-amml-surface3/60 rounded" />
        </div>
        <div className="h-1.5 w-full bg-amml-surface3 rounded-full overflow-hidden">
          <div className="h-full bg-amml-line rounded-full w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div 
      id={id}
      onClick={() => setIsTileExpanded(!isTileExpanded)}
      className="relative border border-amml-line bg-amml-panel p-3.5 rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 hover:border-amml-orange/60 hover:shadow-sm cursor-pointer group"
    >
      {/* Top Header */}
      <div className="flex justify-between items-start font-mono text-[10px]">
        <span className="text-amml-muted tracking-wider uppercase font-semibold truncate pr-1">
          {label}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {Icon && (
            <div className={`p-1 rounded-md ${style.bg} ${style.text}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
          )}
          <ChevronDown className={`h-3 w-3 text-amml-muted transition-transform duration-200 ${isTileExpanded ? 'rotate-180 text-amml-orange' : ''}`} />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-1.5">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-mono font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </span>
          {change && (
            <span className={`text-[10px] font-mono font-semibold ${
              change.type === 'positive' ? 'text-emerald-600 dark:text-emerald-400' :
              change.type === 'negative' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500'
            }`}>
              {change.value}
            </span>
          )}
        </div>
        {subtext && (
          <p className="text-[10px] text-amml-muted font-mono truncate mt-0.5">
            {subtext}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="w-full bg-amml-surface3/70 h-1.5 rounded-full overflow-hidden mt-1">
          <div 
            className={`h-full ${style.bar} transition-all duration-500`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {/* Inline Mini Expanded Details (Revealed on Click) */}
      {isTileExpanded && (
        <div className="mt-2.5 pt-2 border-t border-amml-line/50 grid grid-cols-2 gap-1.5 text-[9px] font-mono animate-fadeIn">
          <div className="p-1 rounded bg-amml-surface2/60">
            <span className="text-amml-muted block uppercase">BENCHMARK</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{expandedDetails?.target || 'NOMINAL'}</span>
          </div>
          <div className="p-1 rounded bg-amml-surface2/60">
            <span className="text-amml-muted block uppercase">PEAK RECORD</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{expandedDetails?.peak || 'OPTIMAL'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. DATA LIST CARD COMPONENT
// ==========================================
export interface DataListCardProps<T> {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  items: T[];
  renderItem: (item: T, index: number, isExpanded: boolean) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  emptyText?: string;
  isSkeleton?: boolean;
  actions?: React.ReactNode;
  badge?: { text: string; variant?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate' };
  maxHeightClass?: string;
  className?: string;
  footer?: React.ReactNode;
}

export function DataListCard<T>({
  id,
  title,
  subtitle,
  icon: Icon,
  items,
  renderItem,
  keyExtractor,
  emptyText = 'No items found',
  isSkeleton = false,
  actions,
  badge,
  maxHeightClass = 'max-h-[380px]',
  className = '',
  footer
}: DataListCardProps<T>) {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const toggleItemExpand = (key: string) => {
    setExpandedItemId(prev => prev === key ? null : key);
  };

  return (
    <DataCard
      id={id}
      title={title}
      subtitle={subtitle}
      icon={Icon}
      badge={badge}
      actions={actions}
      isSkeleton={isSkeleton}
      className={className}
      footer={footer}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-amml-muted font-mono text-xs">
          <ListFilter className="h-6 w-6 text-amml-line mb-2" />
          <span>{emptyText}</span>
        </div>
      ) : (
        <div className={`overflow-y-auto space-y-2 pr-1 custom-scrollbar ${maxHeightClass}`}>
          {items.map((item, idx) => {
            const key = keyExtractor(item, idx);
            const isExpanded = expandedItemId === key;
            return (
              <div 
                key={key} 
                onClick={() => toggleItemExpand(key)}
                className="cursor-pointer transition-all"
              >
                {renderItem(item, idx, isExpanded)}
              </div>
            );
          })}
        </div>
      )}
    </DataCard>
  );
}

// ==========================================
// 5. DATA CHART CARD COMPONENT
// ==========================================
export interface DataChartCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  badge?: { text: string; variant?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate' };
  actions?: React.ReactNode;
  summaryMetrics?: Array<{ label: string; value: string | number; color?: string }>;
  children: React.ReactNode;
  isSkeleton?: boolean;
  heightClass?: string;
  className?: string;
  footer?: React.ReactNode;
}

export const DataChartCard: React.FC<DataChartCardProps> = ({
  id,
  title,
  subtitle,
  icon: Icon = BarChart3,
  badge,
  actions,
  summaryMetrics,
  children,
  isSkeleton = false,
  heightClass = 'h-64',
  className = '',
  footer
}) => {
  return (
    <DataCard
      id={id}
      title={title}
      subtitle={subtitle}
      icon={Icon}
      badge={badge}
      actions={actions}
      isSkeleton={isSkeleton}
      className={className}
      footer={footer}
    >
      {/* Top Summary Metrics Strip */}
      {summaryMetrics && summaryMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 pb-3 border-b border-amml-line/40">
          {summaryMetrics.map((sm, i) => (
            <div key={i} className="bg-amml-surface2/60 p-2 rounded-lg border border-amml-line/40 font-mono">
              <div className="text-[9px] uppercase text-amml-muted truncate">{sm.label}</div>
              <div className={`text-sm font-bold ${sm.color || 'text-slate-900 dark:text-white'}`}>{sm.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Chart Canvas */}
      <div className={`w-full ${heightClass} relative flex items-center justify-center`}>
        {children}
      </div>
    </DataCard>
  );
};

// ==========================================
// 6. UNIFIED RESPONSIVE DATA GRID CONTAINER
// ==========================================
export interface DataGridContainerProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const DataGridContainer: React.FC<DataGridContainerProps> = ({
  children,
  columns = 4,
  className = ''
}) => {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${colStyles[columns]} gap-4 md:gap-5 ${className}`}>
      {children}
    </div>
  );
};

// ==========================================
// 7. STANDARDIZED SECTION HEADER
// ==========================================
export interface DataSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  badgeText?: string;
  action?: React.ReactNode;
  className?: string;
}

export const DataSectionHeader: React.FC<DataSectionHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  badgeText,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-amml-line/60 font-mono ${className}`}>
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="p-1.5 rounded-lg bg-amml-surface3 text-amml-orange shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase text-slate-900 dark:text-white">
              {title}
            </h2>
            {badgeText && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amml-surface3 text-amml-orange border border-amml-orange/30">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-amml-muted truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 8. SKELETON WIREFRAME OVERLAY
// ==========================================
export const SkeletonCardOverlay: React.FC = () => {
  return (
    <div className="space-y-3.5 animate-pulse w-full py-1">
      <div className="flex items-center justify-between gap-4">
        <div className="h-4 bg-amml-surface3/80 rounded w-1/3" />
        <div className="h-4 bg-amml-surface3/60 rounded w-1/4" />
      </div>
      
      {/* Metric Placeholder Blocks */}
      <div className="grid grid-cols-3 gap-3">
        <div className="h-14 bg-amml-surface2 rounded-lg border border-amml-line/40 p-2.5 flex flex-col justify-between">
          <div className="h-2.5 bg-amml-surface3/70 rounded w-3/4" />
          <div className="h-4 bg-amml-surface3 rounded w-1/2" />
        </div>
        <div className="h-14 bg-amml-surface2 rounded-lg border border-amml-line/40 p-2.5 flex flex-col justify-between">
          <div className="h-2.5 bg-amml-surface3/70 rounded w-2/3" />
          <div className="h-4 bg-amml-surface3 rounded w-2/3" />
        </div>
        <div className="h-14 bg-amml-surface2 rounded-lg border border-amml-line/40 p-2.5 flex flex-col justify-between">
          <div className="h-2.5 bg-amml-surface3/70 rounded w-4/5" />
          <div className="h-4 bg-amml-surface3 rounded w-1/3" />
        </div>
      </div>

      {/* Chart Shimmer Bar Placeholder */}
      <div className="h-28 bg-amml-surface2/60 rounded-lg border border-amml-line/30 p-3 flex items-end gap-2">
        <div className="h-1/3 bg-amml-surface3/50 rounded flex-1" />
        <div className="h-2/3 bg-amml-surface3/70 rounded flex-1" />
        <div className="h-1/2 bg-amml-surface3/50 rounded flex-1" />
        <div className="h-4/5 bg-amml-surface3/80 rounded flex-1" />
        <div className="h-3/5 bg-amml-surface3/60 rounded flex-1" />
        <div className="h-full bg-amml-surface3/90 rounded flex-1" />
        <div className="h-2/5 bg-amml-surface3/50 rounded flex-1" />
      </div>
    </div>
  );
};

// ==========================================
// 9. SKELETON TABLE OVERLAY
// ==========================================
export interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 4, columns = 4 }) => {
  return (
    <div className="w-full space-y-2 animate-pulse font-mono">
      <div className="grid grid-cols-4 gap-4 py-2 px-3 bg-amml-surface2 rounded-md border border-amml-line/40">
        <div className="h-3 bg-amml-surface3/80 rounded w-20" />
        <div className="h-3 bg-amml-surface3/80 rounded w-24" />
        <div className="h-3 bg-amml-surface3/80 rounded w-16" />
        <div className="h-3 bg-amml-surface3/80 rounded w-28" />
      </div>

      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-4 py-2.5 px-3 border border-amml-line/30 bg-amml-panel/60 rounded-md items-center">
          <div className="h-3.5 bg-amml-surface3/70 rounded w-3/4" />
          <div className="h-3.5 bg-amml-surface3/60 rounded w-2/3" />
          <div className="h-3 bg-amml-surface3/50 rounded w-1/2" />
          <div className="h-3 bg-amml-surface3/70 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 10. STREAMLINED DASHBOARD HEADER CONTROL BAR
// ==========================================
export interface DashboardHeaderBarProps {
  title: string;
  subtitle: string;
  isSkeletonMode: boolean;
  onToggleSkeletonMode: () => void;
  selectedScope: string;
  onSelectScope: (scope: string) => void;
  scopeOptions: Array<{ id: string; name: string }>;
  onRefresh: () => void;
  isSyncing?: boolean;
  isLiveStreaming?: boolean;
  onToggleLiveStream?: () => void;
  lastSyncTime?: string;
  badgeText?: string;
  actionButtons?: React.ReactNode;
}

export const DashboardHeaderBar: React.FC<DashboardHeaderBarProps> = ({
  title,
  subtitle,
  isSkeletonMode,
  onToggleSkeletonMode,
  selectedScope,
  onSelectScope,
  scopeOptions,
  onRefresh,
  isSyncing = false,
  isLiveStreaming = false,
  onToggleLiveStream,
  lastSyncTime = 'JUST NOW',
  badgeText = 'SYSTEM DATA STREAM',
  actionButtons
}) => {
  return (
    <div className="relative border border-amml-line bg-amml-panel p-4 rounded-xl shadow-xs space-y-3 font-mono">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Title & Status Badge */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSkeletonMode ? 'bg-amber-400' : 'bg-emerald-400'} opacity-75`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSkeletonMode ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </span>
            <span className="text-[10px] font-bold text-amml-orange uppercase tracking-widest">
              {badgeText}
            </span>
            {isSkeletonMode && (
              <span className="px-2 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                WIREFRAME MODE
              </span>
            )}
          </div>
          <h1 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">
            {title}
          </h1>
          <p className="text-xs text-amml-muted max-w-3xl">
            {subtitle}
          </p>
        </div>

        {/* Integrated Clean Toolbar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Live Data Stream Toggle + Refresh in One Integrated Control */}
          {onToggleLiveStream && (
            <div className="inline-flex items-center rounded-lg border border-amml-line bg-amml-surface2/80 p-0.5">
              <button
                onClick={onToggleLiveStream}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  isLiveStreaming 
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' 
                    : 'text-amml-muted hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Toggle Live Background Telemetry Streaming"
              >
                <Radio className={`h-3.5 w-3.5 ${isLiveStreaming ? 'text-emerald-500 animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{isLiveStreaming ? 'LIVE' : 'PAUSED'}</span>
              </button>

              <button
                onClick={onRefresh}
                disabled={isSyncing}
                className="p-1 px-2 text-amml-muted hover:text-amml-orange transition-colors disabled:opacity-50"
                title="Manual Instant Sync"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-amml-orange' : ''}`} />
              </button>
            </div>
          )}

          {/* Scope / Zone Selector Filter */}
          <div className="flex items-center gap-1.5 bg-amml-surface2/80 border border-amml-line rounded-lg px-2.5 py-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-amml-muted" />
            <span className="text-amml-muted hidden sm:inline">SCOPE:</span>
            <select
              value={selectedScope}
              onChange={(e) => onSelectScope(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none cursor-pointer"
            >
              {scopeOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-amml-panel text-slate-900 dark:text-slate-100">
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Wireframe Skeleton Mode Toggle Icon */}
          <button
            onClick={onToggleSkeletonMode}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-all ${
              isSkeletonMode 
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40' 
                : 'bg-amml-surface2 border-amml-line text-amml-muted hover:text-amml-orange'
            }`}
            title="Toggle Wireframe Skeleton Layout"
          >
            {isSkeletonMode ? <EyeOff className="h-4 w-4 text-amber-500" /> : <Eye className="h-4 w-4" />}
          </button>

          {/* Contextual Action Buttons */}
          {actionButtons}
        </div>
      </div>

      {/* Bottom Status Ribbon */}
      <div className="pt-2 border-t border-amml-line/40 flex items-center justify-between text-[10px] text-amml-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-emerald-500" />
            LAST SYNC: <strong className="text-slate-800 dark:text-slate-200">{lastSyncTime}</strong>
          </span>
          <span className="hidden md:inline text-amml-line">|</span>
          <span className="hidden md:inline">SYSTEM: <strong className="text-slate-800 dark:text-slate-200">UNIFIED EXPANDABLE CARDS</strong></span>
        </div>
        <div className="flex items-center gap-1 text-amml-orange font-semibold">
          <Sparkles className="h-3 w-3" />
          <span>AMML OS ENGINE</span>
        </div>
      </div>
    </div>
  );
};
