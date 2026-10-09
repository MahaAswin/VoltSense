import React from 'react';
import type { IndicatorMetric, TelemetrySample } from '../types/telemetry';

interface HealthIndicatorsProps {
  indicators: IndicatorMetric[];
  latest: TelemetrySample | null;
}

export const HealthIndicators: React.FC<HealthIndicatorsProps> = ({
  indicators,
  latest,
}) => {
  const healthScore = latest?.health_score || 100;

  return (
    <section className="mb-6">
      {/* Section Bar */}
      <div className="flex flex-wrap items-baseline justify-between border-b border-[#1E2A34] pb-1.5 mb-3">
        <h2 className="text-[0.78rem] font-bold tracking-[0.14em] uppercase text-[#94A3B8]">
          Section C • Machine Health & Stability Indicators
        </h2>
        <div className="text-xs font-mono text-[#F5F7FA]">
          HEALTH INDEX:{' '}
          <span className="text-[#FF7628] font-bold">
            {healthScore.toFixed(0)}/100
          </span>{' '}
          <span className="text-[#64748B] text-[0.7rem]">(PROTOTYPE)</span>
        </div>
      </div>

      {/* 5 Slim Horizontal Indicator Bars (Reference Aesthetic) */}
      <div className="space-y-3.5 pt-1">
        {indicators.map((ind) => {
          const clampedVal = Math.max(2, Math.min(100, ind.value));

          return (
            <div key={ind.id} className="flex items-center gap-4">
              {/* Index Number */}
              <span className="w-4 text-center font-mono text-xs font-semibold text-[#64748B]">
                {ind.id}
              </span>

              {/* Bar & Label Container */}
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between items-center text-[0.72rem] text-[#94A3B8]">
                  <span>{ind.name}</span>
                </div>

                {/* Track */}
                <div className="w-full h-[7px] bg-[#1A242E] rounded-full relative">
                  {/* Glowing Orange Fill */}
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[rgba(255,118,40,0.4)] via-[#FF7628] to-[#FFAA55] relative transition-all duration-300"
                    style={{ width: `${clampedVal}%` }}
                  >
                    {/* Endpoint Glowing Dot */}
                    <div className="absolute right-[-3px] top-[-2.5px] w-3 h-3 rounded-full bg-white shadow-[0_0_10px_2px_#FF7628,0_0_4px_1px_#FFAA55]" />
                  </div>
                </div>
              </div>

              {/* Percentage Value */}
              <span className="w-16 text-right font-mono text-xs font-semibold text-[#F5F7FA]">
                {ind.value.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};
