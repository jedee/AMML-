import React, { useState } from 'react';
import { useLocation, Link } from '@tanstack/react-router';
import { 
  ChevronRight, 
  Home, 
  UserCheck, 
  Users, 
  Calendar, 
  CalendarCheck2, 
  Wallet, 
  BookOpen, 
  Folder, 
  LayoutDashboard, 
  Server, 
  Cpu, 
  CandlestickChart, 
  Package, 
  Radio, 
  Layers, 
  Monitor, 
  Sparkles, 
  UserSquare2, 
  Terminal, 
  BellDot, 
  Settings2,
  Copy,
  Check,
  Building2,
  Workflow
} from 'lucide-react';

interface RouteMeta {
  title: string;
  suite: string;
  icon: React.ElementType;
  badge?: string;
  parentPath?: string;
}

const ROUTE_MAP: Record<string, RouteMeta> = {
  '/dashboard': { title: 'Master Deck', suite: 'Operations & Clusters', icon: LayoutDashboard, badge: 'OPERATIONS NOC' },
  '/hr-dashboard': { title: 'HR Personnel Deck', suite: 'Admin & HR Suite', icon: UserCheck, badge: 'HR GOVERNANCE' },
  '/staff': { title: 'Staff Directory', suite: 'Admin & HR Suite', icon: Users, badge: 'ROSTER REGISTRY' },
  '/leave': { title: 'Leave Management', suite: 'Admin & HR Suite', icon: Calendar, badge: 'RELIEVING WORKFLOW' },
  '/attendance': { title: 'Attendance Logs', suite: 'Admin & HR Suite', icon: CalendarCheck2, badge: 'BIOMETRIC INGEST' },
  '/payroll': { title: 'Wage Compiler', suite: 'Admin & HR Suite', icon: Wallet, badge: 'DISBURSEMENT ENGINE' },
  '/reports': { title: 'Memos & Governance', suite: 'Admin & HR Suite', icon: BookOpen, badge: 'REGULATORY FILES' },
  '/files': { title: 'Master File Registry', suite: 'Admin & HR Suite', icon: Folder, badge: 'CENTRAL ARCHIVE' },
  '/infrastructure': { title: 'Infrastructure NOC', suite: 'Operations & Clusters', icon: Server, badge: 'SYSTEM NOC' },
  '/devices': { title: 'Ingest Nodes', suite: 'Operations & Clusters', icon: Cpu, badge: 'HARDWARE MESH' },
  '/markets': { title: 'Asset Markets', suite: 'Operations & Clusters', icon: CandlestickChart, badge: 'MARKET LOCATIONS' },
  '/inventory': { title: 'Inventory Ledger', suite: 'Operations & Clusters', icon: Package, badge: 'LEVY & STOCK' },
  '/telemetry': { title: 'Network Telemetry', suite: 'Operations & Clusters', icon: Radio, badge: 'REALTIME STREAM' },
  '/classifier': { title: 'Classifier Lane', suite: 'Gateways & AI', icon: Layers, badge: 'INTELLIGENCE' },
  '/terminal': { title: 'Staff Terminal', suite: 'Gateways & AI', icon: Monitor, badge: 'KIOSK PORTAL' },
  '/insights': { title: 'AI Analyzer Suite', suite: 'Gateways & AI', icon: Sparkles, badge: 'GEMINI INTELLIGENCE' },
  '/users': { title: 'Portal Accounts', suite: 'System Governance', icon: UserSquare2, badge: 'ACCESS CONTROL' },
  '/audit': { title: 'Audit & Assurance', suite: 'System Governance', icon: Terminal, badge: 'SECURE LOGS' },
  '/alerts': { title: 'Active Alerts', suite: 'System Governance', icon: BellDot, badge: 'SYSTEM NOTICES' },
  '/settings': { title: 'Global Policies', suite: 'System Governance', icon: Settings2, badge: 'SYSTEM PARAMS' },
};

export const AmmlBreadcrumb: React.FC = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  const pathname = location.pathname;
  const searchStr = location.searchStr || '';

  // Parse current route meta
  const currentRouteMeta = ROUTE_MAP[pathname] || {
    title: pathname.replace('/', '').toUpperCase().replace('-', ' '),
    suite: 'Module View',
    icon: Building2,
    badge: 'DEEP LINK'
  };

  // Parse deep-link query parameters if present
  const queryParams = new URLSearchParams(searchStr);
  const staffId = queryParams.get('staffId') || queryParams.get('id');
  const dept = queryParams.get('dept') || queryParams.get('department');
  const filter = queryParams.get('filter') || queryParams.get('tab');

  const IconComponent = currentRouteMeta.icon;

  const handleCopyPath = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Don't show breadcrumb on login
  if (pathname === '/login' || pathname === '/') return null;

  return (
    <nav 
      aria-label="Breadcrumb navigation context"
      className="mb-4 px-3 py-2 bg-amml-panel/80 border border-amml-line rounded-lg shadow-2xs font-mono text-xs flex flex-wrap items-center justify-between gap-2 backdrop-blur-xs select-none"
    >
      {/* Breadcrumb Trail */}
      <div className="flex flex-wrap items-center gap-1.5 text-amml-muted">
        {/* Root Node */}
        <Link 
          to="/dashboard" 
          className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-amml-orange transition-colors cursor-pointer group"
          title="Return to Master Deck"
        >
          <Home className="h-3.5 w-3.5 text-amml-orange group-hover:scale-110 transition-transform" />
          <span className="font-bold text-[11px] hidden sm:inline">AMML HQ</span>
        </Link>

        <ChevronRight className="h-3.5 w-3.5 text-amml-line shrink-0" />

        {/* Suite Category */}
        <span className="text-[11px] font-semibold text-amml-muted hidden md:inline">
          {currentRouteMeta.suite}
        </span>

        <ChevronRight className="h-3.5 w-3.5 text-amml-line shrink-0 hidden md:inline" />

        {/* Active Page View */}
        <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-bold text-[11px]">
          <IconComponent className="h-3.5 w-3.5 text-amml-blue shrink-0" />
          <span>{currentRouteMeta.title}</span>
        </div>

        {/* Deep-link Context Tags */}
        {staffId && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-amml-line shrink-0" />
            <span className="px-1.5 py-0.5 rounded bg-amml-surface3 text-amml-orange font-bold text-[10px] border border-amml-line">
              ID: {staffId}
            </span>
          </>
        )}

        {dept && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-amml-line shrink-0" />
            <span className="px-1.5 py-0.5 rounded bg-amml-surface3 text-cyan-500 font-bold text-[10px] border border-amml-line">
              DEPT: {dept}
            </span>
          </>
        )}

        {filter && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-amml-line shrink-0" />
            <span className="px-1.5 py-0.5 rounded bg-amml-surface3 text-emerald-500 font-bold text-[10px] border border-amml-line uppercase">
              FILTER: {filter}
            </span>
          </>
        )}
      </div>

      {/* Right Utility Context Badge */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amml-surface2 text-[9px] font-bold text-amml-muted border border-amml-line/60 uppercase">
          <Workflow className="h-3 w-3 text-amml-orange" />
          <span>{currentRouteMeta.badge}</span>
        </span>

        <button
          onClick={handleCopyPath}
          className="p-1 rounded hover:bg-amml-surface3 text-amml-muted hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
          title="Copy deep-link context URL"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500 font-bold hidden lg:inline">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span className="hidden lg:inline">SHARE LINK</span>
            </>
          )}
        </button>
      </div>
    </nav>
  );
};
