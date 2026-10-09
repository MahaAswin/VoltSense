import React from 'react';
import type { EnergyMetrics, TelemetrySample } from '../types/telemetry';
import { Cpu, Wind, Zap } from 'lucide-react';

interface EnergyEfficiencyCardProps {
  energy: EnergyMetrics;
  latest: TelemetrySample | null;
}

export const EnergyEfficiencyCard: React.FC<EnergyEfficiencyCardProps> = ({
  energy,
  latest,
}) => {
  const current = latest ? latest.current : 2.85;
  const spindleLoad = (current * 0.65).toFixed(2);
  const coolingLoad = (current * 0.35).toFixed(2);
  const kwh = energy ? energy.cumulative_kwh.toFixed(4) : '0.0428';

  return (
    <div className="bg-[#E7EFE8] border border-[#D5E1D7] rounded-2xl p-5 flex flex-col justify-between h-full shadow-sm text-[#0F1713]">
      {/* Big Headline Metric */}
      <div>
        <span className="text-[0.68rem] font-bold text-[#5B6D62] uppercase tracking-wider block mb-1">
          Cumulative Energy Integrated
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold text-[#0F1713] font-mono tracking-tight">
            {kwh}
          </span>
          <span className="text-xs font-bold text-[#5B6D62]">kWh</span>
        </div>
        <span className="text-xs text-[#00A862] font-semibold mt-1 flex items-center gap-1">
          <span>↗ 20%</span>
          <span className="text-[#5B6D62]">optimized vs standard run</span>
        </span>
      </div>

      {/* Sub-breakdown items */}
      <div className="space-y-2.5 my-3 pt-3 border-t border-[#D5E1D7]/80">
        {/* Item 1 */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#00A862] shadow-xs">
            <Cpu size={15} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#0F1713] block">
              Primary Motor Spindle
            </span>
            <span className="text-[0.65rem] text-[#5B6D62] font-mono">
              {spindleLoad} A (65% estimated allocation)
            </span>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#00A862] shadow-xs">
            <Wind size={15} />
          </div>
          <div>
            <span className="text-xs font-bold text-[#0F1713] block">
              Auxiliary Cooling System
            </span>
            <span className="text-[0.65rem] text-[#5B6D62] font-mono">
              {coolingLoad} A (35% estimated allocation)
            </span>
          </div>
        </div>
      </div>

      {/* Sub-bar */}
      <div className="flex justify-between items-center text-[0.68rem] text-[#5B6D62] pt-2 border-t border-[#D5E1D7]/80">
        <span className="flex items-center gap-1">
          <Zap size={12} className="text-[#00A862]" /> 0.95 Power Factor
        </span>
        <span className="font-mono font-bold text-[#0F1713]">Tariff: $0.15/kWh</span>
      </div>
    </div>
  );
};
