import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardView } from './components/views/DashboardView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { DiagnosticsView } from './components/views/DiagnosticsView';
import { ReportsView } from './components/views/ReportsView';
import { SupportView } from './components/views/SupportView';
import type { BackendStatus } from './types/telemetry';

const INITIAL_STATUS: BackendStatus = {
  simulation_active: false,
  simulation_paused: false,
  scenario: 'Normal Operation',
  current_threshold: 5.0,
  threshold_normal_change: 0.5,
  threshold_heavy_change: 1.5,
  tol_current: 0.15,
  tol_voltage: 0.80,
  tol_power: 30.0,
  serial_port: 'COM6',
  baud_rate: 115200,
  esp32_connected: false,
  latest: null,
  history: [],
  events: [],
  total_events: 0,
  normal_changes_count: 0,
  heavy_changes_count: 0,
  overcurrent_count: 0,
  avg_current: 0,
  max_current: 0,
  four_leds: {
    current_increase: 0,
    voltage_increase: 0,
    power_increase: 0,
    shared_red_warning: 0,
  },
  energy: {
    cumulative_kwh: 0,
    session_cost: 0,
    avg_power_watts: 0,
    peak_power_watts: 0,
    hourly_projected_cost: 0,
    daily_projected_cost: 0,
    runtime_str: '0s',
    carbon_footprint_kg: 0,
  },
  update_interval: 5.0,
  next_update_in: 5.0,
  mode: 'SIMULATED',
};

const TAB_TO_HASH: Record<string, string> = {
  Dashboard: '#/dashboard',
  Analytics: '#/analytics',
  Diagnostics: '#/diagnostics',
  Reports: '#/reports',
  Support: '#/support',
  Settings: '#/diagnostics',
};

const HASH_TO_TAB: Record<string, string> = {
  '#/dashboard': 'Dashboard',
  '#/analytics': 'Analytics',
  '#/diagnostics': 'Diagnostics',
  '#/reports': 'Reports',
  '#/support': 'Support',
  '#/settings': 'Diagnostics',
};

export function App() {
  const [status, setStatus] = useState<BackendStatus>(INITIAL_STATUS);
  
  // Read initial tab from URL hash, fallback to Dashboard
  const getInitialTab = () => {
    const hash = window.location.hash.toLowerCase();
    return HASH_TO_TAB[hash] || 'Dashboard';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab);
  const wsRef = useRef<WebSocket | null>(null);

  // Sync activeTab with browser history & URL hash
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const targetHash = TAB_TO_HASH[tab] || '#/dashboard';
    if (window.location.hash !== targetHash) {
      window.history.pushState(null, '', targetHash);
    }
  };

  // Browser back/forward navigation support
  useEffect(() => {
    const handlePopState = () => {
      const hash = window.location.hash.toLowerCase();
      const tab = HASH_TO_TAB[hash] || 'Dashboard';
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // Ensure initial hash is set if empty
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#/dashboard');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  // WebSocket & Poll Connection Management
  useEffect(() => {
    let reconnectTimeout: any = null;
    let pollInterval: any = null;
    let isMounted = true;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok && isMounted) {
          const data: BackendStatus = await res.json();
          setStatus(data);
        }
      } catch {
        // Backend offline
      }
    };

    const connectWebSocket = () => {
      if (!isMounted) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.hostname}:8000/ws`;

      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          try {
            const data: BackendStatus = JSON.parse(event.data);
            if (isMounted) setStatus(data);
          } catch (err) {
            console.error('WebSocket parse error:', err);
          }
        };

        ws.onclose = () => {
          if (isMounted) {
            reconnectTimeout = setTimeout(connectWebSocket, 3000);
          }
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {
        if (isMounted) {
          reconnectTimeout = setTimeout(connectWebSocket, 3000);
        }
      }
    };

    fetchStatus();
    pollInterval = setInterval(fetchStatus, 2500);
    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pollInterval) clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Action Handlers
  const handleControl = async (action: 'start' | 'pause' | 'resume' | 'stop' | 'step' | 'reset') => {
    try {
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data: BackendStatus = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to execute control action:', err);
    }
  };

  const handleScenarioChange = async (scenario: string) => {
    try {
      await fetch('/api/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
    } catch (err) {
      console.error('Failed to change scenario:', err);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-8 flex items-center justify-center font-sans antialiased bg-[#0B1114]">
      {/* Floating App Window Container */}
      <div className="w-full max-w-[1400px] min-h-[750px] bg-[#0E1512] rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] border border-[#1C2822] flex flex-col md:flex-row overflow-hidden">
        {/* Left Dark Matte Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          esp32Connected={status.esp32_connected}
          serialPort={status.serial_port}
        />

        {/* Main Content Area (Crisp Porcelain Background) */}
        <main className="flex-1 bg-[#F6F8F6] p-5 sm:p-7 flex flex-col justify-start overflow-y-auto rounded-b-[28px] md:rounded-b-none md:rounded-r-[28px]">
          {/* Top Global Dashboard Header & Twin Controls */}
          <DashboardHeader
            status={status}
            activeTab={activeTab}
            onControl={handleControl}
            onScenarioChange={handleScenarioChange}
          />

          {/* Dedicated Active View Router */}
          <div className="mt-2 flex-1">
            {activeTab === 'Dashboard' && <DashboardView status={status} />}
            {activeTab === 'Analytics' && <AnalyticsView status={status} />}
            {(activeTab === 'Diagnostics' || activeTab === 'Settings') && (
              <DiagnosticsView status={status} />
            )}
            {activeTab === 'Reports' && <ReportsView status={status} />}
            {activeTab === 'Support' && <SupportView />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
