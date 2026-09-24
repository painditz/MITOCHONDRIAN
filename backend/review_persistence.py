# backend/review_persistence.py - Lightweight JSON persistence for analyst reviews
import os
import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from models import Incident

DEFAULT_STORAGE_PATH = os.path.join(os.path.dirname(__file__), "data", "analyst_reviews.json")

def load_reviews(file_path: str = DEFAULT_STORAGE_PATH) -> Dict[str, Dict[str, Any]]:
    """
    Safely loads saved analyst reviews from a local JSON file.
    Returns empty dict if file does not exist, is empty, or is malformed.
    """
    if not os.path.exists(file_path):
        return {}
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return {}
            data = json.loads(content)
            if isinstance(data, dict):
                return data
            return {}
    except (json.JSONDecodeError, OSError) as e:
        print(f"[ReviewPersistence] Warning: Could not parse {file_path} ({e}). Returning empty reviews.")
        return {}

def save_review(incident: Incident, file_path: str = DEFAULT_STORAGE_PATH) -> bool:
    """
    Persists the human-in-the-loop 2.0 review state for a specific incident.
    Preserves existing legacy review fields for backward compatibility,
    and saves new enterprise decision fields, evidence challenges, AI brief reviews,
    structured notes, and chronological audit history.
    Uses atomic writing to prevent file corruption.
    """
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        current_data = load_reviews(file_path)

        sb = incident.shift_brief
        review_entry = {
            "incident_id": incident.incident_id,
            "investigation_status": incident.investigation_status,
            "analyst_status": sb.analyst_status if sb else "Pending Review",
            "analyst_notes": list(sb.analyst_notes) if sb else [],
            "custom_brief_text": sb.custom_brief_text if sb else None,
            "analyst_agreement": sb.analyst_agreement if sb else None,
            "analyst_feedback_notes": sb.analyst_feedback_notes if sb else None,
            "review_time_seconds": round(incident.review_time_seconds, 1),
            "last_updated": datetime.now(timezone.utc).isoformat(),
            # Human-in-the-Loop 2.0 Persistence
            "analyst_decision": incident.analyst_decision,
            "analyst_confidence": incident.analyst_confidence,
            "analyst_reason": incident.analyst_reason,
            "analyst_note": incident.analyst_note,
            "analyst_priority_override": incident.analyst_priority_override,
            "analyst_priority_reason": incident.analyst_priority_reason,
            "ai_brief_review": incident.ai_brief_review,
            "evidence_reviews": list(incident.evidence_reviews or []),
            "correlation_reviews": list(incident.correlation_reviews or []),
            "review_history": list(incident.review_history or []),
            "structured_notes": list(incident.structured_notes or []),
            "merge_proposals": list(incident.merge_proposals or []),
            "split_proposals": list(incident.split_proposals or []),
            "investigation_checklist": dict(incident.investigation_checklist or {})
        }

        current_data[incident.incident_id] = review_entry

        # Atomic write via temporary file
        tmp_path = f"{file_path}.tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(current_data, f, indent=2)
        os.replace(tmp_path, file_path)
        return True
    except Exception as e:
        print(f"[ReviewPersistence] Error saving review for {incident.incident_id}: {e}")
        return False

def rehydrate_incidents(incidents: List[Incident], file_path: str = DEFAULT_STORAGE_PATH) -> int:
    """
    Rehydrates existing incidents in memory with previously saved human review decisions
    and initializes audit history for incidents with zero prior human interaction.
    Returns the count of incidents rehydrated.
    """
    saved_reviews = load_reviews(file_path)

    rehydrated_count = 0
    for inc in incidents:
        if inc.incident_id in saved_reviews:
            rev = saved_reviews[inc.incident_id]
            if "investigation_status" in rev and rev["investigation_status"]:
                inc.investigation_status = rev["investigation_status"]
            if "review_time_seconds" in rev:
                inc.review_time_seconds = float(rev["review_time_seconds"])

            if inc.shift_brief:
                if "analyst_status" in rev and rev["analyst_status"]:
                    inc.shift_brief.analyst_status = rev["analyst_status"]
                if "analyst_notes" in rev and isinstance(rev["analyst_notes"], list):
                    inc.shift_brief.analyst_notes = rev["analyst_notes"]
                if "custom_brief_text" in rev:
                    inc.shift_brief.custom_brief_text = rev["custom_brief_text"]
                if "analyst_agreement" in rev:
                    inc.shift_brief.analyst_agreement = rev["analyst_agreement"]
                if "analyst_feedback_notes" in rev:
                    inc.shift_brief.analyst_feedback_notes = rev["analyst_feedback_notes"]

            # Rehydrate Human-in-the-Loop 2.0 fields
            inc.analyst_decision = rev.get("analyst_decision")
            inc.analyst_confidence = rev.get("analyst_confidence")
            inc.analyst_reason = rev.get("analyst_reason")
            inc.analyst_note = rev.get("analyst_note")
            inc.analyst_priority_override = rev.get("analyst_priority_override")
            inc.analyst_priority_reason = rev.get("analyst_priority_reason")
            inc.ai_brief_review = rev.get("ai_brief_review")
            inc.evidence_reviews = rev.get("evidence_reviews") or []
            inc.correlation_reviews = rev.get("correlation_reviews") or []
            inc.review_history = rev.get("review_history") or []
            inc.structured_notes = rev.get("structured_notes") or []
            inc.merge_proposals = rev.get("merge_proposals") or []
            inc.split_proposals = rev.get("split_proposals") or []
            inc.investigation_checklist = rev.get("investigation_checklist") or {
                "evidence_review": False,
                "correlation_review": False,
                "mitre_review": False,
                "ai_brief_review": False,
                "human_decision": False
            }

            rehydrated_count += 1
        else:
            # Normalize default investigation status to explicit state
            if inc.investigation_status in ["New", "Pending Review"]:
                inc.investigation_status = "NEEDS REVIEW"

        # Ensure base audit history exists for provenance
        if not inc.review_history:
            start_iso = inc.start_time if "T" in str(inc.start_time) else datetime.now(timezone.utc).isoformat()
            ai_time = inc.shift_brief.ai_generation_timestamp if inc.shift_brief and inc.shift_brief.ai_generation_timestamp else start_iso
            inc.review_history = [
                {
                    "timestamp": start_iso,
                    "actor": "SYSTEM",
                    "action": "Incident created",
                    "previous_state": None,
                    "new_state": f"{inc.priority} / Risk {inc.risk_score:.1f}",
                    "details": f"Correlated {inc.alert_count} alerts on host {inc.hostname}."
                },
                {
                    "timestamp": ai_time,
                    "actor": "AI",
                    "action": "Shift brief generated",
                    "previous_state": None,
                    "new_state": "Brief Available",
                    "details": f"Generated via local {inc.shift_brief.ai_model_name if inc.shift_brief else 'FLAN-T5'} model with zero data egress."
                }
            ]

        # Sync investigation checklist based on actual state
        if inc.analyst_decision:
            inc.investigation_checklist["human_decision"] = True
        if inc.ai_brief_review and inc.ai_brief_review.get("status"):
            inc.investigation_checklist["ai_brief_review"] = True
        if inc.evidence_reviews and len(inc.evidence_reviews) > 0:
            inc.investigation_checklist["evidence_review"] = True
        if inc.correlation_reviews and len(inc.correlation_reviews) > 0:
            inc.investigation_checklist["correlation_review"] = True
        if any(h.get("action") == "MITRE mapping verified" for h in inc.review_history):
            inc.investigation_checklist["mitre_review"] = True

    return rehydrated_count
