import React from 'react';
import type { TelemetrySample } from '../types/telemetry';
import { ArrowUpRight, ArrowDownRight, Minus, Activity, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface LiveMeasurementCardsProps {
  latest: TelemetrySample | null;
  threshold: number;
  totalEvents: number;
  nextUpdateIn?: number;
}

export const LiveMeasurementCards: React.FC<LiveMeasurementCardsProps> = ({
  latest,
  threshold,
  totalEvents,
  nextUpdateIn = 5.0,
}) => {
  const currNow = latest ? latest.current.toFixed(2) : '--';
  const prevCurr = latest?.previous_current !== undefined ? latest.previous_current.toFixed(2) : '--';
  const diffCurr = latest?.change_current !== undefined ? latest.change_current : 0;

  const voltNow = latest ? latest.voltage.toFixed(1) : '--';
  const prevVolt = latest?.previous_voltage !== undefined ? latest.previous_voltage.toFixed(1) : '--';
  const diffVolt = latest?.change_voltage !== undefined ? latest.change_voltage : 0;

  const pwrNow = latest ? latest.power.toFixed(0) : '--';
  const prevPwr = latest?.previous_power !== undefined ? latest.previous_power.toFixed(0) : '--';
  const diffPwr = latest?.change_power !== undefined ? latest.change_power : 0;

  const isOvercurrent = latest ? latest.current > threshold : false;
  const status = latest?.status || 'STANDBY';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-4">
      {/* 1. Current Load Card */}
      <div className="bg-[#172438] border border-[#23354E] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
            Current (I)
          </span>
          <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-[#101A2A] text-slate-300">
            Lim: {threshold.toFixed(1)}A
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${isOvercurrent ? 'text-red-400' : 'text-white'}`}>
              {currNow}
            </span>
            <span className="text-xs font-bold text-slate-400">A</span>
          </div>

          <div className="flex items-center gap-1 text-[0.7rem] font-mono mt-1">
            {diffCurr > 0 ? (
              <span className="text-rose-400 font-bold flex items-center">
                <ArrowUpRight size={14} /> +{diffCurr.toFixed(2)} A
              </span>
            ) : diffCurr < 0 ? (
              <span className="text-emerald-400 font-bold flex items-center">
                <ArrowDownRight size={14} /> {diffCurr.toFixed(2)} A
              </span>
            ) : (
              <span className="text-slate-400 flex items-center">
                <Minus size={14} /> 0.00 A
              </span>
            )}
            <span className="text-slate-500 ml-auto">Prev: {prevCurr} A</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#203248] text-[0.62rem] text-slate-400 font-mono flex justify-between">
          <span>Increase Tol: &gt; +0.15 A</span>
          <span>Sample: 5.0s</span>
        </div>
      </div>

      {/* 2. Voltage Supply Card */}
      <div className="bg-[#172438] border border-[#23354E] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
            Voltage Supply (V)
          </span>
          <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-[#101A2A] text-slate-300">
            Grid ~230V
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-sky-400">
              {voltNow}
            </span>
            <span className="text-xs font-bold text-slate-400">V</span>
          </div>

          <div className="flex items-center gap-1 text-[0.7rem] font-mono mt-1">
            {diffVolt > 0 ? (
              <span className="text-sky-400 font-bold flex items-center">
                <ArrowUpRight size={14} /> +{diffVolt.toFixed(1)} V
              </span>
            ) : diffVolt < 0 ? (
              <span className="text-slate-400 font-bold flex items-center">
                <ArrowDownRight size={14} /> {diffVolt.toFixed(1)} V
              </span>
            ) : (
              <span className="text-slate-400 flex items-center">
                <Minus size={14} /> 0.0 V
              </span>
            )}
            <span className="text-slate-500 ml-auto">Prev: {prevVolt} V</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#203248] text-[0.62rem] text-slate-400 font-mono flex justify-between">
          <span>Increase Tol: &gt; +0.80 V</span>
          <span>Single Phase AC</span>
        </div>
      </div>

      {/* 3. Power Consumption Card */}
      <div className="bg-[#172438] border border-[#23354E] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
            Active Power (P)
          </span>
          <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-[#101A2A] text-slate-300">
            PF: 0.95
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono tracking-tight text-amber-400">
              {pwrNow}
            </span>
            <span className="text-xs font-bold text-slate-400">W</span>
          </div>

          <div className="flex items-center gap-1 text-[0.7rem] font-mono mt-1">
            {diffPwr > 0 ? (
              <span className="text-amber-400 font-bold flex items-center">
                <ArrowUpRight size={14} /> +{diffPwr.toFixed(0)} W
              </span>
            ) : diffPwr < 0 ? (
              <span className="text-slate-400 font-bold flex items-center">
                <ArrowDownRight size={14} /> {diffPwr.toFixed(0)} W
              </span>
            ) : (
              <span className="text-slate-400 flex items-center">
                <Minus size={14} /> 0 W
              </span>
            )}
            <span className="text-slate-500 ml-auto">Prev: {prevPwr} W</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#203248] text-[0.62rem] text-slate-400 font-mono flex justify-between">
          <span>Formula: V × I × 0.95</span>
          <span>Tol: &gt; +30W</span>
        </div>
      </div>

      {/* 4. Operating Status & 5s Cycle Countdown Card */}
      <div className="bg-[#172438] border border-[#23354E] rounded-2xl p-4 flex flex-col justify-between shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
            System State
          </span>
          <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-[#101A2A] text-amber-400 font-bold">
            #{totalEvents.toString().padStart(2, '0')} Events
          </span>
        </div>

        <div className="my-2">
          <div className="flex items-center gap-2">
            {isOvercurrent ? (
              <ShieldAlert className="text-red-400 shrink-0" size={24} />
            ) : status === 'NORMAL_CHANGE' || status === 'HEAVY_CHANGE' ? (
              <Activity className="text-amber-400 shrink-0" size={24} />
            ) : (
              <CheckCircle2 className="text-emerald-400 shrink-0" size={24} />
            )}
            <div>
              <span className={`text-base font-extrabold font-mono tracking-tight block ${
                isOvercurrent ? 'text-red-400 animate-pulse' :
                status === 'HEAVY_CHANGE' ? 'text-rose-400' :
                status === 'NORMAL_CHANGE' ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {status.replace('_', ' ')}
              </span>
              <span className="text-[0.65rem] text-slate-400 block line-clamp-1">
                {latest?.explanation || 'Awaiting 5s sample evaluation...'}
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-[#203248] text-[0.62rem] text-slate-400 font-mono flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock size={11} className="text-amber-400" />
            Next Sample:
          </span>
          <span className="text-white font-bold">{nextUpdateIn.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
};
