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

interface CurrentWaveformProps {
  history: TelemetrySample[];
  threshold: number;
  latest: TelemetrySample | null;
}

export const CurrentWaveform: React.FC<CurrentWaveformProps> = ({
  history,
  threshold,
  latest,
}) => {
  const currStr = latest ? `${latest.current.toFixed(2)} A` : '-- A';
  const voltStr = latest ? `${latest.voltage.toFixed(1)} V` : '-- V';
  const pwrStr = latest ? `${latest.power.toFixed(0)} W` : '-- W';

  // Custom Glowing Dot for High / Anomaly Points
  const renderCustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.current >= threshold * 0.85) {
      return (
        <g key={`dot-${payload.timestamp}`}>
          <circle
            cx={cx}
            cy={cy}
            r={5}
            fill="#FFFFFF"
            stroke="#FF7628"
            strokeWidth={2.5}
            className="glow-dot"
          />
        </g>
      );
    }
    return null;
  };

  return (
    <section className="mb-6">
      {/* Section Bar */}
      <div className="flex flex-wrap items-baseline justify-between border-b border-[#1E2A34] pb-1.5 mb-2">
        <h2 className="text-[0.78rem] font-bold tracking-[0.14em] uppercase text-[#94A3B8]">
          Section A • Machine Current Waveform
        </h2>
        <div className="text-xs font-mono text-[#F5F7FA]">
          CURRENT: <span className="text-[#FF7628] font-bold">{currStr}</span>
          <span className="text-[#475569] mx-2">|</span>
          VOLTAGE: <span>{voltStr}</span>
          <span className="text-[#475569] mx-2">|</span>
          POWER: <span>{pwrStr}</span>
        </div>
      </div>

      {/* Chart Area */}
      {history.length > 0 ? (
        <div className="w-full h-52 bg-[#0B1114] pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="currentGlowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7628" stopOpacity={0.28} />
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
                domain={[0, (dataMax: number) => Math.max(8.0, Math.ceil(dataMax + 1))]}
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
                formatter={(value: any) => [`${Number(value).toFixed(2)} A`, 'Current']}
                labelStyle={{ color: '#94A3B8' }}
              />

              {/* Threshold Line at 5.0A */}
              <ReferenceLine
                y={threshold}
                stroke="#FFAA55"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `LIMIT ${threshold.toFixed(1)}A`,
                  fill: '#FFAA55',
                  fontSize: 10,
                  position: 'insideTopRight',
                  fontFamily: 'JetBrains Mono',
                }}
              />

              <Area
                type="monotone"
                dataKey="current"
                stroke="#FF7628"
                strokeWidth={2.5}
                fill="url(#currentGlowGradient)"
                dot={renderCustomDot}
                activeDot={{
                  r: 6,
                  fill: '#FFFFFF',
                  stroke: '#FF7628',
                  strokeWidth: 3,
                }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="w-full h-44 flex flex-col items-center justify-center bg-[#0E151A] rounded border border-dashed border-[#1E2A34] text-center">
          <div className="text-xs text-[#94A3B8] font-mono tracking-wider">
            Awaiting Telemetry Stream
          </div>
          <div className="text-[0.7rem] text-[#475569] mt-1">
            Click ▶ START in the control panel to begin live stream
          </div>
        </div>
      )}
    </section>
  );
};
