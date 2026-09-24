# backend/graph_engine.py - Authoritative Correlation Graph Contract Engine
"""
Generates the authoritative correlation graph structure derived directly from the
backend correlation engine using ONLY real observable evidence:
- HOST
- USER
- EXTERNAL IP
- TIME WINDOW

Strictly ZERO synthetic fields (no scenario_id, ground_truth_incident_id, is_false_positive).
Strictly ZERO geometric distance logic.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional

def parse_iso(ts_str: Optional[str]) -> Optional[datetime]:
    if not ts_str:
        return None
    try:
        return datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
    except Exception:
        return None

def extract_incident_entities(inc) -> Dict[str, Any]:
    # Support both Pydantic Incident object and dict
    inc_dict = inc.dict() if hasattr(inc, "dict") else (inc if isinstance(inc, dict) else inc.__dict__)
    
    hosts = set()
    users = set()
    ext_ips = set()
    timestamps = []

    primary_host = inc_dict.get("hostname")
    if primary_host and "Endpoint Fleet" not in primary_host:
        hosts.add(primary_host.strip())

    primary_user = inc_dict.get("user")
    if primary_user and "SYSTEM" not in primary_user.upper() and "AUTOMATED" not in primary_user.upper() and primary_user != "N/A":
        users.add(primary_user.strip())

    for ip in [inc_dict.get("source_ip"), inc_dict.get("destination_ip")]:
        if ip and not ip.startswith("10.") and not ip.startswith("192.168.") and not ip.startswith("127.") and ip not in ["0.0.0.0", "Internal"]:
            ext_ips.add(ip.strip())

    raw_alerts = inc_dict.get("alerts", [])
    for a in raw_alerts:
        a_dict = a.dict() if hasattr(a, "dict") else (a if isinstance(a, dict) else a.__dict__)
        h = a_dict.get("hostname")
        if h and "Endpoint Fleet" not in h:
            hosts.add(h.strip())
        u = a_dict.get("user")
        if u and "SYSTEM" not in u.upper() and "AUTOMATED" not in u.upper() and u != "N/A":
            users.add(u.strip())
        for ip in [a_dict.get("source_ip"), a_dict.get("destination_ip")]:
            if ip and not ip.startswith("10.") and not ip.startswith("192.168.") and not ip.startswith("127.") and ip not in ["0.0.0.0", "Internal"]:
                ext_ips.add(ip.strip())
        
        ts = parse_iso(a_dict.get("timestamp"))
        if ts:
            timestamps.append(ts)

    start_t = parse_iso(inc_dict.get("start_time")) or (min(timestamps) if timestamps else None)
    end_t = parse_iso(inc_dict.get("end_time")) or (max(timestamps) if timestamps else None)

    return {
        "id": inc_dict.get("incident_id"),
        "title": inc_dict.get("title", ""),
        "priority": inc_dict.get("priority", "P3-Medium"),
        "risk_score": float(inc_dict.get("risk_score", 50.0)),
        "asset_criticality": inc_dict.get("asset_criticality", "Medium"),
        "primary_asset": primary_host or "Unknown",
        "alert_count": len(raw_alerts),
        "hosts": hosts,
        "users": users,
        "ext_ips": ext_ips,
        "start_t": start_t,
        "end_t": end_t,
        "alerts": raw_alerts
    }

def build_authoritative_graph(incidents: List[Any], target_incident_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Constructs the authoritative correlation graph:
    1. Global Incident Topology (15 incidents + evidence-backed correlation arcs)
    2. Incident Deep Forensic Drilldown (when target_incident_id is provided)
    """
    entities_list = [extract_incident_entities(inc) for inc in incidents]
    
    # 1. Base Incident Nodes
    nodes = []
    for ent in entities_list:
        nodes.append({
            "id": ent["id"],
            "type": "INCIDENT",
            "title": ent["title"],
            "priority": ent["priority"],
            "risk_score": ent["risk_score"],
            "asset_criticality": ent["asset_criticality"],
            "primary_asset": ent["primary_asset"],
            "alert_count": ent["alert_count"],
            "start_time": ent["start_t"].isoformat() if ent["start_t"] else None,
            "end_time": ent["end_t"].isoformat() if ent["end_t"] else None,
            "observable_summary": {
                "hosts": sorted(list(ent["hosts"])),
                "users": sorted(list(ent["users"])),
                "external_ips": sorted(list(ent["ext_ips"]))
            }
        })

    # 2. Pairwise Observable Correlation Edges between Incidents
    edges = []
    for i in range(len(entities_list)):
        for j in range(i + 1, len(entities_list)):
            a = entities_list[i]
            b = entities_list[j]

            evidence_items = []

            # A. Shared Host
            shared_hosts = a["hosts"].intersection(b["hosts"])
            for h in sorted(shared_hosts):
                evidence_items.append({
                    "type": "HOST",
                    "title": "Shared host",
                    "value": h
                })

            # B. Shared User
            shared_users = a["users"].intersection(b["users"])
            for u in sorted(shared_users):
                evidence_items.append({
                    "type": "USER",
                    "title": "Shared user",
                    "value": u
                })

            # C. Shared External Threat IP
            shared_ips = a["ext_ips"].intersection(b["ext_ips"])
            for ip in sorted(shared_ips):
                evidence_items.append({
                    "type": "EXTERNAL IP",
                    "title": "Shared external IP",
                    "value": ip
                })

            # D. Temporal Proximity
            if (shared_hosts or shared_users or shared_ips) and a["start_t"] and b["start_t"]:
                diff_min = abs((a["start_t"] - b["start_t"]).total_seconds()) / 60.0
                if diff_min <= 60.0:
                    evidence_items.append({
                        "type": "TIME WINDOW",
                        "title": "Temporal proximity",
                        "value": f"Within {round(diff_min, 1)}m correlation window"
                    })

            if evidence_items:
                edges.append({
                    "id": f"{a['id']}--{b['id']}",
                    "source": a["id"],
                    "target": b["id"],
                    "evidence": evidence_items,
                    "primary_evidence_type": evidence_items[0]["type"]
                })

    # 3. Optional Detailed Drilldown for specific selected incident
    drilldown = None
    if target_incident_id:
        target_ent = next((ent for ent in entities_list if ent["id"] == target_incident_id), None)
        if target_ent:
            drilldown_nodes = []
            drilldown_edges = []

            # Root Incident Node
            drilldown_nodes.append({
                "id": target_ent["id"],
                "type": "INCIDENT",
                "label": target_ent["id"],
                "title": target_ent["title"],
                "priority": target_ent["priority"],
                "risk_score": target_ent["risk_score"]
            })

            # Entity Pivot Nodes
            for h in target_ent["hosts"]:
                e_id = f"HOST:{h}"
                drilldown_nodes.append({"id": e_id, "type": "ENTITY_HOST", "label": h, "title": "Host Infrastructure"})
                drilldown_edges.append({"source": target_ent["id"], "target": e_id, "type": "HOST_LINK", "label": "Affected Host"})

            for u in target_ent["users"]:
                e_id = f"USER:{u}"
                drilldown_nodes.append({"id": e_id, "type": "ENTITY_USER", "label": u, "title": "User Identity"})
                drilldown_edges.append({"source": target_ent["id"], "target": e_id, "type": "USER_LINK", "label": "Account"})

            for ip in target_ent["ext_ips"]:
                e_id = f"IP:{ip}"
                drilldown_nodes.append({"id": e_id, "type": "ENTITY_IP", "label": ip, "title": "External IP / Indicator"})
                drilldown_edges.append({"source": target_ent["id"], "target": e_id, "type": "IP_LINK", "label": "Threat Egress"})

            # Alert Signal Nodes
            for a in target_ent["alerts"][:12]:
                a_dict = a.dict() if hasattr(a, "dict") else (a if isinstance(a, dict) else a.__dict__)
                alt_id = a_dict.get("alert_id")
                drilldown_nodes.append({
                    "id": alt_id,
                    "type": "ALERT",
                    "label": alt_id,
                    "severity": a_dict.get("severity", "Medium"),
                    "alert_type": a_dict.get("alert_type", "Alert"),
                    "timestamp": a_dict.get("timestamp")
                })
                # Link alert to root incident
                drilldown_edges.append({
                    "source": alt_id,
                    "target": target_ent["id"],
                    "type": "CORRELATED_ALERT",
                    "label": a_dict.get("alert_type")
                })

            drilldown = {
                "incident_id": target_incident_id,
                "nodes": drilldown_nodes,
                "edges": drilldown_edges
            }

    return {
        "status": "success",
        "total_incidents": len(nodes),
        "total_edges": len(edges),
        "nodes": nodes,
        "edges": edges,
        "drilldown": drilldown
    }
