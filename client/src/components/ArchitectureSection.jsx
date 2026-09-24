// client/src/components/ArchitectureSection.jsx
// 01 / Alert Intelligence Architecture (The Incident Core)
// Features:
// 1. Pipeline Sequence: ALERTS → NORMALIZE → CORRELATE → PRIORITIZE → MITRE → AI → HUMAN REVIEW
// 2. Seven Interactive Stages with Progressive Disclosure Inspection
// 3. Control Plane / Data Plane Technical Architecture Visualization
import React, { useState } from 'react';

export const DEFAULT_STAGES = [
  {
    id: '01',
    code: '01',
    name: 'INGEST',
    subtitle: 'HETEROGENEOUS TELEMETRY STREAMS',
    shortDesc: 'Continuous ingestion across five enterprise telemetry sensors.',
    metric: '3,000 ALERTS',
    tag: '5 SENSORS',
    expanded: {
      title: 'MULTI-STREAM DATA INGESTION',
      lead: 'High-throughput stream processing absorbs uncoordinated alert spikes from heterogeneous monitoring infrastructure.',
      evidencePoints: [
        { label: 'EDR TELEMETRY', value: '1,450 alerts (Process injection, LSASS dump, PowerShell)' },
        { label: 'IDENTITY PROVIDER', value: '620 events (Impossible travel, password spray, OAuth consent)' },
        { label: 'CLOUD AUDIT', value: '430 records (S3 mass download, role escalation, KMS key use)' },
        { label: 'NETWORK / FIREWALL', value: '320 flows (C2 beaconing, port sweep, ICMP tunnel)' },
        { label: 'EMAIL GATEWAY', value: '180 scans (Malicious forwarding rules, phishing payloads)' }
      ],
      metrics: [
        { key: 'THROUGHPUT', val: '3,000 records / batch' },
        { key: 'INGESTION LATENCY', val: '< 180 ms' },
        { key: 'LOSSLESS BUFFER', val: 'Zero-drop guarantee' }
      ]
    }
  },
  {
    id: '02',
    code: '02',
    name: 'NORMALIZE',
    subtitle: 'CANONICAL SCHEMA STANDARD',
    shortDesc: 'Disparate vendor syntaxes standardise into a 19-field schema.',
    metric: '19-FIELD COMMON SCHEMA',
    tag: 'OCSF / STIX ALIGNED',
    expanded: {
      title: 'CANONICAL FIELD RESOLUTION',
      lead: 'Eliminates vendor-specific schema fragmentation by extracting standard entities, timestamps, and confidence ratings.',
      evidencePoints: [
        { label: 'HOST / ASSET PIVOT', value: 'Unified NetBIOS, FQDN, and cloud resource IDs' },
        { label: 'IDENTITY RESOLUTION', value: 'Normalizes UPN, sAMAccountName, and cloud GUIDs' },
        { label: 'TEMPORAL ALIGNMENT', value: 'Strict UTC ISO-8601 millisecond ordering' },
        { label: 'SEVERITY HARMONIZATION', value: '5-tier normalized severity index (Crit, High, Med, Low, Info)' }
      ],
      metrics: [
        { key: 'NORMALIZATION RATE', val: '100.0% validation' },
        { key: 'SCHEMA DRIFT', val: '0 uncategorized fields' },
        { key: 'MAPPING EFFICIENCY', val: '1.2 ms / 1k alerts' }
      ]
    }
  },
  {
    id: '03',
    code: '03',
    name: 'CORRELATE',
    subtitle: 'MULTI-ENTITY GRAPH CLUSTERING',
    shortDesc: 'Observable evidence transforms 3,000 alerts into 15 incident clusters.',
    metric: '15 INCIDENT / TRIAGE CLUSTERS',
    tag: '99.5% TRIAGE REDUCTION',
    expanded: {
      title: 'THE INCIDENT CORE',
      lead: 'Observable relationships group related alerts across time horizons, network boundaries, and credential pivots into 15 production incident / triage clusters.',
      evidencePoints: [
        { label: 'HOST', value: 'Pivots across affected workstations, servers, and domain controllers' },
        { label: 'USER', value: 'Correlates compromised identities across cloud identity and on-prem AD' },
        { label: 'EXTERNAL IP', value: 'Shared adversary command-and-control infrastructure and IPs' },
        { label: 'TEMPORAL PROXIMITY', value: '60-minute sliding window establishing incident causality' }
      ],
      metrics: [
        { key: 'PAIRWISE PRECISION', val: '1.0000' },
        { key: 'PAIRWISE RECALL', val: '0.9068' },
        { key: 'PAIRWISE F1 SCORE', val: '0.9511' }
      ]
    }
  },
  {
    id: '04',
    code: '04',
    name: 'PRIORITIZE',
    subtitle: 'ASSET-CRITICALITY WEIGHTING',
    shortDesc: 'Asset criticality is the dominant enterprise prioritization factor.',
    metric: 'RISK + ASSET CRITICALITY',
    tag: 'EXPLAINABLE RANKING',
    expanded: {
      title: 'EXPLAINABLE RISK PRIORITIZATION',
      lead: 'Asset criticality is the dominant enterprise prioritization factor. Incidents are prioritized by enterprise asset business value, peak severity, kill-chain depth, and ML relevance rather than raw alert volume.',
      evidencePoints: [
        { label: 'ASSET CRITICALITY (+45)', value: 'Domain Controller or Production Database multiplier (Dominant factor)' },
        { label: 'PEAK SEVERITY (+25)', value: 'Highest normalized severity within incident cluster' },
        { label: 'KILL-CHAIN DEPTH (+12)', value: 'Exfiltration and credential dumping progression bonus' },
        { label: 'ML RELEVANCE (+9)', value: 'Trained random forest classifier noise rejection score' },
        { label: 'ALERT VOLUME (+5)', value: 'Aggregate normalized evidence volume' }
      ],
      metrics: [
        { key: 'DOMINANT FACTOR', val: 'Asset Criticality (+45 pts)' },
        { key: 'MAX RISK SCORE', val: '96.4 / 100 Risk' },
        { key: 'P1 CRITICAL CLUSTERS', val: '7 priority incidents' }
      ]
    }
  },
  {
    id: '05',
    code: '05',
    name: 'MAP',
    subtitle: 'MITRE ATT&CK EVIDENCE ATTRIBUTION',
    shortDesc: 'Concrete observables map directly into adversary tactics and techniques.',
    metric: 'MITRE ATT&CK',
    tag: '6 MAPPED TECHNIQUES',
    expanded: {
      title: 'EVIDENCE-GROUNDED TECHNIQUE ATTRIBUTION',
      lead: 'Rules require physical forensic proof (e.g. command line parameters, API calls) before tagging ATT&CK techniques.',
      evidencePoints: [
        { label: 'T1114.002', value: 'Email Collection: Remote Email Forwarding Rule' },
        { label: 'T1567.002', value: 'Exfiltration to Cloud Storage Gateway (mega.nz)' },
        { label: 'T1078.004', value: 'Valid Accounts: Domain & Cloud Compromised Accounts' },
        { label: 'T1490', value: 'Inhibit System Recovery: Volume Shadow Copy Deletion' },
        { label: 'T1059.001', value: 'Command and Scripting Interpreter: PowerShell Execution' },
        { label: 'T1190', value: 'Exploit Public-Facing Application: SQL Injection' }
      ],
      metrics: [
        { key: 'MAPPING ACCURACY', val: '100% evidence-backed' },
        { key: 'UNGROUNDED TAGS', val: 'Strictly 0 hallucinations' },
        { key: 'KILL-CHAIN COVERAGE', val: 'Access through Exfiltration' }
      ]
    }
  },
  {
    id: '06',
    code: '06',
    name: 'SUMMARIZE',
    subtitle: 'LOCAL FLAN-T5 AI SHIFT BRIEF',
    shortDesc: 'Local language model produces concise, structured shift handover briefings.',
    metric: 'LOCAL AI SHIFT BRIEF',
    tag: 'ZERO DATA EGRESS',
    expanded: {
      title: 'LOCAL AI SHIFT HANDOVER BRIEFS',
      lead: 'Deterministic local FLAN-T5 model ingests validated incident evidence to produce concise, scannable summaries for SOC analyst relief.',
      evidencePoints: [
        { label: 'WHAT HAPPENED', value: 'Executive account compromise followed by cloud exfiltration' },
        { label: 'AFFECTED ASSET', value: 'CORP-EXCHANGE-ONLINE (Critical Infrastructure)' },
        { label: 'TIMELINE HIGHLIGHTS', value: '06:14 UTC Initial spray → 06:48 UTC Forwarding rule created' },
        { label: 'NEXT STEPS', value: 'Revoke Marcus Vance tokens, review outbound mega.nz flows' }
      ],
      metrics: [
        { key: 'FOUNDATION MODEL', val: 'google/flan-t5-small (Local)' },
        { key: 'INFERENCE SPEED', val: '420 ms / incident' },
        { key: 'EXTERNAL API CALLS', val: '0 (Air-gapped compatible)' }
      ]
    }
  },
  {
    id: '07',
    code: '07',
    name: 'REVIEW',
    subtitle: 'HUMAN DECISION & AUDIT TRAIL',
    shortDesc: '1-click analyst review confirms, modifies, or rejects the AI incident brief.',
    metric: 'HUMAN DECISION',
    tag: 'EMPIRICAL TRIAGE',
    expanded: {
      title: 'HUMAN-IN-THE-LOOP TRIAGE AUDIT',
      lead: 'Empirical analyst decisions are logged with microsecond precision, proving real Mean-Time-To-Triage (MTTT) reduction.',
      evidencePoints: [
        { label: 'CONFIRM DECISION', value: 'Endorses AI brief and triggers SOAR quarantine playbook' },
        { label: 'REJECT DECISION', value: 'Marks false positive and updates ML negative training split' },
        { label: 'ANALYST OBSERVATIONS', value: 'Free-text forensic notes persisted to immutable audit store' },
        { label: 'MEASURED EXPERIMENT', value: 'Empirical trial recorded: baseline reduced with AI assistance' }
      ],
      metrics: [
        { key: 'EMPIRICAL REDUCTION', val: 'Tracked via session logs' },
        { key: 'DECISION LATENCY', val: '< 25 seconds' },
        { key: 'AUDIT COMPLIANCE', val: '100% decision persistence' }
      ]
    }
  }
];

export function ArchitectureSection({ stages = DEFAULT_STAGES, telemetry = {} }) {
  // Active inspected stage (defaults to '03' CORRELATE)
  const [activeStageId, setActiveStageId] = useState('03');

  const stageList = stages && stages.length > 0 ? stages : DEFAULT_STAGES;
  const currentStage = stageList.find(s => s.id === activeStageId) || stageList[2] || stageList[0];

  const controlPlaneNodes = [
    { label: 'Risk Scoring Engine', detail: '0–100 Normalized Index' },
    { label: 'Asset Criticality', detail: 'Business Impact Multiplier (+45)' },
    { label: 'MITRE ATT&CK', detail: 'Evidence-Grounded Attribution' },
    { label: 'ML Relevance', detail: 'Random Forest Noise Damping' },
    { label: 'Human Review', detail: 'Analyst Audit & Feedback Loop' }
  ];

  const dataPlaneNodes = [
    { label: 'Alert Streams', detail: '3,000 Heterogeneous Events' },
    { label: 'Host Entities', detail: 'DC, Server, Workstation FQDN' },
    { label: 'User Identities', detail: 'AD sAMAccount & Cloud GUID' },
    { label: 'Observable IPs', detail: 'Adversary C2 & Internal Subnets' },
    { label: 'Indicators & Hashes', detail: 'Forensic Artifact Registry' },
    { label: 'UTC Timestamps', detail: '60-min Sliding Time Window' }
  ];

  return (
    <section id="architecture" className="sentinel-architecture-section">
      <div className="daq-container">
        {/* Section Header */}
        <div className="section-head-block">
          <div className="section-meta-label mono">
            <span className="code-num">01</span>
            <span className="code-sep">/</span>
            <span>ALERT INTELLIGENCE ARCHITECTURE</span>
          </div>

          <div className="section-headline-group flex-between">
            <h2 className="section-massive-title">
              THE INCIDENT CORE.
            </h2>
            <p className="section-lead-text">
              Observable graph correlation, explainable asset prioritization, and local FLAN-T5 AI handover for human review.
            </p>
          </div>

          {/* High-Level Pipeline Sequence Breadcrumb */}
          <div className="pipeline-sequence-track mono">
            <span className="pipe-node">ALERTS</span>
            <span className="pipe-arrow">↓</span>
            <span className="pipe-node">NORMALIZE</span>
            <span className="pipe-arrow">↓</span>
            <span className="pipe-node highlight">CORRELATE</span>
            <span className="pipe-arrow">↓</span>
            <span className="pipe-node highlight">PRIORITIZE</span>
            <span className="pipe-arrow">↓</span>
            <span className="pipe-node">MITRE</span>
            <span className="pipe-arrow">↓</span>
            <span className="pipe-node">AI</span>
            <span className="pipe-arrow">↓</span>
            <span className="pipe-node">HUMAN REVIEW</span>
          </div>
        </div>

        {/* 7-STAGE ARCHITECTURAL SEQUENCE BLUEPRINT */}
        <div className="architecture-stages-blueprint">
          {/* Top Instruction Banner */}
          <div className="blueprint-instruction-strip flex-between mono">
            <span className="instruction-text">SELECT A STAGE TO INSPECT ARCHITECTURAL SPECIFICATION ↓</span>
            <span className="instruction-status">7-STAGE STREAM CORRELATION PIPELINE</span>
          </div>

          {/* 7 Horizontal Architectural Sequence Stages */}
          <div className="stages-sequence-grid" role="tablist" aria-label="Incident Architecture Stages">
            {stages.map((stage) => {
              const isSelected = stage.id === activeStageId;
              return (
                <button
                  key={stage.id}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`stage-panel-${stage.id}`}
                  className={`stage-sequence-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActiveStageId(stage.id)}
                >
                  <div className="stage-top-meta mono flex-between">
                    <span className="stage-index">{stage.code}</span>
                    <span className="stage-tag-mini">{stage.tag}</span>
                  </div>

                  <div className="stage-core-name">{stage.name}</div>

                  <p className="stage-compact-desc">{stage.shortDesc}</p>

                  <div className="stage-bottom-metric mono">
                    {stage.metric}
                  </div>

                  <div className="stage-focus-indicator" />
                </button>
              );
            })}
          </div>

          {/* PROGRESSIVE DISCLOSURE INSPECTION VIEW */}
          {currentStage && (
            <div 
              id={`stage-panel-${currentStage.id}`}
              role="tabpanel"
              className="stage-expanded-panel"
            >
              {/* Header inside Panel */}
              <div className="panel-header-strip flex-between mono">
                <div className="panel-stage-badge">
                  <span>STAGE {currentStage.code}</span>
                  <span className="badge-sep">/</span>
                  <span className="badge-name">{currentStage.name}</span>
                </div>
                <div className="panel-tag-meta">
                  ARCHITECTURAL INSPECTION LAYER
                </div>
              </div>

              {/* Grid: Left Technical Narrative + Right Evidence Proofpoints */}
              <div className="panel-content-grid">
                <div className="panel-narrative-column">
                  <div className="panel-sub-label mono">{currentStage.subtitle}</div>
                  <h3 className="panel-focus-title">{currentStage.expanded?.title}</h3>
                  <p className="panel-lead-paragraph">{currentStage.expanded?.lead}</p>

                  {/* Operational Metrics Strip */}
                  <div className="panel-metrics-row mono">
                    {currentStage.expanded?.metrics?.map((m, idx) => (
                      <div key={idx} className="metric-chip">
                        <span className="chip-key">{m.key}</span>
                        <span className="chip-val">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel-evidence-column mono">
                  <div className="evidence-header-label">OBSERVABLE EVIDENCE &amp; SPECIFICATION</div>
                  <div className="evidence-rows-list">
                    {currentStage.expanded?.evidencePoints?.map((ev, idx) => (
                      <div key={idx} className="evidence-spec-row">
                        <span className="ev-label">{ev.label}</span>
                        <span className="ev-value">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtle Instruction Footer */}
          <div className="architecture-footer-strip flex-between mono">
            <span className="tap-instruction-caption">SELECT A STAGE TO INSPECT SPECIFICATION</span>
            <span className="telemetry-compact-line">
              STATUS: {telemetry.pipelineStatus} • {telemetry.totalAlerts?.toLocaleString()} ALERTS • {telemetry.clusters} CLUSTERS
            </span>
          </div>
        </div>

        {/* =========================================================================
            CONTROL PLANE / DATA PLANE ARCHITECTURAL VISUALIZATION
            ========================================================================= */}
        <div className="control-data-plane-block">
          <div className="plane-section-header flex-between mono">
            <div className="plane-title align-center">
              <span className="plane-dot" />
              <span>SYSTEM TOPOLOGY &bull; CONTROL PLANE / DATA PLANE</span>
            </div>
            <span className="plane-meta">DETERMINISTIC FLOW SEPARATION</span>
          </div>

          <div className="plane-diagram-grid">
            {/* Control Plane (Policy, Prioritization, Governance) */}
            <div className="plane-tier control-tier">
              <div className="tier-badge-strip mono">
                <span className="tier-tag">CONTROL PLANE</span>
                <span className="tier-desc">POLICY &bull; PRIORITIZATION &bull; GOVERNANCE</span>
              </div>
              <div className="nodes-flex-row">
                {controlPlaneNodes.map((node, i) => (
                  <div key={i} className="plane-node-card">
                    <div className="node-title mono">{node.label}</div>
                    <div className="node-detail">{node.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting Technical Flow Lines */}
            <div className="plane-interconnect-layer mono" aria-hidden="true">
              <div className="flow-line-track">
                <svg className="flow-svg" viewBox="0 0 1000 48" preserveAspectRatio="none">
                  <line x1="100" y1="4" x2="100" y2="44" stroke="#D8D5CE" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="300" y1="4" x2="300" y2="44" stroke="#2563EB" strokeWidth="1.2" strokeDasharray="3 3" />
                  <line x1="500" y1="4" x2="500" y2="44" stroke="#D8D5CE" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="700" y1="4" x2="700" y2="44" stroke="#2563EB" strokeWidth="1.2" strokeDasharray="3 3" />
                  <line x1="900" y1="4" x2="900" y2="44" stroke="#D8D5CE" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>
              <div className="interconnect-label flex-between">
                <span>↑ CORRELATION &amp; RISK FEEDBACK LOOP</span>
                <span>OBSERVABLE ENTITY EXTRACTION ↓</span>
              </div>
            </div>

            {/* Data Plane (High-Throughput Raw Telemetry & Entities) */}
            <div className="plane-tier data-tier">
              <div className="tier-badge-strip mono">
                <span className="tier-tag">DATA PLANE</span>
                <span className="tier-desc">HIGH-THROUGHPUT STREAMS &bull; RAW OBSERVABLES</span>
              </div>
              <div className="nodes-flex-row">
                {dataPlaneNodes.map((node, i) => (
                  <div key={i} className="plane-node-card">
                    <div className="node-title mono">{node.label}</div>
                    <div className="node-detail">{node.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sentinel-architecture-section {
          --color-base: var(--surface-1);
          --color-primary: var(--text-primary);
          --color-secondary: var(--text-muted);
          --color-accent: var(--accent-copper);
          --color-line: var(--border);
          padding-top: clamp(90px, 10vw, 150px);
          padding-bottom: clamp(90px, 10vw, 150px);
          background-color: transparent;
          border-bottom: 1px solid var(--border);
        }

        .section-head-block {
          margin-bottom: clamp(2.5rem, 4vw, 4rem);
        }

        .section-meta-label {
          font-size: 0.70rem;
          font-weight: 700;
          color: var(--color-secondary);
          letter-spacing: 0.12em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.85rem;
        }

        .code-num {
          color: var(--color-accent);
        }

        .code-sep {
          color: var(--color-line);
        }

        .section-headline-group {
          align-items: flex-end;
          gap: 3rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .section-massive-title {
          font-size: clamp(40px, 5.5vw, 84px);
          font-weight: 550;
          line-height: 0.95;
          letter-spacing: -0.03em;
          color: var(--color-primary);
          text-transform: uppercase;
        }

        .section-lead-text {
          font-size: clamp(0.95rem, 1.2vw, 1.15rem);
          color: var(--color-secondary);
          max-width: 480px;
          line-height: 1.5;
        }

        /* Pipeline Track */
        .pipeline-sequence-track {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.68rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-line);
          flex-wrap: wrap;
        }

        .pipe-node {
          color: var(--color-secondary);
          font-weight: 500;
        }

        .pipe-node.highlight {
          color: var(--color-accent);
          font-weight: 700;
        }

        .pipe-arrow {
          color: var(--color-line);
        }

        /* Blueprint Container */
        .architecture-stages-blueprint {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--color-line);
          background-color: var(--surface-1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 4rem;
        }

        .blueprint-instruction-strip {
          padding: 0.85rem 1.75rem;
          font-size: 0.65rem;
          color: var(--color-secondary);
          border-bottom: 1px solid var(--color-line);
          letter-spacing: 0.08em;
          background-color: var(--surface-2);
        }

        .instruction-text {
          color: var(--color-accent);
          font-weight: 600;
        }

        /* 7-Stage Horizontal Sequence */
        .stages-sequence-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }

        .stage-sequence-item {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.6rem 1.15rem 1.4rem 1.15rem;
          background-color: var(--surface-2);
          border: none;
          border-right: 1px solid var(--color-line);
          text-align: left;
          cursor: pointer;
          min-height: 240px;
          position: relative;
          transition: background-color var(--transition-fast) ease;
          outline: none;
        }

        .stage-sequence-item:last-child {
          border-right: none;
        }

        .stage-sequence-item:hover,
        .stage-sequence-item.selected {
          background-color: var(--surface-3);
        }

        .stage-top-meta {
          font-size: 0.65rem;
          margin-bottom: 1.25rem;
        }

        .stage-index {
          font-weight: 700;
          color: var(--color-accent);
          font-size: 0.75rem;
        }

        .stage-tag-mini {
          font-size: 0.52rem;
          color: var(--color-secondary);
        }

        .stage-core-name {
          font-family: inherit;
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--color-primary);
          margin-bottom: 0.6rem;
        }

        .stage-compact-desc {
          font-family: inherit;
          font-size: 0.74rem;
          color: var(--color-secondary);
          line-height: 1.45;
          margin-bottom: 1.25rem;
          flex: 1;
        }

        .stage-bottom-metric {
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--color-primary);
          padding-top: 0.75rem;
          border-top: 1px solid var(--color-line);
        }

        .stage-focus-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background-color: transparent;
          transition: background-color var(--transition-fast) ease;
        }

        .stage-sequence-item.selected .stage-focus-indicator {
          background-color: var(--color-accent);
        }

        /* Expanded Inspection Panel */
        .stage-expanded-panel {
          border-top: 1px solid var(--color-line);
          background-color: var(--surface-2);
          padding: 2.25rem clamp(1.25rem, 3vw, 2.5rem);
          animation: panelFade 180ms ease;
        }

        @keyframes panelFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .panel-header-strip {
          font-size: 0.68rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-line);
          margin-bottom: 2rem;
        }

        .panel-stage-badge {
          color: var(--color-accent);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .badge-sep {
          color: var(--color-line);
        }

        .badge-name {
          color: var(--color-primary);
        }

        .panel-tag-meta {
          color: var(--color-secondary);
        }

        .panel-content-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: clamp(2rem, 5vw, 5rem);
        }

        .panel-sub-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.10em;
          color: var(--color-secondary);
          margin-bottom: 0.4rem;
        }

        .panel-focus-title {
          font-size: clamp(22px, 2.5vw, 36px);
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--color-primary);
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .panel-lead-paragraph {
          font-size: 0.95rem;
          color: var(--color-secondary);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .panel-metrics-row {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .metric-chip {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.65rem 1rem;
          background-color: var(--surface-1);
          border: 1px solid var(--color-line);
          border-radius: var(--radius-sm);
        }

        .chip-key {
          font-size: 0.58rem;
          color: var(--color-secondary);
          letter-spacing: 0.06em;
        }

        .chip-val {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .panel-evidence-column {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .evidence-header-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--color-secondary);
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--color-line);
        }

        .evidence-rows-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .evidence-spec-row {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.65rem 0.85rem;
          background-color: var(--surface-1);
          border: 1px solid var(--color-line);
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
        }

        .ev-label {
          color: var(--color-accent);
          font-weight: 700;
          font-size: 0.62rem;
        }

        .ev-value {
          color: var(--color-primary);
          font-weight: 500;
          line-height: 1.4;
        }

        .architecture-footer-strip {
          padding: 0.85rem 1.75rem;
          font-size: 0.64rem;
          color: var(--color-secondary);
          border-top: 1px solid var(--color-line);
          background-color: var(--surface-2);
        }

        .tap-instruction-caption {
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--color-primary);
        }

        /* =========================================================================
           CONTROL PLANE / DATA PLANE STYLES
           ========================================================================= */
        .control-data-plane-block {
          border: 1px solid var(--color-line);
          background: var(--surface-1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .plane-section-header {
          padding: 0.85rem 1.75rem;
          font-size: 0.65rem;
          color: var(--color-secondary);
          border-bottom: 1px solid var(--color-line);
          background-color: var(--surface-2);
        }

        .plane-title {
          gap: 0.5rem;
          color: var(--color-primary);
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .plane-dot {
          width: 6px;
          height: 6px;
          background: var(--accent-copper);
          border-radius: 50%;
        }

        .plane-diagram-grid {
          padding: 2.25rem clamp(1.25rem, 3vw, 2.5rem);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .plane-tier {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tier-badge-strip {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-size: 0.64rem;
        }

        .tier-tag {
          font-weight: 700;
          color: var(--accent-copper);
          background: rgba(169, 107, 66, 0.15);
          border: 1px solid rgba(169, 107, 66, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.15rem 0.55rem;
        }

        .tier-desc {
          color: var(--color-secondary);
        }

        .nodes-flex-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .plane-node-card {
          background: var(--surface-2);
          border: 1px solid var(--color-line);
          border-radius: var(--radius-sm);
          padding: 0.95rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .node-title {
          font-size: 0.70rem;
          font-weight: 700;
          color: var(--color-primary);
        }

        .node-detail {
          font-size: 0.68rem;
          color: var(--color-secondary);
          line-height: 1.4;
        }

        /* Interconnect Layer */
        .plane-interconnect-layer {
          padding: 0.5rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .flow-line-track {
          width: 100%;
          height: 36px;
        }

        .flow-svg {
          width: 100%;
          height: 100%;
        }

        .interconnect-label {
          font-size: 0.58rem;
          color: var(--color-secondary);
          letter-spacing: 0.08em;
          padding: 0 1rem;
        }

        @media (max-width: 1200px) {
          .stages-sequence-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .panel-content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stages-sequence-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

export default ArchitectureSection;
