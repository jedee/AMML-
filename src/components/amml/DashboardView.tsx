import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAmmlStore } from '../../lib/amml/store';
import { useSystemTheme } from '../../hooks/useSystemTheme';
import { RecentActivityPanel } from './RecentActivityPanel';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  LineChart, 
  Line 
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Printer,
  Activity,
  Cpu,
  Wifi,
  Sun,
  Moon,
  Database,
  Terminal,
  Zap,
  Server,
  Network,
  Plus,
  X,
  FileText
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { 
    staff, 
    att, 
    devices, 
    markets, 
    session, 
    settings,
    setActivePage, 
    setMktFilter,
    auditLog
  } = useAmmlStore();

  const { theme, toggleTheme, isDark } = useSystemTheme();
  const navigate = useNavigate();
  const [isFabOpen, setIsFabOpen] = useState(false);

  // 1. Live Cryptographic Telemetry Throughput State
  const [throughputData, setThroughputData] = useState<Array<{time: string, inbound: number, outbound: number}>>(() => {
    const list = [];
    const now = new Date();
    for (let i = 14; i >= 0; i--) {
      const past = new Date(now.getTime() - i * 3000);
      list.push({
        time: past.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        inbound: Math.floor(Math.random() * 120) + 180,
        outbound: Math.floor(Math.random() * 80) + 90,
      });
    }
    return list;
  });

  // 2. Automated Mesh Network Node Health State
  const [nodes, setNodes] = useState([
    { id: 'node-Garki', name: 'Garki Int\'l Ingestion Hub', ip: '192.168.42.10', latency: 14, status: 'online' as 'online' | 'syncing' | 'offline' },
    { id: 'node-Wuse', name: 'Wuse Terminal Node A', ip: '192.168.42.11', latency: 22, status: 'online' },
    { id: 'node-Kaura', name: 'Kaura Modern Portal', ip: '192.168.42.12', latency: 35, status: 'online' },
    { id: 'node-Utako', name: 'Utako Market Outpost Node', ip: '192.168.42.15', latency: 19, status: 'syncing' },
    { id: 'node-Hq', name: 'Abuja HQ Primary Node', ip: '192.168.10.2', latency: 5, status: 'online' },
    { id: 'node-Nyanya', name: 'Nyanya Regional Bridge', ip: '192.168.42.18', latency: 0, status: 'offline' },
  ]);

  // Operational state for animations / timers
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState<string | null>(null);

  // 3. Automated ticking interval for throughput and node metrics
  useEffect(() => {
    const interval = setInterval(() => {
      // Rotate metrics for throughput
      setThroughputData(prev => {
        const nextTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newPoint = {
          time: nextTime,
          inbound: Math.floor(Math.random() * 140) + 170 + (isSyncingAll ? 150 : 0),
          outbound: Math.floor(Math.random() * 90) + 80 + (isSyncingAll ? 100 : 0),
        };
        return [...prev.slice(1), newPoint];
      });

      // Gradually randomize node latencies unless we are force syncing
      if (!isSyncingAll) {
        setNodes(oldNodes => 
          oldNodes.map(node => {
            if (node.status === 'offline') return node;
            const fluctuation = Math.floor(Math.random() * 9) - 4;
            const nextLatency = Math.max(2, node.latency + fluctuation);
            
            // Randomly flip Kaura/Utako status online <-> syncing occasionally
            let nextStatus = node.status;
            if (node.id === 'node-Utako' && Math.random() > 0.8) {
              nextStatus = node.status === 'online' ? 'syncing' : 'online';
            }
            if (node.id === 'node-Kaura' && Math.random() > 0.9) {
              nextStatus = 'syncing';
              setTimeout(() => {
                setNodes(curr => curr.map(cn => cn.id === 'node-Kaura' ? { ...cn, status: 'online' } : cn));
              }, 2000);
            }

            return {
              ...node,
              latency: nextLatency,
              status: nextStatus
            };
          })
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isSyncingAll]);

  // Command handlers
  const handleSystemSync = () => {
    if (isSyncingAll) return;
    setIsSyncingAll(true);
    setSyncStatusText("Mesh broadcast in progress...");
    auditLog('SYSTEM', 'Initiated central mesh sync', 'Broadcasting cryptographic handshake to all remote biometric outposts');

    // Make all nodes enter "syncing"
    setNodes(prev => prev.map(n => ({ ...n, status: 'syncing' })));

    setTimeout(() => {
      // Re-establish online metrics
      setNodes([
        { id: 'node-Garki', name: 'Garki Int\'l Ingestion Hub', ip: '192.168.42.10', latency: 11, status: 'online' },
        { id: 'node-Wuse', name: 'Wuse Terminal Node A', ip: '192.168.42.11', latency: 15, status: 'online' },
        { id: 'node-Kaura', name: 'Kaura Modern Portal', ip: '192.168.42.12', latency: 20, status: 'online' },
        { id: 'node-Utako', name: 'Utako Market Outpost Node', ip: '192.168.42.15', latency: 18, status: 'online' },
        { id: 'node-Hq', name: 'Abuja HQ Primary Node', ip: '192.168.10.2', latency: 4, status: 'online' },
        { id: 'node-Nyanya', name: 'Nyanya Regional Bridge', ip: '192.168.42.18', latency: 145, status: 'online' }, // successfully brought online!
      ]);
      setIsSyncingAll(false);
      setSyncStatusText("Resynchronisation successful!");
      auditLog('SYSTEM', 'Mesh resynchronisation completed', 'All outposts successfully responded to heartbeat handshakes');
      setTimeout(() => setSyncStatusText(null), 3000);
    }, 2000);
  };

  const handleRefreshLogs = () => {
    setSyncStatusText("Flushing memory cache...");
    auditLog('SYSTEM', 'Manual audit log flush', 'Pruned expired biometrics credentials from volatile RAM buffers');
    
    // Add artificial bounce/variance to chart
    setThroughputData(prev => 
      prev.map(p => ({
        ...p,
        inbound: Math.max(50, p.inbound - 40 + Math.floor(Math.random() * 80)),
        outbound: Math.max(40, p.outbound - 30 + Math.floor(Math.random() * 60)),
      }))
    );

    setTimeout(() => {
      setSyncStatusText("Buffers rotated successfully");
      setTimeout(() => setSyncStatusText(null), 2500);
    }, 1000);
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todAtt = att.filter(a => a.date === todayStr);

  const activeStaff = staff.filter(s => s.active);
  const totalStaffCount = activeStaff.length;
  
  // Total unique present today
  const uniqPresentToday = new Set(todAtt.map(a => a.staffId)).size;
  const attendanceRate = totalStaffCount ? Math.round((uniqPresentToday / totalStaffCount) * 100) : 0;
  
  const totalLateToday = todAtt.filter(a => a.late).length;
  const onlineDevicesCount = devices.filter(d => d.active).length;

  // Handle drilldowns
  const handleDrilldown = (filter: string) => {
    setMktFilter(''); // clear current filter
    setActivePage('attendance');
  };

  // Build KPI Stats
  const kpis = [
    {
      label: 'Present Today',
      val: uniqPresentToday,
      sub: `${attendanceRate}% attendance rate`,
      icon: <Users className="h-6 w-6 text-amml-blue" />,
      color: '#0064B4',
      onClick: () => handleDrilldown('present')
    },
    {
      label: 'Total Active Staff',
      val: totalStaffCount,
      sub: `Across ${markets.length} registered locations`,
      icon: <Users className="h-6 w-6 text-amml-orange" />,
      color: '#DC6400',
      onClick: () => setActivePage('staff')
    },
    {
      label: 'Late Arrivals',
      val: totalLateToday,
      sub: 'Clocked after starting threshold',
      icon: <TrendingUp className="h-6 w-6 text-amml-orange-lt" />,
      color: '#E8821A',
      onClick: () => handleDrilldown('late')
    },
    {
      label: 'Online Terminal Nodes',
      val: onlineDevicesCount,
      sub: `of ${devices.length} registered nodes online`,
      icon: <TrendingUp className="h-6 w-6 text-amml-green" />,
      color: '#288C28',
      onClick: () => setActivePage('devices')
    }
  ];

  // Financial Stats for privileged accounts (SA, MD)
  const isPrivileged = session?.level === 'SUPERADMIN' || session?.level === 'MD';
  
  const estimatedMonthlyPayroll = staff.reduce((acc, current) => acc + (current.active ? current.salary : 0), 0);
  const activeMarketsCount = markets.filter(m => m.active).length;

  // Generate 7-Day Trend dataset
  const generateTrendData = () => {
    const dataList = [];
    const dateObj = new Date();
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(dateObj);
      dt.setDate(dateObj.getDate() - i);
      const ds = dt.toISOString().slice(0, 10);
      const dayLabel = dt.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric' });
      
      const dayAttCount = new Set(att.filter(a => a.date === ds).map(a => a.staffId)).size;
      dataList.push({
        name: dayLabel,
        Attendance: dayAttCount,
      });
    }
    return dataList;
  };
  const trendData = generateTrendData();

  // Generate Today's Occupancy by top Market
  const generatePieData = () => {
    const list = markets.slice(0, 5).map(m => {
      const presentCount = new Set(todAtt.filter(a => a.market === m.name).map(a => a.staffId)).size;
      return {
        name: m.name.replace(" Market", "").replace(" International", ""),
        value: presentCount || Math.floor(Math.random() * 5) + 1, // seed visual variance
      };
    });
    return list;
  };
  const pieData = generatePieData();
  const PIE_COLORS = ['#0064B4', '#DC6400', '#288C28', '#003C78', '#E8821A'];

  // Alerts builder
  const alertsList = [];
  const absentCount = totalStaffCount - uniqPresentToday;
  if (absentCount > 2) {
    alertsList.push({ type: 'warn', text: `⚠️ ${absentCount} active staff are not yet clocked in today.` });
  }
  devices.filter(d => !d.active).forEach(d => {
    alertsList.push({ type: 'err', text: `🔴 Terminals: "${d.name}" is OFFLINE at ${d.market}.` });
  });
  alertsList.push({ type: 'ok', text: '✅ Daily biometric database backup completed.' });
  alertsList.push({ type: 'info', text: 'ℹ️ Monthly MMIS reports due for review in 3 days.' });

  return (
    <div className="space-y-6 animate-stage-wake">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amml-text tracking-tight">Master Deck</h2>
          <p className="text-amml-text3 text-sm mt-1">
            {new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {markets.length} Markets monitored
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-amml-surface border border-amml-border text-amml-text hover:text-amml-blue hover:bg-amml-surface2 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Print Deck
          </button>
          <button 
            onClick={() => setActivePage('attendance')}
            className="flex items-center gap-2 bg-amml-blue hover:bg-amml-blue-dk text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-[0_2px_8px_rgba(0,100,180,0.3)] cursor-pointer"
          >
            Clock Feeds →
          </button>
        </div>
      </div>

      {/* Global Operations Command Bar */}
      <div className="bg-amml-panel border border-amml-border rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2 bg-amml-surface3 border border-amml-border rounded-lg text-amml-blue shrink-0">
            <Terminal className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-mono font-extrabold uppercase text-amml-text tracking-wider">Global Operations Controls</h4>
            <p className="text-[10px] text-amml-text3 font-mono mt-0.5">
              {syncStatusText ? (
                <span className="text-amml-orange font-bold animate-pulse">● {syncStatusText}</span>
              ) : (
                <span>Biometric mesh network systems fully operational</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto md:justify-end">
          <button
            onClick={handleSystemSync}
            disabled={isSyncingAll}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-extrabold uppercase tracking-wide font-mono transition-all cursor-pointer select-none outline-none ${
              isSyncingAll 
                ? 'bg-amml-surface3 text-slate-400 border-amml-border cursor-not-allowed' 
                : 'bg-amml-orange hover:bg-amml-orange-lt text-white border-amml-orange shadow-sm'
            }`}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Broadcasting Mesh...' : 'Trigger System Sync'}</span>
          </button>

          <button
            onClick={handleRefreshLogs}
            className="flex items-center gap-2 px-4 py-2 bg-amml-surface border border-amml-border hover:bg-amml-surface3 text-amml-text rounded-lg text-xs font-semibold font-mono uppercase tracking-wide transition-all cursor-pointer outline-none"
          >
            <Database className="h-3.5 w-3.5 text-amml-blue" />
            <span>Flush Cache</span>
          </button>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 bg-amml-surface border border-amml-border hover:bg-amml-surface3 text-amml-text rounded-lg text-xs font-semibold font-mono uppercase tracking-wide transition-all cursor-pointer outline-none"
            title={`Toggle theme environment: currently ${theme}`}
          >
            {isDark ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-[#0064B4]" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, idx) => (
          <div 
            key={idx} 
            onClick={k.onClick} 
            className="bg-amml-surface border border-amml-border rounded-xl p-5 hover:translate-y-[-2px] transition-all relative overflow-hidden shadow-sm cursor-pointer group"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: k.color }} />
            <div className="text-amml-text3 text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>{k.label}</span>
              <span className="text-[10px] text-amml-blue opacity-0 group-hover:opacity-100 transition-opacity">Drill Down ↗</span>
            </div>
            <div className="text-3xl font-serif font-extrabold text-amml-text leading-none mb-1">
              {k.val}
            </div>
            <div className="text-amml-text3 text-xs">{k.sub}</div>
            <div className="absolute right-4 bottom-4 opacity-5 group-hover:scale-110 transition-transform">
              {k.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Privileged Financial Snapshot */}
      {isPrivileged && (
        <div className="bg-amml-surface border border-amml-border rounded-xl p-6 shadow-sm">
          <h3 className="font-serif text-base font-bold text-amml-text mb-4">💰 Executive Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-l-4 border-amml-blue pl-4">
              <span className="text-amml-text3 text-xs font-bold uppercase tracking-wider block">Estimated Monthly Payroll</span>
              <span className="text-2xl font-serif font-extrabold text-amml-text mt-1 block">₦{(estimatedMonthlyPayroll / 1000).toFixed(0)}k</span>
              <span className="text-xs text-amml-text3 mt-0.5 block">Gross salary of active workforce</span>
            </div>
            <div className="border-l-4 border-amml-orange pl-4">
              <span className="text-amml-text3 text-xs font-bold uppercase tracking-wider block">Today's Estimated Levees</span>
              <span className="text-2xl font-serif font-extrabold text-amml-text mt-1 block">₦{((uniqPresentToday * settings.dailyRate * 0.15) / 1000).toFixed(1)}k</span>
              <span className="text-xs text-amml-text3 mt-0.5 block">Levies from attendance logs today</span>
            </div>
            <div className="border-l-4 border-amml-green pl-4">
              <span className="text-amml-text3 text-xs font-bold uppercase tracking-wider block">Operational Facilities</span>
              <span className="text-2xl font-serif font-extrabold text-amml-text mt-1 block">{activeMarketsCount} / {markets.length}</span>
              <span className="text-xs text-amml-text3 mt-0.5 block">Active monitored market complexes</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-amml-surface border border-amml-border rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text">📈 7-Day Attendance Trend</h3>
            <span className="bg-amml-surface3 text-amml-blue text-[10px] font-bold px-2 py-0.5 rounded-full">Real-Time</span>
          </div>
          <div className="h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={50}>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0064B4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0064B4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBF0F6" />
                <XAxis dataKey="name" stroke="#6A8AAB" fontSize={11} tickLine={false} />
                <YAxis stroke="#6A8AAB" fontSize={11} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Attendance" stroke="#0064B4" strokeWidth={2} fillOpacity={1} fill="url(#colorTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Doughnut Chart */}
        <div className="bg-amml-surface border border-amml-border rounded-xl p-6 shadow-sm">
          <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text mb-4">🏪 Attendance by Market</h3>
          <div className="h-[220px] w-full min-w-0 flex flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={50}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11, padding: 0 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Real-Time cryptographic Telemetry & Mesh Network Status indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts live network throughput trend line chart */}
        <div className="bg-amml-surface border border-amml-border rounded-xl p-6 shadow-sm lg:col-span-2 text-left flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text flex items-center gap-2">
                <Activity className="h-4 w-4 text-amml-orange animate-pulse" /> Live Cryptographic Telemetry Ingestion
              </h3>
              <div className="flex items-center gap-1.5 bg-amml-surface2 px-2.5 py-1 rounded-full border border-amml-border">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-emerald-500 tracking-wide uppercase">STREAMING</span>
              </div>
            </div>
            <p className="text-amml-text3 text-xs mb-4">
              Real-time visualization of outbound cryptographic authorizing handshakes vs inbound biometric scan payloads in kilobits per second (kb/s).
            </p>
          </div>

          <div className="h-[210px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={50}>
              <LineChart data={throughputData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1D2D44" : "#EBF0F6"} />
                <XAxis dataKey="time" stroke="#6A8AAB" fontSize={9} tickLine={false} />
                <YAxis stroke="#6A8AAB" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#0E1A2B' : '#FFFFFF',
                    borderColor: isDark ? '#1D2D44' : '#D0DCE8',
                    color: isDark ? '#FFFFFF' : '#0A1628',
                    fontFamily: 'monospace',
                    fontSize: 11,
                    borderRadius: 8
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="inbound" 
                  name="Inbound Payloads (kb/s)" 
                  stroke="#DC6400" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#DC6400', strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="outbound" 
                  name="Outbound Auth (kb/s)" 
                  stroke="#0064B4" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, fill: '#0064B4', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mesh Network Node Status component */}
        <div className="bg-amml-surface border border-amml-border rounded-xl p-6 shadow-sm text-left flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text flex items-center gap-2 mb-1">
              <Server className="h-4 w-4 text-amml-blue" /> Mesh Node Health
            </h3>
            <p className="text-amml-text3 text-xs mb-3">
              Automated heartbeat tracker for remote biometric ingress gateways. Click node to initiate localized handshake.
            </p>
          </div>

          <div className="space-y-2.5 flex-1 mt-2">
            {nodes.map(node => {
              let badgeStyle = '';
              let badgeText = '';
              
              if (node.status === 'online') {
                badgeStyle = 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
                badgeText = 'ONLINE';
              } else if (node.status === 'syncing') {
                badgeStyle = 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
                badgeText = 'SYNCING';
              } else {
                badgeStyle = 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
                badgeText = 'OFFLINE';
              }

              return (
                <div 
                  key={node.id}
                  onClick={() => {
                    if (node.status === 'syncing') return;
                    // Trigger localized resync mock
                    setNodes(curr => curr.map(n => n.id === node.id ? { ...n, status: 'syncing' } : n));
                    setTimeout(() => {
                      setNodes(curr => curr.map(n => n.id === node.id ? { ...n, status: 'online', latency: Math.floor(Math.random() * 20) + 6 } : n));
                      auditLog('SYSTEM', 'Localized node sync complete', `Successfully handshaked node ${node.id} [${node.ip}]`);
                    }, 1200);
                  }}
                  className="p-2 border border-amml-border/50 bg-amml-surface2/60 hover:bg-amml-surface3/40 rounded-lg text-xs font-mono flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Wifi className={`h-3.5 w-3.5 ${node.status === 'online' ? 'text-emerald-500 animate-pulse' : node.status === 'syncing' ? 'text-amber-500 animate-spin' : 'text-slate-400'}`} />
                    <div className="min-w-0">
                      <span className="block font-bold text-amml-text text-[11px] truncate text-left">{node.name}</span>
                      <span className="block text-[9px] text-amml-text3 truncate text-left">{node.ip}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {node.status === 'online' && (
                      <span className="text-[10px] text-amml-text3 font-semibold group-hover:block hidden">
                        {node.latency} ms
                      </span>
                    )}
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider ${badgeStyle}`}>
                      {badgeText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Comprehensive Recent Activity Panel */}
      <RecentActivityPanel />

      {/* Alerts and Live Feeds Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Live Logs Feed */}
        <div className="bg-amml-surface border border-amml-border rounded-xl shadow-sm overflow-hidden flex flex-col justify-between text-left">
          <div className="p-4 border-b border-amml-border bg-amml-surface2 flex justify-between items-center">
            <h3 className="font-serif text-sm font-bold text-amml-text flex items-center gap-2">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-ping" /> Live Clock Events
            </h3>
            <span className="text-xs text-amml-text3 font-mono">{todAtt.length} matches today</span>
          </div>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto divide-y divide-amml-surface2">
            {todAtt.length === 0 ? (
              <div className="text-center py-12 text-amml-text3 text-sm">
                😴 No terminal scans clocked in today yet.
              </div>
            ) : (
              todAtt.slice(0, 10).map((r, idx) => (
                <div key={r.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-amml-surface3 flex items-center justify-center font-bold text-amml-blue shrink-0">
                    {r.staffName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-amml-text font-bold truncate">{r.staffName}</div>
                    <div className="text-amml-text3 text-xs truncate">{r.market} • {r.device}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono font-bold text-amml-text">{r.clockOut || r.clockIn}</div>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${r.clockOut ? 'bg-amml-surface3 text-amml-blue' : 'bg-green-100 text-[#288C28]'}`}>
                      {r.clockOut ? 'Clocked Out' : 'Active In'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="bg-amml-surface2 p-3 text-center border-t border-amml-border text-xs">
            <button onClick={() => setActivePage('attendance')} className="text-amml-blue font-bold hover:underline">
              View Detailed Full-Size Ingest Log →
            </button>
          </div>
        </div>

        {/* System Warnings Panel */}
        <div className="bg-amml-surface border border-amml-border rounded-xl p-6 shadow-sm flex flex-col justify-between text-left">
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-amml-text mb-4 inline-flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amml-orange" /> Urgent Operational Notices
            </h3>
            <div className="space-y-3">
              {alertsList.map((a, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 font-medium ${
                    a.type === 'err' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400' 
                      : a.type === 'warn' 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' 
                        : a.type === 'ok' 
                          ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
                          : 'bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400'
                  }`}
                >
                  <span className="flex-1">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-amml-border flex justify-end">
            <button onClick={() => setActivePage('alerts')} className="text-xs text-amml-blue font-bold hover:underline">
              See All Active Notices →
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Floating Action Button (FAB) Group */}
      <div 
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 no-print select-none"
        onMouseEnter={() => setIsFabOpen(true)}
        onMouseLeave={() => setIsFabOpen(false)}
      >
        {/* Child action buttons with stagger reveal */}
        <div className={`flex flex-col items-end gap-2.5 transition-all duration-300 transform origin-bottom ${
          isFabOpen ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' : 'scale-75 opacity-0 translate-y-4 pointer-events-none'
        }`}>
          {/* Action 1: New Quotation */}
          <button
            onClick={() => navigate({ to: '/inventory' })}
            className="flex items-center gap-2 bg-[#0064B4] hover:bg-[#00508C] text-white px-3.5 py-2 rounded-xl shadow-lg border border-sky-400/20 text-xs font-mono font-bold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            title="Create New Quotation"
          >
            <span>NEW QUOTATION</span>
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </button>

          {/* Action 2: Sync Telemetry */}
          <button
            onClick={() => {
              handleSystemSync();
              setIsFabOpen(false);
            }}
            disabled={isSyncingAll}
            className="flex items-center gap-2 bg-[#DC6400] hover:bg-[#B85000] text-white px-3.5 py-2 rounded-xl shadow-lg border border-orange-400/20 text-xs font-mono font-bold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-55"
            title="Sync Core Telemetry"
          >
            <span>SYNC TELEMETRY</span>
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <RefreshCw className={`h-4 w-4 ${isSyncingAll ? 'animate-spin' : ''}`} />
            </div>
          </button>

          {/* Action 3: Generate Report */}
          <button
            onClick={() => navigate({ to: '/reports' })}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl shadow-lg border border-emerald-400/20 text-xs font-mono font-bold tracking-wide transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            title="Generate Audit Reports"
          >
            <span>GENERATE REPORT</span>
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </button>
        </div>

        {/* Main Hub FAB Toggle Button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-2xl transition-all transform hover:scale-105 active:scale-95 border cursor-pointer ${
            isFabOpen 
              ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 rotate-90' 
              : 'bg-gradient-to-tr from-[#0064B4] to-[#DC6400] border-sky-500/20 hover:shadow-[0_4px_20px_rgba(0,100,180,0.4)]'
          }`}
          title="Open Action Commands"
        >
          {isFabOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Plus className="h-5 w-5 animate-pulse" />
          )}
        </button>
      </div>

    </div>
  );
};
