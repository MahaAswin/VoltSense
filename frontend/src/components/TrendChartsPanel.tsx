import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Dot,
} from 'recharts';
import type { TelemetrySample } from '../types/telemetry';

interface TrendChartsPanelProps {
  history: TelemetrySample[];
  threshold: number;
}

export const TrendChartsPanel: React.FC<TrendChartsPanelProps> = ({ history, threshold }) => {
  const data = (history || []).slice(-30).map((pt, idx) => {
    return {
      index: idx + 1,
      time: pt.timestamp || `#${idx + 1}`,
      current: Number(pt.current.toFixed(2)),
      voltage: Number(pt.voltage.toFixed(1)),
      power: Number(pt.power.toFixed(0)),
      eventType: pt.event_type || 'NORMAL_FLUCTUATION',
      isOvercurrent: pt.current > threshold,
      ledShared: pt.led_shared_red === 1,
      isEvent: pt.event_type && pt.event_type !== 'NORMAL_FLUCTUATION' && pt.event_type !== 'BASELINE_INIT',
    };
  });

  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.isEvent && !payload.isOvercurrent) return null;

    let fill = '#F59E0B'; // Amber
    let radius = 5;

    if (payload.isOvercurrent) {
      fill = '#EF4444'; // Red
      radius = 7;
    } else if (payload.eventType === 'HEAVY_CHANGE') {
      fill = '#F43F5E';
      radius = 6;
    } else if (payload.eventType === 'RECOVERY') {
      fill = '#10B981';
      radius = 5;
    }

    return (
      <Dot
        key={`dot-${cx}-${cy}`}
        cx={cx}
        cy={cy}
        r={radius}
        fill={fill}
        stroke="#FFFFFF"
        strokeWidth={1.5}
      />
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-[#0D1520] border border-[#2A3F5E] p-3 rounded-lg shadow-xl text-xs text-slate-200">
          <div className="font-mono font-bold text-amber-400 mb-1 flex items-center justify-between gap-4">
            <span>Sample #{d.index} (5s)</span>
            <span className="text-slate-400">{d.time}</span>
          </div>
          <div className="flex items-center justify-between gap-4 my-1">
            <span className="text-slate-400">Current:</span>
            <span className="font-mono font-bold text-white text-sm">{d.current.toFixed(2)} A</span>
          </div>
          <div className="flex items-center justify-between gap-4 my-1">
            <span className="text-slate-400">Voltage:</span>
            <span className="font-mono text-sky-400">{d.voltage.toFixed(1)} V</span>
          </div>
          <div className="flex items-center justify-between gap-4 my-1">
            <span className="text-slate-400">Power:</span>
            <span className="font-mono text-amber-400">{d.power} W</span>
          </div>
          {d.isEvent && (
            <div className="mt-1.5 pt-1.5 border-t border-[#23354E] flex items-center justify-between">
              <span className="text-slate-400">Event:</span>
              <span className="font-bold text-amber-300 uppercase text-[10px]">
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
    <div className="bg-[#172438] border border-[#23354E] rounded-2xl p-4 shadow-sm flex flex-col justify-between h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Real-Time Electrical Waveform & Event Supervision
          </h3>
          <p className="text-[0.68rem] text-slate-400 font-mono">
            5-Second Synchronized Sampling • Current Waveform with 5.0 A Safety Limit
          </p>
        </div>

        <div className="flex items-center gap-3 text-[0.68rem] text-slate-300 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-1 bg-sky-400 rounded-full"></span>
            <span>Current (A)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t-2 border-dashed border-red-500"></span>
            <span>Limit ({threshold.toFixed(1)}A)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span>Overcurrent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Change Event</span>
          </div>
        </div>
      </div>

      <div className="h-[210px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">
            Waiting for 5-second telemetry stream to start...
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
                strokeWidth={1.5}
                label={{
                  value: `${threshold.toFixed(1)}A LIMIT`,
                  fill: '#EF4444',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontFamily: 'monospace',
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
