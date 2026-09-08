import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Database, 
  Wifi, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Settings, 
  Sliders,
  Play,
  Pause
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

interface HealthData {
  cpu: number;
  cpuCores: number;
  memory: number;
  totalMemoryGB: number;
  usedMemoryGB: number;
  freeMemoryGB: number;
  latency: number;
  uptime: number;
  timestamp: string;
}

interface HistoryItem {
  time: string;
  cpu: number;
  memory: number;
  latency: number;
}

export const SystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<HealthData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(2000); // ms
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Interactive Load Simulation factors (multiplier added locally for demo mode testing)
  const [simulatedCpuLoad, setSimulatedCpuLoad] = useState<number>(0); // manual load offset 0-100%
  const [simulatedMemLoad, setSimulatedMemLoad] = useState<number>(0);

  const fetchTimer = useRef<NodeJS.Timeout | null>(null);

  // Helper to format uptime (seconds -> hours, mins, secs)
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  // Central fetch function
  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/system-health');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data: HealthData = await response.json();
      
      // Apply local interactive simulation offsets
      const modifiedCpu = Math.min(100, Math.max(0, data.cpu + simulatedCpuLoad));
      const modifiedMem = Math.min(100, Math.max(0, data.memory + simulatedMemLoad));
      const adjustedUsedMem = parseFloat((data.totalMemoryGB * (modifiedMem / 100)).toFixed(1));
      const adjustedFreeMem = parseFloat((data.totalMemoryGB - adjustedUsedMem).toFixed(1));

      const finalData: HealthData = {
        ...data,
        cpu: modifiedCpu,
        memory: modifiedMem,
        usedMemoryGB: adjustedUsedMem,
        freeMemoryGB: adjustedFreeMem
      };

      setMetrics(finalData);
      setErrorMessage(null);

      // Add to historical trend for sparklines
      const timeStr = new Date(finalData.timestamp).toLocaleTimeString('en-NG', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      
      setHistory(prev => {
        const next = [...prev, { 
          time: timeStr, 
          cpu: finalData.cpu, 
          memory: finalData.memory, 
          latency: finalData.latency 
        }];
        // Keep last 15 ticks
        if (next.length > 15) {
          return next.slice(1);
        }
        return next;
      });
    } catch (err: any) {
      console.error("Failed to retrieve node telemetry metrics:", err);
      setErrorMessage("Lost contact with telemetry daemon. Retrying connection...");
      
      // Fallback with visual logs so application never crashes
      const fallbackTime = new Date().toISOString();
      const mockCpu = Math.min(100, 24 + simulatedCpuLoad + Math.floor(Math.sin(Date.now() / 10000) * 8));
      const mockMem = Math.min(100, 56 + simulatedMemLoad + Math.floor(Math.cos(Date.now() / 15000) * 2));
      const fallbackData: HealthData = {
        cpu: mockCpu,
        cpuCores: 4,
        memory: mockMem,
        totalMemoryGB: 8.0,
        usedMemoryGB: parseFloat((8.0 * (mockMem / 100)).toFixed(1)),
        freeMemoryGB: parseFloat((8.0 * (1 - mockMem / 100)).toFixed(1)),
        latency: parseFloat((32 + Math.random() * 5).toFixed(1)),
        uptime: 142055,
        timestamp: fallbackTime
      };
      setMetrics(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  // Watchers to trigger an immediate fetch upon local interactive load simulation changes
  useEffect(() => {
    fetchSystemHealth();
  }, [simulatedCpuLoad, simulatedMemLoad]);

  // Handle Polling Setup
  useEffect(() => {
    if (!isLive) {
      if (fetchTimer.current) {
        clearInterval(fetchTimer.current);
        fetchTimer.current = null;
      }
      return;
    }

    // Trigger initial fetch
    fetchSystemHealth();

    fetchTimer.current = setInterval(() => {
      fetchSystemHealth();
    }, refreshInterval);

    return () => {
      if (fetchTimer.current) {
        clearInterval(fetchTimer.current);
        fetchTimer.current = null;
      }
    };
  }, [isLive, refreshInterval, simulatedCpuLoad, simulatedMemLoad]);

  // Gauge Path Math generator:
  // We want a beautiful semi-circle or 240 degree gauge.
  // Let's draw a circular gauge starting at 135 degrees and ending at 405 degrees.
  const buildGaugePath = (value: number, max: number = 100) => {
    const percentage = value / max;
    const radius = 50;
    const cx = 60;
    const cy = 60;
    
    // Start degrees inside SVG coordinate plane:
    const startAngle = 135;
    const endAngle = 405;
    const totalAngle = endAngle - startAngle;
    const targetAngle = startAngle + (percentage * totalAngle);

    const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
      const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
      return {
        x: centerX + (r * Math.cos(angleInRadians)),
        y: centerY + (r * Math.sin(angleInRadians))
      };
    };

    const start = polarToCartesian(cx, cy, radius, startAngle);
    const end = polarToCartesian(cx, cy, radius, targetAngle);
    const largeArcFlag = targetAngle - startAngle <= 180 ? "0" : "1";

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  const getSatusStyles = (val: number, warnThresh: number, critThresh: number) => {
    if (val >= critThresh) {
      return {
        stroke: 'stroke-rose-500',
        text: 'text-rose-500 dark:text-rose-450',
        bg: 'bg-rose-500/10',
        banner: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
        indicator: 'CRITICAL',
        ringGlow: 'drop-shadow([0_0_8px_rgba(244,63,94,0.65)])'
      };
    }
    if (val >= warnThresh) {
      return {
        stroke: 'stroke-amber-500',
        text: 'text-amber-500 dark:text-amber-450',
        bg: 'bg-amber-500/10',
        banner: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
        indicator: 'WARNING',
        ringGlow: 'drop-shadow([0_0_8px_rgba(245,158,11,0.65)])'
      };
    }
    return {
      stroke: 'stroke-emerald-500',
      text: 'text-emerald-500 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      banner: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600',
      indicator: 'OPTIMAL',
      ringGlow: 'drop-shadow([0_0_8px_rgba(16,185,129,0.5)])'
    };
  };

  const cpuStyles = metrics ? getSatusStyles(metrics.cpu, 75, 90) : getSatusStyles(0, 75, 90);
  const memStyles = metrics ? getSatusStyles(metrics.memory, 80, 92) : getSatusStyles(0, 80, 92);
  const latStyles = metrics ? getSatusStyles(metrics.latency, 45, 75) : getSatusStyles(0, 45, 75);

  const getSystemIntegrity = () => {
    if (!metrics) return { label: 'OFFLINE', color: 'text-slate-500 border-slate-500/20 bg-slate-500/5' };
    if (metrics.cpu >= 90 || metrics.memory >= 92 || metrics.latency >= 75) {
      return { label: 'CRITICAL OVERLOAD', color: 'text-rose-500 border-rose-500/30 bg-rose-500/5' };
    }
    if (metrics.cpu >= 75 || metrics.memory >= 80 || metrics.latency >= 45) {
      return { label: 'DEGRADED WARNING', color: 'text-amber-500 border-amber-500/30 bg-amber-500/5' };
    }
    return { label: 'OPTIMAL HEALTH', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 font-extrabold' };
  };

  const currentStatus = getSystemIntegrity();

  return (
    <div id="telemetry-system-health-panel" className="bg-amml-surface border border-amml-border rounded-xl p-5 shadow-sm text-left font-mono">
      
      {/* Mini Titlebar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-light-divider dark:border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 ml-1 bg-amml-blue/10 border border-amml-blue/20 text-amml-blue rounded-lg">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-black text-amml-text">
              📊 CPU & Memory Ingestion Telemetry
            </h3>
            <p className="text-[10px] sm:text-[11px] text-amml-text3 font-medium tracking-wide uppercase mt-0.5">
              Live server performance & biometrics broker telemetry pipeline.
            </p>
          </div>
        </div>

        {/* Global telemetry compliance rating badge */}
        <div className="flex items-center gap-2">
          {errorMessage && (
            <div className="px-2.5 py-1 text-[9px] font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded animate-pulse">
              {errorMessage}
            </div>
          )}
          <div className={`px-3 py-1.5 rounded text-[10px] font-extrabold border leading-none tracking-widest ${currentStatus.color}`}>
            SYS_HEALTH: {currentStatus.label}
          </div>
        </div>
      </div>

      {/* Primary Display: Three speed dial gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        
        {/* Metric 1: CPU load */}
        <div id="gauge-cpu-card" className="bg-amml-panel dark:bg-[#0E1A2B]/45 border border-amml-border rounded-xl p-5 flex flex-col items-center relative overflow-hidden group shadow-sm transition-all duration-300">
          <div className="flex items-center justify-between w-full border-b border-white/5 pb-2 mb-3">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-emerald-450" /> CPU Core Utilization
            </span>
            <span className="text-[9px] text-slate-500">
              {metrics ? `${metrics.cpuCores} Cores` : 'Loading...'}
            </span>
          </div>

          {/* SVG Gauge wrapper */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform" viewBox="0 0 120 120">
              {/* Background Arc */}
              <path
                className="stroke-slate-200 dark:stroke-slate-800"
                d={buildGaugePath(100, 100)}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Value Indicator Arc */}
              {metrics && (
                <path
                  className={`transition-all duration-500 ease-out fill-none ${cpuStyles.stroke} ${cpuStyles.ringGlow}`}
                  d={buildGaugePath(metrics.cpu, 100)}
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
            
            {/* Inner text overlays */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 select-none">
              <span className={`text-2xl font-serif font-black tracking-tight leading-none ${cpuStyles.text}`}>
                {metrics ? `${metrics.cpu}%` : '—'}
              </span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                LOAD RATIO
              </span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-slate-300 mt-2 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${cpuStyles.stroke} bg-current`} />
            <span>CORE STATUS: </span>
            <span className={cpuStyles.text}>{cpuStyles.indicator}</span>
          </div>
        </div>

        {/* Metric 2: Memory Load */}
        <div id="gauge-memory-card" className="bg-amml-panel dark:bg-[#0E1A2B]/45 border border-amml-border rounded-xl p-5 flex flex-col items-center relative overflow-hidden group shadow-sm transition-all duration-300">
          <div className="flex items-center justify-between w-full border-b border-white/5 pb-2 mb-3">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-blue-450" /> Memory Buffer Pool
            </span>
            <span className="text-[9px] text-slate-500">
              {metrics ? `${metrics.totalMemoryGB} GB Total` : 'Loading...'}
            </span>
          </div>

          {/* SVG Gauge wrapper */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform" viewBox="0 0 120 120">
              {/* Background Arc */}
              <path
                className="stroke-slate-200 dark:stroke-slate-800"
                d={buildGaugePath(100, 100)}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Value Indicator Arc */}
              {metrics && (
                <path
                  className={`transition-all duration-500 ease-out fill-none ${memStyles.stroke} ${memStyles.ringGlow}`}
                  d={buildGaugePath(metrics.memory, 100)}
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
            
            {/* Inner text overlays */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 select-none">
              <span className={`text-2xl font-serif font-black tracking-tight leading-none ${memStyles.text}`}>
                {metrics ? `${metrics.memory}%` : '—'}
              </span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                {metrics ? `${metrics.usedMemoryGB}G Used` : 'SWAP_RATIO'}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-slate-300 mt-2 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${memStyles.stroke} bg-current`} />
            <span>ALLOCATION: </span>
            <span className={memStyles.text}>{memStyles.indicator}</span>
          </div>
        </div>

        {/* Metric 3: API/Network Response rate latency */}
        <div id="gauge-latency-card" className="bg-amml-panel dark:bg-[#0E1A2B]/45 border border-amml-border rounded-xl p-5 flex flex-col items-center relative overflow-hidden group shadow-sm transition-all duration-300">
          <div className="flex items-center justify-between w-full border-b border-white/5 pb-2 mb-3">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-300 uppercase flex items-center gap-1.5">
              <Wifi className="h-3.5 w-3.5 text-sky-400" /> Gateway Ingest Latency
            </span>
            <span className="text-[9px] text-slate-500">
              RTT Threshold 150ms
            </span>
          </div>

          {/* SVG Gauge wrapper */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform" viewBox="0 0 120 120">
              {/* Background Arc */}
              <path
                className="stroke-slate-200 dark:stroke-slate-800"
                d={buildGaugePath(100, 100)}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Value Indicator Arc */}
              {metrics && (
                <path
                  className={`transition-all duration-500 ease-out fill-none ${latStyles.stroke} ${latStyles.ringGlow}`}
                  d={buildGaugePath(Math.min(100, (metrics.latency / 120) * 100), 100)}
                  strokeWidth="8.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
            
            {/* Inner text overlays */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2 select-none">
              <span className={`text-2xl font-serif font-black tracking-tight leading-none ${latStyles.text}`}>
                {metrics ? `${metrics.latency}` : '—'}
                <span className="text-xs font-sans font-medium">ms</span>
              </span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">
                PING ROUTER
              </span>
            </div>
          </div>

          <div className="text-[11px] font-bold text-slate-300 mt-2 flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${latStyles.stroke} bg-current`} />
            <span>PING QUALITY: </span>
            <span className={latStyles.text}>{latStyles.indicator}</span>
          </div>
        </div>

      </div>

      {/* Historical sparklines to show the load averages over time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        
        {/* Cpu historic trend sparkline */}
        <div className="p-4 bg-[#050C16] border border-amml-border rounded-xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-555" />
              <span className="text-slate-300 font-medium">Core Load Progression Map</span>
            </div>
            <span className="text-[10px] text-slate-500">Sparkline (Last 15 ticks)</span>
          </div>
          
          <div className="h-14 w-full min-w-0">
            {history.length < 2 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 uppercase">
                Awaiting telemetry pipeline buffer...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={50}>
                <AreaChart data={history} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sparklineCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide={true} />
                  <Area 
                    type="monotone" 
                    dataKey="cpu" 
                    stroke="#10b981" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#sparklineCpu)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Memory historic progression map */}
        <div className="p-4 bg-[#050C16] border border-amml-border rounded-xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="h-2 w-2 rounded-full bg-[#0064B4]" />
              <span className="text-slate-300 font-medium">Memory Allocation Progression Map</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Sparkline (Last 15 ticks)</span>
          </div>
          
          <div className="h-14 w-full min-w-0">
            {history.length < 2 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 uppercase">
                Awaiting telemetry pipeline buffer...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={50}>
                <AreaChart data={history} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                  <defs>
                    <linearGradient id="sparklineMem" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0064B4" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0064B4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <YAxis domain={[0, 100]} hide={true} />
                  <Area 
                    type="monotone" 
                    dataKey="memory" 
                    stroke="#0064B4" 
                    strokeWidth={1.5} 
                    fillOpacity={1} 
                    fill="url(#sparklineMem)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Footer controls & manual adjustments panel */}
      <div className="bg-[#050C16]/55 border border-amml-border p-4.5 rounded-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-amml-blue" /> Interactive NOC Control Knobs
          </span>
          <span className="text-[8px] text-[#0064B4] font-bold">OPERATOR INTERACTIVE PANEL</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 leading-normal">
          {/* Knob 1: Fetch Rate Adjust */}
          <div className="lg:col-span-4 space-y-2 text-xs">
            <span className="block font-semibold text-slate-300">Telemetry Refresh Clock Rate:</span>
            <div className="flex flex-wrap gap-2">
              {[1000, 2000, 5000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setRefreshInterval(val)}
                  className={`px-3 py-1 bg-amml-surface2 rounded text-[10px] cursor-pointer hover:bg-amml-surface3 border font-bold ${
                    refreshInterval === val ? 'border-amml-blue text-amml-blue' : 'border-transparent text-slate-400'
                  }`}
                >
                  {val / 1000}s Check
                </button>
              ))}
              
              <button
                type="button"
                onClick={() => setIsLive(!isLive)}
                className={`px-3 py-1 rounded text-[10px] cursor-pointer font-bold border flex items-center gap-1 ${
                  isLive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                }`}
              >
                {isLive ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isLive ? 'POLLING' : 'PAUSED'}
              </button>
            </div>
          </div>

          {/* Knob 2: Simulated Load offset sliders (to verify alert state threshold changes) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* CPU Stress Lever */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wide">CPU Stress Infuser:</span>
                <span className="font-extrabold text-amber-500">+{simulatedCpuLoad}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                step="5"
                value={simulatedCpuLoad}
                onChange={(e) => setSimulatedCpuLoad(parseInt(e.target.value))}
                className="w-full accent-amml-blue cursor-pointer h-1.5 bg-slate-900 rounded-lg outline-none"
              />
              <div className="flex justify-between text-[8px] text-slate-500">
                <span>0% DEFAULT</span>
                <span>80% MAX_STRESS</span>
              </div>
            </div>

            {/* Memory Allocation Injector */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span className="font-semibold text-slate-300 uppercase text-[10px] tracking-wide">Memory Pool Allocator:</span>
                <span className="font-extrabold text-amber-500">+{simulatedMemLoad}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={simulatedMemLoad}
                onChange={(e) => setSimulatedMemLoad(parseInt(e.target.value))}
                className="w-full accent-amml-blue cursor-pointer h-1.5 bg-slate-900 rounded-lg outline-none"
              />
              <div className="flex justify-between text-[8px] text-slate-500">
                <span>0% DEFAULT</span>
                <span>40% OVERHEAP</span>
              </div>
            </div>

          </div>
        </div>

        {/* Diagnostic Footer Specs Details */}
        {metrics && (
          <div className="border-t border-white/5 pt-3 pt-4 flex flex-col sm:flex-row justify-between gap-3 text-[9px] font-mono text-slate-500 uppercase leading-relaxed">
            <div className="flex flex-wrap gap-4">
              <span>SYSTEM_UPTIME: {formatUptime(metrics.uptime)}</span>
              <span>•</span>
              <span>MEMORY_POOL: {metrics.usedMemoryGB}GB USED / {metrics.freeMemoryGB}GB FREE</span>
              <span>•</span>
              <span>REF_CLK: {new Date(metrics.timestamp).toLocaleTimeString('en-NG')}</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>DAEMON_SERVICE: SECURED</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
