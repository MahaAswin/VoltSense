"""
WattWise Edge - Digital Twin Simulation Engine
=============================================
Provides 6 deterministic and bounded simulation scenarios:
  1. Normal Operation: Small fluctuations < 0.5 A around 1–3 A.
  2. Gradually Increasing Load: Progressive stepped ramp: 1.0 A -> 1.5 A -> 2.0 A -> 3.0 A -> 4.0 A -> 5.5 A.
  3. Sudden Current Spike: Normal load then abrupt jump to 6.5–7.0 A.
  4. Repeated Overcurrent: Multiple discrete spikes > 5.0 A separated by recovery periods.
  5. Unstable Current Fluctuations: Erratic alternations (1.5 A -> 2.5 A -> 1.7 A -> 3.4 A -> 1.4 A).
  6. Recovery After Abnormal Event: Step-down cooling (6.5 A -> 5.2 A -> 3.8 A -> 2.4 A).
"""

import math
import random
from typing import Dict, List


class DigitalTwinEngine:
    """Stateful digital twin simulation engine for machine current monitoring."""

    SCENARIOS: List[str] = [
        "Normal Operation",
        "Gradually Increasing Load",
        "Sudden Current Spike",
        "Repeated Overcurrent",
        "Unstable Current Fluctuations",
        "Recovery After Abnormal Event",
        "Power → Current → Voltage → Overcurrent",
    ]

    # Flexible alias mapping to handle legacy or alternative naming
    SCENARIO_ALIASES = {
        "normal": "Normal Operation",
        "normal operation": "Normal Operation",
        "normal change event": "Unstable Current Fluctuations",
        "heavy change event": "Sudden Current Spike",
        "overcurrent condition": "Repeated Overcurrent",
        "gradual drift": "Gradually Increasing Load",
        "gradually increasing load": "Gradually Increasing Load",
        "sudden current spike": "Sudden Current Spike",
        "repeated overcurrent": "Repeated Overcurrent",
        "unstable current fluctuations": "Unstable Current Fluctuations",
        "recovery after event": "Recovery After Abnormal Event",
        "recovery after abnormal event": "Recovery After Abnormal Event",
        "power → current → voltage → overcurrent": "Power → Current → Voltage → Overcurrent",
        "power -> current -> voltage -> overcurrent": "Power → Current → Voltage → Overcurrent",
        "power_current_voltage_overcurrent": "Power → Current → Voltage → Overcurrent",
        "power current voltage overcurrent": "Power → Current → Voltage → Overcurrent",
    }

    def __init__(self):
        self.scenario: str = "Normal Operation"
        self.step_index: int = 0
        self.nominal_voltage: float = 230.0
        self.power_factor: float = 0.95
        self.state_var: float = 2.40

    def set_scenario(self, scenario_name: str):
        """Switches active scenario, normalizes name, and resets state machine."""
        normalized = self.SCENARIO_ALIASES.get(scenario_name.strip().lower(), scenario_name)
        if normalized in self.SCENARIOS:
            self.scenario = normalized
        else:
            self.scenario = "Normal Operation"

        self.step_index = 0
        if self.scenario == "Recovery After Abnormal Event":
            self.state_var = 6.50
        elif self.scenario == "Gradually Increasing Load":
            self.state_var = 1.00
        elif self.scenario == "Sudden Current Spike":
            self.state_var = 2.30
        elif self.scenario == "Repeated Overcurrent":
            self.state_var = 2.20
        elif self.scenario == "Unstable Current Fluctuations":
            self.state_var = 1.50
        elif self.scenario == "Power → Current → Voltage → Overcurrent":
            self.state_var = 2.20
        else:
            self.state_var = 2.40

    def generate_step(self, threshold: float = 5.0) -> Dict:
        """Generates deterministic / bounded synthetic telemetry for active scenario."""
        self.step_index += 1
        scenario_description = ""
        current = 2.40
        voltage = round(random.uniform(228.5, 231.5), 1)
        power = None

        if self.scenario == "Normal Operation":
            # Small random fluctuations around 2.2 A (delta < 0.25 A) -> 0 events
            noise = random.uniform(-0.12, 0.12)
            current = round(2.25 + noise, 2)
            scenario_description = "Normal stable operation (fluctuations < 0.5 A)."

        elif self.scenario == "Gradually Increasing Load":
            # Stepped sequence: 1.0 -> 1.5 -> 2.0 -> 3.0 -> 4.0 -> 5.5 -> reset to 1.0
            steps = [1.00, 1.50, 2.00, 3.00, 4.00, 5.50]
            step_idx = (self.step_index - 1) % len(steps)
            base_val = steps[step_idx]
            noise = random.uniform(-0.04, 0.04)
            current = round(base_val + noise, 2)
            scenario_description = f"Progressive load ramp (Step {step_idx + 1}/6: {base_val:.1f} A)."

        elif self.scenario == "Sudden Current Spike":
            # 3 normal steps (2.3 A), 1 massive spike (6.8 A), 2 sustained high, then recovery
            pattern = [2.30, 2.35, 2.25, 6.80, 6.75, 2.40]
            base_val = pattern[(self.step_index - 1) % len(pattern)]
            noise = random.uniform(-0.05, 0.05)
            current = round(base_val + noise, 2)
            if base_val >= 6.0:
                scenario_description = "Abrupt massive current surge (> 5.0 A overcurrent spike)."
            else:
                scenario_description = "Nominal baseline prior to/after sudden spike."

        elif self.scenario == "Repeated Overcurrent":
            # Repeating cycle with 2 distinct overcurrent spikes separated by recovery
            # [Normal, Spike1, Spike1_sustained, Recovery, Normal, Spike2, Spike2_sustained, Recovery]
            cycle = [2.20, 6.20, 6.15, 2.30, 2.40, 5.85, 5.80, 2.20]
            base_val = cycle[(self.step_index - 1) % len(cycle)]
            noise = random.uniform(-0.04, 0.04)
            current = round(base_val + noise, 2)
            if base_val > 5.0:
                scenario_description = f"Repeated overcurrent breach ({base_val:.2f} A)."
            else:
                scenario_description = "Inter-spike recovery period (normal current)."

        elif self.scenario == "Unstable Current Fluctuations":
            # Erratic alternating values: 1.50 -> 2.50 (+1.0) -> 1.70 (-0.8) -> 3.40 (+1.7) -> 1.40 (-2.0) -> 2.60 (+1.2)
            values = [1.50, 2.50, 1.70, 3.40, 1.40, 2.60]
            base_val = values[(self.step_index - 1) % len(values)]
            noise = random.uniform(-0.03, 0.03)
            current = round(base_val + noise, 2)
            scenario_description = f"Unstable machine fluctuations (active target: {base_val:.2f} A)."

        elif self.scenario == "Recovery After Abnormal Event":
            # Step-down recovery: 6.50 -> 5.20 -> 3.80 -> 2.40 -> 2.35
            steps = [6.50, 5.20, 3.80, 2.40, 2.35]
            if self.step_index <= len(steps):
                base_val = steps[self.step_index - 1]
            else:
                base_val = 2.30 + random.uniform(-0.08, 0.08)
            noise = random.uniform(-0.04, 0.04)
            current = round(base_val + noise, 2)
            if current > 5.0:
                scenario_description = f"Abnormal condition active ({current:.2f} A), beginning recovery."
            else:
                scenario_description = f"Stabilizing recovery returning to nominal safe load ({current:.2f} A)."

        elif self.scenario == "Power → Current → Voltage → Overcurrent":
            # 4 discrete stages (+ 1 recovery step) with dynamic variation
            # Stage 1: Power increase (P increases to ~780-820 W, I and V remain nominal ~2.2 A, ~230 V)
            # Stage 2: Current increase (I jumps to ~3.8-4.2 A, V nominal ~230 V)
            # Stage 3: Voltage change (V shifts to 212 V or 244 V, I ~3.8 A)
            # Stage 4: Overcurrent trigger (I jumps to 6.2-6.8 A > 5.0 A, all LEDs activate)
            # Stage 5: Safe recovery (I returns to ~2.2 A, V ~230 V)
            stage_idx = (self.step_index - 1) % 5
            cycle_num = (self.step_index - 1) // 5
            v_dir = -1 if (cycle_num % 2 == 0) else 1
            i_base = 2.20 + (cycle_num % 3) * 0.05

            if stage_idx == 0:
                # Stage 1: Power Increase (nominal I and V, elevated power)
                current = round(i_base + random.uniform(-0.04, 0.04), 2)
                voltage = round(230.0 + random.uniform(-1.0, 1.0), 1)
                power = round(random.uniform(770.0, 830.0), 1)
                scenario_description = f"Stage 1/4: Power increase (Power elevated to {power:.0f} W while I and V remain nominal)."

            elif stage_idx == 1:
                # Stage 2: Current Increase (elevated current, nominal voltage)
                target_i = 3.85 + (cycle_num % 2) * 0.30
                current = round(target_i + random.uniform(-0.05, 0.05), 2)
                voltage = round(230.0 + random.uniform(-1.0, 1.0), 1)
                power = round(voltage * current * self.power_factor, 1)
                scenario_description = f"Stage 2/4: Current increase (Current stepped up to {current:.2f} A)."

            elif stage_idx == 2:
                # Stage 3: Voltage Change (shifted voltage, elevated current)
                target_i = 3.85 + (cycle_num % 2) * 0.30
                current = round(target_i + random.uniform(-0.04, 0.04), 2)
                target_v = 212.0 if v_dir == -1 else 244.0
                voltage = round(target_v + random.uniform(-1.0, 1.0), 1)
                power = round(voltage * current * self.power_factor, 1)
                scenario_description = f"Stage 3/4: Voltage change (Voltage shifted to {voltage:.1f} V)."

            elif stage_idx == 3:
                # Stage 4: Overcurrent Trigger (> 5.0 A)
                overcurrent_val = 6.20 + random.uniform(0.1, 0.6)
                current = round(overcurrent_val, 2)
                voltage = round(229.5 + random.uniform(-1.5, 1.5), 1)
                power = round(voltage * current * self.power_factor, 1)
                scenario_description = f"Stage 4/4: Overcurrent trigger ({current:.2f} A > 5.0 A threshold, all LEDs active)."

            else:
                # Stage 5: Recovery baseline
                current = round(2.25 + random.uniform(-0.05, 0.05), 2)
                voltage = round(230.0 + random.uniform(-1.0, 1.0), 1)
                power = round(voltage * current * self.power_factor, 1)
                scenario_description = "Stage 5: Recovery stabilization returning to nominal baseline."

        else:
            current = 2.40
            scenario_description = "Default nominal operation."

        # If power was not custom set, calculate as V * I * PF
        if power is None:
            power = round(voltage * current * self.power_factor, 1)

        return {
            "current": current,
            "voltage": voltage,
            "power": power,
            "scenario": self.scenario,
            "scenario_description": scenario_description,
            "step": self.step_index,
        }
