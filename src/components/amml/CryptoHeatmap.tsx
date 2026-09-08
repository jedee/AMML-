import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  KeyRound, 
  RefreshCw, 
  History, 
  HelpCircle, 
  Cpu, 
  Signal, 
  Shuffle, 
  Sliders, 
  ArrowRight
} from 'lucide-react';

interface HeatmapDataPoint {
  hour: number;        // 0 to 23
  hourLabel: string;   // e.g. "02:00"
  metric: string;      // "DH_HANDSHAKES" | "AES_ROTATIONS" | "HMAC_CHECKS" | "BLOCK_SYNCS"
  metricLabel: string; // Readable title
  value: number;       // Packets / Min or Intensity count
  throughputKB: number; // Simulated throughput value
}

const METRICS = [
  { key: 'DH_HANDSHAKES', label: 'Diffie-Hellman Handshakes' },
  { key: 'AES_ROTATIONS', label: 'AES Key Rotations' },
  { key: 'HMAC_CHECKS', label: 'HMAC Authentication Checks' },
  { key: 'BLOCK_SYNCS', label: 'Biometric Bloc Syncs' }
];

// Generates 24 hours of starting load data
const generateHistoricalTraffic = (stressOffset: number = 0): HeatmapDataPoint[] => {
  const points: HeatmapDataPoint[] = [];
  const currentHour = new Date().getHours();

  for (let h = 0; h < 24; h++) {
    // Offset hour labels correctly
    const hourVal = (currentHour - (23 - h) + 24) % 24;
    const hourLabel = `${hourVal.toString().padStart(2, '0')}:00`;

    METRICS.forEach(metric => {
      // Create baseline sinusoids to make traffic look historically natural (night hours low, peak office hours high)
      const hourFactor = Math.sin((hourVal - 6) / 24 * Math.PI * 2); // peak around 14:00 (2pm) FCT time
      const normalizedHourFactor = (hourFactor + 1) / 2; // 0 to 1 range

      // Let categories have different multiplier values
      let baseVal = 20;
      if (metric.key === 'HMAC_CHECKS') baseVal = 65;
      if (metric.key === 'DH_HANDSHAKES') baseVal = 35;
      if (metric.key === 'BLOCK_SYNCS') baseVal = 10;

      // Random jitter
      const jitter = Math.floor(Math.random() * 15) - 7;
      const intensityValue = Math.min(
        100, 
        Math.max(
          4, 
          Math.floor(baseVal + normalizedHourFactor * 50 + jitter + stressOffset)
        )
      );

      // Map intensities to simulated KB transmission throughput
      const throughput = parseFloat((intensityValue * (metric.key === 'HMAC_CHECKS' ? 1.8 : 0.8)).toFixed(1));

      points.push({
        hour: hourVal,
        hourLabel,
        metric: metric.key,
        metricLabel: metric.label,
        value: intensityValue,
        throughputKB: throughput
      });
    });
  }

  return points;
};

export const CryptoHeatmap: React.FC = () => {
  const [stressOffset, setStressOffset] = useState<number>(0);
  const [data, setData] = useState<HeatmapDataPoint[]>([]);
  const [hoveredCell, setHoveredCell] = useState<HeatmapDataPoint | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);
  
  // D3 container target reference
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Initial and interactive generation watcher
  useEffect(() => {
    setData(generateHistoricalTraffic(stressOffset));
  }, [stressOffset]);

  const handleRandomize = () => {
    setData(generateHistoricalTraffic(stressOffset));
  };

  // Redraw/Recompute coordinates with physical pixel width on container resize
  const [dimensions, setDimensions] = useState({ width: 780, height: 260 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      const w = containerRef.current?.getBoundingClientRect().width || 785;
      setDimensions({
        width: Math.max(520, w),
        height: 250
      });
    };

    handleResize();
    const observer = new ResizeObserver(() => handleResize());
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Use D3 within the effect to layout axes and color legends (D3 standard scale implementation)
  const margin = { top: 30, right: 20, bottom: 40, left: 160 };
  const innerWidth = dimensions.width - margin.left - margin.right;
  const innerHeight = dimensions.height - margin.top - margin.bottom;

  // X Axis Scale: Hours (using D3 scaleBand for grid cells)
  const xScale = d3.scaleBand<string>()
    .domain(Array.from(new Set(data.map(d => d.hourLabel))))
    .range([0, innerWidth])
    .padding(0.08);

  // Y Axis Scale: Category metrics
  const yScale = d3.scaleBand<string>()
    .domain(METRICS.map(m => m.key))
    .range([0, innerHeight])
    .padding(0.12);

  // Color Interpolator Range (utilizing beautiful AMML deep navy blue and emerald teal tones)
  // Dark blue baseline (#051224) to mid-tier AMML sky-blue (#0064B4) to high intensity secure green (#10B981)
  const colorScale = d3.scaleLinear<string>()
    .domain([0, 30, 70, 100])
    .range(['#051124', '#1E40AF', '#0064B4', '#10B981']);

  return (
    <div className="bg-amml-surface border border-amml-border rounded-xl p-5 shadow-sm text-left font-mono">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-light-divider dark:border-white/5 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0064B4]/10 border border-[#0064B4]/20 text-[#0064B4] rounded-lg">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-black text-amml-text">
              ✨ Cryptographic Ingestion Heatmap Index
            </h3>
            <p className="text-[10px] sm:text-[11px] text-amml-text3 font-medium tracking-wide uppercase mt-0.5 animate-pulse">
              D3-based hourly aggregate of ledger signatures, DH key exchange challenges & authentication checks (last 24 hours).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scatter Jitter / Re-randomize */}
          <button
            type="button"
            onClick={handleRandomize}
            className="p-1 px-3 bg-slate-900 border border-white/5 hover:border-[#0064B4]/40 hover:text-[#0064B4] transition-all rounded text-[10px] font-bold uppercase cursor-pointer flex items-center gap-2"
          >
            <Shuffle className="h-3 w-3" />
            <span>ROTATE SEED</span>
          </button>
        </div>
      </div>

      {/* Main Grid Graphic Container */}
      <div ref={containerRef} className="relative overflow-x-auto min-w-[500px]">
        {data.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-slate-500 uppercase text-xs">
            Synthesizing D3 cryptosphere scales...
          </div>
        ) : (
          <svg 
            ref={svgRef} 
            width={dimensions.width} 
            height={dimensions.height}
            className="select-none overflow-visible"
          >
            <g transform={`translate(${margin.left}, ${margin.top})`}>
              
              {/* Y Axis Grid Label Renders */}
              {METRICS.map(m => {
                const y = yScale(m.key);
                if (y === undefined) return null;
                return (
                  <g key={m.key} transform={`translate(0, ${y})`}>
                    <text
                      x={-12}
                      y={yScale.bandwidth() / 2}
                      dy=".35em"
                      textAnchor="end"
                      fill="#94A3B8"
                      className="text-[9px] font-bold uppercase tracking-wider"
                    >
                      {m.label}
                    </text>
                  </g>
                );
              })}

              {/* Heatmap Grid Cells */}
              {data.map((point, index) => {
                const x = xScale(point.hourLabel);
                const y = yScale(point.metric);
                
                if (x === undefined || y === undefined) return null;

                const isHovered = hoveredCell && hoveredCell.hour === point.hour && hoveredCell.metric === point.metric;

                return (
                  <rect
                    key={`${point.metric}-${point.hour}-${index}`}
                    x={x}
                    y={y}
                    width={xScale.bandwidth()}
                    height={yScale.bandwidth()}
                    rx={2.5}
                    ry={2.5}
                    fill={colorScale(point.value)}
                    stroke={isHovered ? '#FFFFFF' : 'rgba(255,255,255,0.06)'}
                    strokeWidth={isHovered ? 1.5 : 1}
                    className="transition-all duration-150 cursor-crosshair opacity-85 hover:opacity-100"
                    onMouseEnter={(e) => {
                      const svgElement = svgRef.current;
                      if (!svgElement) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const svgRect = svgElement.getBoundingClientRect();

                      setHoveredCell(point);
                      setHoverPosition({
                        x: rect.left - svgRect.left + rect.width / 2,
                        y: rect.top - svgRect.top - 70
                      });
                    }}
                    onMouseLeave={() => {
                      setHoveredCell(null);
                      setHoverPosition(null);
                    }}
                  />
                );
              })}

              {/* X Axis labels (Every 3 hours to prevent overcrowding on narrow mobile layouts) */}
              {Array.from(new Set(data.map(d => d.hourLabel))).map((lbl, idx) => {
                const x = xScale(lbl);
                if (x === undefined) return null;

                // Only draw every 2nd or 3rd label depending on grid density
                if (idx % (innerWidth < 550 ? 4 : 2) !== 0) return null;

                return (
                  <g key={`x-lbl-${lbl}`} transform={`translate(${x + xScale.bandwidth() / 2}, ${innerHeight + 15})`}>
                    <line y1={-8} y2={-12} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
                    <text
                      textAnchor="middle"
                      fill="#64748B"
                      className="text-[9px] font-bold font-mono"
                    >
                      {lbl}
                    </text>
                  </g>
                );
              })}

            </g>
          </svg>
        )}

        {/* Hover absolute custom coordinate Tooltip */}
        {hoveredCell && hoverPosition && (
          <div 
            className="absolute z-30 pointer-events-none bg-[#030811] border border-white/10 rounded px-2.5 py-1.5 shadow-xl text-[10px] space-y-1 transition-all"
            style={{
              left: `${hoverPosition.x}px`,
              top: `${hoverPosition.y}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="font-extrabold text-[#0064B4] uppercase text-[9px] border-b border-white/5 pb-0.5">
              {hoveredCell.metricLabel}
            </div>
            <div className="flex justify-between gap-5 leading-normal">
              <span className="text-slate-400">Timestamp Span:</span>
              <span className="text-white font-bold">{hoveredCell.hourLabel} - {((hoveredCell.hour + 1) % 24).toString().padStart(2, '0')}:00 FCT</span>
            </div>
            <div className="flex justify-between gap-5 leading-normal">
              <span className="text-slate-400">Throughput Power:</span>
              <span className="text-emerald-450 font-extrabold">{hoveredCell.throughputKB} KB/sec</span>
            </div>
            <div className={`flex justify-between gap-5 leading-normal border-t border-white/5 pt-0.5 font-bold ${
              hoveredCell.value >= 75 ? 'text-rose-405' : hoveredCell.value >= 45 ? 'text-amber-500' : 'text-emerald-450'
            }`}>
              <span>Operational Load:</span>
              <span>{hoveredCell.value}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Color Scale Legend Helper */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-1 pt-3 border-t border-white/5 text-[10px]">
        
        {/* Scale indicators */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 uppercase font-black">LOAD SPECTRUM:</span>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-[#051124] border border-white/10" />
            <span className="text-slate-405">Idle (&le;10%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-[#1E40AF]" />
            <span className="text-slate-405">Stable (25%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-[#0064B4]" />
            <span className="text-slate-405">Nominal (55%)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded bg-[#10B981] animate-pulse" />
            <span className="text-emerald-400 font-extrabold">Peak (&ge;80%)</span>
          </div>
        </div>

        {/* Legend notes */}
        <div className="text-slate-500 flex items-center gap-1">
          <History className="h-3.5 w-3.5 text-slate-555" />
          <span>REAL-TIME AGGREGATE CALCULATED VIA FCT TELEMETRY OVERLORD DEMON LINK.</span>
        </div>
      </div>

      {/* Manual interactive stress level test bar */}
      <div className="bg-[#050C16]/55 border border-white/5 p-3.5 rounded-lg mt-4.5 space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300 uppercase flex items-center gap-1.5 text-[10px]">
            <Sliders className="h-3.5 w-3.5 text-[#0064B4]" /> Synthetic Cryptographic Traffic Load Infuser:
          </span>
          <span className="font-extrabold text-amber-500">+{stressOffset}% Cryptographic Backlog Jitter</span>
        </div>
        <input
          type="range"
          min="0"
          max="60"
          step="5"
          value={stressOffset}
          onChange={(e) => setStressOffset(parseInt(e.target.value))}
          className="w-full h-1.5 bg-slate-900 rounded-lg outline-none cursor-pointer accent-[#0064B4]"
        />
        <div className="flex justify-between text-[8px] text-slate-500 leading-none">
          <span>0% NORMAL HISTORY</span>
          <span>+30% OFFICE RUSH SURGE</span>
          <span>+60% STRESS ATTACK INTRUSION</span>
        </div>
      </div>

    </div>
  );
};
