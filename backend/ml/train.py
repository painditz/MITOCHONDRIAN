# backend/ml/train.py - Supervised ML Training Pipeline for Alert Triage
"""
Supervised Model Training Script for Alert Relevance Triage.
Trains an explainable supervised classifier on 70% training data, tunes on 15% validation data,
and leaves 15% strictly held-out for final test evaluation.
"""

import os
import json
import joblib
import pandas as pd
from typing import Dict, Any
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score

from dataset_generator import generate_training_dataset
from preprocessing import prepare_dataframe, build_preprocessor

RANDOM_SEED = 42

def train_alert_classifier() -> Dict[str, Any]:
    print("=================================================================")
    print("   TRAINING ALERT RELEVANCE CLASSIFIER (SENTINELOPS AI)          ")
    print("=================================================================\n")

    ml_dir = os.path.dirname(__file__)
    data_dir = os.path.join(ml_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    raw_data_file = os.path.join(data_dir, "training_alerts.json")

    # 1. Load or generate dataset (5,000 synthetic samples)
    if os.path.exists(raw_data_file):
        print(f"[1/5] Loading training alerts from {raw_data_file}...")
        with open(raw_data_file, "r", encoding="utf-8") as f:
            raw_samples = json.load(f)
    else:
        print("[1/5] Synthesizing 5,000 alert training samples...")
        raw_samples = generate_training_dataset(5000)
        with open(raw_data_file, "w", encoding="utf-8") as f:
            json.dump(raw_samples, f, indent=2)

    df = prepare_dataframe(raw_samples)
    groups = df["group_id"]
    X = df.drop(columns=["label", "group_id"])
    y = df["label"].astype(int)

    # 2. Group-Aware Train / Validation / Test Split (70% / 15% / 15%)
    # Prevents scenario/campaign data leakage; guarantees zero group overlap
    print("\n[2/5] Creating Group-Aware Train (70%) / Validation (15%) / Test (15%) splits...")
    from sklearn.model_selection import GroupShuffleSplit
    
    attack_mask = (y == 1)
    benign_mask = (y == 0)

    # GroupShuffleSplit for attacks: 70% train, 30% temp (15% val, 15% test)
    gss_att_1 = GroupShuffleSplit(n_splits=1, test_size=0.30, random_state=RANDOM_SEED)
    att_train_sub, att_temp_sub = next(gss_att_1.split(X[attack_mask], y[attack_mask], groups[attack_mask]))
    att_train_idx = X[attack_mask].index[att_train_sub]
    att_temp_idx = X[attack_mask].index[att_temp_sub]

    gss_att_2 = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=RANDOM_SEED)
    att_val_sub, att_test_sub = next(gss_att_2.split(X.loc[att_temp_idx], y.loc[att_temp_idx], groups.loc[att_temp_idx]))
    att_val_idx = att_temp_idx[att_val_sub]
    att_test_idx = att_temp_idx[att_test_sub]

    # GroupShuffleSplit for benign noise: 70% train, 30% temp (15% val, 15% test)
    gss_ben_1 = GroupShuffleSplit(n_splits=1, test_size=0.30, random_state=RANDOM_SEED)
    ben_train_sub, ben_temp_sub = next(gss_ben_1.split(X[benign_mask], y[benign_mask], groups[benign_mask]))
    ben_train_idx = X[benign_mask].index[ben_train_sub]
    ben_temp_idx = X[benign_mask].index[ben_temp_sub]

    gss_ben_2 = GroupShuffleSplit(n_splits=1, test_size=0.50, random_state=RANDOM_SEED)
    ben_val_sub, ben_test_sub = next(gss_ben_2.split(X.loc[ben_temp_idx], y.loc[ben_temp_idx], groups.loc[ben_temp_idx]))
    ben_val_idx = ben_temp_idx[ben_val_sub]
    ben_test_idx = ben_temp_idx[ben_test_sub]

    train_idx = att_train_idx.union(ben_train_idx)
    val_idx = att_val_idx.union(ben_val_idx)
    test_idx = att_test_idx.union(ben_test_idx)

    X_train, y_train = X.loc[train_idx], y.loc[train_idx]
    X_val, y_val = X.loc[val_idx], y.loc[val_idx]
    X_test, y_test = X.loc[test_idx], y.loc[test_idx]

    train_groups = set(groups.loc[train_idx])
    val_groups = set(groups.loc[val_idx])
    test_groups = set(groups.loc[test_idx])

    group_overlap = train_groups.intersection(test_groups)
    assert len(group_overlap) == 0, f"Leakage detected: {group_overlap} in both train and test!"

    # Calculate duplicate & overlap metrics
    train_texts = set(X_train["combined_text"])
    test_texts = set(X_test["combined_text"])
    text_overlap = sum(1 for t in X_test["combined_text"] if t in train_texts)
    text_overlap_pct = (text_overlap / len(X_test)) * 100.0 if len(X_test) > 0 else 0.0

    print(f"  Training set size:   {len(X_train)} samples (Actionable: {sum(y_train)}, Benign: {len(y_train)-sum(y_train)}) across {len(train_groups)} groups")
    print(f"  Validation set size: {len(X_val)} samples (Actionable: {sum(y_val)}, Benign: {len(y_val)-sum(y_val)}) across {len(val_groups)} groups")
    print(f"  Held-out Test size:  {len(X_test)} samples (Actionable: {sum(y_test)}, Benign: {len(y_test)-sum(y_test)}) across {len(test_groups)} groups")
    print(f"  Group overlap between train and test: {len(group_overlap)} (CLEAN - Zero group leakage)")
    print(f"  Exact combined_text overlap: {text_overlap} / {len(X_test)} ({text_overlap_pct:.2f}%)")

    # Save held-out test data for independent evaluation script
    test_df = X_test.copy()
    test_df["label"] = y_test
    test_file = os.path.join(data_dir, "test_dataset.json")
    test_df.to_json(test_file, orient="records", indent=2)
    print(f"  Held-out test set saved to: {test_file}")

    # 3. Fit Preprocessing Pipeline on Training Data ONLY
    print("\n[3/5] Fitting TF-IDF and Categorical Preprocessor on Training Data only...")
    preprocessor = build_preprocessor()
    X_train_trans = preprocessor.fit_transform(X_train)
    X_val_trans = preprocessor.transform(X_val)

    # 4. Train Model
    print("\n[4/5] Training RandomForestClassifier (100 estimators, max_depth=12)...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=12,
        class_weight="balanced",
        random_state=RANDOM_SEED,
        n_jobs=-1
    )
    model.fit(X_train_trans, y_train)

    # Validate on validation set
    y_val_pred = model.predict(X_val_trans)
    y_val_prob = model.predict_proba(X_val_trans)[:, 1]
    val_auc = roc_auc_score(y_val, y_val_prob)
    print(f"  Validation Set ROC-AUC: {val_auc:.4f}")
    print("  Validation Set Classification Report:")
    print(classification_report(y_val, y_val_pred, target_names=["Benign (0)", "Actionable (1)"], digits=4))

    # 5. Serialize Artifact
    print("[5/5] Serializing model artifact and preprocessing pipeline...")
    artifact_path = os.path.join(ml_dir, "alert_classifier.joblib")
    package = {
        "preprocessor": preprocessor,
        "model": model,
        "metadata": {
            "model_name": "RandomForestClassifier",
            "library": "scikit-learn",
            "n_estimators": 100,
            "max_depth": 12,
            "random_state": RANDOM_SEED,
            "train_samples": len(X_train),
            "val_samples": len(X_val),
            "test_samples": len(X_test),
            "feature_count": X_train_trans.shape[1]
        }
    }
    joblib.dump(package, artifact_path)
    print(f"  Artifact successfully saved to: {artifact_path}")

    return package

if __name__ == "__main__":
    train_alert_classifier()
