"""
WattWise Edge - Electrical Monitoring & 4-LED Increase Event Engine
===================================================================
Tracks:
  - Current (A), Voltage (V), Power (W)
  - Consecutive 5-second sample differences (ΔI, ΔV, ΔP)
  - Four Logical Increase Indicator LEDs:
      1. Current Increase LED: ON if (I_now - I_prev) > tol_current
      2. Voltage Increase LED: ON if (V_now - V_prev) > tol_voltage
      3. Power Increase LED: ON if (P_now - P_prev) > tol_power
      4. Shared Red Warning LED: ON ONLY if ALL THREE conditions are true simultaneously.
  - Independent Overcurrent Supervision: I_now > 5.0 A (Highest Priority).
  - Event Severity Classification and Session De-duplication.
"""

import datetime
import uuid
from typing import Dict, List, Optional, Tuple


class ElectricalEvent:
    """Represents a discrete abnormal or significant electrical event."""

    def __init__(
        self,
        event_id: str,
        session_id: str,
        count: int,
        timestamp_iso: str,
        timestamp_local: str,
        current_now: float,
        prev_current: float,
        voltage_now: float,
        prev_voltage: float,
        power_now: float,
        prev_power: float,
        change_current: float,
        change_voltage: float,
        change_power: float,
        direction: str,  # 'INCREASE' | 'DECREASE' | 'NONE'
        event_type: str,  # 'OVERCURRENT' | 'HEAVY_CHANGE' | 'NORMAL_CHANGE' | 'RECOVERY' | 'NORMAL_FLUCTUATION'
        severity: str,  # 'CRITICAL' | 'WARNING' | 'NORMAL'
        explanation: str,
        led_current: int,
        led_voltage: int,
        led_power: int,
        led_shared_red: int,
        white_led: int,
        red_led: int,
        status: str,
        scenario: str = "Normal Operation",
    ):
        self.event_id = event_id
        self.session_id = session_id
        self.count = count
        self.timestamp_iso = timestamp_iso
        self.timestamp_local = timestamp_local
        self.current_now = current_now
        self.prev_current = prev_current
        self.voltage_now = voltage_now
        self.prev_voltage = prev_voltage
        self.power_now = power_now
        self.prev_power = prev_power
        self.change_current = change_current
        self.change_voltage = change_voltage
        self.change_power = change_power
        self.direction = direction
        self.event_type = event_type
        self.severity = severity
        self.explanation = explanation
        self.led_current = led_current
        self.led_voltage = led_voltage
        self.led_power = led_power
        self.led_shared_red = led_shared_red
        self.white_led = white_led
        self.red_led = red_led
        self.status = status
        self.scenario = scenario

    def to_dict(self) -> Dict:
        return {
            "event_id": self.event_id,
            "id": self.event_id,
            "session_id": self.session_id,
            "count": self.count,
            "event_count": self.count,
            "timestamp": self.timestamp_local,
            "timestamp_iso": self.timestamp_iso,
            "timestamp_local": self.timestamp_local,
            "new_current": self.current_now,
            "current_now": self.current_now,
            "previous_current": self.prev_current,
            "prev_current": self.prev_current,
            "voltage_now": self.voltage_now,
            "prev_voltage": self.prev_voltage,
            "power_now": self.power_now,
            "prev_power": self.prev_power,
            "change_magnitude": abs(self.change_current),
            "change_current": self.change_current,
            "change_voltage": self.change_voltage,
            "change_power": self.change_power,
            "direction": self.direction,
            "event_type": self.event_type,
            "severity": self.severity,
            "explanation": self.explanation,
            # 4-LED Increase Indicators
            "led_current": self.led_current,
            "led_voltage": self.led_voltage,
            "led_power": self.led_power,
            "led_shared_red": self.led_shared_red,
            # Legacy 2-LED indicators
            "white_led": self.white_led,
            "red_led": self.red_led,
            "led_state": {
                "white": self.white_led,
                "red": self.red_led,
                "current": self.led_current,
                "voltage": self.led_voltage,
                "power": self.led_power,
                "shared_red": self.led_shared_red,
            },
            "status": self.status,
            "scenario": self.scenario,
        }


CurrentChangeEvent = ElectricalEvent


class CurrentChangeDetector:
    """
    Stateful electrical current change detector and 4-LED increase evaluator.
    Maintains previous baseline values, event sequence numbering, and de-duplication.
    """

    def __init__(
        self,
        threshold_normal: float = 0.5,
        threshold_heavy: float = 1.5,
        threshold_overcurrent: float = 5.0,
        tol_current: float = 0.15,
        tol_voltage: float = 0.80,
        tol_power: float = 30.0,
        led_hold_cycles: int = 1,
    ):
        # Event Detection Thresholds
        self.threshold_normal = threshold_normal
        self.threshold_heavy = threshold_heavy
        self.threshold_overcurrent = threshold_overcurrent

        # 4-LED Increase Tolerances
        self.tol_current = tol_current
        self.tol_voltage = tol_voltage
        self.tol_power = tol_power
        self.led_hold_cycles = led_hold_cycles

        self.session_id: str = str(uuid.uuid4())[:8]
        self.event_counter: int = 0

        # Baselines
        self.previous_current: Optional[float] = None
        self.previous_voltage: Optional[float] = None
        self.previous_power: Optional[float] = None

        self.events_history: List[ElectricalEvent] = []
        self.latest_event: Optional[ElectricalEvent] = None
        self.last_status: str = "NORMAL"

    def reset_session(
        self,
        initial_baseline: Optional[float] = None,
        initial_current: Optional[float] = None,
        initial_voltage: Optional[float] = None,
        initial_power: Optional[float] = None,
    ):
        """Resets the comparison baselines and session sequence counter."""
        base_c = initial_current if initial_current is not None else initial_baseline
        self.session_id = str(uuid.uuid4())[:8]
        self.event_counter = 0
        self.previous_current = base_c
        self.previous_voltage = initial_voltage
        self.previous_power = initial_power
        self.events_history.clear()
        self.latest_event = None
        self.last_status = "NORMAL"

    def evaluate(
        self,
        current_now: float,
        voltage_now: Optional[float] = None,
        power_now: Optional[float] = None,
        scenario_name: str = "Normal Operation",
    ) -> Tuple[Dict, bool]:
        """
        Evaluates a new (Current, Voltage, Power) sample against the preceding 5s sample.
        Computes 4-LED Increase logic, Overcurrent alerts, and Event records.
        """
        now = datetime.datetime.now()
        timestamp_iso = now.isoformat()
        timestamp_local = now.strftime("%H:%M:%S")

        # Provide defaults if voltage/power not supplied
        v_now = voltage_now if voltage_now is not None else 230.0
        p_now = power_now if power_now is not None else round(v_now * current_now * 0.95, 1)

        # 1. First sample baseline initialization
        if self.previous_current is None:
            self.previous_current = current_now
            self.previous_voltage = v_now
            self.previous_power = p_now

            is_overcurrent = current_now > self.threshold_overcurrent
            if is_overcurrent:
                self.event_counter += 1
                self.last_status = "OVERCURRENT"
                event = ElectricalEvent(
                    event_id=f"EVT-{self.event_counter:04d}",
                    session_id=self.session_id,
                    count=self.event_counter,
                    timestamp_iso=timestamp_iso,
                    timestamp_local=timestamp_local,
                    current_now=current_now,
                    prev_current=current_now,
                    voltage_now=v_now,
                    prev_voltage=v_now,
                    power_now=p_now,
                    prev_power=p_now,
                    change_current=0.0,
                    change_voltage=0.0,
                    change_power=0.0,
                    direction="NONE",
                    event_type="OVERCURRENT",
                    severity="CRITICAL",
                    explanation=f"Overcurrent breach on startup ({current_now:.2f} A > {self.threshold_overcurrent:.1f} A).",
                    led_current=0,
                    led_voltage=0,
                    led_power=0,
                    led_shared_red=0,
                    white_led=0,
                    red_led=1,
                    status="OVERCURRENT",
                    scenario=scenario_name,
                )
                self.events_history.append(event)
                self.latest_event = event

                res = event.to_dict()
                res["is_new_event"] = True
                return res, True
            else:
                self.last_status = "NORMAL"
                init_res = {
                    "event_id": f"INIT-{self.session_id}",
                    "id": f"INIT-{self.session_id}",
                    "session_id": self.session_id,
                    "count": 0,
                    "event_count": 0,
                    "timestamp": timestamp_local,
                    "timestamp_iso": timestamp_iso,
                    "timestamp_local": timestamp_local,
                    "new_current": current_now,
                    "current_now": current_now,
                    "previous_current": current_now,
                    "prev_current": current_now,
                    "voltage_now": v_now,
                    "prev_voltage": v_now,
                    "power_now": p_now,
                    "prev_power": p_now,
                    "change_magnitude": 0.0,
                    "change_current": 0.0,
                    "change_voltage": 0.0,
                    "change_power": 0.0,
                    "direction": "NONE",
                    "event_type": "BASELINE_INIT",
                    "severity": "NORMAL",
                    "explanation": f"Initial 5s electrical baseline established at {current_now:.2f} A, {v_now:.1f} V, {p_now:.0f} W.",
                    "led_current": 0,
                    "led_voltage": 0,
                    "led_power": 0,
                    "led_shared_red": 0,
                    "white_led": 0,
                    "red_led": 0,
                    "led_state": {"white": 0, "red": 0, "current": 0, "voltage": 0, "power": 0, "shared_red": 0},
                    "status": "NORMAL",
                    "scenario": scenario_name,
                    "is_new_event": False,
                }
                return init_res, False

        # 2. Consecutive Differences
        prev_i = self.previous_current
        prev_v = self.previous_voltage if self.previous_voltage is not None else v_now
        prev_p = self.previous_power if self.previous_power is not None else p_now

        diff_i = round(current_now - prev_i, 3)
        diff_v = round(v_now - prev_v, 2)
        diff_p = round(p_now - prev_p, 1)

        abs_diff_i = round(abs(diff_i), 3)

        # Direction calculation
        if diff_i > 0.01:
            direction = "INCREASE"
        elif diff_i < -0.01:
            direction = "DECREASE"
        else:
            direction = "NONE"

        # 3. Four-LED Increase Logic (Indicators for consecutive increases beyond tolerance)
        led_current = 1 if (diff_i > self.tol_current) else 0
        led_voltage = 1 if (diff_v > self.tol_voltage) else 0
        led_power = 1 if (diff_p > self.tol_power) else 0
        led_shared_red = 1 if (led_current == 1 and led_voltage == 1 and led_power == 1) else 0

        # 4. Event Detection & Operating Status Evaluation
        is_overcurrent = current_now > self.threshold_overcurrent
        is_new_event = False
        event_type = "NORMAL_FLUCTUATION"
        severity = "NORMAL"
        explanation = "Stable operation within normal tolerances."

        if is_overcurrent:
            event_type = "OVERCURRENT"
            severity = "CRITICAL"
            status = "OVERCURRENT"
            explanation = f"Overcurrent condition: {current_now:.2f} A exceeds {self.threshold_overcurrent:.1f} A limit."

            # Register event only on transition or significant movement during overcurrent
            if self.last_status != "OVERCURRENT" or abs_diff_i >= self.threshold_normal:
                is_new_event = True

        elif self.last_status == "OVERCURRENT" and not is_overcurrent:
            event_type = "RECOVERY"
            severity = "NORMAL"
            status = "NORMAL"
            explanation = f"Recovery: Current safely returned below threshold ({current_now:.2f} A < {self.threshold_overcurrent:.1f} A)."
            is_new_event = True

        elif abs_diff_i >= self.threshold_heavy:
            event_type = "HEAVY_CHANGE"
            severity = "WARNING"
            status = "HEAVY_CHANGE"
            explanation = f"Heavy sudden current change: {direction} of {abs_diff_i:.2f} A (from {prev_i:.2f} A to {current_now:.2f} A)."
            is_new_event = True

        elif abs_diff_i >= self.threshold_normal:
            event_type = "NORMAL_CHANGE"
            severity = "NORMAL"
            status = "NORMAL_CHANGE"
            explanation = f"Normal current change: {direction} of {abs_diff_i:.2f} A (from {prev_i:.2f} A to {current_now:.2f} A)."
            is_new_event = True

        else:
            event_type = "NORMAL_FLUCTUATION"
            severity = "NORMAL"
            status = "NORMAL"
            explanation = f"Minor fluctuation of {abs_diff_i:.2f} A (Current: {current_now:.2f} A)."

        # Legacy 2-LED states for backwards compatibility
        if is_overcurrent or abs_diff_i >= self.threshold_heavy:
            red_led = 1
            white_led = 0
        elif abs_diff_i >= self.threshold_normal:
            white_led = 1
            red_led = 0
        else:
            white_led = 0
            red_led = 0

        # Record event in history if new
        if is_new_event:
            self.event_counter += 1
            event = ElectricalEvent(
                event_id=f"EVT-{self.event_counter:04d}",
                session_id=self.session_id,
                count=self.event_counter,
                timestamp_iso=timestamp_iso,
                timestamp_local=timestamp_local,
                current_now=current_now,
                prev_current=prev_i,
                voltage_now=v_now,
                prev_voltage=prev_v,
                power_now=p_now,
                prev_power=prev_p,
                change_current=diff_i,
                change_voltage=diff_v,
                change_power=diff_p,
                direction=direction,
                event_type=event_type,
                severity=severity,
                explanation=explanation,
                led_current=led_current,
                led_voltage=led_voltage,
                led_power=led_power,
                led_shared_red=led_shared_red,
                white_led=white_led,
                red_led=red_led,
                status=status,
                scenario=scenario_name,
            )
            self.events_history.append(event)
            self.latest_event = event

        # Update baselines for the next 5-second cycle
        self.previous_current = current_now
        self.previous_voltage = v_now
        self.previous_power = p_now
        self.last_status = status

        result_dict = {
            "event_id": f"EVT-{self.event_counter:04d}" if is_new_event else f"SMP-{now.strftime('%H%M%S')}",
            "id": f"EVT-{self.event_counter:04d}" if is_new_event else f"SMP-{now.strftime('%H%M%S')}",
            "session_id": self.session_id,
            "count": self.event_counter,
            "event_count": self.event_counter,
            "timestamp": timestamp_local,
            "timestamp_iso": timestamp_iso,
            "timestamp_local": timestamp_local,
            "new_current": current_now,
            "current_now": current_now,
            "current": current_now,
            "previous_current": prev_i,
            "prev_current": prev_i,
            "voltage_now": v_now,
            "voltage": v_now,
            "prev_voltage": prev_v,
            "power_now": p_now,
            "power": p_now,
            "prev_power": prev_p,
            "change_magnitude": abs_diff_i,
            "change_a": abs_diff_i,
            "change_current": diff_i,
            "change_voltage": diff_v,
            "change_power": diff_p,
            "direction": direction,
            "event_type": event_type,
            "severity": severity,
            "explanation": explanation,
            "led_current": led_current,
            "led_voltage": led_voltage,
            "led_power": led_power,
            "led_shared_red": led_shared_red,
            "white_led": white_led,
            "red_led": red_led,
            "led1": white_led,
            "led2": red_led,
            "led_state": {
                "white": white_led,
                "red": red_led,
                "led1": white_led,
                "led2": red_led,
                "current": led_current,
                "voltage": led_voltage,
                "power": led_power,
                "shared_red": led_shared_red,
            },
            "status": status,
            "scenario": scenario_name,
            "is_new_event": is_new_event,
        }

        return result_dict, is_new_event
