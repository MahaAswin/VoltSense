import React, { useState, useEffect, useMemo } from 'react';
import {
  Download,
  Calendar,
  AlertTriangle,
  Zap,
  Activity,
  Gauge,
  Loader2,
  RefreshCw,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BackendStatus } from '../../types/telemetry';

interface ReportData {
  project_name: string;
  generated_at: string;
  period_start: string;
  period_end: string;
  total_samples: number;
  total_events: number;
  overcurrent_count: number;
  normal_changes_count: number;
  heavy_changes_count: number;
  metrics: {
    current: { avg: number; peak: number; min: number; threshold: number };
    voltage: { avg: number; peak: number; min: number };
    power: { avg: number; peak: number; min: number };
    energy: { total_kwh: number; total_cost: number; carbon_kg: number };
  };
  readings_sample: any[];
  events: any[];
  mode: string;
}

interface ReportsViewProps {
  status?: BackendStatus;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ status }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Initialize dates with today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    fetchReportData(today, today);
  }, []);

  const fetchReportData = async (start?: string, end?: string) => {
    setLoading(true);
    try {
      let url = '/api/report';
      const params = new URLSearchParams();
      if (start) params.append('start_date', start);
      if (end) params.append('end_date', end);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data: ReportData = await res.json();
        setReportData(data);
      }
    } catch (err) {
      console.error('Failed to fetch report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePreview = () => {
    fetchReportData(startDate, endDate);
  };

  const handleSetToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    fetchReportData(today, today);
  };

  // Derive active display data (backend report data with live session fallback)
  const activeReport = useMemo(() => {
    if (reportData && reportData.total_samples > 0) {
      return reportData;
    }

    // Live session fallback if status history is present
    if (status && status.history && status.history.length > 0) {
      const hist = status.history;
      const currents = hist.map((h) => h.current);
      const voltages = hist.map((h) => h.voltage);
      const powers = hist.map((h) => h.power);
      const avgCurrent = currents.reduce((a, b) => a + b, 0) / currents.length;
      const avgVoltage = voltages.reduce((a, b) => a + b, 0) / voltages.length;
      const avgPower = powers.reduce((a, b) => a + b, 0) / powers.length;

      return {
        project_name: 'VoltSense',
        generated_at: new Date().toLocaleTimeString(),
        period_start: hist[0]?.timestamp_iso || new Date().toISOString(),
        period_end: hist[hist.length - 1]?.timestamp_iso || new Date().toISOString(),
        total_samples: hist.length,
        total_events: status.total_events || status.events?.length || 0,
        overcurrent_count: status.overcurrent_count || 0,
        normal_changes_count: status.normal_changes_count || 0,
        heavy_changes_count: status.heavy_changes_count || 0,
        metrics: {
          current: {
            avg: Number(avgCurrent.toFixed(2)),
            peak: Number(Math.max(...currents).toFixed(2)),
            min: Number(Math.min(...currents).toFixed(2)),
            threshold: status.current_threshold || 5.0,
          },
          voltage: {
            avg: Number(avgVoltage.toFixed(1)),
            peak: Number(Math.max(...voltages).toFixed(1)),
            min: Number(Math.min(...voltages).toFixed(1)),
          },
          power: {
            avg: Number(avgPower.toFixed(1)),
            peak: Number(Math.max(...powers).toFixed(1)),
            min: Number(Math.min(...powers).toFixed(1)),
          },
          energy: {
            total_kwh: status.energy?.cumulative_kwh || 0,
            total_cost: status.energy?.session_cost || 0,
            carbon_kg: status.energy?.carbon_footprint_kg || 0,
          },
        },
        readings_sample: hist,
        events: status.events || [],
        mode: status.mode || 'SIMULATED',
      } as ReportData;
    }

    return reportData;
  }, [reportData, status]);

  // Generate and Download PDF using jsPDF and autotable
  const handleDownloadPDF = () => {
    const dataToExport = activeReport;
    if (!dataToExport) return;
    setDownloading(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const todayStr = new Date().toISOString().split('T')[0];
      const filename = `VoltSense_Compliance_Report_${todayStr}.pdf`;

      // Header Banner
      doc.setFillColor(14, 21, 18); // Dark Matte #0E1512
      doc.rect(0, 0, 210, 34, 'F');

      // Title & Logo Text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('VoltSense', 14, 15);

      doc.setTextColor(0, 210, 123); // Mint Green
      doc.setFontSize(10);
      doc.text('IoT Single-Machine Electrical Monitoring & Compliance Report', 14, 23);

      doc.setTextColor(170, 185, 175);
      doc.setFontSize(8);
      doc.text(
        `Generated: ${dataToExport.generated_at} | Mode: ${dataToExport.mode} | Target: Machine 01 (Spindle Drive)`,
        14,
        29
      );

      // Metadata Box
      doc.setFillColor(246, 248, 246);
      doc.roundedRect(14, 40, 182, 22, 2, 2, 'F');

      doc.setTextColor(15, 23, 19);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Target Machine:', 20, 47);
      doc.setFont('helvetica', 'normal');
      doc.text('Machine 01 (Spindle Drive)', 50, 47);

      doc.setFont('helvetica', 'bold');
      doc.text('Report Window:', 110, 47);
      doc.setFont('helvetica', 'normal');
      doc.text(`${startDate || 'Live'} to ${endDate || 'Live'}`, 140, 47);

      doc.setFont('helvetica', 'bold');
      doc.text('Total Records Logged:', 20, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(`${dataToExport.total_samples} samples (5.0s synchronous cycle)`, 60, 56);

      doc.setFont('helvetica', 'bold');
      doc.text('Overcurrent Threshold:', 110, 56);
      doc.setFont('helvetica', 'normal');
      doc.text(`${dataToExport.metrics.current.threshold.toFixed(1)} Amperes`, 150, 56);

      // Section 1: Executive KPI Metrics Table
      doc.setTextColor(15, 23, 19);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Executive Electrical Performance Summary', 14, 70);

      const kpiRows = [
        [
          'Current (Amperes)',
          `${dataToExport.metrics.current.avg} A`,
          `${dataToExport.metrics.current.peak} A`,
          `${dataToExport.metrics.current.min} A`,
          `Limit: ${dataToExport.metrics.current.threshold} A`,
        ],
        [
          'Voltage (Volts)',
          `${dataToExport.metrics.voltage.avg} V`,
          `${dataToExport.metrics.voltage.peak} V`,
          `${dataToExport.metrics.voltage.min} V`,
          'Nominal: 230.0 V',
        ],
        [
          'Active Power (Watts)',
          `${dataToExport.metrics.power.avg} W`,
          `${dataToExport.metrics.power.peak} W`,
          `${dataToExport.metrics.power.min} W`,
          'PF: 0.95',
        ],
        [
          'Cumulative Energy',
          `${dataToExport.metrics.energy.total_kwh.toFixed(4)} kWh`,
          `Est. Cost: $${dataToExport.metrics.energy.total_cost.toFixed(2)}`,
          `Carbon: ${dataToExport.metrics.energy.carbon_kg.toFixed(3)} kg`,
          'Active Session',
        ],
      ];

      autoTable(doc, {
        startY: 74,
        head: [['Parameter', 'Average', 'Peak Maximum', 'Minimum', 'Reference Baseline']],
        body: kpiRows,
        theme: 'grid',
        headStyles: { fillColor: [14, 21, 18], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 19] },
        alternateRowStyles: { fillColor: [246, 248, 246] },
      });

      // Section 2: Anomaly & Overcurrent Event History
      let nextY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('2. Anomaly & Overcurrent Event Record', 14, nextY);

      const eventRows =
        dataToExport.events && dataToExport.events.length > 0
          ? dataToExport.events.slice(-10).map((e) => [
              e.id || e.event_id || `EV-${e.event_count || '1'}`,
              e.timestamp || e.timestamp_local || '--:--:--',
              e.event_type || 'CURRENT_CHANGE',
              `${(e.new_current || e.current_now || 0).toFixed(2)} A`,
              e.severity || 'NORMAL',
              e.explanation || 'Anomaly detected in waveform',
            ])
          : [
              [
                '--',
                '--',
                'None',
                '--',
                'Normal',
                'No overcurrent or abnormal events recorded in selected timeframe.',
              ],
            ];

      autoTable(doc, {
        startY: nextY + 4,
        head: [['Event ID', 'Timestamp', 'Event Type', 'Current', 'Severity', 'Diagnostic Explanation']],
        body: eventRows,
        theme: 'grid',
        headStyles: { fillColor: [30, 48, 38], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 19] },
        alternateRowStyles: { fillColor: [246, 248, 246] },
      });

      // Section 3: Telemetry Data Sample Log
      nextY = (doc as any).lastAutoTable.finalY + 10;
      if (nextY > 230) {
        doc.addPage();
        nextY = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('3. Synchronous Telemetry Sample Log (5-Second Cycle)', 14, nextY);

      const dataRows = (dataToExport.readings_sample || []).slice(-15).map((r) => [
        r.timestamp || '--:--:--',
        `${Number(r.current).toFixed(2)} A`,
        `${Number(r.voltage).toFixed(1)} V`,
        `${Number(r.power).toFixed(1)} W`,
        r.current > dataToExport.metrics.current.threshold ? 'OVERCURRENT' : 'NORMAL',
      ]);

      autoTable(doc, {
        startY: nextY + 4,
        head: [['Timestamp', 'Current (A)', 'Voltage (V)', 'Power (W)', 'Operating Status']],
        body: dataRows.length > 0 ? dataRows : [['--', '--', '--', '--', 'No data']],
        theme: 'striped',
        headStyles: { fillColor: [14, 21, 18], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [15, 23, 19] },
      });

      // Footer certification
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(110, 126, 117);
        doc.text(
          `VoltSense Intelligent Telemetry System • Page ${i} of ${pageCount} • Audit-Ready Export`,
          14,
          290
        );
      }

      doc.save(filename);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const metrics = activeReport?.metrics;

  return (
    <div className="space-y-4">
      {/* Control and Export Toolbar */}
      <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Left: Timeframe Selectors */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-[#6E7E75] uppercase font-mono text-[0.7rem] flex items-center gap-1.5">
            <Calendar size={14} className="text-[#00D27B]" /> Timeframe Filter:
          </span>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-[#6E7E75] font-medium">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#F6F8F6] border border-[#DCE4DF] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#0F1713] focus:outline-none focus:border-[#00D27B] transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs text-[#6E7E75] font-medium">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#F6F8F6] border border-[#DCE4DF] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#0F1713] focus:outline-none focus:border-[#00D27B] transition-colors"
            />
          </div>

          <button
            onClick={handleSetToday}
            className="px-2.5 py-1 rounded-lg bg-[#F0F5F2] hover:bg-[#E4ECE7] text-[#1E3026] text-xs font-semibold transition-all cursor-pointer"
            title="Reset to today's date"
          >
            Today
          </button>
        </div>

        {/* Right: Preview & PDF Download Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleGeneratePreview}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#DCE4DF] text-xs font-bold text-[#0F1713] hover:bg-[#F6F8F6] transition-all cursor-pointer shadow-sm"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin text-[#00D27B]" />
            ) : (
              <RefreshCw size={13} className="text-[#6E7E75]" />
            )}
            Refresh Preview
          </button>

          <button
            onClick={handleDownloadPDF}
            disabled={downloading || !activeReport}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#00D27B] text-[#0A1F14] text-xs font-bold hover:bg-[#00E599] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,210,123,0.3)] disabled:opacity-50"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Energy Summary Card */}
          <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm hover:border-[#00D27B]/40 transition-colors">
            <div className="flex items-center justify-between text-[#6E7E75] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Total Energy</span>
              <Gauge size={16} className="text-purple-600" />
            </div>
            <div className="text-2xl font-black text-[#0F1713] font-mono">
              {metrics.energy.total_kwh.toFixed(4)}{' '}
              <span className="text-xs font-bold text-[#6E7E75]">kWh</span>
            </div>
            <div className="text-[0.7rem] text-[#6E7E75] mt-1.5 flex items-center justify-between">
              <span>Est. Cost: <strong className="text-[#0F1713]">${metrics.energy.total_cost.toFixed(2)}</strong></span>
              <span>Carbon: <strong className="text-[#0F1713]">{metrics.energy.carbon_kg.toFixed(3)} kg</strong></span>
            </div>
          </div>

          {/* Current Summary Card */}
          <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm hover:border-[#00D27B]/40 transition-colors">
            <div className="flex items-center justify-between text-[#6E7E75] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Current Peak & Avg</span>
              <Zap size={16} className="text-[#00D27B]" />
            </div>
            <div className="text-2xl font-black text-[#0F1713] font-mono">
              {metrics.current.peak.toFixed(2)}{' '}
              <span className="text-xs font-bold text-[#6E7E75]">A Peak</span>
            </div>
            <div className="text-[0.7rem] text-[#6E7E75] mt-1.5 flex items-center justify-between">
              <span>Average: <strong className="text-[#0F1713]">{metrics.current.avg.toFixed(2)} A</strong></span>
              <span>Limit: <strong className="text-amber-600">{metrics.current.threshold.toFixed(1)} A</strong></span>
            </div>
          </div>

          {/* Voltage Summary Card */}
          <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm hover:border-[#00D27B]/40 transition-colors">
            <div className="flex items-center justify-between text-[#6E7E75] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Voltage Peak & Avg</span>
              <Activity size={16} className="text-blue-600" />
            </div>
            <div className="text-2xl font-black text-[#0F1713] font-mono">
              {metrics.voltage.peak.toFixed(1)}{' '}
              <span className="text-xs font-bold text-[#6E7E75]">V Peak</span>
            </div>
            <div className="text-[0.7rem] text-[#6E7E75] mt-1.5 flex items-center justify-between">
              <span>Average: <strong className="text-[#0F1713]">{metrics.voltage.avg.toFixed(1)} V</strong></span>
              <span>Min: <strong className="text-[#0F1713]">{metrics.voltage.min.toFixed(1)} V</strong></span>
            </div>
          </div>

          {/* Overcurrent Incidents Card */}
          <div className="bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm hover:border-[#00D27B]/40 transition-colors">
            <div className="flex items-center justify-between text-[#6E7E75] mb-2">
              <span className="text-xs font-bold uppercase tracking-wider font-mono">Overcurrent Incidents</span>
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-600 font-mono">
              {activeReport?.overcurrent_count ?? 0}{' '}
              <span className="text-xs font-bold text-[#6E7E75]">Events</span>
            </div>
            <div className="text-[0.7rem] text-[#6E7E75] mt-1.5 flex items-center justify-between">
              <span>Total Changes: <strong className="text-[#0F1713]">{activeReport?.total_events ?? 0}</strong></span>
              <span>Samples: <strong className="text-[#0F1713]">{activeReport?.total_samples ?? 0}</strong></span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Report Preview Tables */}
      {activeReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Overcurrent Incidents Log Table */}
          <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#0F1713]">Incident History Preview</h3>
                <p className="text-[0.7rem] text-[#6E7E75]">
                  Abnormal overcurrent breaches and shifts in report window.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-mono text-[0.65rem] font-bold">
                {activeReport.overcurrent_count} Breaches
              </span>
            </div>

            <div className="overflow-x-auto max-h-64 mt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F8F6] text-[#6E7E75] text-[0.68rem] uppercase font-mono font-bold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Event ID</th>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Current</th>
                    <th className="py-2 px-3">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFEA] font-mono">
                  {activeReport.events.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#6E7E75]">
                        <FileCheck size={20} className="mx-auto text-emerald-500 mb-1" />
                        No abnormal events recorded in selected timeframe.
                      </td>
                    </tr>
                  ) : (
                    activeReport.events.slice(-6).reverse().map((e, idx) => (
                      <tr key={idx} className="hover:bg-[#F9FAF9]">
                        <td className="py-2 px-3 font-bold text-[#0F1713]">{e.id || e.event_id || `EV-${idx + 1}`}</td>
                        <td className="py-2 px-3 text-[#6E7E75]">{e.timestamp || e.timestamp_local || '--:--:--'}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-bold ${
                            e.event_type === 'OVERCURRENT' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {e.event_type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold text-[#0F1713]">
                          {(e.new_current || e.current_now || 0).toFixed(2)} A
                        </td>
                        <td className="py-2 px-3 font-bold text-red-600">{e.severity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Telemetry Sample Preview Table */}
          <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-bold text-[#0F1713]">Telemetry Log Preview</h3>
                <p className="text-[0.7rem] text-[#6E7E75]">
                  Sample 5-second monitoring records included in PDF export.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[0.65rem] font-bold">
                {activeReport.total_samples} Logged
              </span>
            </div>

            <div className="overflow-x-auto max-h-64 mt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F8F6] text-[#6E7E75] text-[0.68rem] uppercase font-mono font-bold sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Time</th>
                    <th className="py-2 px-3">Current</th>
                    <th className="py-2 px-3">Voltage</th>
                    <th className="py-2 px-3">Power</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEFEA] font-mono">
                  {activeReport.readings_sample.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[#6E7E75]">
                        <Sparkles size={18} className="mx-auto text-amber-500 mb-1" />
                        No telemetry samples available. Start the stream to generate records.
                      </td>
                    </tr>
                  ) : (
                    activeReport.readings_sample.slice(-6).reverse().map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#F9FAF9]">
                        <td className="py-2 px-3 text-[#0F1713]">{r.timestamp}</td>
                        <td className="py-2 px-3 font-bold text-[#00D27B]">{Number(r.current).toFixed(2)} A</td>
                        <td className="py-2 px-3 text-[#3B82F6]">{Number(r.voltage).toFixed(1)} V</td>
                        <td className="py-2 px-3 text-[#F59E0B]">{Number(r.power).toFixed(1)} W</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[0.65rem] font-bold ${
                            Number(r.current) > (activeReport.metrics?.current?.threshold || 5.0)
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {Number(r.current) > (activeReport.metrics?.current?.threshold || 5.0)
                              ? 'OVERCURRENT'
                              : 'NORMAL'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
