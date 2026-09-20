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
    Persists only the human-in-the-loop review state for a specific incident.
    Does NOT persist raw telemetry or entire alert sets.
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
            "last_updated": datetime.now(timezone.utc).isoformat()
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
    Rehydrates existing incidents in memory with previously saved human review decisions.
    Returns the count of incidents rehydrated.
    """
    saved_reviews = load_reviews(file_path)
    if not saved_reviews:
        return 0

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

            rehydrated_count += 1

    return rehydrated_count
