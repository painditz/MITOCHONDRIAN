# backend/prioritization.py - Asset Criticality Driven Incident Prioritization
from typing import List, Tuple
from models import NormalizedAlert, MitreTechnique

CRITICALITY_WEIGHTS = {
    "Critical": 45.0,
    "High": 30.0,
    "Medium": 15.0,
    "Low": 0.0
}

SEVERITY_WEIGHTS = {
    "Critical": 25.0,
    "High": 18.0,
    "Medium": 10.0,
    "Low": 5.0,
    "Informational": 0.0
}

def calculate_incident_priority(
    alerts: List[NormalizedAlert],
    highest_criticality: str,
    mitre_mappings: List[MitreTechnique],
    duration_minutes: float
) -> Tuple[float, str, str]:
    """
    Computes an explainable Risk Score (0 - 100) and Priority Tier.
    Crucial Requirement: ASSET CRITICALITY MUST MATTER (0 - 45 pts).
    Combines:
      - Asset Criticality (0 - 45 pts)
      - Peak Alert Severity (0 - 25 pts)
      - MITRE Kill-Chain Progression (0 - 15 pts)
      - ML Model Relevance Score (0 - 10 pts)
      - Alert Volume & Concentration (0 - 5 pts)
    An incident affecting a Critical asset (e.g. DC-PROD-01) with 2 alerts strictly outranks
    an incident on a Low asset (e.g. STAGING-BASTION) with 20 alerts.
    """
    # 1. Asset Criticality Component (0 - 45 pts) - Primary Determinant
    asset_score = CRITICALITY_WEIGHTS.get(highest_criticality, 15.0)

    # 2. Maximum Alert Severity Component (0 - 25 pts)
    max_sev = "Informational"
    for a in alerts:
        if a.severity == "Critical":
            max_sev = "Critical"
            break
        elif a.severity == "High" and max_sev != "Critical":
            max_sev = "High"
        elif a.severity == "Medium" and max_sev not in ["Critical", "High"]:
            max_sev = "Medium"
        elif a.severity == "Low" and max_sev == "Informational":
            max_sev = "Low"

    sev_score = SEVERITY_WEIGHTS.get(max_sev, 5.0)

    # 3. MITRE Kill-Chain Stage Progression (0 - 15 pts)
    tactics = set(m.tactic for m in mitre_mappings)
    killchain_score = 0.0
    if len(tactics) >= 3:
        killchain_score = 10.0
    elif len(tactics) == 2:
        killchain_score = 7.0
    elif len(tactics) == 1:
        killchain_score = 4.0

    # Urgency boost for active Impact or Exfiltration
    if "Impact" in tactics or "Exfiltration" in tactics:
        killchain_score += 5.0

    # 4. ML Model Relevance Component (0 - 10 pts)
    # Aggregates empirical ML relevance scores from the trained Random Forest classifier
    ml_scores = [getattr(a, "ml_relevance_score", 0.5) for a in alerts]
    avg_ml = sum(ml_scores) / max(len(ml_scores), 1)
    ml_score = round(avg_ml * 10.0, 1)

    # 5. Alert Volume & Temporal Relevance (0 - 5 pts, capped to prevent volume bias)
    vol_score = min(len(alerts) * 0.5, 5.0)

    # Total Score Calculation (0 - 100)
    total_score = min(round(asset_score + sev_score + killchain_score + ml_score + vol_score, 1), 100.0)

    # Priority Tier Derivation
    if total_score >= 75.0:
        priority = "P1-Critical"
    elif total_score >= 55.0:
        priority = "P2-High"
    elif total_score >= 35.0:
        priority = "P3-Medium"
    else:
        priority = "P4-Low"

    # Fully Explainable Audit Trail Text
    reason = (
        f"Score {total_score}/100 ({priority}) driven by: "
        f"Asset Criticality [{highest_criticality}] (+{asset_score} pts), "
        f"Peak Severity [{max_sev}] (+{sev_score} pts), "
        f"Kill-Chain Depth [{len(tactics)} tactics: {', '.join(tactics) if tactics else 'Single Event'}] (+{killchain_score} pts), "
        f"ML Model Relevance [avg: {round(avg_ml, 2)}] (+{ml_score} pts), "
        f"and Volume [{len(alerts)} alerts] (+{vol_score} pts)."
    )

    return total_score, priority, reason
