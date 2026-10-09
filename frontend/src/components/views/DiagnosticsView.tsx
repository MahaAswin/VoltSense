import React, { useState } from 'react';
import {
  Activity,
  Sliders,
  CheckCircle2,
  Radio,
} from 'lucide-react';
import type { BackendStatus } from '../../types/telemetry';

interface DiagnosticsViewProps {
  status: BackendStatus;
  onSettingsChange?: (threshold: number, port: string) => void;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({ status }) => {
  const [thresholdInput, setThresholdInput] = useState(status.current_threshold);
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const events = status.events || [];

  const handleSaveThreshold = async () => {
    setIsUpdating(true);
    setSaveSuccess(false);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: thresholdInput }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update threshold:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Diagnostics Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0F1713] tracking-tight">
              Hardware Diagnostics & Fault Analysis
            </h2>
            <span className={`px-2.5 py-0.5 rounded-full font-mono text-[0.65rem] font-bold border ${
              status.esp32_connected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {status.esp32_connected ? '● ESP32 LINK ACTIVE' : '○ ESP32 DISCONNECTED'}
            </span>
          </div>
          <p className="text-xs text-[#6E7E75] mt-0.5">
            Real-time UART status, hardware health indicators, and overcurrent supervision.
          </p>
        </div>
      </div>

      {/* Hardware Link Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Serial Communication Link */}
        <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6E7E75] uppercase font-mono">Serial UART</span>
            <Radio size={16} className={status.esp32_connected ? 'text-[#00D27B]' : 'text-amber-500'} />
          </div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`w-3 h-3 rounded-full ${status.esp32_connected ? 'bg-[#00D27B] animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-lg font-bold text-[#0F1713] font-mono">
              {status.serial_port} @ {status.baud_rate}
            </span>
          </div>
          <div className="text-xs text-[#6E7E75] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Protocol:</span>
              <span className="font-bold text-[#0F1713]">Canonical CSV / V2</span>
            </div>
            <div className="flex justify-between">
              <span>Sampling Cycle:</span>
              <span className="font-bold text-[#00D27B]">5.00 seconds</span>
            </div>
            <div className="flex justify-between">
              <span>Next Packet:</span>
              <span className="font-bold text-[#0F1713]">
                in {(status.next_update_in ?? 5.0).toFixed(1)}s
              </span>
            </div>
          </div>
        </div>

        {/* Supervision & Thresholds */}
        <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6E7E75] uppercase font-mono">Threshold Supervision</span>
            <Sliders size={16} className="text-blue-500" />
          </div>
          <div className="mb-3">
            <label className="text-[0.68rem] text-[#6E7E75] font-semibold block mb-1">
              Overcurrent Limit (Amps)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(parseFloat(e.target.value) || 5.0)}
                className="w-24 bg-[#F6F8F6] border border-[#DCE4DF] rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-[#0F1713] focus:outline-none focus:border-[#00D27B]"
              />
              <button
                onClick={handleSaveThreshold}
                disabled={isUpdating}
                className="px-3 py-1 bg-[#0E1512] text-white text-xs font-bold rounded-lg hover:bg-[#1C2822] transition-all cursor-pointer"
              >
                {isUpdating ? 'Saving...' : 'Apply'}
              </button>
            </div>
            {saveSuccess && (
              <span className="text-[0.65rem] text-[#00D27B] font-bold block mt-1">
                ✓ Threshold saved & broadcasted
              </span>
            )}
          </div>
          <div className="text-xs text-[#6E7E75] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Normal ΔI:</span>
              <span className="font-bold text-[#0F1713]">≥ 0.50 A</span>
            </div>
            <div className="flex justify-between">
              <span>Heavy ΔI:</span>
              <span className="font-bold text-[#0F1713]">≥ 1.50 A</span>
            </div>
          </div>
        </div>

        {/* Machine Health & Status */}
        <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#6E7E75] uppercase font-mono">Supervision Metrics</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-[#0F1713] font-mono mb-2">
            {status.total_events}{' '}
            <span className="text-xs font-bold text-[#6E7E75]">Total Incidents</span>
          </div>
          <div className="text-xs text-[#6E7E75] space-y-1 font-mono">
            <div className="flex justify-between">
              <span>Overcurrent Breaches:</span>
              <span className="font-bold text-red-500">{status.overcurrent_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Normal Changes:</span>
              <span className="font-bold text-amber-600">{status.normal_changes_count}</span>
            </div>
            <div className="flex justify-between">
              <span>Heavy Shifts:</span>
              <span className="font-bold text-rose-600">{status.heavy_changes_count}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Incident & Event Timeline Log Table */}
      <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#0F1713]">
              Anomaly & Overcurrent Incident Timeline
            </h3>
            <p className="text-[0.7rem] text-[#6E7E75]">
              Chronological log of discrete electrical events detected by edge change model.
            </p>
          </div>
          <span className="text-xs font-mono text-[#6E7E75]">
            Total Events: {events.length}
          </span>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center text-[#6E7E75]">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2 opacity-80" />
            <p className="text-xs font-semibold">No abnormal events recorded in current session.</p>
            <p className="text-[0.68rem] text-[#8A9A90] mt-0.5">Machine is running smoothly within nominal parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F8F6] text-[#6E7E75] text-[0.68rem] uppercase font-mono font-bold">
                <tr>
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Current</th>
                  <th className="py-2.5 px-3">Δ Current</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Diagnostic Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEA] font-mono">
                {events.slice().reverse().map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#F9FAF9]">
                    <td className="py-2.5 px-3 font-bold text-[#0F1713]">{evt.id}</td>
                    <td className="py-2.5 px-3 text-[#6E7E75]">{evt.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                        evt.event_type === 'OVERCURRENT'
                          ? 'bg-red-100 text-red-700'
                          : evt.event_type === 'HEAVY_CHANGE'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {evt.event_type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#0F1713]">
                      {evt.new_current?.toFixed(2) || evt.current_now?.toFixed(2)} A
                    </td>
                    <td className="py-2.5 px-3 text-[#6E7E75]">
                      {evt.change_current !== undefined ? `${evt.change_current > 0 ? '+' : ''}${evt.change_current.toFixed(2)} A` : '--'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-bold ${
                        evt.severity === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'
                      }`}>
                        {evt.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[0.72rem] text-[#6E7E75] font-sans">
                      {evt.explanation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
