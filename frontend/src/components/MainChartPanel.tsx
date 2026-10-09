import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import type { TelemetrySample } from '../types/telemetry';

interface MainChartPanelProps {
  history: TelemetrySample[];
  threshold: number;
}

export const MainChartPanel: React.FC<MainChartPanelProps> = ({ history, threshold }) => {
  // Generate bar chart data
  const data = history.length > 0 ? history : [
    { timestamp: '01', current: 2.1 },
    { timestamp: '02', current: 2.4 },
    { timestamp: '03', current: 2.8 },
    { timestamp: '04', current: 3.2 },
    { timestamp: '05', current: 2.9 },
    { timestamp: '06', current: 2.5 },
  ];

  return (
    <div className="bg-white border border-[#E5EAE6] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header with Title & Dropdown */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-[#0F1713] tracking-tight">
            Machine Current & Waveform Timeline
          </h2>
          <p className="text-[0.68rem] text-[#6E7E75]">
            Telemetry load profile with continuous 5.0 A threshold supervision.
          </p>
        </div>

        <div className="bg-[#F4F6F4] border border-[#E2E7E3] rounded-full px-2.5 py-1 text-[0.68rem] font-semibold text-[#54655B]">
          Real-time stream ▼
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-52 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid stroke="#F0F4F1" vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tick={{ fill: '#8A9A90', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#E5EAE6' }}
            />
            <YAxis
              tick={{ fill: '#8A9A90', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={{ stroke: '#E5EAE6' }}
              domain={[0, (max: number) => Math.max(7.5, Math.ceil(max + 1))]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0E1512',
                borderRadius: '8px',
                border: '1px solid #213028',
                color: '#FFFFFF',
                fontSize: '11px',
                fontFamily: 'monospace',
              }}
              formatter={(val: any) => [`${Number(val).toFixed(2)} A`, 'Current']}
            />
            <ReferenceLine
              y={threshold}
              stroke="#0E1512"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `${threshold.toFixed(1)}A LIMIT`,
                fill: '#0E1512',
                fontSize: 10,
                position: 'insideTopRight',
                fontFamily: 'monospace',
                fontWeight: 'bold',
              }}
            />
            <Bar dataKey="current" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => {
                const isOver = entry.current > threshold;
                const isRecent = index >= data.length - 8;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isOver ? '#EF4444' : isRecent ? '#00D27B' : '#CBD5E1'}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer info bar */}
      <div className="flex justify-between items-center text-[0.68rem] text-[#6E7E75] pt-3 border-t border-[#F0F4F1] mt-2">
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#CBD5E1]" /> Baseline
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00D27B]" /> Active Load
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> Overcurrent
          </span>
        </span>
        <span className="font-mono font-semibold text-[#0F1713]">
          Sampling Rate: 2.0s
        </span>
      </div>
    </div>
  );
};
