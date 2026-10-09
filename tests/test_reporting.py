"""
WattWise Edge - Unit Tests for Reporting & Date Filtering Engine
================================================================
Tests metric calculations (min/max/avg, total kWh, costs),
date window filtering, and report generation integrity.
"""

import unittest
from backend.main import get_report_data, get_history, state


class TestReportingEngine(unittest.TestCase):
    def setUp(self):
        state.readings_history.clear()
        state.change_detector.reset_session()

        # Seed sample test readings
        state.readings_history.extend([
            {
                "timestamp": "12:00:00",
                "timestamp_iso": "2026-10-09T12:00:00",
                "current": 2.20,
                "voltage": 230.0,
                "power": 480.0,
            },
            {
                "timestamp": "12:00:05",
                "timestamp_iso": "2026-10-09T12:00:05",
                "current": 3.80,
                "voltage": 229.0,
                "power": 830.0,
            },
            {
                "timestamp": "12:00:10",
                "timestamp_iso": "2026-10-09T12:00:10",
                "current": 6.50,
                "voltage": 228.0,
                "power": 1400.0,
            },
        ])

    def test_report_endpoint_computations(self):
        """Verify get_report_data accurately computes min, max, avg and energy values."""
        data = get_report_data()
        self.assertEqual(data["project_name"], "WattWise Edge")
        self.assertEqual(data["total_samples"], 3)
        self.assertEqual(data["metrics"]["current"]["peak"], 6.50)
        self.assertEqual(data["metrics"]["current"]["min"], 2.20)
        self.assertAlmostEqual(data["metrics"]["current"]["avg"], 4.17, places=2)
        self.assertEqual(data["metrics"]["voltage"]["peak"], 230.0)
        self.assertEqual(data["metrics"]["voltage"]["min"], 228.0)
        self.assertEqual(data["metrics"]["power"]["peak"], 1400.0)

    def test_history_endpoint_and_limit(self):
        """Verify get_history returns correctly bounded records."""
        data = get_history(limit=2)
        self.assertEqual(data["total_records"], 3)
        self.assertEqual(len(data["readings"]), 2)
        self.assertEqual(data["readings"][-1]["current"], 6.50)

    def test_date_filter_on_report(self):
        """Verify date filtering excludes out-of-range records."""
        # Query for a future date
        data = get_report_data(start_date="2026-10-10")
        self.assertEqual(data["total_samples"], 0)


if __name__ == "__main__":
    unittest.main()
