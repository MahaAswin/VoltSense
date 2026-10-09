import React from 'react';
import type { TelemetrySample } from '../types/telemetry';
import { MoreVertical } from 'lucide-react';

interface DiagnosticsTableCardProps {
  latest: TelemetrySample | null;
  threshold: number;
}

export const DiagnosticsTableCard: React.FC<DiagnosticsTableCardProps> = ({
  latest,
  threshold,
}) => {
  const current = latest ? latest.current : 2.85;

  const rows = [
    {
      unit: 'Spindle Motor A1',
      sub: 'Primary Drive',
      nominal: '2.50 A',
      util: `${Math.min(100, (current / threshold) * 100).toFixed(0)}%`,
      trendColor: '#00D27B',
      trendPath: 'M 0 12 Q 15 4, 30 14 T 60 8',
      tech: 'Induction / VFD',
      val: `${current.toFixed(2)} A`,
    },
    {
      unit: 'Coolant Pump P2',
      sub: 'Secondary Auxiliary',
      nominal: '1.20 A',
      util: '45%',
      trendColor: '#00D27B',
      trendPath: 'M 0 10 Q 15 14, 30 8 T 60 6',
      tech: 'Centrifugal',
      val: '1.15 A',
    },
    {
      unit: 'Feeder Servo S3',
      sub: 'Precision Axis',
      nominal: '0.85 A',
      util: '32%',
      trendColor: '#3B82F6',
      trendPath: 'M 0 14 Q 15 8, 30 12 T 60 10',
      tech: 'Brushless AC',
      val: '0.82 A',
    },
    {
      unit: 'Exhaust Fan F4',
      sub: 'Thermal Exhaust',
      nominal: '0.60 A',
      util: '25%',
      trendColor: '#F59E0B',
      trendPath: 'M 0 8 Q 15 12, 30 6 T 60 14',
      tech: 'Permanent Magnet',
      val: '0.58 A',
    },
  ];

  return (
    <div className="bg-white border border-[#E5EAE6] rounded-2xl p-5 shadow-sm flex flex-col justify-between h-full">
      {/* Header with Title & Filter */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-[#0F1713] tracking-tight">
            Machine Operational Units & Telemetry
          </h2>
          <p className="text-[0.68rem] text-[#6E7E75]">
            Telemetry utilization breakdown and dynamic waveform sparklines.
          </p>
        </div>

        <div className="bg-[#F4F6F4] border border-[#E2E7E3] rounded-full px-2.5 py-1 text-[0.68rem] font-semibold text-[#54655B] cursor-pointer">
          All Units ▼
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto my-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-[0.65rem] font-bold text-[#8A9A90] uppercase tracking-wider border-b border-[#F0F4F1]">
              <th className="pb-2 font-mono">Unit / Subsystem</th>
              <th className="pb-2 font-mono text-center">Nominal</th>
              <th className="pb-2 font-mono text-center">Utilization</th>
              <th className="pb-2 font-mono text-center">Dynamic Trend</th>
              <th className="pb-2 font-mono">Technology</th>
              <th className="pb-2 font-mono text-right">Current</th>
              <th className="pb-2 font-mono text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0F4F1]">
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-[#F9FAF9] transition-colors">
                {/* Unit Name */}
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00D27B]" />
                    <div>
                      <span className="font-bold text-[#0F1713] block text-xs">{r.unit}</span>
                      <span className="text-[0.65rem] text-[#8A9A90] block">{r.sub}</span>
                    </div>
                  </div>
                </td>

                {/* Nominal */}
                <td className="py-2.5 text-center font-mono text-[#54655B] text-xs">
                  {r.nominal}
                </td>

                {/* Utilization */}
                <td className="py-2.5 text-center font-mono font-bold text-[#0F1713] text-xs">
                  {r.util}
                </td>

                {/* Dynamic Sparkline */}
                <td className="py-2.5 text-center">
                  <svg width="60" height="20" className="mx-auto overflow-visible">
                    <path
                      d={r.trendPath}
                      fill="none"
                      stroke={r.trendColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </td>

                {/* Technology */}
                <td className="py-2.5">
                  <span className="bg-[#FFF4E5] text-[#D97706] text-[0.65rem] font-bold px-2 py-0.5 rounded-full">
                    {r.tech}
                  </span>
                </td>

                {/* Value */}
                <td className="py-2.5 text-right font-mono font-bold text-[#0F1713] text-xs">
                  {r.val}
                </td>

                {/* 3-dots */}
                <td className="py-2.5 text-right text-[#8A9A90] hover:text-[#0F1713] cursor-pointer">
                  <MoreVertical size={14} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
