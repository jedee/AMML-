import React, { useEffect, useState, useMemo } from 'react';
import { mockTelemetryStore, TelemetryPacket } from '../lib/amml/telemetry';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Clock, Server } from 'lucide-react';

interface ChartBucket {
  timeLabel: string; // e.g. "08:42"
  timestamp: number; // minute timestamp
  packets: number;
  anomalies: number;
}

export const NetworkTrendChart: React.FC = () => {
  const [buckets, setBuckets] = useState<ChartBucket[]>([]);

  // Initialize the 10-minute buckets on mount
  useEffect(() => {
    const initBuckets = (): ChartBucket[] => {
      const result: ChartBucket[] = [];
      const now = Date.now();
      
      // Go back 9 minutes to populate 10 periods
      for (let i = 9; i >= 0; i--) {
        const timeVal = now - i * 60 * 1000;
        const dateObj = new Date(timeVal);
        const label = dateObj.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
        
        // Populate realistic seed numbers so the chart isn't starting empty and looks functional immediately
        const basePackets = Math.floor(Math.random() * 8) + 12; // 12-20 packets
        const baseAnomalies = Math.random() > 0.75 ? Math.floor(Math.random() * 2) + 1 : 0; // 0-2 anomalies
        
        result.push({
          timeLabel: label,
          timestamp: Math.floor(timeVal / 60000) * 60000, // normalized to minute bounds
          packets: basePackets,
          anomalies: baseAnomalies
        });
      }
      return result;
    };

    setBuckets(initBuckets());

    // Subscribe to telemetry real-time events to increment active counts
    const unsubscribe = mockTelemetryStore.subscribe((packet) => {
      const packetTime = new Date(packet.timestamp).getTime();
      const packetMinuteBound = Math.floor(packetTime / 60000) * 60000;

      setBuckets((prevBuckets) => {
        if (prevBuckets.length === 0) return prevBuckets;

        // Check if matching bucket exists
        const matchIdx = prevBuckets.findIndex(b => b.timestamp === packetMinuteBound);

        if (matchIdx !== -1) {
          // Increment in-place
          const updated = [...prevBuckets];
          updated[matchIdx] = {
            ...updated[matchIdx],
            packets: updated[matchIdx].packets + 1,
            anomalies: packet.type === 'CRITICAL' || packet.type === 'WARN' 
              ? updated[matchIdx].anomalies + 1 
              : updated[matchIdx].anomalies
          };
          return updated;
        } else {
          // New minute occurred. Append new bucket and slide window
          const newDate = new Date(packetMinuteBound);
          const newLabel = newDate.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
          const newBucket: ChartBucket = {
            timeLabel: newLabel,
            timestamp: packetMinuteBound,
            packets: 1,
            anomalies: packet.type === 'CRITICAL' || packet.type === 'WARN' ? 1 : 0
          };

          // Hold exactly 10 buckets
          const shifted = [...prevBuckets.slice(1), newBucket];
          return shifted;
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Compute stats based on active minutes
  const totalPacketsLogged = useMemo(() => {
    return buckets.reduce((acc, curr) => acc + curr.packets, 0);
  }, [buckets]);

  // Check if we are currently in dark mode or dynamic mode
  const [isDarkLocal, setIsDarkLocal] = useState<boolean>(false);
  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
      setIsDarkLocal(isDark);
    };
    checkTheme();

    // Setup an observer to watch for theme changes in classList
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div id="amml-network-trend-chart-container" className="bg-amml-surface border border-amml-line rounded-xl p-5 shadow-lg flex flex-col h-full justify-between">
      <div className="space-y-1.5 border-b border-amml-line pb-3.5 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-emerald-500" />
            <span className="font-mono text-xs font-bold uppercase text-amml-text tracking-wider">
              Network Pulse Rate (10-min window)
            </span>
          </div>
          <span className="font-mono text-[9px] bg-sky-500/10 text-sky-500 dark:text-sky-400 border border-sky-550/20 px-2 py-0.5 rounded uppercase">
            {totalPacketsLogged} active packets
          </span>
        </div>
        <p className="font-mono text-[9px] text-amml-text3 uppercase">
          Continuous telemetry packet frequency and anomaly density mapped per minute
        </p>
      </div>

      <div className="h-[180px] w-full min-w-0">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={10} minHeight={10} debounce={50}>
            <AreaChart
              key={isDarkLocal ? 'dark' : 'light'}
              data={buckets}
              margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPackets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0064B4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0064B4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorAnomalies" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6400" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#FF6400" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--amml-line)" />
              <XAxis 
                dataKey="timeLabel" 
                tick={{ fontSize: 9, fill: "var(--amml-text2)", fontFamily: 'monospace' }}
                stroke="var(--amml-line)"
              />
              <YAxis 
                tick={{ fontSize: 9, fill: "var(--amml-text2)", fontFamily: 'monospace' }}
                domain={[0, 'auto']}
                allowDecimals={false}
                stroke="var(--amml-line)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--amml-surface)",
                  borderColor: "var(--amml-line)",
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontFamily: 'monospace',
                  color: "var(--amml-text)"
                }}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area
                type="monotone"
                name="Valid Packets"
                dataKey="packets"
                stroke="#0064B4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPackets)"
              />
              <Area
                type="monotone"
                name="Anomalies"
                dataKey="anomalies"
                stroke="#FF6400"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAnomalies)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full bg-amml-surface2/50 rounded-lg animate-pulse" />
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-amml-line font-mono text-[8px] text-amml-text3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-amml-blue inline-block" />
            <span>METRIC CHANNELS</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded bg-amml-orange inline-block" />
            <span>ANOMALIES</span>
          </div>
        </div>
        <span>UPDATES AUTOMATICALLY</span>
      </div>
    </div>
  );
};
