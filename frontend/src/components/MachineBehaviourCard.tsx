import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { TelemetrySample } from '../types/telemetry';
import { TrendingUp } from 'lucide-react';

interface MachineBehaviourCardProps {
  history: TelemetrySample[];
  latest: TelemetrySample | null;
}

export const MachineBehaviourCard: React.FC<MachineBehaviourCardProps> = ({
  history,
  latest,
}) => {
  const zScore = latest?.z_score !== undefined ? latest.z_score.toFixed(2) : '0.00';
  const anomalyScore = latest?.anomaly_score !== undefined ? latest.anomaly_score.toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Machine Behaviour
            </h3>
            <p className="text-[0.68rem] text-slate-400">Variability & Trend Analysis</p>
          </div>
        </div>

        <div className="text-right font-mono">
          <span className="text-xs font-bold text-slate-700">Z: {zScore}σ</span>
          <span className="text-[0.65rem] text-slate-400 block">Anomaly: {anomalyScore}%</span>
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
                <linearGradient id="amberWaveGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.01} />
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
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
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
                formatter={(val: any) => [`${Number(val).toFixed(1)}%`, 'Anomaly Index']}
              />
              <Area
                type="monotone"
                dataKey="anomaly_score"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#amberWaveGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded text-slate-400 text-xs font-mono">
            No Behavioural Data Yet
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[0.68rem] text-slate-400 pt-2 border-t border-slate-100 mt-2">
        <span>Window: 15 Samples</span>
        <span className="text-indigo-600 font-semibold">Baseline: 2.5 A</span>
      </div>
    </div>
  );
};
