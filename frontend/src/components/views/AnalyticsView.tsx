import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Zap,
  Gauge,
} from 'lucide-react';
import type { BackendStatus } from '../../types/telemetry';

interface AnalyticsViewProps {
  status: BackendStatus;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ status }) => {
  const [timeFilter, setTimeFilter] = useState<'5m' | '15m' | '1h' | 'all'>('15m');

  const history = status.history || [];

  // Filter history according to selected time range
  const filteredData = useMemo(() => {
    if (!history.length) return [];
    if (timeFilter === '5m') return history.slice(-12);
    if (timeFilter === '15m') return history.slice(-36);
    if (timeFilter === '1h') return history.slice(-60);
    return history;
  }, [history, timeFilter]);

  // Derived Analytics Computations
  const stats = useMemo(() => {
    if (!filteredData.length) {
      return {
        peakI: 0,
        avgI: 0,
        minI: 0,
        peakV: 230,
        avgV: 230,
        minV: 230,
        peakP: 0,
        avgP: 0,
        totalKwh: status.energy?.cumulative_kwh || 0,
      };
    }
    const currents = filteredData.map((d) => d.current);
    const voltages = filteredData.map((d) => d.voltage);
    const powers = filteredData.map((d) => d.power);

    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    return {
      peakI: Math.max(...currents),
      avgI: sum(currents) / currents.length,
      minI: Math.min(...currents),
      peakV: Math.max(...voltages),
      avgV: sum(voltages) / voltages.length,
      minV: Math.min(...voltages),
      peakP: Math.max(...powers),
      avgP: sum(powers) / powers.length,
      totalKwh: status.energy?.cumulative_kwh || 0,
    };
  }, [filteredData, status.energy]);

  return (
    <div className="space-y-5">
      {/* Analytics Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0F1713] tracking-tight">
              Electrical Analytics & Waveform Intelligence
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 font-mono text-[0.65rem] font-bold">
              ● {status.mode || 'SIMULATED'}
            </span>
          </div>
          <p className="text-xs text-[#6E7E75] mt-0.5">
            Synchronous 5-second multi-parameter telemetry analysis for Machine 01 (Spindle).
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F0F4F1] p-1 rounded-xl border border-[#DCE4DF] text-xs font-semibold">
            {(['5m', '15m', '1h', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeFilter === f
                    ? 'bg-white text-[#0F1713] shadow-sm font-bold'
                    : 'text-[#6E7E75] hover:text-[#0F1713]'
                }`}
              >
                {f === '5m' ? 'Last 5m' : f === '15m' ? 'Last 15m' : f === '1h' ? 'Last 1h' : 'All History'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peak Current Card */}
        <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#6E7E75] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Peak Current</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#00D27B] flex items-center justify-center">
              <Zap size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F1713] font-mono">
            {stats.peakI.toFixed(2)}{' '}
            <span className="text-xs font-bold text-[#6E7E75]">A</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[0.7rem] text-[#6E7E75]">
            <span>Avg: {stats.avgI.toFixed(2)} A</span>
            <span>•</span>
            <span className="text-emerald-600 font-semibold">Min: {stats.minI.toFixed(2)} A</span>
          </div>
        </div>

        {/* Voltage Stability Card */}
        <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#6E7E75] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Voltage Baseline</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F1713] font-mono">
            {stats.avgV.toFixed(1)}{' '}
            <span className="text-xs font-bold text-[#6E7E75]">V</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[0.7rem] text-[#6E7E75]">
            <span>Peak: {stats.peakV.toFixed(1)} V</span>
            <span>•</span>
            <span className="text-blue-600 font-semibold">Min: {stats.minV.toFixed(1)} V</span>
          </div>
        </div>

        {/* Peak Power Card */}
        <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#6E7E75] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Peak Active Power</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F1713] font-mono">
            {stats.peakP.toFixed(0)}{' '}
            <span className="text-xs font-bold text-[#6E7E75]">W</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[0.7rem] text-[#6E7E75]">
            <span>Avg: {stats.avgP.toFixed(0)} W</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">PF: 0.95</span>
          </div>
        </div>

        {/* Cumulative Energy Card */}
        <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-[#6E7E75] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider font-mono">Cumulative Energy</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Gauge size={15} />
            </div>
          </div>
          <div className="text-2xl font-black text-[#0F1713] font-mono">
            {stats.totalKwh.toFixed(4)}{' '}
            <span className="text-xs font-bold text-[#6E7E75]">kWh</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[0.7rem] text-[#6E7E75]">
            <span>Cost: ${status.energy?.session_cost?.toFixed(3) || '0.000'}</span>
            <span>•</span>
            <span className="text-purple-600 font-semibold">{status.energy?.runtime_str || '0s'}</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Metric Waveform Chart */}
      <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#0F1713]">
              Synchronized Multi-Parameter Waveforms
            </h3>
            <p className="text-[0.7rem] text-[#6E7E75]">
              Real-time Current (A), Voltage (V), and Estimated Power (W) logged at 5.0s intervals.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono font-semibold">
            <span className="flex items-center gap-1 text-[#00D27B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00D27B] inline-block" /> Current (A)
            </span>
            <span className="flex items-center gap-1 text-[#3B82F6]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] inline-block" /> Voltage (V)
            </span>
            <span className="flex items-center gap-1 text-[#F59E0B]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" /> Power (W/10)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F1" vertical={false} />
              <XAxis dataKey="timestamp" stroke="#8A9A90" fontSize={11} tickLine={false} />
              <YAxis stroke="#8A9A90" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0E1512',
                  borderColor: '#1C2822',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine
                y={status.current_threshold}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{ value: `Threshold (${status.current_threshold}A)`, fill: '#EF4444', fontSize: 10, position: 'top' }}
              />
              <Line
                type="monotone"
                dataKey="current"
                name="Current (A)"
                stroke="#00D27B"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#00D27B' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="voltage"
                name="Voltage (V)"
                stroke="#3B82F6"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={(d) => Math.round(d.power / 10)}
                name="Power (W/10)"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Secondary Row: Energy Accumulation & Telemetry Log Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Cumulative Energy Chart */}
        <div className="lg:col-span-1 bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-[#0F1713] mb-1">Energy Accumulation Trend</h3>
          <p className="text-[0.7rem] text-[#6E7E75] mb-4">Cumulative kWh consumed across session.</p>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F4F1" vertical={false} />
                <XAxis dataKey="timestamp" stroke="#8A9A90" fontSize={10} tickLine={false} />
                <YAxis stroke="#8A9A90" fontSize={10} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0E1512',
                    borderColor: '#1C2822',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="power"
                  name="Power (W)"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Sample Log Table */}
        <div className="lg:col-span-2 bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#0F1713]">Recent Data Log</h3>
            <span className="text-[0.68rem] text-[#6E7E75] font-mono font-semibold">
              Showing last {filteredData.length} records
            </span>
          </div>

          <div className="overflow-x-auto max-h-56">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F6F8F6] text-[#6E7E75] text-[0.68rem] uppercase font-mono font-bold sticky top-0">
                <tr>
                  <th className="py-2 px-3">Time</th>
                  <th className="py-2 px-3">Current (A)</th>
                  <th className="py-2 px-3">Voltage (V)</th>
                  <th className="py-2 px-3">Power (W)</th>
                  <th className="py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEA] font-mono">
                {filteredData.slice(-8).reverse().map((r, i) => (
                  <tr key={i} className="hover:bg-[#F9FAF9]">
                    <td className="py-2 px-3 text-[#0F1713]">{r.timestamp}</td>
                    <td className={`py-2 px-3 font-bold ${r.current > status.current_threshold ? 'text-red-500' : 'text-[#00D27B]'}`}>
                      {r.current.toFixed(2)} A
                    </td>
                    <td className="py-2 px-3 text-[#3B82F6]">{r.voltage.toFixed(1)} V</td>
                    <td className="py-2 px-3 text-[#F59E0B]">{r.power.toFixed(1)} W</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[0.65rem] font-bold ${
                        r.current > status.current_threshold
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {r.current > status.current_threshold ? 'OVERCURRENT' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
