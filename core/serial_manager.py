"""
WattWise Edge - ESP32 Serial UART Communication Manager
========================================================
Manages single-owner UART communication with the ESP32 microcontroller:
- Protocol V2: 'V2,seq,timestamp,current,voltage,power,led_i,led_v,led_p,led_shared,overcurrent,event_count,status\n'
- Robust auto-port scanning, auto-reconnect, and error diagnostic reporting.
"""

import time
from typing import List, Optional, Tuple

try:
    import serial
    import serial.tools.list_ports
    HAS_SERIAL = True
except ImportError:
    HAS_SERIAL = False


class SerialManager:
    """Safely manages hardware serial communication with the ESP32."""

    def __init__(self, port: str = "COM6", baud_rate: int = 115200):
        self.port = port
        self.baud_rate = baud_rate
        self.connection: Optional[serial.Serial] = None
        self.last_error: Optional[str] = None
        self.sequence_num: int = 0
        self.last_connect_attempt: float = 0.0
        self.total_packets_sent: int = 0
        self.total_bytes_sent: int = 0

    @staticmethod
    def get_available_ports() -> List[str]:
        """Discovers and returns list of accessible serial COM ports."""
        if not HAS_SERIAL:
            return ["COM6", "COM4", "COM3"]
        try:
            detected = [p.device for p in serial.tools.list_ports.comports()]
            if detected:
                return detected
        except Exception:
            pass
        return ["COM6", "COM4", "COM3", "COM1", "COM2", "COM5", "COM7", "COM8"]

    @staticmethod
    def get_detailed_ports() -> List[dict]:
        """Returns detected ports with hardware description and VID/PID."""
        if not HAS_SERIAL:
            return []
        try:
            return [
                {
                    "port": p.device,
                    "description": p.description,
                    "hwid": p.hwid,
                }
                for p in serial.tools.list_ports.comports()
            ]
        except Exception:
            return []

    def is_connected(self) -> bool:
        """Returns True if the serial connection is currently open."""
        return bool(self.connection and self.connection.is_open)

    def connect(self, port: Optional[str] = None, baud_rate: Optional[int] = None) -> Tuple[bool, str]:
        """Attempts to open the serial port connection to the ESP32."""
        self.last_connect_attempt = time.time()
        if not HAS_SERIAL:
            self.last_error = "pyserial library is not available in environment."
            return False, self.last_error

        target_port = port if port else self.port
        target_baud = baud_rate if baud_rate else self.baud_rate

        # If already open on the same port and baud, return ok
        if self.is_connected() and self.port == target_port and self.baud_rate == target_baud:
            return True, f"Already connected to {self.port} at {self.baud_rate} baud."

        self.disconnect()
        self.port = target_port
        self.baud_rate = target_baud

        try:
            self.connection = serial.Serial(
                port=self.port,
                baudrate=self.baud_rate,
                timeout=1.0,
                write_timeout=1.0,
            )
            time.sleep(1.0)  # Allow ESP32 DTR/RTS to settle
            self.last_error = None
            return True, f"Connected to ESP32 on {self.port} at {self.baud_rate} baud."
        except serial.SerialException as e:
            self.connection = None
            self.last_error = f"Cannot open {self.port}: {e}"
            return False, self.last_error
        except Exception as e:
            self.connection = None
            self.last_error = f"Unexpected serial error on {self.port}: {e}"
            return False, self.last_error

    def auto_connect_available(self) -> Tuple[bool, str]:
        """
        Attempts to connect to preferred port, and if unavailable, scans other detected ports.
        """
        # 1. Try currently configured port first
        ok, msg = self.connect(self.port, self.baud_rate)
        if ok:
            return True, msg

        # 2. Try scanning other detected hardware ports
        available = self.get_available_ports()
        for p in available:
            if p != self.port:
                ok_cand, msg_cand = self.connect(p, self.baud_rate)
                if ok_cand:
                    return True, f"Auto-detected and connected to ESP32 on {p} (preferred {self.port} was unavailable)."

        return False, f"Could not connect to any available port (tested {self.port}, {available})."

    def disconnect(self):
        """Safely closes the active serial connection."""
        if self.connection:
            try:
                if self.connection.is_open:
                    self.connection.close()
            except Exception:
                pass
        self.connection = None
    def format_csv_payload(self, current: float, voltage: float, power: float) -> str:
        """
        Formats canonical 3-field newline-terminated CSV: 'current,voltage,power\\n'
        Example: '2.50,230.00,546.25\\n'
        """
        self.sequence_num += 1
        return f"{current:.2f},{voltage:.2f},{power:.2f}\n"

    @staticmethod
    def parse_csv_payload(payload_line: str) -> Optional[dict]:
        """
        Parses canonical CSV payload 'current,voltage,power'.
        """
        line = payload_line.strip()
        tokens = line.split(",")
        if len(tokens) < 2:
            return None
        try:
            curr = float(tokens[0])
            volt = float(tokens[1])
            pwr = float(tokens[2]) if len(tokens) >= 3 else round(volt * curr * 0.95, 2)
            return {
                "current": curr,
                "voltage": volt,
                "power": pwr,
                "is_overcurrent": curr > 5.0,
            }
        except (ValueError, IndexError):
            return None

    def transmit_readings(self, current: float, voltage: float, power: float) -> Tuple[bool, str]:
        """
        Transmits canonical 3-field CSV reading to ESP32: 'current,voltage,power\\n'
        """
        if not self.is_connected():
            return False, "Not connected to any serial COM port."

        try:
            line = self.format_csv_payload(current=current, voltage=voltage, power=power)
            raw_bytes = line.encode("utf-8")
            self.connection.write(raw_bytes)
            self.connection.flush()
            self.total_packets_sent += 1
            self.total_bytes_sent += len(raw_bytes)
            return True, line.strip()
        except Exception as e:
            self.last_error = f"Transmit exception on {self.port}: {e}"
            self.disconnect()
            return False, str(e)

    def format_v2_payload(
        self,
        current: float,
        voltage: float,
        power: float,
        led_current: int = 0,
        led_voltage: int = 0,
        led_power: int = 0,
        led_shared_red: int = 0,
        is_overcurrent: int = 0,
        event_count: int = 0,
        latest_event_time: str = "--:--:--",
        status: str = "NORMAL",
    ) -> str:
        """
        Formats a standardized Protocol V2 message for the ESP32:
        'V2,seq,timestamp,current,voltage,power,led_i,led_v,led_p,led_shared,overcurrent,event_count,status\\n'
        """
        self.sequence_num += 1
        clean_time = latest_event_time.replace(",", "").strip() if latest_event_time else "--:--:--"
        clean_status = status.replace(",", "_").strip() if status else "NORMAL"

        return (
            f"V2,{self.sequence_num},{clean_time},{current:.2f},{voltage:.1f},{power:.1f},"
            f"{int(led_current)},{int(led_voltage)},{int(led_power)},{int(led_shared_red)},"
            f"{int(is_overcurrent)},{int(event_count)},{clean_status}\n"
        )

    @staticmethod
    def parse_v2_payload(payload_line: str) -> Optional[dict]:
        """
        Parses a Protocol V2 message string back into a dictionary.
        Returns None if malformed or invalid.
        """
        line = payload_line.strip()
        if not line.startswith("V2,"):
            return None

        tokens = line.split(",")
        if len(tokens) < 13:
            return None

        try:
            return {
                "protocol": tokens[0],
                "seq": int(tokens[1]),
                "timestamp": tokens[2],
                "current": float(tokens[3]),
                "voltage": float(tokens[4]),
                "power": float(tokens[5]),
                "led_current": int(tokens[6]),
                "led_voltage": int(tokens[7]),
                "led_power": int(tokens[8]),
                "led_shared_red": int(tokens[9]),
                "overcurrent": int(tokens[10]),
                "event_count": int(tokens[11]),
                "status": tokens[12],
            }
        except (ValueError, IndexError):
            return None

    def transmit_telemetry_payload(
        self,
        current: float,
        voltage: float,
        power: float,
        led_current: int,
        led_voltage: int,
        led_power: int,
        led_shared_red: int,
        is_overcurrent: int,
        event_count: int,
        latest_event_time: str,
        status: str,
    ) -> Tuple[bool, str]:
        """
        Transmits full synchronized V2 protocol message to ESP32:
        'V2,seq,timestamp,current,voltage,power,led_i,led_v,led_p,led_shared,overcurrent,event_count,status\\n'
        Returns:
            (success: bool, raw_message_or_error: str)
        """
        if not self.is_connected():
            return False, "Not connected to any serial COM port."

        try:
            line = self.format_v2_payload(
                current=current,
                voltage=voltage,
                power=power,
                led_current=led_current,
                led_voltage=led_voltage,
                led_power=led_power,
                led_shared_red=led_shared_red,
                is_overcurrent=is_overcurrent,
                event_count=event_count,
                latest_event_time=latest_event_time,
                status=status,
            )
            raw_bytes = line.encode("utf-8")
            self.connection.write(raw_bytes)
            self.connection.flush()
            self.total_packets_sent += 1
            self.total_bytes_sent += len(raw_bytes)
            return True, line.strip()
        except Exception as e:
            self.last_error = f"Transmit exception on {self.port}: {e}"
            self.disconnect()
            return False, str(e)

