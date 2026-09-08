import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldX, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Info, 
  Bell, 
  Clock, 
  MapPin, 
  Zap, 
  Pause, 
  Play,
  Skull
} from 'lucide-react';

export interface ThreatEvent {
  id: string;
  timestamp: string;
  unixTime: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  source: string; // IP or Scanner ID
  zone: string; // Market place / Central Hub
  eventType: string; // e.g. BRUTE_FORCE, REPLAY_ATTACK, SIGNATURE_MISMATCH, ANOMALOUS_SURGE
  summary: string;
  status: 'BLOCKED' | 'MITIGATED' | 'UNDER_INVESTIGATION' | 'ALLOWED';
}

const INITIAL_THREATS: ThreatEvent[] = [
  {
    id: 'th-101',
    timestamp: new Date(Date.now() - 3 * 3600 * 1000).toLocaleTimeString('en-NG'),
    unixTime: Date.now() - 3 * 3600 * 1000,
    severity: 'CRITICAL',
    source: '192.168.42.115',
    zone: 'Wuse Main Gate Terminal',
    eventType: 'BRUTE_FORCE_ATTEMPT',
    summary: 'Biometric fingerprint scanner detected 15 consecutive login failures matching signature dictionary profile.',
    status: 'BLOCKED'
  },
  {
    id: 'th-102',
    timestamp: new Date(Date.now() - 2.1 * 3600 * 1000).toLocaleTimeString('en-NG'),
    unixTime: Date.now() - 2.1 * 3600 * 1000,
    severity: 'HIGH',
    source: '112.84.14.99',
    zone: 'Gudu Market Entrance',
    eventType: 'REPLAY_ATTACK_MITIGATION',
    summary: 'Replay-attack mitigation triggered: timestamp inside Diffie-Hellman nonce challenge exceeded FIPS-140 variance limits (60s).',
    status: 'MITIGATED'
  },
  {
    id: 'th-103',
    timestamp: new Date(Date.now() - 1.5 * 3600 * 1000).toLocaleTimeString('en-NG'),
    unixTime: Date.now() - 1.5 * 3600 * 1000,
    severity: 'MEDIUM',
    source: '192.168.10.22',
    zone: 'Central NOC Gateway',
    eventType: 'ANOMALOUS_PACKET_SURGE',
    summary: 'Ingest bandwidth surged abnormally from 14 kbps to 850 kbps, indicating potential UDP telemetry flooding attempt.',
    status: 'UNDER_INVESTIGATION'
  },
  {
    id: 'th-104',
    timestamp: new Date(Date.now() - 0.8 * 3600 * 1000).toLocaleTimeString('en-NG'),
    unixTime: Date.now() - 0.8 * 3600 * 1000,
    severity: 'INFO',
    source: 'FCT-AES-MD-064',
    zone: 'Registry Hub Node',
    eventType: 'ROUTINE_KEY_ROTATOR',
    summary: 'FCT-AES-256 dispatch encryption key rotated. Overlord key index synchronized without error.',
    status: 'ALLOWED'
  }
];

const RECURRING_MOCK_THREAT_POOLS: Omit<ThreatEvent, 'id' | 'timestamp' | 'unixTime'>[] = [
  {
    severity: 'CRITICAL',
    source: '109.28.188.4',
    zone: 'Central NOC Gateway',
    eventType: 'UNAUTHORIZED_SSH_TUNNEL',
    summary: 'SSH intrusion attempts on FCT Admin root partition payload. Cryptographic security vault sealed.',
    status: 'BLOCKED'
  },
  {
    severity: 'HIGH',
    source: '192.168.44.82',
    zone: 'Garki Terminal-2',
    eventType: 'RFID_REPLAY_ATTEMPT',
    summary: 'FIPS security agent flagged RFID credential token cloned inside 1000ms block window. Scanner deactivated.',
    status: 'BLOCKED'
  },
  {
    severity: 'CRITICAL',
    source: 'Unknown Tor Exit Node',
    zone: 'Wuse Main Gate Terminal',
    eventType: 'SQL_INJECTION_SINK',
    summary: 'Malicious payload injection parsed in biometric registration endpoint: standard query bypass blocked by parameter bounds.',
    status: 'BLOCKED'
  },
  {
    severity: 'MEDIUM',
    source: '192.168.12.204',
    zone: 'Central NOC Gateway',
    eventType: 'SHA_256_MISMATCH',
    summary: 'Integrity sweep signature block error 0x8ffaa reported. Handshake checksum comparison failed.',
    status: 'UNDER_INVESTIGATION'
  },
  {
    severity: 'HIGH',
    source: '89.28.14.15',
    zone: 'Registry Hub Node',
    eventType: 'IP_ADDRESS_SPOOFING',
    summary: 'Microwave transceiver detected IP spoofing on Carrier Link. Handshake discarded prior to database integration.',
    status: 'MITIGATED'
  },
  {
    severity: 'INFO',
    source: '192.168.10.8',
    zone: 'Registry Hub Node',
    eventType: 'SECURITY_INTEGRITY_CHECK',
    summary: 'NOC Operator initiated manual micro-grid sweep verification. 56 active roster files verified.',
    status: 'ALLOWED'
  }
];

export const ThreatDetectionLog: React.FC<{ isPulseActive: boolean }> = ({ isPulseActive }) => {
  const [threatEvents, setThreatEvents] = useState<ThreatEvent[]>(INITIAL_THREATS);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO'>('ALL');
  const [isLogLive, setIsLogLive] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-generate fresh threat events dynamically to showcase real-time monitoring
  useEffect(() => {
    if (!isLogLive || !isPulseActive) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      // 30% chance to generate a threat at each tick interval to look realistic
      if (Math.random() > 0.65) {
        const randomIndex = Math.floor(Math.random() * RECURRING_MOCK_THREAT_POOLS.length);
        const template = RECURRING_MOCK_THREAT_POOLS[randomIndex];
        
        const newEvent: ThreatEvent = {
          id: `th-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString('en-NG'),
          unixTime: Date.now(),
          ...template
        };

        setThreatEvents(prev => [newEvent, ...prev].slice(0, 50)); // limit to last 50 events
      }
    }, 4000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLogLive, isPulseActive]);

  const triggerManualThreat = () => {
    const randomIndex = Math.floor(Math.random() * RECURRING_MOCK_THREAT_POOLS.length);
    const template = RECURRING_MOCK_THREAT_POOLS[randomIndex];
    const newEvent: ThreatEvent = {
      id: `th-manual-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-NG'),
      unixTime: Date.now(),
      ...template,
      summary: `[OPERATOR_SIMULATOR] ${template.summary}`
    };
    setThreatEvents(prev => [newEvent, ...prev]);
  };

  const clearLogs = () => {
    setThreatEvents([]);
  };

  const filteredThreats = threatEvents.filter(t => {
    const matchesSearch = t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.eventType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.zone.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'ALL' || t.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadgeClass = (sev: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO') => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'MEDIUM':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'INFO':
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'BLOCKED':
        return 'bg-rose-500/20 border border-rose-500/40 text-rose-400 font-extrabold';
      case 'MITIGATED':
        return 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold';
      case 'UNDER_INVESTIGATION':
        return 'bg-amber-500/15 border border-amber-500/30 text-amber-500';
      default:
        return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div id="threat-detection-module" className="bg-amml-surface border border-amml-border rounded-xl p-5 shadow-sm text-left font-mono">
      
      {/* Title bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-light-divider dark:border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg animate-pulse">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-black text-amml-text flex items-center gap-1">
              🚨 Host intrusion & Threat Detection log
            </h3>
            <p className="text-[10px] sm:text-[11px] text-amml-text3 font-medium tracking-wide uppercase mt-0.5">
              Live FIPS security daemon audit log streaming biometrics interface events.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Custom simulation injector */}
          <button
            type="button"
            onClick={triggerManualThreat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/40 text-rose-400 text-[10px] font-bold rounded uppercase cursor-pointer transition-all"
            title="Inject simulated threats into the telemetry pipeline"
          >
            <Skull className="h-3 w-3" />
            <span>INJECT THREAT</span>
          </button>

          {/* Toggle Live Feed */}
          <button
            type="button"
            onClick={() => setIsLogLive(!isLogLive)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold border flex items-center gap-1 uppercase cursor-pointer ${
              isLogLive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
            }`}
          >
            {isLogLive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {isLogLive ? 'LIVE FEEDING' : 'FEED PAUSED'}
          </button>

          {/* Flush Controls */}
          <button
            type="button"
            onClick={clearLogs}
            className="p-1 px-2.5 bg-slate-900 border border-white/5 rounded text-[10px] text-slate-500 hover:text-rose-450 hover:border-rose-500/30 transition-all cursor-pointer flex items-center gap-1 font-bold"
            title="Clear the local screen threat buffer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>CLEAR SCREEN</span>
          </button>
        </div>
      </div>

      {/* Searching and Filter Bar */}
      <div className="bg-[#050C16]/55 border border-amml-border p-3.5 rounded-lg mb-4 flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search daemon logs for IP, event signatures, summary..."
            className="w-full bg-slate-900/65 border border-amml-border focus:border-amml-blue focus:ring-1 focus:ring-amml-blue px-9 py-2 rounded-lg text-xs text-amml-text outline-none transition-all"
          />
        </div>

        {/* Severity levels Selectors */}
        <div className="flex flex-wrap items-center gap-1 bg-[#030811] border border-amml-border p-1 rounded-lg">
          <span className="text-[9px] text-slate-500 px-2 font-bold uppercase">Filter:</span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'] as const).map(sev => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`px-2 py-1.5 rounded text-[9px] font-bold cursor-pointer transition-all ${
                severityFilter === sev 
                  ? 'bg-amml-blue text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-[#030811] border border-amml-border rounded-xl overflow-hidden">
        {/* Mini Counters Header */}
        <div className="bg-slate-900/40 p-2.5 px-4 border-b border-amml-border flex flex-wrap justify-between items-center text-[10px] text-slate-400 font-semibold gap-2">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
              <span>LOG_BUFFER: {threatEvents.length} Events</span>
            </span>
            <span>•</span>
            <span className="text-rose-500">
              CRITICALS: {threatEvents.filter(t => t.severity === 'CRITICAL').length}
            </span>
            <span>•</span>
            <span className="text-amber-500">
              HIGHS: {threatEvents.filter(t => t.severity === 'HIGH').length}
            </span>
          </div>
          <div>
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase">
              ACTIVE_DAEMON: CONNECTED
            </span>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[340px] divide-y divide-amml-border">
          {filteredThreats.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2 select-none">
              <ShieldX className="h-8 w-8 mx-auto text-slate-650" />
              <p className="uppercase text-[10px] tracking-widest font-semibold font-mono">No telemetry alarms or security intrusions found</p>
              <p className="text-[9px] text-slate-600 max-w-sm mx-auto uppercase">The local query filter returned 0 entries. Change the filter criteria or click "Inject Threat" to simulate security actions.</p>
            </div>
          ) : (
            filteredThreats.map((threat) => (
              <div 
                key={threat.id} 
                className="p-4 hover:bg-slate-900/30 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-3 text-xs"
              >
                {/* Visual Severity Indicators */}
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    threat.severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-500' :
                    threat.severity === 'HIGH' ? 'bg-amber-500/15 text-amber-500' :
                    threat.severity === 'MEDIUM' ? 'bg-cyan-500/15 text-cyan-400' :
                    'bg-slate-500/15 text-slate-400'
                  }`}>
                    {threat.severity === 'CRITICAL' ? <Skull className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none transition-all uppercase ${getSeverityBadgeClass(threat.severity)}`}>
                        {threat.severity}
                      </span>
                      <span className="font-bold text-slate-200">
                        {threat.eventType}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ID: {threat.id}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed font-sans max-w-3xl">
                      {threat.summary}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 uppercase font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-555" /> {threat.timestamp}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-sky-400" /> {threat.zone}
                      </span>
                      <span>•</span>
                      <span className="bg-slate-905 px-1 rounded text-slate-400 font-bold">
                        SRC: {threat.source}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right mitigation statuses badge */}
                <div className="flex justify-end items-center shrink-0">
                  <span className={`px-2 py-1 rounded text-[9px] tracking-wide uppercase font-black font-mono ${getStatusBadgeClass(threat.status)}`}>
                    {threat.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
