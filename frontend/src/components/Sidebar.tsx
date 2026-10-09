import React from 'react';
import {
  LayoutDashboard,
  BarChart2,
  Cpu,
  FileText,
  HelpCircle,
  Settings,
  Search,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  esp32Connected: boolean;
  serialPort: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  esp32Connected,
  serialPort,
}) => {
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'Diagnostics', label: 'Diagnostics', icon: Cpu },
    { id: 'Reports', label: 'Reports', icon: FileText, badge: '1' },
    { id: 'Support', label: 'Support', icon: HelpCircle, badge: 'New', badgeGreen: true },
  ];

  return (
    <aside className="w-64 bg-[#0E1512] text-[#9EA8A2] p-4 flex flex-col justify-between shrink-0 border-r border-[#1B2721] rounded-l-[24px]">
      {/* Top Brand */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-4">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-5 bg-[#00D27B] rounded-full inline-block" />
            <span className="w-1.5 h-6 bg-[#00D27B] rounded-full inline-block" />
            <span className="w-1.5 h-4 bg-[#00D27B] rounded-full inline-block" />
          </div>
          <span className="text-white text-base font-bold tracking-tight">
            Volt<span className="text-[#00D27B]">Sense</span>
          </span>
        </div>

        {/* Workspace Dropdown */}
        <div className="bg-[#141F1A] border border-[#213028] rounded-xl p-2.5 flex items-center justify-between mb-3 text-xs text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00D27B]/20 flex items-center justify-center text-[#00D27B]">
              ⚡
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[0.62rem] text-[#6E7E75] font-semibold uppercase">Workspace</span>
              <span className="font-semibold text-xs text-white">Machine 01 (Spindle)</span>
            </div>
          </div>
          <ChevronDown size={14} className="text-[#6E7E75]" />
        </div>

        {/* Search Bar */}
        <div className="relative mb-5">
          <Search size={14} className="absolute left-3 top-2.5 text-[#54655B]" />
          <input
            type="text"
            placeholder="Search telemetry..."
            className="w-full bg-[#121A15] border border-[#1E2922] rounded-lg pl-8 pr-12 py-1.5 text-xs text-white placeholder-[#54655B] focus:outline-none focus:border-[#00D27B]"
          />
          <span className="absolute right-2.5 top-2 text-[0.65rem] font-mono text-[#54655B] bg-[#1A261F] px-1.5 py-0.5 rounded border border-[#233128]">
            ⌘+F
          </span>
        </div>

        {/* Navigation Section */}
        <div className="mb-2">
          <span className="text-[0.65rem] font-bold text-[#54655B] uppercase tracking-wider px-2 block mb-2 font-mono">
            NAVIGATION
          </span>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#18261F] text-white border border-[#253A2F]'
                      : 'text-[#8A9A90] hover:text-white hover:bg-[#131D18]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} className={isActive ? 'text-[#00D27B]' : 'text-[#6E7E75]'} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[0.62rem] px-1.5 py-0.2 rounded-full font-bold ${
                        item.badgeGreen
                          ? 'bg-[#00D27B]/20 text-[#00D27B] border border-[#00D27B]/30'
                          : 'bg-[#1E2B23] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section: Settings & User Profile */}
      <div className="pt-4 border-t border-[#1A2620]">
        <button
          onClick={() => onTabChange('Settings')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#8A9A90] hover:text-white hover:bg-[#131D18] transition-all mb-3 cursor-pointer"
        >
          <Settings size={16} className="text-[#6E7E75]" />
          <span>Settings</span>
        </button>

        <span className="text-[0.62rem] font-bold text-[#54655B] uppercase tracking-wider px-2 block mb-2 font-mono">
          HARDWARE LINK
        </span>

        {/* User / Hardware Pill */}
        <div className="bg-[#121A15] border border-[#1E2922] rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#1A2920] border border-[#293E31] flex items-center justify-center font-mono font-bold text-xs text-[#00D27B]">
                ESP
              </div>
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0E1512] ${
                  esp32Connected ? 'bg-[#00D27B]' : 'bg-amber-500'
                }`}
              />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white">ESP32 UART</span>
              <span className="text-[0.65rem] font-mono text-[#6E7E75]">{serialPort} @ 115200</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
