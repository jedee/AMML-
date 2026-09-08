import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldCheck, Info, X, Radio, BellRing, Settings, Play, Pause } from 'lucide-react';
import { useAmmlStore } from '../../lib/amml/store';

export interface SystemAlertToast {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  nodeName: string;
  message: string;
  soundAlerted?: boolean;
}

export const AlertNotificationSystem: React.FC = () => {
  const [alerts, setAlerts] = useState<SystemAlertToast[]>([]);
  const { isPulseActive, auditLog } = useAmmlStore();
  const [isPaused, setIsPaused] = useState(false);

  // Pool of mock critical security and mesh network events
  const alertTemplatePool: Omit<SystemAlertToast, 'id' | 'timestamp'>[] = [
    {
      severity: 'CRITICAL',
      nodeName: 'Garki Int\'l Ingestion Hub',
      message: 'Unauthorized RFID credential payload blocked at gateway terminal link.',
    },
    {
      severity: 'WARNING',
      nodeName: 'Wuse Terminal Node A',
      message: 'Transit buffer overflow threshold (94% capacity). Rerouting biometric packets.',
    },
    {
      severity: 'INFO',
      nodeName: 'Abuja HQ Primary Node',
      message: 'Automated FCT key rotators triggered. AES-256 state handshakes distributed.',
    },
    {
      severity: 'CRITICAL',
      nodeName: 'Nyanya Regional Bridge',
      message: 'Microwave transceiver link disconnected. Primary backup channel activated.',
    },
    {
      severity: 'WARNING',
      nodeName: 'Utako Market Outpost Node',
      message: 'Subtle voltage fluctuation detected in biometric camera matrix housing.',
    },
    {
      severity: 'CRITICAL',
      nodeName: 'Kaura Modern Portal',
      message: 'Repeated heartbeat validation timeout. Node state set to DEGRADED.',
    },
    {
      severity: 'INFO',
      nodeName: 'Abuja HQ Primary Node',
      message: 'Full backup database ledger synchronized. SHA-256 block signature verified.',
    }
  ];

  // Automated generator
  useEffect(() => {
    if (isPaused) return;

    // Tick speed varies based on whether the main Pulse Stream is active
    const delay = isPulseActive ? 12000 : 22000;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const randTemplate = alertTemplatePool[Math.floor(Math.random() * alertTemplatePool.length)];
      
      const newAlert: SystemAlertToast = {
        ...randTemplate,
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        timestamp: timeStr,
      };

      // Push to stack, keeping last 4 at max to avoid visual clutter
      setAlerts(prev => [newAlert, ...prev.slice(0, 3)]);

      // Write system events into the global store audit log trail
      auditLog(
        'SYSTEM', 
        `NOC ALERT [${newAlert.severity}] at ${newAlert.nodeName}`, 
        newAlert.message
      );

    }, delay);

    return () => clearInterval(interval);
  }, [isPulseActive, isPaused]);

  // Auto-dismiss logic: automatically prune older notifications after 7 seconds of visibility
  useEffect(() => {
    if (alerts.length === 0) return;
    const timer = setTimeout(() => {
      setAlerts(prev => prev.slice(0, prev.length - 1));
    }, 7000);
    return () => clearTimeout(timer);
  }, [alerts]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return (
    <div 
      className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 max-w-sm w-full no-print" 
      id="system-alert-noification-overlays"
    >
      {/* Mini Alert Monitor Header Control Bar */}
      {alerts.length > 0 && (
        <div className="bg-[#0c1626]/95 border-2 border-slate-700/60 rounded-lg px-3 py-1.5 flex items-center justify-between text-[10px] font-mono shadow-xl backdrop-blur animate-stage-wake">
          <div className="flex items-center gap-1.5 text-rose-400">
            <BellRing className="h-3.5 w-3.5 animate-bounce" />
            <span className="font-bold uppercase tracking-wider">NOC Live Alert Feed ({alerts.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isPaused ? 'Resume alerting' : 'Mute alerting'}
            >
              {isPaused ? <Play className="h-3 w-3 text-emerald-400" /> : <Pause className="h-3 w-3" />}
            </button>
            <button
              onClick={clearAllAlerts}
              className="text-slate-400 hover:text-rose-400 transition-all font-bold uppercase transition-colors cursor-pointer"
            >
              Flush Stack
            </button>
          </div>
        </div>
      )}

      {/* Alert Cards Container Stack */}
      <div className="space-y-2 flex flex-col-reverse">
        {alerts.map(alert => {
          let severityStyle = '';
          let iconStyle = '';
          let Icon = Info;

          if (alert.severity === 'CRITICAL') {
            severityStyle = 'border-rose-500/80 bg-[#1e0a0d]/95 hover:bg-[#250d11]/95 text-rose-200';
            iconStyle = 'bg-rose-500/25 text-rose-400 border border-rose-500/35';
            Icon = AlertTriangle;
          } else if (alert.severity === 'WARNING') {
            severityStyle = 'border-amber-500/70 bg-[#1e150a]/95 hover:bg-[#281c0d]/95 text-amber-250';
            iconStyle = 'bg-amber-500/25 text-amber-400 border border-amber-500/35';
            Icon = AlertTriangle;
          } else {
            severityStyle = 'border-sky-500/70 bg-[#0a1524]/95 hover:bg-[#0d1d33]/95 text-sky-200';
            iconStyle = 'bg-sky-500/25 text-sky-400 border border-sky-500/35';
            Icon = ShieldCheck;
          }

          return (
            <div
              key={alert.id}
              className={`border-2 rounded-xl p-3.5 shadow-2xl relative animate-stage-wake flex items-start gap-3 transition-colors backdrop-blur ${severityStyle}`}
              id={`noc-alert-${alert.id}`}
            >
              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${iconStyle}`}>
                <Icon className={`h-4.5 w-4.5 ${alert.severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
              </div>

              <div className="flex-1 min-w-0 pr-4 text-left font-mono">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-[9px] font-extrabold uppercase tracking-widest ${
                    alert.severity === 'CRITICAL' ? 'text-rose-455' : alert.severity === 'WARNING' ? 'text-amber-405' : 'text-sky-400'
                  }`}>
                    {alert.severity} METRIC INCIDENT
                  </span>
                  <span className="text-[8px] text-slate-500 font-normal">
                    {alert.timestamp}
                  </span>
                </div>

                <div className="text-[10px] text-white font-extrabold uppercase tracking-wide mt-1 truncate">
                  📍 {alert.nodeName}
                </div>

                <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-sans font-medium">
                  {alert.message}
                </p>

                <div className="flex items-center gap-1.5 mt-2 text-[8px] text-slate-450 uppercase font-bold tracking-wider">
                  <span>INTERFACE: SECURE_SOCKET</span>
                  <span>•</span>
                  <span>STATUS: BROADCASTED</span>
                </div>
              </div>

              <button
                onClick={() => removeAlert(alert.id)}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                title="Acknowledge & close incident"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default AlertNotificationSystem;
