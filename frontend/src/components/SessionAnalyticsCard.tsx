import React from 'react';
import type { TelemetrySample } from '../types/telemetry';
import { BarChart3 } from 'lucide-react';

interface SessionAnalyticsCardProps {
  history: TelemetrySample[];
  threshold: number;
}

export const SessionAnalyticsCard: React.FC<SessionAnalyticsCardProps> = ({
  history,
  threshold,
}) => {
  const count = history.length;
  const avgCurrent =
    count > 0 ? (history.reduce((acc, h) => acc + h.current, 0) / count).toFixed(2) : '0.00';
  const maxCurrent =
    count > 0 ? Math.max(...history.map((h) => h.current)).toFixed(2) : '0.00';
  const overcurrentCount = history.filter((h) => h.current > threshold).length;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
            <BarChart3 size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Session Analytics
            </h3>
            <p className="text-[0.68rem] text-slate-400">Statistical Aggregate</p>
          </div>
        </div>

        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
          Live Session
        </span>
      </div>

      {/* 4 Stats Grid */}
      <div className="grid grid-cols-2 gap-2 my-auto">
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2.5">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Average Load
          </span>
          <span className="text-lg font-extrabold text-slate-800 font-mono">
            {avgCurrent}{' '}
            <span className="text-[0.7rem] font-sans font-medium text-slate-400">A</span>
          </span>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2.5">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Peak Current
          </span>
          <span
            className={`text-lg font-extrabold font-mono ${
              Number(maxCurrent) > threshold ? 'text-red-600' : 'text-slate-800'
            }`}
          >
            {maxCurrent}{' '}
            <span className="text-[0.7rem] font-sans font-medium text-slate-400">A</span>
          </span>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2.5">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Total Samples
          </span>
          <span className="text-lg font-extrabold text-slate-800 font-mono">
            {count}
          </span>
        </div>

        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2.5">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Overcurrents
          </span>
          <span
            className={`text-lg font-extrabold font-mono ${
              overcurrentCount > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {overcurrentCount}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center text-[0.68rem] text-slate-400 pt-2 border-t border-slate-100 mt-2">
        <span>Discrete Integration</span>
        <span className="text-cyan-600 font-semibold">Live Metrics</span>
      </div>
    </div>
  );
};
