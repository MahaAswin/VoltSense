import React from 'react';
import type { IncidentAlert } from '../types/telemetry';
import { Bell, AlertOctagon, AlertTriangle } from 'lucide-react';

interface AlertHistoryCardProps {
  alerts: IncidentAlert[];
}

export const AlertHistoryCard: React.FC<AlertHistoryCardProps> = ({ alerts }) => {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Alert History
            </h3>
            <p className="text-[0.68rem] text-slate-400">Recent Significant Events</p>
          </div>
        </div>

        <span className="text-[0.68rem] font-mono text-slate-500 font-semibold">
          {alerts.length} Captured
        </span>
      </div>

      {/* Incident List */}
      <div className="overflow-y-auto max-h-[140px] space-y-1.5 pr-0.5 my-auto">
        {alerts.length > 0 ? (
          alerts.slice(0, 4).map((a, idx) => {
            const isCrit = a.severity === 'CRITICAL';
            return (
              <div
                key={`${a.timestamp}-${idx}`}
                className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {isCrit ? (
                    <AlertOctagon size={13} className="text-rose-500 shrink-0" />
                  ) : (
                    <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[0.65rem] text-slate-400">
                        {a.timestamp}
                      </span>
                      <span
                        className={`text-[0.6rem] font-bold uppercase px-1.5 py-0.2 rounded ${
                          isCrit
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </div>
                    <span className="text-[0.7rem] text-slate-700 font-medium line-clamp-1">
                      {a.reason}
                    </span>
                  </div>
                </div>

                <span className="font-mono font-bold text-slate-800 text-[0.75rem] shrink-0">
                  {a.current !== undefined ? `${a.current.toFixed(2)} A` : '-- A'}
                </span>
              </div>
            );
          })
        ) : (
          <div className="w-full py-6 flex flex-col items-center justify-center bg-slate-50 rounded text-slate-400 text-xs font-mono">
            <span>No Active Incidents</span>
            <span className="text-[0.65rem] text-slate-400 mt-0.5">
              Normal operating conditions maintained
            </span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-[0.68rem] text-slate-400 pt-2 border-t border-slate-100 mt-2">
        <span>Target: Machine 01</span>
        <span className="text-slate-500 font-medium">State-Transition Tracking</span>
      </div>
    </div>
  );
};
