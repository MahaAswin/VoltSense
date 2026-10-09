"""
VoltSense - Master FastAPI Backend Server (5-Second Monitoring Engine)
======================================================================
Provides REST endpoints and live WebSocket broadcasting for the
IoT Machine Electrical Monitoring & 4-LED Increase Detection System.
"""

import asyncio
import datetime
import json
import statistics
import time
from typing import Dict, List, Optional, Set

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from core.anomaly_detector import AnomalyDetector
from core.current_change_detector import CurrentChangeDetector
from core.digital_twin import DigitalTwinEngine
from core.energy_tracker import EnergyTracker
from core.health_model import MachineHealthModel
from core.serial_manager import SerialManager

app = FastAPI(
    title="VoltSense Electrical Monitoring & 4-LED Detection Backend",
    description="Backend for Machine Electrical Telemetry (5s cycle), 4-LED increase logic, and ESP32 OLED synchronization",
    version="4.0.0",
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==============================================================================
# Global Application State
# ==============================================================================
class AppState:
    def __init__(self):
        self.simulation_active: bool = False
        self.simulation_paused: bool = False
        self.current_threshold: float = 5.0
        self.threshold_normal_change: float = 0.5
        self.threshold_heavy_change: float = 1.5
        self.tol_current: float = 0.15
        self.tol_voltage: float = 0.80
        self.tol_power: float = 30.0
        self.serial_port: str = "COM6"
        self.baud_rate: int = 115200
        self.update_interval: float = 5.0  # Exactly 5.0s monitoring cycle
        self.last_step_timestamp: float = time.time()

        # Core Engine Instances
        self.twin = DigitalTwinEngine()
        self.change_detector = CurrentChangeDetector(
            threshold_normal=self.threshold_normal_change,
            threshold_heavy=self.threshold_heavy_change,
            threshold_overcurrent=self.current_threshold,
            tol_current=self.tol_current,
            tol_voltage=self.tol_voltage,
            tol_power=self.tol_power,
        )
        self.anomaly_detector = AnomalyDetector(baseline_current=2.5)
        self.health_model = MachineHealthModel(hard_threshold=5.0)
        self.energy_tracker = EnergyTracker(tariff_rate=0.15)
        self.serial_manager = SerialManager(port="COM6", baud_rate=115200)

        self.readings_history: List[Dict] = []
        self.connected_websockets: Set[WebSocket] = set()
        self.sim_task: Optional[asyncio.Task] = None

state = AppState()


# ==============================================================================
# Core Simulation Step Execution (5-Second Periodic Sample)
# ==============================================================================
def execute_step() -> Dict:
    """
    Executes a single 5-second monitoring cycle:
    1. Digital twin generates bounded synthetic current, voltage, estimated power.
    2. Change detector computes ΔI, ΔV, ΔP and 4-LED increase states.
    3. Serial manager transmits synchronized V2 protocol message to ESP32.
    4. Records sample in history and tracks energy.
    """
    state.last_step_timestamp = time.time()

    # 1. Twin generation
    step_data = state.twin.generate_step(threshold=state.current_threshold)
    curr = step_data["current"]
    volt = step_data["voltage"]
    pwr = step_data["power"]
    scenario = step_data["scenario"]

    # 2. Multi-parameter electrical & 4-LED evaluation
    eval_res, is_new_event = state.change_detector.evaluate(
        current_now=curr,
        voltage_now=volt,
        power_now=pwr,
        scenario_name=scenario,
    )

    # 3. Transmit to ESP32 Hardware
    latest_evt = state.change_detector.latest_event
    latest_time = latest_evt.timestamp_local if latest_evt else "--:--:--"
    is_oc = 1 if (curr > state.current_threshold) else 0

    if not state.serial_manager.is_connected() and state.simulation_active:
        if time.time() - state.serial_manager.last_connect_attempt > 6.0:
            ok, msg = state.serial_manager.auto_connect_available()
            if ok:
                state.serial_port = state.serial_manager.port
                print(f"[SERIAL OK] {msg}")

    if state.serial_manager.is_connected():
        success, raw_payload = state.serial_manager.transmit_readings(
            current=curr,
            voltage=volt,
            power=pwr,
        )
        if success:
            print(f"[SERIAL TX OK] ({state.serial_manager.port} @ {state.serial_manager.baud_rate}) -> {raw_payload}")
        else:
            print(f"[SERIAL TX FAILED] Port {state.serial_manager.port}: {raw_payload}")
    else:
        print(f"[SERIAL INFO] ESP32 disconnected. (Target Port: {state.serial_port}). Streaming to WebSockets.")

    # 4. Auxiliary Metrics (Health & Energy)
    anom = state.anomaly_detector.evaluate(state.readings_history, curr, state.current_threshold)
    hlth = state.health_model.compute_health(state.readings_history, anom["anomaly_score"])
    state.energy_tracker.add_step(pwr, state.update_interval)

    now = datetime.datetime.now()
    sample = {
        "timestamp": now.strftime("%H:%M:%S"),
        "timestamp_iso": now.isoformat(),
        "current": curr,
        "previous_current": eval_res["previous_current"],
        "change_current": eval_res["change_current"],
        "change_a": eval_res["change_magnitude"],
        "voltage": volt,
        "previous_voltage": eval_res["prev_voltage"],
        "change_voltage": eval_res["change_voltage"],
        "power": pwr,
        "previous_power": eval_res["prev_power"],
        "change_power": eval_res["change_power"],
        "direction": eval_res["direction"],
        "event_type": eval_res["event_type"],
        "severity": eval_res["severity"],
        "explanation": eval_res["explanation"],
        "led_current": eval_res["led_current"],
        "led_voltage": eval_res["led_voltage"],
        "led_power": eval_res["led_power"],
        "led_shared_red": eval_res["led_shared_red"],
        "white_led": eval_res["white_led"],
        "red_led": eval_res["red_led"],
        "status": eval_res["status"],
        "event_count": state.change_detector.event_counter,
        "scenario": scenario,
        "health_score": hlth["health_score"],
        "anomaly_score": anom["anomaly_score"],
        "threshold": state.current_threshold,
        "mode": "SIMULATED",
    }

    state.readings_history.append(sample)
    if len(state.readings_history) > 150:
        state.readings_history.pop(0)

    return sample


def get_full_payload() -> Dict:
    """Builds full JSON payload for REST & WebSocket clients."""
    latest = state.readings_history[-1] if state.readings_history else None
    
    # Statistical aggregates
    count = len(state.readings_history)
    avg_curr = (
        sum(h["current"] for h in state.readings_history) / count if count > 0 else 0.0
    )
    max_curr = max((h["current"] for h in state.readings_history), default=0.0)

    # Event counts by severity
    events_list = [e.to_dict() for e in state.change_detector.events_history]
    normal_changes = sum(1 for e in state.change_detector.events_history if e.event_type == "NORMAL_CHANGE")
    heavy_changes = sum(1 for e in state.change_detector.events_history if e.event_type == "HEAVY_CHANGE")
    overcurrent_events = sum(1 for e in state.change_detector.events_history if e.event_type == "OVERCURRENT")

    energy_data = state.energy_tracker.compute_metrics(state.readings_history, state.update_interval)

    # 4-LED indicators
    four_leds = {
        "current_increase": latest.get("led_current", 0) if latest else 0,
        "voltage_increase": latest.get("led_voltage", 0) if latest else 0,
        "power_increase": latest.get("led_power", 0) if latest else 0,
        "shared_red_warning": latest.get("led_shared_red", 0) if latest else 0,
    }

    # Time until next 5-second sample
    elapsed = time.time() - state.last_step_timestamp
    next_in = max(0.0, round(state.update_interval - (elapsed % state.update_interval), 1))

    return {
        "simulation_active": state.simulation_active,
        "simulation_paused": state.simulation_paused,
        "scenario": state.twin.scenario,
        "current_threshold": state.current_threshold,
        "threshold_normal_change": state.threshold_normal_change,
        "threshold_heavy_change": state.threshold_heavy_change,
        "tol_current": state.tol_current,
        "tol_voltage": state.tol_voltage,
        "tol_power": state.tol_power,
        "serial_port": state.serial_port,
        "baud_rate": state.baud_rate,
        "esp32_connected": state.serial_manager.is_connected(),
        "latest": latest,
        "history": state.readings_history[-40:],
        "events": events_list[:30],
        "total_events": state.change_detector.event_counter,
        "normal_changes_count": normal_changes,
        "heavy_changes_count": heavy_changes,
        "overcurrent_count": overcurrent_events,
        "avg_current": round(avg_curr, 2),
        "max_current": round(max_curr, 2),
        "energy": energy_data,
        "four_leds": four_leds,
        "update_interval": state.update_interval,
        "next_update_in": next_in,
        "mode": "SIMULATED",
    }


async def broadcast_telemetry():
    """Broadcasts current state payload to all active WebSockets."""
    if not state.connected_websockets:
        return
    payload = json.dumps(get_full_payload())
    dead = set()
    for ws in state.connected_websockets:
        try:
            await ws.send_text(payload)
        except Exception:
            dead.add(ws)
    state.connected_websockets.difference_update(dead)


async def background_simulation_task():
    """Background monitoring loop running exactly once every 5.0 seconds."""
    while True:
        try:
            if state.simulation_active and not state.simulation_paused:
                execute_step()
                await broadcast_telemetry()
            await asyncio.sleep(state.update_interval)
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"[Simulation loop error]: {e}")
            await asyncio.sleep(1.0)


# ==============================================================================
# FastAPI Lifecycle
# ==============================================================================
@app.on_event("startup")
async def startup_event():
    ok, msg = state.serial_manager.auto_connect_available()
    if ok:
        state.serial_port = state.serial_manager.port
        print(f"[SERIAL OK] {msg}")
    else:
        detailed = state.serial_manager.get_detailed_ports()
        print(f"[SERIAL NOTICE] {msg}")
        if detailed:
            print(f"[SERIAL PORTS] Detected active system ports: {[d['port'] for d in detailed]}")
    state.sim_task = asyncio.create_task(background_simulation_task())


@app.on_event("shutdown")
async def shutdown_event():
    if state.sim_task:
        state.sim_task.cancel()
    state.serial_manager.disconnect()


# ==============================================================================
# WebSocket & REST Endpoints
# ==============================================================================
@app.websocket("/ws")
async def websocket_handler(websocket: WebSocket):
    await websocket.accept()
    state.connected_websockets.add(websocket)
    await websocket.send_text(json.dumps(get_full_payload()))
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        state.connected_websockets.discard(websocket)
    except Exception:
        state.connected_websockets.discard(websocket)


@app.get("/api/status")
def get_status():
    return get_full_payload()


@app.get("/api/ports")
def get_ports():
    return {
        "ports": SerialManager.get_available_ports(),
        "detailed": SerialManager.get_detailed_ports(),
        "active_port": state.serial_port,
        "is_connected": state.serial_manager.is_connected(),
    }


class ControlAction(BaseModel):
    action: str  # "start" | "pause" | "resume" | "stop" | "step" | "reset"

@app.post("/api/control")
async def control_simulation(body: ControlAction):
    act = body.action.lower()
    if act == "start":
        ok, msg = state.serial_manager.auto_connect_available()
        if ok:
            state.serial_port = state.serial_manager.port
            print(f"[SERIAL OK] {msg}")
        else:
            print(f"[SERIAL NOTICE] {msg}")
        state.simulation_active = True
        state.simulation_paused = False
        if not state.readings_history:
            execute_step()
    elif act == "pause":
        state.simulation_paused = True
    elif act == "resume":
        state.simulation_paused = False
    elif act == "stop":
        state.simulation_active = False
        state.simulation_paused = False
        state.serial_manager.disconnect()
    elif act == "step":
        execute_step()
    elif act == "reset":
        state.change_detector.reset_session()
        state.readings_history.clear()
        state.energy_tracker = EnergyTracker(tariff_rate=0.15)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown action: {act}")

    await broadcast_telemetry()
    return get_full_payload()


class ScenarioAction(BaseModel):
    scenario: str

@app.post("/api/scenario")
async def set_scenario(body: ScenarioAction):
    state.twin.set_scenario(body.scenario)
    await broadcast_telemetry()
    return {"status": "ok", "scenario": state.twin.scenario}


class SettingsAction(BaseModel):
    threshold: Optional[float] = None
    threshold_normal: Optional[float] = None
    threshold_heavy: Optional[float] = None
    tol_current: Optional[float] = None
    tol_voltage: Optional[float] = None
    tol_power: Optional[float] = None
    serial_port: Optional[str] = None
    baud_rate: Optional[int] = None

@app.post("/api/settings")
async def update_settings(body: SettingsAction):
    if body.threshold is not None:
        state.current_threshold = max(0.5, body.threshold)
        state.change_detector.threshold_overcurrent = state.current_threshold
        state.health_model.hard_threshold = state.current_threshold
    if body.threshold_normal is not None:
        state.threshold_normal_change = max(0.1, body.threshold_normal)
        state.change_detector.threshold_normal = state.threshold_normal_change
    if body.threshold_heavy is not None:
        state.threshold_heavy_change = max(state.threshold_normal_change, body.threshold_heavy)
        state.change_detector.threshold_heavy = state.threshold_heavy_change
    if body.tol_current is not None:
        state.tol_current = max(0.01, body.tol_current)
        state.change_detector.tol_current = state.tol_current
    if body.tol_voltage is not None:
        state.tol_voltage = max(0.1, body.tol_voltage)
        state.change_detector.tol_voltage = state.tol_voltage
    if body.tol_power is not None:
        state.tol_power = max(1.0, body.tol_power)
        state.change_detector.tol_power = state.tol_power
    if body.serial_port is not None:
        state.serial_port = body.serial_port
        state.serial_manager.port = body.serial_port
    if body.baud_rate is not None:
        state.baud_rate = body.baud_rate
        state.serial_manager.baud_rate = body.baud_rate

    await broadcast_telemetry()
    return get_full_payload()


def normalize_date_range(start_date: Optional[str], end_date: Optional[str]):
    """Normalizes YYYY-MM-DD date filters to full-day ISO timestamp boundaries."""
    start_str = start_date
    end_str = end_date
    if start_str and len(start_str) == 10:
        start_str = start_str + "T00:00:00"
    if end_str and len(end_str) == 10:
        end_str = end_str + "T23:59:59.999999"
    return start_str, end_str


@app.get("/api/history")
def get_history(limit: int = 100, start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Returns stored telemetry history with optional date filtering."""
    history = state.readings_history
    start_str, end_str = normalize_date_range(start_date, end_date)
    if start_str:
        history = [h for h in history if h.get("timestamp_iso", "") >= start_str]
    if end_str:
        history = [h for h in history if h.get("timestamp_iso", "") <= end_str]
    return {
        "total_records": len(history),
        "readings": history[-limit:] if limit > 0 else history,
    }


@app.get("/api/events")
def get_events(limit: int = 50):
    """Returns abnormal and change events list."""
    events = [e.to_dict() for e in state.change_detector.events_history]
    return {
        "total_events": len(events),
        "events": events[-limit:] if limit > 0 else events,
    }


@app.get("/api/report")
def get_report_data(start_date: Optional[str] = None, end_date: Optional[str] = None):
    """Computes comprehensive report metrics and trend series for a specified date window."""
    readings = state.readings_history
    start_str, end_str = normalize_date_range(start_date, end_date)
    if start_str:
        readings = [r for r in readings if r.get("timestamp_iso", "") >= start_str]
    if end_str:
        readings = [r for r in readings if r.get("timestamp_iso", "") <= end_str]

    # If date filter returned no results, fallback to all available history if available
    if not readings and not start_date and not end_date:
        readings = state.readings_history

    events = [e.to_dict() for e in state.change_detector.events_history]
    if start_str:
        events = [e for e in events if e.get("timestamp_iso", "") >= start_str]
    if end_str:
        events = [e for e in events if e.get("timestamp_iso", "") <= end_str]

    currents = [r["current"] for r in readings] if readings else [0.0]
    voltages = [r["voltage"] for r in readings] if readings else [230.0]
    powers = [r["power"] for r in readings] if readings else [0.0]

    overcurrent_events = [e for e in events if e.get("event_type") == "OVERCURRENT"]
    normal_changes = [e for e in events if e.get("event_type") == "NORMAL_CHANGE"]
    heavy_changes = [e for e in events if e.get("event_type") == "HEAVY_CHANGE"]

    energy_metrics = state.energy_tracker.compute_metrics(readings, state.update_interval)
    total_kwh = energy_metrics.get("cumulative_kwh", 0.0)
    total_cost = energy_metrics.get("session_cost", 0.0)
    carbon_kg = energy_metrics.get("carbon_footprint_kg", 0.0)

    now = datetime.datetime.now()
    generated_at = now.strftime("%Y-%m-%d %H:%M:%S")

    period_start = readings[0]["timestamp_iso"] if readings else now.isoformat()
    period_end = readings[-1]["timestamp_iso"] if readings else now.isoformat()

    return {
        "project_name": "VoltSense",
        "generated_at": generated_at,
        "period_start": period_start,
        "period_end": period_end,
        "total_samples": len(readings),
        "total_events": len(events),
        "overcurrent_count": len(overcurrent_events),
        "normal_changes_count": len(normal_changes),
        "heavy_changes_count": len(heavy_changes),
        "metrics": {
            "current": {
                "avg": round(statistics.mean(currents), 2) if currents else 0.0,
                "peak": round(max(currents), 2) if currents else 0.0,
                "min": round(min(currents), 2) if currents else 0.0,
                "threshold": state.current_threshold,
            },
            "voltage": {
                "avg": round(statistics.mean(voltages), 1) if voltages else 0.0,
                "peak": round(max(voltages), 1) if voltages else 0.0,
                "min": round(min(voltages), 1) if voltages else 0.0,
            },
            "power": {
                "avg": round(statistics.mean(powers), 1) if powers else 0.0,
                "peak": round(max(powers), 1) if powers else 0.0,
                "min": round(min(powers), 1) if powers else 0.0,
            },
            "energy": {
                "total_kwh": round(total_kwh, 4),
                "total_cost": round(total_cost, 2),
                "carbon_kg": round(carbon_kg, 3),
            },
        },
        "readings_sample": readings[-60:],
        "events": events[-30:],
        "mode": "SIMULATED",
    }

