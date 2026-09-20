# backend/app.py - FastAPI Application for Microsoft Problem Statement #25
import os
import json
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from models import (
    RawAlert, NormalizedAlert, Incident, MTTTMetrics, ShiftBrief,
    TriageSessionRecord, SimulationEstimate, MeasuredAnalystTest,
    MLEvaluationReport
)
from ingestion import generate_alerts, generate_3000_alerts
from normalization import normalize_batch
from correlation import correlate_normalized_alerts
from ai_briefer import enrich_incidents_with_briefs
from mttt_calculator import calculate_mttt_metrics
from ml.inference import score_normalized_alerts
from review_persistence import save_review, rehydrate_incidents
from mttt_persistence import load_mttt_sessions, save_mttt_session

app = FastAPI(
    title="3,000 Alerts, One Analyst - Microsoft Problem Statement #25",
    description="Autonomous alert correlation, asset-criticality prioritization, and AI shift-briefing platform for Tier-1 SOC analysts.",
    version="2.1.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory State Store
RAW_ALERTS: List[RawAlert] = []
NORMALIZED_ALERTS: List[NormalizedAlert] = []
INCIDENTS: List[Incident] = []
SESSION_RECORDS: List[TriageSessionRecord] = []
ML_TRIAGE_SUMMARY: Dict[str, Any] = {}

def initialize_pipeline(count: Optional[int] = None):
    global RAW_ALERTS, NORMALIZED_ALERTS, INCIDENTS, SESSION_RECORDS, ML_TRIAGE_SUMMARY
    target_count = count or int(os.environ.get("ALERT_VOLUME", "3000"))
    print(f"[Pipeline] Generating {target_count:,} synthetic raw alerts...")
    RAW_ALERTS = generate_alerts(count=target_count, seed=42)
    print("[Pipeline] Normalizing heterogeneous alert schema...")
    NORMALIZED_ALERTS = normalize_batch(RAW_ALERTS)
    print("[Pipeline] Running ML Alert Relevance & Noise scoring...")
    NORMALIZED_ALERTS, ML_TRIAGE_SUMMARY = score_normalized_alerts(NORMALIZED_ALERTS)
    print(f"[Pipeline] ML Triage Complete: {ML_TRIAGE_SUMMARY.get('predicted_actionable', 0)} actionable, {ML_TRIAGE_SUMMARY.get('predicted_benign', 0)} benign/noise.")
    print("[Pipeline] Executing correlation and incident grouping...")
    raw_incidents = correlate_normalized_alerts(NORMALIZED_ALERTS)
    print("[Pipeline] Generating evidence-grounded AI shift briefs...")
    INCIDENTS = enrich_incidents_with_briefs(raw_incidents)
    rehydrated = rehydrate_incidents(INCIDENTS)
    if rehydrated > 0:
        print(f"[Pipeline] Rehydrated {rehydrated} analyst review records from persistent storage.")
    SESSION_RECORDS = load_mttt_sessions()
    if len(SESSION_RECORDS) > 0:
        print(f"[Pipeline] Rehydrated {len(SESSION_RECORDS)} empirical MTTT triage sessions from persistent storage.")
    print(f"[Pipeline] Successfully formed {len(INCIDENTS)} incidents from {len(RAW_ALERTS)} alerts.")

# Run initial pipeline on startup
initialize_pipeline()

# Request schemas
class AnalystReviewRequest(BaseModel):
    action: str  # confirm, reject, investigated, modify, add_note
    note: Optional[str] = None
    modified_brief_text: Optional[str] = None
    elapsed_seconds: Optional[float] = 0.0

class RecordSessionRequest(BaseModel):
    session_type: str  # "raw_alert" | "assisted_incident"
    target_id: str
    start_timestamp: str
    end_timestamp: str
    duration_seconds: float
    analyst_decision: str

@app.get("/api/overview")
def get_soc_overview():
    """SOC Overview: View A required by Problem #25"""
    crit_count = sum(1 for inc in INCIDENTS if inc.priority == "P1-Critical")
    high_count = sum(1 for inc in INCIDENTS if inc.priority == "P2-High")
    med_count = sum(1 for inc in INCIDENTS if inc.priority == "P3-Medium")
    low_count = sum(1 for inc in INCIDENTS if inc.priority == "P4-Low")

    mttt = calculate_mttt_metrics(len(RAW_ALERTS), INCIDENTS, SESSION_RECORDS)

    return {
        "total_alerts": len(RAW_ALERTS),
        "grouped_incidents": len(INCIDENTS),
        "critical_incidents": crit_count,
        "high_incidents": high_count,
        "medium_incidents": med_count,
        "low_incidents": low_count,
        "ml_triage_summary": ML_TRIAGE_SUMMARY,
        "current_triage_workload": f"{mttt.simulation_estimate.simulated_assisted_hours} hours ({len(INCIDENTS)} incidents)",
        "baseline_workload": f"{mttt.simulation_estimate.simulated_baseline_hours} hours ({len(RAW_ALERTS)} raw alerts)",
        "simulation_estimate": mttt.simulation_estimate,
        "measured_analyst_test": mttt.measured_analyst_test,
        "measured_mttt": mttt
    }

@app.get("/api/incidents")
def get_incident_queue(
    priority: Optional[str] = None,
    asset_criticality: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None
):
    """Incident Queue: View B required by Problem #25"""
    filtered = INCIDENTS

    if priority and priority != "All":
        filtered = [i for i in filtered if i.priority == priority]

    if asset_criticality and asset_criticality != "All":
        filtered = [i for i in filtered if i.asset_criticality.lower() == asset_criticality.lower()]

    if status and status != "All":
        filtered = [i for i in filtered if i.investigation_status.lower() == status.lower()]

    if search:
        q = search.lower()
        filtered = [
            i for i in filtered if (
                q in i.title.lower() or
                q in i.hostname.lower() or
                q in i.user.lower() or
                q in i.incident_id.lower() or
                q in i.correlation_reason.lower()
            )
        ]

    return {
        "total": len(filtered),
        "incidents": filtered
    }

@app.get("/api/incidents/{incident_id}")
def get_incident_detail(incident_id: str):
    """Incident Details: View C required by Problem #25"""
    for inc in INCIDENTS:
        if inc.incident_id == incident_id:
            return inc
    raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/incidents/{incident_id}/review")
def review_incident(incident_id: str, req: AnalystReviewRequest):
    """
    Human-in-the-Loop Review Controls:
    Confirm, Reject, Modify, Add Analyst Note, Mark Investigated.
    Records actual empirical review session.
    """
    target = None
    for inc in INCIDENTS:
        if inc.incident_id == incident_id:
            target = inc
            break

    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    # Record active review time and session
    if req.elapsed_seconds and req.elapsed_seconds > 0:
        target.review_time_seconds += req.elapsed_seconds
        now_dt = datetime.now(timezone.utc)
        start_dt = now_dt - timedelta(seconds=req.elapsed_seconds)
        sess_rec = TriageSessionRecord(
            session_id=f"SES-ASST-{len(SESSION_RECORDS) + 1}",
            session_type="assisted_incident",
            target_id=incident_id,
            start_timestamp=start_dt.isoformat(),
            end_timestamp=now_dt.isoformat(),
            duration_seconds=round(req.elapsed_seconds, 1),
            analyst_decision=req.action.capitalize()
        )
        SESSION_RECORDS.append(sess_rec)
        save_mttt_session(sess_rec)

    # Handle Human Analyst Decision
    action = req.action.lower()
    if action == "confirm":
        target.investigation_status = "Confirmed"
        target.shift_brief.analyst_status = "Confirmed by Analyst"
    elif action == "reject":
        target.investigation_status = "Rejected"
        target.shift_brief.analyst_status = "Rejected by Analyst (False Positive / Benign)"
    elif action == "investigated":
        target.investigation_status = "Investigated"
        target.shift_brief.analyst_status = "Investigation Completed & Documented"
    elif action == "modify":
        if req.modified_brief_text:
            target.shift_brief.custom_brief_text = req.modified_brief_text
            target.investigation_status = "Under Review"
            target.shift_brief.analyst_status = "Modified by Analyst"

    if req.note and req.note.strip():
        target.shift_brief.analyst_notes.append(req.note.strip())

    # Persist updated review state
    save_review(target)

    return {
        "success": True,
        "incident": target,
        "updated_mttt": calculate_mttt_metrics(len(RAW_ALERTS), INCIDENTS, SESSION_RECORDS)
    }

class AnalystFeedbackRequest(BaseModel):
    agreement: str  # "Agreed" | "Disagreed"
    feedback_notes: Optional[str] = None

@app.post("/api/incidents/{incident_id}/feedback")
def record_brief_feedback(incident_id: str, req: AnalystFeedbackRequest):
    """
    Records whether the human SOC analyst agrees with the AI-generated brief.
    Maintains an auditable log of AI performance and analyst feedback.
    """
    target = None
    for inc in INCIDENTS:
        if inc.incident_id == incident_id:
            target = inc
            break

    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    target.shift_brief.analyst_agreement = req.agreement
    if req.feedback_notes:
        target.shift_brief.analyst_feedback_notes = req.feedback_notes
        target.shift_brief.analyst_notes.append(f"[AI Brief Feedback - {req.agreement}]: {req.feedback_notes}")

    # Persist updated review state
    save_review(target)

    return {
        "success": True,
        "incident_id": incident_id,
        "analyst_agreement": target.shift_brief.analyst_agreement,
        "analyst_feedback_notes": target.shift_brief.analyst_feedback_notes,
        "message": f"Analyst feedback '{req.agreement}' successfully recorded."
    }

@app.get("/api/ml/metrics")
def get_ml_metrics():
    """
    Model Evaluation Metrics: View required by Section 12 of Problem #25 upgrade.
    Returns empirical held-out test set metrics (Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix)
    clearly labeled as 'Synthetic Dataset — Model Evaluation', along with live triage distribution.
    """
    metrics_path = os.path.join(os.path.dirname(__file__), "ml", "metrics.json")
    if not os.path.exists(metrics_path):
        raise HTTPException(status_code=404, detail="ML evaluation metrics not found. Run python backend/ml/evaluate.py first.")
    
    with open(metrics_path, "r", encoding="utf-8") as f:
        report_data = json.load(f)
    
    report_data["triage_summary"] = ML_TRIAGE_SUMMARY
    return report_data

@app.post("/api/mttt/session/record")
def record_triage_session(req: RecordSessionRequest):
    """
    Records an empirical analyst trial session (either for a raw alert or an assisted incident).
    Used to calculate actual measured baseline and assisted MTTT.
    """
    rec = TriageSessionRecord(
        session_id=f"SES-{req.session_type.upper()[:4]}-{len(SESSION_RECORDS) + 1}",
        session_type=req.session_type,
        target_id=req.target_id,
        start_timestamp=req.start_timestamp,
        end_timestamp=req.end_timestamp,
        duration_seconds=round(req.duration_seconds, 1),
        analyst_decision=req.analyst_decision
    )
    SESSION_RECORDS.append(rec)
    save_mttt_session(rec)
    return {
        "success": True,
        "recorded_session": rec,
        "updated_mttt": calculate_mttt_metrics(len(RAW_ALERTS), INCIDENTS, SESSION_RECORDS)
    }

@app.get("/api/mttt")
def get_mttt_metrics(
    assumed_raw_min: float = Query(10.0, ge=1.0, le=60.0, description="Assumed manual raw alert triage time (minutes)"),
    assumed_inc_min: float = Query(3.0, ge=0.5, le=30.0, description="Assumed assisted incident triage time (minutes)")
):
    """
    Triage Impact & MTTT Measurement: View D required by Problem #25.
    Calculates both Mode 1 (Simulation Assumptions) and Mode 2 (Empirical Analyst Trials).
    """
    return calculate_mttt_metrics(
        len(RAW_ALERTS), INCIDENTS, SESSION_RECORDS,
        assumed_raw_min=assumed_raw_min,
        assumed_inc_min=assumed_inc_min
    )

@app.get("/api/alerts")
def get_raw_alerts(limit: int = 50, offset: int = 0, search: Optional[str] = None):
    """Paginated Raw Alerts for Inspection"""
    filtered = RAW_ALERTS
    if search:
        q = search.lower()
        filtered = [
            a for a in filtered if (
                q in a.alert_id.lower() or
                q in a.alert_type.lower() or
                q in a.hostname.lower() or
                q in a.description.lower()
            )
        ]

    paginated = filtered[offset:offset + limit]
    return {
        "total": len(filtered),
        "limit": limit,
        "offset": offset,
        "alerts": paginated
    }

@app.post("/api/reset")
def reset_pipeline(count: Optional[int] = Query(None, description="Optional alert volume (default: 3000)")):
    """Resets and regenerates the alert demonstration (defaults to 3,000 official baseline)"""
    initialize_pipeline(count=count)
    return {
        "success": True,
        "message": f"Pipeline reset with {len(RAW_ALERTS):,} freshly synthesized enterprise alerts.",
        "metrics": calculate_mttt_metrics(len(RAW_ALERTS), INCIDENTS, SESSION_RECORDS)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
