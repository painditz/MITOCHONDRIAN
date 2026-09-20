// client/src/components/ArchitectureSection.jsx
// 01 / Alert Intelligence Architecture (The Incident Core)
// Features:
// 1. Pipeline Sequence: ALERTS → NORMALIZE → CORRELATE → PRIORITIZE → MITRE → AI → HUMAN REVIEW
// 2. Seven Interactive Stages with Progressive Disclosure Inspection
// 3. Control Plane / Data Plane Technical Architecture Visualization
import React, { useState } from 'react';

export function ArchitectureSection({ stages = [], telemetry = {} }) {
  // Active inspected stage (defaults to '03' CORRELATE)
  const [activeStageId, setActiveStageId] = useState('03');

  const currentStage = stages.find(s => s.id === activeStageId) || stages[2] || stages[0];

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
          padding-top: clamp(90px, 10vw, 150px);
          padding-bottom: clamp(90px, 10vw, 150px);
          background-color: transparent;
          border-bottom: 1px solid var(--color-line);
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
          background-color: #FFFFFF;
          margin-bottom: 4rem;
        }

        .blueprint-instruction-strip {
          padding: 0.85rem 1.75rem;
          font-size: 0.65rem;
          color: var(--color-secondary);
          border-bottom: 1px solid var(--color-line);
          letter-spacing: 0.08em;
          background-color: #FDFCFA;
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
          background-color: #FFFFFF;
          border: none;
          border-right: 1px solid var(--color-line);
          text-align: left;
          cursor: pointer;
          min-height: 240px;
          position: relative;
          transition: background-color 160ms ease;
          outline: none;
        }

        .stage-sequence-item:last-child {
          border-right: none;
        }

        .stage-sequence-item:hover,
        .stage-sequence-item.selected {
          background-color: #F9F8F5;
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
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--color-primary);
          margin-bottom: 0.6rem;
        }

        .stage-compact-desc {
          font-family: var(--font-body);
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
          transition: background-color 160ms ease;
        }

        .stage-sequence-item.selected .stage-focus-indicator {
          background-color: var(--color-accent);
        }

        /* Expanded Inspection Panel */
        .stage-expanded-panel {
          border-top: 1px solid var(--color-line);
          background-color: #FFFFFF;
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
          background-color: var(--color-base);
          border: 1px solid var(--color-line);
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
          background-color: var(--color-base);
          border: 1px solid var(--color-line);
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
          background-color: #FDFCFA;
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
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
        }

        .plane-section-header {
          padding: 0.85rem 1.75rem;
          font-size: 0.65rem;
          color: var(--color-secondary);
          border-bottom: 1px solid var(--color-line);
          background-color: #FDFCFA;
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
          background: #2563EB;
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
          color: var(--color-primary);
          background: #E5E1D8;
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
          background: var(--color-base);
          border: 1px solid var(--color-line);
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
