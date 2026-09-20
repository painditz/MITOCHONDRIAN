# backend/ml/dataset_generator.py - Supervised ML Training Dataset Generator
"""
Synthetic Training Dataset Generator for Microsoft Problem Statement #25.
Directly extracts training samples from the unified dataset generator in backend/ingestion.py.

Guarantees:
- Single source of truth: No second disconnected dataset system.
- Zero data leakage: ground_truth_incident_id and scenario_id are NEVER passed as feature inputs.
- Objective label definition:
  - Label 1 (Actionable): Genuine attack stages on enterprise assets (ransomware, C2, exfiltration, privilege escalation, DCSync).
  - Label 0 (Benign / Routine Noise): Routine maintenance (scanners, software deployments, SSPR, CDN lookups, AV updates).
"""

import sys
import os
import json
from datetime import datetime
from typing import List, Dict, Any

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ingestion import generate_alerts
from normalization import normalize_alert
from ml.inference import extract_features_from_normalized_alert

RANDOM_SEED = 42

def transform_alert_to_training_sample(alert, sample_id: int) -> Dict[str, Any]:
    """
    Transforms a RawAlert from the unified generator into an ML training sample.
    Zero ground-truth feature leakage: features are extracted using the EXACT SAME
    observable telemetry function (extract_features_from_normalized_alert) as production inference.
    
    The ground-truth field (alert.is_false_positive) is used SOLELY to assign the target supervision
    label 'label' (1 = Actionable Threat, 0 = Benign Noise). It is NEVER used to construct features.
    """
    norm = normalize_alert(alert) if hasattr(alert, "severity") and not hasattr(alert.timestamp, "hour") else alert
    features = extract_features_from_normalized_alert(norm)

    ev = norm.evidence or {}
    ev_str = " ".join(f"{k}: {v}" for k, v in ev.items()) if isinstance(ev, dict) else str(ev)

    # Assign partition group ID: scenario_id for attack campaigns, maintenance group for benign noise
    # Used SOLELY for group-aware train/val/test splitting; NEVER passed into model features.
    group_id = alert.scenario_id if getattr(alert, "scenario_id", None) else f"MAINT-GRP-{(sample_id % 25) + 1:03d}"

    return {
        "sample_id": f"TRAIN-{sample_id:05d}",
        "group_id": group_id,
        "source": features["source"],
        "alert_type": features["alert_type"],
        "severity": features["severity"],
        "asset_criticality": features["asset_criticality"],
        "hostname": norm.hostname,
        "user": norm.user or "N/A",
        "description": features["description"],
        "evidence_text": ev_str,
        "has_command_line": features["has_command_line"],
        "has_suspicious_process": features["has_suspicious_process"],
        "is_external_transfer": features["is_external_transfer"],
        "is_privileged_user": features["is_privileged_user"],
        "known_benign_pattern": features["known_benign_pattern"],
        "hour_of_day": features["hour_of_day"],
        "label": 0 if alert.is_false_positive else 1  # 1 = Actionable Threat, 0 = Routine Benign Noise (Target label ONLY)
    }

def generate_training_dataset(total_samples: int = 5000, seed: int = RANDOM_SEED) -> List[Dict[str, Any]]:
    """Generates labeled training alerts using the unified generator."""
    print(f"[ML Data] Generating {total_samples} training samples from unified alert generator (seed={seed})...")
    raw_alerts = generate_alerts(count=total_samples, seed=seed)
    dataset = [transform_alert_to_training_sample(a, i + 1) for i, a in enumerate(raw_alerts)]
    
    actionable_cnt = sum(1 for d in dataset if d["label"] == 1)
    benign_cnt = total_samples - actionable_cnt
    print(f"[ML Data] Training dataset generated: {actionable_cnt} Actionable ({actionable_cnt/total_samples*100:.1f}%), {benign_cnt} Benign ({benign_cnt/total_samples*100:.1f}%)")
    return dataset

if __name__ == "__main__":
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(data_dir, exist_ok=True)
    out_file = os.path.join(data_dir, "training_alerts.json")
    data = generate_training_dataset(5000, seed=RANDOM_SEED)
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"[ML Data] Saved unified training data to {out_file}")
