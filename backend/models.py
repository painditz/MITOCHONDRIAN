# backend/models.py - Data schemas for Problem Statement #25
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, model_validator

class RawAlert(BaseModel):
    alert_id: str
    timestamp: str
    source: str
    alert_type: str
    severity: str  # Critical, High, Medium, Low, Informational
    asset_id: Optional[str] = None
    asset_name: Optional[str] = None
    hostname: Optional[str] = None
    asset_criticality: str  # Critical, High, Medium, Low
    user: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    protocol: str = "TCP"
    indicator: Optional[str] = None
    description: str
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None
    scenario_id: Optional[str] = None
    ground_truth_incident_id: Optional[str] = None
    is_false_positive: bool = False
    evidence: Dict[str, Any] = Field(default_factory=dict)

    @model_validator(mode="before")
    @classmethod
    def sync_asset_fields(cls, values: Any) -> Any:
        if isinstance(values, dict):
            host = values.get("hostname") or values.get("asset_name") or "UNKNOWN-HOST"
            if not values.get("hostname"):
                values["hostname"] = host
            if not values.get("asset_name"):
                values["asset_name"] = host
            if not values.get("asset_id"):
                clean_host = str(host).replace(" ", "-").replace(".", "-").upper()
                values["asset_id"] = f"AST-{clean_host}"
        return values

class NormalizedAlert(BaseModel):
    alert_id: str
    timestamp: datetime
    source: str
    alert_type: str
    severity: str
    asset_id: Optional[str] = None
    asset_name: Optional[str] = None
    hostname: Optional[str] = None
    asset_criticality: str
    user: str
    source_ip: str
    destination_ip: str
    protocol: str = "TCP"
    indicator: str = ""
    description: str
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def sync_normalized_asset_fields(cls, values: Any) -> Any:
        if isinstance(values, dict):
            host = values.get("hostname") or values.get("asset_name") or "UNKNOWN-HOST"
            if not values.get("hostname"):
                values["hostname"] = host
            if not values.get("asset_name"):
                values["asset_name"] = host
            if not values.get("asset_id"):
                clean_host = str(host).replace(" ", "-").replace(".", "-").upper()
                values["asset_id"] = f"AST-{clean_host}"
        return values
    scenario_id: Optional[str] = None
    ground_truth_incident_id: Optional[str] = None
    is_false_positive: bool = False
    evidence: Dict[str, Any]
    normalized_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ml_relevance_score: float = 0.0
    ml_prediction: str = "Benign"  # "Actionable" or "Benign"
    ml_top_features: List[str] = Field(default_factory=list)

class MitreTechnique(BaseModel):
    technique_id: str
    technique_name: str
    tactic: str
    evidence_found: str

class ShiftBrief(BaseModel):
    what_happened: str
    correlated_alerts_summary: str
    affected_asset: str
    asset_criticality: str
    timeline_events: List[str]
    priority_explanation: str
    mitre_techniques: List[MitreTechnique]
    investigation_points: List[str]
    analyst_status: str = "Pending Review"  # Pending Review, Confirmed, Rejected, Investigated
    analyst_notes: List[str] = Field(default_factory=list)
    custom_brief_text: Optional[str] = None
    ai_model_name: str = "google/flan-t5-small"
    ai_generation_timestamp: str = ""
    evidence_context_used: Dict[str, Any] = Field(default_factory=dict)
    analyst_agreement: Optional[str] = None  # "Agreed", "Disagreed", or None
    analyst_feedback_notes: Optional[str] = None

class Incident(BaseModel):
    incident_id: str
    title: str
    priority: str  # P1-Critical, P2-High, P3-Medium, P4-Low
    risk_score: float  # 0.0 - 100.0
    asset_criticality: str  # Critical, High, Medium, Low
    severity: str
    alert_count: int
    hostname: str
    user: str
    source_ip: str
    destination_ip: str
    start_time: str
    end_time: str
    duration_minutes: float
    correlation_reason: str
    priority_reason: str
    investigation_status: str = "NEEDS REVIEW"  # NEW, NEEDS REVIEW, IN REVIEW, CONFIRMED, REJECTED, NEEDS MORE EVIDENCE, ESCALATED, INVESTIGATED
    alerts: List[NormalizedAlert]
    mitre_mappings: List[MitreTechnique]
    shift_brief: ShiftBrief
    review_time_seconds: float = 0.0
    # Human-in-the-Loop 2.0 Enterprise Analyst Decision & Review Fields
    analyst_decision: Optional[str] = None  # CONFIRM, REJECT, ESCALATE, NEED MORE EVIDENCE, MODIFY
    analyst_confidence: Optional[str] = None  # LOW, MEDIUM, HIGH
    analyst_reason: Optional[str] = None
    analyst_note: Optional[str] = None
    analyst_priority_override: Optional[str] = None  # P1, P2, P3, P4
    analyst_priority_reason: Optional[str] = None
    ai_brief_review: Optional[Dict[str, Any]] = None
    evidence_reviews: List[Dict[str, Any]] = Field(default_factory=list)
    correlation_reviews: List[Dict[str, Any]] = Field(default_factory=list)
    review_history: List[Dict[str, Any]] = Field(default_factory=list)
    structured_notes: List[Dict[str, Any]] = Field(default_factory=list)
    merge_proposals: List[Dict[str, Any]] = Field(default_factory=list)
    split_proposals: List[Dict[str, Any]] = Field(default_factory=list)
    investigation_checklist: Dict[str, bool] = Field(default_factory=lambda: {
        "evidence_review": False,
        "correlation_review": False,
        "mitre_review": False,
        "ai_brief_review": False,
        "human_decision": False
    })

class TriageSessionRecord(BaseModel):
    session_id: str
    session_type: str  # "raw_alert" | "assisted_incident"
    target_id: str
    start_timestamp: str
    end_timestamp: str
    duration_seconds: float
    analyst_decision: str

class SimulationEstimate(BaseModel):
    assumed_raw_alert_time_min: float = 10.0
    assumed_incident_time_min: float = 3.0
    total_raw_alerts: int
    total_incidents: int
    simulated_baseline_hours: float
    simulated_assisted_hours: float
    simulated_hours_saved: float
    simulated_percentage_reduction: float
    label: str = "Simulated Industry Assumption (Not Field Measured)"

class MeasuredAnalystTest(BaseModel):
    evaluation_status: str  # "Not evaluated" or "Evaluated (Empirical Data)"
    has_measured_data: bool
    total_test_sessions: int
    raw_sessions_count: int
    measured_baseline_mttt_seconds: Optional[float] = None
    assisted_sessions_count: int
    measured_assisted_mttt_seconds: Optional[float] = None
    measured_difference_seconds: Optional[float] = None
    measured_percentage_reduction: Optional[float] = None
    sessions: List[TriageSessionRecord] = Field(default_factory=list)

class MTTTMetrics(BaseModel):
    simulation_estimate: SimulationEstimate
    measured_analyst_test: MeasuredAnalystTest
    incidents_investigated: int
    pending_incidents: int

class MLEvaluationReport(BaseModel):
    model_name: str
    library: str
    dataset_label: str
    dataset_split: Dict[str, int]
    metrics: Dict[str, float]
    confusion_matrix: Dict[str, int]
    top_feature_importances: List[Dict[str, Any]]
    evaluation_timestamp: str
    triage_summary: Optional[Dict[str, Any]] = None
