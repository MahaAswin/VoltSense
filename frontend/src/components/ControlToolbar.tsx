import React, { useState } from 'react';
import { Play, Pause, Square, Plus, Settings } from 'lucide-react';
import type { BackendStatus } from '../types/telemetry';

interface ControlToolbarProps {
  status: BackendStatus;
  onControl: (action: 'start' | 'pause' | 'resume' | 'stop' | 'step') => void;
  onScenarioChange: (scenario: string) => void;
  onSettingsChange: (threshold: number, port: string) => void;
}

const SCENARIOS = [
  'Normal Operation',
  'Gradually Increasing Load',
  'Sudden Current Spike',
  'Repeated Overcurrent',
  'Unstable Current Fluctuations',
  'Recovery After Abnormal Event',
  'Power → Current → Voltage → Overcurrent',
];

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  status,
  onControl,
  onScenarioChange,
  onSettingsChange,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(status.current_threshold);
  const [portInput, setPortInput] = useState(status.serial_port);

  const handleApply = () => {
    onSettingsChange(thresholdInput, portInput);
    setShowSettings(false);
  };

  return (
    <div className="bg-[#121E30] border border-[#203046] rounded-lg px-4 py-2.5 mb-4 flex flex-wrap items-center justify-between gap-3 text-white">
      {/* Scenario Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-400 uppercase font-mono">
          Twin Scenario:
        </span>
        <select
          value={status.scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          className="bg-[#172538] text-white border border-[#263A54] rounded-md px-3 py-1 text-xs font-medium focus:outline-none focus:border-[#376DEB] cursor-pointer"
        >
          {SCENARIOS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2">
        {!status.simulation_active ? (
          <button
            onClick={() => onControl('start')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#376DEB] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Play size={13} fill="white" /> Start Stream
          </button>
        ) : status.simulation_paused ? (
          <button
            onClick={() => onControl('resume')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#376DEB] hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
          >
            <Play size={13} fill="white" /> Resume
          </button>
        ) : (
          <button
            onClick={() => onControl('pause')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1B2A3E] hover:bg-[#23354C] border border-[#2B405C] text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer"
          >
            <Pause size={13} /> Pause
          </button>
        )}

        <button
          onClick={() => onControl('stop')}
          disabled={!status.simulation_active}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#1B2A3E] hover:bg-[#23354C] disabled:opacity-40 border border-[#2B405C] text-slate-200 text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Square size={13} /> Stop
        </button>

        <button
          onClick={() => onControl('step')}
          disabled={status.simulation_active && !status.simulation_paused}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1B2A3E] hover:bg-[#23354C] disabled:opacity-30 border border-[#2B405C] text-slate-300 text-xs font-mono transition-all cursor-pointer"
          title="Single Simulation Step"
        >
          <Plus size={13} /> Step
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-1.5 rounded-md border text-xs transition-all cursor-pointer ${
            showSettings
              ? 'bg-[#F59E0B] text-slate-900 border-[#F59E0B]'
              : 'bg-[#1B2A3E] hover:bg-[#23354C] border-[#2B405C] text-slate-300'
          }`}
          title="System & Threshold Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Popover Settings */}
      {showSettings && (
        <div className="w-full mt-2 pt-2 border-t border-[#203046] flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Threshold:</span>
            <input
              type="number"
              min={1}
              max={20}
              step={0.5}
              value={thresholdInput}
              onChange={(e) => setThresholdInput(parseFloat(e.target.value) || 5.0)}
              className="w-16 bg-[#172538] border border-[#263A54] rounded px-2 py-0.5 text-center text-white focus:outline-none focus:border-[#376DEB]"
            />
            <span className="text-slate-400">A</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">ESP32 Port:</span>
            <input
              type="text"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              className="w-20 bg-[#172538] border border-[#263A54] rounded px-2 py-0.5 text-center text-white focus:outline-none focus:border-[#376DEB]"
            />
          </div>

          <button
            onClick={handleApply}
            className="px-3 py-0.5 rounded bg-[#F59E0B] text-slate-900 font-bold text-xs hover:bg-amber-400 transition-all cursor-pointer"
          >
            Apply Settings
          </button>
        </div>
      )}
    </div>
  );
};
