import React from 'react';
import { Radio, ShieldAlert } from 'lucide-react';

interface HardwareMapCardProps {
  esp32Connected: boolean;
  serialPort: string;
  baudRate: number;
}

export const HardwareMapCard: React.FC<HardwareMapCardProps> = ({
  esp32Connected,
  serialPort,
  baudRate,
}) => {
  return (
    <div className="bg-[#0E1512] border border-[#1E2C23] rounded-2xl p-5 flex flex-col justify-between h-full shadow-sm text-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            ESP32 Hardware Interface
          </h2>
          <p className="text-[0.68rem] text-[#8FA397]">
            SSD1306 OLED & GPIO 25 Overcurrent Alert Bus
          </p>
        </div>

        <div className="bg-[#18261F] border border-[#253A2F] rounded-full px-2.5 py-1 text-[0.68rem] font-mono text-[#00D27B] font-semibold flex items-center gap-1.5">
          <Radio size={12} className={esp32Connected ? 'text-[#00D27B] animate-pulse' : 'text-[#6E7E75]'} />
          {serialPort} ▼
        </div>
      </div>

      {/* Central Interactive Circuit / Node Graphic */}
      <div className="my-2 bg-[#121D17] border border-[#1F2F25] rounded-xl p-3 relative flex items-center justify-center min-h-[110px]">
        {/* Abstract Schematic SVG */}
        <svg width="220" height="90" className="opacity-90">
          {/* Circuit Lines */}
          <path d="M 20 45 L 80 45 L 110 20 L 150 20 L 180 45 L 200 45" fill="none" stroke="#253D30" strokeWidth="2" />
          <path d="M 80 45 L 110 70 L 150 70 L 180 45" fill="none" stroke="#253D30" strokeWidth="2" />

          {/* Active Flow Line */}
          <path d="M 20 45 L 80 45 L 110 20 L 150 20" fill="none" stroke="#00D27B" strokeWidth="2.5" strokeDasharray="6 4" className="animate-pulse" />

          {/* Nodes */}
          <circle cx="80" cy="45" r="4" fill="#00D27B" />
          <circle cx="110" cy="20" r="5" fill="#00D27B" />
          <circle cx="150" cy="20" r="4" fill="#00D27B" />
          <circle cx="110" cy="70" r="4" fill="#253D30" />
          <circle cx="150" cy="70" r="4" fill="#253D30" />
          <circle cx="180" cy="45" r="5" fill="#00D27B" />
        </svg>

        {/* Hovering Status Badge */}
        <div className="absolute top-4 left-4 bg-[#0A1F14]/90 border border-[#00D27B]/40 rounded-lg px-2.5 py-1 text-[0.65rem] font-mono text-white shadow-lg backdrop-blur-xs flex items-center gap-2">
          <div>
            <span className="text-[0.6rem] text-[#6FA583] block">UART Bus Active</span>
            <span className="font-bold text-[#00D27B]">89% Bus Health ↗</span>
          </div>
        </div>

        <div className="absolute bottom-2 right-3 text-[0.65rem] font-mono text-[#8FA397]">
          {baudRate} Baud
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center text-[0.68rem] text-[#8FA397] pt-2 border-t border-[#1E2C23]">
        <span className="flex items-center gap-1">
          <ShieldAlert size={12} className="text-amber-400" /> GPIO 25 Output Alert Active
        </span>
        <span className="text-[#00D27B] font-mono font-bold">OLED (0x3C)</span>
      </div>
    </div>
  );
};
