import React from 'react';
import { ArrowUpRight, ArrowDownRight, History, Flame, Zap, ShieldCheck } from 'lucide-react';
import type { CurrentChangeEvent } from '../types/telemetry';

interface EventTimelineTableProps {
  events: CurrentChangeEvent[];
}

export const EventTimelineTable: React.FC<EventTimelineTableProps> = ({ events }) => {
  const displayEvents = (events || []).slice(-15).reverse();

  return (
    <div className="bg-[#172438] border border-[#23354E] rounded-2xl p-4 shadow-sm flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            Event Log & 4-LED Increase Audit
          </h3>
        </div>
        <span className="text-[0.65rem] font-mono px-2 py-0.5 rounded bg-[#0E1724] border border-[#23354E] text-slate-400">
          {events?.length || 0} Total Records
        </span>
      </div>

      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#23354E] text-[0.62rem] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-2 px-2">Seq #</th>
              <th className="py-2 px-2">Timestamp</th>
              <th className="py-2 px-2">Current Shift</th>
              <th className="py-2 px-2">Direction</th>
              <th className="py-2 px-2">Event Classification</th>
              <th className="py-2 px-2">4-LED Increases</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1D2B3F] font-mono text-[0.72rem]">
            {displayEvents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500 font-sans text-xs">
                  No abnormal electrical events recorded in this 5-second session.
                </td>
              </tr>
            ) : (
              displayEvents.map((evt, idx) => {
                const isOvercurrent = evt.event_type === 'OVERCURRENT';
                const isHeavy = evt.event_type === 'HEAVY_CHANGE';
                const isRecovery = evt.event_type === 'RECOVERY';
                const isIncrease = evt.direction === 'INCREASE';

                let badgeColor = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                if (isOvercurrent) {
                  badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse';
                } else if (isHeavy) {
                  badgeColor = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                } else if (isRecovery) {
                  badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                }

                return (
                  <tr
                    key={evt.id || evt.event_id || idx}
                    className="hover:bg-[#1C2C44] transition-colors text-slate-200"
                  >
                    {/* Seq # */}
                    <td className="py-2 px-2 font-bold text-amber-400">
                      #{evt.event_count.toString().padStart(2, '0')}
                    </td>

                    {/* Timestamp */}
                    <td className="py-2 px-2 text-slate-300 text-[0.68rem]">
                      {evt.timestamp_local || evt.timestamp}
                    </td>

                    {/* Current Shift */}
                    <td className="py-2 px-2 text-slate-200">
                      <span className="text-slate-400">{evt.previous_current.toFixed(2)}A</span>
                      <span className="mx-1 text-slate-500">→</span>
                      <span className="font-bold text-white">{evt.new_current.toFixed(2)}A</span>
                      <span className="ml-1 text-[0.62rem] text-slate-400">
                        (Δ{evt.change_magnitude.toFixed(2)}A)
                      </span>
                    </td>

                    {/* Direction */}
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-0.5">
                        {isIncrease ? (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                            <span className="text-[0.62rem] text-rose-300 font-bold">INCREASE</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[0.62rem] text-emerald-300 font-bold">DECREASE</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Event Classification */}
                    <td className="py-2 px-2 font-sans">
                      <span className={`inline-flex items-center gap-1 text-[0.62rem] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                        {isOvercurrent ? (
                          <Flame className="w-3 h-3 text-red-400" />
                        ) : isRecovery ? (
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Zap className="w-3 h-3 text-amber-400" />
                        )}
                        {evt.event_type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* 4-LED Increase States */}
                    <td className="py-2 px-2 font-sans">
                      <div className="flex items-center gap-1">
                        <span className={`px-1 py-0.2 rounded text-[0.58rem] font-bold font-mono ${
                          evt.led_current ? 'bg-white text-slate-900 font-extrabold' : 'bg-[#101A2A] text-slate-600'
                        }`}>
                          I
                        </span>
                        <span className={`px-1 py-0.2 rounded text-[0.58rem] font-bold font-mono ${
                          evt.led_voltage ? 'bg-sky-400 text-slate-950 font-extrabold' : 'bg-[#101A2A] text-slate-600'
                        }`}>
                          V
                        </span>
                        <span className={`px-1 py-0.2 rounded text-[0.58rem] font-bold font-mono ${
                          evt.led_power ? 'bg-amber-400 text-slate-950 font-extrabold' : 'bg-[#101A2A] text-slate-600'
                        }`}>
                          P
                        </span>
                        <span className={`px-1 py-0.2 rounded text-[0.58rem] font-bold font-mono ${
                          evt.led_shared_red ? 'bg-red-600 text-white font-extrabold animate-pulse' : 'bg-[#101A2A] text-slate-600'
                        }`}>
                          SHARED
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
