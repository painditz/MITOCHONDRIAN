// client/src/pages/SocOverviewPage.jsx
// DAQ-inspired Architectural Incident Intelligence Workspace
// - Large editorial typography (INCIDENT INTELLIGENCE.)
// - Interactive 7-stage engineered pipeline architecture (01 INGEST → 07 REVIEW)
// - Spatial incident intelligence network with clean relationships and progressive disclosure
// - Editorial investigation inspection drawer for INC-102
import React, { useState } from 'react';

export function SocOverviewPage({ data }) {
  const { telemetry, pipelineStages, incidents } = data;

  // Selected Stage for interactive inspection
  const [selectedStageId, setSelectedStageId] = useState('03');
  // Selected Incident for inspection pane
  const [selectedIncidentId, setSelectedIncidentId] = useState('INC-102');
  // Review note state
  const [reviewNote, setReviewNote] = useState('');
  const [decisionFeedback, setDecisionFeedback] = useState('');

  const activeStage = pipelineStages.find(s => s.id === selectedStageId) || pipelineStages[2];
  const activeIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

  const handleSelectIncident = (id) => {
    setSelectedIncidentId(id);
  };

  return (
    <div className="daq-overview-container">
      {/* =========================================================================
          SECTION 01: EDITORIAL HEADER & HIGH CONTRAST HIERARCHY
          ========================================================================= */}
      <section className="daq-editorial-hero">
        <div className="editorial-meta-tag mono">
          <span className="tag-number">01</span>
          <span className="tag-sep">/</span>
          <span>OPERATIONS</span>
        </div>

        <div className="hero-content-grid">
          <div className="hero-title-group">
            <h1 className="hero-main-heading">
              INCIDENT<br />INTELLIGENCE.
            </h1>
            <p className="hero-subtext">
              Autonomous alert correlation, asset-weighted prioritization, and evidence-grounded AI shift handovers.
            </p>
          </div>

          <div className="hero-stats-column mono">
            <div className="stat-unit">
              <div className="stat-big-val">{telemetry.totalAlerts.toLocaleString()}</div>
              <div className="stat-label">RAW TELEMETRY ALERTS</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-unit">
              <div className="stat-big-val text-accent">{telemetry.clusters}</div>
              <div className="stat-label">INCIDENT / TRIAGE CLUSTERS</div>
            </div>
            <div className="stat-divider" />
            <div className="stat-unit">
              <div className="stat-big-val text-red">{telemetry.p1Critical}</div>
              <div className="stat-label">P1 CRITICAL TARGETS</div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 02: ARCHITECTURAL 7-STAGE PIPELINE (ENGINEERED SYSTEM DIAGRAM)
          ========================================================================= */}
      <section className="daq-pipeline-section">
        <div className="section-label-row flex-between">
          <div className="section-title-wrap mono">
            <span className="section-code">02</span>
            <span className="section-sep">/</span>
            <span className="section-name">SYSTEM ARCHITECTURE // CONTINUOUS TRIAGE PIPELINE</span>
          </div>
          <span className="section-hint mono">SELECT A STAGE TO INSPECT ARCHITECTURE →</span>
        </div>

        {/* 7-Stage Horizontal System Blueprint */}
        <div className="pipeline-blueprint-track">
          {pipelineStages.map((stage) => {
            const isSelected = stage.id === selectedStageId;
            return (
              <div
                key={stage.id}
                className={`pipeline-stage-column ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedStageId(stage.id)}
              >
                <div className="stage-top mono">
                  <span className="stage-num">{stage.code}</span>
                  <span className="stage-tag">{stage.tag}</span>
                </div>
                <div className="stage-name-heading">{stage.name}</div>
                <div className="stage-metric-val mono">{stage.metric}</div>
                <div className="stage-bottom-indicator" />
              </div>
            );
          })}
        </div>

        {/* Expanded Stage Blueprint Inspection Banner */}
        <div className="stage-blueprint-expanded">
          <div className="stage-detail-left">
            <div className="stage-detail-pre mono">
              STAGE {activeStage.code} ARCHITECTURAL SPECIFICATION
            </div>
            <div className="stage-detail-title">{activeStage.subtitle}</div>
            <p className="stage-detail-desc">{activeStage.description}</p>
          </div>

          <div className="stage-detail-specs mono">
            {activeStage.specDetails.map((spec, i) => (
              <div key={i} className="spec-row flex-between">
                <span className="spec-name">{spec.label}</span>
                <span className="spec-data">{spec.val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 03 & 04: SPATIAL INCIDENT NETWORK + EDITORIAL INSPECTOR
          ========================================================================= */}
      <section className="daq-workspace-split">
        {/* Left Stage: Architectural Spatial Incident Visualization */}
        <div className="spatial-network-zone">
          <div className="zone-header-strip flex-between mono">
            <div className="zone-title">
              <span>03 / SPATIAL INCIDENT TOPOLOGY</span>
            </div>
            <div className="zone-meta">
              {incidents.length} PRIORITY CLUSTERS • CLICK NODE TO INVESTIGATE
            </div>
          </div>

          {/* Spatial Canvas Container */}
          <div className="spatial-canvas-blueprint">
            {/* Structural Architectural Grid */}
            <div className="blueprint-grid-lines" />

            {/* Relationship Lines between Nodes (SVG) */}
            <svg className="blueprint-svg-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="48" y1="44" x2="20" y2="28" stroke="rgba(10, 13, 18, 0.12)" strokeWidth="0.3" strokeDasharray="1,1" />
              <line x1="48" y1="44" x2="80" y2="30" stroke="rgba(10, 13, 18, 0.12)" strokeWidth="0.3" strokeDasharray="1,1" />
              <line x1="48" y1="44" x2="18" y2="70" stroke="rgba(10, 13, 18, 0.12)" strokeWidth="0.3" strokeDasharray="1,1" />
              <line x1="48" y1="44" x2="82" y2="72" stroke="rgba(10, 13, 18, 0.12)" strokeWidth="0.3" strokeDasharray="1,1" />
              <line x1="48" y1="44" x2="50" y2="80" stroke="rgba(10, 13, 18, 0.12)" strokeWidth="0.3" strokeDasharray="1,1" />
            </svg>

            {/* Spatial Incident Objects */}
            {incidents.map((inc) => {
              const isSelected = inc.id === selectedIncidentId;
              const isP1 = inc.priority === 'P1';
              const isP2 = inc.priority === 'P2';
              const prioColor = isP1 ? 'var(--color-p1)' : (isP2 ? 'var(--color-p2)' : 'var(--color-p3)');

              return (
                <div
                  key={inc.id}
                  className={`spatial-incident-object ${isSelected ? 'selected' : ''}`}
                  style={{
                    left: `${inc.coords.x}%`,
                    top: `${inc.coords.y}%`
                  }}
                  onClick={() => handleSelectIncident(inc.id)}
                >
                  <div 
                    className="spatial-node-core"
                    style={{ borderColor: isSelected ? prioColor : 'rgba(10, 13, 18, 0.20)' }}
                  >
                    <span className="node-id-label mono">{inc.id}</span>
                  </div>

                  <div className="spatial-node-caption mono">
                    <span 
                      className="caption-prio font-bold"
                      style={{ color: prioColor }}
                    >
                      {inc.priority}
                    </span>
                    <span className="caption-risk">{inc.riskScore}</span>
                  </div>
                </div>
              );
            })}

            {/* Legend Footer */}
            <div className="spatial-legend-bar mono flex-between">
              <div className="legend-items-left align-center">
                <span className="legend-item align-center">
                  <span className="legend-circle" style={{ borderColor: 'var(--color-p1)' }} />
                  <span>P1 Critical</span>
                </span>
                <span className="legend-item align-center">
                  <span className="legend-circle" style={{ borderColor: 'var(--color-p2)' }} />
                  <span>P2 High</span>
                </span>
                <span className="legend-item align-center">
                  <span className="legend-circle" style={{ borderColor: 'var(--color-p3)' }} />
                  <span>P3 Medium</span>
                </span>
              </div>
              <div className="legend-items-right">
                HAIRLINE OBSERVABLE RELATIONSHIPS
              </div>
            </div>
          </div>
        </div>

        {/* Right Stage: Editorial Investigation Inspector */}
        <aside className="editorial-inspector-pane">
          <div className="inspector-head-strip flex-between mono">
            <span className="inspector-pre-tag">04 / INVESTIGATION</span>
            <span className="inspector-live-tag">REAL-TIME FORENSICS</span>
          </div>

          <div className="inspector-body">
            {/* Title & Priority Header */}
            <div className="inspector-hero-block">
              <div className="flex-between align-center mb-1">
                <div className="inspector-id mono">{activeIncident.id}</div>
                <div 
                  className="inspector-prio-badge mono"
                  style={{ 
                    color: activeIncident.priority === 'P1' ? 'var(--color-p1)' : 'var(--color-p2)',
                    backgroundColor: activeIncident.priority === 'P1' ? 'var(--p1-bg)' : 'var(--p2-bg)'
                  }}
                >
                  {activeIncident.priority} • {activeIncident.prioTag}
                </div>
              </div>

              <div className="inspector-risk-score-row">
                <div className="risk-num mono">{activeIncident.riskScore}</div>
                <div className="risk-unit-label mono">
                  RISK INDEX / 100
                </div>
              </div>

              <div className="inspector-asset-block">
                <div className="asset-label mono">AFFECTED ASSET</div>
                <div className="asset-name mono">{activeIncident.asset}</div>
                <div className="asset-badge mono">{activeIncident.criticality}</div>
              </div>
            </div>

            <div className="inspector-thin-rule" />

            {/* Risk Factors Decomposition */}
            <div className="inspector-section-block">
              <div className="section-label mono">EXPLAINABLE RISK FACTORS</div>
              <div className="risk-factors-table mono">
                {activeIncident.riskFactors.map((rf, idx) => (
                  <div key={idx} className="rf-table-row flex-between">
                    <span className="rf-name">{rf.name}</span>
                    <span className="rf-value font-bold" style={{ color: rf.color }}>{rf.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inspector-thin-rule" />

            {/* Observables & Evidence */}
            <div className="inspector-section-block">
              <div className="section-label mono">OBSERVABLE EVIDENCE</div>
              <div className="evidence-table mono">
                <div className="ev-table-row flex-between">
                  <span className="ev-label">Identity Pivot</span>
                  <span className="ev-data">{activeIncident.user}</span>
                </div>
                <div className="ev-table-row flex-between">
                  <span className="ev-label">External C2 / Observable</span>
                  <span className="ev-data text-accent font-bold">{activeIncident.observable}</span>
                </div>
                <div className="ev-table-row flex-between">
                  <span className="ev-label">Correlated Signals</span>
                  <span className="ev-data">{activeIncident.signalsCount} alerts grouped</span>
                </div>
                <div className="ev-table-row flex-between">
                  <span className="ev-label">Kill-Chain Duration</span>
                  <span className="ev-data">{activeIncident.duration}</span>
                </div>
              </div>
            </div>

            <div className="inspector-thin-rule" />

            {/* MITRE ATT&CK Mapping */}
            <div className="inspector-section-block">
              <div className="section-label mono">MITRE ATT&amp;CK TECHNIQUES</div>
              <div className="mitre-cards-column">
                {activeIncident.mitreTechniques.map((m, idx) => (
                  <div key={idx} className="mitre-item-card">
                    <span className="mitre-id mono">{m.id}</span>
                    <span className="mitre-title">{m.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inspector-thin-rule" />

            {/* AI Shift Handover Brief */}
            <div className="inspector-section-block">
              <div className="section-label flex-between mono">
                <span>AI SHIFT HANDOVER</span>
                <span className="ai-model-tag">LOCAL FLAN-T5</span>
              </div>
              <p className="ai-brief-paragraph">
                {activeIncident.aiBrief}
              </p>
            </div>

            <div className="inspector-thin-rule" />

            {/* Human Review & Decision */}
            <div className="inspector-section-block">
              <div className="section-label mono">HUMAN DECISION &amp; AUDIT</div>
              <div className="decision-buttons-grid">
                <button 
                  className="decision-btn btn-confirm mono"
                  onClick={() => { setDecisionFeedback('Decision: Incident Brief Confirmed'); setTimeout(() => setDecisionFeedback(''), 3000); }}
                >
                  [ CONFIRM ]
                </button>
                <button 
                  className="decision-btn btn-reject mono"
                  onClick={() => { setDecisionFeedback('Decision: Incident Brief Rejected'); setTimeout(() => setDecisionFeedback(''), 3000); }}
                >
                  [ REJECT ]
                </button>
              </div>

              <div className="analyst-note-box">
                <input
                  type="text"
                  placeholder="Analyst forensic audit note..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="analyst-input mono"
                />
              </div>

              {decisionFeedback && (
                <div className="decision-status-pill mono text-accent font-bold">
                  ✓ {decisionFeedback}
                </div>
              )}
            </div>
          </div>
        </aside>
      </section>

      <style>{`
        .daq-overview-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100%;
          background: #F8F9FA;
          color: #0A0D12;
          user-select: none;
        }

        /* SECTION 01: EDITORIAL HERO */
        .daq-editorial-hero {
          padding: 2.25rem 2.5rem 2rem 2.5rem;
          border-bottom: 1px solid rgba(10, 13, 18, 0.08);
          background: #FFFFFF;
        }

        .editorial-meta-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: #6C757D;
          letter-spacing: 0.12em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.75rem;
        }

        .tag-number {
          color: #0052FF;
        }

        .tag-sep {
          color: rgba(10, 13, 18, 0.20);
        }

        .hero-content-grid {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 3rem;
        }

        .hero-title-group {
          max-width: 680px;
        }

        .hero-main-heading {
          font-size: 3.2rem;
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 0.96;
          color: #0A0D12;
          text-transform: uppercase;
        }

        .hero-subtext {
          font-size: 0.95rem;
          color: #495057;
          margin-top: 1.25rem;
          line-height: 1.5;
          max-width: 540px;
        }

        .hero-stats-column {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }

        .stat-unit {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-big-val {
          font-size: 1.85rem;
          font-weight: 700;
          line-height: 1;
          color: #0A0D12;
        }

        .stat-label {
          font-size: 0.58rem;
          letter-spacing: 0.10em;
          color: #6C757D;
        }

        .stat-divider {
          width: 1px;
          height: 38px;
          background: rgba(10, 13, 18, 0.10);
        }

        .text-accent {
          color: #0052FF;
        }

        .text-red {
          color: #DC2626;
        }

        /* SECTION 02: ARCHITECTURAL PIPELINE */
        .daq-pipeline-section {
          padding: 2rem 2.5rem;
          background: #FFFFFF;
          border-bottom: 1px solid rgba(10, 13, 18, 0.08);
        }

        .section-label-row {
          margin-bottom: 1rem;
        }

        .section-title-wrap {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .section-code {
          color: #0052FF;
        }

        .section-sep {
          color: rgba(10, 13, 18, 0.20);
        }

        .section-name {
          color: #0A0D12;
        }

        .section-hint {
          font-size: 0.62rem;
          color: #868E96;
          letter-spacing: 0.06em;
        }

        /* 7-Stage Horizontal Pipeline Track */
        .pipeline-blueprint-track {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .pipeline-stage-column {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 1.1rem 0.95rem;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.08);
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
          position: relative;
        }

        .pipeline-stage-column:hover {
          background: #FFFFFF;
          border-color: rgba(10, 13, 18, 0.20);
          transform: translateY(-1px);
        }

        .pipeline-stage-column.selected {
          background: #FFFFFF;
          border-color: #0052FF;
          box-shadow: 0 4px 16px rgba(0, 82, 255, 0.08);
        }

        .stage-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.58rem;
        }

        .stage-num {
          font-weight: 700;
          color: #0052FF;
        }

        .stage-tag {
          font-size: 0.52rem;
          color: #868E96;
        }

        .stage-name-heading {
          font-size: 0.88rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #0A0D12;
        }

        .stage-metric-val {
          font-size: 0.66rem;
          font-weight: 600;
          color: #495057;
        }

        .stage-bottom-indicator {
          height: 2px;
          background: transparent;
          margin-top: 0.4rem;
          border-radius: 1px;
          transition: background 140ms ease;
        }

        .pipeline-stage-column.selected .stage-bottom-indicator {
          background: #0052FF;
        }

        /* Expanded Stage Specification Details */
        .stage-blueprint-expanded {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 2.5rem;
          padding: 1.4rem 1.6rem;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.08);
          border-radius: 4px;
        }

        .stage-detail-pre {
          font-size: 0.60rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #0052FF;
          margin-bottom: 0.25rem;
        }

        .stage-detail-title {
          font-size: 1.15rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #0A0D12;
          margin-bottom: 0.5rem;
        }

        .stage-detail-desc {
          font-size: 0.82rem;
          color: #495057;
          line-height: 1.5;
        }

        .stage-detail-specs {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          justify-content: center;
        }

        .spec-row {
          padding: 0.35rem 0.5rem;
          background: #FFFFFF;
          border: 1px solid rgba(10, 13, 18, 0.06);
          border-radius: 3px;
          font-size: 0.70rem;
        }

        .spec-name {
          color: #6C757D;
          font-size: 0.64rem;
        }

        .spec-data {
          color: #0A0D12;
          font-weight: 600;
        }

        /* SECTION 03 & 04: WORKSPACE SPLIT */
        .daq-workspace-split {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          min-height: 600px;
          background: #F8F9FA;
        }

        /* LEFT: SPATIAL NETWORK ZONE */
        .spatial-network-zone {
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(10, 13, 18, 0.08);
          background: #FFFFFF;
          position: relative;
        }

        .zone-header-strip {
          padding: 0.9rem 1.75rem;
          border-bottom: 1px solid rgba(10, 13, 18, 0.08);
          font-size: 0.68rem;
          font-weight: 700;
        }

        .zone-title {
          color: #0A0D12;
          letter-spacing: 0.06em;
        }

        .zone-meta {
          color: #868E96;
        }

        .spatial-canvas-blueprint {
          flex: 1;
          position: relative;
          min-height: 520px;
          overflow: hidden;
          background: #F8F9FA;
        }

        /* Subtle Technical Blueprint Grid */
        .blueprint-grid-lines {
          position: absolute;
          inset: 0;
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(10, 13, 18, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(10, 13, 18, 0.035) 1px, transparent 1px);
          pointer-events: none;
        }

        .blueprint-svg-lines {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        /* Spatial Nodes */
        .spatial-incident-object {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 120ms ease;
        }

        .spatial-incident-object:hover {
          transform: translate(-50%, -50%) scale(1.06);
        }

        .spatial-node-core {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid rgba(10, 13, 18, 0.20);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(10, 13, 18, 0.06);
          transition: all 120ms ease;
        }

        .spatial-incident-object.selected .spatial-node-core {
          box-shadow: 0 8px 24px rgba(0, 82, 255, 0.16);
        }

        .node-id-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #0A0D12;
        }

        .spatial-node-caption {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.4rem;
          font-size: 0.62rem;
          background: #FFFFFF;
          border: 1px solid rgba(10, 13, 18, 0.08);
          padding: 0.1rem 0.45rem;
          border-radius: 3px;
        }

        .caption-risk {
          color: #495057;
        }

        .spatial-legend-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 32px;
          padding: 0 1.5rem;
          background: #FFFFFF;
          border-top: 1px solid rgba(10, 13, 18, 0.08);
          font-size: 0.62rem;
          color: #6C757D;
        }

        .legend-items-left {
          gap: 1.25rem;
        }

        .legend-item {
          gap: 0.4rem;
        }

        .legend-circle {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid;
        }

        /* RIGHT: EDITORIAL INSPECTOR PANE */
        .editorial-inspector-pane {
          width: 380px;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
        }

        .inspector-head-strip {
          padding: 0.9rem 1.5rem;
          border-bottom: 1px solid rgba(10, 13, 18, 0.08);
          font-size: 0.68rem;
          font-weight: 700;
        }

        .inspector-pre-tag {
          color: #0052FF;
        }

        .inspector-live-tag {
          color: #868E96;
          font-size: 0.60rem;
        }

        .inspector-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .inspector-hero-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .inspector-id {
          font-size: 1.4rem;
          font-weight: 800;
          color: #0A0D12;
          letter-spacing: -0.02em;
        }

        .inspector-prio-badge {
          font-size: 0.64rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
        }

        .inspector-risk-score-row {
          display: flex;
          align-items: baseline;
          gap: 0.45rem;
        }

        .risk-num {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1;
          color: #0A0D12;
        }

        .risk-unit-label {
          font-size: 0.68rem;
          font-weight: 600;
          color: #6C757D;
        }

        .inspector-asset-block {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          margin-top: 0.25rem;
        }

        .asset-label {
          font-size: 0.58rem;
          color: #868E96;
          letter-spacing: 0.08em;
        }

        .asset-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #0A0D12;
        }

        .asset-badge {
          font-size: 0.60rem;
          font-weight: 700;
          color: #D97706;
        }

        .inspector-thin-rule {
          height: 1px;
          background: rgba(10, 13, 18, 0.08);
        }

        .inspector-section-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .section-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: #6C757D;
          letter-spacing: 0.10em;
        }

        .risk-factors-table, .evidence-table {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .rf-table-row, .ev-table-row {
          padding: 0.35rem 0.5rem;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.06);
          border-radius: 3px;
          font-size: 0.70rem;
        }

        .rf-name, .ev-label {
          color: #495057;
        }

        .ev-data {
          color: #0A0D12;
        }

        .mitre-cards-column {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .mitre-item-card {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.45rem 0.65rem;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.08);
          border-radius: 3px;
        }

        .mitre-id {
          font-size: 0.68rem;
          font-weight: 700;
          color: #0052FF;
        }

        .mitre-title {
          font-size: 0.72rem;
          font-weight: 500;
          color: #0A0D12;
        }

        .ai-model-tag {
          font-size: 0.58rem;
          color: #0052FF;
        }

        .ai-brief-paragraph {
          font-size: 0.76rem;
          line-height: 1.5;
          color: #495057;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.08);
          padding: 0.75rem;
          border-radius: 3px;
        }

        .decision-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
        }

        .decision-btn {
          padding: 0.45rem 0.5rem;
          font-size: 0.68rem;
          font-weight: 700;
          border-radius: 3px;
          cursor: pointer;
          transition: all 120ms ease;
        }

        .btn-confirm {
          background: rgba(22, 163, 74, 0.08);
          border: 1px solid rgba(22, 163, 74, 0.30);
          color: #16A34A;
        }

        .btn-confirm:hover {
          background: rgba(22, 163, 74, 0.16);
        }

        .btn-reject {
          background: rgba(220, 38, 38, 0.08);
          border: 1px solid rgba(220, 38, 38, 0.30);
          color: #DC2626;
        }

        .btn-reject:hover {
          background: rgba(220, 38, 38, 0.16);
        }

        .analyst-input {
          width: 100%;
          padding: 0.4rem 0.6rem;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.10);
          border-radius: 3px;
          font-size: 0.68rem;
          color: #0A0D12;
          outline: none;
        }

        .analyst-input:focus {
          border-color: #0052FF;
          background: #FFFFFF;
        }

        .decision-status-pill {
          font-size: 0.66rem;
          padding: 0.3rem 0.5rem;
          background: rgba(0, 82, 255, 0.06);
          border: 1px solid rgba(0, 82, 255, 0.20);
          border-radius: 3px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

export default SocOverviewPage;
