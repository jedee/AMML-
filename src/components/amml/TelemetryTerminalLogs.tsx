import React, { useEffect, useRef, useState } from 'react';
import { Terminal, Shield, RefreshCw, Trash2, ShieldAlert, Cpu } from 'lucide-react';

export interface CryptoLogEntry {
  id: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARN' | 'CRITICAL';
  module: string;
  message: string;
  signature?: string;
}

interface TelemetryTerminalLogsProps {
  logs: CryptoLogEntry[];
  onClearLogs?: () => void;
  onRunIntegrityCheck?: () => void;
  isSimulating?: boolean;
}

export const TelemetryTerminalLogs: React.FC<TelemetryTerminalLogsProps> = ({
  logs,
  onClearLogs,
  onRunIntegrityCheck,
  isSimulating = false,
}) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'ALL' | 'SUCCESS' | 'WARN' | 'CRITICAL'>('ALL');

  // Auto-scroll to bottom of terminal when logs render
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.type === filter;
  });

  const getTypeStyle = (type: CryptoLogEntry['type']) => {
    switch (type) {
      case 'SUCCESS':
        return 'text-emerald-400 font-bold';
      case 'WARN':
        return 'text-amber-500 font-semibold animate-pulse';
      case 'CRITICAL':
        return 'text-rose-500 font-extrabold animate-pulse';
      case 'INFO':
      default:
        return 'text-sky-400';
    }
  };

  return (
    <div className="bg-[#030811] border-2 border-[#1E293B] rounded-xl overflow-hidden shadow-2xl flex flex-col h-[400px]">
      {/* Terminal Titlebar Header */}
      <div className="bg-[#0B1524] border-b border-[#1E293B] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span className="font-mono text-xs text-slate-300 font-bold tracking-widest uppercase">
            SECURE_CRYPTO_SYNCHRONIZER_SHELL (v2.0A)
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded-full font-bold ml-2 animate-pulse">
            {isSimulating ? 'STREAMING' : 'STANDBY'}
          </span>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRunIntegrityCheck}
            className="flex items-center gap-1.5 bg-[#0F1D30] hover:bg-[#1E2E44] border border-[#1E293B] hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded transition-colors cursor-pointer"
            title="Deploy cryptographic block integrity signature sweep"
          >
            <Shield className="h-3 w-3" />
            <span>INTEGRITY_CHECK</span>
          </button>
          
          <button
            type="button"
            onClick={onClearLogs}
            className="p-1 hover:bg-rose-950/20 text-slate-400 hover:text-rose-450 rounded border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            title="Clear secure shell history log"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Filter Nav Bar */}
      <div className="bg-[#050C16] px-4 py-1.5 border-b border-[#1E293B] flex items-center gap-2 text-[10px] font-mono">
        <span className="text-slate-500 uppercase tracking-widest mr-2">Display Filter:</span>
        {(['ALL', 'SUCCESS', 'WARN', 'CRITICAL'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
              filter === f 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold' 
                : 'text-slate-400 hover:text-white border border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Terminal Display Stream Terminal Body */}
      <div 
        ref={terminalRef} 
        className="flex-1 p-4 overflow-y-auto scrollbar-thin select-text font-mono text-xs text-slate-300 space-y-1.5 bg-[#030811] scroll-smooth"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-2 select-none">
            <Cpu className="h-8 w-8 text-slate-650 animate-pulse" />
            <p className="uppercase text-[10px] tracking-widest font-semibold">Terminal logs empty. Engage streaming gateway to populate crypto feeds.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} className="hover:bg-white/5 p-1 rounded transition-colors flex items-start gap-2 border-l border-transparent hover:border-emerald-500/20">
              <span className="text-slate-500 select-none">[{log.timestamp}]</span>
              <span className={`uppercase font-bold shrink-0 select-none min-w-[65px] ${getTypeStyle(log.type)}`}>
                [{log.type}]
              </span>
              <span className="text-emerald-500/90 font-bold select-none min-w-[120px] uppercase truncate" title={log.module}>
                [{log.module}]
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 leading-normal font-medium">{log.message}</p>
                {log.signature && (
                  <span className="block text-[10px] text-slate-500 font-mono tracking-wider mt-0.5 truncate uppercase">
                    ↳ SHA-256 Sig Check: {log.signature}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Terminal Status Bar Footer */}
      <div className="bg-[#050C16] border-t border-[#1E293B] px-4 py-1.5 flex items-center justify-between text-[9px] font-mono text-slate-500 select-none">
        <div className="flex items-center gap-3">
          <span>HOST: fct-crypto-dispatch-04</span>
          <span>•</span>
          <span>SYNC_PORT: 30006_</span>
        </div>
        <div>
          <span>RECORDS: {filteredLogs.length} OF {logs.length} SHOWING</span>
        </div>
      </div>
    </div>
  );
};
