import React from 'react';
import type { FourLeds } from '../types/telemetry';
import { Activity, Flame, Info } from 'lucide-react';

interface FourLedPanelProps {
  fourLeds?: FourLeds;
  isOvercurrent: boolean;
}

export const FourLedPanel: React.FC<FourLedPanelProps> = ({ fourLeds, isOvercurrent }) => {
  const currentInc = fourLeds?.current_increase === 1;
  const voltageInc = fourLeds?.voltage_increase === 1;
  const powerInc = fourLeds?.power_increase === 1;
  const sharedRedInc = fourLeds?.shared_red_warning === 1;

  const leds = [
    {
      id: 'current',
      title: 'Current Increase LED',
      sub: 'ΔI > +0.15 A increase',
      pin: 'GPIO 26',
      active: currentInc,
      color: 'white',
      glow: 'shadow-[0_0_12px_rgba(255,255,255,0.7)]',
      bgActive: 'bg-white text-slate-900 border-white',
      bgInactive: 'bg-[#121B27] text-slate-400 border-[#1E2D40]',
      dotActive: 'bg-white shadow-[0_0_6px_white]',
    },
    {
      id: 'voltage',
      title: 'Voltage Increase LED',
      sub: 'ΔV > +0.80 V increase',
      pin: 'GPIO 32',
      active: voltageInc,
      color: 'blue',
      glow: 'shadow-[0_0_12px_rgba(56,189,248,0.7)]',
      bgActive: 'bg-sky-500 text-white border-sky-400',
      bgInactive: 'bg-[#121B27] text-slate-400 border-[#1E2D40]',
      dotActive: 'bg-sky-300 shadow-[0_0_6px_#38BDF8]',
    },
    {
      id: 'power',
      title: 'Power Increase LED',
      sub: 'ΔP > +30.0 W increase',
      pin: 'GPIO 33',
      active: powerInc,
      color: 'amber',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.7)]',
      bgActive: 'bg-amber-500 text-slate-950 border-amber-400',
      bgInactive: 'bg-[#121B27] text-slate-400 border-[#1E2D40]',
      dotActive: 'bg-amber-300 shadow-[0_0_6px_#F59E0B]',
    },
    {
      id: 'shared_red',
      title: 'Shared Red Warning LED',
      sub: 'ALL 3 (I + V + P) Increasing',
      pin: 'GPIO 25',
      active: sharedRedInc,
      color: 'red',
      glow: 'shadow-[0_0_16px_rgba(239,68,68,0.9)] animate-pulse',
      bgActive: 'bg-red-600 text-white border-red-500',
      bgInactive: 'bg-[#121B27] text-slate-400 border-[#1E2D40]',
      dotActive: 'bg-red-400 shadow-[0_0_8px_red]',
    },
  ];

  return (
    <div className="bg-[#172438] border border-[#23354E] rounded-2xl p-4 shadow-sm text-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#21344E] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-[#F59E0B] flex items-center justify-center">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Four-LED Increase Indicator System
            </h3>
            <p className="text-[0.65rem] text-slate-400 font-mono">
              Consecutive 5-second delta evaluation • Active only during positive parameter shifts
            </p>
          </div>
        </div>

        {/* Independent Overcurrent Status Badge */}
        {isOvercurrent && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/20 border border-red-500/40 text-red-400 text-[0.7rem] font-bold animate-pulse">
            <Flame size={13} />
            <span>OVERCURRENT &gt; 5.0 A (Priority Alert Active)</span>
          </div>
        )}
      </div>

      {/* 4-LED Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {leds.map((led) => (
          <div
            key={led.id}
            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
              led.active ? `${led.bgActive} ${led.glow}` : led.bgInactive
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    led.active ? led.dotActive : 'bg-slate-600'
                  }`}
                />
                <span className="text-[0.68rem] font-extrabold uppercase font-mono tracking-wider">
                  {led.active ? 'STATE: ON' : 'STATE: OFF'}
                </span>
              </div>
              <span className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-black/30 text-slate-300">
                {led.pin}
              </span>
            </div>

            <div>
              <span className="text-xs font-bold block">{led.title}</span>
              <span className="text-[0.65rem] opacity-80 font-mono block mt-0.5">
                {led.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Logic clarification footer */}
      <div className="mt-3 pt-2.5 border-t border-[#21344E] flex flex-wrap items-center justify-between gap-2 text-[0.65rem] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <Info size={12} className="text-amber-400 shrink-0" />
          <b>Increase Rule:</b> LEDs respond to positive deltas between consecutive 5s readings.
        </span>
        <span className="text-slate-300">
          Shared Red LED: <b>ON only when Current + Voltage + Power all increase simultaneously</b>
        </span>
      </div>
    </div>
  );
};
