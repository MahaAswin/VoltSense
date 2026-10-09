import React from 'react';
import type { BackendStatus } from '../types/telemetry';
import { Zap, Radio } from 'lucide-react';

interface NavbarProps {
  status: BackendStatus;
  wsConnected: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_TABS = ['Overview', 'Live Monitoring', 'Diagnostics', 'Analytics', 'Settings'];

export const Navbar: React.FC<NavbarProps> = ({
  status,
  wsConnected,
  activeTab,
  onTabChange,
}) => {
  const isOvercurrent = status.latest?.status === 'OVERCURRENT';
  const isWarning = status.latest?.status === 'WARNING';

  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 px-6 py-3.5 bg-[#101A2A] border-b border-[#1E2D42] text-white">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#376DEB] flex items-center justify-center text-white shadow-[0_0_12px_rgba(55,109,235,0.4)]">
          <Zap size={18} fill="white" />
        </div>
        <div>
          <div className="text-sm font-extrabold tracking-wider uppercase font-sans text-white">
            VoltSense
          </div>
          <div className="text-[0.65rem] text-slate-400 font-mono tracking-wider">
            INTELLIGENT MACHINE HEALTH
          </div>
        </div>
      </div>

      {/* Horizontal Nav Tabs */}
      <div className="hidden md:flex items-center gap-1 bg-[#172438] p-1 rounded-lg border border-[#22334D]">
        {NAV_TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#376DEB] text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E2E46]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Badges & Hardware Indicators */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="px-2.5 py-1 rounded-md bg-[#172438] text-slate-300 border border-[#243752] font-semibold text-[0.7rem]">
          Machine 01
        </span>

        <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-[#F59E0B] border border-amber-500/30 font-semibold text-[0.7rem] uppercase">
          Simulation Mode
        </span>

        {/* Status Pill */}
        {isOvercurrent ? (
          <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-[0.7rem] animate-pulse">
            OVERCURRENT
          </span>
        ) : isWarning ? (
          <span className="px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[0.7rem]">
            WARNING
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[0.7rem]">
            NORMAL
          </span>
        )}

        {/* ESP32 Status */}
        <span
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[0.7rem] font-semibold ${
            status.esp32_connected
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}
        >
          <Radio size={11} className={status.esp32_connected ? 'text-emerald-400' : 'text-slate-500'} />
          {status.esp32_connected ? status.serial_port : 'ESP32 Standby'}
        </span>

        {/* WS Status Dot */}
        <span
          title={wsConnected ? 'WebSocket Active' : 'WebSocket Disconnected'}
          className={`w-2 h-2 rounded-full ${
            wsConnected ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]' : 'bg-red-400 shadow-[0_0_6px_#EF4444]'
          }`}
        />
      </div>
    </nav>
  );
};
