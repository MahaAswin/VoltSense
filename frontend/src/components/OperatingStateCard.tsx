import React from 'react';
import type { TelemetrySample } from '../types/telemetry';
import { Cpu, Zap, Radio, CheckCircle, AlertTriangle, AlertOctagon } from 'lucide-react';

interface OperatingStateCardProps {
  latest: TelemetrySample | null;
  simulationActive: boolean;
  esp32Connected: boolean;
  serialPort: string;
}

export const OperatingStateCard: React.FC<OperatingStateCardProps> = ({
  latest,
  simulationActive,
  esp32Connected,
  serialPort,
}) => {
  const status = latest?.status || 'NORMAL';
  const voltage = latest ? latest.voltage.toFixed(1) : '230.0';
  const power = latest ? latest.power.toFixed(0) : '--';
  const current = latest ? latest.current.toFixed(2) : '--';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-[#F59E0B] flex items-center justify-center">
            <Cpu size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Operating State
            </h3>
            <p className="text-[0.68rem] text-slate-400">Live Telemetry Triad</p>
          </div>
        </div>

        {/* Status Pill */}
        {status === 'OVERCURRENT' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon size={12} /> OVERCURRENT
          </span>
        ) : status === 'WARNING' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={12} /> WARNING
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> NORMAL
          </span>
        )}
      </div>

      {/* 3 Metric Grid Cards */}
      <div className="grid grid-cols-3 gap-2 my-1">
        {/* Current */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2 text-center">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Current
          </span>
          <span className="text-base font-extrabold text-slate-800 font-mono">
            {current}
          </span>
          <span className="text-[0.65rem] text-slate-400 font-sans block">Amperes</span>
        </div>

        {/* Voltage */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2 text-center">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Voltage
          </span>
          <span className="text-base font-extrabold text-slate-800 font-mono">
            {voltage}
          </span>
          <span className="text-[0.65rem] text-slate-400 font-sans block">Volts (Sim)</span>
        </div>

        {/* Power */}
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-lg p-2 text-center">
          <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-wider block">
            Est. Power
          </span>
          <span className="text-base font-extrabold text-[#376DEB] font-mono">
            {power}
          </span>
          <span className="text-[0.65rem] text-slate-400 font-sans block">Watts</span>
        </div>
      </div>

      {/* Hardware & Link Sub-Bar */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Radio size={13} className={esp32Connected ? 'text-emerald-500' : 'text-slate-400'} />
            ESP32 UART Link
          </span>
          <span
            className={`font-mono text-[0.72rem] font-bold ${
              esp32Connected ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {esp32Connected ? `CONNECTED (${serialPort})` : `STANDBY (${serialPort})`}
          </span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Zap size={13} className="text-[#F59E0B]" />
            Simulation Engine
          </span>
          <span
            className={`font-mono text-[0.72rem] font-bold ${
              simulationActive ? 'text-[#F59E0B]' : 'text-slate-400'
            }`}
          >
            {simulationActive ? 'STREAMING (2s)' : 'IDLE'}
          </span>
        </div>
      </div>
    </div>
  );
};
