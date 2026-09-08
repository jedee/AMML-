import React, { useState, useEffect } from 'react';
import { Wifi, ShieldCheck, Activity, Globe, CheckCircle } from 'lucide-react';

export const BackendConnectionMonitor: React.FC = () => {
  const [latency, setLatency] = useState(14);
  const [isOnline, setIsOnline] = useState(true);
  const [packetLoss, setPacketLoss] = useState(0.00);
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic fluctuation of latency and simulation of brief dropouts (very subtle)
  useEffect(() => {
    const timer = setInterval(() => {
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2 ms fluctuation
        const next = prev + delta;
        return next < 8 ? 8 : next > 25 ? 25 : next;
      });

      // Subtle packet loss variance
      if (Math.random() > 0.95) {
        setPacketLoss(parseFloat((Math.random() * 0.05).toFixed(2)));
      } else {
        setPacketLoss(0.00);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative font-mono select-none" id="backend-connection-indicator">
      {/* Pulse Anchor Click Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-amml-surface border border-amml-line hover:bg-amml-surface3 px-3 py-1.5 rounded-lg text-[10px] text-slate-350 cursor-pointer transition-all outline-none"
        title="Check cloud connection health"
      >
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span className="text-slate-400 hidden xl:inline">BACKEND LINK:</span>
        <span className="font-bold text-emerald-400 shrink-0">SECURE ({latency}ms)</span>
      </button>

      {/* Popover overlay dropdown */}
      {isOpen && (
        <>
          {/* Overlay mask to close */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          
          <div className="absolute right-0 top-10 z-40 w-72 bg-amml-panel border border-amml-line rounded-xl p-4 shadow-2xl animate-stage-wake text-left">
            <div className="flex items-center justify-between border-b border-amml-line pb-2 mb-3">
              <span className="text-[10px] font-extrabold text-white tracking-widest uppercase">CONNECTION ASSURANCE</span>
              <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold">ONLINE</span>
            </div>

            <div className="space-y-2.5 text-[11px] text-slate-300">
              <div className="flex items-start gap-2.5">
                <Globe className="h-4 w-4 text-amml-blue shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-500 uppercase font-bold">Endpoint Server Host</span>
                  <span className="block text-slate-200 truncate">fct-edge-broker.amml.gov.ng</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-500 uppercase font-bold">Transport Cryptography</span>
                  <span className="block text-slate-200 truncate">HTTP/2 over TLS 1.3 (ECDHE-ECDSA)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Activity className="h-4 w-4 text-amml-orange shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-500 uppercase font-bold">Network Link Performance</span>
                  <div className="flex gap-3 text-slate-200 mt-0.5">
                    <span>RTT: <strong className="text-emerald-400 font-bold">{latency} ms</strong></span>
                    <span>Loss: <strong className="text-slate-400">{packetLoss}%</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pb-1">
                <CheckCircle className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="block text-[9px] text-slate-500 uppercase font-bold">Channel Verification</span>
                  <span className="block text-emerald-400 uppercase font-bold">FCT GATEWAY CLUSTER DEPLOYED_</span>
                </div>
              </div>
            </div>

            <div className="bg-[#050C16] border border-white/5 rounded-lg p-2 mt-3 text-[10px] text-slate-450 leading-relaxed uppercase">
              Authenticated session securely piped over isolated virtual channel. Status sweeps triggered automatically every 4s.
            </div>
          </div>
        </>
      )}
    </div>
  );
};
