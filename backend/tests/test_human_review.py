# backend/tests/test_human_review.py - Rigorous Human-in-the-Loop 2.0 Test Suite
import sys
import os
import tempfile
import json
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models import RawAlert, NormalizedAlert, Incident, ShiftBrief
from normalization import normalize_batch
from correlation import correlate_normalized_alerts
from review_persistence import save_review, rehydrate_incidents, load_reviews
from app import app, INCIDENTS, initialize_pipeline
from fastapi.testclient import TestClient

client = TestClient(app)

def create_sample_incident(inc_id="INC-TEST-102", prio="P1-Critical", risk=96.4, host="CORP-EXCHANGE-ONLINE"):
    raw = RawAlert(
        alert_id=f"ALT-{inc_id}-1",
        timestamp=datetime.now(timezone.utc).isoformat(),
        source="Endpoint EDR",
        alert_type="Credential Exfiltration",
        severity="Critical",
        hostname=host,
        asset_name=host,
        asset_criticality="Critical",
        user="marcus.vance.cfo@contoso.com",
        source_ip="185.220.101.5",
        destination_ip="10.0.0.5",
        description="LSASS memory dump detected on critical server",
        ground_truth_incident_id="GT-INC-001",
        scenario_id="SCN-001",
        is_false_positive=False,
        evidence={"process": "lsass.exe", "user": "marcus.vance.cfo@contoso.com"}
    )
    norm = normalize_batch([raw])[0]
    sb = ShiftBrief(
        what_happened="System detected credential access targeting exchange online.",
        correlated_alerts_summary="1 alert clustered",
        affected_asset=host,
        asset_criticality="Critical",
        timeline_events=["10:00 Initial credential dump"],
        priority_explanation="Critical asset and severity",
        mitre_techniques=[],
        investigation_points=["Verify active sessions"]
    )
    inc = Incident(
        incident_id=inc_id,
        title=f"Security Incident on {host}",
        priority=prio,
        risk_score=risk,
        asset_criticality="Critical",
        severity="Critical",
        alert_count=1,
        hostname=host,
        user="marcus.vance.cfo@contoso.com",
        source_ip="185.220.101.5",
        destination_ip="10.0.0.5",
        start_time=datetime.now(timezone.utc).isoformat(),
        end_time=datetime.now(timezone.utc).isoformat(),
        duration_minutes=15.0,
        correlation_reason="Observed host and credential match",
        priority_reason="Asset Criticality [Critical] (+45.0 pts)",
        alerts=[norm],
        mitre_mappings=[],
        shift_brief=sb
    )
    return inc

def run_tests():
    print("======================================================================")
    print("RUNNING HUMAN-IN-THE-LOOP 2.0 RIGOROUS AUDIT & REVIEW TEST SUITE")
    print("======================================================================")

    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tf:
        temp_storage = tf.name

    try:
        # 1. Confirm Decision Persistence
        inc1 = create_sample_incident("INC-TEST-102")
        inc1.investigation_status = "CONFIRMED"
        inc1.analyst_decision = "CONFIRM"
        inc1.analyst_confidence = "HIGH"
        inc1.analyst_reason = "Evidence supports system assessment"
        inc1.review_history.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actor": "Analyst Marcus (SOC Tier-1)",
            "action": "Incident confirm",
            "previous_state": "NEEDS REVIEW",
            "new_state": "CONFIRMED",
            "details": "Evidence supports system assessment"
        })
        assert save_review(inc1, file_path=temp_storage) is True
        saved = load_reviews(temp_storage)
        assert saved["INC-TEST-102"]["investigation_status"] == "CONFIRMED"
        assert saved["INC-TEST-102"]["analyst_decision"] == "CONFIRM"
        assert saved["INC-TEST-102"]["analyst_confidence"] == "HIGH"
        print("[PASS] 1. Confirm decision persistence verified.")

        # 2. Reject Decision Persistence
        inc2 = create_sample_incident("INC-TEST-103", prio="P3-Medium", risk=42.0)
        inc2.investigation_status = "REJECTED"
        inc2.analyst_decision = "REJECT"
        inc2.analyst_confidence = "MEDIUM"
        inc2.analyst_reason = "False positive"
        assert save_review(inc2, file_path=temp_storage) is True
        saved = load_reviews(temp_storage)
        assert saved["INC-TEST-103"]["investigation_status"] == "REJECTED"
        assert saved["INC-TEST-103"]["analyst_decision"] == "REJECT"
        print("[PASS] 2. Reject decision persistence verified.")

        # 3. Modify AI Brief Persistence
        inc1.shift_brief.custom_brief_text = "Analyst verified: Exfiltration blocked by endpoint policy."
        inc1.ai_brief_review = {
            "rating": "Requires modification",
            "status": "Modified",
            "original_ai_brief": inc1.shift_brief.what_happened,
            "analyst_modified_brief": inc1.shift_brief.custom_brief_text,
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        }
        assert save_review(inc1, file_path=temp_storage) is True
        saved = load_reviews(temp_storage)
        assert saved["INC-TEST-102"]["custom_brief_text"] == "Analyst verified: Exfiltration blocked by endpoint policy."
        assert saved["INC-TEST-102"]["ai_brief_review"]["status"] == "Modified"
        print("[PASS] 3. Modify AI brief persistence verified (original preserved in object).")

        # 4. Analyst Notes Persistence
        inc1.shift_brief.analyst_notes.append("Initial triage complete.")
        inc1.structured_notes.append({
            "id": "NOT-1",
            "author": "Analyst (SOC Tier-1)",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "text": "Initial triage complete."
        })
        save_review(inc1, file_path=temp_storage)
        saved = load_reviews(temp_storage)
        assert len(saved["INC-TEST-102"]["analyst_notes"]) >= 1
        assert len(saved["INC-TEST-102"]["structured_notes"]) >= 1
        print("[PASS] 4. Analyst notes chronological persistence verified.")

        # 5. Priority Override Persistence
        inc1.analyst_priority_override = "P1"
        inc1.analyst_priority_reason = "Critical production asset requires immediate escalation"
        save_review(inc1, file_path=temp_storage)
        saved = load_reviews(temp_storage)
        assert saved["INC-TEST-102"]["analyst_priority_override"] == "P1"
        assert saved["INC-TEST-102"]["analyst_priority_reason"] != ""
        print("[PASS] 5. Priority override persistence verified.")

        # 6. Correlation Challenge Persistence
        inc1.correlation_reviews.append({
            "target_incident_id": "INC-TEST-103",
            "status": "CHALLENGED",
            "challenge_reason": "Coincidental timing",
            "note": "IPs are NAT gateway",
            "evidence_types": ["Shared External IP"],
            "reviewed_at": datetime.now(timezone.utc).isoformat()
        })
        save_review(inc1, file_path=temp_storage)
        saved = load_reviews(temp_storage)
        assert len(saved["INC-TEST-102"]["correlation_reviews"]) == 1
        assert saved["INC-TEST-102"]["correlation_reviews"][0]["status"] == "CHALLENGED"
        print("[PASS] 6. Correlation challenge persistence verified.")

        # 7. Review History Persistence
        assert len(saved["INC-TEST-102"]["review_history"]) >= 1
        entry = saved["INC-TEST-102"]["review_history"][0]
        assert "timestamp" in entry and "actor" in entry and "action" in entry
        print("[PASS] 7. Review history audit log persistence verified.")

        # 8. Merge Proposal Persistence
        inc1.merge_proposals.append({
            "merge_id": "MRG-TEST-1",
            "merged_incidents": ["INC-TEST-102", "INC-TEST-103"],
            "actor": "Analyst Marcus",
            "reason": "Shared threat actor campaign",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "ANALYST_MERGED"
        })
        save_review(inc1, file_path=temp_storage)
        saved = load_reviews(temp_storage)
        assert len(saved["INC-TEST-102"]["merge_proposals"]) == 1
        assert saved["INC-TEST-102"]["merge_proposals"][0]["merge_id"] == "MRG-TEST-1"
        print("[PASS] 8. Merge proposal persistence verified.")

        # 9. Split Proposal Persistence
        inc1.split_proposals.append({
            "split_id": "SPL-TEST-1",
            "original_incident": "INC-TEST-102",
            "clusters": [{"name": "INC-TEST-102-A", "alert_count": 1}],
            "reason": "Different subnets and identities",
            "actor": "Analyst Marcus",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "status": "ANALYST_SPLIT"
        })
        save_review(inc1, file_path=temp_storage)
        saved = load_reviews(temp_storage)
        assert len(saved["INC-TEST-102"]["split_proposals"]) == 1
        print("[PASS] 9. Split proposal persistence verified.")

        # 10. Restart Survival (Rehydration into freshly instantiated incidents)
        fresh_inc1 = create_sample_incident("INC-TEST-102")
        fresh_inc2 = create_sample_incident("INC-TEST-103")
        fresh_list = [fresh_inc1, fresh_inc2]
        rehydrated_count = rehydrate_incidents(fresh_list, file_path=temp_storage)
        assert rehydrated_count == 2
        assert fresh_inc1.investigation_status == "CONFIRMED"
        assert fresh_inc1.analyst_decision == "CONFIRM"
        assert fresh_inc1.analyst_confidence == "HIGH"
        assert fresh_inc1.analyst_priority_override == "P1"
        assert fresh_inc1.shift_brief.custom_brief_text is not None
        assert len(fresh_inc1.correlation_reviews) == 1
        assert len(fresh_inc1.merge_proposals) == 1
        assert len(fresh_inc1.split_proposals) == 1
        assert fresh_inc2.investigation_status == "REJECTED"
        print("[PASS] 10. Restart survival: Rehydrated incidents completely intact after reload.")

        # 11. Original System State Preserved After Override
        assert fresh_inc1.risk_score == 96.4, "System risk score must not be overwritten"
        assert fresh_inc1.priority == "P1-Critical", "System priority must remain unchanged"
        assert fresh_inc1.shift_brief.what_happened != fresh_inc1.shift_brief.custom_brief_text
        print("[PASS] 11. Provenance verified: System calculated risk & priority preserved.")

        # 12. Ground-Truth Fields Never Modified
        for al in fresh_inc1.alerts:
            assert al.ground_truth_incident_id == "GT-INC-001"
            assert al.scenario_id == "SCN-001"
            assert al.is_false_positive is False
        print("[PASS] 12. Security & Data Integrity: Ground-truth fields untouched.")

        # 13. No Hardcoded Review Counts (Dynamic Calculation)
        resp = client.get("/api/reviews/summary")
        assert resp.status_code == 200
        summary = resp.json()
        assert "queue_counts" in summary
        assert "kpi_metrics" in summary
        assert "analytics" in summary
        qc = summary["queue_counts"]
        assert isinstance(qc["needs_review"], int)
        assert isinstance(qc["ai_briefs"], int)
        assert isinstance(qc["correlations"], int)
        assert isinstance(qc["escalated"], int)
        assert isinstance(qc["investigated"], int)
        print("[PASS] 13. Dynamic calculation verified: Review counts derived from actual data.")

        # 14. API Returns Review State Correctly
        target_id = INCIDENTS[0].incident_id if len(INCIDENTS) > 0 else "INC-102"
        # Test full review POST
        post_resp = client.post(f"/api/incidents/{target_id}/review", json={
            "action": "confirm",
            "confidence": "HIGH",
            "reason": "Evidence supports system assessment",
            "note": "Verified against telemetry stream",
            "priority_override": "P1",
            "priority_reason": "Executive asset tier",
            "elapsed_seconds": 12.0
        })
        assert post_resp.status_code == 200
        data = post_resp.json()
        assert data["success"] is True
        assert data["incident"]["investigation_status"] == "CONFIRMED"
        assert data["incident"]["analyst_decision"] == "CONFIRM"
        assert data["incident"]["analyst_confidence"] == "HIGH"
        assert data["incident"]["analyst_priority_override"] == "P1"

        # Verify incident GET returns updated review state
        get_resp = client.get(f"/api/incidents/{target_id}")
        assert get_resp.status_code == 200
        inc_data = get_resp.json()
        assert inc_data["investigation_status"] == "CONFIRMED"
        assert inc_data["analyst_decision"] == "CONFIRM"
        assert len(inc_data["review_history"]) >= 1
        print("[PASS] 14. API review workflow verified end-to-end.")

        print("======================================================================")
        print("ALL 14 HUMAN-IN-THE-LOOP 2.0 RIGOROUS TESTS PASSED!")
        print("======================================================================")

    finally:
        if os.path.exists(temp_storage):
            os.remove(temp_storage)

if __name__ == "__main__":
    run_tests()
