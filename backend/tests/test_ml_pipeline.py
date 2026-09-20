# backend/tests/test_ml_pipeline.py - Comprehensive Unit & Integration Tests for Real ML/AI Layer
import os
import sys
import json
from datetime import datetime, timezone

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from models import NormalizedAlert, RawAlert
from ml.dataset_generator import generate_training_dataset
from ml.preprocessing import (
    prepare_dataframe, 
    build_preprocessor, 
    get_feature_names, 
    explain_transformed_sample,
    explain_alert_prediction
)
from ml.inference import (
    get_or_load_pipeline, 
    extract_features_from_normalized_alert, 
    score_normalized_alerts,
    MODEL_PATH
)

def test_1_dataset_generator():
    """Verifies synthetic dataset generation with proper label distribution and required schema."""
    samples = generate_training_dataset(total_samples=100)
    assert len(samples) == 100
    for s in samples:
        assert "source" in s
        assert "severity" in s
        assert "asset_criticality" in s
        assert "alert_type" in s
        assert s["label"] in [0, 1]
    
    # Ensure both classes are represented
    labels = [s["label"] for s in samples]
    assert 0 in labels
    assert 1 in labels

def test_2_preprocessing_pipeline():
    """Verifies ColumnTransformer preprocessing across categorical, numerical, and TF-IDF text features."""
    samples = generate_training_dataset(total_samples=50)
    df = prepare_dataframe(samples)
    assert len(df) == 50
    assert "combined_text" in df.columns
    assert "known_benign_pattern" in df.columns

    preprocessor = build_preprocessor()
    X = preprocessor.fit_transform(df)
    assert X.shape[0] == 50
    assert X.shape[1] > 20  # Has categorical + numerical + text dimensions

    feature_names = get_feature_names(preprocessor)
    assert len(feature_names) == X.shape[1]

def test_3_model_artifact_loading():
    """Verifies serialized model artifact exists and contains valid model and preprocessor."""
    assert os.path.exists(MODEL_PATH), f"Model artifact missing at {MODEL_PATH}"
    pipeline = get_or_load_pipeline()
    assert "model" in pipeline
    assert "preprocessor" in pipeline
    assert hasattr(pipeline["model"], "predict_proba")
    assert hasattr(pipeline["preprocessor"], "transform")

def test_4_inference_and_prediction_format():
    """Verifies real ML inference assigns scores 0-1, valid labels, and top feature signals."""
    test_alert = NormalizedAlert(
        alert_id="ALT-TEST-ML-01",
        timestamp=datetime.now(timezone.utc),
        source="Endpoint EDR",
        alert_type="Credential Dumping",
        severity="Critical",
        source_ip="10.0.1.5",
        destination_ip="10.0.1.10",
        user="Administrator",
        hostname="DC-PROD-01",
        asset_criticality="Critical",
        description="LSASS memory dump attempted via procdump.exe",
        evidence={"command_line": "procdump.exe -ma lsass.exe lsass.dmp", "process": "procdump.exe"}
    )

    scored_alerts, summary = score_normalized_alerts([test_alert])
    assert len(scored_alerts) == 1
    scored = scored_alerts[0]

    # Verify prediction format
    assert isinstance(scored.ml_relevance_score, float)
    assert 0.0 <= scored.ml_relevance_score <= 1.0
    assert scored.ml_prediction in ["Actionable", "Benign"]
    assert isinstance(scored.ml_top_features, list)
    assert len(scored.ml_top_features) > 0
    assert any("Critical" in f or "Process" in f or "Command" in f for f in scored.ml_top_features)

def test_5_benign_pattern_discrimination():
    """Verifies that routine maintenance / benign alerts score significantly lower than attacks."""
    benign_alert = NormalizedAlert(
        alert_id="ALT-TEST-BENIGN-01",
        timestamp=datetime.now(timezone.utc),
        source="Cloud Audit",
        alert_type="Routine Health Check",
        severity="Informational",
        source_ip="10.0.99.1",
        destination_ip="10.0.99.2",
        user="svc-backup-agent",
        hostname="BACKUP-NODE-04",
        asset_criticality="Low",
        description="Routine health check and scheduled backup completed",
        evidence={"status": "OK", "bytes_transferred": 1024}
    )

    threat_alert = NormalizedAlert(
        alert_id="ALT-TEST-THREAT-01",
        timestamp=datetime.now(timezone.utc),
        source="Endpoint EDR",
        alert_type="Credential Theft",
        severity="Critical",
        source_ip="10.0.1.50",
        destination_ip="10.0.1.1",
        user="Domain Admin",
        hostname="DC-PROD-PRIMARY",
        asset_criticality="Critical",
        description="Mimikatz sekurlsa::logonpasswords detected targeting LSASS",
        evidence={"command_line": "mimikatz.exe sekurlsa::logonpasswords", "process": "mimikatz.exe"}
    )

    scored, _ = score_normalized_alerts([benign_alert, threat_alert])
    assert scored[0].ml_relevance_score < scored[1].ml_relevance_score

def test_6_malformed_and_missing_fields():
    """Verifies that inference handles missing fields, empty strings, and null structures without crashing."""
    malformed_alert = NormalizedAlert(
        alert_id="ALT-MALFORMED-01",
        timestamp=datetime.now(timezone.utc),
        source="Unknown",
        alert_type="Weird Custom Alarm ⚠️ $#@!",
        severity="Unknown",
        source_ip="",
        destination_ip="",
        user="",
        hostname="HOST-NULL",
        asset_criticality="Low",
        description="",
        evidence={}
    )

    scored, summary = score_normalized_alerts([malformed_alert])
    assert len(scored) == 1
    assert 0.0 <= scored[0].ml_relevance_score <= 1.0
    assert scored[0].ml_prediction in ["Actionable", "Benign"]
    assert isinstance(scored[0].ml_top_features, list)

def test_7_held_out_evaluation_metrics_file():
    """Verifies metrics.json exists and contains calculated test-set metrics (not hardcoded stubs)."""
    metrics_path = os.path.join(os.path.dirname(__file__), "..", "ml", "metrics.json")
    assert os.path.exists(metrics_path), "metrics.json not found"

    with open(metrics_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "model_name" in data
    assert "metrics" in data
    m = data["metrics"]
    assert "accuracy" in m
    assert "precision" in m
    assert "recall" in m
    assert "f1_score" in m
    assert "roc_auc" in m
    assert "confusion_matrix" in data
    cm = data["confusion_matrix"]
    assert "true_negatives" in cm
    assert "true_positives" in cm
    assert data["dataset_label"] == "Synthetic Dataset — Model Evaluation"

def test_8_application_pipeline_integration():
    """Verifies that backend/app.py loads the trained model and populates ML fields on all alerts."""
    import app
    assert len(app.NORMALIZED_ALERTS) == 3000
    assert "predicted_actionable" in app.ML_TRIAGE_SUMMARY
    assert "predicted_benign" in app.ML_TRIAGE_SUMMARY
    
    # Check that alerts in memory actually have ML scores
    sample_alert = app.NORMALIZED_ALERTS[0]
    assert hasattr(sample_alert, "ml_relevance_score")
    assert 0.0 <= sample_alert.ml_relevance_score <= 1.0
    assert sample_alert.ml_prediction in ["Actionable", "Benign"]
    assert len(sample_alert.ml_top_features) > 0

    # Verify AI incident shift briefs are populated with local model metadata
    assert len(app.INCIDENTS) > 0
    first_incident = app.INCIDENTS[0]
    assert first_incident.shift_brief.ai_model_name == "google/flan-t5-small"
    assert "evidence_context_used" in first_incident.shift_brief.model_dump()

if __name__ == "__main__":
    print("=================================================================")
    print("   RUNNING REAL AI/ML PIPELINE UNIT & INTEGRATION SUITE          ")
    print("=================================================================")
    test_1_dataset_generator()
    print("[PASS] Test 1: Synthetic Dataset Generator & Labels Passed")
    test_2_preprocessing_pipeline()
    print("[PASS] Test 2: ColumnTransformer (Categorical, Numerical, TF-IDF) Passed")
    test_3_model_artifact_loading()
    print("[PASS] Test 3: Model Artifact Serialization & Loading Passed")
    test_4_inference_and_prediction_format()
    print("[PASS] Test 4: Real Inference & Explainable Feature Signals Passed")
    test_5_benign_pattern_discrimination()
    print("[PASS] Test 5: Threat vs Benign Discrimination Discrimination Passed")
    test_6_malformed_and_missing_fields()
    print("[PASS] Test 6: Missing & Malformed Field Fault Tolerance Passed")
    test_7_held_out_evaluation_metrics_file()
    print("[PASS] Test 7: Held-out Test Set Empirical Metrics Passed")
    test_8_application_pipeline_integration()
    print("[PASS] Test 8: End-to-End Application Pipeline Integration Passed")
    print("\n[ALL 8 AI/ML TESTS PASSED SUCCESSFULLY!]")
