"""
WattWise Edge - Machine Health Index & Predictive Maintenance Model
===================================================================
Calculates a composite prototype Health Score (0 - 100) based on load stability,
anomaly history, overcurrent stress, and baseline alignment.

NOTE: Prototype engineering estimate; not a certified industrial diagnostic tool.
"""

from typing import Dict, List


class MachineHealthModel:
    """Calculates prototype machine health metrics and actionable inspection suggestions."""

    def __init__(self, hard_threshold: float = 5.0):
        self.hard_threshold = hard_threshold
        self.last_score = 100.0

    def compute_health(self, history: List[Dict], latest_anomaly_score: float) -> Dict:
        """
        Calculates composite machine health index from session history.
        Returns:
            dict containing:
            - health_score: float (0 - 100)
            - status_level: 'EXCELLENT' | 'GOOD' | 'DEGRADED' | 'CRITICAL'
            - delta: change from previous sample
            - contributing_factors: list of dicts {factor, impact, category}
            - recommendations: list of actionable maintenance tips
        """
        if not history:
            return {
                "health_score": 100.0,
                "status_level": "EXCELLENT",
                "delta": 0.0,
                "contributing_factors": [
                    {"factor": "Session Baseline Initialized", "impact": "0 pts", "type": "neutral"}
                ],
                "recommendations": ["Awaiting live telemetry to evaluate machine operating health."],
            }

        score = 100.0
        factors = []
        recommendations = []

        # 1. Overcurrent incident penalty
        overcurrent_samples = sum(1 for h in history if h.get("current", 0) > self.hard_threshold)
        if overcurrent_samples > 0:
            penalty = min(40.0, overcurrent_samples * 8.0)
            score -= penalty
            factors.append({
                "factor": f"{overcurrent_samples} overcurrent event(s) (> {self.hard_threshold:.1f}A)",
                "impact": f"-{penalty:.0f} pts",
                "type": "negative",
            })
            recommendations.append("Inspect motor windings and check for excessive mechanical shaft binding.")
        else:
            factors.append({
                "factor": "Zero hard threshold breaches recorded",
                "impact": "Optimal",
                "type": "positive",
            })

        # 2. Anomaly score impact
        if latest_anomaly_score > 30.0:
            anomaly_penalty = (latest_anomaly_score / 100.0) * 25.0
            score -= anomaly_penalty
            factors.append({
                "factor": f"Elevated statistical anomaly score ({latest_anomaly_score:.1f}%)",
                "impact": f"-{anomaly_penalty:.0f} pts",
                "type": "negative",
            })
            recommendations.append("Review recent waveform fluctuations in AI Diagnostics to identify drift.")

        # 3. Peak load stress
        max_current = max(h.get("current", 0) for h in history)
        if max_current >= (self.hard_threshold * 0.85):
            stress_penalty = min(20.0, ((max_current - (self.hard_threshold * 0.85)) / 2.0) * 20.0)
            score -= stress_penalty
            factors.append({
                "factor": f"Peak load reached {max_current:.2f}A (near safety limit)",
                "impact": f"-{stress_penalty:.0f} pts",
                "type": "warning",
            })
            recommendations.append("Verify cooling fan airflow and ambient temperature around motor casing.")

        # 4. Supply Voltage Stability
        voltages = [h.get("voltage", 230.0) for h in history[-10:]]
        avg_v = sum(voltages) / len(voltages)
        if abs(avg_v - 230.0) < 3.0:
            factors.append({
                "factor": f"Stable mains voltage ({avg_v:.1f}V nominal)",
                "impact": "Good",
                "type": "positive",
            })

        # Final score bounding
        score = max(5.0, min(100.0, round(score, 1)))
        delta = round(score - self.last_score, 1)
        self.last_score = score

        if score >= 85.0:
            status_level = "EXCELLENT"
        elif score >= 70.0:
            status_level = "GOOD"
        elif score >= 50.0:
            status_level = "DEGRADED"
        else:
            status_level = "CRITICAL"

        if not recommendations:
            recommendations.append("All mechanical and electrical parameters are operating within ideal tolerances.")

        return {
            "health_score": score,
            "status_level": status_level,
            "delta": delta,
            "contributing_factors": factors,
            "recommendations": recommendations,
        }
