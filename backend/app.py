# backend/app.py - FastAPI Application for Microsoft Problem Statement #25
import os
import json
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
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
from graph_engine import build_authoritative_graph

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
    action: str  # confirm, reject, escalate, need_more_evidence, modify, investigated, in_review, override_priority
    analyst_decision: Optional[str] = None
    confidence: Optional[str] = None  # LOW, MEDIUM, HIGH
    analyst_confidence: Optional[str] = None
    reason: Optional[str] = None
    analyst_reason: Optional[str] = None
    note: Optional[str] = None
    analyst_note: Optional[str] = None
    priority_override: Optional[str] = None  # P1, P2, P3, P4
    analyst_priority_override: Optional[str] = None
    priority_reason: Optional[str] = None
    analyst_priority_reason: Optional[str] = None
    modified_brief_text: Optional[str] = None
    elapsed_seconds: Optional[float] = 0.0
    actor: Optional[str] = "Analyst (SOC Tier-1)"

class AiBriefReviewRequest(BaseModel):
    rating: str  # Accurate, Mostly accurate, Missing evidence, Incorrect information, Requires modification
    action: str  # accept, modify, reject
    modified_text: Optional[str] = None
    note: Optional[str] = None
    actor: Optional[str] = "Analyst (SOC Tier-1)"

class EvidenceReviewRequest(BaseModel):
    evidence_key: str  # Shared Host, Shared User, Shared External IP, Temporal Proximity
    value: Optional[str] = None
    action: str  # accept, challenge
    challenge_reason: Optional[str] = None  # Incorrect relationship, Coincidental timing, Shared infrastructure, Insufficient evidence, Other
    note: Optional[str] = None
    actor: Optional[str] = "Analyst (SOC Tier-1)"

class CorrelationReviewRequest(BaseModel):
    target_incident_id: str
    action: str  # accept, challenge, reject
    challenge_reason: Optional[str] = None  # Incorrect relationship, Coincidental timing, Shared infrastructure, Insufficient evidence, Other
    note: Optional[str] = None
    evidence_types: Optional[List[str]] = Field(default_factory=list)
    actor: Optional[str] = "Analyst (SOC Tier-1)"

class MergeIncidentsRequest(BaseModel):
    incident_ids: List[str]
    reason: Optional[str] = None
    actor: Optional[str] = "Analyst (SOC Tier-1)"

class SplitIncidentRequest(BaseModel):
    clusters: List[Dict[str, Any]]
    reason: Optional[str] = None
    actor: Optional[str] = "Analyst (SOC Tier-1)"

class AddAnalystNoteRequest(BaseModel):
    note: str
    author: Optional[str] = "Analyst (SOC Tier-1)"

class MitreReviewRequest(BaseModel):
    technique_id: str
    action: str  # verify, challenge
    note: Optional[str] = None
    actor: Optional[str] = "Analyst (SOC Tier-1)"

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

@app.get("/api/graph")
def get_correlation_graph(incident_id: Optional[str] = None):
    """
    Authoritative Correlation Graph Contract:
    Returns the real graph nodes and evidence-backed edges derived directly from
    the correlation engine (Observable HOST, USER, EXTERNAL IP, and TIME WINDOW evidence).
    Zero synthetic fields. Zero distance heuristics.
    """
    return build_authoritative_graph(INCIDENTS, target_incident_id=incident_id)

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
    Human-in-the-Loop 2.0 Review Controls:
    Confirm, Reject, Escalate, Need More Evidence, Modify, Mark Investigated.
    Records analyst confidence, reason, priority overrides, structured notes,
    and maintains full provenance and auditable review history.
    """
    target = None
    for inc in INCIDENTS:
        if inc.incident_id == incident_id:
            target = inc
            break

    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    prev_status = target.investigation_status
    prev_priority = target.priority

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

    # 1. Map Action to Explicit Investigation State
    action = req.action.lower()
    decision_map = {
        "confirm": "CONFIRM",
        "confirmed": "CONFIRM",
        "reject": "REJECT",
        "rejected": "REJECT",
        "escalate": "ESCALATE",
        "escalated": "ESCALATE",
        "need_more_evidence": "NEEDS MORE EVIDENCE",
        "needs_more_evidence": "NEEDS MORE EVIDENCE",
        "need more evidence": "NEEDS MORE EVIDENCE",
        "needs more evidence": "NEEDS MORE EVIDENCE",
        "investigated": "INVESTIGATED",
        "investigate": "INVESTIGATED",
        "modify": "MODIFY",
        "modified": "MODIFY",
        "in_review": "IN REVIEW",
        "under review": "IN REVIEW",
    }
    clean_decision = req.analyst_decision or decision_map.get(action, req.action.upper())
    if action != "override_priority":
        target.analyst_decision = clean_decision
    target.analyst_confidence = (req.analyst_confidence or req.confidence or "HIGH").upper()
    if req.analyst_reason or req.reason:
        target.analyst_reason = req.analyst_reason or req.reason
    if req.analyst_note or req.note:
        target.analyst_note = req.analyst_note or req.note

    if action in ["confirm", "confirmed"]:
        target.investigation_status = "CONFIRMED"
        target.shift_brief.analyst_status = "Confirmed by Analyst"
    elif action in ["reject", "rejected"]:
        target.investigation_status = "REJECTED"
        target.shift_brief.analyst_status = "Rejected by Analyst (False Positive / Benign)"
    elif action in ["escalate", "escalated"]:
        target.investigation_status = "ESCALATED"
        target.shift_brief.analyst_status = "Escalated by Analyst to Tier-2 / IR"
    elif action in ["need_more_evidence", "needs_more_evidence", "need more evidence", "needs more evidence"]:
        target.investigation_status = "NEEDS MORE EVIDENCE"
        target.shift_brief.analyst_status = "Pending Additional Evidence"
    elif action in ["investigated", "investigate"]:
        target.investigation_status = "INVESTIGATED"
        target.shift_brief.analyst_status = "Investigation Completed & Documented"
    elif action in ["modify", "modified", "in_review", "under review"]:
        target.investigation_status = "IN REVIEW"
        target.shift_brief.analyst_status = "Modified by Analyst"

    # 2. Priority Override (Never overwrites system calculated priority)
    prio_override = req.analyst_priority_override or req.priority_override
    prio_reason = req.analyst_priority_reason or req.priority_reason or target.analyst_reason or "Critical asset requires priority override"
    if prio_override:
        target.analyst_priority_override = prio_override
        target.analyst_priority_reason = prio_reason
        target.review_history.append({
            "timestamp": now_iso,
            "actor": req.actor or "ANALYST",
            "action": "Priority overridden",
            "previous_state": f"System Priority {prev_priority}",
            "new_state": f"Analyst Priority {prio_override}",
            "details": target.analyst_priority_reason
        })

    # 3. AI Brief Modification
    if req.modified_brief_text:
        orig_text = target.shift_brief.what_happened
        target.shift_brief.custom_brief_text = req.modified_brief_text
        target.ai_brief_review = {
            "rating": "Requires modification",
            "status": "Modified",
            "original_ai_brief": orig_text,
            "analyst_modified_brief": req.modified_brief_text,
            "reviewed_at": now_iso
        }
        target.investigation_checklist["ai_brief_review"] = True
        target.review_history.append({
            "timestamp": now_iso,
            "actor": req.actor or "ANALYST",
            "action": "AI brief modified",
            "previous_state": "Original AI Brief",
            "new_state": "Analyst Modified Brief Active",
            "details": "Modified executive brief text saved with provenance."
        })

    # 4. Analyst Notes (Chronological persistence)
    if req.note and req.note.strip():
        note_str = req.note.strip()
        target.shift_brief.analyst_notes.append(note_str)
        target.structured_notes.append({
            "id": f"NOT-{len(target.structured_notes) + 1}",
            "author": req.actor or "Analyst Marcus (SOC Tier-1)",
            "timestamp": now_iso,
            "text": note_str
        })

    # 5. Chronological Audit History Entry
    target.review_history.append({
        "timestamp": now_iso,
        "actor": req.actor or "ANALYST",
        "action": f"Incident {target.analyst_decision.lower()}",
        "previous_state": prev_status,
        "new_state": target.investigation_status,
        "details": f"Confidence: {target.analyst_confidence} | Reason: {target.analyst_reason or 'None provided'} | Note: {req.note or 'None'}"
    })

    # 6. Update Investigation Completeness
    target.investigation_checklist["human_decision"] = True

    # Persist updated review state
    save_review(target)

    return {
        "success": True,
        "incident": target,
        "updated_mttt": calculate_mttt_metrics(len(RAW_ALERTS), INCIDENTS, SESSION_RECORDS)
    }

@app.post("/api/incidents/{incident_id}/ai-brief-review")
def review_ai_brief(incident_id: str, req: AiBriefReviewRequest):
    """Explicitly accepts, challenges, or modifies the AI Shift-Handover Brief."""
    target = next((i for i in INCIDENTS if i.incident_id == incident_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    orig_brief = target.shift_brief.what_happened
    status = "Accepted" if req.action.lower() == "accept" else "Modified" if req.action.lower() == "modify" else "Rejected"

    modified_text = req.modified_text if req.action.lower() == "modify" else None
    if modified_text:
        target.shift_brief.custom_brief_text = modified_text

    target.ai_brief_review = {
        "rating": req.rating,
        "status": status,
        "original_ai_brief": orig_brief,
        "analyst_modified_brief": modified_text,
        "reviewed_at": now_iso,
        "note": req.note
    }

    if req.note and req.note.strip():
        target.shift_brief.analyst_notes.append(f"[AI Brief Review - {status}]: {req.note.strip()}")
        target.structured_notes.append({
            "id": f"NOT-{len(target.structured_notes) + 1}",
            "author": req.actor or "Analyst Marcus (SOC Tier-1)",
            "timestamp": now_iso,
            "text": f"[AI Brief - {status}]: {req.note.strip()}"
        })

    target.review_history.append({
        "timestamp": now_iso,
        "actor": req.actor or "ANALYST",
        "action": f"AI brief {status.lower()}",
        "previous_state": "Pending Review",
        "new_state": f"AI Brief {status} ({req.rating})",
        "details": req.note or f"Rating: {req.rating}"
    })

    target.investigation_checklist["ai_brief_review"] = True
    save_review(target)

    return {
        "success": True,
        "incident_id": incident_id,
        "ai_brief_review": target.ai_brief_review
    }

@app.post("/api/incidents/{incident_id}/evidence-review")
def review_evidence_item(incident_id: str, req: EvidenceReviewRequest):
    """Reviews individual correlation evidence items (Host, User, External IP, Temporal)."""
    target = next((i for i in INCIDENTS if i.incident_id == incident_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    status = "ACCEPTED" if req.action.lower() == "accept" else "CHALLENGED"

    # Update or append evidence review
    existing = next((e for e in target.evidence_reviews if e.get("evidence_key") == req.evidence_key), None)
    rev_item = {
        "evidence_key": req.evidence_key,
        "value": req.value,
        "status": status,
        "challenge_reason": req.challenge_reason,
        "note": req.note,
        "reviewed_at": now_iso
    }

    if existing:
        target.evidence_reviews.remove(existing)
    target.evidence_reviews.append(rev_item)

    if req.note:
        target.structured_notes.append({
            "id": f"NOT-{len(target.structured_notes) + 1}",
            "author": req.actor or "Analyst (SOC Tier-1)",
            "timestamp": now_iso,
            "text": f"[Evidence {req.evidence_key} - {status}]: {req.challenge_reason or ''} - {req.note}"
        })

    target.review_history.append({
        "timestamp": now_iso,
        "actor": req.actor or "ANALYST",
        "action": f"Evidence {status.lower()}: {req.evidence_key}",
        "previous_state": "System Detected",
        "new_state": status,
        "details": f"Reason: {req.challenge_reason or 'Validated'} | Note: {req.note or 'None'}"
    })

    target.investigation_checklist["evidence_review"] = True
    save_review(target)

    return {
        "success": True,
        "incident_id": incident_id,
        "evidence_reviews": target.evidence_reviews
    }

@app.post("/api/incidents/{incident_id}/correlation-review")
def review_correlation(incident_id: str, req: CorrelationReviewRequest):
    """Challenges or accepts a pairwise incident correlation edge while preserving system state."""
    target = next((i for i in INCIDENTS if i.incident_id == incident_id), None)
    partner = next((i for i in INCIDENTS if i.incident_id == req.target_incident_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    status = "ACCEPTED" if req.action.lower() == "accept" else "CHALLENGED"

    rev_item = {
        "target_incident_id": req.target_incident_id,
        "status": status,
        "challenge_reason": req.challenge_reason,
        "note": req.note,
        "evidence_types": req.evidence_types or ["Shared Observable"],
        "reviewed_at": now_iso
    }

    existing = next((c for c in target.correlation_reviews if c.get("target_incident_id") == req.target_incident_id), None)
    if existing:
        target.correlation_reviews.remove(existing)
    target.correlation_reviews.append(rev_item)

    target.review_history.append({
        "timestamp": now_iso,
        "actor": req.actor or "ANALYST",
        "action": f"Correlation {status.lower()}",
        "previous_state": "System Correlation Detected",
        "new_state": f"{status} vs {req.target_incident_id}",
        "details": f"Reason: {req.challenge_reason or 'Verified'} | Note: {req.note or 'None'}"
    })

    target.investigation_checklist["correlation_review"] = True
    save_review(target)

    # Sync back to partner if exists
    if partner:
        p_existing = next((c for c in partner.correlation_reviews if c.get("target_incident_id") == incident_id), None)
        if p_existing:
            partner.correlation_reviews.remove(p_existing)
        partner.correlation_reviews.append({
            "target_incident_id": incident_id,
            "status": status,
            "challenge_reason": req.challenge_reason,
            "note": req.note,
            "evidence_types": req.evidence_types or ["Shared Observable"],
            "reviewed_at": now_iso
        })
        partner.investigation_checklist["correlation_review"] = True
        save_review(partner)

    return {
        "success": True,
        "incident_id": incident_id,
        "correlation_reviews": target.correlation_reviews
    }

@app.post("/api/incidents/merge")
def merge_incidents(req: MergeIncidentsRequest):
    """Proposes or confirms an analyst-reviewed merge between 2 or more incident clusters."""
    if len(req.incident_ids) < 2:
        raise HTTPException(status_code=400, detail="At least two incidents are required for a merge proposal.")

    involved = [i for i in INCIDENTS if i.incident_id in req.incident_ids]
    if len(involved) < 2:
        raise HTTPException(status_code=404, detail="One or more specified incidents could not be found.")

    now_iso = datetime.now(timezone.utc).isoformat()
    merge_id = f"MRG-{int(datetime.now().timestamp())}"

    proposal = {
        "merge_id": merge_id,
        "merged_incidents": req.incident_ids,
        "actor": req.actor or "Analyst Marcus (SOC Tier-1)",
        "reason": req.reason or "Analyst confirmed shared attack vector and infrastructure.",
        "timestamp": now_iso,
        "status": "ANALYST_MERGED"
    }

    for inc in involved:
        inc.merge_proposals.append(proposal)
        inc.review_history.append({
            "timestamp": now_iso,
            "actor": req.actor or "ANALYST",
            "action": f"Incident merge confirmed ({merge_id})",
            "previous_state": f"Independent Cluster ({inc.incident_id})",
            "new_state": f"Merged with {', '.join([x for x in req.incident_ids if x != inc.incident_id])}",
            "details": proposal["reason"]
        })
        save_review(inc)

    return {
        "success": True,
        "merge_id": merge_id,
        "merged_incidents": req.incident_ids,
        "message": f"Successfully created analyst-reviewed merge between {len(req.incident_ids)} incidents."
    }

@app.post("/api/incidents/{incident_id}/split")
def split_incident(incident_id: str, req: SplitIncidentRequest):
    """Proposes or confirms an analyst-reviewed split of an incident into sub-clusters."""
    target = next((i for i in INCIDENTS if i.incident_id == incident_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    split_id = f"SPL-{int(datetime.now().timestamp())}"

    proposal = {
        "split_id": split_id,
        "original_incident": incident_id,
        "clusters": req.clusters,
        "reason": req.reason or "Analyst proposed split into separate attack threads.",
        "actor": req.actor or "Analyst Marcus (SOC Tier-1)",
        "timestamp": now_iso,
        "status": "ANALYST_SPLIT"
    }

    target.split_proposals.append(proposal)
    target.review_history.append({
        "timestamp": now_iso,
        "actor": req.actor or "ANALYST",
        "action": f"Incident split proposed ({split_id})",
        "previous_state": f"Unified Cluster ({target.alert_count} alerts)",
        "new_state": f"Split into {len(req.clusters)} sub-clusters",
        "details": proposal["reason"]
    })
    save_review(target)

    return {
        "success": True,
        "split_id": split_id,
        "split_proposal": proposal,
        "message": f"Successfully recorded analyst-reviewed split proposal for {incident_id}."
    }

@app.post("/api/incidents/{incident_id}/notes")
def add_incident_note(incident_id: str, req: AddAnalystNoteRequest):
    """Appends a timestamped, authored note to the incident's persistent chronological audit trail."""
    target = next((i for i in INCIDENTS if i.incident_id == incident_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    note_text = req.note.strip()
    if not note_text:
        raise HTTPException(status_code=400, detail="Note cannot be empty")

    note_obj = {
        "id": f"NOT-{len(target.structured_notes) + 1}",
        "author": req.author or "Analyst Marcus (SOC Tier-1)",
        "timestamp": now_iso,
        "text": note_text,
        "note": note_text
    }
    target.structured_notes.append(note_obj)
    target.shift_brief.analyst_notes.append(note_text)

    target.review_history.append({
        "timestamp": now_iso,
        "actor": req.author or "ANALYST",
        "action": "Analyst note added",
        "previous_state": None,
        "new_state": None,
        "details": note_text
    })

    save_review(target)

    return {
        "success": True,
        "incident_id": incident_id,
        "note": note_obj,
        "notes": target.structured_notes,
        "total_notes": len(target.structured_notes)
    }

@app.post("/api/incidents/{incident_id}/mitre-review")
def review_mitre_mapping(incident_id: str, req: MitreReviewRequest):
    """Verifies or challenges a specific MITRE ATT&CK technique mapping."""
    target = next((i for i in INCIDENTS if i.incident_id == incident_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="Incident not found")

    now_iso = datetime.now(timezone.utc).isoformat()
    target.review_history.append({
        "timestamp": now_iso,
        "actor": req.actor or "ANALYST",
        "action": "MITRE mapping verified" if req.action.lower() == "verify" else "MITRE mapping challenged",
        "previous_state": "Heuristic ATT&CK Attribution",
        "new_state": f"{req.technique_id} {req.action.capitalize()}",
        "details": req.note or "Analyst reviewed forensic proof command/API."
    })
    target.investigation_checklist["mitre_review"] = True
    save_review(target)

    return {
        "success": True,
        "incident_id": incident_id,
        "mitre_checklist_status": True
    }

@app.get("/api/reviews/summary")
def get_reviews_summary():
    """
    Returns live calculated analyst review metrics, queue counts, and analytics.
    Zero synthetic or hardcoded numbers. Strictly derived from stored review state.
    """
    needs_review_count = 0
    ai_briefs_pending = 0
    correlations_reviewed = 0
    escalated_count = 0
    investigated_count = 0
    confirmed_count = 0
    rejected_count = 0
    overrides_count = 0
    incidents_reviewed_count = 0

    decision_breakdown = {}
    ai_acceptance_breakdown = {"Accepted": 0, "Modified": 0, "Rejected": 0}
    priority_overrides_list = []
    correlation_challenges_count = 0
    total_merges = 0
    total_splits = 0

    seen_merges = set()
    seen_splits = set()

    for inc in INCIDENTS:
        status_norm = (inc.investigation_status or "NEEDS REVIEW").upper()
        if status_norm in ["NEW", "NEEDS REVIEW", "IN REVIEW", "NEEDS MORE EVIDENCE"]:
            needs_review_count += 1
        if status_norm == "ESCALATED":
            escalated_count += 1
        if status_norm == "INVESTIGATED":
            investigated_count += 1
        if status_norm == "CONFIRMED":
            confirmed_count += 1
        if status_norm == "REJECTED":
            rejected_count += 1

        if inc.analyst_priority_override:
            overrides_count += 1
            priority_overrides_list.append({
                "incident_id": inc.incident_id,
                "system_priority": inc.priority,
                "analyst_priority": inc.analyst_priority_override,
                "reason": inc.analyst_priority_reason
            })

        if inc.analyst_decision:
            incidents_reviewed_count += 1
            d_name = inc.analyst_decision.upper()
            decision_breakdown[d_name] = decision_breakdown.get(d_name, 0) + 1
        elif status_norm in ["CONFIRMED", "REJECTED", "ESCALATED", "INVESTIGATED"]:
            incidents_reviewed_count += 1

        if inc.ai_brief_review and inc.ai_brief_review.get("status"):
            st = inc.ai_brief_review.get("status", "Accepted").capitalize()
            ai_acceptance_breakdown[st] = ai_acceptance_breakdown.get(st, 0) + 1
        else:
            ai_briefs_pending += 1

        if inc.correlation_reviews:
            for cr in inc.correlation_reviews:
                correlations_reviewed += 1
                if cr.get("status") == "CHALLENGED":
                    correlation_challenges_count += 1

        for mp in (inc.merge_proposals or []):
            m_id = mp.get("merge_id")
            if m_id and m_id not in seen_merges:
                seen_merges.add(m_id)
                total_merges += 1

        for sp in (inc.split_proposals or []):
            s_id = sp.get("split_id")
            if s_id and s_id not in seen_splits:
                seen_splits.add(s_id)
                total_splits += 1

    has_data = incidents_reviewed_count > 0 or len(seen_merges) > 0 or correlations_reviewed > 0

    return {
        "queue_counts": {
            "needs_review": needs_review_count,
            "ai_briefs": ai_briefs_pending,
            "correlations": correlations_reviewed,
            "escalated": escalated_count,
            "investigated": investigated_count
        },
        "kpi_metrics": {
            "incidents_reviewed": incidents_reviewed_count,
            "ai_briefs_reviewed": sum(ai_acceptance_breakdown.values()),
            "analyst_confirmations": confirmed_count,
            "analyst_rejections": rejected_count,
            "analyst_overrides": overrides_count,
            "open_reviews": needs_review_count
        },
        "has_empirical_data": has_data,
        "analytics": {
            "decisions": decision_breakdown,
            "ai_brief_acceptance": ai_acceptance_breakdown,
            "priority_overrides": priority_overrides_list,
            "correlation_challenges": correlation_challenges_count,
            "merge_decisions": total_merges,
            "split_decisions": total_splits
        }
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
