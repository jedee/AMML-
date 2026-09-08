import React from 'react';
import { Network, Users, Cpu, Thermometer, Clock } from 'lucide-react';

interface MetricGridProps {
  metrics: {
    ingestRate: number;
    activeStaff: number;
    deviceEfficiency: number;
    activeZones: number;
    systemUptime: string;
  };
}

export const MetricGrid: React.FC<MetricGridProps> = ({ metrics }) => {
  const list = [
    {
      id: 'm-ingest',
      label: 'NET INGEST RATE_',
      value: `${metrics.ingestRate.toLocaleString()} actions/s`,
      desc: 'Active ZK transactions processed',
      icon: Network,
      color: 'text-amml-green',
      blob: 'after:bg-amml-green/12'
    },
    {
      id: 'm-staff',
      label: 'ACTIVE ROSTER_',
      value: `${metrics.activeStaff} operators`,
      desc: 'Synchronized credential check-ins',
      icon: Users,
      color: 'text-amml-blue',
      blob: 'after:bg-amml-blue/12'
    },
    {
      id: 'm-eff',
      label: 'NODE EFFICIENCY_',
      value: `${metrics.deviceEfficiency}%`,
      desc: 'Weighted network health score',
      icon: Cpu,
      color: 'text-amml-green',
      blob: 'after:bg-amml-green/12'
    },
    {
      id: 'm-hot',
      label: 'HOTSPOT NODES_',
      value: `${metrics.activeZones} active zones`,
      desc: 'Over-temperature critical zones',
      icon: Thermometer,
      color: metrics.activeZones > 0 ? 'text-amml-red' : 'text-amml-muted',
      blob: metrics.activeZones > 0 ? 'after:bg-red-500/12' : 'after:bg-white/5'
    },
    {
      id: 'm-uptime',
      label: 'LEDGER UPTIME_',
      value: metrics.systemUptime,
      desc: 'Continuity without cold restarts',
      icon: Clock,
      color: 'text-amml-gold',
      blob: 'after:bg-amml-gold/12'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {list.map(card => {
        const Icon = card.icon;
        return (
          <div 
            key={card.id}
            id={card.id}
            className={`relative border border-amml-line bg-amml-panel p-4 rounded overflow-hidden flex flex-col justify-between h-28 after:content-[""] after:absolute after:-top-4 after:-right-4 after:w-12 after:h-12 after:rounded-full after:blur-md ${card.blob} transition-transform hover:-translate-y-0.5`}
          >
            <div className="flex justify-between items-start font-mono text-[9px]">
              <span className="text-amml-muted tracking-wider uppercase font-semibold">{card.label}</span>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </div>
            
            <div className="mt-2 text-gray-100 font-mono">
              <p className="text-lg font-bold tracking-tight text-white">{card.value}</p>
              <p className="text-[9px] text-amml-muted uppercase mt-1 leading-tight">{card.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
