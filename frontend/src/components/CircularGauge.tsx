import React from 'react';

interface CircularGaugeProps {
  score: number; // 0 to 100
  utilization: number; // 0 to 100
  anomalyScore: number; // 0 to 100
  statusText?: string;
  explanation?: string;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  score = 100,
  utilization = 0,
  anomalyScore = 0,
  statusText,
  explanation,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));
  const clampedUtil = Math.max(0, Math.min(100, utilization));
  const clampedAnom = Math.max(0, Math.min(100, anomalyScore));

  // Circular gauge geometry
  const radius = 62;
  const strokeWidth = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Determine main gauge color
  let gaugeColor = '#10B981'; // Green
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let defaultStatus = 'EXCELLENT';

  if (clampedScore < 50) {
    gaugeColor = '#EF4444'; // Red
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    defaultStatus = 'CRITICAL / DEGRADED';
  } else if (clampedScore < 75) {
    gaugeColor = '#F59E0B'; // Amber
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    defaultStatus = 'FAIR / WARNING';
  }

  const finalStatus = statusText || defaultStatus;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Main Central Circular Gauge */}
      <div className="relative flex items-center justify-center">
        <svg width="150" height="150" className="transform -rotate-90">
          {/* Background track */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="transparent"
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
          />
          {/* Progress stroke */}
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="transparent"
            stroke={gaugeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
            {clampedScore.toFixed(0)}
          </span>
          <span className="text-[0.68rem] font-bold text-slate-400 uppercase tracking-wider">
            Health Score
          </span>
        </div>
      </div>

      {/* Status Badge & Short Note */}
      <div className="mt-2 text-center">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold tracking-wide uppercase border ${badgeColor}`}
        >
          {finalStatus}
        </span>
        <p className="text-[0.72rem] text-slate-500 mt-1 max-w-[210px] leading-tight mx-auto">
          {explanation || 'Operating stability within optimal mechanical limits.'}
        </p>
      </div>

      {/* Two Mini Sub-Ring Indicators */}
      <div className="flex items-center justify-center gap-6 mt-3 pt-2.5 border-t border-slate-100 w-full">
        {/* Utilization Ring */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg width="32" height="32" className="transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth="3.5"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="transparent"
                stroke="#376DEB"
                strokeWidth="3.5"
                strokeDasharray={2 * Math.PI * 12}
                strokeDashoffset={
                  2 * Math.PI * 12 - (clampedUtil / 100) * (2 * Math.PI * 12)
                }
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-[0.62rem] font-bold text-slate-700 font-mono">
              {clampedUtil.toFixed(0)}%
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[0.65rem] font-bold text-slate-700 uppercase">
              Load Util
            </span>
            <span className="text-[0.62rem] text-slate-400">of 5.0A</span>
          </div>
        </div>

        {/* Anomaly Ring */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 flex items-center justify-center">
            <svg width="32" height="32" className="transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth="3.5"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="transparent"
                stroke="#F59E0B"
                strokeWidth="3.5"
                strokeDasharray={2 * Math.PI * 12}
                strokeDashoffset={
                  2 * Math.PI * 12 - (clampedAnom / 100) * (2 * Math.PI * 12)
                }
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <span className="absolute text-[0.62rem] font-bold text-slate-700 font-mono">
              {clampedAnom.toFixed(0)}%
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[0.65rem] font-bold text-slate-700 uppercase">
              Anomaly
            </span>
            <span className="text-[0.62rem] text-slate-400">Drift Index</span>
          </div>
        </div>
      </div>
    </div>
  );
};
