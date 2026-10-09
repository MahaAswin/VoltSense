"""
WattWise Edge - Single-Machine Sensor Data Simulator
====================================================
This script simulates electric machine telemetry (current, voltage, power)
and streams it over a serial connection (UART) to an ESP32 microcontroller.

NOTE: All generated readings are synthetic/simulated for testing purposes
      and do not represent real hardware sensor measurements.
"""

import random
import sys
import time
import serial
from serial import SerialException

# ==============================================================================
# Configuration Parameters
# ==============================================================================
SERIAL_PORT = "COM6"           # Serial COM port connected to the ESP32
BAUD_RATE = 115200             # Baud rate matching ESP32 UART configuration
SEND_INTERVAL_SEC = 2.0        # Delay between message transmissions (seconds)
OVERCURRENT_THRESHOLD = 5.0    # Threshold in Amperes for overcurrent status
POWER_FACTOR = 0.95            # Assumed power factor for estimated power calculation

# Simulation Ranges
NORMAL_CURRENT_MIN = 1.0       # Normal lower current bound (Amperes)
NORMAL_CURRENT_MAX = 4.0       # Normal upper current bound (Amperes)
ANOMALY_CURRENT_MIN = 5.5      # Anomaly lower current bound (Amperes)
ANOMALY_CURRENT_MAX = 7.5      # Anomaly upper current bound (Amperes)
ANOMALY_PROBABILITY = 0.15     # 15% probability per sample to trigger an anomaly spike

VOLTAGE_MIN = 228.0            # Nominal mains voltage lower bound (Volts)
VOLTAGE_MAX = 232.0            # Nominal mains voltage upper bound (Volts)


def generate_simulated_readings():
    """
    Generates synthetic telemetry readings for a single machine:
      - Current (A): 1.0 - 4.0 A normally, occasional anomaly spike between 5.5 - 7.5 A
      - Voltage (V): 228.0 - 232.0 V
      - Power (W): Calculated as Voltage * Current * Power Factor (0.95)
    
    Returns:
        tuple: (current, voltage, power, is_overcurrent)
    """
    # Decide whether to inject an occasional anomaly spike
    is_anomaly = random.random() < ANOMALY_PROBABILITY

    if is_anomaly:
        current = random.uniform(ANOMALY_CURRENT_MIN, ANOMALY_CURRENT_MAX)
    else:
        current = random.uniform(NORMAL_CURRENT_MIN, NORMAL_CURRENT_MAX)

    voltage = random.uniform(VOLTAGE_MIN, VOLTAGE_MAX)
    power = voltage * current * POWER_FACTOR

    is_overcurrent = current >= OVERCURRENT_THRESHOLD
    return current, voltage, power, is_overcurrent


def main():
    print("=" * 65)
    print(" WattWise Edge - Simulated Machine Data Streamer")
    print("=" * 65)
    print(f" Port       : {SERIAL_PORT}")
    print(f" Baud Rate  : {BAUD_RATE}")
    print(f" Interval   : {SEND_INTERVAL_SEC}s")
    print(f" Threshold  : {OVERCURRENT_THRESHOLD} A")
    print("=" * 65)

    ser = None
    try:
        # Initialize serial connection with ESP32
        print(f"Connecting to ESP32 on {SERIAL_PORT} at {BAUD_RATE} baud...")
        ser = serial.Serial(port=SERIAL_PORT, baudrate=BAUD_RATE, timeout=1.0)
        # Allow ESP32 a brief moment to reset if DTR/RTS toggles on connect
        time.sleep(2.0)
        print("Connected successfully! Starting data transmission loop.\n")
        print(f"{'Time':<10} | {'Current (A)':<12} | {'Voltage (V)':<12} | {'Power (W)':<12} | {'Status':<12}")
        print("-" * 65)

        sample_count = 0
        while True:
            sample_count += 1
            current, voltage, power, is_overcurrent = generate_simulated_readings()
            status_str = "OVERCURRENT" if is_overcurrent else "NORMAL"
            timestamp_str = time.strftime("%H:%M:%S")

            # Format CSV payload: "current,voltage,power\n"
            payload = f"{current:.2f},{voltage:.2f},{power:.2f}\n"

            # Transmit encoded bytes over serial
            ser.write(payload.encode("utf-8"))
            ser.flush()

            # Print telemetry to terminal
            print(f"{timestamp_str:<10} | {current:<12.2f} | {voltage:<12.2f} | {power:<12.2f} | {status_str:<12}")

            time.sleep(SEND_INTERVAL_SEC)

    except SerialException as e:
        print(f"\n[ERROR] Serial port error on {SERIAL_PORT}: {e}")
        print("Please verify that:")
        print(f"  1. The ESP32 is plugged in and recognized as {SERIAL_PORT}.")
        print("  2. No other program (e.g. Arduino Serial Monitor, PuTTY) is using the port.")
        sys.exit(1)

    except KeyboardInterrupt:
        print("\n\n[INFO] Simulation stopped by user (Ctrl+C).")

    finally:
        # Cleanly close serial port if open
        if ser is not None and ser.is_open:
            ser.close()
            print("[INFO] Serial connection closed cleanly.")


if __name__ == "__main__":
    main()
