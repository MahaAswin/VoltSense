import React from 'react';
import { Bell, Play, Pause, Square, Plus } from 'lucide-react';
import type { BackendStatus } from '../types/telemetry';

interface DashboardHeaderProps {
  status: BackendStatus;
  activeTab?: string;
  onControl: (action: 'start' | 'pause' | 'resume' | 'stop' | 'step') => void;
  onScenarioChange: (scenario: string) => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  Dashboard: {
    title: 'Dashboard',
    subtitle: 'Real-time single-machine telemetry and edge predictive intelligence.',
  },
  Analytics: {
    title: 'Analytics & Waveforms',
    subtitle: 'Interactive electrical waveforms, peak loads, and multi-parameter telemetry.',
  },
  Diagnostics: {
    title: 'Diagnostics & Hardware Logs',
    subtitle: 'Hardware link supervision, UART metrics, and overcurrent fault logs.',
  },
  Reports: {
    title: 'Reports & Compliance Center',
    subtitle: 'Generate, preview, and download compliance PDF telemetry reports.',
  },
  Support: {
    title: 'Support & Pinout Reference',
    subtitle: 'Hardware connection guide, flashing instructions, and knowledge base.',
  },
};

const SCENARIOS = [
  'Normal Operation',
  'Gradually Increasing Load',
  'Sudden Current Spike',
  'Repeated Overcurrent',
  'Unstable Current Fluctuations',
  'Recovery After Abnormal Event',
  'Power → Current → Voltage → Overcurrent',
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  status,
  activeTab = 'Dashboard',
  onControl,
  onScenarioChange,
}) => {
  const currentInfo = TAB_TITLES[activeTab] || TAB_TITLES.Dashboard;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
      {/* Dynamic Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F1713] tracking-tight">{currentInfo.title}</h1>
        <p className="text-xs text-[#6E7E75] font-medium mt-0.5">
          {currentInfo.subtitle}
        </p>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-3">
        {/* Scenario Pill */}
        <div className="flex items-center gap-1.5 bg-white border border-[#E3E8E4] rounded-full px-3 py-1.5 shadow-sm text-xs">
          <span className="text-[0.68rem] font-bold text-[#8A9A90] uppercase font-mono">Twin:</span>
          <select
            value={status.scenario}
            onChange={(e) => onScenarioChange(e.target.value)}
            className="bg-transparent text-xs font-semibold text-[#0F1713] focus:outline-none cursor-pointer pr-1"
          >
            {SCENARIOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Stream Control Action Pill */}
        <div className="flex items-center gap-1 bg-[#0E1512] rounded-full p-1 shadow-md text-white">
          {!status.simulation_active ? (
            <button
              onClick={() => onControl('start')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00D27B] text-[#0A1F14] text-xs font-bold hover:bg-[#00E599] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,210,123,0.4)]"
            >
              <Play size={12} fill="#0A1F14" /> Start Stream
            </button>
          ) : status.simulation_paused ? (
            <button
              onClick={() => onControl('resume')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00D27B] text-[#0A1F14] text-xs font-bold hover:bg-[#00E599] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,210,123,0.4)]"
            >
              <Play size={12} fill="#0A1F14" /> Resume
            </button>
          ) : (
            <button
              onClick={() => onControl('pause')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C2721] text-white text-xs font-semibold hover:bg-[#25362E] transition-all cursor-pointer"
            >
              <Pause size={12} /> Pause
            </button>
          )}

          <button
            onClick={() => onControl('stop')}
            disabled={!status.simulation_active}
            className="p-1.5 rounded-full hover:bg-[#1C2721] text-[#9EA8A2] hover:text-white disabled:opacity-30 transition-all cursor-pointer disabled:cursor-not-allowed"
            title="Stop Stream"
          >
            <Square size={13} />
          </button>

          <button
            onClick={() => onControl('step')}
            disabled={status.simulation_active && !status.simulation_paused}
            className="p-1.5 rounded-full hover:bg-[#1C2721] text-[#9EA8A2] hover:text-white disabled:opacity-30 transition-all cursor-pointer"
            title="Generate Single Step"
          >
            <Plus size={13} />
          </button>
        </div>

        {/* Notification Bell */}
        <div className="relative w-9 h-9 rounded-full bg-white border border-[#E3E8E4] flex items-center justify-center text-[#5E6D66] shadow-sm">
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#00D27B]" />
        </div>
      </div>
    </div>
  );
};
