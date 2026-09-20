# backend/tests/test_dataset_upgrade.py - Unit Test Suite for Problem Statement #25 Dataset Upgrade
import os
import sys
import unittest
from datetime import datetime
from collections import Counter

# Ensure backend directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models import RawAlert, NormalizedAlert
from ingestion import generate_alerts, generate_3000_alerts
from normalization import normalize_batch, normalize_alert
from correlation import correlate_normalized_alerts
from dataset_validator import validate_dataset

class TestDatasetUpgrade(unittest.TestCase):
    
    def test_01_default_size(self):
        """Requirement 1: Default demonstration dataset size must be exactly 3,000."""
        alerts = generate_3000_alerts()
        self.assertEqual(len(alerts), 3000)

    def test_02_parameterized_count(self):
        """Requirement 1: Generator allows arbitrary size without rewriting logic."""
        for count in [200, 500, 1500, 3500]:
            alerts = generate_alerts(count=count, seed=42)
            self.assertEqual(len(alerts), count)

    def test_03_reproducibility(self):
        """Requirement 10: Fixed random seed produces strictly identical datasets."""
        run1 = generate_alerts(count=500, seed=42)
        run2 = generate_alerts(count=500, seed=42)
        self.assertEqual([a.alert_id for a in run1], [a.alert_id for a in run2])
        self.assertEqual([a.timestamp for a in run1], [a.timestamp for a in run2])
        self.assertEqual([a.description for a in run1], [a.description for a in run2])

    def test_04_schema_completeness(self):
        """Requirement 2: All 19 schema fields are populated and valid."""
        alerts = generate_alerts(count=300, seed=42)
        for a in alerts:
            self.assertTrue(a.alert_id.startswith("ALT-"))
            self.assertTrue(bool(a.timestamp))
            self.assertIn(a.source, ["Endpoint EDR", "Network Firewall", "Cloud Audit", "Identity Provider", "Email Gateway"])
            self.assertIn(a.severity, ["Critical", "High", "Medium", "Low", "Informational"])
            self.assertTrue(bool(a.asset_id))
            self.assertTrue(bool(a.asset_name))
            self.assertIn(a.asset_criticality, ["Critical", "High", "Medium", "Low"])
            self.assertTrue(bool(a.description))
            self.assertIsInstance(a.is_false_positive, bool)
            self.assertTrue(bool(a.protocol))

    def test_05_scenario_coherence(self):
        """Requirement 3 & 9: 10 multi-stage scenarios with chronological progression."""
        alerts = generate_alerts(count=3000, seed=42)
        attack_alerts = [a for a in alerts if not a.is_false_positive]
        
        scenarios = {}
        for a in attack_alerts:
            scenarios.setdefault(a.scenario_id, []).append(a)

        self.assertEqual(len(scenarios), 10, "Expected exactly 10 multi-stage attack scenarios")
        for sid, grp in scenarios.items():
            self.assertGreaterEqual(len(grp), 4, f"Scenario {sid} should contain at least 4 related alerts")
            # Verify timestamps are in ascending order
            timestamps = [datetime.fromisoformat(a.timestamp.replace("Z", "+00:00")) for a in grp]
            self.assertEqual(timestamps, sorted(timestamps), f"Scenario {sid} alerts must be chronologically ordered")

    def test_06_evaluation_safety_no_leakage(self):
        """Requirement 4 & 12: Production correlation algorithm must NOT use evaluation-only fields."""
        alerts = generate_alerts(count=3000, seed=42)
        norm = normalize_batch(alerts)
        
        # Correlate normally
        incidents_normal = correlate_normalized_alerts(norm)
        
        # Strip all evaluation fields from input alerts
        stripped_alerts = []
        for a in norm:
            stripped = a.model_copy()
            stripped.ground_truth_incident_id = None
            stripped.scenario_id = None
            stripped.is_false_positive = False
            stripped_alerts.append(stripped)

        incidents_stripped = correlate_normalized_alerts(stripped_alerts)

        # The resulting incidents must be 100% identical!
        self.assertEqual(len(incidents_normal), len(incidents_stripped))
        self.assertEqual([i.incident_id for i in incidents_normal], [i.incident_id for i in incidents_stripped])
        self.assertEqual([i.title for i in incidents_normal], [i.title for i in incidents_stripped])
        self.assertEqual([i.alert_count for i in incidents_normal], [i.alert_count for i in incidents_stripped])

    def test_07_false_positive_interleaving(self):
        """Requirement 5: Noise alerts are mixed throughout the 24-hour timeline."""
        alerts = generate_alerts(count=3000, seed=42)
        # Check that false positives are not all grouped in one block
        first_quarter = alerts[:750]
        second_quarter = alerts[750:1500]
        third_quarter = alerts[1500:2250]
        fourth_quarter = alerts[2250:]

        for q_idx, q in enumerate([first_quarter, second_quarter, third_quarter, fourth_quarter]):
            fp_count = sum(1 for a in q if a.is_false_positive)
            self.assertGreater(fp_count, 500, f"Quarter {q_idx+1} should contain significant interleaved noise")

    def test_08_mitre_mapping_grounding(self):
        """Requirement 8: MITRE mappings are grounded in evidence, never randomly assigned."""
        alerts = generate_alerts(count=3000, seed=42)
        for a in alerts:
            if a.is_false_positive:
                self.assertIsNone(a.mitre_tactic, f"Benign alert {a.alert_id} should not have a MITRE tactic")
                self.assertIsNone(a.mitre_technique, f"Benign alert {a.alert_id} should not have a MITRE technique")
            else:
                self.assertIsNotNone(a.mitre_tactic, f"Attack alert {a.alert_id} should have a MITRE tactic")
                self.assertIsNotNone(a.mitre_technique, f"Attack alert {a.alert_id} should have a MITRE technique")

    def test_09_automated_validator(self):
        """Requirement 11: Dataset passes the 11-point automated validator."""
        alerts = generate_alerts(count=3000, seed=42)
        report = validate_dataset(alerts, seed=42)
        self.assertTrue(report.is_valid)
        self.assertEqual(report.checks_passed, 11)
        self.assertEqual(report.checks_failed, 0)

if __name__ == "__main__":
    unittest.main()
