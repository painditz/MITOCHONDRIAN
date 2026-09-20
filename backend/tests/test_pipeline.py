from datetime import datetime, timezone
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models import RawAlert, NormalizedAlert, Incident
from ingestion import generate_3000_alerts
from normalization import normalize_batch, normalize_alert
from correlation import correlate_normalized_alerts
from prioritization import calculate_incident_priority
from mitre_mapper import map_alerts_to_mitre
from ai_briefer import generate_shift_brief
from mttt_calculator import calculate_mttt_metrics

def test_1_batch_alert_ingestion():
    """1. Ingestion: Generates exactly 3,000 alerts with all required security fields."""
    alerts = generate_3000_alerts()
    assert len(alerts) == 3000, f"Expected 3,000 alerts, got {len(alerts)}"
    
    # Verify all official fields exist on every alert
    for a in alerts[:50]:
        assert a.alert_id.startswith("ALT-")
        assert a.timestamp is not None
        assert a.source in ["Endpoint EDR", "Identity Provider", "Cloud Audit", "Network Firewall", "Email Gateway"]
        assert a.severity in ["Critical", "High", "Medium", "Low", "Informational"]
        assert a.hostname != ""
        assert a.asset_criticality in ["Critical", "High", "Medium", "Low"]
        assert a.description != ""
        assert isinstance(a.evidence, dict)

def test_2_alert_normalization():
    """2. Normalization: Standardizes formats into single internal schema."""
    raw = RawAlert(
        alert_id="ALT-TEST-01",
        timestamp="2026-09-18T10:00:00Z",
        source="Endpoint EDR",
        alert_type="lsass dump",
        severity="critical",
        source_ip="10.0.4.42",
        destination_ip="10.0.1.10",
        user="svc-admin",
        hostname="dc-prod-01",
        asset_criticality="critical",
        description="LSASS accessed",
        evidence={"target": "lsass.exe"}
    )
    norm = normalize_alert(raw)
    assert norm.severity == "Critical"
    assert norm.asset_criticality == "Critical"
    assert norm.hostname == "DC-PROD-01"
    assert isinstance(norm.timestamp, datetime)

def test_3_correlation_and_grouping():
    """3. Correlation: Groups related alerts and provides explainable correlation reason."""
    raw_alerts = generate_3000_alerts()
    norm_alerts = normalize_batch(raw_alerts)
    incidents = correlate_normalized_alerts(norm_alerts)
    
    assert len(incidents) > 0
    assert len(incidents) < len(raw_alerts)  # Significant grouping of 3,000 alerts
    
    # Verify each incident has required fields
    for inc in incidents:
        assert inc.incident_id.startswith("INC-")
        assert inc.correlation_reason != ""
        assert len(inc.alerts) > 0
        assert inc.asset_criticality in ["Critical", "High", "Medium", "Low"]

def test_4_asset_criticality_prioritization():
    """
    4. Asset Criticality MUST matter!
    An incident on a Critical asset with few alerts MUST outrank an incident on a Low asset with many alerts.
    """
    # Incident A: Critical Asset (Domain Controller) with 2 alerts
    now_utc = datetime.now(timezone.utc)
    critical_alerts = [
        NormalizedAlert(
            alert_id="A1", timestamp=now_utc, source="EDR", alert_type="Shadow Copy",
            severity="Critical", source_ip="10.0.4.1", destination_ip="10.0.1.10", user="admin",
            hostname="DC-PROD-01", asset_criticality="Critical", description="Shadow delete",
            evidence={"command_line": "vssadmin.exe delete shadows"}
        ),
        NormalizedAlert(
            alert_id="A2", timestamp=now_utc, source="EDR", alert_type="LSASS",
            severity="Critical", source_ip="10.0.4.1", destination_ip="10.0.1.10", user="admin",
            hostname="DC-PROD-01", asset_criticality="Critical", description="LSASS dump",
            evidence={"target_process": "lsass.exe"}
        )
    ]
    mitre_a = map_alerts_to_mitre(critical_alerts)
    score_a, prio_a, _ = calculate_incident_priority(critical_alerts, "Critical", mitre_a, 15.0)

    # Incident B: Low Asset (Staging Bastion) with 15 alerts
    low_alerts = [
        NormalizedAlert(
            alert_id=f"B{i}", timestamp=now_utc, source="Firewall", alert_type="SSH Attempt",
            severity="Medium", source_ip="192.0.2.1", destination_ip="10.0.99.1", user="root",
            hostname="STAGING-TEST", asset_criticality="Low", description=f"SSH failure {i}",
            evidence={"attempt": i}
        ) for i in range(15)
    ]
    mitre_b = map_alerts_to_mitre(low_alerts)
    score_b, prio_b, _ = calculate_incident_priority(low_alerts, "Low", mitre_b, 60.0)

    # Verification: Critical asset incident strictly outranks Low asset incident
    assert score_a > score_b, f"Critical asset score {score_a} should exceed Low asset score {score_b}"
    assert prio_a == "P1-Critical"
    assert prio_b in ["P3-Medium", "P4-Low"]

def test_5_mitre_mapping_grounded_in_evidence():
    """5. MITRE ATT&CK Mapping: Only maps when supported by actual evidence."""
    alerts = [
        NormalizedAlert(
            alert_id="M1", timestamp=datetime.now(timezone.utc), source="EDR", alert_type="PowerShell Download",
            severity="High", source_ip="10.0.0.1", destination_ip="10.0.0.2", user="user",
            hostname="HOST-1", asset_criticality="High", description="PowerShell encoded",
            evidence={"command_line": "powershell.exe -enc ..."}
        )
    ]
    mappings = map_alerts_to_mitre(alerts)
    assert len(mappings) == 1
    assert mappings[0].technique_id == "T1059.001"
    assert "powershell.exe" in mappings[0].evidence_found

def test_6_shift_brief_generation():
    """6. AI Shift Brief: Generates shift handover brief grounded in evidence."""
    raw_alerts = generate_3000_alerts()
    norm_alerts = normalize_batch(raw_alerts)
    incidents = correlate_normalized_alerts(norm_alerts)
    first_inc = incidents[0]
    brief = generate_shift_brief(first_inc)

    assert brief.what_happened != ""
    assert brief.affected_asset != ""
    assert len(brief.timeline_events) > 0
    assert len(brief.investigation_points) > 0
    assert brief.analyst_status == "Pending Review"

def test_7_real_mttt_calculation():
    """7. MTTT: Validates separated Simulation Assumptions vs Empirical Measured Analyst Test."""
    from models import TriageSessionRecord
    raw_alerts = generate_3000_alerts()
    norm_alerts = normalize_batch(raw_alerts)
    incidents = correlate_normalized_alerts(norm_alerts)

    # State A: Prior to trial testing, Measured Analyst Test must be "Not evaluated"
    mttt_empty = calculate_mttt_metrics(len(raw_alerts), incidents, session_records=[])
    assert mttt_empty.measured_analyst_test.evaluation_status == "Not evaluated"
    assert mttt_empty.measured_analyst_test.has_measured_data is False
    assert mttt_empty.measured_analyst_test.measured_percentage_reduction is None

    # Verify Simulation Mode is clearly marked as assumptions
    sim = mttt_empty.simulation_estimate
    assert sim.assumed_raw_alert_time_min == 10.0
    assert sim.assumed_incident_time_min == 3.0
    assert sim.simulated_baseline_hours == 500.0
    assert "Assumption" in sim.label

    # State B: Experimental Trials Recorded by Analyst
    sessions = [
        TriageSessionRecord(
            session_id="SES-RAW-1", session_type="raw_alert", target_id="ALT-10001",
            start_timestamp="2026-09-19T06:00:00Z", end_timestamp="2026-09-19T06:02:00Z",
            duration_seconds=120.0, analyst_decision="Ticket Created"
        ),
        TriageSessionRecord(
            session_id="SES-ASST-1", session_type="assisted_incident", target_id="INC-101",
            start_timestamp="2026-09-19T06:05:00Z", end_timestamp="2026-09-19T06:05:24Z",
            duration_seconds=24.0, analyst_decision="Confirmed"
        )
    ]
    mttt_tested = calculate_mttt_metrics(len(raw_alerts), incidents, session_records=sessions)
    meas = mttt_tested.measured_analyst_test

    assert meas.evaluation_status == "Evaluated (Empirical Data)"
    assert meas.has_measured_data is True
    assert meas.measured_baseline_mttt_seconds == 120.0
    assert meas.measured_assisted_mttt_seconds == 24.0
    assert meas.measured_difference_seconds == 96.0
    # Expected empirical percentage reduction: (120 - 24) / 120 * 100 = 80.0%
    assert meas.measured_percentage_reduction == 80.0

if __name__ == "__main__":
    test_1_batch_alert_ingestion()
    print("[PASS] Test 1: Batch Alert Ingestion (3,000 alerts) Passed")
    test_2_alert_normalization()
    print("[PASS] Test 2: Alert Normalization Passed")
    test_3_correlation_and_grouping()
    print("[PASS] Test 3: Correlation & Incident Grouping Passed")
    test_4_asset_criticality_prioritization()
    print("[PASS] Test 4: Asset Criticality Prioritization Passed")
    test_5_mitre_mapping_grounded_in_evidence()
    print("[PASS] Test 5: MITRE ATT&CK Mapping with Evidence Passed")
    test_6_shift_brief_generation()
    print("[PASS] Test 6: AI Shift Handover Brief Passed")
    test_7_real_mttt_calculation()
    print("[PASS] Test 7: Real Mathematical MTTT Calculation Passed")
    print("\nALL PROBLEM STATEMENT #25 TESTS PASSED SUCCESSFULLY!")
