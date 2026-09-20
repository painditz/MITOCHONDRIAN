# backend/tests/verify_endpoints.py - Automated Headless Verification Script
import urllib.request
import json
import time

BASE_API = "http://127.0.0.1:8000/api"
FRONTEND_URL = "http://localhost:5173"

def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "HeadlessVerifier/1.0"})
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), resp.read().decode("utf-8")

def http_post(url, payload):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={
        "Content-Type": "application/json",
        "User-Agent": "HeadlessVerifier/1.0"
    })
    with urllib.request.urlopen(req) as resp:
        return resp.getcode(), resp.read().decode("utf-8")

def run_verification():
    print("=================================================================")
    print("   AUTOMATED HEADLESS ENDPOINT VERIFICATION (PROBLEM #25)        ")
    print("=================================================================\n")

    # 1. Frontend Web Server Check
    print("[1/9] Checking Frontend Web Server...")
    status, html = http_get(FRONTEND_URL)
    assert status == 200, f"Frontend returned status {status}"
    assert "<div id=\"root\"></div>" in html or "vite" in html.lower(), "Frontend HTML invalid"
    print(f"  [PASS] Frontend is live on port 5173 (HTTP {status})")

    # 2. Reset Pipeline to Baseline
    print("\n[2/9] Resetting pipeline to clean baseline state...")
    status, body = http_post(f"{BASE_API}/reset", {})
    assert status == 200, f"Reset returned status {status}"
    reset_data = json.loads(body)
    assert reset_data["success"] is True
    print("  [PASS] Successfully reset pipeline with 3,000 fresh alerts.")

    # 3. SOC Overview & Initial MTTT Status
    print("\n[3/9] Checking /api/overview (View A)...")
    status, body = http_get(f"{BASE_API}/overview")
    assert status == 200
    overview = json.loads(body)
    assert overview["total_alerts"] == 3000, f"Expected 3000 alerts, got {overview['total_alerts']}"
    assert overview["grouped_incidents"] > 0
    assert overview["critical_incidents"] > 0
    
    # Check Mode 1 Simulation Assumptions
    sim_est = overview["simulation_estimate"]
    assert sim_est["assumed_raw_alert_time_min"] == 10.0
    assert sim_est["assumed_incident_time_min"] == 3.0
    assert "Assumption" in sim_est["label"]
    
    # Check Mode 2 Initial Measured State
    meas_test = overview["measured_analyst_test"]
    assert meas_test["evaluation_status"] == "Not evaluated", f"Expected 'Not evaluated', got {meas_test['evaluation_status']}"
    assert meas_test["has_measured_data"] is False
    assert meas_test["measured_percentage_reduction"] is None
    print(f"  [PASS] Overview returns 3,000 alerts, {overview['grouped_incidents']} grouped incidents, and {overview['critical_incidents']} critical.")
    print("  [PASS] Mode 1 Simulation is clearly marked as assumptions.")
    print("  [PASS] Mode 2 Empirical Test is strictly 'Not evaluated'.")

    # 4. Incident Queue & Asset Criticality Sorting (View B)
    print("\n[4/9] Checking /api/incidents (View B)...")
    status, body = http_get(f"{BASE_API}/incidents")
    assert status == 200
    inc_data = json.loads(body)
    incidents = inc_data["incidents"]
    assert len(incidents) > 0
    
    # Verify highest ranked incidents have Critical asset criticality
    top_incident = incidents[0]
    assert top_incident["priority"] == "P1-Critical"
    assert top_incident["asset_criticality"] == "Critical"
    print(f"  [PASS] Incident queue verified. Top incident: {top_incident['incident_id']} - {top_incident['title']} (Asset: {top_incident['asset_criticality']}, Priority: {top_incident['priority']})")

    # 5. Incident Details, MITRE Mappings & Shift Brief (View C)
    print(f"\n[5/9] Checking /api/incidents/{top_incident['incident_id']} details...")
    status, body = http_get(f"{BASE_API}/incidents/{top_incident['incident_id']}")
    assert status == 200
    inc_detail = json.loads(body)
    
    # Verify correlation reason & priority reason
    assert inc_detail["correlation_reason"] != ""
    assert inc_detail["priority_reason"] != ""
    assert len(inc_detail["alerts"]) > 0
    
    # Verify MITRE Mapping with evidence
    assert len(inc_detail["mitre_mappings"]) > 0
    first_mitre = inc_detail["mitre_mappings"][0]
    assert first_mitre["technique_id"].startswith("T")
    assert first_mitre["evidence_found"] != ""
    
    # Verify AI Shift Brief
    brief = inc_detail["shift_brief"]
    assert brief["what_happened"] != ""
    assert brief["affected_asset"] != ""
    assert len(brief["investigation_points"]) > 0
    print(f"  [PASS] Incident details verified. Correlation reason: '{inc_detail['correlation_reason'][:60]}...'")
    print(f"  [PASS] MITRE Technique: {first_mitre['technique_id']} ({first_mitre['technique_name']}) with supporting evidence.")
    print(f"  [PASS] AI Shift Brief verified with {len(brief['investigation_points'])} investigation points.")

    # 6. Human-in-the-Loop Analyst Review
    print(f"\n[6/9] Testing Analyst Review Workflow on {top_incident['incident_id']}...")
    review_payload = {
        "action": "confirm",
        "elapsed_seconds": 18.5,
        "note": "Shift 1 analyst verified and confirmed incident against EDR telemetry."
    }
    status, body = http_post(f"{BASE_API}/incidents/{top_incident['incident_id']}/review", review_payload)
    assert status == 200
    rev_res = json.loads(body)
    assert rev_res["success"] is True
    assert rev_res["incident"]["investigation_status"] == "Confirmed"
    assert "Shift 1 analyst verified" in rev_res["incident"]["shift_brief"]["analyst_notes"][-1]
    print("  [PASS] Human analyst confirmed the incident; status updated to 'Confirmed'.")
    print("  [PASS] Analyst review session recorded with start/end timestamps and elapsed time (18.5s).")

    # 7. Triage Impact & Dual-Mode MTTT (View D)
    print("\n[7/9] Checking /api/mttt with customizable simulation parameters...")
    # Check customizable simulation parameters (e.g. 15 min raw, 2.5 min incident)
    status, body = http_get(f"{BASE_API}/mttt?assumed_raw_min=15.0&assumed_inc_min=2.5")
    assert status == 200
    mttt = json.loads(body)
    sim = mttt["simulation_estimate"]
    assert sim["assumed_raw_alert_time_min"] == 15.0
    assert sim["assumed_incident_time_min"] == 2.5
    expected_base = round((3000 * 15.0) / 60.0, 2)
    assert sim["simulated_baseline_hours"] == expected_base
    print(f"  [PASS] Mode 1 Simulation supports customizable benchmarks: {sim['assumed_raw_alert_time_min']}m raw -> {sim['simulated_baseline_hours']}h baseline workload.")

    # Check Mode 2: Currently has only 1 assisted session, so raw sessions count is 0 -> still "Not evaluated"
    meas = mttt["measured_analyst_test"]
    assert meas["evaluation_status"] == "Not evaluated"
    assert meas["raw_sessions_count"] == 0
    assert meas["assisted_sessions_count"] >= 1
    print("  [PASS] Mode 2 correctly remains 'Not evaluated' until BOTH raw and assisted trials exist.")

    # 8. Complete Empirical Raw Alert Trial & Evaluate Mode 2
    print("\n[8/9] Recording empirical Raw Alert triage trial...")
    raw_trial = {
        "session_type": "raw_alert",
        "target_id": "ALT-SAMPLE-10042",
        "start_timestamp": "2026-09-19T06:20:00Z",
        "end_timestamp": "2026-09-19T06:21:40Z",
        "duration_seconds": 100.0,
        "analyst_decision": "Manual Inspection Completed (Ticket Filed)"
    }
    status, body = http_post(f"{BASE_API}/mttt/session/record", raw_trial)
    assert status == 200
    trial_res = json.loads(body)
    updated_meas = trial_res["updated_mttt"]["measured_analyst_test"]
    
    # Now both conditions exist!
    assert updated_meas["evaluation_status"] == "Evaluated (Empirical Data)"
    assert updated_meas["has_measured_data"] is True
    assert updated_meas["raw_sessions_count"] >= 1
    assert updated_meas["assisted_sessions_count"] >= 1
    assert updated_meas["measured_baseline_mttt_seconds"] == 100.0
    assert updated_meas["measured_assisted_mttt_seconds"] == 18.5
    assert updated_meas["measured_difference_seconds"] == 81.5
    # Percentage reduction: (100 - 18.5) / 100 * 100 = 81.5%
    assert updated_meas["measured_percentage_reduction"] == 81.5
    print("  [PASS] Recorded raw alert trial (100.0s).")
    print(f"  [PASS] Mode 2 status is now: '{updated_meas['evaluation_status']}'.")
    print(f"  [PASS] Empirical Baseline MTTT: {updated_meas['measured_baseline_mttt_seconds']}s")
    print(f"  [PASS] Empirical Assisted MTTT: {updated_meas['measured_assisted_mttt_seconds']}s")
    print(f"  [PASS] Empirical Reduction: {updated_meas['measured_percentage_reduction']}% ({updated_meas['measured_difference_seconds']}s saved per triage)")

    # 9. Raw Telemetry Lake Inspection View
    print("\n[9/9] Checking /api/alerts (Telemetry Lake)...")
    status, body = http_get(f"{BASE_API}/alerts?limit=10&offset=0")
    assert status == 200
    lake = json.loads(body)
    assert lake["total"] == 3000
    assert len(lake["alerts"]) == 10
    print(f"  [PASS] Telemetry lake verified: 3,000 alerts accessible with pagination.")

    print("\n=================================================================")
    print("   ALL 9 ENDPOINT & WORKFLOW CHECKS PASSED WITH 100% SUCCESS!    ")
    print("=================================================================")

if __name__ == "__main__":
    run_verification()
