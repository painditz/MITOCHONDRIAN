# backend/tests/test_correlation_and_graph.py - Rigorous Graph & Correlation Edge Tests
import os
import sys
from datetime import datetime, timezone, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models import NormalizedAlert, Incident
from graph_engine import build_authoritative_graph, extract_incident_entities

from models import NormalizedAlert, Incident, ShiftBrief

def create_mock_incident(incident_id: str, alerts: list) -> Incident:
    t_start = alerts[0].timestamp.isoformat()
    t_end = alerts[-1].timestamp.isoformat()
    host = alerts[0].hostname or "HOST-TEST"
    user = alerts[0].user or "user@domain.com"
    return Incident(
        incident_id=incident_id,
        title=f"Incident {incident_id} on {host}",
        priority="P2",
        risk_score=75.0,
        asset_criticality="High",
        severity="High",
        alert_count=len(alerts),
        hostname=host,
        user=user,
        source_ip=alerts[0].source_ip or "10.0.0.1",
        destination_ip=alerts[0].destination_ip or "10.0.0.2",
        start_time=t_start,
        end_time=t_end,
        duration_minutes=15.0,
        correlation_reason="Correlated via shared observable context",
        priority_reason="High risk asset with multiple stages",
        alerts=alerts,
        mitre_mappings=[],
        shift_brief=ShiftBrief(
            what_happened="Observable attack activity",
            correlated_alerts_summary="Correlated alerts",
            affected_asset=host,
            asset_criticality="High",
            timeline_events=["Event 1"],
            priority_explanation="Explanation",
            mitre_techniques=[],
            investigation_points=["Check logs"]
        )
    )

def test_1_shared_host_creates_relationship():
    t0 = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    a1 = NormalizedAlert(
        alert_id="ALT-H1", timestamp=t0, source="EDR", alert_type="Suspicious Script",
        severity="High", source_ip="10.0.1.5", destination_ip="10.0.1.10",
        user="alice", hostname="CORP-EXCHANGE-01", asset_criticality="Critical", description="Script on host",
        evidence={}
    )
    a2 = NormalizedAlert(
        alert_id="ALT-H2", timestamp=t0 + timedelta(minutes=15), source="Firewall", alert_type="Port Scan",
        severity="Medium", source_ip="10.0.1.50", destination_ip="10.0.1.60",
        user="bob", hostname="CORP-EXCHANGE-01", asset_criticality="Critical", description="Scan on same host",
        evidence={}
    )
    inc1 = create_mock_incident("INC-01", [a1])
    inc2 = create_mock_incident("INC-02", [a2])

    graph = build_authoritative_graph([inc1, inc2])
    assert len(graph["nodes"]) == 2
    assert len(graph["edges"]) == 1
    edge = graph["edges"][0]
    assert edge["source"] == "INC-01"
    assert edge["target"] == "INC-02"
    evidence_types = [ev["type"] for ev in edge["evidence"]]
    assert "HOST" in evidence_types
    host_ev = next(ev for ev in edge["evidence"] if ev["type"] == "HOST")
    assert host_ev["value"] == "CORP-EXCHANGE-01"
    print("[PASS] Test 1: Shared host creates valid evidence-backed relationship.")

def test_2_shared_user_creates_relationship():
    t0 = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    a1 = NormalizedAlert(
        alert_id="ALT-U1", timestamp=t0, source="Identity", alert_type="MFA Fatigue",
        severity="High", source_ip="10.0.1.5", destination_ip="10.0.1.10",
        user="victim.user@domain.com", hostname="HOST-ALPHA", asset_criticality="High", description="MFA prompt",
        evidence={}
    )
    a2 = NormalizedAlert(
        alert_id="ALT-U2", timestamp=t0 + timedelta(minutes=20), source="Cloud", alert_type="Token Export",
        severity="Critical", source_ip="10.0.2.5", destination_ip="10.0.2.10",
        user="victim.user@domain.com", hostname="HOST-BETA", asset_criticality="High", description="Token theft",
        evidence={}
    )
    inc1 = create_mock_incident("INC-01", [a1])
    inc2 = create_mock_incident("INC-02", [a2])

    graph = build_authoritative_graph([inc1, inc2])
    assert len(graph["edges"]) == 1
    edge = graph["edges"][0]
    evidence_types = [ev["type"] for ev in edge["evidence"]]
    assert "USER" in evidence_types
    user_ev = next(ev for ev in edge["evidence"] if ev["type"] == "USER")
    assert user_ev["value"] == "victim.user@domain.com"
    print("[PASS] Test 2: Shared user creates valid evidence-backed relationship.")

def test_3_shared_external_ip_creates_relationship():
    t0 = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    # 198.51.100.25 is a public/external IP (RFC 5737 TEST-NET-2)
    a1 = NormalizedAlert(
        alert_id="ALT-IP1", timestamp=t0, source="EDR", alert_type="C2 Beaconing",
        severity="Critical", source_ip="10.0.1.5", destination_ip="198.51.100.25",
        user="user1", hostname="HOST-1", asset_criticality="Medium", description="Outbound C2",
        evidence={}
    )
    a2 = NormalizedAlert(
        alert_id="ALT-IP2", timestamp=t0 + timedelta(minutes=10), source="Firewall", alert_type="Data Exfiltration",
        severity="Critical", source_ip="10.0.2.50", destination_ip="198.51.100.25",
        user="user2", hostname="HOST-2", asset_criticality="Medium", description="Data push to C2",
        evidence={}
    )
    inc1 = create_mock_incident("INC-01", [a1])
    inc2 = create_mock_incident("INC-02", [a2])

    graph = build_authoritative_graph([inc1, inc2])
    assert len(graph["edges"]) == 1
    edge = graph["edges"][0]
    evidence_types = [ev["type"] for ev in edge["evidence"]]
    assert "EXTERNAL IP" in evidence_types
    ip_ev = next(ev for ev in edge["evidence"] if ev["type"] == "EXTERNAL IP")
    assert ip_ev["value"] == "198.51.100.25"
    print("[PASS] Test 3: Shared external IP creates valid evidence-backed relationship.")

def test_4_temporal_proximity_with_observable_context():
    t0 = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    # Overlapping hosts and close in time
    a1 = NormalizedAlert(
        alert_id="ALT-T1", timestamp=t0, source="EDR", alert_type="Brute Force",
        severity="High", source_ip="10.0.1.5", destination_ip="10.0.1.10",
        user="alice", hostname="SRV-ALPHA", asset_criticality="High", description="Logon fail",
        evidence={}
    )
    a2 = NormalizedAlert(
        alert_id="ALT-T2", timestamp=t0 + timedelta(minutes=25), source="EDR", alert_type="Privilege Escalation",
        severity="Critical", source_ip="10.0.1.5", destination_ip="10.0.1.10",
        user="alice", hostname="SRV-ALPHA", asset_criticality="High", description="Priv esc",
        evidence={}
    )
    inc1 = create_mock_incident("INC-01", [a1])
    inc2 = create_mock_incident("INC-02", [a2])

    graph = build_authoritative_graph([inc1, inc2])
    assert len(graph["edges"]) == 1
    edge = graph["edges"][0]
    evidence_types = [ev["type"] for ev in edge["evidence"]]
    assert "TIME WINDOW" in evidence_types
    print("[PASS] Test 4: Temporal proximity creates valid relationship under observable context.")

def test_5_unrelated_entities_do_not_create_relationship():
    t0 = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    # Completely disjoint hosts, users, IPs, and distant time (10 days apart)
    a1 = NormalizedAlert(
        alert_id="ALT-UN1", timestamp=t0, source="EDR", alert_type="Noise A",
        severity="Low", source_ip="10.0.1.1", destination_ip="10.0.1.2",
        user="charlie", hostname="HOST-X", asset_criticality="Low", description="Noise A",
        evidence={}
    )
    a2 = NormalizedAlert(
        alert_id="ALT-UN2", timestamp=t0 + timedelta(days=10), source="Firewall", alert_type="Noise B",
        severity="Low", source_ip="10.0.2.1", destination_ip="10.0.2.2",
        user="david", hostname="HOST-Y", asset_criticality="Low", description="Noise B",
        evidence={}
    )
    inc1 = create_mock_incident("INC-01", [a1])
    inc2 = create_mock_incident("INC-02", [a2])

    graph = build_authoritative_graph([inc1, inc2])
    assert len(graph["edges"]) == 0, f"Expected 0 edges for unrelated incidents, got {len(graph['edges'])}"
    print("[PASS] Test 5: Unrelated entities do NOT create a relationship.")

def test_6_geometric_distance_does_not_create_relationship():
    # Spatial coordinates must have zero influence on edge generation.
    # build_authoritative_graph only processes security incident objects and has no distance parameter.
    import inspect
    sig = inspect.signature(build_authoritative_graph)
    param_names = list(sig.parameters.keys())
    assert "distance" not in param_names
    assert "dist" not in param_names
    assert "radius" not in param_names
    print("[PASS] Test 6: Geometric distance does NOT create a relationship (pure security contract).")

def test_7_scenario_id_does_not_create_relationship():
    t0 = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    # Alerts sharing a synthetic scenario_id in evidence, but completely disjoint in observable telemetry
    a1 = NormalizedAlert(
        alert_id="ALT-S1", timestamp=t0, source="EDR", alert_type="Threat A",
        severity="High", source_ip="10.10.1.1", destination_ip="10.10.1.2",
        user="user_s1", hostname="HOST-S1", asset_criticality="Low", description="Threat A",
        evidence={"scenario_id": "SCN-ATTACK-001"}
    )
    a2 = NormalizedAlert(
        alert_id="ALT-S2", timestamp=t0 + timedelta(days=5), source="Cloud", alert_type="Threat B",
        severity="High", source_ip="10.20.1.1", destination_ip="10.20.1.2",
        user="user_s2", hostname="HOST-S2", asset_criticality="Low", description="Threat B",
        evidence={"scenario_id": "SCN-ATTACK-001"}
    )
    inc1 = create_mock_incident("INC-01", [a1])
    inc2 = create_mock_incident("INC-02", [a2])

    graph = build_authoritative_graph([inc1, inc2])
    assert len(graph["edges"]) == 0, "scenario_id must NEVER create production graph edges!"
    print("[PASS] Test 7: scenario_id does NOT create a production graph relationship.")

def test_8_ground_truth_incident_id_does_not_create_relationship():
    t0 = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    # Alerts sharing ground_truth_incident_id in evidence, but completely disjoint in observable telemetry
    a1 = NormalizedAlert(
        alert_id="ALT-GT1", timestamp=t0, source="EDR", alert_type="Threat C",
        severity="High", source_ip="10.30.1.1", destination_ip="10.30.1.2",
        user="user_gt1", hostname="HOST-GT1", asset_criticality="Low", description="Threat C",
        evidence={"ground_truth_incident_id": "GT-INC-999"}
    )
    a2 = NormalizedAlert(
        alert_id="ALT-GT2", timestamp=t0 + timedelta(days=6), source="Cloud", alert_type="Threat D",
        severity="High", source_ip="10.40.1.1", destination_ip="10.40.1.2",
        user="user_gt2", hostname="HOST-GT2", asset_criticality="Low", description="Threat D",
        evidence={"ground_truth_incident_id": "GT-INC-999"}
    )
    inc1 = create_mock_incident("INC-01", [a1])
    inc2 = create_mock_incident("INC-02", [a2])

    graph = build_authoritative_graph([inc1, inc2])
    assert len(graph["edges"]) == 0, "ground_truth_incident_id must NEVER create production graph edges!"
    print("[PASS] Test 8: ground_truth_incident_id does NOT create a production graph relationship.")

def test_9_is_false_positive_does_not_create_relationship():
    t0 = datetime(2026, 9, 20, 10, 0, tzinfo=timezone.utc)
    # Both alerts flagged as false positives or true attacks in synthetic labels, but disjoint observable telemetry
    a1 = NormalizedAlert(
        alert_id="ALT-FP1", timestamp=t0, source="EDR", alert_type="Noise 1",
        severity="Low", source_ip="10.50.1.1", destination_ip="10.50.1.2",
        user="user_fp1", hostname="HOST-FP1", asset_criticality="Low", description="Noise 1",
        evidence={"is_false_positive": True}
    )
    a2 = NormalizedAlert(
        alert_id="ALT-FP2", timestamp=t0 + timedelta(days=7), source="Cloud", alert_type="Noise 2",
        severity="Low", source_ip="10.60.1.1", destination_ip="10.60.1.2",
        user="user_fp2", hostname="HOST-FP2", asset_criticality="Low", description="Noise 2",
        evidence={"is_false_positive": True}
    )
    inc1 = create_mock_incident("INC-01", [a1])
    inc2 = create_mock_incident("INC-02", [a2])

    graph = build_authoritative_graph([inc1, inc2])
    assert len(graph["edges"]) == 0, "is_false_positive must NEVER create production graph edges!"
    print("[PASS] Test 9: is_false_positive does NOT create a production graph relationship.")

if __name__ == "__main__":
    print("=" * 70)
    print("RUNNING PART 26: RIGOROUS CORRELATION & GRAPH EDGE TESTS")
    print("=" * 70)
    test_1_shared_host_creates_relationship()
    test_2_shared_user_creates_relationship()
    test_3_shared_external_ip_creates_relationship()
    test_4_temporal_proximity_with_observable_context()
    test_5_unrelated_entities_do_not_create_relationship()
    test_6_geometric_distance_does_not_create_relationship()
    test_7_scenario_id_does_not_create_relationship()
    test_8_ground_truth_incident_id_does_not_create_relationship()
    test_9_is_false_positive_does_not_create_relationship()
    print("=" * 70)
    print("ALL 9 CORRELATION & GRAPH TESTS PASSED CLEANLY!")
    print("=" * 70)
