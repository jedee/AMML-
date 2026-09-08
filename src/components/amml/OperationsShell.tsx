import React, { useState } from 'react';
import { Link, Outlet } from '@tanstack/react-router';
import { useAmmlStore } from '../../lib/amml/store';
import { AmmlLogo } from './AmmlLogo';
import { ThemeSwitcher } from './ThemeSwitcher';
import { BackendConnectionMonitor } from './BackendConnectionMonitor';
import { AlertNotificationSystem } from './AlertNotificationSystem';
import { ThemeIndicatorBadge } from './ThemeIndicatorBadge';
import { 
  LayoutDashboard, Cpu, CandlestickChart, Radio, LogOut, RefreshCw, Layers, CheckCircle2,
  Users, CalendarCheck2, Wallet, BookOpen, Terminal, UserSquare2, Settings2, Monitor, BellDot, Sparkles,
  Package, Calendar, Menu, X, ShieldAlert, Server, UserCheck, Folder, Search
} from 'lucide-react';
import { GlobalCommandSearchModal } from './GlobalCommandSearchModal';
import { AmmlBreadcrumb } from './AmmlBreadcrumb';
import styles from './OperationsShell.module.css';

export const OperationsShell: React.FC = () => {
  const { 
    session, 
    handleLogout, 
    isPulseActive, 
    setIsPulseActive, 
    triggerSimulateScan,
    toast,
    setToast,
    isLoading
  } = useAmmlStore();

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const forceManualRefresh = () => {};

  if (!session) return null;

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div id="amml-operations-shell" className={styles.shell}>
      {/* Mobile backdrop overlay */}
      {mobileNavOpen && (
        <div 
          className={styles.mobileBackdrop} 
          onClick={closeMobileNav}
          aria-hidden="true"
        />
      )}

      {/* 1. Sidebar Grid Area */}
      <aside 
        id="amml-sidebar-aside" 
        className={`${styles.sidebar} ${mobileNavOpen ? styles.sidebarOpen : ''}`}
      >
        {/* Brand Header */}
        <div className={styles.sidebarHeader}>
          <AmmlLogo variant="horizontal" size="sm" textColor="light" />
          <button
            type="button"
            onClick={closeMobileNav}
            className="p-1 text-amml-muted hover:text-amml-text lg:hidden cursor-pointer"
            title="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section Container */}
        <nav id="sidebar-main-nav" className={styles.sidebarNav}>
          {/* Admin & HR Operations Suite */}
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Admin &amp; HR Suite</span>
            <div className="space-y-0.5">
              <Link 
                to="/hr-dashboard"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <UserCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>HR Personnel Deck</span>
              </Link>
              <Link 
                to="/staff"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Staff Directory</span>
              </Link>
              <Link 
                to="/leave"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Leave Management</span>
              </Link>
              <Link 
                to="/attendance"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <CalendarCheck2 className="h-3.5 w-3.5" />
                <span>Attendance Logs</span>
              </Link>
              <Link 
                to="/payroll"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Wage Compiler</span>
              </Link>
              <Link 
                to="/reports"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Memos &amp; Org Files</span>
              </Link>
              <Link 
                to="/files"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Folder className="h-3.5 w-3.5 text-amml-orange" />
                <span>Master File Registry</span>
              </Link>
            </div>
          </div>

          {/* Clusters & Markets */}
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Operations &amp; Clusters</span>
            <div className="space-y-0.5">
              <Link 
                to="/dashboard"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Master Deck</span>
              </Link>
              <Link 
                to="/infrastructure"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Server className="h-3.5 w-3.5 text-emerald-400" />
                <span>Infrastructure NOC</span>
              </Link>
              <Link 
                to="/devices"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Ingest Nodes</span>
              </Link>
              <Link 
                to="/markets"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <CandlestickChart className="h-3.5 w-3.5" />
                <span>Asset Markets</span>
              </Link>
              <Link 
                to="/inventory"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Inventory Ledger</span>
              </Link>
              <Link 
                to="/telemetry"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Radio className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                <span>Network Telemetry</span>
              </Link>
            </div>
          </div>

          {/* Gateways & AI */}
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>Gateways &amp; AI</span>
            <div className="space-y-0.5">
              <Link 
                to="/classifier"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Classifier Lane</span>
              </Link>
              <Link 
                to="/terminal"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Staff Terminal</span>
              </Link>
              <Link 
                to="/insights"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-450 animate-pulse" />
                <span>AI Analyzer Suite</span>
              </Link>
            </div>
          </div>

          {/* Governance & System */}
          <div className={styles.navSection}>
            <span className={styles.navSectionTitle}>System Governance</span>
            <div className="space-y-0.5">
              <Link 
                to="/users"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <UserSquare2 className="h-3.5 w-3.5" />
                <span>Portal Accounts</span>
              </Link>
              <Link 
                to="/audit"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Audit &amp; Assurance</span>
              </Link>
              <Link 
                to="/alerts"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <BellDot className="h-3.5 w-3.5" />
                <span>Active Alerts</span>
              </Link>
              <Link 
                to="/settings"
                onClick={closeMobileNav}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded font-mono text-[11px] tracking-wider uppercase text-amml-text2/80 hover:text-amml-orange hover:bg-amml-surface3 transition-all"
                activeProps={{ className: "bg-amml-surface3! text-amml-orange! font-bold border-l-2 border-amml-orange!" }}
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span>Global Policies</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* User Session Footer */}
        <div id="sidebar-footer-session" className={styles.sidebarFooter}>
          <div className="flex items-center gap-3 p-2 bg-amml-surface border border-amml-line rounded-lg">
            <div className="h-8 w-8 rounded bg-[#0064B4]/20 flex items-center justify-center font-mono text-xs font-bold text-amml-text border border-[#0064B4]/40">
              {(session.staffId || session.id).slice(-3)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block font-sans text-xs font-semibold text-amml-text truncate">{session.name}</span>
              <span className="block font-mono text-[9px] text-amml-blue truncate tracking-wider uppercase">{session.level}</span>
            </div>
            <span className="h-2 w-2 bg-[#0064B4] rounded-full animate-pulse" />
          </div>
        </div>
      </aside>

      {/* 2. Header Grid Area */}
      <header id="amml-topbar-header" className={styles.header}>
        <div className={styles.headerLeft}>
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            className={styles.mobileNavToggle}
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] tracking-widest text-amml-text2 uppercase bg-amml-surface2 px-3 py-1.5 rounded-lg border border-amml-line">
            <span className={`h-2 w-2 rounded-full ${isPulseActive ? 'bg-emerald-500 animate-ping' : 'bg-orange-500 animate-pulse'}`} />
            <span className="text-amml-muted">STREAM:</span>
            <span className={isPulseActive ? 'text-emerald-500 font-bold' : 'text-orange-500 font-bold'}>
              {isPulseActive ? 'PULSE_ACTIVE' : 'STANDBY'}
            </span>
          </div>

          <BackendConnectionMonitor />

          {/* Global Telemetry & Personnel Search Trigger */}
          <button
            id="global-header-search-trigger"
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amml-line bg-amml-surface2/90 hover:bg-amml-surface3 text-slate-700 dark:text-slate-300 font-mono text-xs transition-all cursor-pointer group shadow-xs"
            title="Search telemetry & HR records (Cmd+K)"
          >
            <Search className="h-3.5 w-3.5 text-amml-orange shrink-0 group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline font-sans text-xs text-amml-muted">Search telemetry, nodes, roster...</span>
            <span className="md:hidden font-sans text-xs text-amml-muted">Search...</span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-amml-panel border border-amml-line text-amml-muted ml-1">
              ⌘K
            </kbd>
          </button>
        </div>

        <div className={styles.headerRight}>
          {/* Dispatch simulation scanner button */}
          <div className="hidden md:flex items-center gap-1.5 border border-amml-line bg-amml-surface2 p-1 rounded text-xs">
            <span className="font-mono text-[9px] text-amml-muted uppercase px-1.5">SIM_</span>
            <button 
              id="btn-trigger-scan"
              onClick={() => triggerSimulateScan(session.staffId || session.id)}
              className="px-2 py-1 bg-[#0064B4] hover:bg-[#00508C] text-white font-mono text-[9px] tracking-widest font-bold uppercase rounded cursor-pointer transition-colors"
              title="Simulate badge scan at terminal"
            >
              BADGE SCAN
            </button>
          </div>

          {/* Pulse stream toggler */}
          <button
            id="btn-toggle-pulse"
            onClick={() => setIsPulseActive(!isPulseActive)}
            className={`px-2.5 py-1 rounded font-mono text-[10px] tracking-widest font-bold uppercase cursor-pointer border transition-all ${
              isPulseActive 
                ? 'bg-red-500/20 border-red-500/40 text-red-500 hover:bg-red-500/30' 
                : 'bg-[#DC6400] hover:bg-[#B34C00] border-[#DC6400]/30 text-white shadow-xs'
            }`}
          >
            {isPulseActive ? 'HALT PULSE' : 'ENGAGE'}
          </button>

          {/* Global Theme Switcher Utility */}
          <ThemeSwitcher variant="segmented" />

          {/* Manual Sync click */}
          <button
            id="btn-force-refresh"
            onClick={forceManualRefresh}
            className="p-1.5 bg-amml-surface2 hover:bg-amml-surface3 border border-amml-line text-amml-text rounded transition-colors cursor-pointer"
            title="Force manual snapshot sync query"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-amml-blue' : ''}`} />
          </button>

          {/* Log Out button */}
          <button
            id="btn-user-signout"
            onClick={handleLogout}
            className="flex items-center gap-1 px-2.5 py-1 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded font-mono text-[10px] tracking-widest font-semibold uppercase cursor-pointer transition-colors"
            title="Terminate session"
          >
            <LogOut className="h-3 w-3" />
            <span className="hidden sm:inline">TERMINATE</span>
          </button>
        </div>
      </header>

      {/* 3. Main Content Grid Area */}
      <main id="amml-main-content" className={styles.main}>
        <AmmlBreadcrumb />
        <Outlet />
      </main>

      {/* Alert Scan Toast Portal Overlay */}
      {toast && (
        <div 
          id="toast-scan-portal"
          className="fixed bottom-6 right-6 z-50 max-w-sm bg-amml-panel border-2 border-amml-green p-4 rounded-xl shadow-2xl animate-stage-wake flex items-start gap-3"
        >
          <div className="p-2 bg-amml-green-2 rounded text-amml-text">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-bold text-amml-green uppercase tracking-widest">INGEST ALERT PULSE</span>
              <button 
                onClick={() => setToast(null)}
                className="text-amml-muted hover:text-amml-text font-mono text-[12px] p-0.5 leading-none cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="font-mono text-xs font-semibold text-amml-text mt-1 uppercase">
              {toast.clockOut ? 'CLOCK OUT INGESTION' : 'CLOCK IN INGESTION'}
            </p>
            <p className="font-mono text-[10px] text-amml-muted mt-0.5 truncate">
              {toast.staffName} ({toast.dept}) @ {toast.market}
            </p>
            <div className="flex items-center gap-2 mt-2 font-mono text-[9px] text-amml-green">
              <span>DEVICE: {toast.device}</span>
              <span>•</span>
              <span>TIME: {toast.clockOut || toast.clockIn}</span>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Alert Notification Stack & Theme Indicator Badge */}
      <AlertNotificationSystem />
      <ThemeIndicatorBadge />

      {/* Global Command & Telemetry Search Modal */}
      <GlobalCommandSearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
      />
    </div>
  );
};
