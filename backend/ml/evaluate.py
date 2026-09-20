# backend/ml/evaluate.py - Independent Held-Out Test Set Evaluator
"""
Independent Evaluation Script for Alert Relevance Model.
Evaluates the trained model strictly on the held-out 15% test set (750 samples).
Computes Accuracy, Precision, Recall, F1, ROC-AUC, and Confusion Matrix.
Saves verified empirical evaluation metrics to backend/ml/metrics.json.
"""

import os
import sys

# Ensure backend/ml and backend root are on sys.path regardless of execution directory
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import json
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix
)
from preprocessing import get_feature_names

def evaluate_held_out_test_set() -> Dict[str, Any]:
    print("=================================================================")
    print("   EVALUATING MODEL ON HELD-OUT TEST SET (SENTINELOPS AI)        ")
    print("=================================================================\n")

    ml_dir = os.path.dirname(__file__)
    artifact_path = os.path.join(ml_dir, "alert_classifier.joblib")
    test_file = os.path.join(ml_dir, "data", "test_dataset.json")

    if not os.path.exists(artifact_path):
        raise FileNotFoundError(f"Model artifact not found at {artifact_path}. Run train.py first.")
    if not os.path.exists(test_file):
        raise FileNotFoundError(f"Held-out test set not found at {test_file}. Run train.py first.")

    # 1. Load model package
    package = joblib.load(artifact_path)
    preprocessor = package["preprocessor"]
    model = package["model"]
    metadata = package["metadata"]

    # 2. Load held-out test data
    print(f"[1/4] Loading held-out test set from {test_file}...")
    test_df = pd.read_json(test_file)
    X_test = test_df.drop(columns=["label"])
    y_test = test_df["label"].astype(int)
    print(f"  Test set contains {len(test_df)} samples (Actionable: {sum(y_test)}, Benign: {len(y_test)-sum(y_test)}).")

    # 3. Transform & Inference
    print("\n[2/4] Executing inference on held-out test set...")
    X_test_trans = preprocessor.transform(X_test)
    y_pred = model.predict(X_test_trans)
    y_prob = model.predict_proba(X_test_trans)[:, 1]

    # 4. Compute Real Statistical Evaluation Metrics
    print("\n[3/4] Calculating test set evaluation metrics...")
    acc = round(float(accuracy_score(y_test, y_pred)), 4)
    prec = round(float(precision_score(y_test, y_pred)), 4)
    rec = round(float(recall_score(y_test, y_pred)), 4)
    f1 = round(float(f1_score(y_test, y_pred)), 4)
    auc = round(float(roc_auc_score(y_test, y_prob)), 4)

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = [int(v) for v in cm.ravel()]

    print(f"  Accuracy:         {acc * 100:.2f}%")
    print(f"  Precision:        {prec * 100:.2f}%")
    print(f"  Recall:           {rec * 100:.2f}%")
    print(f"  F1-Score:         {f1:.4f}")
    print(f"  ROC-AUC:          {auc:.4f}")
    print("  Confusion Matrix:")
    print(f"    True Negatives  (TN): {tn}")
    print(f"    False Positives (FP): {fp}")
    print(f"    False Negatives (FN): {fn}")
    print(f"    True Positives  (TP): {tp}")

    # 5. Extract Top Global Feature Importances
    print("\n[4/4] Extracting global feature importances...")
    feature_names = get_feature_names(preprocessor)
    if hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        top_features = []
        for idx in sorted_indices[:10]:
            top_features.append({
                "feature": feature_names[idx].replace("cat__", "").replace("num__", "").replace("text__", "keyword:"),
                "importance": round(float(importances[idx]), 4)
            })
    else:
        top_features = []

    report = {
        "model_name": metadata.get("model_name", "RandomForestClassifier"),
        "library": metadata.get("library", "scikit-learn"),
        "dataset_label": "Synthetic Dataset — Model Evaluation",
        "dataset_split": {
            "train_samples": metadata.get("train_samples", 3500),
            "val_samples": metadata.get("val_samples", 750),
            "test_samples": len(test_df),
            "total_samples": metadata.get("train_samples", 3500) + metadata.get("val_samples", 750) + len(test_df)
        },
        "metrics": {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "roc_auc": auc
        },
        "confusion_matrix": {
            "true_negatives": tn,
            "false_positives": fp,
            "false_negatives": fn,
            "true_positives": tp
        },
        "top_feature_importances": top_features,
        "evaluation_timestamp": pd.Timestamp.utcnow().isoformat()
    }

    metrics_file = os.path.join(ml_dir, "metrics.json")
    with open(metrics_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"\n[PASS] Empirical evaluation report written to {metrics_file}")

    return report

if __name__ == "__main__":
    evaluate_held_out_test_set()
