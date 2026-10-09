import React from 'react';
import type { EnergyMetrics } from '../types/telemetry';
import { Gauge } from 'lucide-react';

interface EnergyIntelligenceCardProps {
  energy: EnergyMetrics;
}

export const EnergyIntelligenceCard: React.FC<EnergyIntelligenceCardProps> = ({ energy }) => {
  const kwh = energy?.cumulative_kwh ?? 0;
  const cost = energy?.session_cost ?? 0;
  const dailyCost = energy?.daily_projected_cost ?? 0;
  const co2 = energy?.carbon_footprint_kg ?? 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Gauge size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Energy Intelligence
            </h3>
            <p className="text-[0.68rem] text-slate-400">Consumption & Cost Models</p>
          </div>
        </div>

        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
          Estimated
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 my-auto">
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2.5">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Energy Consumed
          </span>
          <span className="text-lg font-extrabold text-teal-700 font-mono">
            {kwh.toFixed(4)}{' '}
            <span className="text-[0.7rem] font-sans font-medium text-slate-400">kWh</span>
          </span>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2.5">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Session Cost
          </span>
          <span className="text-lg font-extrabold text-slate-800 font-mono">
            ${cost.toFixed(3)}
          </span>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2.5">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Projected Daily
          </span>
          <span className="text-lg font-extrabold text-slate-800 font-mono">
            ${dailyCost.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2.5">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Carbon Footprint
          </span>
          <span className="text-lg font-extrabold text-slate-800 font-mono">
            {co2.toFixed(3)}{' '}
            <span className="text-[0.7rem] font-sans font-medium text-slate-400">kg</span>
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[0.68rem] text-slate-400 pt-2 border-t border-slate-100 mt-2">
        <span>Tariff: $0.15/kWh</span>
        <span className="text-teal-600 font-semibold">V × I × 0.95 PF</span>
      </div>
    </div>
  );
};
