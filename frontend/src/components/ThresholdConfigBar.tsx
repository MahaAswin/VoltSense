import React, { useState } from 'react';
import { Sliders, Check, RotateCcw } from 'lucide-react';
import type { BackendStatus } from '../types/telemetry';

interface ThresholdConfigBarProps {
  status: BackendStatus;
  onUpdateSettings: (settings: any) => Promise<void>;
}

export const ThresholdConfigBar: React.FC<ThresholdConfigBarProps> = ({ status, onUpdateSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [threshold, setThreshold] = useState(status.current_threshold || 5.0);
  const [tolCurrent, setTolCurrent] = useState(status.tol_current || 0.15);
  const [tolVoltage, setTolVoltage] = useState(status.tol_voltage || 0.80);
  const [tolPower, setTolPower] = useState(status.tol_power || 30.0);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await onUpdateSettings({
      threshold: Number(threshold),
      tol_current: Number(tolCurrent),
      tol_voltage: Number(tolVoltage),
      tol_power: Number(tolPower),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetDefaults = async () => {
    setThreshold(5.0);
    setTolCurrent(0.15);
    setTolVoltage(0.80);
    setTolPower(30.0);
    await onUpdateSettings({
      threshold: 5.0,
      tol_current: 0.15,
      tol_voltage: 0.80,
      tol_power: 30.0,
    });
  };

  return (
    <div className="bg-[#172438] border border-[#23354E] rounded-xl p-3 mb-4 shadow-sm text-white">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-amber-400 transition-colors"
        >
          <Sliders size={14} className="text-amber-400" />
          <span>SUPERVISORY THRESHOLDS & 4-LED TOLERANCES</span>
          <span className="text-[0.65rem] text-slate-400 font-mono">
            {isOpen ? '▲ Collapse' : '▼ Configure'}
          </span>
        </button>

        <div className="flex items-center gap-3 text-[0.7rem] font-mono text-slate-400">
          <span>Limit: <b className="text-red-400">{status.current_threshold.toFixed(1)}A</b></span>
          <span>ΔI-Tol: <b className="text-white">+{status.tol_current?.toFixed(2) || 0.15}A</b></span>
          <span>ΔV-Tol: <b className="text-sky-400">+{status.tol_voltage?.toFixed(1) || 0.8}V</b></span>
          <span>ΔP-Tol: <b className="text-amber-400">+{status.tol_power?.toFixed(0) || 30}W</b></span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-[#203248] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Overcurrent Limit */}
          <div>
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-1">
              Hard Overcurrent Limit (A)
            </label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="20.0"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value) || 5.0)}
              className="w-full bg-[#101A2A] border border-[#2B3F5A] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Current Increase Tol */}
          <div>
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-1">
              Current Inc Tol (+A)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="2.0"
              value={tolCurrent}
              onChange={(e) => setTolCurrent(parseFloat(e.target.value) || 0.15)}
              className="w-full bg-[#101A2A] border border-[#2B3F5A] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Voltage Increase Tol */}
          <div>
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-1">
              Voltage Inc Tol (+V)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="10.0"
              value={tolVoltage}
              onChange={(e) => setTolVoltage(parseFloat(e.target.value) || 0.8)}
              className="w-full bg-[#101A2A] border border-[#2B3F5A] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Power Increase Tol */}
          <div>
            <label className="text-[0.65rem] font-bold text-slate-400 uppercase block mb-1">
              Power Inc Tol (+W)
            </label>
            <input
              type="number"
              step="1"
              min="1"
              max="200"
              value={tolPower}
              onChange={(e) => setTolPower(parseFloat(e.target.value) || 30)}
              className="w-full bg-[#101A2A] border border-[#2B3F5A] rounded-lg px-2.5 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Actions */}
          <div className="lg:col-span-4 flex items-center justify-end gap-2 pt-1">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 rounded-lg border border-[#2A3E5A] bg-[#101A2A] text-slate-300 hover:bg-[#1E2D42] text-xs font-semibold flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Defaults</span>
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1"
            >
              <Check size={14} />
              <span>{saved ? 'Saved!' : 'Apply Settings'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
