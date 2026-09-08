import React, { useState } from 'react';
import { useAmmlStore } from '../../lib/amml/store';
import { Search, Database, ListFilter, AlertTriangle, ShieldCheck, Info, CheckCircle, RefreshCw, Clock } from 'lucide-react';

export const ActivityLogView: React.FC = () => {
  const { activityLog } = useAmmlStore();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [nodeFilter, setNodeFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('ALL'); // ALL, L1H, L24H, L7D

  const uniqueTypes = ['LOGIN', 'ATTENDANCE', 'IMPORT', 'DEVICE', 'SETTINGS', 'SYSTEM', 'INVENTORY'];

  const nodeMap = [
    { id: 'node-Garki', name: 'Garki Ingestion Hub' },
    { id: 'node-Wuse', name: 'Wuse Terminal Node A' },
    { id: 'node-Kaura', name: 'Kaura Modern Portal' },
    { id: 'node-Utako', name: 'Utako Market Outpost Node' },
    { id: 'node-Hq', name: 'Abuja HQ Primary Node' },
    { id: 'node-Nyanya', name: 'Nyanya Regional Bridge' },
  ];

  // Helper: map a log item to a helper severity level
  const getSeverity = (log: any) => {
    if (log.severity) return log.severity;
    const act = (log.action || '').toLowerCase();
    const det = (log.details || '').toLowerCase();
    const typeStr = (log.type || '').toUpperCase();
    
    if (
      typeStr === 'SYSTEM' || 
      act.includes('fail') || 
      det.includes('fail') || 
      det.includes('overflow') || 
      det.includes('block') || 
      act.includes('mismatch') ||
      act.includes('unauthorized')
    ) {
      return 'CRITICAL';
    }
    
    if (
      act.includes('adjust') || 
      det.includes('backlog') || 
      act.includes('warning') || 
      det.includes('pruned') ||
      det.includes('flush')
    ) {
      return 'WARNING';
    }
    
    if (
      act.includes('complete') || 
      act.includes('success') || 
      act.includes('register') || 
      act.includes('login') || 
      typeStr === 'LOGIN' || 
      typeStr === 'ATTENDANCE'
    ) {
      return 'SUCCESS';
    }
    
    return 'INFO';
  };

  // Helper: map a log item to a Node ID
  const getNodeID = (log: any) => {
    const text = `${log.action} ${log.details} ${log.type}`.toLowerCase();
    if (text.includes('garki')) return 'node-Garki';
    if (text.includes('wuse')) return 'node-Wuse';
    if (text.includes('kaura')) return 'node-Kaura';
    if (text.includes('utako')) return 'node-Utako';
    if (text.includes('nyanya')) return 'node-Nyanya';
    return 'node-Hq'; // Falls back to Central HQ / global
  };

  // Helper: parse string date ('YYYY-MM-DD') & time ('HH:mm:ss') back to a real Date
  const parseLogDateTime = (dateStr: string, timeStr: string) => {
    try {
      const dateParts = dateStr.split('-');
      if (dateParts.length < 3) return new Date();
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);

      const timeParts = timeStr.split(':');
      const hours = timeParts[0] ? parseInt(timeParts[0], 10) : 0;
      const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;
      const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

      return new Date(year, month, day, hours, minutes, seconds);
    } catch {
      return new Date();
    }
  };

  // Main filter pipeline
  const filteredLogs = activityLog.map(log => ({
    ...log,
    calculatedSeverity: getSeverity(log),
    calculatedNode: getNodeID(log),
    realDate: parseLogDateTime(log.date, log.time)
  })).filter(log => {
    // 1. Text Search Match
    const sMatch = !search || `${log.user} ${log.action} ${log.details} ${log.type} ${log.id}`.toLowerCase().includes(search.toLowerCase());
    
    // 2. Action Type Match
    const tMatch = !typeFilter || log.type === typeFilter;
    
    // 3. Severity Match
    const sevMatch = !severityFilter || log.calculatedSeverity === severityFilter;

    // 4. Node ID Match
    const ndMatch = !nodeFilter || log.calculatedNode === nodeFilter;

    // 5. Time Difference Spans
    let timeMatch = true;
    if (timeFilter !== 'ALL') {
      const now = new Date();
      const diffMs = now.getTime() - log.realDate.getTime();
      const oneHour = 60 * 60 * 1000;
      const twentyFourHours = 24 * oneHour;
      const sevenDays = 7 * twentyFourHours;

      if (timeFilter === 'L1H') {
        timeMatch = diffMs <= oneHour;
      } else if (timeFilter === 'L24H') {
        timeMatch = diffMs <= twentyFourHours;
      } else if (timeFilter === 'L7D') {
        timeMatch = diffMs <= sevenDays;
      }
    }

    return sMatch && tMatch && sevMatch && ndMatch && timeMatch;
  });

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setSeverityFilter('');
    setNodeFilter('');
    setTimeFilter('ALL');
  };

  return (
    <div className="space-y-6 animate-stage-wake text-left">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Audit Trail</h2>
        <p className="text-amml-text3 text-sm mt-1">
          Cryptographically signed, immutable ledger stream of portal access triggers, localized hardware sync handshakes and log streams.
        </p>
      </div>

      {/* Structured Query & Advanced Filtering Interface */}
      <div className="bg-amml-panel border border-amml-line rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amml-line pb-3">
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-amml-blue animate-pulse" />
            <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider">Log Query & Troubleshooting Filter</h3>
          </div>
          {(search || typeFilter || severityFilter || nodeFilter || timeFilter !== 'ALL') && (
            <button
              onClick={handleResetFilters}
              className="text-[10px] font-mono font-bold text-amml-orange hover:text-amml-orange-lt cursor-pointer outline-none transition-colors border-b border-dashed border-amml-orange/50 py-0.5"
            >
              Reset Query Parameters
            </button>
          )}
        </div>

        {/* 2-Row Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pb-1">
          {/* Main search text input */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by action, user, or details..."
              className="w-full bg-amml-surface border border-amml-line focus:border-amml-blue focus:ring-1 focus:ring-amml-blue pl-9 pr-3 py-2 rounded-lg text-xs font-mono text-slate-200 outline-none transition-all placeholder:text-slate-600"
            />
          </div>

          {/* Action Type Dropdown */}
          <div className="md:col-span-2.5">
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-xs font-mono text-slate-200 outline-none cursor-pointer hover:border-slate-700"
            >
              <option className="bg-amml-panel text-slate-350" value="">All Event Sectors</option>
              {uniqueTypes.map((t, index) => (
                <option className="bg-amml-panel text-slate-200" key={index} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Severity Dropdown */}
          <div className="md:col-span-2.5">
            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-xs font-mono text-slate-200 outline-none cursor-pointer hover:border-slate-700"
            >
              <option className="bg-amml-panel text-slate-350" value="">All Severities</option>
              <option className="bg-amml-panel text-emerald-400 font-bold" value="SUCCESS">🟢 SUCCESS</option>
              <option className="bg-amml-panel text-sky-400 font-bold" value="INFO">🔵 INFO</option>
              <option className="bg-amml-panel text-amber-500 font-bold" value="WARNING">🟡 WARNING</option>
              <option className="bg-amml-panel text-rose-500 font-bold" value="CRITICAL">🔴 CRITICAL</option>
            </select>
          </div>

          {/* Time range selector */}
          <div className="md:col-span-2">
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full bg-amml-surface border border-amml-line px-3 py-2 rounded-lg text-xs font-mono text-slate-200 outline-none cursor-pointer hover:border-slate-700"
            >
              <option className="bg-amml-panel" value="ALL">All Spans</option>
              <option className="bg-amml-panel" value="L1H">Last 1 Hour</option>
              <option className="bg-amml-panel" value="L24H">Last 24 Hours</option>
              <option className="bg-amml-panel" value="L7D">Last 7 Days</option>
            </select>
          </div>
        </div>

        {/* Node ID selection Row */}
        <div className="pt-2 border-t border-dashed border-amml-line flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-extrabold mr-1">Node Gateway Filter:</span>
          
          <button
            onClick={() => setNodeFilter('')}
            className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wide rounded-md border transition-all cursor-pointer ${
              !nodeFilter 
                ? 'bg-amml-blue/15 border-amml-blue text-sky-400 font-bold' 
                : 'bg-amml-surface border-transparent text-slate-450 hover:text-slate-200 hover:bg-amml-surface3'
            }`}
          >
            All nodes ({activityLog.length})
          </button>

          {nodeMap.map(node => {
            const countOnNode = activityLog.filter(l => getNodeID(l) === node.id).length;
            return (
              <button
                key={node.id}
                onClick={() => setNodeFilter(node.id)}
                className={`px-3 py-1 text-[10px] uppercase font-mono tracking-wide rounded-md border transition-all cursor-pointer ${
                  nodeFilter === node.id 
                    ? 'bg-amml-blue/15 border-amml-blue text-sky-400 font-bold' 
                    : 'bg-amml-surface border-transparent text-slate-450 hover:text-slate-200 hover:bg-amml-surface3'
                }`}
              >
                {node.name.replace(" Market Outpost Node", "").replace(" Ingestion Hub", "").replace(" Regional Bridge", "")} ({countOnNode})
              </button>
            );
          })}
        </div>
      </div>

      {/* Log list List card */}
      <div className="bg-amml-panel border border-amml-line rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-amml-line bg-amml-surface2/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text flex items-center gap-2">
            <Database className="h-4 w-4 text-slate-400" /> 
            <span>Active Ledger Stream ({filteredLogs.length} matching entries)</span>
          </h3>
          <div className="text-[10px] font-mono text-slate-500 uppercase bg-[#050C16] border border-white/5 rounded-md px-2.5 py-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amml-blue" />
            <span>Time constraint applied: <strong>{timeFilter === 'ALL' ? 'ALL_LOGS' : timeFilter}</strong></span>
          </div>
        </div>

        {/* Logs viewport list */}
        <div className="divide-y divide-amml-line max-h-[580px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-20 text-slate-500 text-xs font-mono uppercase bg-[#030811]/40">
              <AlertTriangle className="h-8 w-8 text-amml-orange mx-auto mb-2 animate-bounce" />
              <span>Query resolved zero audit records. Adjust filters above.</span>
            </div>
          ) : (
            filteredLogs.map(log => {
              // Color parameters for severity badges
              let badgeColor = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
              let Icon = Info;
              
              if (log.calculatedSeverity === 'CRITICAL') {
                badgeColor = 'bg-rose-500/10 text-rose-455 border-rose-500/25 font-black animate-pulse';
                Icon = AlertTriangle;
              } else if (log.calculatedSeverity === 'WARNING') {
                badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                Icon = AlertTriangle;
              } else if (log.calculatedSeverity === 'SUCCESS') {
                badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                Icon = ShieldCheck;
              }

              const targetNodeName = nodeMap.find(n => n.id === log.calculatedNode)?.name || 'HQ Primary Node';

              return (
                <div key={log.id} className="p-4 text-xs sm:text-sm hover:bg-[#1E2E44]/10 transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  {/* Left Detail Stack */}
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-white font-bold bg-[#0E1A2B] border border-amml-line px-2 py-0.5 rounded text-[11px] truncate">
                        👤 {log.user}
                      </span>
                      
                      <span className={`px-2 py-0.5 rounded text-[9px] border font-bold uppercase ${badgeColor} flex items-center gap-1`}>
                        <Icon className="h-3 w-3" />
                        <span>{log.calculatedSeverity}</span>
                      </span>

                      <span className="text-[10px] font-mono uppercase bg-amml-surface border border-amml-line text-sky-400 px-1.5 py-0.5 rounded">
                        🖥️ {targetNodeName.split(" ")[0]} Node
                      </span>

                      <span className="text-slate-500 text-[10px] font-mono tracking-wider ml-1">
                        ⏱️ {log.time} • {log.date}
                      </span>
                    </div>

                    <p className="text-slate-250 font-bold text-xs sm:text-sm">{log.action}</p>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-4xl">{log.details}</p>
                  </div>

                  {/* Right Status badge */}
                  <div className="shrink-0 text-left md:text-right">
                    <span className="text-[10px] font-mono font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded">
                      {log.status}
                    </span>
                    <span className="block text-[8px] text-slate-550 font-mono mt-1.5 uppercase">ID: {log.id}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
