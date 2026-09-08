import { useState, useEffect } from 'react';
import { createRoute, Link } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { useAmmlStore } from '../lib/amml/store';
import { TelemetryCard, TelemetryMetric, TelemetryStatus } from '../components/amml/TelemetryCard';
import { SystemHealth } from '../components/amml/SystemHealth';
import { ThreatDetectionLog } from '../components/amml/ThreatDetectionLog';
import { CryptoHeatmap } from '../components/amml/CryptoHeatmap';
import { TelemetryTerminalLogs, CryptoLogEntry } from '../components/amml/TelemetryTerminalLogs';
import { fetchTelemetryLogsFromDb, clearTelemetryLogsFromDb, saveTelemetryLogToDb } from '../lib/amml/db';
import { NetworkTrendChart } from '../components/NetworkTrendChart';
import { IncidentLogFeed } from '../components/amml/IncidentLogFeed';
import { ResourceAllocationPanel } from '../components/amml/ResourceAllocationPanel';
import { 
  ArrowLeft, Radio, Shield, HelpCircle, Activity, Globe, Server, Database, KeyRound, Cpu, Terminal as TermIcon, AlertTriangle,
  RefreshCw, Trash2
} from 'lucide-react';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/telemetry',
  component: TelemetryRouteComponent,
});

function TelemetryRouteComponent() {
  const { isPulseActive, setIsPulseActive, auditLog, markets, devices } = useAmmlStore();
  
  // Local state for NOC station selector (the telemetry page sidebar)
  const [selectedStation, setSelectedStation] = useState<'GLOBAL' | 'BIOMETRIC' | 'CRYPTOGRAPHIC'>('GLOBAL');
  const [integrityAge, setIntegrityAge] = useState<number>(0);
  const [securityLevel, setSecurityLevel] = useState<'STRICT' | 'STANDARD'>('STRICT');

  // Firestore DB Integrations State
  const [viewMode, setViewMode] = useState<'LIVE' | 'POST_INCIDENT'>('LIVE');
  const [dbLogs, setDbLogs] = useState<CryptoLogEntry[]>([]);
  const [isLoadingDb, setIsLoadingDb] = useState<boolean>(false);

  const fetchDbLogs = async () => {
    setIsLoadingDb(true);
    try {
      const logs = await fetchTelemetryLogsFromDb(50);
      const mapped: CryptoLogEntry[] = logs.map(l => ({
        id: l.id || `db-${Date.now()}-${Math.random()}`,
        timestamp: l.timestamp ? new Date(l.timestamp).toLocaleTimeString('en-NG') : 'N/A',
        type: l.type,
        module: l.module,
        message: l.message,
        signature: l.signature || 'N/A'
      }));
      setDbLogs(mapped);
    } catch (err) {
      console.error("Failed to fetch Firestore post-incident logs:", err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  const handleFlushDbLogs = async () => {
    if (!window.confirm("CONFIRM COMMAND: Wipe entire Firestore log repository? This action is irreversible.")) return;
    setIsLoadingDb(true);
    try {
      await clearTelemetryLogsFromDb();
      setDbLogs([]);
      auditLog('TELEMETRY', 'Flush Firestore review trace', 'Operator deleted DB store session telemetry logs');
    } catch (err) {
      console.error("Failed to flush Firestore logs:", err);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'POST_INCIDENT') {
      fetchDbLogs();
    }
  }, [viewMode]);
  
  // Real-time fluctuating state triggers
  const [tick, setTick] = useState(0);
  const [latency, setLatency] = useState(38);
  const [bandwidth, setBandwidth] = useState(124.5);
  const [backlogCount, setBacklogCount] = useState(0);
  const [lastCheckTime, setLastCheckTime] = useState<string>('Just now');

  // Logs list
  const [terminalLogs, setTerminalLogs] = useState<CryptoLogEntry[]>(() => {
    const now = new Date();
    const cleanTime = (offsetSec: number) => {
      const d = new Date(now.getTime() - offsetSec * 1000);
      return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return [
      {
        id: 'c-1',
        timestamp: cleanTime(60),
        type: 'INFO',
        module: 'SECURE_VAULT_INIT',
        message: 'Cryptographic keystore loaded. OpenSSL-3.2 configured with FIPS-140 standard.',
        signature: '0x8f43aa92ef43cda1',
      },
      {
        id: 'c-2',
        timestamp: cleanTime(52),
        type: 'SUCCESS',
        module: 'GATEWAY_SHAKE',
        message: 'Handshake completed with Abuja Central Command Router. Diffie-Hellman parameters verified.',
        signature: '0x9422aee87cb23212',
      },
      {
        id: 'c-3',
        timestamp: cleanTime(45),
        type: 'INFO',
        module: 'SYNC_DISPATCH',
        message: 'Synchronized workforce nominal database. 59 records verified against master ledger.',
      },
      {
        id: 'c-4',
        timestamp: cleanTime(30),
        type: 'WARN',
        module: 'NODE_PING_DELAY',
        message: 'Ingest node Gudu Terminal-01 reported latency above threshold (184ms). Auto-rerouting packets.',
        signature: '0xab842ee99d301c2',
      },
      {
        id: 'c-5',
        timestamp: cleanTime(15),
        type: 'SUCCESS',
        module: 'CRYPTO_ROTATOR',
        message: 'FCT-AES-256 dispatch channel key rotated successfully. State vectors clear.',
        signature: '0xf8e0a293b4cdee10',
      }
    ];
  });

  // Dynamic fluctuating telemetry clock
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
      
      // Randomly fluctuate metrics
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 9) - 4;
        let next = prev + delta;
        if (next < 28) next = 28;
        if (next > 85) next = 85; 
        return next;
      });

      setBandwidth(prev => {
        const delta = (Math.random() * 12) - 6;
        let next = prev + delta;
        if (next < 90) next = 90;
        if (next > 165) next = 165;
        return parseFloat(next.toFixed(1));
      });

      // Update integrity check age periodically
      setIntegrityAge(prev => prev + 1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Sync log generation with Pulse Engine
  useEffect(() => {
    if (!isPulseActive) return;

    // Build interval to generate new logs every 5-8 seconds to reflect real pulse logs
    const logInterval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const modules = ['GATEWAY_SHAKE', 'BIOMETRICS_INGEST', 'SYNC_DISPATCH', 'SHA256_VERIFICATION', 'DESTRUCTIVE_SWEEP'];
      const currentModule = modules[Math.floor(Math.random() * modules.length)];
      
      const randDev = devices[Math.floor(Math.random() * devices.length)] || { name: 'HQ Terminal', market: 'Central Zone' };
      const randHexSig = '0x' + Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      let type: CryptoLogEntry['type'] = 'SUCCESS';
      let message = '';

      if (currentModule === 'GATEWAY_SHAKE') {
        type = 'INFO';
        message = `Handshake packet broadcasted successfully to sector gateway @ ${randDev.market}.`;
      } else if (currentModule === 'BIOMETRICS_INGEST') {
        type = 'SUCCESS';
        message = `Decrypted face-hash index scan on ${randDev.name}. Identity match confidence 99.42%.`;
      } else if (currentModule === 'SYNC_DISPATCH') {
        type = 'SUCCESS';
        message = `Flushed biometric payload backlog buffer to remote Postgres replication node.`;
      } else if (currentModule === 'SHA256_VERIFICATION') {
        // Occasionally simulate a tiny warn
        const isWarn = Math.random() > 0.85;
        type = isWarn ? 'WARN' : 'SUCCESS';
        message = isWarn 
          ? `Integrity warning on ${randDev.name}: Packet signature mismatch corrected via secure re-transmission.`
          : `Block verified. Payload hash matches central registry. ID map synchronized.`;
      } else {
        type = 'INFO';
        message = `Routine heartbeat signal emitted from physical interface at ${randDev.market}.`;
      }

      const newLog: CryptoLogEntry = {
        id: `c-dyn-${Date.now()}`,
        timestamp: timeStr,
        type,
        module: currentModule,
        message,
        signature: randHexSig
      };

      // Persistent Storage save to Firebase Firestore in background
      try {
        saveTelemetryLogToDb({
          timestamp: now.toISOString(),
          type: newLog.type,
          module: newLog.module,
          message: newLog.message,
          signature: newLog.signature,
          nodeId: randDev.name
        });
      } catch (dbError) {
        console.warn("Background Firestore save deferred:", dbError);
      }

      setTerminalLogs(prev => [...prev.slice(-99), newLog]);
      setLastCheckTime('Just now');
      
      // Bump backlog and clear it quickly to simulate real stream
      setBacklogCount(prev => {
        if (prev > 5) return 0;
        return prev + 1;
      });
    }, 5500);

    return () => clearInterval(logInterval);
  }, [isPulseActive, devices]);

  // Handle clear logs
  const handleClearLogs = () => {
    setTerminalLogs([]);
    auditLog('TELEMETRY', 'Cleared terminal log registry', 'Operator flushed cryptographic logs stream in secure NOC');
  };

  // Handle run manual integrity sweeps
  const handleRunIntegrityCheck = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Create direct entries
    const verifyLogs: CryptoLogEntry[] = [
      {
        id: `sweep-1-${Date.now()}`,
        timestamp: timeStr,
        type: 'INFO',
        module: 'INTEGRITY_INDEXER',
        message: 'Deploying direct SHA256 block signature sweep across FCT biometrics nodes.',
      },
      ...devices.map((d, index) => {
        const status: CryptoLogEntry['type'] = d.active ? 'SUCCESS' : 'CRITICAL';
        const signature = '0x' + Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
        return {
          id: `sweep-d-${index}-${Date.now()}`,
          timestamp: timeStr,
          type: status,
          module: 'NODE_VERIFIER',
          message: status === 'SUCCESS' 
            ? `Terminal "${d.name}" verified online. Node validation credentials secure.`
            : `Terminal "${d.name}" offline! Connection pool timeout. Action REQUIRED.`,
          signature
        };
      })
    ];

    setTerminalLogs(prev => [...prev, ...verifyLogs]);
    setIntegrityAge(0);
    setLastCheckTime('Just now');
    auditLog('TELEMETRY', 'Cryptographic signature sweep completed', `Verified ${devices.length} hardware nodes`);
  };

  const getSystemStatus = (): { label: string; class: string } => {
    const offlineCount = devices.filter(d => !d.active).length;
    if (offlineCount > 3) {
      return { label: 'CRITICAL', class: 'bg-rose-500/10 text-rose-450 border border-rose-500/30' };
    }
    if (offlineCount > 0) {
      return { label: 'DEGRADED', class: 'bg-amber-500/10 text-amber-450 border border-amber-500/30' };
    }
    return { label: 'OPTIMAL', class: 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/30 font-bold' };
  };

  const sysStatus = getSystemStatus();

  return (
    <div id="amml-telemetry-view-root" className="space-y-6">
      
      {/* Route Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono select-none">
        <div>
          <div className="flex items-center gap-2">
            <Link 
              to="/dashboard" 
              className="p-1 px-2 bg-amml-panel hover:bg-amml-line border border-amml-line rounded text-amml-green text-[10px] uppercase transition-colors"
            >
              <div className="flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                <span>Return</span>
              </div>
            </Link>
            <span className="text-amml-muted">•</span>
            <span className="text-[10px] font-bold text-amml-green uppercase tracking-widest">NETWORK OPERATIONS CENTER (NOC)</span>
          </div>
          <h1 className="text-lg font-bold text-white tracking-wider mt-1.5 uppercase">AMML Network Telemetry Panel</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Main Status */}
          <div className={`text-xs px-3 py-1.5 rounded uppercase font-mono ${sysStatus.class}`}>
            GRID STATUS: {sysStatus.label}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-slate-300 bg-amml-panel border border-amml-line px-3 py-1.5 rounded">
            <Radio className="h-4 w-4 text-amml-green animate-pulse" />
            <span className="font-mono">TELEMETRY_PORT: CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Main Real-Time Telemetry Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* SIDEBAR PANEL FOR TELEMETRY NAVIGATION (width ratio 3/12 = 25% or grid allocation) */}
        <div className="lg:col-span-3 bg-amml-panel border border-amml-line p-5 rounded-xl space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h3 className="font-mono text-xs uppercase font-bold text-slate-200 tracking-wider">NOC STATION SWITCHBOARD</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase">Select telemetry dispatch scope</p>
          </div>

          {/* Sub-station Side Navigation Menu */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setSelectedStation('GLOBAL')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border font-mono text-xs text-left transition-all cursor-pointer ${
                selectedStation === 'GLOBAL' 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-[#0e2133] border-emerald-500/30 text-white font-bold' 
                  : 'bg-[#0E1A2B]/40 hover:bg-[#1E2E44]/40 border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-sky-400" />
                <span>GLOBAL CONTROL</span>
              </div>
              <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded">ALL</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStation('BIOMETRIC')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border font-mono text-xs text-left transition-all cursor-pointer ${
                selectedStation === 'BIOMETRIC' 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-[#0e2133] border-emerald-500/30 text-white font-bold' 
                  : 'bg-[#0E1A2B]/40 hover:bg-[#1E2E44]/40 border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Server className="h-4 w-4 text-amber-400" />
                <span>BIOMETRIC INGEST</span>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded">
                {devices.length} NODE
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedStation('CRYPTOGRAPHIC')}
              className={`w-full flex items-center justify-between p-3 rounded-lg border font-mono text-xs text-left transition-all cursor-pointer ${
                selectedStation === 'CRYPTOGRAPHIC' 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-[#0e2133] border-emerald-500/30 text-white font-bold' 
                  : 'bg-[#0E1A2B]/40 hover:bg-[#1E2E44]/40 border-transparent text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-4 w-4 text-teal-400" />
                <span>CRYPTOGRAPHIC TRACE</span>
              </div>
              <span className="text-[10px] bg-teal-500/10 text-teal-450 px-2 py-0.5 rounded">AES</span>
            </button>
          </div>

          <hr className="border-white/5" />

          {/* Diagnostics control and gauges */}
          <div className="space-y-4">
            <div>
              <span className="block font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-2 font-bold select-none">
                CRYPTO_DISPATCH_RATE
              </span>
              <button
                type="button"
                onClick={() => setIsPulseActive(!isPulseActive)}
                className={`w-full p-2.5 rounded-lg border font-mono text-xs font-bold uppercase transition-all tracking-wider text-center cursor-pointer ${
                  isPulseActive 
                    ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/20 shadow-lg hover:shadow-rose-500/10' 
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {isPulseActive ? '■ HALT STREAMING' : '▶ ENGAGE TELEMETRY PULSE'}
              </button>
            </div>

            <div className="p-3 bg-[#050C16] border border-white/5 rounded-lg text-[11px] font-mono space-y-1.5 text-slate-400 leading-snug">
              <span className="block font-bold text-[9px] text-slate-500 uppercase tracking-widest mb-1">Grid Diagnostics</span>
              <div className="flex justify-between">
                <span>Sweep Rotations:</span>
                <span className="text-white font-bold">{tick}</span>
              </div>
              <div className="flex justify-between animate-pulse">
                <span>Verification State:</span>
                <span className="text-emerald-400 font-extrabold">PASS</span>
              </div>
              <div className="flex justify-between">
                <span>Block Age:</span>
                <span className="text-slate-200">{integrityAge}s ago</span>
              </div>
            </div>

            {/* Strict policies toggler */}
            <div className="space-y-2">
              <span className="block font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                ENCRYPTION_ZONE_POLICY
              </span>
              <div className="grid grid-cols-2 gap-2 bg-[#050C16] p-1 border border-white/5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSecurityLevel('STRICT')}
                  className={`py-1 text-[10px] font-mono uppercase font-bold rounded cursor-pointer transition-all ${
                    securityLevel === 'STRICT' ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  STRICT
                </button>
                <button
                  type="button"
                  onClick={() => setSecurityLevel('STANDARD')}
                  className={`py-1 text-[10px] font-mono uppercase font-bold rounded cursor-pointer transition-all ${
                    securityLevel === 'STANDARD' ? 'bg-amber-500/10 text-amber-450' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  STANDARD
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY TELEMETRY CONTENT PANE (width ratio 9/12 = 75%) */}
        <div className="lg:col-span-9 space-y-6">

          {/* SYSTEM HEALTH TELEMETRY METRIC GAUGES */}
          <SystemHealth />

          {/* D3-BASED HISTORICAL CRYPTOGRAPHIC HEATMAP */}
          <CryptoHeatmap />

          {/* REAL-TIME TELEMETRY GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Display metrics based on NOC station selector */}
            {(selectedStation === 'GLOBAL' || selectedStation === 'BIOMETRIC') && (
              <TelemetryCard
                id="g-latency"
                title="Abuja Gateway Latency"
                icon={Globe}
                status={latency > 70 ? 'warning' : 'normal'}
                metrics={[
                  { label: 'Ping RTT', value: `${latency}ms` },
                  { label: 'Carrier Link', value: 'AMML_FCT_CORE' },
                  { label: 'Route Path', value: 'Wuse Main Gate' },
                  { label: 'Pocket Loss', value: '0.00%' },
                ]}
                lastUpdated={lastCheckTime}
              />
            )}

            {(selectedStation === 'GLOBAL' || selectedStation === 'CRYPTOGRAPHIC') && (
              <TelemetryCard
                id="c-engine"
                title="Cryptographic Ledger Sync"
                icon={KeyRound}
                status="normal"
                metrics={[
                  { label: 'SHA-256 Engine', value: 'OpenSSL 3.2.1-fips' },
                  { label: 'Key Rotations', value: 'Every 3600s' },
                  { label: 'Signature Checks', value: `${45 + tick * 2} / ${45 + tick * 2} OK` },
                  { label: 'Zone Key Ref', value: 'FCT-AES-MD-064' },
                ]}
                lastUpdated={lastCheckTime}
              />
            )}

            {(selectedStation === 'GLOBAL' || selectedStation === 'BIOMETRIC') && (
              <TelemetryCard
                id="b-ingress"
                title="Biometric Backlog Buffer"
                icon={Database}
                status={backlogCount > 4 ? 'critical' : backlogCount > 2 ? 'warning' : 'normal'}
                metrics={[
                  { label: 'Sync Backlog', value: `${backlogCount} Scans` },
                  { label: 'Ingress Stream', value: `${bandwidth} kbps` },
                  { label: 'Replica Lock', value: 'DURABLE_SYNC' },
                  { label: 'Active Channels', value: `${devices.filter(d => d.active).length} Online` },
                ]}
                lastUpdated={lastCheckTime}
              />
            )}

            {(selectedStation === 'GLOBAL' || selectedStation === 'CRYPTOGRAPHIC') && (
              <TelemetryCard
                id="d-replica"
                title="DB Replication Lag"
                icon={Server}
                status={isPulseActive ? 'normal' : 'warning'}
                metrics={[
                  { label: 'Replication Delay', value: isPulseActive ? '0.02s' : '2.4s (Standby)' },
                  { label: 'Replication Node', value: 'postgres-replica-04' },
                  { label: 'SQL Buffer Pool', value: '124 MB' },
                  { label: 'Journal Status', value: 'COMMITTED_SECURE' },
                ]}
                lastUpdated={lastCheckTime}
              />
            )}

            {(selectedStation === 'GLOBAL' || selectedStation === 'BIOMETRIC') && (
              <TelemetryCard
                id="n-signal"
                title="FCT Microwave Signal RSSI"
                icon={Radio}
                status={integrityAge > 120 ? 'critical' : 'normal'}
                metrics={[
                  { label: 'RSSI Signal', value: '-48 dBm' },
                  { label: 'Cell Tower ID', value: 'Abuja-NOC-West' },
                  { label: 'Carrier Mode', value: 'LTE-M Backhaul' },
                  { label: 'Signal Quality', value: '98.4% Exceptional' },
                ]}
                lastUpdated={lastCheckTime}
              />
            )}

            {(selectedStation === 'GLOBAL' || selectedStation === 'CRYPTOGRAPHIC') && (
              <TelemetryCard
                id="s-policy"
                title="Decentralized Sync Auditing"
                icon={Shield}
                status={securityLevel === 'STRICT' ? 'normal' : 'warning'}
                metrics={[
                  { label: 'Integrity Sweep', value: `${integrityAge}s ago` },
                  { label: 'Crypto Algorithm', value: 'SHA-256' },
                  { label: 'Sec Scheme Level', value: securityLevel === 'STRICT' ? 'STRICT_MODE_2026' : 'STANDARD' },
                  { label: 'Active Alarms', value: devices.filter(d => !d.active).length > 0 ? 'WARNING_ALARM' : 'ZERO' },
                ]}
                lastUpdated={lastCheckTime}
              />
            )}
          </div>

          {/* Real-Time Mesh Node Resource Allocation Percentages */}
          <ResourceAllocationPanel />

          {/* Core Operations Dashboard Visualizations - Recharts Chart and Incident Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
            <div className="h-full">
              <NetworkTrendChart />
            </div>
            <div className="h-full">
              <IncidentLogFeed />
            </div>
          </div>

          {/* REAL-TIME CYBERSECURITY THREAT INTRUSION LOGS CONTAINER */}
          <ThreatDetectionLog isPulseActive={isPulseActive} />

          {/* DESCRIPTION CAPBILITY ANNOUNCE BOX */}
          <div className="bg-gradient-to-r from-[#0d1624] to-[#081120] border border-white/5 rounded-xl p-5 font-mono text-xs text-slate-300 leading-relaxed uppercase flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
            <div className="space-y-1">
              <span className="block font-bold text-gray-100 flex items-center gap-1.5 text-[11px] tracking-wider text-emerald-400">
                <Shield className="h-4 w-4" /> SECURE TRACE DEFERRED CRYPTO GATEWAYS
              </span>
              <p className="text-[10px] text-slate-400 mt-1 uppercase max-w-2xl leading-normal">
                REAL-TIME MONITOR DETAILS DEPLOYED PACKETS OF BIOMETRICS REGISTRATION SWEEPS SECURED WITH THE CENTRAL CRYPTO LEDGER VAULT (SHA-256/AES-256). ENGAGE OR DISENGAGE THE PULSE DEMON TO OBSERVE AUTOMATED TRANSMISSIONS.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRunIntegrityCheck}
              className="bg-[#0064B4] hover:bg-[#00508C] text-white px-3.5 py-2 rounded text-[10px] tracking-wider font-bold shrink-0 shadow cursor-pointer uppercase font-mono transition-colors"
            >
              DEPLOY BLOCK SWEEP
            </button>
          </div>

          {/* REAL-TIME CRYPTO LOGS TERMINAL */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs uppercase font-extrabold text-slate-200 tracking-wider flex items-center gap-2">
                  <TermIcon className="h-4 w-4 text-emerald-400" /> Recent Cryptographic Sync Logs Stream
                </span>
                
                {/* View Mode Toggle Controls */}
                <div className="flex items-center bg-[#050C16] border border-amml-line p-0.5 rounded text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => setViewMode('LIVE')}
                    className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                      viewMode === 'LIVE' ? 'bg-[#0064B4] text-white font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    LIVE STREAM
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('POST_INCIDENT')}
                    className={`px-2 py-1 rounded cursor-pointer transition-colors ${
                      viewMode === 'POST_INCIDENT' ? 'bg-[#0064B4] text-white font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    POST-INCIDENT REVIEW (FIRE_DB)
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {viewMode === 'POST_INCIDENT' && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      type="button"
                      onClick={fetchDbLogs}
                      disabled={isLoadingDb}
                      className="flex items-center gap-1 font-mono text-[9px] bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 px-2 py-1 border border-sky-400/25 rounded transition-all cursor-pointer disabled:opacity-50"
                      title="Reload historic reviews database"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingDb ? 'animate-spin' : ''}`} />
                      <span>RELOAD DB</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleFlushDbLogs}
                      disabled={isLoadingDb}
                      className="flex items-center gap-1 font-mono text-[9px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-405 px-2 py-1 border border-rose-500/25 rounded transition-all cursor-pointer"
                      title="Flush all logs from Firestore database"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>FLUSH REVIEWS</span>
                    </button>
                  </div>
                )}
                <span className="text-[10px] text-slate-500 font-mono uppercase">
                  Last Event: {lastCheckTime}
                </span>
              </div>
            </div>

            {isLoadingDb ? (
              <div className="bg-[#030811] border-2 border-[#1E293B] rounded-xl h-[400px] flex flex-col items-center justify-center text-center text-slate-500 space-y-2 select-none">
                <RefreshCw className="h-8 w-8 text-sky-400 animate-spin" />
                <p className="uppercase text-[10px] tracking-widest font-semibold font-mono">Connecting to firestore telemetry_logs stream...</p>
              </div>
            ) : (
              <TelemetryTerminalLogs
                logs={viewMode === 'POST_INCIDENT' ? dbLogs : terminalLogs}
                onClearLogs={viewMode === 'POST_INCIDENT' ? undefined : handleClearLogs}
                onRunIntegrityCheck={handleRunIntegrityCheck}
                isSimulating={viewMode === 'POST_INCIDENT' ? false : isPulseActive}
              />
            )}
          </div>

        </div>
        
      </div>

    </div>
  );
}

export default TelemetryRouteComponent;
