import React from 'react';
import type { TelemetrySample } from '../types/telemetry';

interface TopKpiRowProps {
  latest: TelemetrySample | null;
  threshold: number;
}

export const TopKpiRow: React.FC<TopKpiRowProps> = ({ latest, threshold }) => {
  const current = latest ? latest.current.toFixed(2) : '2.85';
  const health = latest?.health_score !== undefined ? latest.health_score.toFixed(1) : '94.5';
  const power = latest ? latest.power.toFixed(0) : '620';
  const voltage = latest ? latest.voltage.toFixed(1) : '230.0';
  const isOvercurrent = latest ? latest.current > threshold : false;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      {/* CARD 1: Dark Accented Card (Deep Forest Black) */}
      <div className="bg-[#0E1612] border border-[#1E2C23] rounded-2xl p-4 text-white flex justify-between items-center shadow-sm relative overflow-hidden">
        <div>
          <span className="text-[0.68rem] font-bold text-[#8FA397] uppercase tracking-wider block mb-1">
            Machine Current Load
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-extrabold font-mono tracking-tight ${
                isOvercurrent ? 'text-red-400' : 'text-white'
              }`}
            >
              {current}
            </span>
            <span className="text-xs font-semibold text-[#8FA397]">A</span>
          </div>
          <span className="text-[0.65rem] text-[#00D27B] font-semibold mt-1 flex items-center gap-1">
            <span>↗ 1.8%</span>
            <span className="text-[#65796D]">vs 2.5A baseline</span>
          </span>
        </div>

        {/* Live Equalizer Bars */}
        <div className="flex items-end gap-1.5 h-10 px-2">
          <span className="w-1.5 bg-[#00D27B] rounded-full animate-eq-1 inline-block" />
          <span className="w-1.5 bg-[#00D27B] rounded-full animate-eq-2 inline-block" />
          <span className="w-1.5 bg-[#00D27B] rounded-full animate-eq-3 inline-block" />
          <span className="w-1.5 bg-[#00D27B] rounded-full animate-eq-4 inline-block" />
        </div>
      </div>

      {/* CARD 2: White Card (Machine Health Index) */}
      <div className="bg-white border border-[#E5EAE6] rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-[0.68rem] font-bold text-[#6E7E75] uppercase tracking-wider block mb-1">
            Machine Health Index
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#0F1713] font-mono tracking-tight">
              {health}
            </span>
            <span className="text-xs font-semibold text-[#8A9A90]">/ 100</span>
          </div>
          <span className="text-[0.65rem] text-[#00D27B] font-semibold mt-1 flex items-center gap-1">
            <span>↗ Optimal</span>
            <span className="text-[#8A9A90]">prototype index</span>
          </span>
        </div>

        {/* Mini Red/Green Column Graphic */}
        <div className="flex items-end gap-1.5 h-9 px-2">
          <span className="w-1.5 h-3 bg-red-400 rounded-full inline-block" />
          <span className="w-1.5 h-6 bg-red-400 rounded-full inline-block" />
          <span className="w-1.5 h-8 bg-[#00D27B] rounded-full inline-block" />
          <span className="w-1.5 h-5 bg-[#00D27B] rounded-full inline-block" />
        </div>
      </div>

      {/* CARD 3: White Card (Estimated Active Power) */}
      <div className="bg-white border border-[#E5EAE6] rounded-2xl p-4 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-[0.68rem] font-bold text-[#6E7E75] uppercase tracking-wider block mb-1">
            Estimated Active Power
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-[#0F1713] font-mono tracking-tight">
              {power}
            </span>
            <span className="text-xs font-semibold text-[#8A9A90]">W</span>
          </div>
          <span className="text-[0.65rem] text-[#00D27B] font-semibold mt-1 flex items-center gap-1">
            <span>↗ {voltage} V</span>
            <span className="text-[#8A9A90]">0.95 PF</span>
          </span>
        </div>

        {/* Mini Green Column Graphic */}
        <div className="flex items-end gap-1.5 h-9 px-2">
          <span className="w-1.5 h-3 bg-[#00D27B]/40 rounded-full inline-block" />
          <span className="w-1.5 h-7 bg-[#00D27B] rounded-full inline-block" />
          <span className="w-1.5 h-5 bg-[#00D27B] rounded-full inline-block" />
          <span className="w-1.5 h-8 bg-[#00D27B] rounded-full inline-block" />
        </div>
      </div>
    </div>
  );
};
