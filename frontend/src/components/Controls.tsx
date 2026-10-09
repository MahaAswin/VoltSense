import React, { useState } from 'react';
import { Play, Pause, Square, Plus, Settings } from 'lucide-react';
import type { BackendStatus } from '../types/telemetry';

interface ControlsProps {
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

export const Controls: React.FC<ControlsProps> = ({
  status,
  onControl,
  onScenarioChange,
  onSettingsChange,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(status.current_threshold);
  const [portInput, setPortInput] = useState(status.serial_port);

  const handleApplySettings = () => {
    onSettingsChange(thresholdInput, portInput);
    setShowSettings(false);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-[#10171D] border border-[#1E2A34] rounded-lg p-2.5 mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
      {/* Left: Scenario Selector */}
      <div className="flex items-center gap-2">
        <span className="text-[0.7rem] font-bold text-[#64748B] tracking-wider uppercase font-mono">
          Scenario:
        </span>
        <select
          value={status.scenario}
          onChange={(e) => onScenarioChange(e.target.value)}
          className="bg-[#152028] text-[#F5F7FA] border border-[#22313E] rounded px-3 py-1 text-xs font-mono focus:outline-none focus:border-[#FF7628] cursor-pointer"
        >
          {SCENARIOS.map((sc) => (
            <option key={sc} value={sc}>
              {sc}
            </option>
          ))}
        </select>
      </div>

      {/* Center/Right: Action Buttons */}
      <div className="flex items-center gap-2">
        {!status.simulation_active ? (
          <button
            onClick={() => onControl('start')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#FF7628] hover:bg-[#FFAA55] text-[#0B1114] text-xs font-bold tracking-wide uppercase shadow-[0_0_12px_rgba(255,118,40,0.35)] transition-all cursor-pointer"
          >
            <Play size={13} fill="#0B1114" />
            Start
          </button>
        ) : status.simulation_paused ? (
          <button
            onClick={() => onControl('resume')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#FF7628] hover:bg-[#FFAA55] text-[#0B1114] text-xs font-bold tracking-wide uppercase shadow-[0_0_12px_rgba(255,118,40,0.35)] transition-all cursor-pointer"
          >
            <Play size={13} fill="#0B1114" />
            Resume
          </button>
        ) : (
          <button
            onClick={() => onControl('pause')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#18232C] hover:bg-[#202E3A] border border-[#2A3B49] text-[#F5F7FA] text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer"
          >
            <Pause size={13} />
            Pause
          </button>
        )}

        <button
          onClick={() => onControl('stop')}
          disabled={!status.simulation_active}
          className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#18232C] hover:bg-[#202E3A] disabled:opacity-40 border border-[#2A3B49] text-[#F5F7FA] text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <Square size={13} />
          Stop
        </button>

        <button
          onClick={() => onControl('step')}
          disabled={status.simulation_active && !status.simulation_paused}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#18232C] hover:bg-[#202E3A] disabled:opacity-30 border border-[#2A3B49] text-[#94A3B8] text-xs font-mono transition-all cursor-pointer"
          title="Generate 1 Step Sample"
        >
          <Plus size={13} />
          Step
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-1.5 rounded border text-xs transition-all cursor-pointer ${
            showSettings
              ? 'bg-[#FF7628] text-[#0B1114] border-[#FF7628]'
              : 'bg-[#18232C] hover:bg-[#202E3A] border-[#2A3B49] text-[#94A3B8]'
          }`}
          title="Hardware & Threshold Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Collapsible Settings Dropdown */}
      {showSettings && (
        <div className="w-full mt-2 pt-2 border-t border-[#1E2A34] flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">Threshold (A):</span>
            <input
              type="number"
              min={1}
              max={20}
              step={0.5}
              value={thresholdInput}
              onChange={(e) => setThresholdInput(parseFloat(e.target.value) || 5.0)}
              className="w-16 bg-[#152028] border border-[#22313E] rounded px-2 py-0.5 text-center text-[#F5F7FA] focus:outline-none focus:border-[#FF7628]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#64748B]">Serial Port:</span>
            <input
              type="text"
              value={portInput}
              onChange={(e) => setPortInput(e.target.value)}
              className="w-20 bg-[#152028] border border-[#22313E] rounded px-2 py-0.5 text-center text-[#F5F7FA] focus:outline-none focus:border-[#FF7628]"
            />
          </div>

          <button
            onClick={handleApplySettings}
            className="px-2.5 py-0.5 rounded bg-[#FF7628] text-[#0B1114] font-bold text-xs hover:bg-[#FFAA55] transition-all cursor-pointer"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};
