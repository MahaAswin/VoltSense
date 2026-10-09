import React from 'react';
import { CircularGauge } from './CircularGauge';
import type { TelemetrySample } from '../types/telemetry';
import { ShieldCheck } from 'lucide-react';

interface MachineHealthCardProps {
  latest: TelemetrySample | null;
  threshold: number;
}

export const MachineHealthCard: React.FC<MachineHealthCardProps> = ({
  latest,
  threshold,
}) => {
  const healthScore = latest?.health_score ?? 100;
  const utilization = latest ? Math.min(100, (latest.current / threshold) * 100) : 0;
  const anomalyScore = latest?.anomaly_score ?? 0;
  const explanation = latest?.anomaly_explanation;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Machine Health
            </h3>
            <p className="text-[0.68rem] text-slate-400">Prototype Health Index</p>
          </div>
        </div>

        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
          Machine 01
        </span>
      </div>

      {/* Circular Gauge Centerpiece */}
      <div className="my-auto py-1">
        <CircularGauge
          score={healthScore}
          utilization={utilization}
          anomalyScore={anomalyScore}
          explanation={explanation}
        />
      </div>

      <div className="flex justify-between items-center text-[0.65rem] text-slate-400 pt-2 border-t border-slate-100">
        <span>Model: Hybrid Rolling Index</span>
        <span className="text-emerald-600 font-semibold">100 Max Score</span>
      </div>
    </div>
  );
};
