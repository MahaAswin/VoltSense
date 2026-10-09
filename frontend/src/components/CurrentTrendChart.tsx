import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Dot
} from 'recharts';
import type { TelemetryRecord } from '../types/telemetry';

interface CurrentTrendChartProps {
  history: TelemetryRecord[];
  threshold: number;
}

export const CurrentTrendChart: React.FC<CurrentTrendChartProps> = ({ history, threshold }) => {
  // Format data for chart
  const data = (history || []).slice(-30).map((pt, idx) => {
    const timeStr = pt.timestamp ? new Date(pt.timestamp).toLocaleTimeString([], { hour12: false }) : `#${idx + 1}`;
    return {
      index: idx + 1,
      time: timeStr,
      current: Number(pt.current.toFixed(2)),
      eventType: pt.event_type || 'NORMAL_FLUCTUATION',
      change: pt.current_change ? Number(pt.current_change.toFixed(2)) : 0,
      direction: pt.change_direction || 'NONE',
      isEvent: pt.event_type && pt.event_type !== 'NORMAL_FLUCTUATION' && pt.event_type !== 'NORMAL'
    };
  });

  // Custom Event Dot renderer
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.isEvent) return null;

    let fillColor = '#F59E0B'; // Normal change (Amber)
    let strokeColor = '#FDE68A';
    let radius = 5;

    if (payload.eventType === 'HEAVY_CHANGE') {
      fillColor = '#F43F5E'; // Rose / Heavy
      strokeColor = '#FECDD3';
      radius = 6;
    } else if (payload.eventType === 'OVERCURRENT') {
      fillColor = '#EF4444'; // Red / Overcurrent
      strokeColor = '#FFFFFF';
      radius = 7;
    }

    return (
      <Dot
        key={`dot-${cx}-${cy}`}
        cx={cx}
        cy={cy}
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
      />
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#0D1520] border border-[#2A3F5E] p-3 rounded-lg shadow-xl text-xs text-slate-200">
          <div className="font-mono font-bold text-amber-400 mb-1 flex items-center justify-between gap-4">
            <span>Sample #{d.index}</span>
            <span className="text-slate-400">{d.time}</span>
          </div>
          <div className="flex items-center justify-between gap-4 my-1">
            <span className="text-slate-400">Current:</span>
            <span className="font-mono font-bold text-white text-sm">{d.current.toFixed(2)} A</span>
          </div>
          {d.change > 0 && (
            <div className="flex items-center justify-between gap-4 my-1">
              <span className="text-slate-400">Delta (ΔI):</span>
              <span className="font-mono text-cyan-400">
                {d.direction === 'INCREASE' ? '+' : '-'}{d.change.toFixed(2)} A
              </span>
            </div>
          )}
          {d.isEvent && (
            <div className="mt-1.5 pt-1.5 border-t border-[#23354E] flex items-center justify-between">
              <span className="text-slate-400">Classification:</span>
              <span className={`font-bold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                d.eventType === 'OVERCURRENT' ? 'bg-red-500/20 text-red-400' :
                d.eventType === 'HEAVY_CHANGE' ? 'bg-rose-500/20 text-rose-400' :
                'bg-amber-500/20 text-amber-400'
              }`}>
                {d.eventType.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#172438] border border-[#23354E] rounded-xl p-4 shadow-sm flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Live Current Waveform & Change Detection
          </h3>
          <p className="text-[11px] text-slate-400">
            Real-time consecutive sample evaluation with threshold & event markers
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-cyan-400 rounded-full"></span>
            <span>Current (A)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-red-500"></span>
            <span>Limit ({threshold.toFixed(1)}A)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Normal Event</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Heavy Event</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[210px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Awaiting telemetry data stream...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="time"
                stroke="#475569"
                tick={{ fill: '#94A3B8', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, (dataMax: number) => Math.max(7.0, Math.ceil(dataMax + 1))]}
                stroke="#475569"
                tick={{ fill: '#94A3B8', fontSize: 10 }}
                tickLine={false}
                unit="A"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={threshold}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{
                  value: `Limit: ${threshold.toFixed(1)}A`,
                  fill: '#EF4444',
                  fontSize: 10,
                  position: 'insideTopRight'
                }}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="#38BDF8"
                strokeWidth={2.2}
                dot={renderCustomDot}
                activeDot={{ r: 6, fill: '#38BDF8', stroke: '#FFFFFF', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
