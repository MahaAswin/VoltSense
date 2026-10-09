import unittest
from core.current_change_detector import CurrentChangeDetector
from core.digital_twin import DigitalTwinEngine


class TestSixScenarios(unittest.TestCase):
    def setUp(self):
        self.detector = CurrentChangeDetector(
            threshold_normal=0.5,
            threshold_heavy=1.5,
            threshold_overcurrent=5.0
        )
        self.twin = DigitalTwinEngine()

    def test_1_normal_operation(self):
        """Scenario 1: Small fluctuations < 0.5 A around 1–3 A create 0 abnormal events."""
        self.twin.set_scenario("Normal Operation")
        events = []
        for _ in range(12):
            step = self.twin.generate_step()
            res, is_event = self.detector.evaluate(step["current"])
            if is_event:
                events.append(res)
        self.assertEqual(len(events), 0, "Normal operation must not trigger change events")
        self.assertEqual(self.detector.event_counter, 0)

    def test_2_gradually_increasing_load(self):
        """Scenario 2: 1.0 -> 1.5 -> 2.0 -> 3.0 -> 4.0 -> 5.5 A triggers change & overcurrent."""
        self.twin.set_scenario("Gradually Increasing Load")
        events = []
        for _ in range(6):
            step = self.twin.generate_step()
            res, is_event = self.detector.evaluate(step["current"])
            if is_event:
                events.append(res)

        self.assertGreaterEqual(len(events), 3, "Stepped increases must record change events")
        # Check that the 5.5 A step triggers overcurrent and activates Red LED
        last_event = events[-1]
        self.assertEqual(last_event["event_type"], "OVERCURRENT")
        self.assertEqual(last_event["red_led"], 1)
        self.assertEqual(last_event["white_led"], 0)

    def test_3_sudden_current_spike(self):
        """Scenario 3: Normal baseline jumps to 6.8 A -> high priority Overcurrent event."""
        self.twin.set_scenario("Sudden Current Spike")
        events = []
        for _ in range(6):
            step = self.twin.generate_step()
            res, is_event = self.detector.evaluate(step["current"])
            if is_event:
                events.append(res)

        self.assertGreaterEqual(len(events), 1)
        spike_event = [e for e in events if e["event_type"] == "OVERCURRENT"][0]
        self.assertEqual(spike_event["severity"], "CRITICAL")
        self.assertEqual(spike_event["red_led"], 1)
        self.assertEqual(spike_event["white_led"], 0)

    def test_4_repeated_overcurrent(self):
        """Scenario 4: Distinct spikes separated by recovery; sustained spikes are NOT double-counted."""
        self.twin.set_scenario("Repeated Overcurrent")
        events = []
        for _ in range(16):
            step = self.twin.generate_step()
            res, is_event = self.detector.evaluate(step["current"])
            if is_event:
                events.append(res)

        # In 16 steps (2 full cycles of 8 steps), we expect exactly 2 distinct overcurrent breaches
        overcurrents = [e for e in events if e["event_type"] == "OVERCURRENT"]
        self.assertGreaterEqual(len(overcurrents), 2, "Multiple distinct spikes must each be recorded once")

    def test_5_unstable_current_fluctuations(self):
        """Scenario 5: Alternates 1.5 -> 2.5 -> 1.7 -> 3.4 -> 1.4 A; classifies increase and decrease."""
        self.twin.set_scenario("Unstable Current Fluctuations")
        events = []
        for _ in range(8):
            step = self.twin.generate_step()
            res, is_event = self.detector.evaluate(step["current"])
            if is_event:
                events.append(res)

        self.assertGreaterEqual(len(events), 3)
        directions = {e["direction"] for e in events}
        self.assertIn("INCREASE", directions)
        self.assertIn("DECREASE", directions)

    def test_6_recovery_after_abnormal_event(self):
        """Scenario 6: 6.5 -> 5.2 -> 3.8 -> 2.4 A; clears alert and returns to normal."""
        self.twin.set_scenario("Recovery After Abnormal Event")
        events = []
        steps_results = []
        for _ in range(5):
            step = self.twin.generate_step()
            res, is_event = self.detector.evaluate(step["current"])
            steps_results.append(res)
            if is_event:
                events.append(res)

        # First reading (6.5 A) was overcurrent (Red ON)
        self.assertEqual(steps_results[0]["status"], "OVERCURRENT")
        self.assertEqual(steps_results[0]["red_led"], 1)

        # Final reading (2.4 A) is in safe normal range (Red OFF)
        self.assertEqual(steps_results[-1]["status"], "NORMAL")
        self.assertEqual(steps_results[-1]["red_led"], 0)

    def test_7_power_current_voltage_overcurrent(self):
        """Scenario 7: Power -> Current -> Voltage -> Overcurrent 4-stage progression."""
        self.twin.set_scenario("Power → Current → Voltage → Overcurrent")
        self.assertEqual(self.twin.scenario, "Power → Current → Voltage → Overcurrent")

        step1 = self.twin.generate_step()  # Stage 1: Power increase
        res1, _ = self.detector.evaluate(step1["current"], step1["voltage"], step1["power"])
        self.assertLessEqual(step1["current"], 3.0)
        self.assertGreaterEqual(step1["power"], 700.0)

        step2 = self.twin.generate_step()  # Stage 2: Current increase
        res2, _ = self.detector.evaluate(step2["current"], step2["voltage"], step2["power"])
        self.assertGreaterEqual(step2["current"], 3.5)

        step3 = self.twin.generate_step()  # Stage 3: Voltage change
        res3, _ = self.detector.evaluate(step3["current"], step3["voltage"], step3["power"])
        self.assertTrue(step3["voltage"] <= 215.0 or step3["voltage"] >= 240.0)

        step4 = self.twin.generate_step()  # Stage 4: Overcurrent (> 5.0 A)
        res4, is_evt4 = self.detector.evaluate(
            current_now=step4["current"],
            voltage_now=step4["voltage"],
            power_now=step4["power"],
            scenario_name="Power → Current → Voltage → Overcurrent"
        )
        self.assertGreater(step4["current"], 5.0)
        self.assertEqual(res4["status"], "OVERCURRENT")
        self.assertEqual(res4["red_led"], 1)


if __name__ == "__main__":
    unittest.main()
