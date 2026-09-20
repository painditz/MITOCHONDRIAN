# backend/normalization.py - Alert Normalization Pipeline
from datetime import datetime, timezone
from typing import List, Dict, Any
from models import RawAlert, NormalizedAlert

def parse_iso_timestamp(ts_str: str) -> datetime:
    try:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except Exception:
        return datetime.now(timezone.utc)

def normalize_alert(raw: RawAlert) -> NormalizedAlert:
    """
    Normalizes heterogeneous raw alert telemetry into a single unified internal schema.
    Standardizes casing, validates IP/hostname/user strings, parses timestamps, and structures evidence.
    """
    # Standardize severity casing
    sev = raw.severity.strip().capitalize()
    if sev not in ["Critical", "High", "Medium", "Low", "Informational"]:
        sev = "Medium"

    # Standardize asset criticality casing
    crit = raw.asset_criticality.strip().capitalize()
    if crit not in ["Critical", "High", "Medium", "Low"]:
        crit = "Medium"

    # Sanitize entities
    src_ip = raw.source_ip.strip() if raw.source_ip else "0.0.0.0"
    dst_ip = raw.destination_ip.strip() if raw.destination_ip else "0.0.0.0"
    usr = raw.user.strip() if raw.user else "N/A"
    host = (raw.hostname or raw.asset_name or "UNKNOWN-HOST").strip().upper()
    asset_name = (raw.asset_name or host).strip()
    asset_id = (raw.asset_id or f"AST-{host.replace(' ', '-')}").strip()
    proto = raw.protocol.strip().upper() if raw.protocol else "TCP"
    indicator = raw.indicator.strip() if raw.indicator else ""

    return NormalizedAlert(
        alert_id=raw.alert_id.strip(),
        timestamp=parse_iso_timestamp(raw.timestamp),
        source=raw.source.strip(),
        alert_type=raw.alert_type.strip(),
        severity=sev,
        asset_id=asset_id,
        asset_name=asset_name,
        hostname=host,
        asset_criticality=crit,
        user=usr,
        source_ip=src_ip,
        destination_ip=dst_ip,
        protocol=proto,
        indicator=indicator,
        description=raw.description.strip(),
        mitre_tactic=raw.mitre_tactic.strip() if raw.mitre_tactic else None,
        mitre_technique=raw.mitre_technique.strip() if raw.mitre_technique else None,
        scenario_id=raw.scenario_id.strip() if raw.scenario_id else None,
        ground_truth_incident_id=raw.ground_truth_incident_id.strip() if raw.ground_truth_incident_id else None,
        is_false_positive=bool(raw.is_false_positive),
        evidence=raw.evidence if isinstance(raw.evidence, dict) else {"raw": str(raw.evidence)},
        normalized_at=datetime.now(timezone.utc)
    )

def normalize_batch(raw_alerts: List[RawAlert]) -> List[NormalizedAlert]:
    return [normalize_alert(a) for a in raw_alerts]
