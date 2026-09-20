# backend/ml/inference.py - Alert Relevance Inference Engine
"""
Production inference engine for SentinelOps AI.
Applies the trained Random Forest classifier and ColumnTransformer
to score all 3,000 alerts with ML Relevance Scores, predictions,
and local feature attributions for Tier-1 analyst explainability.
"""

import os
from typing import List, Dict, Any, Tuple
import joblib
import numpy as np
import pandas as pd
from models import NormalizedAlert
from ml.preprocessing import prepare_dataframe, get_feature_names, explain_transformed_sample

MODEL_PATH = os.path.join(os.path.dirname(__file__), "alert_classifier.joblib")

_PIPELINE = None

def get_or_load_pipeline() -> Dict[str, Any]:
    """Loads the serialized scikit-learn artifact containing preprocessor and model."""
    global _PIPELINE
    if _PIPELINE is not None:
        return _PIPELINE

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Trained model artifact not found at {MODEL_PATH}. "
            "Please run 'python backend/ml/train.py' first."
        )

    _PIPELINE = joblib.load(MODEL_PATH)
    print(f"[ML Inference] Loaded model artifact from {MODEL_PATH}")
    return _PIPELINE

def extract_features_from_normalized_alert(alert: NormalizedAlert) -> Dict[str, Any]:
    """Converts a NormalizedAlert instance into feature row for the preprocessor."""
    ev = alert.evidence or {}
    hour = alert.timestamp.hour if hasattr(alert.timestamp, "hour") else 12

    cmd = ev.get("command_line", "")
    proc = ev.get("process", "")
    dest = ev.get("destination_domain", "") or ev.get("destination_ip", "")
    user = alert.user or ""
    desc = alert.description or ""

    has_cmd = int(bool(cmd))
    has_proc = int(any(p in str(proc).lower() for p in ["powershell", "cmd.exe", "mimikatz", "procdump", "rundll32", "certutil", "vssadmin"]))
    is_ext = int(bool(dest and not dest.startswith("10.") and not dest.startswith("192.168.")))
    is_priv = int(any(u in str(user).lower() for u in ["admin", "svc_", "system", "root", "domain-admin"]))
    
    # Benign patterns: routine health checks, internal scanners, backup agents
    is_benign = int(any(b in (desc + " " + alert.alert_type).lower() for b in [
        "health check", "scheduled backup", "routine scan", "heartbeat", "ntp sync", "maintenance"
    ]))

    return {
        "source": alert.source,
        "severity": alert.severity,
        "asset_criticality": alert.asset_criticality,
        "alert_type": alert.alert_type,
        "has_command_line": has_cmd,
        "has_suspicious_process": has_proc,
        "is_external_transfer": is_ext,
        "is_privileged_user": is_priv,
        "known_benign_pattern": is_benign,
        "hour_of_day": hour,
        "description": desc,
        "evidence": ev
    }

def format_feature_attribution(fname: str, val: float) -> str:
    sign = "+" if val >= 0 else "-"
    clean_name = fname.replace("cat__", "").replace("num__", "").replace("text__", "keyword:")
    if "asset_criticality_Critical" in fname:
        return f"{sign} Critical Enterprise Asset Target"
    elif "asset_criticality_High" in fname:
        return f"{sign} High Value Target Asset"
    elif "severity_Critical" in fname:
        return f"{sign} Critical Alert Severity"
    elif "has_suspicious_process" in fname:
        return f"{sign} Suspicious Process Spawned (mimikatz/procdump/powershell)"
    elif "has_command_line" in fname:
        return f"{sign} Malicious / Encoded Command-Line Detected"
    elif "is_external_transfer" in fname:
        return f"{sign} Outbound External Data Exfiltration Signal"
    elif "known_benign_pattern" in fname:
        return f"{sign} Approved Routine Maintenance / Scheduled Job"
    elif "is_privileged_user" in fname:
        return f"{sign} Privileged Service / Admin Account Activity"
    elif "alert_type" in fname:
        return f"{sign} Telemetry Signature: {clean_name}"
    else:
        return f"{sign} Signal: {clean_name}"

def score_normalized_alerts(alerts: List[NormalizedAlert]) -> Tuple[List[NormalizedAlert], Dict[str, Any]]:
    """
    Scores a batch of normalized alerts with the real trained model.
    Attaches ml_relevance_score, ml_prediction, and ml_top_features to each alert.
    Returns the scored alerts and aggregate triage distribution summary.
    """
    pipeline = get_or_load_pipeline()
    model = pipeline["model"]
    preprocessor = pipeline["preprocessor"]
    feature_names = get_feature_names(preprocessor)

    if not alerts:
        return alerts, {}

    feature_dicts = [extract_features_from_normalized_alert(a) for a in alerts]
    df = prepare_dataframe(feature_dicts)

    X = preprocessor.transform(df)
    probabilities = model.predict_proba(X)[:, 1]

    # Vectorized local feature attribution in BLAS
    weights = model.feature_importances_ if hasattr(model, "feature_importances_") else model.coef_[0]
    contributions = X * weights
    top_indices = np.argsort(-np.abs(contributions), axis=1)[:, :3]

    benign_count = 0
    actionable_count = 0
    distribution = {"0.0-0.2": 0, "0.2-0.4": 0, "0.4-0.6": 0, "0.6-0.8": 0, "0.8-1.0": 0}

    for idx, alert in enumerate(alerts):
        score = float(probabilities[idx])
        alert.ml_relevance_score = round(score, 4)
        if score >= 0.5:
            alert.ml_prediction = "Actionable"
            actionable_count += 1
        else:
            alert.ml_prediction = "Benign"
            benign_count += 1

        # Bucketing
        if score < 0.2:
            distribution["0.0-0.2"] += 1
        elif score < 0.4:
            distribution["0.2-0.4"] += 1
        elif score < 0.6:
            distribution["0.4-0.6"] += 1
        elif score < 0.8:
            distribution["0.6-0.8"] += 1
        else:
            distribution["0.8-1.0"] += 1

        # Pre-calculated top-3 features for this alert
        alert.ml_top_features = [
            format_feature_attribution(feature_names[c_idx], float(contributions[idx, c_idx]))
            for c_idx in top_indices[idx]
        ]

    summary = {
        "total_scored": len(alerts),
        "predicted_benign": benign_count,
        "predicted_actionable": actionable_count,
        "actionable_ratio": round(actionable_count / len(alerts), 4) if alerts else 0.0,
        "relevance_distribution": distribution
    }

    return alerts, summary

