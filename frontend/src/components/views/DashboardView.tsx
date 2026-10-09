import React from 'react';
import { TopKpiRow } from '../TopKpiRow';
import { MainChartPanel } from '../MainChartPanel';
import { EnergyEfficiencyCard } from '../EnergyEfficiencyCard';
import { DiagnosticsTableCard } from '../DiagnosticsTableCard';
import { HardwareMapCard } from '../HardwareMapCard';
import type { BackendStatus } from '../../types/telemetry';

interface DashboardViewProps {
  status: BackendStatus;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ status }) => {
  return (
    <div className="space-y-4">
      {/* Top 3 KPI Cards (Current, Voltage, Power) */}
      <TopKpiRow
        latest={status.latest}
        threshold={status.current_threshold}
      />

      {/* Middle Row: Main Current Waveform & Energy Efficiency Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MainChartPanel
            history={status.history}
            threshold={status.current_threshold}
          />
        </div>
        <div className="lg:col-span-1">
          <EnergyEfficiencyCard
            energy={status.energy!}
            latest={status.latest}
          />
        </div>
      </div>

      {/* Bottom Row: Diagnostics Table & ESP32 Hardware Map Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DiagnosticsTableCard
            latest={status.latest}
            threshold={status.current_threshold}
          />
        </div>
        <div className="lg:col-span-1">
          <HardwareMapCard
            esp32Connected={status.esp32_connected}
            serialPort={status.serial_port}
            baudRate={status.baud_rate}
          />
        </div>
      </div>
    </div>
  );
};
