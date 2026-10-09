import React, { useState } from 'react';
import { Play, Pause, Square, SkipForward, RotateCcw, Radio } from 'lucide-react';
import type { BackendStatus } from '../types/telemetry';

interface MasterControlsProps {
  status: BackendStatus;
  onControl: (action: 'start' | 'pause' | 'resume' | 'stop' | 'step' | 'reset') => void;
  onScenarioChange: (scenario: string) => void;
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

export const MasterControls: React.FC<MasterControlsProps> = ({
  status,
  onControl,
  onScenarioChange,
}) => {
  const [selectedScenario, setSelectedScenario] = useState(status.scenario || 'Normal Operation');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const isPaused = status.simulation_active && status.simulation_paused;
  const isStopped = !status.simulation_active;

  const handleScenarioSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedScenario(val);
    onScenarioChange(val);
  };

  const handleConfirmReset = () => {
    onControl('reset');
    setShowResetConfirm(false);
  };

  return (
    <div className="bg-[#172438] border border-[#23354E] rounded-2xl p-3.5 mb-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-white">
      {/* Simulation Playback Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {isStopped ? (
          <button
            onClick={() => onControl('start')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START 5s STREAM</span>
          </button>
        ) : isPaused ? (
          <button
            onClick={() => onControl('resume')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RESUME</span>
          </button>
        ) : (
          <button
            onClick={() => onControl('pause')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            <span>PAUSE</span>
          </button>
        )}

        <button
          onClick={() => onControl('stop')}
          disabled={isStopped}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs border transition-all ${
            isStopped
              ? 'border-slate-800 text-slate-600 cursor-not-allowed'
              : 'border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25 active:scale-95'
          }`}
        >
          <Square className="w-3 h-3 fill-current" />
          <span>STOP</span>
        </button>

        <button
          onClick={() => onControl('step')}
          disabled={!isPaused && !isStopped}
          title="Single 5-second step evaluation"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs border border-[#2D4263] bg-[#0E1724] text-slate-300 hover:bg-[#1D2B3F] transition-all"
        >
          <SkipForward className="w-3.5 h-3.5" />
          <span>STEP (5s)</span>
        </button>

        <button
          onClick={() => setShowResetConfirm(true)}
          title="Reset session and event counters"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs border border-[#2D4263] bg-[#0E1724] text-slate-300 hover:bg-[#1D2B3F] transition-all active:scale-95"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET SESSION</span>
        </button>
      </div>

      {/* Scenario Selector & Port indicator */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase font-mono">
            Active Scenario:
          </span>
          <select
            value={selectedScenario}
            onChange={handleScenarioSelect}
            className="bg-[#0D1520] border border-[#2A3F5E] text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400 font-medium cursor-pointer"
          >
            {SCENARIOS.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0E1724] border border-[#23354E] rounded-lg text-xs font-mono">
          <Radio className={`w-3.5 h-3.5 ${status.esp32_connected ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="text-slate-300">{status.serial_port || 'COM6'}</span>
          <span className="text-[0.6rem] text-slate-500">@ 115200</span>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#172438] border border-[#2B3F5A] rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h4 className="text-sm font-bold text-white mb-1">Confirm Session Reset</h4>
            <p className="text-xs text-slate-300 mb-4 font-mono">
              Are you sure you want to reset all recorded events, baseline history, and energy statistics?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-[#2B3F5A] bg-[#101A2A] text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
