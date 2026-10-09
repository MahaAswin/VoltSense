import React, { useState } from 'react';
import {
  Cpu,
  ChevronDown,
  ChevronUp,
  FileCode,
  BookOpen,
} from 'lucide-react';

export const SupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Why does my OLED show "Waiting for data..." on startup?',
      a: 'The ESP32 OLED displays "Waiting for data..." while awaiting the first valid serial packet from the Python backend. Once you start the backend server ("python server.py"), the backend connects to COM6 at 115200 baud and streams 5-second telemetry readings, updating the OLED immediately.',
    },
    {
      q: 'How do I resolve "Access Denied" or "Port Busy" on COM6?',
      a: 'Serial COM ports on Windows can only be owned by one process at a time. Ensure that the Arduino Serial Monitor, PuTTY, or other terminal apps are closed before starting server.py.',
    },
    {
      q: 'What is the exact wiring for the SSD1306 OLED and Overcurrent LED?',
      a: 'SSD1306 I2C OLED (0x3C): VCC -> 3.3V, GND -> GND, SDA -> GPIO 21, SCL -> GPIO 22. Overcurrent Red LED: Anode -> GPIO 25 (with 220Ω series resistor), Cathode -> GND.',
    },
    {
      q: 'How does the Overcurrent and Change Detection threshold work?',
      a: 'The overcurrent threshold is configured at 5.0 A. Any reading exceeding 5.0 A activates the physical Red LED and logs a high-priority critical incident. Normal current changes of ≥ 0.5 A and heavy changes of ≥ 1.5 A are recorded as discrete machine events.',
    },
    {
      q: 'Can I export custom PDF compliance reports for any date range?',
      a: 'Yes! Navigate to the Reports tab, select your start and end dates, click "Generate Preview", and download a certified audit PDF containing executive KPI summaries, incident logs, and synchronous 5-second telemetry tables.',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Support Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-[#E3E8E4] p-4 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0F1713] tracking-tight">
              Hardware Documentation & Support Center
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono text-[0.65rem] font-bold">
              ● v4.0 KNOWLEDGE BASE
            </span>
          </div>
          <p className="text-xs text-[#6E7E75] mt-0.5">
            Complete pinout references, flashing instructions, serial troubleshooting, and FAQs.
          </p>
        </div>
      </div>

      {/* Hardware Wiring Map & Flashing Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Hardware Pinout Reference */}
        <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F1713] mb-3">
            <Cpu size={18} className="text-[#00D27B]" />
            <h3>ESP32 Hardware Wiring Map</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F6F8F6] text-[#6E7E75] text-[0.68rem] uppercase font-bold">
                <tr>
                  <th className="py-2 px-3">Peripheral</th>
                  <th className="py-2 px-3">ESP32 Pin</th>
                  <th className="py-2 px-3">Interface / Logic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAEFEA]">
                <tr>
                  <td className="py-2 px-3 font-semibold text-[#0F1713]">SSD1306 OLED SDA</td>
                  <td className="py-2 px-3 text-[#00D27B] font-bold">GPIO 21</td>
                  <td className="py-2 px-3 text-[#6E7E75]">I2C Data (0x3C)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-[#0F1713]">SSD1306 OLED SCL</td>
                  <td className="py-2 px-3 text-[#00D27B] font-bold">GPIO 22</td>
                  <td className="py-2 px-3 text-[#6E7E75]">I2C Clock (0x3C)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-[#0F1713]">Red Overcurrent LED</td>
                  <td className="py-2 px-3 text-red-500 font-bold">GPIO 25</td>
                  <td className="py-2 px-3 text-[#6E7E75]">220Ω Resistor (ON &gt; 5.0A)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-[#0F1713]">Normal Change LED</td>
                  <td className="py-2 px-3 text-amber-500 font-bold">GPIO 26</td>
                  <td className="py-2 px-3 text-[#6E7E75]">220Ω Resistor (0.5A - 1.5A)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-[#0F1713]">Serial UART Stream</td>
                  <td className="py-2 px-3 text-blue-500 font-bold">USB / UART0</td>
                  <td className="py-2 px-3 text-[#6E7E75]">115200 Baud, '\n' CSV</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Flashing Guide */}
        <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#0F1713] mb-3">
            <FileCode size={18} className="text-blue-500" />
            <h3>Arduino IDE Flashing Instructions</h3>
          </div>

          <ol className="list-decimal list-inside space-y-2 text-xs text-[#6E7E75]">
            <li>
              Open <span className="font-mono font-bold text-[#0F1713]">firmware/wattwise_edge/wattwise_edge.ino</span> in Arduino IDE.
            </li>
            <li>
              Install required libraries: <span className="font-mono text-[#00D27B]">Adafruit SSD1306</span> & <span className="font-mono text-[#00D27B]">Adafruit GFX</span>.
            </li>
            <li>
              Select Board: <span className="font-mono font-bold text-[#0F1713]">ESP32 Dev Module</span>.
            </li>
            <li>
              Select Port: <span className="font-mono font-bold text-[#0F1713]">COM6</span> (or detected active COM port).
            </li>
            <li>
              Click <span className="font-bold text-[#00D27B]">Upload</span>. Observe the OLED initialize with "VoltSense".
            </li>
          </ol>

          <div className="mt-4 p-3 bg-[#F6F8F6] border border-[#DCE4DF] rounded-xl flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-[#0F1713]">Canonical Firmware: </span>
              <span className="font-mono text-[#6E7E75]">wattwise_edge.ino</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[0.65rem] font-bold">
              VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="bg-white border border-[#E3E8E4] p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-sm font-bold text-[#0F1713] mb-4">
          <BookOpen size={18} className="text-purple-600" />
          <h3>Frequently Asked Questions & Troubleshooting</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-[#E3E8E4] rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-[#0F1713] bg-[#FDFDFD] hover:bg-[#F6F8F6] transition-all cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} className="text-[#6E7E75]" /> : <ChevronDown size={16} className="text-[#6E7E75]" />}
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-[#6E7E75] bg-[#FDFDFD] leading-relaxed border-t border-[#EAEFEA]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
