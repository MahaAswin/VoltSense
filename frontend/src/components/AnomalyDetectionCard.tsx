import React from 'react';
import type { TelemetrySample } from '../types/telemetry';
import { BrainCircuit, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AnomalyDetectionCardProps {
  latest: TelemetrySample | null;
  threshold: number;
}

export const AnomalyDetectionCard: React.FC<AnomalyDetectionCardProps> = ({
  latest,
  threshold,
}) => {
  const pattern = latest?.anomaly_pattern || 'Nominal Steady-State';
  const severity = latest?.anomaly_severity || 'LOW';
  const explanation =
    latest?.anomaly_explanation ||
    'Electrical current parameters are consistent with rolling baseline statistical expectations.';
  const isOvercurrent = latest ? latest.current > threshold : false;

  let sevBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (severity === 'CRITICAL' || isOvercurrent) {
    sevBadge = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (severity === 'HIGH') {
    sevBadge = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (severity === 'MODERATE') {
    sevBadge = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <BrainCircuit size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Anomaly Detection
            </h3>
            <p className="text-[0.68rem] text-slate-400">Statistical & Threshold Engine</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase border ${sevBadge}`}
        >
          {severity} SEVERITY
        </span>
      </div>

      {/* Pattern & Explanation Box */}
      <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-3 my-auto">
        <div className="flex items-start gap-2 mb-1.5">
          {severity === 'CRITICAL' || isOvercurrent ? (
            <AlertTriangle size={15} className="text-rose-500 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block">
              Identified Pattern
            </span>
            <span className="text-xs font-bold text-slate-800 leading-tight block">
              {pattern}
            </span>
          </div>
        </div>

        <p className="text-[0.72rem] text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2 mt-1.5">
          {explanation}
        </p>
      </div>

      <div className="flex justify-between items-center text-[0.68rem] text-slate-400 pt-2 border-t border-slate-100 mt-2">
        <span>
          Classification:{' '}
          <b className="text-slate-600">
            {isOvercurrent ? 'Hard Threshold Breach' : 'Rolling Statistical'}
          </b>
        </span>
        <span className="text-purple-600 font-semibold">Explainable AI</span>
      </div>
    </div>
  );
};
