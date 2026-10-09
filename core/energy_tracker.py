"""
WattWise Edge - Energy Intelligence & Cost Tracker
==================================================
Performs numerical integration of estimated power readings to compute
cumulative energy usage (kWh), real-time cost, and projected run rates.

NOTE: Derived from simulated telemetry (Voltage * Current * 0.95 PF);
      all energy values are synthetic estimates.
"""

from typing import Dict, List


class EnergyTracker:
    """Computes integrated energy consumption (kWh) and tariff cost modeling."""

    def __init__(self, tariff_rate: float = 0.15, currency_symbol: str = "$"):
        self.tariff_rate = tariff_rate
        self.currency_symbol = currency_symbol
        self.cumulative_kwh = 0.0
        self.total_runtime_seconds = 0.0

    def reset(self):
        """Resets the energy meter counters."""
        self.cumulative_kwh = 0.0
        self.total_runtime_seconds = 0.0

    def add_step(self, power_watts: float, interval_seconds: float = 2.0) -> float:
        """
        Integrates a discrete power sample into the cumulative energy total.
        Energy (kWh) = Power (W) * Time (s) / (3600 * 1000)
        """
        delta_kwh = (power_watts * interval_seconds) / (3600.0 * 1000.0)
        self.cumulative_kwh += delta_kwh
        self.total_runtime_seconds += interval_seconds
        return self.cumulative_kwh

    def compute_metrics(self, history: List[Dict], interval_seconds: float = 2.0) -> Dict:
        """
        Recalculates comprehensive energy analytics across the session history.
        """
        if not history:
            return {
                "cumulative_kwh": 0.0,
                "session_cost": 0.0,
                "avg_power_watts": 0.0,
                "peak_power_watts": 0.0,
                "hourly_projected_cost": 0.0,
                "daily_projected_cost": 0.0,
                "runtime_str": "0s",
                "carbon_footprint_kg": 0.0,
            }

        powers = [h.get("power", 0.0) for h in history]
        avg_power = sum(powers) / len(powers)
        peak_power = max(powers)

        # Total energy (kWh)
        total_kwh = sum((p * interval_seconds) / (3600.0 * 1000.0) for p in powers)
        session_cost = total_kwh * self.tariff_rate

        # Hourly projected rate = (avg_power in kW) * tariff
        hourly_projected = (avg_power / 1000.0) * self.tariff_rate
        daily_projected = hourly_projected * 24.0

        total_sec = len(history) * interval_seconds
        minutes = int(total_sec // 60)
        seconds = int(total_sec % 60)
        runtime_str = f"{minutes}m {seconds}s" if minutes > 0 else f"{seconds}s"

        # Estimated CO2 footprint (~0.42 kg CO2 per kWh average grid factor)
        carbon_kg = total_kwh * 0.42

        return {
            "cumulative_kwh": round(total_kwh, 5),
            "session_cost": round(session_cost, 4),
            "avg_power_watts": round(avg_power, 1),
            "peak_power_watts": round(peak_power, 1),
            "hourly_projected_cost": round(hourly_projected, 4),
            "daily_projected_cost": round(daily_projected, 3),
            "runtime_str": runtime_str,
            "carbon_footprint_kg": round(carbon_kg, 4),
        }
