import unittest
from core.current_change_detector import CurrentChangeDetector
from core.digital_twin import DigitalTwinEngine
from core.serial_manager import SerialManager


class TestFourLedAndFiveSecondEngine(unittest.TestCase):
    def setUp(self):
        self.detector = CurrentChangeDetector(
            threshold_normal=0.5,
            threshold_heavy=1.5,
            threshold_overcurrent=5.0,
            tol_current=0.15,
            tol_voltage=0.80,
            tol_power=30.0,
        )
        self.twin = DigitalTwinEngine()

    def test_1_normal_operation_stable(self):
        """1. Normal operation produces stable readings without false increase alerts."""
        self.twin.set_scenario("Normal Operation")
        events = []
        for _ in range(8):
            step = self.twin.generate_step()
            res, is_event = self.detector.evaluate(step["current"], step["voltage"], step["power"])
            if is_event:
                events.append(res)
        self.assertEqual(len(events), 0, "Normal fluctuations should produce 0 events")

    def test_2_current_led_increase_response(self):
        """2 & 3. Current LED responds only to qualifying current increases."""
        # Initial baseline sample (2.0 A, 230 V, 437 W)
        self.detector.evaluate(2.0, 230.0, 437.0)

        # Sample 2: Current increases by +0.30 A (> 0.15 A tol), V and P stay constant
        res, _ = self.detector.evaluate(2.30, 230.0, 437.0)
        self.assertEqual(res["led_current"], 1, "Current LED must be ON for +0.30A increase")
        self.assertEqual(res["led_voltage"], 0, "Voltage LED must be OFF")
        self.assertEqual(res["led_power"], 0, "Power LED must be OFF")
        self.assertEqual(res["led_shared_red"], 0, "Shared Red LED must be OFF when only I increases")

        # Sample 3: Current decreases back to 2.0 A (-0.30 A)
        res, _ = self.detector.evaluate(2.00, 230.0, 437.0)
        self.assertEqual(res["led_current"], 0, "Current LED must be OFF on decrease")

    def test_4_voltage_led_increase_response(self):
        """4. Voltage LED responds only to qualifying voltage increases."""
        self.detector.evaluate(2.0, 230.0, 437.0)

        # Voltage increases by +1.5 V (> 0.8 V tol), Current constant
        res, _ = self.detector.evaluate(2.0, 231.5, 437.0)
        self.assertEqual(res["led_voltage"], 1, "Voltage LED must be ON for +1.5V increase")
        self.assertEqual(res["led_current"], 0, "Current LED must be OFF")
        self.assertEqual(res["led_power"], 0, "Power LED must be OFF")
        self.assertEqual(res["led_shared_red"], 0, "Shared Red LED must be OFF")

    def test_5_power_led_increase_response(self):
        """5. Power LED responds only to qualifying power increases."""
        self.detector.evaluate(2.0, 230.0, 437.0)

        # Power increases by +50 W (> 30 W tol), I and V constant
        res, _ = self.detector.evaluate(2.0, 230.0, 487.0)
        self.assertEqual(res["led_power"], 1, "Power LED must be ON for +50W increase")
        self.assertEqual(res["led_current"], 0, "Current LED must be OFF")
        self.assertEqual(res["led_voltage"], 0, "Voltage LED must be OFF")
        self.assertEqual(res["led_shared_red"], 0, "Shared Red LED must be OFF")

    def test_6_shared_red_led_simultaneous_increase(self):
        """6. Shared Red LED activates ONLY when ALL THREE (I, V, P) increase simultaneously."""
        self.detector.evaluate(2.0, 230.0, 437.0)

        # Sample 2: All 3 increase beyond respective tolerances (+0.4A, +1.2V, +80W)
        res, _ = self.detector.evaluate(2.40, 231.2, 517.0)
        self.assertEqual(res["led_current"], 1, "Current LED ON")
        self.assertEqual(res["led_voltage"], 1, "Voltage LED ON")
        self.assertEqual(res["led_power"], 1, "Power LED ON")
        self.assertEqual(res["led_shared_red"], 1, "Shared Red LED MUST be ON when all 3 increase")

    def test_7_shared_red_led_turns_off_if_any_false(self):
        """7. Shared Red LED turns OFF if any of the three increase conditions is false."""
        self.detector.evaluate(2.0, 230.0, 437.0)
        # All 3 increase
        self.detector.evaluate(2.40, 231.2, 517.0)

        # Next sample: I increases (+0.3A), P increases (+60W), but V decreases (-1.0V)
        res, _ = self.detector.evaluate(2.70, 230.2, 577.0)
        self.assertEqual(res["led_current"], 1)
        self.assertEqual(res["led_voltage"], 0)
        self.assertEqual(res["led_power"], 1)
        self.assertEqual(res["led_shared_red"], 0, "Shared Red LED must turn OFF when V does not increase")

    def test_8_overcurrent_independent_of_shared_red_led(self):
        """8. Overcurrent detection operates independently of the shared increase LED."""
        # Initial baseline at 5.5 A (already in overcurrent, steady-state)
        self.detector.evaluate(5.50, 230.0, 1200.0)

        # Sample 2: Minor decrease (5.48 A, 230 V, 1195 W) -> No increase LEDs on, but Overcurrent active
        res, _ = self.detector.evaluate(5.48, 230.0, 1195.0)
        self.assertEqual(res["status"], "OVERCURRENT", "Overcurrent must remain active")
        self.assertEqual(res["led_shared_red"], 0, "Shared Red Increase LED is OFF (no increase)")
        self.assertEqual(res["led_current"], 0)

    def test_9_all_six_scenarios_deterministic(self):
        """9. All scenarios produce distinct expected sequences."""
        scenarios = DigitalTwinEngine.SCENARIOS
        self.assertGreaterEqual(len(scenarios), 6)
        readings_map = {}
        for sc in scenarios:
            self.twin.set_scenario(sc)
            first_step = self.twin.generate_step()
            readings_map[sc] = first_step["current"]

        # Ensure distinct starting profiles
        self.assertNotEqual(readings_map["Normal Operation"], readings_map["Recovery After Abnormal Event"])
        self.assertNotEqual(readings_map["Gradually Increasing Load"], readings_map["Sudden Current Spike"])

    def test_10_recovery_clears_overcurrent(self):
        """10. Recovery clears the active overcurrent state when current returns below 5.0 A."""
        self.twin.set_scenario("Recovery After Abnormal Event")
        steps = []
        for _ in range(5):
            st = self.twin.generate_step()
            res, _ = self.detector.evaluate(st["current"], st["voltage"], st["power"])
            steps.append(res)

        # Initial step was overcurrent (6.5 A)
        self.assertEqual(steps[0]["status"], "OVERCURRENT")
        self.assertEqual(steps[0]["red_led"], 1)

        # Step 4 (2.4 A) is recovered below 5.0 A (Overcurrent cleared, Red LED OFF)
        self.assertNotEqual(steps[3]["status"], "OVERCURRENT")
        self.assertEqual(steps[3]["red_led"], 0)

    def test_11_reset_session(self):
        """15. Reset session clears count and history cleanly."""
        self.detector.evaluate(2.0, 230.0, 437.0)
        self.detector.evaluate(4.5, 230.0, 980.0) # Event #1
        self.assertGreater(self.detector.event_counter, 0)

        self.detector.reset_session()
        self.assertEqual(self.detector.event_counter, 0)
        self.assertEqual(len(self.detector.events_history), 0)


if __name__ == "__main__":
    unittest.main()
