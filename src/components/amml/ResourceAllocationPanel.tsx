import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Cpu, Server, Network, HelpCircle, HardDrive, Zap, Info } from 'lucide-react';

interface ResourceData {
  nodeName: string;
  nodeId: string;
  cpu: number;
  memory: number;
  bandwidth: number;
  ping: number;
}

export const ResourceAllocationPanel: React.FC = () => {
  // Navigation layout filters (Bar vs Radar/Detailed view)
  const [chartType, setChartType] = useState<'grouped-bar' | 'radar-map'>('grouped-bar');
  const [activeMetricFilter, setActiveMetricFilter] = useState<'all' | 'latency-weights'>('all');

  // Initial resource allocation stats for active mesh nodes
  const [data, setData] = useState<ResourceData[]>([
    { nodeName: 'Abuja HQ Node', nodeId: 'node-Hq', cpu: 42, memory: 58, bandwidth: 72, ping: 12 },
    { nodeName: 'Garki Ingest Hub', nodeId: 'node-Garki', cpu: 64, memory: 74, bandwidth: 88, ping: 19 },
    { nodeName: 'Wuse Terminal A', nodeId: 'node-Wuse', cpu: 55, memory: 49, bandwidth: 65, ping: 22 },
    { nodeName: 'Kaura Portal', nodeId: 'node-Kaura', cpu: 33, memory: 41, bandwidth: 50, ping: 14 },
    { nodeName: 'Utako Market Outpost', nodeId: 'node-Utako', cpu: 71, memory: 82, bandwidth: 78, ping: 25 },
    { nodeName: 'Nyanya Regional Bridge', nodeId: 'node-Nyanya', cpu: 81, memory: 69, bandwidth: 83, ping: 28 },
  ]);

  // Dynamic values fluctuation to reflect active real-time workload
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData =>
        prevData.map(node => {
          // Fluctuates CPU/Memory loading by -4% to +4%
          const cpuDelta = Math.floor(Math.random() * 9) - 4;
          const memDelta = Math.floor(Math.random() * 7) - 3;
          const bwDelta = Math.floor(Math.random() * 11) - 5;
          const pingDelta = Math.floor(Math.random() * 5) - 2;

          let newCpu = node.cpu + cpuDelta;
          let newMem = node.memory + memDelta;
          let newBw = node.bandwidth + bwDelta;
          let newPing = node.ping + pingDelta;

          // Keep within reasonable bounds
          if (newCpu < 15) newCpu = 15;
          if (newCpu > 96) newCpu = 96;

          if (newMem < 25) newMem = 25;
          if (newMem > 98) newMem = 98;

          if (newBw < 30) newBw = 30;
          if (newBw > 100) newBw = 100;

          if (newPing < 8) newPing = 8;
          if (newPing > 45) newPing = 45;

          return {
            ...node,
            cpu: newCpu,
            memory: newMem,
            bandwidth: newBw,
            ping: newPing
          };
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Custom high contrast dark tooltip to match design guidelines
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b1424] border-2 border-[#1E293B] p-3 rounded-lg shadow-2xl text-[11px] font-mono text-slate-300">
          <p className="font-extrabold text-white text-[12px] uppercase mb-1.5 border-b border-white/5 pb-1 select-none">
            🖥️ {label}
          </p>
          <div className="space-y-1 text-left">
            {payload.map((entry: any, i: number) => {
              const markerColor = entry.color || entry.fill;
              return (
                <div key={i} className="flex items-center justify-between gap-6 uppercase">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: markerColor }} />
                    {entry.name}:
                  </span>
                  <span className="font-bold text-white font-mono">{entry.value}%</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between gap-6 border-t border-dashed border-white/10 pt-1 mt-1 text-[10px] uppercase text-sky-400">
              <span>Ping Latency: </span>
              <span className="font-bold">{payload[0]?.payload?.ping}ms</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Find max load node for warning indicators
  const highestCpuNode = [...data].sort((a,b) => b.cpu - a.cpu)[0];
  const highestMemNode = [...data].sort((a,b) => b.memory - a.memory)[0];

  return (
    <div className="bg-amml-panel border border-amml-line rounded-2xl p-6 shadow-xl space-y-5 text-left" id="recharts-mesh-resource-monitor">
      
      {/* Visualizer Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-amml-blue uppercase tracking-widest font-mono">Telemetry Analytics Stage</span>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2 mt-0.5">
            <Cpu className="h-4.5 w-4.5 text-amml-blue animate-pulse" /> Mesh Core Resource Allocation
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 uppercase leading-snug font-mono">
            Maps real-time CPU percentages, physical RAM pools, and network stream bandwidth across active edge nodes.
          </p>
        </div>

        {/* View mode buttons */}
        <div className="flex bg-[#050C16] border border-amml-line p-0.5 rounded-lg text-[10px] font-mono">
          <button
            onClick={() => setChartType('grouped-bar')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all uppercase font-bold flex items-center gap-1.5 ${
              chartType === 'grouped-bar' ? 'bg-[#0064B4] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="h-3 w-3" />
            <span>Grouped Bar</span>
          </button>
          <button
            onClick={() => setChartType('radar-map')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-all uppercase font-bold flex items-center gap-1.5 ${
              chartType === 'radar-map' ? 'bg-[#0064B4] text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network className="h-3 w-3" />
            <span>Node Radar</span>
          </button>
        </div>
      </div>

      {/* Mini Alert State Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[10px]">
        <div className="p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-rose-350 rounded-lg flex items-center gap-2">
          <Zap className="h-4 w-4 shrink-0 text-red-500 animate-pulse" />
          <div>
            <span className="block font-bold uppercase text-red-400">Peak CPU utilization</span>
            <span className="block text-[9px] uppercase mt-0.5 text-slate-400">
              🚨 {highestCpuNode.nodeName} reporting <strong className="text-white font-extrabold">{highestCpuNode.cpu}% load</strong>
            </span>
          </div>
        </div>

        <div className="p-3 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-amber-350 rounded-lg flex items-center gap-2">
          <HardDrive className="h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <span className="block font-bold uppercase text-amber-400">Memory Pressure Alarm</span>
            <span className="block text-[9px] uppercase mt-0.5 text-slate-400">
              ⚠️ {highestMemNode.nodeName} consumption at <strong className="text-white font-extrabold">{highestMemNode.memory}% physical</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Render Canvas */}
      <div className="h-72 w-full min-w-0 bg-[#03070f] border border-amml-line rounded-xl p-3 pr-5 pt-5 relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={50}>
          {chartType === 'grouped-bar' ? (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="nodeName" 
                tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }}
                stroke="#334155"
                tickFormatter={(val) => val.split(' ')[0]} 
              />
              <YAxis 
                tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }}
                stroke="#334155"
                domain={[0, 100]}
                unit="%"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
              <Legend 
                wrapperStyle={{ paddingTop: 10, fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase' }} 
                iconType="circle"
              />
              {/* CPU load bar */}
              <Bar name="CPU cores" dataKey="cpu" fill="#0064B4" radius={[4, 4, 0, 0]} />
              {/* Memory load bar */}
              <Bar name="Physical RAM" dataKey="memory" fill="#10B981" radius={[4, 4, 0, 0]} />
              {/* Bandwidth output bar */}
              <Bar name="Bandwidth" dataKey="bandwidth" fill="#DC6400" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid stroke="#1E293B" />
              <PolarAngleAxis dataKey="nodeName" tick={{ fill: '#94A3B8', fontSize: 8, fontFamily: 'monospace' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
              <Radar name="CPU Cores" dataKey="cpu" stroke="#0064B4" fill="#0064B4" fillOpacity={0.2} />
              <Radar name="Physical RAM" dataKey="memory" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
              <Radar name="Bandwidth" dataKey="bandwidth" stroke="#DC6400" fill="#DC6400" fillOpacity={0.15} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, fontFamily: 'monospace', textTransform: 'uppercase' }} iconType="circle" />
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Diagnostics details row */}
      <div className="bg-[#050c18] border border-white/5 rounded-xl p-3.5 text-[10px] font-mono uppercase text-slate-400 space-y-1 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-amml-blue shrink-0" />
          <span>Real-time fluctuations mapped to simulated socket dispatches securely.</span>
        </div>
        <div className="font-extrabold text-white flex gap-3">
          <span>Active Nodes: <strong className="text-emerald-400">6/6</strong></span>
          <span>Mesh Health: <strong className="text-emerald-400">OPTIMAL</strong></span>
        </div>
      </div>

    </div>
  );
};
