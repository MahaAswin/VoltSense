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

interface BehaviourAnalyticsProps {
  history: TelemetrySample[];
  threshold: number;
  latest: TelemetrySample | null;
}

export const BehaviourAnalytics: React.FC<BehaviourAnalyticsProps> = ({
  history,
  threshold,
  latest,
}) => {
  // Format data with percentage calculations
  const chartData = history.map((item) => {
    const utilPct = Math.min(150, (item.current / threshold) * 100);
    return {
      ...item,
      util_pct: Number(utilPct.toFixed(1)),
      anom_pct: Number((item.anomaly_score || 0).toFixed(1)),
    };
  });

  // Pick key vertical indicator points (matching the reference image's vertical lines)
  const verticalMarkers = chartData.filter((_, idx) => idx % Math.max(1, Math.floor(chartData.length / 5)) === 0);

  return (
    <section className="mb-6">
      {/* Section Bar */}
      <div className="flex flex-wrap items-baseline justify-between border-b border-[#1E2A34] pb-1.5 mb-2">
        <h2 className="text-[0.78rem] font-bold tracking-[0.14em] uppercase text-[#94A3B8]">
          Section B • Machine Behaviour & Variability Analytics
        </h2>
        <div className="text-xs font-mono text-[#F5F7FA]">
          PATTERN:{' '}
          <span className="text-[#FF7628] font-semibold">
            {latest?.anomaly_pattern || 'NOMINAL STEADY-STATE'}
          </span>
        </div>
      </div>

      {/* Chart Area */}
      {chartData.length > 0 ? (
        <div className="w-full h-48 bg-[#0B1114] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="behaviourGlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FFAA55" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#FFAA55" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="anomalySubtleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7628" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#FF7628" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#18232D"
                strokeDasharray="0"
                vertical={true}
                horizontal={true}
              />

              <XAxis
                dataKey="timestamp"
                stroke="#475569"
                tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#475569"
                tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                tickLine={false}
                axisLine={false}
                domain={[0, 140]}
                tickFormatter={(val) => `${val}%`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#10171D',
                  borderColor: '#22313E',
                  borderRadius: '6px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  color: '#F5F7FA',
                }}
                formatter={(value: any, name: any) => [
                  `${Number(value).toFixed(1)}%`,
                  name === 'util_pct' ? 'Utilization' : 'Anomaly Index',
                ]}
                labelStyle={{ color: '#94A3B8' }}
              />

              {/* Vertical Indicator Lines with Percentage Markers (Reference Aesthetics) */}
              {verticalMarkers.map((marker) => (
                <ReferenceLine
                  key={`vline-${marker.timestamp}`}
                  x={marker.timestamp}
                  stroke="rgba(255, 118, 40, 0.45)"
                  strokeWidth={1}
                  label={{
                    value: `${marker.util_pct.toFixed(0)}%`,
                    fill: '#F5F7FA',
                    fontSize: 9,
                    position: 'top',
                    fontFamily: 'JetBrains Mono',
                  }}
                />
              ))}

              {/* Utilization Area */}
              <Area
                type="monotone"
                dataKey="util_pct"
                stroke="#FFAA55"
                strokeWidth={2}
                fill="url(#behaviourGlowGradient)"
                isAnimationActive={false}
              />

              {/* Anomaly Score Wave */}
              <Area
                type="monotone"
                dataKey="anom_pct"
                stroke="#FF7628"
                strokeWidth={1.5}
                fill="url(#anomalySubtleGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-40 flex flex-col items-center justify-center bg-[#0E151A] rounded border border-dashed border-[#1E2A34] text-center">
          <div className="text-xs text-[#94A3B8] font-mono tracking-wider">
            No Behavioural Analytics Available
          </div>
          <div className="text-[0.7rem] text-[#475569] mt-1">
            Historical variability and anomaly patterns will render dynamically
          </div>
        </div>
      )}
    </section>
  );
};
