import React from 'react';
import type { BackendStatus } from '../types/telemetry';

interface HeaderProps {
  status: BackendStatus;
  wsConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ status, wsConnected }) => {
  const latest = status.latest;
  const currentStatus = latest?.status || 'NORMAL';

  return (
    <header className="flex flex-wrap items-center justify-between border-b border-[#1E2A34] pb-4 pt-2 mb-4">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF7628] shadow-[0_0_10px_#FF7628,0_0_4px_#FFAA55] inline-block" />
        <h1 className="text-base font-extrabold tracking-[0.14em] uppercase text-[#F5F7FA]">
          VoltSense
        </h1>
        <span className="text-xs text-[#64748B] font-mono tracking-wider hidden sm:inline">
          // INDUSTRIAL TELEMETRY
        </span>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="px-2.5 py-1 rounded bg-[#141E26] text-[#94A3B8] border border-[#22313E] tracking-wider uppercase font-semibold">
          Machine 01
        </span>

        <span className="px-2.5 py-1 rounded bg-[rgba(255,118,40,0.12)] text-[#FF7628] border border-[rgba(255,118,40,0.3)] tracking-wider uppercase font-semibold">
          Simulation Mode
        </span>

        {/* Machine Status */}
        {currentStatus === 'OVERCURRENT' ? (
          <span className="px-2.5 py-1 rounded bg-[rgba(239,68,68,0.18)] text-[#EF4444] border border-[rgba(239,68,68,0.4)] tracking-wider uppercase font-bold animate-pulse">
            Overcurrent
          </span>
        ) : currentStatus === 'WARNING' ? (
          <span className="px-2.5 py-1 rounded bg-[rgba(245,158,11,0.15)] text-[#F59E0B] border border-[rgba(245,158,11,0.35)] tracking-wider uppercase font-semibold">
            Warning
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[rgba(16,185,129,0.3)] tracking-wider uppercase font-semibold">
            Normal
          </span>
        )}

        {/* ESP32 Hardware Status */}
        {status.esp32_connected ? (
          <span className="px-2.5 py-1 rounded bg-[rgba(16,185,129,0.12)] text-[#10B981] border border-[rgba(16,185,129,0.3)] tracking-wider uppercase font-semibold">
            ● ESP32 {status.serial_port}
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded bg-[#141E26] text-[#64748B] border border-[#22313E] tracking-wider uppercase font-semibold">
            ○ ESP32 Standby
          </span>
        )}

        {/* WebSocket Link Status */}
        <span
          title={wsConnected ? 'WebSocket Live' : 'WebSocket Disconnected'}
          className={`w-2 h-2 rounded-full ${
            wsConnected
              ? 'bg-[#10B981] shadow-[0_0_6px_#10B981]'
              : 'bg-[#EF4444] shadow-[0_0_6px_#EF4444]'
          }`}
        />
      </div>
    </header>
  );
};
