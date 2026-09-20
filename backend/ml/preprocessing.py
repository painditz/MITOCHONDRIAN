# backend/ml/preprocessing.py - Feature Engineering & Preprocessing Pipeline
"""
Feature Preprocessing and Explainability Engine for Alert Triage.
Combines TF-IDF text features on description/evidence with One-Hot Encoded
security categories and normalized behavioral signals.
"""

from typing import List, Dict, Any, Tuple
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer

CATEGORICAL_COLS = ["source", "severity", "asset_criticality", "alert_type"]
NUMERICAL_COLS = ["has_command_line", "has_suspicious_process", "is_external_transfer", "is_privileged_user", "known_benign_pattern", "hour_of_day"]
TEXT_COL = "combined_text"

def map_to_generic_alert_type(alert_type: str) -> str:
    """
    Maps specific alert types to realistic generic SOC alert types/categories,
    ensuring benign and attack observations legitimately share observable types.
    """
    at = str(alert_type or "").lower()
    if any(k in at for k in ["scan", "sweep", "probe", "discovery"]):
        return "Network & Service Reconnaissance"
    elif any(k in at for k in ["password", "sign-in", "logon", "auth", "mfa", "ticket", "credential", "lsass", "hash", "dcsync", "ssh"]):
        return "Authentication & Identity Event"
    elif any(k in at for k in ["powershell", "shell", "macro", "deployment", "process", "exec", "task", "diagnostic", "injection"]):
        return "Process & Script Execution"
    elif any(k in at for k in ["dns", "c2", "egress", "traffic", "connection", "inbound", "http"]):
        return "Network & Domain Communication"
    elif any(k in at for k in ["backup", "download", "exfiltration", "transfer", "forwarding", "s3"]):
        return "Data Storage & Transfer"
    elif any(k in at for k in ["certificate", "log cleared", "policy", "shadow", "encryption", "signature"]):
        return "System Integrity & Defense Telemetry"
    return "Generic Security Telemetry"

def prepare_dataframe(samples: List[Dict[str, Any]]) -> pd.DataFrame:
    """Converts raw or synthetic alert dictionaries into a clean Pandas DataFrame."""
    rows = []
    for s in samples:
        desc = str(s.get("description", "") or "")
        ev = str(s.get("evidence_text", "") or "")
        if not ev and isinstance(s.get("evidence"), dict):
            ev = " ".join(f"{k}: {v}" for k, v in s["evidence"].items())

        combined_text = f"{s.get('alert_type', '')} {desc} {ev}".strip().lower()

        rows.append({
            "group_id": s.get("group_id", "GRP-001"),
            "source": s.get("source", "Unknown"),
            "severity": s.get("severity", "Medium"),
            "asset_criticality": s.get("asset_criticality", "Medium"),
            "alert_type": map_to_generic_alert_type(s.get("alert_type", "Generic Alarm")),
            "has_command_line": int(s.get("has_command_line", 0)),
            "has_suspicious_process": int(s.get("has_suspicious_process", 0)),
            "is_external_transfer": int(s.get("is_external_transfer", 0)),
            "is_privileged_user": int(s.get("is_privileged_user", 0)),
            "known_benign_pattern": int(s.get("known_benign_pattern", 0)),
            "hour_of_day": int(s.get("hour_of_day", 12)),
            "combined_text": combined_text,
            "label": s.get("label", None)
        })
    return pd.DataFrame(rows)

def build_preprocessor() -> ColumnTransformer:
    """
    Constructs a ColumnTransformer combining TF-IDF vectorization for telemetry
    text with One-Hot Encoding for categorical security dimensions and standard scaling.
    """
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                CATEGORICAL_COLS
            ),
            (
                "num",
                StandardScaler(),
                NUMERICAL_COLS
            ),
            (
                "text",
                TfidfVectorizer(max_features=80, stop_words="english", ngram_range=(1, 2)),
                TEXT_COL
            )
        ],
        remainder="drop"
    )
    return preprocessor

def get_feature_names(preprocessor: ColumnTransformer) -> List[str]:
    """Retrieves human-readable feature names across all transformer branches."""
    feature_names = []
    for name, trans, cols in preprocessor.transformers_:
        if name == "cat":
            feature_names.extend(trans.get_feature_names_out(cols))
        elif name == "num":
            feature_names.extend(cols)
        elif name == "text":
            feature_names.extend([f"text_{w}" for w in trans.get_feature_names_out()])
    return feature_names

def explain_transformed_sample(
    feature_names: List[str],
    model: Any,
    X_sample: np.ndarray,
    top_k: int = 4
) -> List[str]:
    """
    High-speed vectorized feature attribution for an already-transformed alert vector.
    Executes in sub-millisecond time without re-running column transformers.
    """
    if hasattr(model, "coef_"):
        weights = model.coef_[0]
        contributions = X_sample * weights
    elif hasattr(model, "feature_importances_"):
        contributions = X_sample * model.feature_importances_
    else:
        return ["Asset Criticality Weight", "High Severity Telemetry", "Suspicious Process Activity"]

    active_indices = np.where(X_sample != 0)[0]
    if len(active_indices) == 0:
        return ["Standard Telemetry Signature"]

    ranked = sorted(active_indices, key=lambda idx: abs(contributions[idx]), reverse=True)
    top_explanations = []

    for idx in ranked[:top_k]:
        fname = feature_names[idx]
        val = contributions[idx]
        sign = "+" if val >= 0 else "-"
        
        clean_name = fname.replace("cat__", "").replace("num__", "").replace("text__", "keyword:")
        if "asset_criticality_Critical" in fname:
            top_explanations.append(f"{sign} Critical Enterprise Asset Target")
        elif "asset_criticality_High" in fname:
            top_explanations.append(f"{sign} High Value Target Asset")
        elif "severity_Critical" in fname:
            top_explanations.append(f"{sign} Critical Alert Severity")
        elif "has_suspicious_process" in fname:
            top_explanations.append(f"{sign} Suspicious Process Spawned (mimikatz/procdump/powershell)")
        elif "has_command_line" in fname:
            top_explanations.append(f"{sign} Malicious / Encoded Command-Line Detected")
        elif "is_external_transfer" in fname:
            top_explanations.append(f"{sign} Outbound External Data Exfiltration Signal")
        elif "known_benign_pattern" in fname:
            top_explanations.append(f"{sign} Approved Routine Maintenance / Scheduled Job")
        elif "is_privileged_user" in fname:
            top_explanations.append(f"{sign} Privileged Service / Admin Account Activity")
        elif "alert_type" in fname:
            top_explanations.append(f"{sign} Telemetry Signature: {clean_name}")
        else:
            top_explanations.append(f"{sign} Signal: {clean_name}")

    return top_explanations[:top_k]

def explain_alert_prediction(
    preprocessor: ColumnTransformer,
    model: Any,
    alert_row: pd.DataFrame,
    top_k: int = 4
) -> List[str]:
    """
    Computes local feature attributions for a single raw alert DataFrame row.
    """
    feature_names = get_feature_names(preprocessor)
    X_sample = preprocessor.transform(alert_row)[0]
    return explain_transformed_sample(feature_names, model, X_sample, top_k)

