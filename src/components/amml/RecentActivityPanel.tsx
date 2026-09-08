import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAmmlStore } from '../../lib/amml/store';
import { 
  Activity, 
  Terminal, 
  UserCheck, 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Zap, 
  ChevronRight, 
  X, 
  Download, 
  Trash2, 
  ArrowUpRight,
  User,
  Server,
  RefreshCw
} from 'lucide-react';
import { StatusBadge } from './SharedDataCardLayout';
import { AmmlActivityLog } from '../../lib/amml/types';

export const RecentActivityPanel: React.FC = () => {
  const navigate = useNavigate();
  const { activityLog, setActivityLog, att, devices, auditLog, session } = useAmmlStore();

  const [activeCategory, setActiveCategory] = useState<'ALL' | 'USER_ACTIONS' | 'SYSTEM_ALERTS' | 'INGEST_EVENTS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AmmlActivityLog | null>(null);

  // Combine store activity logs with recent attendance events and node status events
  const combinedLogFeed = useMemo(() => {
    // 1. Existing activity logs from store
    const userLogs = activityLog.map(log => ({
      ...log,
      category: (log.type?.toUpperCase().includes('LOGIN') || log.type?.toUpperCase().includes('USER') || log.type?.toUpperCase().includes('HR') || log.type?.toUpperCase().includes('STAFF'))
        ? 'USER_ACTIONS'
        : (log.type?.toUpperCase().includes('SYSTEM') || log.type?.toUpperCase().includes('ALERT') || log.type?.toUpperCase().includes('FAIL'))
          ? 'SYSTEM_ALERTS'
          : 'USER_ACTIONS',
      badgeVariant: log.status === 'SUCCESS' ? 'green' : log.status === 'FAILED' ? 'red' : 'blue'
    }));

    // 2. Derive Recent Ingest Clock Events (today's clock-ins/outs)
    const todayStr = new Date().toISOString().slice(0, 10);
    const recentIngestLogs = att.slice(0, 8).map(a => ({
      id: `ingest-${a.id}`,
      time: a.clockOut || a.clockIn || '10:00:00',
      date: a.date || todayStr,
      user: a.staffName,
      type: 'INGEST_SCAN',
      action: a.clockOut ? 'Clocked Out at Terminal' : 'Clocked In at Terminal',
      details: `Terminal: ${a.device} | Market: ${a.market} | Department: ${a.dept} | Late: ${a.late ? 'YES' : 'NO'}`,
      status: a.late ? 'WARNING' : 'SUCCESS',
      category: 'INGEST_EVENTS',
      badgeVariant: a.late ? 'amber' : 'green'
    }));

    // 3. Derive System Device Offline Alerts
    const offlineDeviceLogs = devices.filter(d => !d.active).map(d => ({
      id: `alert-${d.id}`,
      time: d.lastSeen || '08:00:00',
      date: todayStr,
      user: 'SYSTEM_NOC',
      type: 'NODE_OFFLINE',
      action: `Hardware Node Disconnected: ${d.name}`,
      details: `Device Serial: ${d.serial} at ${d.market} is non-responsive. Auto-alert raised.`,
      status: 'ALERT',
      category: 'SYSTEM_ALERTS',
      badgeVariant: 'red'
    }));

    // Merge all logs and sort chronologically (newest first)
    const merged = [...userLogs, ...recentIngestLogs, ...offlineDeviceLogs];
    
    // De-duplicate by ID
    const seen = new Set();
    return merged.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).sort((a, b) => b.time.localeCompare(a.time));
  }, [activityLog, att, devices]);

  // Filter logs by category and search query
  const filteredFeed = combinedLogFeed.filter(log => {
    const matchesCategory = activeCategory === 'ALL' || log.category === activeCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const searchable = `${log.user} ${log.action} ${log.details} ${log.type} ${log.time} ${log.status}`.toLowerCase();
    return searchable.includes(q);
  });

  // Export feed to CSV
  const handleExportCSV = () => {
    const headers = 'ID,Date,Time,User,Category,Action,Details,Status\n';
    const rows = filteredFeed.map(l => 
      `"${l.id}","${l.date}","${l.time}","${l.user}","${l.category}","${l.action.replace(/"/g, '""')}","${l.details.replace(/"/g, '""')}","${l.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AMML_Recent_Activity_Feed_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    auditLog('EXPORT', 'Exported recent activity feed', `Generated CSV log extract with ${filteredFeed.length} items`);
  };

  // Clear feed simulation
  const handleClearFeed = () => {
    if (confirm('Are you sure you want to clear volatile activity log buffers?')) {
      setActivityLog([]);
      auditLog('SYSTEM', 'Cleared volatile activity feed', 'Flushed in-memory activity logs from dashboard buffer');
    }
  };

  return (
    <div className="bg-amml-surface border border-amml-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between text-left font-mono">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-amml-border bg-gradient-to-r from-amml-surface2/80 via-amml-panel to-amml-surface2/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-amml-orange animate-pulse" />
            <h3 className="font-serif text-base font-bold text-amml-text tracking-tight">Recent Activity Log Feed</h3>
            <span className="px-2 py-0.5 rounded-full bg-amml-surface3 text-amml-blue text-[10px] font-bold border border-amml-border">
              {filteredFeed.length} events
            </span>
          </div>
          <p className="text-amml-text3 font-sans text-xs mt-0.5">
            Real-time telemetry stream combining user governance actions, system notices, and terminal scan ingest.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amml-surface border border-amml-border hover:bg-amml-surface3 text-amml-text rounded-lg text-xs font-semibold font-mono transition-all cursor-pointer"
            title="Export activity log feed to CSV"
          >
            <Download className="h-3.5 w-3.5 text-amml-blue" />
            <span className="hidden md:inline">CSV Extract</span>
          </button>
          
          <button
            onClick={() => navigate({ to: '/audit' })}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amml-orange hover:bg-amml-orange-lt text-white rounded-lg text-xs font-bold font-mono transition-all cursor-pointer shadow-xs"
            title="View Full Audit & Assurance Console"
          >
            <span>Full Audit Log</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-3 border-b border-amml-border bg-amml-surface2/40 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Activity' },
            { id: 'USER_ACTIONS', label: 'User Actions' },
            { id: 'SYSTEM_ALERTS', label: 'System Alerts' },
            { id: 'INGEST_EVENTS', label: 'Terminal Ingest' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === tab.id
                  ? 'bg-amml-blue text-white shadow-xs'
                  : 'bg-amml-surface3/60 text-amml-text3 hover:text-amml-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Input */}
        <div className="relative w-full md:w-64">
          <Search className="h-3.5 w-3.5 text-amml-text3 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search feed by user, action, or log..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-amml-surface border border-amml-border rounded-lg text-xs text-amml-text placeholder-amml-text3 focus:outline-none focus:border-amml-orange"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-amml-text3 hover:text-amml-text"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Feed Event Items List */}
      <div className="divide-y divide-amml-border/60 max-h-[380px] overflow-y-auto custom-scrollbar">
        {filteredFeed.length === 0 ? (
          <div className="py-12 text-center text-amml-text3 space-y-2">
            <Activity className="h-8 w-8 mx-auto text-amml-border" />
            <p className="text-xs font-bold uppercase">No matching activity log events</p>
            <p className="text-[11px] font-sans">Try adjusting your filter category or search keyword.</p>
          </div>
        ) : (
          filteredFeed.map((log) => {
            const isAlert = log.category === 'SYSTEM_ALERTS';
            const isIngest = log.category === 'INGEST_EVENTS';

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log as AmmlActivityLog)}
                className="p-3 hover:bg-amml-surface2/60 transition-colors cursor-pointer flex items-start justify-between gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Category Icon */}
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    isAlert 
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                      : isIngest 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-amml-blue/10 text-amml-blue border border-amml-blue/20'
                  }`}>
                    {isAlert ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : isIngest ? (
                      <Zap className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-amml-text group-hover:text-amml-orange transition-colors">
                        {log.action}
                      </span>
                      <StatusBadge 
                        status={log.status || 'INFO'} 
                        variant={log.status === 'SUCCESS' ? 'green' : log.status === 'FAILED' ? 'red' : log.status === 'WARNING' ? 'amber' : 'blue'} 
                      />
                    </div>

                    <p className="text-[11px] font-sans text-amml-text2 truncate mt-1">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-amml-text3 flex-wrap">
                      <span className="flex items-center gap-1 font-bold">
                        <User className="h-3 w-3 text-amml-blue" />
                        <span>{log.user}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amml-orange" />
                        <span>{log.time}</span>
                      </span>
                      <span>•</span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  <ChevronRight className="h-4 w-4 text-amml-text3 group-hover:text-amml-orange group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Panel Footer */}
      <div className="p-3 bg-amml-surface2/80 border-t border-amml-border flex items-center justify-between text-xs">
        <span className="text-[10px] text-amml-text3">
          Showing {filteredFeed.length} of {combinedLogFeed.length} buffered log entries
        </span>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleClearFeed}
            className="text-[10px] text-amml-text3 hover:text-red-500 font-bold transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span>Flush Buffer</span>
          </button>

          <button
            onClick={() => navigate({ to: '/audit' })}
            className="text-amml-blue font-bold hover:underline flex items-center gap-1 cursor-pointer text-xs"
          >
            <span>View Full Audit Feed</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedLog && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className="w-full max-w-lg bg-amml-panel border border-amml-border rounded-xl shadow-2xl p-6 font-mono space-y-4 animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amml-border pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-amml-orange" />
                <h4 className="font-bold text-sm text-amml-text uppercase">Log Event Inspection</h4>
              </div>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-amml-surface3 rounded text-amml-text3 hover:text-amml-text cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-amml-text3 block text-[10px] uppercase font-bold">Action Header</span>
                <span className="text-amml-text font-bold text-sm block mt-0.5">{selectedLog.action}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-amml-surface2 p-3 rounded-lg border border-amml-border">
                <div>
                  <span className="text-amml-text3 block text-[10px] uppercase font-bold">Initiated By</span>
                  <span className="text-amml-text font-bold block mt-0.5">{selectedLog.user}</span>
                </div>
                <div>
                  <span className="text-amml-text3 block text-[10px] uppercase font-bold">Event Type</span>
                  <span className="text-amml-blue font-bold block mt-0.5">{selectedLog.type}</span>
                </div>
                <div>
                  <span className="text-amml-text3 block text-[10px] uppercase font-bold">Timestamp</span>
                  <span className="text-amml-text font-bold block mt-0.5">{selectedLog.date} @ {selectedLog.time}</span>
                </div>
                <div>
                  <span className="text-amml-text3 block text-[10px] uppercase font-bold">Execution Status</span>
                  <StatusBadge status={selectedLog.status} variant={selectedLog.status === 'SUCCESS' ? 'green' : 'amber'} />
                </div>
              </div>

              <div>
                <span className="text-amml-text3 block text-[10px] uppercase font-bold">Details Payload</span>
                <p className="bg-amml-surface p-3 rounded-lg border border-amml-border text-amml-text font-mono text-[11px] leading-relaxed mt-1">
                  {selectedLog.details}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-amml-border flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-amml-blue hover:bg-amml-blue-dk text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
