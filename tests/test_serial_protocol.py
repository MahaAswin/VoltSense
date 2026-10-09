"""
WattWise Edge - Unit Tests for Serial Protocol V2
=================================================
Tests serialization, deserialization, field ordering, delimiter validation,
and payload integrity for ESP32 UART communication.
"""

import unittest
from core.serial_manager import SerialManager


class TestSerialProtocolV2(unittest.TestCase):
    def setUp(self):
        self.sm = SerialManager(port="COM6", baud_rate=115200)

    def test_v2_payload_formatting_and_termination(self):
        """Verify V2 message starts with 'V2,', is newline-terminated, and has 13 comma-separated tokens."""
        payload = self.sm.format_v2_payload(
            current=2.15,
            voltage=228.6,
            power=466.9,
            led_current=1,
            led_voltage=0,
            led_power=1,
            led_shared_red=0,
            is_overcurrent=0,
            event_count=3,
            latest_event_time="22:50:15",
            status="CURRENT_SPIKE",
        )

        self.assertTrue(payload.endswith("\n"), "Payload must be newline terminated")
        self.assertTrue(payload.startswith("V2,"), "Payload must start with V2, header")

        tokens = payload.strip().split(",")
        self.assertEqual(len(tokens), 13, f"Expected 13 tokens, got {len(tokens)}: {tokens}")
        self.assertEqual(tokens[0], "V2")
        self.assertEqual(tokens[1], str(self.sm.sequence_num))
        self.assertEqual(tokens[2], "22:50:15")
        self.assertEqual(tokens[3], "2.15")
        self.assertEqual(tokens[4], "228.6")
        self.assertEqual(tokens[5], "466.9")
        self.assertEqual(tokens[6], "1")
        self.assertEqual(tokens[7], "0")
        self.assertEqual(tokens[8], "1")
        self.assertEqual(tokens[9], "0")
        self.assertEqual(tokens[10], "0")
        self.assertEqual(tokens[11], "3")
        self.assertEqual(tokens[12], "CURRENT_SPIKE")

    def test_v2_payload_roundtrip_parsing(self):
        """Verify formatted string is successfully deserialized back to matching data types."""
        line = self.sm.format_v2_payload(
            current=6.85,
            voltage=231.4,
            power=1508.2,
            led_current=1,
            led_voltage=1,
            led_power=1,
            led_shared_red=1,
            is_overcurrent=1,
            event_count=7,
            latest_event_time="14:22:00",
            status="CRITICAL_OVERCURRENT",
        )

        parsed = SerialManager.parse_v2_payload(line)
        self.assertIsNotNone(parsed, "Parser should return a valid dictionary for valid V2 packet")
        self.assertEqual(parsed["protocol"], "V2")
        self.assertEqual(parsed["seq"], self.sm.sequence_num)
        self.assertEqual(parsed["timestamp"], "14:22:00")
        self.assertAlmostEqual(parsed["current"], 6.85, places=2)
        self.assertAlmostEqual(parsed["voltage"], 231.4, places=1)
        self.assertAlmostEqual(parsed["power"], 1508.2, places=1)
        self.assertEqual(parsed["led_current"], 1)
        self.assertEqual(parsed["led_voltage"], 1)
        self.assertEqual(parsed["led_power"], 1)
        self.assertEqual(parsed["led_shared_red"], 1)
        self.assertEqual(parsed["overcurrent"], 1)
        self.assertEqual(parsed["event_count"], 7)
        self.assertEqual(parsed["status"], "CRITICAL_OVERCURRENT")

    def test_malformed_payload_rejection(self):
        """Verify parser rejects corrupt, truncated, or invalid format strings."""
        self.assertIsNone(SerialManager.parse_v2_payload("INVALID,1,2,3"))
        self.assertIsNone(SerialManager.parse_v2_payload("V2,1,2,3,4,5,6,7,8,9,10"))  # Only 11 tokens
        self.assertIsNone(SerialManager.parse_v2_payload("V2,seq,time,not_a_float,230,500,0,0,0,0,0,0,NORMAL"))
        self.assertIsNone(SerialManager.parse_v2_payload(""))

    def test_sanitization_of_commas_in_status_and_time(self):
        """Ensure commas inside status or timestamp strings are sanitized so delimiter count remains 13."""
        line = self.sm.format_v2_payload(
            current=2.0,
            voltage=230.0,
            power=460.0,
            latest_event_time="22,50,15",
            status="STATUS,WITH,COMMAS",
        )
        tokens = line.strip().split(",")
        self.assertEqual(len(tokens), 13, "Delimiter injection must not change token count")
        self.assertEqual(tokens[12], "STATUS_WITH_COMMAS")

    def test_canonical_csv_formatting_and_parsing(self):
        """Verify canonical 3-field 'current,voltage,power\\n' format and parsing."""
        csv_payload = self.sm.format_csv_payload(current=2.50, voltage=230.00, power=546.25)
        self.assertEqual(csv_payload, "2.50,230.00,546.25\n")
        self.assertTrue(csv_payload.endswith("\n"))

        parsed = SerialManager.parse_csv_payload(csv_payload)
        self.assertIsNotNone(parsed)
        self.assertAlmostEqual(parsed["current"], 2.50, places=2)
        self.assertAlmostEqual(parsed["voltage"], 230.00, places=2)
        self.assertAlmostEqual(parsed["power"], 546.25, places=2)
        self.assertFalse(parsed["is_overcurrent"])

    def test_canonical_csv_overcurrent_detection(self):
        """Verify canonical CSV parser flags overcurrent when current > 5.0 A."""
        csv_payload = self.sm.format_csv_payload(current=6.20, voltage=229.50, power=1350.00)
        parsed = SerialManager.parse_csv_payload(csv_payload)
        self.assertIsNotNone(parsed)
        self.assertTrue(parsed["is_overcurrent"])


if __name__ == "__main__":
    unittest.main()

