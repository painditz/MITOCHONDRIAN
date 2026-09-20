# backend/ai_briefer.py - Real AI Incident Handover Briefer using Local Transformer
import os
import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from models import Incident, ShiftBrief, MitreTechnique

# Global model cache to avoid re-loading on each incident
_AI_MODEL = None
_AI_TOKENIZER = None
_MODEL_INITIALIZATION_ATTEMPTED = False
MODEL_NAME = "google/flan-t5-small"

def get_or_load_ai_model():
    """
    Lazily loads the lightweight Seq2Seq transformer model on CPU.
    Designed specifically for laptop-friendly, local inference without GPU.
    """
    global _AI_MODEL, _AI_TOKENIZER, _MODEL_INITIALIZATION_ATTEMPTED
    if _AI_MODEL is not None:
        return _AI_MODEL, _AI_TOKENIZER
    if _MODEL_INITIALIZATION_ATTEMPTED:
        return None, None

    _MODEL_INITIALIZATION_ATTEMPTED = True
    try:
        from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
        model.eval()
        _AI_MODEL = model
        _AI_TOKENIZER = tokenizer
        print(f"[AI Briefer] Successfully loaded local AI model: {MODEL_NAME}")
        return _AI_MODEL, _AI_TOKENIZER
    except Exception as e:
        print(f"[AI Briefer] Note: Transformer model failed to load ({e}). Using deterministic grounded synthesis.")
        return None, None

def extract_structured_evidence(incident: Incident) -> Dict[str, Any]:
    """
    Extracts strictly verified factual evidence from incident telemetry.
    No assumptions, no imaginary signals.
    """
    alerts = incident.alerts
    evidence_items = []
    seen_cmds = set()
    seen_processes = set()
    destinations = set()

    for a in alerts:
        ev = a.evidence or {}
        if "command_line" in ev and ev["command_line"]:
            cmd = ev["command_line"]
            if cmd not in seen_cmds:
                seen_cmds.add(cmd)
                evidence_items.append(f"Command executed: `{cmd}`")
        if "process" in ev and ev["process"]:
            proc = ev["process"]
            if proc not in seen_processes:
                seen_processes.add(proc)
                evidence_items.append(f"Process spawned: `{proc}`")
        if "destination_domain" in ev and ev["destination_domain"]:
            dest = f"{ev['destination_domain']} ({ev.get('bytes_sent', 0)} bytes)"
            if dest not in destinations:
                destinations.add(dest)
                evidence_items.append(f"Outbound transfer to: `{dest}`")
        if "sql_query" in ev and ev["sql_query"]:
            evidence_items.append(f"SQL execution: `{ev['sql_query']}`")

    tactics = [m.tactic for m in incident.mitre_mappings]
    unique_tactics = list(dict.fromkeys(tactics))

    return {
        "incident_id": incident.incident_id,
        "hostname": incident.hostname,
        "asset_criticality": incident.asset_criticality,
        "user": incident.user if incident.user and incident.user != "N/A" else "Unspecified/SYSTEM",
        "severity": incident.severity,
        "alert_count": len(alerts),
        "duration_minutes": incident.duration_minutes,
        "tactics": unique_tactics,
        "concrete_evidence": evidence_items[:5] if evidence_items else ["Evidence is insufficient to confirm anomalous execution."]
    }

def generate_ai_synopsis(evidence: Dict[str, Any]) -> str:
    """
    Invokes the real local Seq2Seq model with strictly grounded evidence context.
    Controls hallucination by enforcing evidence bounding and fallback guards.
    """
    model, tokenizer = get_or_load_ai_model()
    
    evidence_str = "; ".join(evidence["concrete_evidence"])
    tactics_str = ", ".join(evidence["tactics"]) if evidence["tactics"] else "Unknown tactic"
    
    prompt = (
        f"Summarize this security incident briefly: "
        f"Host: {evidence['hostname']} (Asset Criticality: {evidence['asset_criticality']}). "
        f"User: {evidence['user']}. "
        f"Alerts: {evidence['alert_count']} total. "
        f"Tactics: {tactics_str}. "
        f"Forensic Evidence: {evidence_str}."
    )

    if model is not None and tokenizer is not None:
        try:
            inputs = tokenizer(prompt, return_tensors="pt", max_length=512, truncation=True)
            outputs = model.generate(
                **inputs,
                max_new_tokens=40,
                num_beams=1,
                do_sample=False
            )
            generated_summary = tokenizer.decode(outputs[0], skip_special_tokens=True).strip()
            if generated_summary and len(generated_summary) > 10:
                # Append grounded asset context to assure complete grounding
                return (
                    f"AI Synthesis ({MODEL_NAME}): {generated_summary}. "
                    f"Telemetry confirms {evidence['alert_count']} alerts targeting asset [{evidence['hostname']}] "
                    f"({evidence['asset_criticality']} Criticality) involving user account [{evidence['user']}]. "
                    f"Key evidence: {evidence_str}"
                )
        except Exception as e:
            print(f"[AI Briefer] Inference error: {e}")

    # Grounded factual synthesis if model unavailable or during fallback
    return (
        f"Grounded Security Summary: Telemetry detected {evidence['alert_count']} alerts across {evidence['duration_minutes']} minutes "
        f"on asset [{evidence['hostname']}] ({evidence['asset_criticality']} Criticality). "
        f"Observed MITRE Tactics: [{tactics_str}]. "
        f"Key forensic evidence: {evidence_str}"
    )

def generate_shift_brief(incident: Incident) -> ShiftBrief:
    """
    Generates an auditable, evidence-grounded Shift Handover Brief.
    Includes full generation metadata, evidence context provenance, and analyst agreement controls.
    """
    alerts = incident.alerts
    crit = incident.asset_criticality
    host = incident.hostname
    user = incident.user
    mitre_list = incident.mitre_mappings

    # 1. Extract factual telemetry context
    evidence_context = extract_structured_evidence(incident)

    # 2. Generate model synopsis
    synopsis = generate_ai_synopsis(evidence_context)

    # 3. Correlated Alerts Summary
    alert_types = [a.alert_type for a in alerts]
    unique_types = list(dict.fromkeys(alert_types))
    correlated_summary = (
        f"Correlated {len(alerts)} alerts across {incident.duration_minutes} minutes. "
        f"Alert types observed: {', '.join(unique_types[:5])}."
    )

    # 4. Milestone Timeline
    timeline_events = []
    seen_events = set()
    for a in alerts:
        ev_key = f"{a.alert_type}-{a.hostname}"
        if ev_key not in seen_events:
            seen_events.add(ev_key)
            t_str = a.timestamp.strftime("%H:%M:%S") if hasattr(a.timestamp, "strftime") else str(a.timestamp)[11:19]
            ev_detail = ""
            if "command_line" in a.evidence:
                ev_detail = f" [Cmd: {a.evidence['command_line']}]"
            elif "forward_to" in a.evidence:
                ev_detail = f" [Forwarding to: {a.evidence['forward_to']}]"
            elif "bytes_sent" in a.evidence:
                ev_detail = f" [Bytes: {a.evidence['bytes_sent']}]"
            timeline_events.append(f"{t_str} UTC - {a.alert_type} on {a.hostname}{ev_detail}")

    if not timeline_events:
        timeline_events.append("Evidence is insufficient to construct an extended milestone timeline.")

    # 5. Asset-Criticality Driven Priority Explanation
    priority_explanation = (
        f"Incident is assigned {incident.priority} with an explainable Risk Score of {incident.risk_score}/100. "
        f"Crucial Factor: Asset [{host}] is classified as [{crit}], contributing significant weight to prioritization. "
        f"Peak severity is [{incident.severity}] with {len(mitre_list)} confirmed MITRE ATT&CK techniques."
    )

    # 6. Actionable Investigation Points
    investigation_points = []
    if crit == "Critical":
        investigation_points.append(f"PRIORITY 1: Validate integrity of Critical Asset [{host}] (Domain Controller / Core DB).")
    if user and user != "N/A" and "SYSTEM" not in user:
        investigation_points.append(f"Review identity audit logs for user account [{user}] to verify active authentication sessions.")
    if any(m.tactic == "Exfiltration" for m in mitre_list):
        investigation_points.append("Check perimeter proxy / firewall egress logs for high volume transfers to unapproved cloud storage.")
    if any(m.tactic == "Impact" for m in mitre_list):
        investigation_points.append("Check local shadow copies (`vssadmin list shadows`) and test backup restore validity immediately.")
    if any(m.tactic == "Credential Access" for m in mitre_list):
        investigation_points.append("Check LSASS process memory handles and review Active Directory Kerberos ticket issuance logs.")

    if not investigation_points:
        investigation_points.append("Evidence is insufficient to prescribe specialized containment; conduct standard endpoint telemetry review.")

    timestamp_now = datetime.now(timezone.utc).isoformat()

    return ShiftBrief(
        what_happened=synopsis,
        correlated_alerts_summary=correlated_summary,
        affected_asset=f"{host} ({crit})",
        asset_criticality=crit,
        timeline_events=timeline_events,
        priority_explanation=priority_explanation,
        mitre_techniques=mitre_list,
        investigation_points=investigation_points,
        analyst_status="Pending Review",
        analyst_notes=[],
        ai_model_name=MODEL_NAME,
        ai_generation_timestamp=timestamp_now,
        evidence_context_used=evidence_context,
        analyst_agreement="Pending Review",
        analyst_feedback_notes=None
    )

def enrich_incidents_with_briefs(incidents: List[Incident]) -> List[Incident]:
    for inc in incidents:
        inc.shift_brief = generate_shift_brief(inc)
    return incidents
