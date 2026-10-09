import React from 'react';
import type { BackendStatus } from '../types/telemetry';
import { Zap, Radio, Clock } from 'lucide-react';

interface MasterHeaderProps {
  status: BackendStatus;
  wsConnected?: boolean;
}

export const MasterHeader: React.FC<MasterHeaderProps> = ({ status, wsConnected = true }) => {
  const latest = status.latest;
  const currentStatus = latest?.status || 'NORMAL';
  const isOvercurrent = currentStatus === 'OVERCURRENT' || (latest?.current ? latest.current > status.current_threshold : false);
  const isRecovery = currentStatus === 'RECOVERY';

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 bg-[#172438] border border-[#23354E] text-white rounded-2xl shadow-sm mb-4">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#F59E0B] flex items-center justify-center text-[#101A2A] shadow-[0_0_12px_rgba(245,158,11,0.4)]">
          <Zap size={18} fill="#101A2A" />
        </div>
        <div>
          <div className="text-sm font-extrabold tracking-wider uppercase font-sans text-white">
            VoltSense
          </div>
          <div className="text-[0.65rem] text-slate-400 font-mono tracking-wider">
            IoT ELECTRICAL MONITOR & 4-LED DETECTION
          </div>
        </div>
      </div>

      {/* Badges & Hardware Status */}
      <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
        {/* SIMULATED DATA BADGE */}
        <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-[#F59E0B] border border-amber-500/30 font-bold text-[0.68rem] uppercase tracking-wider">
          ● SIMULATED DATA
        </span>

        {/* 5-SECOND MONITORING CYCLE INDICATOR */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101A2A] border border-[#243752] text-[0.68rem]">
          <Clock size={11} className="text-amber-400" />
          <span className="text-slate-300">5.0s Cycle</span>
        </div>

        {/* Active Machine Status */}
        {isOvercurrent ? (
          <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/40 font-bold text-[0.68rem] animate-pulse">
            OVERCURRENT (&gt; {status.current_threshold.toFixed(1)}A)
          </span>
        ) : isRecovery ? (
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[0.68rem]">
            RECOVERY STABILIZATION
          </span>
        ) : currentStatus === 'HEAVY_CHANGE' ? (
          <span className="px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold text-[0.68rem]">
            HEAVY SHIFT (Δ ≥ 1.5A)
          </span>
        ) : currentStatus === 'NORMAL_CHANGE' ? (
          <span className="px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold text-[0.68rem]">
            NORMAL SHIFT (Δ ≥ 0.5A)
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-[0.68rem]">
            NORMAL STABLE LOAD
          </span>
        )}

        {/* ESP32 Hardware Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#101A2A] border border-[#243752] text-[0.68rem]">
          <Radio size={12} className={status.esp32_connected ? 'text-emerald-400' : 'text-slate-500'} />
          <span className={status.esp32_connected ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
            ESP32: {status.esp32_connected ? `CONNECTED (${status.serial_port})` : 'DISCONNECTED'}
          </span>
        </div>

        {/* WebSocket Stream Indicator */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#101A2A] border border-[#243752] text-[0.68rem]">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-slate-400 text-[0.62rem]">WS LIVE</span>
        </div>
      </div>
    </header>
  );
};
