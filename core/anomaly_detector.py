"""
WattWise Edge - Explainable Anomaly Detection Engine
===================================================
Uses statistical rolling metrics (mean, std dev, z-score) and baseline comparison
to identify subtle electrical anomalies before hard overcurrent thresholds trip.

NOTE: Prototype statistical model for edge research; does not claim to predict
      all real industrial machine breakdown modes.
"""

import math
import statistics
from typing import Dict, List


class AnomalyDetector:
    """Statistical rolling anomaly detector with explainable pattern categorization."""

    def __init__(self, baseline_current: float = 2.5, window_size: int = 15):
        self.baseline_current = baseline_current
        self.window_size = window_size

    def evaluate(self, history: List[Dict], current_reading: float, hard_threshold: float = 5.0) -> Dict:
        """
        Analyzes the latest reading against rolling session history.
        Returns:
            dict containing:
            - anomaly_score: 0 - 100
            - severity: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL'
            - pattern: identified pattern tag
            - explanation: plain-English diagnostic reasoning
            - rolling_mean: float
            - rolling_std: float
            - z_score: float
        """
        if not history or len(history) < 3:
            return {
                "anomaly_score": 0.0,
                "severity": "LOW",
                "pattern": "Awaiting Baseline Data",
                "explanation": "Insufficient historical points (< 3 samples). Monitoring initial baseline.",
                "rolling_mean": current_reading,
                "rolling_std": 0.0,
                "z_score": 0.0,
                "is_statistical_anomaly": False,
            }

        # Extract recent current readings for rolling statistics
        recent_currents = [h["current"] for h in history[-self.window_size:]]
        mean_val = statistics.mean(recent_currents)
        std_val = statistics.stdev(recent_currents) if len(recent_currents) > 1 else 0.05
        if std_val < 0.05:
            std_val = 0.05  # Avoid zero-division

        # Calculate Z-score relative to rolling window
        z_score = abs(current_reading - mean_val) / std_val

        # 1. Check for Sudden Spike (Z-score > 2.5 or surge > 1.8x baseline)
        is_spike = z_score > 2.5 or (current_reading > self.baseline_current * 1.8)

        # 2. Check for Unusual High Variability (std_val > 0.85 A)
        is_high_variance = std_val > 0.85

        # 3. Check for Sustained Drift / Elevation from Baseline
        is_sustained_drift = mean_val > (self.baseline_current * 1.4)

        # 4. Check for Repeated Abnormal Events (count in last 10 readings > 4.5A)
        recent_spikes_count = sum(1 for h in history[-10:] if h["current"] >= 4.5)
        is_repeated = recent_spikes_count >= 3

        # Calculate composite anomaly score (0 - 100)
        score = 0.0

        # Contribution 1: Z-score divergence
        score += min(35.0, z_score * 10.0)

        # Contribution 2: Baseline elevation
        drift_ratio = max(0.0, (mean_val - self.baseline_current) / self.baseline_current)
        score += min(25.0, drift_ratio * 35.0)

        # Contribution 3: Instability / High variance
        score += min(20.0, (std_val / 1.5) * 20.0)

        # Contribution 4: Repeated abnormal count
        score += min(20.0, recent_spikes_count * 5.0)

        score = min(100.0, round(score, 1))

        # Determine Severity and Explainable Pattern Tag
        if score >= 75.0 or current_reading > hard_threshold:
            severity = "CRITICAL"
        elif score >= 50.0:
            severity = "HIGH"
        elif score >= 25.0:
            severity = "MODERATE"
        else:
            severity = "LOW"

        # Pattern identification & explanation synthesis
        patterns = []
        explanations = []

        if current_reading > hard_threshold:
            patterns.append("Hard Overcurrent Breach")
            explanations.append(f"Current {current_reading:.2f}A exceeds limit {hard_threshold:.1f}A.")

        if is_spike:
            patterns.append("Transient Current Spike")
            explanations.append(f"Statistical surge deviation (Z={z_score:.2f}).")

        if is_repeated:
            patterns.append("Repeated Stress Events")
            explanations.append(f"{recent_spikes_count} abnormal spikes recorded within last 10 samples.")

        if is_sustained_drift:
            patterns.append("Sustained Baseline Drift")
            explanations.append(f"Rolling average ({mean_val:.2f}A) is elevated above baseline ({self.baseline_current:.2f}A).")

        if is_high_variance:
            patterns.append("High Load Variability")
            explanations.append(f"Standard deviation (σ={std_val:.2f}A) indicates erratic load oscillations.")

        if not patterns:
            pattern_str = "Nominal Steady-State"
            explanation_str = "Operating current is consistent with statistical baseline expectations."
            is_anomaly = False
        else:
            pattern_str = " • ".join(patterns)
            explanation_str = " ".join(explanations)
            is_anomaly = score >= 35.0

        return {
            "anomaly_score": score,
            "severity": severity,
            "pattern": pattern_str,
            "explanation": explanation_str,
            "rolling_mean": round(mean_val, 2),
            "rolling_std": round(std_val, 2),
            "z_score": round(z_score, 2),
            "is_statistical_anomaly": is_anomaly,
        }
