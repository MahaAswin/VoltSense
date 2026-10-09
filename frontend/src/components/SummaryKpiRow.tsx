import React from 'react';
import { Zap, AlertTriangle, Flame, TrendingUp, Gauge } from 'lucide-react';
import type { BackendStatus } from '../types/telemetry';

interface SummaryKpiRowProps {
  status: BackendStatus;
}

export const SummaryKpiRow: React.FC<SummaryKpiRowProps> = ({ status }) => {
  const history = status.history || [];
  const events = status.events || [];

  // Calculate metrics from actual session data
  const totalEvents = status.change_metrics?.total_events ?? events.length;
  const heavyEvents = status.change_metrics?.heavy_change_count ?? events.filter(e => e.event_type === 'HEAVY_CHANGE').length;
  const overcurrentEvents = status.change_metrics?.overcurrent_count ?? events.filter(e => e.event_type === 'OVERCURRENT').length;

  const currentValues = history.map(h => h.current);
  const maxCurrent = currentValues.length > 0 ? Math.max(...currentValues) : (status.latest?.current || 0);
  const avgCurrent = currentValues.length > 0
    ? (currentValues.reduce((a, b) => a + b, 0) / currentValues.length)
    : (status.latest?.current || 0);

  const kpis = [
    {
      label: 'TOTAL CHANGE EVENTS',
      value: totalEvents.toString().padStart(2, '0'),
      subtext: 'Normal & Heavy changes',
      icon: Zap,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20'
    },
    {
      label: 'HEAVY CHANGE EVENTS',
      value: heavyEvents.toString().padStart(2, '0'),
      subtext: 'ΔI ≥ 1.50 A changes',
      icon: AlertTriangle,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20'
    },
    {
      label: 'OVERCURRENT DETECTIONS',
      value: overcurrentEvents.toString().padStart(2, '0'),
      subtext: 'Current > 5.0 A threshold',
      icon: Flame,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      border: 'border-red-500/20'
    },
    {
      label: 'PEAK OBSERVED CURRENT',
      value: `${maxCurrent.toFixed(2)} A`,
      subtext: maxCurrent > status.current_threshold ? 'Threshold exceeded' : 'Within safe limits',
      icon: TrendingUp,
      color: maxCurrent > status.current_threshold ? 'text-red-400' : 'text-blue-400',
      bg: maxCurrent > status.current_threshold ? 'bg-red-500/10' : 'bg-blue-500/10',
      border: maxCurrent > status.current_threshold ? 'border-red-500/20' : 'border-blue-500/20'
    },
    {
      label: 'SESSION AVERAGE CURRENT',
      value: `${avgCurrent.toFixed(2)} A`,
      subtext: `${history.length} samples evaluated`,
      icon: Gauge,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-[#172438] border border-[#23354E] rounded-xl p-3.5 flex flex-col justify-between shadow-sm hover:border-[#2E4565] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {kpi.label}
              </span>
              <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className={`text-xl font-bold font-mono tracking-tight ${kpi.color}`}>
                {kpi.value}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                {kpi.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
