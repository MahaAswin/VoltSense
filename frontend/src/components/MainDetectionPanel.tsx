import React from 'react';
import type { BackendStatus } from '../types/telemetry';
import { ArrowUpRight, ArrowDownRight, Minus, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface MainDetectionPanelProps {
  status: BackendStatus;
}

export const MainDetectionPanel: React.FC<MainDetectionPanelProps> = ({ status }) => {
  const latest = status.latest;
  const currentNow = latest ? latest.current.toFixed(2) : '--';
  const prevCurrent = latest ? latest.previous_current.toFixed(2) : '--';
  const changeA = latest?.change_a !== undefined ? latest.change_a.toFixed(2) : (latest?.current_change !== undefined ? latest.current_change.toFixed(2) : '0.00');
  const direction = latest?.direction || latest?.change_direction || 'NONE';
  const eventType = latest?.event_type || 'BASELINE_INIT';
  const whiteLed = latest ? latest.white_led === 1 : false;
  const redLed = latest ? latest.red_led === 1 : false;
  const explanation = latest?.explanation || 'Awaiting live current readings...';
  const lastEventTime = latest ? latest.timestamp : '--:--:--';
  const isOvercurrent = latest ? latest.current > status.current_threshold : false;

  return (
    <div className="bg-[#172438] border border-[#203248] rounded-xl p-5 shadow-lg text-white">
      {/* Top Title Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#22364E] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-[#F59E0B] flex items-center justify-center">
            <Activity size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Current-Change Detection Center
            </h2>
            <p className="text-[0.68rem] text-slate-400 font-mono">
              ΔI = |CurrentNow - PreviousCurrent| • Sample Rate: 2.0s • Active State: {eventType.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Sequential Event Count Badge */}
        <div className="bg-[#101A2A] border border-[#23374F] rounded-lg px-3.5 py-1.5 flex items-center gap-3">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase font-mono">
            Recorded Changes:
          </span>
          <span className="text-lg font-extrabold font-mono text-[#F59E0B]">
            {String(status.total_events || status.events?.length || 0).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* 1. Current Now */}
        <div className="bg-[#101A2A] border border-[#22344B] rounded-xl p-3.5 text-center">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Current Now (I_now)
          </span>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {currentNow}{' '}
            <span className="text-sm font-sans font-semibold text-slate-400">A</span>
          </div>
          <span className="text-[0.65rem] text-slate-400 font-mono mt-1 block">
            Safety Limit: {status.current_threshold.toFixed(1)} A
          </span>
        </div>

        {/* 2. Previous Current */}
        <div className="bg-[#101A2A] border border-[#22344B] rounded-xl p-3.5 text-center">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Previous Current (I_prev)
          </span>
          <div className="text-3xl font-extrabold font-mono text-slate-300 tracking-tight">
            {prevCurrent}{' '}
            <span className="text-sm font-sans font-semibold text-slate-500">A</span>
          </div>
          <span className="text-[0.65rem] text-slate-400 font-mono mt-1 block">
            Last Reading Baseline
          </span>
        </div>

        {/* 3. Change Magnitude & Direction */}
        <div className="bg-[#101A2A] border border-[#22344B] rounded-xl p-3.5 text-center">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Current Delta (ΔI)
          </span>
          <div className="flex items-center justify-center gap-1 text-3xl font-extrabold font-mono tracking-tight text-[#F59E0B]">
            {direction === 'INCREASE' ? (
              <ArrowUpRight size={24} className="text-rose-400" />
            ) : direction === 'DECREASE' ? (
              <ArrowDownRight size={24} className="text-emerald-400" />
            ) : (
              <Minus size={24} className="text-slate-500" />
            )}
            <span>{changeA}</span>
            <span className="text-sm font-sans font-semibold text-slate-400">A</span>
          </div>
          <span className="text-[0.65rem] font-mono text-slate-300 mt-1 block">
            Direction: <b className="text-white">{direction}</b>
          </span>
        </div>

        {/* 4. Hardware LED Indicators */}
        <div className="bg-[#101A2A] border border-[#22344B] rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider block text-center">
            ESP32 Physical LEDs
          </span>

          <div className="grid grid-cols-2 gap-2 my-auto pt-1">
            {/* White LED (GPIO 26) */}
            <div
              className={`p-2 rounded-lg border text-center transition-all ${
                whiteLed
                  ? 'bg-white text-slate-900 border-white shadow-[0_0_14px_rgba(255,255,255,0.7)]'
                  : 'bg-[#15202E] text-slate-500 border-[#243446]'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    whiteLed ? 'bg-white shadow-[0_0_8px_white]' : 'bg-slate-600'
                  }`}
                />
                <span className="text-[0.7rem] font-bold font-mono">WHITE</span>
              </div>
              <span className="text-[0.62rem] font-mono block">
                GPIO 26 {whiteLed ? '(ON)' : '(OFF)'}
              </span>
            </div>

            {/* Red LED (GPIO 25) */}
            <div
              className={`p-2 rounded-lg border text-center transition-all ${
                redLed
                  ? 'bg-red-600 text-white border-red-500 shadow-[0_0_16px_rgba(239,68,68,0.8)] animate-pulse'
                  : 'bg-[#15202E] text-slate-500 border-[#243446]'
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    redLed ? 'bg-red-400 shadow-[0_0_8px_red]' : 'bg-slate-600'
                  }`}
                />
                <span className="text-[0.7rem] font-bold font-mono">RED</span>
              </div>
              <span className="text-[0.62rem] font-mono block">
                GPIO 25 {redLed ? '(ON)' : '(OFF)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Explanation Banner */}
      <div className="bg-[#101A2A] border border-[#22344B] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          {isOvercurrent || redLed ? (
            <ShieldAlert size={16} className="text-red-400 shrink-0" />
          ) : whiteLed ? (
            <Activity size={16} className="text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          )}
          <span className="text-slate-300 font-mono text-[0.75rem]">
            <b>Event Classification:</b> {explanation}
          </span>
        </div>

        <span className="text-[0.68rem] text-slate-400 font-mono">
          Last Evaluation: <b>{lastEventTime}</b>
        </span>
      </div>
    </div>
  );
};
