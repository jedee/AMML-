import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Search, 
  Server, 
  Users, 
  Activity, 
  Terminal, 
  UserCheck, 
  ShieldCheck, 
  ChevronRight, 
  X, 
  Sparkles, 
  ArrowUpRight, 
  Clock, 
  Zap, 
  Building2, 
  Database,
  Cpu,
  Calendar,
  Wallet,
  Folder
} from 'lucide-react';
import { useAmmlStore } from '../../lib/amml/store';
import { StatusBadge } from './SharedDataCardLayout';

export interface SearchResultItem {
  id: string;
  category: 'INFRASTRUCTURE' | 'HR_PERSONNEL' | 'DIAGNOSTICS' | 'NAVIGATION';
  title: string;
  subtitle: string;
  badgeText?: string;
  badgeVariant?: 'green' | 'amber' | 'red' | 'blue' | 'purple' | 'slate';
  route: string;
  icon: React.ElementType;
  metadata?: Record<string, string>;
  actionLabel?: string;
}

interface GlobalCommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalCommandSearchModal: React.FC<GlobalCommandSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const navigate = useNavigate();
  const { staff, leaves, devices } = useAmmlStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K and Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          const searchBtn = document.getElementById('global-header-search-trigger');
          if (searchBtn) searchBtn.click();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Static & Dynamic Data Items
  const staticInfrastructureNodes: SearchResultItem[] = [
    {
      id: 'node-hq',
      category: 'INFRASTRUCTURE',
      title: 'Abuja HQ Primary Cluster',
      subtitle: 'Zone: HQ | IP: 10.0.1.2 | CPU Load: 28% | 840 req/s',
      badgeText: 'HEALTHY',
      badgeVariant: 'green',
      route: '/infrastructure',
      icon: Server,
      metadata: { IP: '10.0.1.2', Latency: '4ms' }
    },
    {
      id: 'node-garki',
      category: 'INFRASTRUCTURE',
      title: 'Garki Ingestion Hub',
      subtitle: 'Zone: GARKI | IP: 10.0.2.14 | CPU Load: 64% | 420 req/s',
      badgeText: 'HEALTHY',
      badgeVariant: 'green',
      route: '/infrastructure',
      icon: Server,
      metadata: { IP: '10.0.2.14', Latency: '18ms' }
    },
    {
      id: 'node-wuse',
      category: 'INFRASTRUCTURE',
      title: 'Wuse Terminal Node A',
      subtitle: 'Zone: WUSE | IP: 10.0.3.22 | CPU Load: 49% | 310 req/s',
      badgeText: 'HEALTHY',
      badgeVariant: 'green',
      route: '/infrastructure',
      icon: Server,
      metadata: { IP: '10.0.3.22', Latency: '26ms' }
    },
    {
      id: 'node-kaura',
      category: 'INFRASTRUCTURE',
      title: 'Kaura Outpost Gateway',
      subtitle: 'Zone: KAURA | IP: 10.0.4.8 | CPU Load: 82% | Syncing Telemetry',
      badgeText: 'SYNCING',
      badgeVariant: 'amber',
      route: '/infrastructure',
      icon: Server,
      metadata: { IP: '10.0.4.8', Latency: '54ms' }
    },
    {
      id: 'node-utako',
      category: 'INFRASTRUCTURE',
      title: 'Utako Market Relayer',
      subtitle: 'Zone: UTAKO | IP: 10.0.5.11 | CPU Load: 33% | 110 req/s',
      badgeText: 'HEALTHY',
      badgeVariant: 'green',
      route: '/infrastructure',
      icon: Server,
      metadata: { IP: '10.0.5.11', Latency: '22ms' }
    },
    {
      id: 'node-nyanya',
      category: 'INFRASTRUCTURE',
      title: 'Nyanya Regional Bridge',
      subtitle: 'Zone: NYANYA | IP: 10.0.6.90 | Offline Timeout | Auto-failover triggered',
      badgeText: 'DEGRADED',
      badgeVariant: 'red',
      route: '/infrastructure',
      icon: Server,
      metadata: { IP: '10.0.6.90', Status: 'Offline' }
    },
  ];

  const staticDiagnostics: SearchResultItem[] = [
    {
      id: 'diag-1',
      category: 'DIAGNOSTICS',
      title: 'mTLS Handshake Garki Hub',
      subtitle: 'API-GATEWAY [04:19:55]: Verified for node 10.0.2.14',
      badgeText: 'VERIFIED',
      badgeVariant: 'blue',
      route: '/infrastructure',
      icon: Terminal,
      metadata: { LogID: 'SYS-1', Service: 'API-GATEWAY' }
    },
    {
      id: 'diag-2',
      category: 'DIAGNOSTICS',
      title: 'Postgres Replication Lag < 3ms',
      subtitle: 'DB-CLUSTER [04:19:42]: Connection pool healthy (18/50 active)',
      badgeText: 'OPTIMAL',
      badgeVariant: 'green',
      route: '/infrastructure',
      icon: Database,
      metadata: { LogID: 'SYS-2', Service: 'DB-CLUSTER' }
    },
    {
      id: 'diag-3',
      category: 'DIAGNOSTICS',
      title: 'Nyanya Bridge Failover Log',
      subtitle: 'NODE-BRIDGE [04:18:12]: Regional bridge offline timeout. Auto-failover active',
      badgeText: 'FAILOVER',
      badgeVariant: 'red',
      route: '/infrastructure',
      icon: Zap,
      metadata: { LogID: 'SYS-5', Service: 'NODE-BRIDGE' }
    },
  ];

  const staticNavItems: SearchResultItem[] = [
    {
      id: 'nav-infra',
      category: 'NAVIGATION',
      title: 'Infrastructure Monitoring NOC',
      subtitle: 'Cluster telemetry, node latency matrix, Postgres IOPS & diagnostic logs',
      badgeText: 'SYSTEM NOC',
      badgeVariant: 'green',
      route: '/infrastructure',
      icon: Activity
    },
    {
      id: 'nav-hr',
      category: 'NAVIGATION',
      title: 'HR Personnel Deck',
      subtitle: 'Personnel headcount, attendance rates, wage outlay & ex-staff governance',
      badgeText: 'HR SUITE',
      badgeVariant: 'blue',
      route: '/hr-dashboard',
      icon: UserCheck
    },
    {
      id: 'nav-staff',
      category: 'NAVIGATION',
      title: 'Staff Directory Roster',
      subtitle: 'Master personnel directory, grade levels, market attachments & roles',
      badgeText: 'ROSTER',
      badgeVariant: 'purple',
      route: '/staff',
      icon: Users
    },
    {
      id: 'nav-leave',
      category: 'NAVIGATION',
      title: 'Leave & Relieving System',
      subtitle: 'Staff leave applications, coverage assignments & approval workflows',
      badgeText: 'WORKFLOW',
      badgeVariant: 'amber',
      route: '/leave',
      icon: Calendar
    },
    {
      id: 'nav-payroll',
      category: 'NAVIGATION',
      title: 'Wage & Payroll Compiler',
      subtitle: 'Monthly wage disbursements, grade step breakdowns & tax schedules',
      badgeText: 'FINANCE',
      badgeVariant: 'green',
      route: '/payroll',
      icon: Wallet
    },
    {
      id: 'nav-files',
      category: 'NAVIGATION',
      title: 'Master File Registry',
      subtitle: 'Central organizational files, memos, policy logs & governance sheets',
      badgeText: 'REGISTRY',
      badgeVariant: 'slate',
      route: '/files',
      icon: Folder
    },
  ];

  // Dynamic HR Staff items from Store
  const dynamicHrStaff: SearchResultItem[] = staff.map(s => {
    const isExStaff = s.id === 'AMML-EX047' || s.remarks?.includes('RESIGNED');
    return {
      id: `staff-${s.id}`,
      category: 'HR_PERSONNEL',
      title: `${s.first} ${s.last}`,
      subtitle: `${s.id} | ${s.dept || 'OPERATIONS'} | ${s.role || 'Officer'} | ${s.market || 'Abuja HQ'}`,
      badgeText: isExStaff ? 'DISENGAGED' : (s.isContract ? 'CONTRACT' : 'PERMANENT'),
      badgeVariant: isExStaff ? 'red' : (s.isContract ? 'purple' : 'green'),
      route: '/hr-dashboard',
      icon: Building2,
      metadata: { Grade: s.gradeLevel || 'GL-08', Market: s.market || 'Abuja HQ' }
    };
  });

  // Combine all search items
  const allSearchItems = [
    ...staticInfrastructureNodes,
    ...dynamicHrStaff,
    ...staticDiagnostics,
    ...staticNavItems
  ];

  // Filter Search Items
  const filteredResults = allSearchItems.filter(item => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    if (!matchesCat) return false;

    if (!query.trim()) return true;

    const q = query.toLowerCase().trim();
    const searchableText = `${item.title} ${item.subtitle} ${item.id} ${item.badgeText || ''} ${JSON.stringify(item.metadata || {})}`.toLowerCase();
    return searchableText.includes(q);
  });

  // Handle keyboard arrow navigation & enter
  const handleKeyDownModal = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectResult(filteredResults[selectedIndex]);
      }
    }
  };

  const handleSelectResult = (item: SearchResultItem) => {
    onClose();
    navigate({ to: item.route });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-amml-panel border border-amml-line rounded-xl shadow-2xl overflow-hidden font-mono flex flex-col max-h-[85vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDownModal}
      >
        {/* Header Search Input */}
        <div className="p-3 sm:p-4 border-b border-amml-line bg-gradient-to-r from-amml-surface2/80 via-amml-panel to-amml-surface2/80 flex items-center gap-3">
          <Search className="h-5 w-5 text-amml-orange shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search infrastructure telemetry, regional nodes, staff roster, or logs..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-sm sm:text-base font-mono text-slate-900 dark:text-slate-100 placeholder-amml-muted focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 hover:bg-amml-surface3 rounded text-amml-muted hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-1 bg-amml-surface3 rounded text-[10px] font-bold text-amml-muted border border-amml-line">
            ESC
          </span>
        </div>

        {/* Category Tabs */}
        <div className="px-3 py-2 bg-amml-surface2/60 border-b border-amml-line/60 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {[
            { id: 'ALL', name: 'ALL RECORDS', count: allSearchItems.length },
            { id: 'INFRASTRUCTURE', name: 'INFRASTRUCTURE NOC', count: staticInfrastructureNodes.length },
            { id: 'HR_PERSONNEL', name: 'HR ROSTER', count: dynamicHrStaff.length },
            { id: 'DIAGNOSTICS', name: 'DIAGNOSTIC LOGS', count: staticDiagnostics.length },
            { id: 'NAVIGATION', name: 'QUICK JUMPS', count: staticNavItems.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-amml-orange text-white shadow-xs'
                  : 'bg-amml-surface3/60 text-amml-muted hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar max-h-[440px]">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-amml-muted space-y-2">
              <Search className="h-8 w-8 mx-auto text-amml-line" />
              <p className="text-xs font-bold uppercase">No matching telemetry or HR records found</p>
              <p className="text-[11px]">Try searching by IP, node name, staff ID, department, or log event.</p>
            </div>
          ) : (
            filteredResults.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amml-surface3/80 border-amml-orange shadow-xs'
                      : 'bg-amml-panel/60 border-amml-line/40 hover:bg-amml-surface2/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-amml-orange text-white' : 'bg-amml-surface3 text-amml-orange'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </span>
                        {item.badgeText && (
                          <StatusBadge status={item.badgeText} variant={item.badgeVariant} />
                        )}
                      </div>
                      <p className="text-[10px] text-amml-muted truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-[9px] font-bold text-amml-muted uppercase px-2 py-0.5 rounded bg-amml-surface2 border border-amml-line/60">
                      {item.category.replace('_', ' ')}
                    </span>
                    <ChevronRight className={`h-4 w-4 text-amml-muted ${isSelected ? 'text-amml-orange' : ''}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-2.5 px-4 border-t border-amml-line bg-amml-surface2/80 flex items-center justify-between text-[10px] text-amml-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-amml-surface3 rounded border border-amml-line font-bold">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-amml-surface3 rounded border border-amml-line font-bold">↓</kbd>
              <span className="ml-0.5">Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-amml-surface3 rounded border border-amml-line font-bold">↵</kbd>
              <span className="ml-0.5">Select Record</span>
            </span>
          </div>
          <div className="flex items-center gap-1 text-amml-orange font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>GLOBAL NOC INDEX</span>
          </div>
        </div>

      </div>
    </div>
  );
};
