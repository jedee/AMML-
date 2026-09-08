import React, { useEffect, useState, useRef } from 'react';
import { mockTelemetryStore, TelemetryPacket } from '../../lib/amml/telemetry';
import { ShieldAlert, AlertTriangle, Terminal, RefreshCw, Layers } from 'lucide-react';

export const IncidentLogFeed: React.FC = () => {
  const [incidents, setIncidents] = useState<TelemetryPacket[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate initial historical warnings to provide a rich UI immediately
    const now = Date.now();
    const historicalIncidents: TelemetryPacket[] = [
      {
        id: `hist-inc-1`,
        timestamp: new Date(now - 300000).toISOString(),
        type: 'CRITICAL',
        module: 'GATEWAY_SHAKE',
        message: 'CRITICAL PANIC: Host GUDU-TERM-02 reported packet sequence mismatch (AES-256 integrity failed). Handshake rejected.',
        signature: '0x9fa45de99901ac82',
        nodeId: 'GUDU-TERM-02',
        latencyMs: 245,
        bandwidthKbps: 8.2
      },
      {
        id: `hist-inc-2`,
        timestamp: new Date(now - 120000).toISOString(),
        type: 'WARN',
        module: 'BIOMETRICS_INGEST',
        message: 'WARNING: Ingress node WUSE-MAIN-01 experienced buffer pressure threshold overflow (>85% packet queue size). Re-routing.',
        signature: '0x14f2e903ab26f90d',
        nodeId: 'WUSE-MAIN-01',
        latencyMs: 98,
        bandwidthKbps: 94.1
      }
    ];
    setIncidents(historicalIncidents);

    // Subscribe to online telemetry stream
    const unsubscribe = mockTelemetryStore.subscribe((packet) => {
      if (packet.type === 'CRITICAL' || packet.type === 'WARN') {
        setIncidents(prev => {
          // Prevent duplicates by checking ID
          if (prev.some(p => p.id === packet.id)) return prev;
          const next = [packet, ...prev];
          return next.slice(0, 40); // Cap at 40 incidents for screen efficiency
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleClear = () => {
    setIncidents([]);
  };

  return (
    <div id="amml-incident-log-feed" className="bg-amml-ink border border-amml-line rounded-xl overflow-hidden shadow-md flex flex-col h-[350px]">
      {/* Feed Header */}
      <div className="bg-amml-panel border-b border-amml-line px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-amml-orange animate-pulse" />
          <div>
            <h3 className="font-mono text-[11px] font-extrabold text-amml-text uppercase tracking-widest">
              NOC Critical Incident Stream
            </h3>
            <p className="font-mono text-[8px] text-amml-muted uppercase mt-0.5">
              Automated anomaly & threat logs
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full font-extrabold animate-pulse">
            {incidents.filter(i => i.type === 'CRITICAL').length} CRITICAL
          </span>
          <button
            type="button"
            onClick={handleClear}
            className="font-mono text-[9px] hover:text-red-500 text-amml-muted transition-colors px-1 py-0.5"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* Stream Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin select-text"
      >
        {incidents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-amml-muted space-y-2 select-none">
            <Layers className="h-8 w-8 text-amml-muted/30 animate-pulse" />
            <p className="font-mono text-[10px] uppercase tracking-wider font-semibold">No critical incidents logged in buffer.</p>
            <p className="font-mono text-[8px] uppercase text-amml-muted">Grid is operating inside green parameters</p>
          </div>
        ) : (
          incidents.map((inc) => {
            const isCritical = inc.type === 'CRITICAL';
            
            return (
              <div 
                key={inc.id}
                className={`p-3 rounded-lg border text-xs font-mono transition-all duration-300 flex gap-3 ${
                  isCritical 
                    ? 'bg-rose-500/5 dark:bg-rose-500/10 border-rose-500/25 dark:border-rose-500/20 hover:border-rose-500/40 text-amml-text' 
                    : 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/25 dark:border-amber-500/20 hover:border-amber-500/40 text-amml-text'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {isCritical ? (
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[9px] text-amml-muted">
                    <span className="font-bold uppercase tracking-wider bg-black/10 dark:bg-white/5 px-2 py-0.5 rounded">
                      {inc.nodeId}
                    </span>
                    <span>{new Date(inc.timestamp).toLocaleTimeString('en-NG')}</span>
                  </div>

                  <p className="text-amml-text font-bold leading-normal text-[11px]">
                    {inc.message}
                  </p>

                  <div className="flex items-center gap-3 text-[9px] text-amml-muted">
                    <span>LATENCY: <strong className="text-amml-text">{inc.latencyMs}ms</strong></span>
                    <span>•</span>
                    <span>BANDWIDTH: <strong className="text-amml-text">{inc.bandwidthKbps} Kbps</strong></span>
                    {inc.signature && (
                      <>
                        <span>•</span>
                        <span className="truncate">SIG: <strong className="text-amml-text text-[8px]">{inc.signature}</strong></span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="bg-amml-panel border-t border-amml-line px-4 py-2 flex items-center justify-between text-[8px] font-mono text-amml-muted select-none">
        <span>SECURITY_ZONE: FCT_ABUJA</span>
        <span>RECORDS LOGGED: {incidents.length}</span>
      </div>
    </div>
  );
};
