import React, { useEffect, useState } from 'react';
import { mockTelemetryStore, TelemetryPacket } from '../lib/amml/telemetry';
import { Network, Server, Shield, Activity, Wifi, Radio } from 'lucide-react';

interface NetworkStatusCardProps {
  className?: string;
}

export const NetworkStatusCard: React.FC<NetworkStatusCardProps> = ({ className = '' }) => {
  const [activePacket, setActivePacket] = useState<TelemetryPacket | null>(null);
  const [activeTrend, setActiveTrend] = useState<number[]>([42, 38, 45, 41, 48, 52, 44, 40]);
  const [packetCount, setPacketCount] = useState<number>(0);
  const [averageLatency, setAverageLatency] = useState<number>(44);
  const [systemHealth, setSystemHealth] = useState<number>(99.8);

  useEffect(() => {
    // Start simulation automatically if they render the status card
    mockTelemetryStore.startSimulation();

    // Subscribe to incoming telemetry logs
    const unsubscribe = mockTelemetryStore.subscribe((packet) => {
      setActivePacket(packet);
      setPacketCount(prev => prev + 1);

      // Mutate historical latency trend tracker
      setActiveTrend(prev => {
        const next = [...prev.slice(-9), packet.latencyMs];
        // Calculate dynamic average latency from trend
        const sum = next.reduce((a, b) => a + b, 0);
        setAverageLatency(Math.round(sum / next.length));
        return next;
      });

      // Dynamically fluctuate overall network health indicator based on packet warnings
      setSystemHealth(prev => {
        if (packet.type === 'CRITICAL') {
          return parseFloat((prev - 1.2).toFixed(2));
        } else if (packet.type === 'WARN') {
          return parseFloat((prev - 0.4).toFixed(2));
        } else {
          return parseFloat(Math.min(100.0, prev + 0.1).toFixed(2));
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Determine indicator colors depending on overall systemHealth level
  const getHealthStyles = () => {
    if (systemHealth < 95) {
      return {
        text: 'text-rose-500',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        pulse: 'bg-rose-500',
        label: 'DEGRADED OPERATIONS'
      };
    }
    if (systemHealth < 99) {
      return {
        text: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        pulse: 'bg-amber-500',
        label: 'WARNING: TRACE REBUILDING'
      };
    }
    return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      pulse: 'bg-emerald-400',
      label: 'MESH OPTIMAL - AES-256 ACTIVE'
    };
  };

  const status = getHealthStyles();

  return (
    <div
      id="amml-mesh-status-card"
      className={`bg-amml-panel/85 border border-amml-line hover:border-amml-blue/40 rounded-xl p-5 shadow-xl transition-all duration-300 relative overflow-hidden backdrop-blur-md ${className}`}
    >
      {/* Background Decorative Lines representing Mesh Nodes */}
      <div className="absolute right-0 top-0 opacity-5 pointer-events-none select-none">
        <Network size={200} className="text-amml-text" />
      </div>

      <div className="space-y-4">
        {/* Card Titlebar Header */}
        <div className="flex items-center justify-between border-b border-amml-line pb-3">
          <div className="flex items-center gap-2.5">
            <Radio className="h-4.5 w-4.5 text-sky-500 dark:text-sky-400 animate-pulse" />
            <div>
              <h3 className="font-mono text-[11px] font-extrabold uppercase tracking-widest text-amml-text">
                FCT MESH NETWORK HEALTH
              </h3>
              <p className="font-mono text-[8px] text-amml-text3 uppercase mt-0.5">
                AUTONOMOUS ROUTING INTERFACE
              </p>
            </div>
          </div>
          
          <div className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-extrabold flex items-center gap-1.5 border ${status.bg} ${status.text} ${status.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full animate-ping ${status.pulse}`} />
            <span>{status.label}</span>
          </div>
        </div>

        {/* Major Health Metrics Summary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
          <div className="bg-amml-surface/40 hover:bg-amml-surface/60 border border-amml-line p-3 rounded-lg flex flex-col justify-between">
            <span className="font-mono text-[8px] text-amml-text2 uppercase tracking-wider">System Integrity</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-lg font-bold text-amml-text">{systemHealth}%</span>
            </div>
          </div>

          <div className="bg-amml-surface/40 hover:bg-amml-surface/60 border border-amml-line p-3 rounded-lg flex flex-col justify-between">
            <span className="font-mono text-[8px] text-amml-text2 uppercase tracking-wider">Avg Gateway Latency</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-lg font-bold text-amml-text">{averageLatency}ms</span>
            </div>
          </div>

          <div className="bg-amml-surface/40 hover:bg-amml-surface/60 border border-amml-line p-3 rounded-lg flex flex-col justify-between">
            <span className="font-mono text-[8px] text-amml-text2 uppercase tracking-wider">Ingress Bandwidth</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-lg font-bold text-amml-text">
                {activePacket ? activePacket.bandwidthKbps : '124.5'}
              </span>
              <span className="font-mono text-[8px] text-amml-text3 uppercase">Kbps</span>
            </div>
          </div>

          <div className="bg-amml-surface/40 hover:bg-amml-surface/60 border border-amml-line p-3 rounded-lg flex flex-col justify-between">
            <span className="font-mono text-[8px] text-amml-text2 uppercase tracking-wider">Telemetry Scans Received</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="font-mono text-lg font-bold text-amml-text">{packetCount}</span>
            </div>
          </div>
        </div>

        {/* Live Vector Stream Trace */}
        {activePacket && (
          <div className="bg-amml-surface2/60 border border-amml-line rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-[8px] font-mono text-amml-text3 uppercase">
              <span>LIVE TELEMETRY INGRESS VECTOR</span>
              <span className="text-emerald-500 font-bold">NODE: {activePacket.nodeId}</span>
            </div>
            
            <div className="flex items-start gap-2 text-xs font-mono">
              <span className="text-amml-text3">[{new Date(activePacket.timestamp).toLocaleTimeString('en-NG')}]</span>
              <span className={`font-bold ${
                activePacket.type === 'CRITICAL' ? 'text-rose-500' : activePacket.type === 'WARN' ? 'text-amber-500' : 'text-emerald-500 dark:text-emerald-400'
              }`}>
                [{activePacket.type}]
              </span>
              <span className="text-amml-text font-medium line-clamp-1 flex-1">{activePacket.message}</span>
            </div>

            {/* Micro Sparkline Latency Visualization using CSS and div bars */}
            <div className="pt-1.5 flex items-end gap-1 h-8">
              <span className="font-mono text-[8px] text-amml-text3 select-none mr-2 uppercase leading-none self-center">RTT Graph:</span>
              {activeTrend.map((lat, idx) => {
                // Normalize height relative to max-latency (e.g. 200)
                const heightPct = Math.min(100, Math.max(15, (lat / 150) * 100));
                return (
                  <div key={idx} className="flex-1 bg-amml-surface3 rounded-t h-full flex items-end relative group">
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        lat > 150 ? 'bg-rose-500' : lat > 80 ? 'bg-amber-500' : 'bg-emerald-500/60'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-amml-panel border border-amml-line font-mono text-[8px] text-amml-text px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none mb-1 z-10 whitespace-nowrap shadow-md">
                      {lat}ms
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
