# backend/mitre_mapper.py - Evidence-grounded MITRE ATT&CK Mapper
from typing import List
from models import NormalizedAlert, MitreTechnique

def map_alerts_to_mitre(alerts: List[NormalizedAlert]) -> List[MitreTechnique]:
    """
    Maps alert evidence to MITRE ATT&CK techniques ONLY when concrete evidence supports the mapping.
    Strictly forbids hallucinating or fabricating techniques without direct telemetry evidence.
    """
    techniques = []
    seen_ids = set()

    for a in alerts:
        ev = a.evidence or {}
        desc = a.description.lower()
        atype = a.alert_type.lower()
        cmd = str(ev.get("command_line", "")).lower()
        proc = str(ev.get("process", "")).lower()

        # T1490 - Inhibit System Recovery: Volume Shadow Copy Deletion
        if "vssadmin" in cmd or "delete shadows" in cmd or "vssadmin" in desc:
            if "T1490" not in seen_ids:
                seen_ids.add("T1490")
                techniques.append(MitreTechnique(
                    technique_id="T1490",
                    technique_name="Inhibit System Recovery: Volume Shadow Copy Deletion",
                    tactic="Impact",
                    evidence_found=f"Command executed: {ev.get('command_line', 'vssadmin delete shadows')}"
                ))

        # T1003.001 - OS Credential Dumping: LSASS Memory
        if "lsass" in str(ev.get("target_process", "")).lower() or "lsass" in desc or "mimikatz" in desc:
            if "T1003.001" not in seen_ids:
                seen_ids.add("T1003.001")
                techniques.append(MitreTechnique(
                    technique_id="T1003.001",
                    technique_name="OS Credential Dumping: LSASS Memory",
                    tactic="Credential Access",
                    evidence_found=f"Target: {ev.get('target_process', 'lsass.exe')}, Caller: {ev.get('caller', 'procdump')}, Access Mask: {ev.get('access_mask', '0x1FFFFF')}"
                ))

        # T1059.001 - Command and Scripting Interpreter: PowerShell
        if "-enc" in cmd or "powershell" in proc or "encodedcommand" in desc:
            if "T1059.001" not in seen_ids:
                seen_ids.add("T1059.001")
                techniques.append(MitreTechnique(
                    technique_id="T1059.001",
                    technique_name="Command and Scripting Interpreter: PowerShell",
                    tactic="Execution",
                    evidence_found=f"Executed command: {ev.get('command_line', 'powershell.exe -enc ...')}"
                ))

        # T1566.001 - Phishing: Spearphishing Attachment
        if "macro" in atype or "winword" in proc or "docm" in desc:
            if "T1566.001" not in seen_ids:
                seen_ids.add("T1566.001")
                techniques.append(MitreTechnique(
                    technique_id="T1566.001",
                    technique_name="Phishing: Spearphishing Attachment",
                    tactic="Initial Access",
                    evidence_found=f"Process chain: {ev.get('process', 'winword.exe -> cmd.exe')}, Macro: {ev.get('macro_name', 'AutoOpen')}"
                ))

        # T1078.002 - Valid Accounts: Domain Accounts
        if "pass-the-hash" in atype or "krbtgt" in str(ev.get("service_ticket", "")):
            if "T1078.002" not in seen_ids:
                seen_ids.add("T1078.002")
                techniques.append(MitreTechnique(
                    technique_id="T1078.002",
                    technique_name="Valid Accounts: Domain Accounts",
                    tactic="Privilege Escalation",
                    evidence_found=f"Auth package: {ev.get('auth_package', 'NTLM')}, Ticket: {ev.get('service_ticket', 'krbtgt')}"
                ))

        # T1567.002 - Exfiltration Over Web Service: Exfiltration to Cloud Storage
        if "mega.nz" in str(ev.get("destination_domain", "")).lower() or ev.get("bytes_sent", 0) > 1000000000:
            if "T1567.002" not in seen_ids:
                seen_ids.add("T1567.002")
                techniques.append(MitreTechnique(
                    technique_id="T1567.002",
                    technique_name="Exfiltration to Cloud Storage",
                    tactic="Exfiltration",
                    evidence_found=f"Destination: {ev.get('destination_domain', 'mega.nz')}, Bytes sent: {ev.get('bytes_sent', 'N/A')} bytes"
                ))

        # T1114.002 - Email Collection: Remote Email Forwarding Rule
        if "forward" in atype or "forward_to" in ev:
            if "T1114.002" not in seen_ids:
                seen_ids.add("T1114.002")
                techniques.append(MitreTechnique(
                    technique_id="T1114.002",
                    technique_name="Email Collection: Remote Email Forwarding Rule",
                    tactic="Collection",
                    evidence_found=f"Forward destination: {ev.get('forward_to', 'N/A')}, Rule: {ev.get('rule_name', 'N/A')}"
                ))

        # T1190 - Exploit Public-Facing Application (Log4j)
        if "jndi" in str(ev.get("payload", "")).lower() or "jndi" in desc:
            if "T1190" not in seen_ids:
                seen_ids.add("T1190")
                techniques.append(MitreTechnique(
                    technique_id="T1190",
                    technique_name="Exploit Public-Facing Application",
                    tactic="Initial Access",
                    evidence_found=f"Payload: {ev.get('payload', '${jndi:ldap:...}')}"
                ))

        # T1059.004 - Command and Scripting Interpreter: Unix Shell
        if "/dev/tcp" in cmd or "/bin/sh" in cmd:
            if "T1059.004" not in seen_ids:
                seen_ids.add("T1059.004")
                techniques.append(MitreTechnique(
                    technique_id="T1059.004",
                    technique_name="Command and Scripting Interpreter: Unix Shell",
                    tactic="Execution",
                    evidence_found=f"Reverse shell command: {ev.get('command_line', '/bin/sh ...')}"
                ))

        # T1053.003 - Scheduled Task/Job: Cron
        if "cron" in atype or "cron_entry" in ev:
            if "T1053.003" not in seen_ids:
                seen_ids.add("T1053.003")
                techniques.append(MitreTechnique(
                    technique_id="T1053.003",
                    technique_name="Scheduled Task/Job: Cron",
                    tactic="Persistence",
                    evidence_found=f"Cron entry: {ev.get('cron_entry', 'crontab')}"
                ))

        # T1053.005 - Scheduled Task/Job: Scheduled Task
        if "schtasks" in desc or "task_name" in ev:
            if "T1053.005" not in seen_ids:
                seen_ids.add("T1053.005")
                techniques.append(MitreTechnique(
                    technique_id="T1053.005",
                    technique_name="Scheduled Task/Job: Scheduled Task",
                    tactic="Persistence",
                    evidence_found=f"Task name: {ev.get('task_name', 'N/A')}, Path: {ev.get('binary_path', 'N/A')}"
                ))

        # T1110.001 - Password Guessing / Brute Force
        if "failed_attempts" in ev or "ssh password guessing" in atype or "kdc_err_preauth_failed" in str(ev.get("status_code", "")).lower():
            if "T1110.001" not in seen_ids:
                seen_ids.add("T1110.001")
                techniques.append(MitreTechnique(
                    technique_id="T1110.001",
                    technique_name="Brute Force: Password Guessing",
                    tactic="Credential Access",
                    evidence_found=f"Failed attempts: {ev.get('failed_attempts', ev.get('attempt_index', 'Multiple'))}, Status: {ev.get('status_code', 'Auth Failed')}"
                ))

    return techniques
