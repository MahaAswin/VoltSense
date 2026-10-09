import React from 'react';
import type { IncidentAlert } from '../types/telemetry';

interface IncidentLogProps {
  alerts: IncidentAlert[];
}

export const IncidentLog: React.FC<IncidentLogProps> = ({ alerts }) => {
  return (
    <section className="mb-4">
      {/* Section Bar */}
      <div className="flex flex-wrap items-baseline justify-between border-b border-[#1E2A34] pb-1.5 mb-2.5">
        <h2 className="text-[0.78rem] font-bold tracking-[0.14em] uppercase text-[#94A3B8]">
          Recent Operational Events & Alerts
        </h2>
        <span className="text-[0.7rem] font-mono text-[#64748B]">
          {alerts.length} logged in session
        </span>
      </div>

      {alerts.length > 0 ? (
        <div className="space-y-1.5 font-mono text-xs max-h-36 overflow-y-auto pr-1">
          {alerts.slice(0, 5).map((a, idx) => {
            const isCrit = a.severity === 'CRITICAL';
            return (
              <div
                key={`${a.timestamp}-${idx}`}
                className="flex items-center justify-between p-2 rounded bg-[#10171D] border border-[#1E2A34] text-[#F5F7FA]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#64748B] text-[0.7rem]">[{a.timestamp}]</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[0.68rem] font-bold uppercase ${
                      isCrit
                        ? 'bg-[rgba(239,68,68,0.2)] text-[#EF4444] border border-[rgba(239,68,68,0.4)]'
                        : 'bg-[rgba(245,158,11,0.2)] text-[#F59E0B] border border-[rgba(245,158,11,0.4)]'
                    }`}
                  >
                    {a.severity}
                  </span>
                  <span className="text-[#94A3B8]">{a.reason}</span>
                </div>

                <span className="text-[#FF7628] font-bold">
                  {a.current !== undefined ? `${a.current.toFixed(2)} A` : '-- A'}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3 bg-[#0E151A] rounded border border-[#1E2A34] text-center text-xs font-mono text-[#64748B]">
          No abnormal threshold incidents recorded in this session.
        </div>
      )}
    </section>
  );
};
