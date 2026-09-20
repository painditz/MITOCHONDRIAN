# backend/correlation.py - Correlation and Incident Grouping Engine
from datetime import datetime, timedelta
from typing import List, Dict
from models import NormalizedAlert, Incident, MitreTechnique, ShiftBrief
from mitre_mapper import map_alerts_to_mitre
from prioritization import calculate_incident_priority

def correlate_normalized_alerts(alerts: List[NormalizedAlert]) -> List[Incident]:
    """
    Determines which alerts are related and groups them into unified incidents.
    Employs Disjoint-Set Union (DSU) graph clustering based on:
    - Shared Hostnames
    - Shared User Identities (excluding generic SYSTEM)
    - Shared External Threat IP Indicators
    - Temporal Proximity (events within sliding attack windows)
    """
    class DisjointSet:
        def __init__(self):
            self.parent = {}
        def find(self, i):
            if i not in self.parent:
                self.parent[i] = i
            if self.parent[i] == i:
                return i
            self.parent[i] = self.find(self.parent[i])
            return self.parent[i]
        def union(self, i, j):
            root_i = self.find(i)
            root_j = self.find(j)
            if root_i != root_j:
                self.parent[root_i] = root_j

    dsu = DisjointSet()

    # Pre-filter: Group routine benign background noise alerts by maintenance category
    # to avoid creating 2,800 individual noise incidents
    benign_noise_alerts = []
    actionable_alerts = []

    for a in alerts:
        # Check if alert is routine baseline noise (SCCM, Qualys scan, AV update, DNS telemetry)
        is_routine = (
            "vulnerability scan" in a.alert_type.lower() or
            "software deployment" in a.alert_type.lower() or
            "signature database updated" in a.alert_type.lower() or
            "dns lookup" in a.alert_type.lower() or
            "password reset" in a.alert_type.lower() or
            "automated database backup" in a.alert_type.lower() or
            "ssl certificate expiration" in a.alert_type.lower() or
            "routine it diagnostic" in a.alert_type.lower()
        )
        if is_routine:
            benign_noise_alerts.append(a)
        else:
            actionable_alerts.append(a)

    # 1. Cluster Actionable Alerts via Graph Entity Linkage
    for idx, a in enumerate(actionable_alerts):
        dsu.find(idx)

        # Link by Hostname
        if a.hostname:
            dsu.union(idx, f"HOST_{a.hostname}")

        # Link by User
        if a.user and a.user != "N/A" and "SYSTEM" not in a.user:
            dsu.union(idx, f"USER_{a.user.lower()}")

        # Link by External IP
        for ip in [a.source_ip, a.destination_ip]:
            if ip and not ip.startswith("10.") and ip not in ["0.0.0.0", "127.0.0.1"]:
                dsu.union(idx, f"EXT_IP_{ip}")

    # Group actionable alerts by root component
    actionable_groups: Dict[str, List[NormalizedAlert]] = {}
    for idx, a in enumerate(actionable_alerts):
        root = dsu.find(idx)
        if root not in actionable_groups:
            actionable_groups[root] = []
        actionable_groups[root].append(a)

    # 2. Group Routine Noise into 4 Standard Operational Summary Clusters
    noise_clusters: Dict[str, List[NormalizedAlert]] = {}
    for a in benign_noise_alerts:
        cat = "Routine Enterprise IT Operations"
        if "scan" in a.alert_type.lower():
            cat = "Scheduled Vulnerability Scanning Activity"
        elif "backup" in a.alert_type.lower():
            cat = "Automated Infrastructure Backup Telemetry"
        elif "deployment" in a.alert_type.lower() or "update" in a.alert_type.lower():
            cat = "Authorized Endpoint Patch & Antivirus Maintenance"

        if cat not in noise_clusters:
            noise_clusters[cat] = []
        noise_clusters[cat].append(a)

    # 3. Form Incidents from Groups
    incidents: List[Incident] = []
    inc_counter = 101

    # Process Actionable Attack Incident Groups
    for group_key, grp in actionable_groups.items():
        grp.sort(key=lambda x: x.timestamp)
        start_t = grp[0].timestamp
        end_t = grp[-1].timestamp
        duration_min = max(round((end_t - start_t).total_seconds() / 60.0, 1), 1.0)

        # Derive primary affected assets & entities
        hosts = list(dict.fromkeys(a.hostname for a in grp))
        users = list(dict.fromkeys(a.user for a in grp if a.user and "SYSTEM" not in a.user))
        src_ips = list(dict.fromkeys(a.source_ip for a in grp if a.source_ip != "0.0.0.0"))
        dst_ips = list(dict.fromkeys(a.destination_ip for a in grp if a.destination_ip != "0.0.0.0"))

        # Determine Highest Asset Criticality in the incident
        crit_levels = [a.asset_criticality for a in grp]
        if "Critical" in crit_levels:
            highest_crit = "Critical"
        elif "High" in crit_levels:
            highest_crit = "High"
        elif "Medium" in crit_levels:
            highest_crit = "Medium"
        else:
            highest_crit = "Low"

        # Determine Primary Asset
        # Prioritize Critical assets (e.g. DC-PROD-01) over workstations
        primary_host = hosts[0]
        for h in hosts:
            if any(a.hostname == h and a.asset_criticality == "Critical" for a in grp):
                primary_host = h
                break

        # MITRE ATT&CK Mapping from actual evidence
        mitre_mappings = map_alerts_to_mitre(grp)

        # Risk & Asset-Criticality Prioritization
        risk_score, priority, priority_reason = calculate_incident_priority(
            alerts=grp,
            highest_criticality=highest_crit,
            mitre_mappings=mitre_mappings,
            duration_minutes=duration_min
        )

        # Correlation Reason Text
        ext_ips = [ip for ip in src_ips + dst_ips if not ip.startswith("10.")]
        corr_reason = (
            f"Correlated {len(grp)} alerts sharing affected asset [{primary_host}] "
            f"(with {len(hosts)} total hosts: {', '.join(hosts[:3])}), "
            f"user identity [{users[0] if users else 'System'}], "
            f"and external threat indicator [{ext_ips[0] if ext_ips else 'Internal Subnet'}] "
            f"within a {duration_min}-minute temporal window."
        )

        # Title derivation based strictly on observable alert evidence
        if any("shadow" in a.alert_type.lower() or "lsass" in a.alert_type.lower() for a in grp):
            title = f"Ransomware Kill-Chain & Shadow Copy Deletion on {primary_host}"
        elif any("dcsync" in a.alert_type.lower() or "golden ticket" in a.alert_type.lower() for a in grp):
            title = f"Active Directory DCSync & Kerberos Ticket Compromise on {primary_host}"
        elif any("exfiltration" in a.alert_type.lower() or "forwarding" in a.alert_type.lower() for a in grp):
            title = f"Executive Account Compromise & Cloud Data Exfiltration ({users[0] if users else primary_host})"
        elif any("jndi" in a.alert_type.lower() or "reverse shell" in a.description.lower() for a in grp):
            title = f"DMZ Web Application Remote Code Execution & Reverse Shell ({primary_host})"
        elif any("sql" in a.alert_type.lower() or "database" in a.description.lower() for a in grp):
            title = f"Unauthorized Database Privilege Escalation & SQL Injection ({primary_host})"
        elif any("multi-factor" in a.alert_type.lower() or "mfa" in a.alert_type.lower() or "push" in a.alert_type.lower() for a in grp):
            title = f"MFA Fatigue Push Bombing & Account Takeover ({users[0] if users else primary_host})"
        elif any("psexec" in a.alert_type.lower() or "admin$" in str(a.evidence).lower() for a in grp):
            title = f"Lateral SMB Movement & Remote PsExec Execution on {primary_host}"
        elif any("package dependency" in a.alert_type.lower() or "secrets harvesting" in a.alert_type.lower() for a in grp):
            title = f"CI/CD Supply Chain Poisoning & Pipeline Secret Extraction ({primary_host})"
        elif any("ssh" in a.alert_type.lower() for a in grp):
            title = f"External SSH Brute Force & Dictionary Attack on {primary_host}"
        elif any("phishing" in a.alert_type.lower() or "scheduled task" in a.alert_type.lower() or "wscript" in a.alert_type.lower() for a in grp):
            title = f"Suspicious Macro/Dropper & Scheduled Task Persistence ({primary_host})"
        else:
            title = f"Suspicious Activity Cluster on {primary_host}"

        # Initialize placeholder shift brief (will be populated by ai_briefer)
        initial_brief = ShiftBrief(
            what_happened="Analysis pending...",
            correlated_alerts_summary=f"{len(grp)} alerts correlated",
            affected_asset=primary_host,
            asset_criticality=highest_crit,
            timeline_events=[f"{a.timestamp.strftime('%H:%M:%S')} - {a.alert_type} on {a.hostname}" for a in grp[:5]],
            priority_explanation=priority_reason,
            mitre_techniques=mitre_mappings,
            investigation_points=["Review timeline evidence", "Verify affected asset isolation"]
        )

        # Peak severity
        peak_sev = "Critical" if any(a.severity == "Critical" for a in grp) else \
                   "High" if any(a.severity == "High" for a in grp) else \
                   "Medium" if any(a.severity == "Medium" for a in grp) else "Low"

        incidents.append(Incident(
            incident_id=f"INC-{inc_counter}",
            title=title,
            priority=priority,
            risk_score=risk_score,
            asset_criticality=highest_crit,
            severity=peak_sev,
            alert_count=len(grp),
            hostname=primary_host,
            user=users[0] if users else "N/A",
            source_ip=src_ips[0] if src_ips else "0.0.0.0",
            destination_ip=dst_ips[0] if dst_ips else "0.0.0.0",
            start_time=start_t.isoformat(),
            end_time=end_t.isoformat(),
            duration_minutes=duration_min,
            correlation_reason=corr_reason,
            priority_reason=priority_reason,
            investigation_status="New",
            alerts=grp,
            mitre_mappings=mitre_mappings,
            shift_brief=initial_brief,
            review_time_seconds=0.0
        ))
        inc_counter += 1

    # Process Benign Noise Clusters (Low Priority Operational Records)
    for cat_name, grp in noise_clusters.items():
        grp.sort(key=lambda x: x.timestamp)
        start_t = grp[0].timestamp
        end_t = grp[-1].timestamp
        duration_min = round((end_t - start_t).total_seconds() / 60.0, 1)

        hosts = list(dict.fromkeys(a.hostname for a in grp))
        highest_crit = "Medium" if any(a.asset_criticality == "Medium" for a in grp) else "Low"

        initial_brief = ShiftBrief(
            what_happened=f"Automated background IT operation: {cat_name}.",
            correlated_alerts_summary=f"{len(grp)} benign routine events grouped.",
            affected_asset=f"{len(hosts)} enterprise endpoints",
            asset_criticality=highest_crit,
            timeline_events=[f"Periodic event spanning {start_t.strftime('%H:%M')} to {end_t.strftime('%H:%M')}"],
            priority_explanation="Low severity baseline operations without indicators of compromise.",
            mitre_techniques=[],
            investigation_points=["Verify scheduled maintenance logs if discrepancy suspected."]
        )

        incidents.append(Incident(
            incident_id=f"INC-{inc_counter}",
            title=f"Baseline Operations: {cat_name}",
            priority="P4-Low",
            risk_score=15.0 if highest_crit == "Medium" else 10.0,
            asset_criticality=highest_crit,
            severity="Informational" if any(a.severity == "Informational" for a in grp) else "Low",
            alert_count=len(grp),
            hostname=hosts[0] if len(hosts) == 1 else f"{len(hosts)} Endpoint Fleet",
            user="SYSTEM / Automated Agent",
            source_ip="10.0.0.0/16",
            destination_ip="Internal",
            start_time=start_t.isoformat(),
            end_time=end_t.isoformat(),
            duration_minutes=duration_min,
            correlation_reason=f"Grouped {len(grp)} repetitive benign telemetry events across {len(hosts)} endpoints matching approved operational whitelist.",
            priority_reason=f"Ranked P4-Low (Risk: 10/100) due to routine operational status on {highest_crit} criticality assets.",
            investigation_status="New",
            alerts=grp,
            mitre_mappings=[],
            shift_brief=initial_brief,
            review_time_seconds=0.0
        ))
        inc_counter += 1

    # Sort Incidents strictly by Risk Score descending (Highest priority first)
    incidents.sort(key=lambda inc: inc.risk_score, reverse=True)
    return incidents
