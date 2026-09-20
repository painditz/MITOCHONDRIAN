# backend/mttt_persistence.py - Lightweight JSON persistence for empirical MTTT triage sessions
import os
import json
from typing import List, Dict, Any
from models import TriageSessionRecord

DEFAULT_STORAGE_PATH = os.path.join(os.path.dirname(__file__), "data", "mttt_sessions.json")

def load_mttt_sessions(file_path: str = DEFAULT_STORAGE_PATH) -> List[TriageSessionRecord]:
    """
    Safely loads saved analyst trial sessions from local JSON.
    Returns empty list if file does not exist, is empty, or is malformed.
    """
    if not os.path.exists(file_path):
        return []

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if not content:
                return []
            data = json.loads(content)
            if not isinstance(data, list):
                return []
            
            sessions = []
            for item in data:
                try:
                    # Validate schema
                    sessions.append(TriageSessionRecord(**item))
                except Exception as ve:
                    print(f"[MTTTPersistence] Warning: Skipping malformed record ({ve})")
            return sessions
    except (json.JSONDecodeError, OSError) as e:
        print(f"[MTTTPersistence] Warning: Could not parse {file_path} ({e}). Returning empty sessions.")
        return []

def save_mttt_session(session: TriageSessionRecord, file_path: str = DEFAULT_STORAGE_PATH) -> bool:
    """
    Appends and persists an empirical analyst triage session to local JSON.
    Stores only actual stopwatch session telemetry (session_id, timestamps, duration, decision).
    Uses atomic writing to prevent corruption.
    """
    try:
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        existing_sessions = load_mttt_sessions(file_path)

        # Check if already present by session_id; if so update, otherwise append
        session_dict = session.model_dump() if hasattr(session, "model_dump") else session.dict()
        
        found = False
        updated_list = []
        for s in existing_sessions:
            if s.session_id == session.session_id:
                updated_list.append(session_dict)
                found = True
            else:
                updated_list.append(s.model_dump() if hasattr(s, "model_dump") else s.dict())

        if not found:
            updated_list.append(session_dict)

        tmp_path = f"{file_path}.tmp"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(updated_list, f, indent=2)
        os.replace(tmp_path, file_path)
        return True
    except Exception as e:
        print(f"[MTTTPersistence] Error saving session {session.session_id}: {e}")
        return False
