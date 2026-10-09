"""
WattWise Edge - Automated Unit Tests for Current Change Detection Engine
"""

import unittest
from core.current_change_detector import CurrentChangeDetector


class TestCurrentChangeDetector(unittest.TestCase):

    def setUp(self):
        self.detector = CurrentChangeDetector(
            threshold_normal=0.5,
            threshold_heavy=1.5,
            threshold_overcurrent=5.0,
        )

    def test_case_1_small_changes_do_not_increment_event_count(self):
        """Test Case 1: Small changes (< 0.5 A) do not increment event count."""
        # Baseline initialization
        self.detector.evaluate(2.00)
        self.assertEqual(self.detector.event_counter, 0)

        # Minor fluctuations (+0.2A, -0.15A, +0.3A)
        res1, is_event1 = self.detector.evaluate(2.20)
        self.assertFalse(is_event1)
        self.assertEqual(self.detector.event_counter, 0)
        self.assertEqual(res1["event_type"], "NORMAL_FLUCTUATION")
        self.assertEqual(res1["white_led"], 0)
        self.assertEqual(res1["red_led"], 0)

        res2, is_event2 = self.detector.evaluate(2.05)
        self.assertFalse(is_event2)
        self.assertEqual(self.detector.event_counter, 0)

    def test_case_2_normal_change_creates_single_event_white_led(self):
        """Test Case 2: Normal change (0.5 <= ΔI < 1.5) creates exactly one event with White LED ON."""
        self.detector.evaluate(2.00)

        # Step from 2.00 A to 2.80 A (ΔI = +0.80 A)
        res, is_event = self.detector.evaluate(2.80)
        self.assertTrue(is_event)
        self.assertEqual(self.detector.event_counter, 1)
        self.assertEqual(res["event_type"], "NORMAL_CHANGE")
        self.assertEqual(res["direction"], "INCREASE")
        self.assertEqual(res["white_led"], 1)
        self.assertEqual(res["red_led"], 0)

    def test_case_3_heavy_increase_creates_event_red_led(self):
        """Test Case 3: Heavy increase (ΔI >= 1.5 A) activates Red LED and increments counter."""
        self.detector.evaluate(2.00)

        # Step from 2.00 A to 3.80 A (ΔI = +1.80 A)
        res, is_event = self.detector.evaluate(3.80)
        self.assertTrue(is_event)
        self.assertEqual(self.detector.event_counter, 1)
        self.assertEqual(res["event_type"], "HEAVY_CHANGE")
        self.assertEqual(res["direction"], "INCREASE")
        self.assertEqual(res["white_led"], 0)
        self.assertEqual(res["red_led"], 1)

    def test_case_4_heavy_decrease_detected_correctly(self):
        """Test Case 4: Heavy decrease (ΔI >= 1.5 A) is detected with direction=DECREASE and Red LED."""
        self.detector.evaluate(4.00)

        # Step from 4.00 A down to 2.20 A (ΔI = 1.80 A decrease)
        res, is_event = self.detector.evaluate(2.20)
        self.assertTrue(is_event)
        self.assertEqual(self.detector.event_counter, 1)
        self.assertEqual(res["event_type"], "HEAVY_CHANGE")
        self.assertEqual(res["direction"], "DECREASE")
        self.assertEqual(res["white_led"], 0)
        self.assertEqual(res["red_led"], 1)

    def test_case_5_overcurrent_activates_red_led_priority(self):
        """Test Case 5: Current above 5.0 A activates Red LED even if change magnitude is small."""
        self.detector.evaluate(4.90)

        # Step from 4.90 A to 5.20 A (ΔI = 0.30 A, but current > 5.0 A)
        res, is_event = self.detector.evaluate(5.20)
        self.assertTrue(is_event)
        self.assertEqual(res["event_type"], "OVERCURRENT")
        self.assertEqual(res["severity"], "CRITICAL")
        self.assertEqual(res["white_led"], 0)
        self.assertEqual(res["red_led"], 1)

    def test_case_6_sustained_condition_no_duplicate_events(self):
        """Test Case 6: Sustained condition does not create duplicate events every cycle."""
        self.detector.evaluate(2.00)

        # 1. Step up to 3.80 A -> 1 event
        _, is_event1 = self.detector.evaluate(3.80)
        self.assertTrue(is_event1)
        self.assertEqual(self.detector.event_counter, 1)

        # 2. Stay sustained at 3.82 A (ΔI = 0.02 A) -> No new event
        res2, is_event2 = self.detector.evaluate(3.82)
        self.assertFalse(is_event2)
        self.assertEqual(self.detector.event_counter, 1)

        # 3. Stay sustained at 3.79 A (ΔI = 0.03 A) -> No new event
        res3, is_event3 = self.detector.evaluate(3.79)
        self.assertFalse(is_event3)
        self.assertEqual(self.detector.event_counter, 1)

    def test_case_7_led_priority_exclusivity(self):
        """Test Case 7: White and Red LEDs never conflict in severity."""
        self.detector.evaluate(2.00)

        # Check across multiple transitions
        test_samples = [2.80, 2.82, 4.60, 4.61, 5.80, 5.82, 2.20]
        for s in test_samples:
            res, _ = self.detector.evaluate(s)
            # Cannot both be 1
            self.assertFalse(res["white_led"] == 1 and res["red_led"] == 1)

    def test_case_8_session_reset(self):
        """Test Case 8: Reset session cleanly clears counter and sets baseline."""
        self.detector.evaluate(2.00)
        self.detector.evaluate(3.80)
        self.assertEqual(self.detector.event_counter, 1)

        self.detector.reset_session(initial_baseline=2.50)
        self.assertEqual(self.detector.event_counter, 0)
        self.assertEqual(self.detector.previous_current, 2.50)


if __name__ == "__main__":
    unittest.main()
