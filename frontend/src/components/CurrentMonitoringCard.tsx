import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import type { TelemetrySample } from '../types/telemetry';
import { Activity } from 'lucide-react';

interface CurrentMonitoringCardProps {
  history: TelemetrySample[];
  threshold: number;
  latest: TelemetrySample | null;
}

export const CurrentMonitoringCard: React.FC<CurrentMonitoringCardProps> = ({
  history,
  threshold,
  latest,
}) => {
  const currentVal = latest ? latest.current.toFixed(2) : '--';
  const isOver = latest ? latest.current > threshold : false;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#376DEB] flex items-center justify-center">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Current Monitoring
            </h3>
            <p className="text-[0.68rem] text-slate-400">Live Waveform (Amperes)</p>
          </div>
        </div>

        {/* Big Current Display */}
        <div className="text-right">
          <div
            className={`text-xl font-extrabold font-mono leading-none ${
              isOver ? 'text-red-600' : 'text-slate-900'
            }`}
          >
            {currentVal}{' '}
            <span className="text-xs font-sans font-semibold text-slate-400">A</span>
          </div>
          <span className="text-[0.65rem] text-slate-400 font-mono">
            Limit: {threshold.toFixed(1)} A
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-36 mt-1">
        {history.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 8, right: 8, left: -28, bottom: 0 }}
            >
              <defs>
                <linearGradient id="blueAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#376DEB" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#376DEB" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#F1F5F9" vertical={false} strokeDasharray="2 2" />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 9, fontFamily: 'monospace' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                domain={[0, (max: number) => Math.max(7.5, Math.ceil(max + 1))]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  color: '#F8FAFC',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                }}
                formatter={(val: any) => [`${Number(val).toFixed(2)} A`, 'Current']}
              />
              <ReferenceLine
                y={threshold}
                stroke="#F59E0B"
                strokeDasharray="3 3"
                strokeWidth={1.5}
              />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#376DEB"
                strokeWidth={2.2}
                fill="url(#blueAreaGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded text-slate-400 text-xs font-mono">
            Awaiting Telemetry Stream
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[0.68rem] text-slate-400 pt-2 border-t border-slate-100 mt-2">
        <span>Sampling: 2.0s</span>
        <span className="text-[#F59E0B] font-semibold">Threshold: {threshold.toFixed(1)} A</span>
      </div>
    </div>
  );
};
