import React from 'react';
import type { IndicatorMetric } from '../types/telemetry';
import { Sliders } from 'lucide-react';

interface HealthIndicatorsCardProps {
  indicators: IndicatorMetric[];
}

export const HealthIndicatorsCard: React.FC<HealthIndicatorsCardProps> = ({ indicators }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7628] flex items-center justify-center">
            <Sliders size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Health Indicators
            </h3>
            <p className="text-[0.68rem] text-slate-400">5-Dimensional Stability Vectors</p>
          </div>
        </div>

        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-orange-50 text-[#FF7628] border border-orange-200">
          5 Vectors
        </span>
      </div>

      {/* 5 Slim Horizontal Indicators */}
      <div className="space-y-2 my-auto pt-1">
        {indicators.map((ind) => {
          const clampedVal = Math.max(2, Math.min(100, ind.value));

          return (
            <div key={ind.id} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-center font-mono text-[0.68rem] font-bold text-slate-400">
                {ind.id}
              </span>

              <div className="flex-1">
                <div className="flex justify-between items-center text-[0.65rem] text-slate-600 mb-0.5">
                  <span className="truncate">{ind.name}</span>
                  <span className="font-mono font-bold text-slate-800">
                    {ind.value.toFixed(1)}%
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-[#FF7628] to-[#F59E0B] transition-all duration-300"
                    style={{ width: `${clampedVal}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-[0.68rem] text-slate-400 pt-2 border-t border-slate-100 mt-2">
        <span>Dynamic Normalization</span>
        <span className="text-[#FF7628] font-semibold">Real Session Derived</span>
      </div>
    </div>
  );
};
