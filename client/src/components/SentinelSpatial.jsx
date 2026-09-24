// client/src/components/SentinelSpatial.jsx
// SentinelOps AI - Spatial 3D Digital Water Environment & Enterprise Glass Product Experience
// Flow:
// 1. HERO + 3D DIGITAL WATER ENVIRONMENT
// 2. HERO COPY + COMPACT KPI RAIL (In natural document flow, zero overlap)
// 3. DEDICATED 3D INCIDENT INTELLIGENCE MAP
// 4. 7-STAGE CONNECTED WORKFLOW DOCK
// 5. SCROLLABLE PRODUCT NARRATIVE (Revealed with IntersectionObserver)
import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { DigitalWater } from './spatial/DigitalWater';
import { IncidentMapPanel } from './spatial/IncidentMapPanel';
import { TriageImpactSection } from './TriageImpactSection';
import { ArchitectureSection } from './ArchitectureSection';
import { RiskIntelligenceSection } from './RiskIntelligenceSection';
import { CorrelationSection } from './CorrelationSection';
import { MitreSection } from './MitreSection';
import { AiShiftHandoverSection } from './AiShiftHandoverSection';
import { AnimatedNumber } from './common/AnimatedNumber';
import './SentinelSpatial.css';

const WORKFLOW_STAGES = [
  {
    step: '01',
    name: 'INGEST',
    desc: '3,000 alerts from multiple sources',
    detail: 'High-throughput stream engine absorbs 3,000 alerts across Endpoint, Identity, Cloud, and Perimeter telemetry without loss.',
    metric: '3,000 Alerts Ingested',
  },
  {
    step: '02',
    name: 'NORMALIZE',
    desc: 'Standardize & enrich telemetry',
    detail: 'Extracts entities into canonical schemas, resolving IP origins, device hostnames, user credentials, and criticality tags.',
    metric: '100% Entity Normalization',
  },
  {
    step: '03',
    name: 'CORRELATE',
    desc: 'Group related alerts into incidents',
    detail: 'Spatial and graph clustering links raw alerts by shared IP, hostname, credential, and 60-minute sliding time windows.',
    metric: '99.5% Volume Reduction',
  },
  {
    step: '04',
    name: 'PRIORITIZE',
    desc: 'Risk scoring & asset criticality',
    detail: 'Calculates dynamic composite 0–100 risk scores factoring in asset criticality tier (Tier 1 +45), severity, and alert density.',
    metric: 'Deterministic P1–P4 Tiers',
  },
  {
    step: '05',
    name: 'MAP',
    desc: 'MITRE ATT&CK techniques',
    detail: 'Maps verified indicators to enterprise ATT&CK techniques with grounded evidence and tactical kill-chain attribution.',
    metric: '14 Core Techniques',
  },
  {
    step: '06',
    name: 'SUMMARIZE',
    desc: 'AI-generated shift handover',
    detail: 'Local FLAN-T5 model generates concise executive briefings, attack vectors, affected assets, and actionable investigation leads.',
    metric: 'Zero Cloud Data Exfiltration',
  },
  {
    step: '07',
    name: 'REVIEW',
    desc: 'Analyst validation & investigation',
    detail: 'Real-time human validation console with persistent MTTT telemetry tracking, analyst feedback loops, and decision auditing.',
    metric: '1.2m Mean Time to Triage',
  },
];

function normalizeIncident(raw) {
  if (!raw) return null;
  const id = raw.incident_id || raw.id || raw.incidentId;
  if (!id) return null;

  const risk = Number(raw.risk_score ?? raw.risk ?? raw.score ?? raw.riskScore ?? 0);
  let priority = raw.priority || (risk >= 80 ? 'P1' : risk >= 60 ? 'P2' : risk >= 40 ? 'P3' : 'P4');
  if (typeof priority === 'string') {
    if (priority.startsWith('P1')) priority = 'P1';
    else if (priority.startsWith('P2')) priority = 'P2';
    else if (priority.startsWith('P3')) priority = 'P3';
    else if (priority.startsWith('P4')) priority = 'P4';
  }

  const aiBriefText =
    typeof raw.shift_brief?.what_happened === 'string'
      ? raw.shift_brief.what_happened
      : typeof raw.ai_brief === 'string'
      ? raw.ai_brief
      : raw.ai_brief?.brief || raw.aiBrief || '';

  const mitreList =
    raw.mitre_mappings ||
    raw.mitre_techniques ||
    raw.shift_brief?.mitre_techniques?.map((m) => ({
      technique_id: m.technique_id || m.id,
      technique_name: m.technique_name || m.name,
      tactic: m.tactic,
      evidence_found: m.evidence_found,
    })) ||
    [];

  const asset = raw.hostname || raw.asset_name || raw.asset || 'CORP-HOST';
  const criticality = raw.asset_criticality || raw.criticality || 'MEDIUM';
  const alertCount = Number(raw.alert_count ?? raw.alertCount ?? raw.signalsCount ?? 1);

  return {
    ...raw,
    incident_id: id,
    id,
    risk_score: Number.isFinite(risk) ? risk : 0,
    riskScore: Number.isFinite(risk) ? risk : 0,
    priority,
    alert_count: alertCount,
    signalsCount: alertCount,
    asset_name: asset,
    hostname: raw.hostname || asset,
    asset,
    asset_criticality: criticality,
    criticality,
    user: raw.user || 'SYSTEM / Automated Service',
    source_ip: raw.source_ip || '',
    destination_ip: raw.destination_ip || '',
    observable: raw.source_ip || raw.destination_ip || raw.observable || 'N/A',
    duration_minutes: raw.duration_minutes || (raw.duration ? parseFloat(raw.duration) : 0),
    correlation_reason: raw.correlation_reason || '',
    priority_reason: raw.priority_reason || '',
    investigation_status: raw.investigation_status || 'Pending Analyst Review',
    ai_brief: aiBriefText,
    aiBrief: aiBriefText,
    mitre_mappings: mitreList,
    mitre_techniques: mitreList,
    mitreTechniques: mitreList,
  };
}

export default function SentinelSpatial({
  incidents: suppliedIncidents = [],
  selectedIncident,
  onIncidentSelect,
  metrics: suppliedMetrics,
  loading = false,
  error = null,
  onRetry,
}) {
  const [activeWorkflowStage, setActiveWorkflowStage] = useState(null);
  const scrollTrackRef = useRef(null);

  const incidents = useMemo(() => {
    if (!Array.isArray(suppliedIncidents)) return [];
    return suppliedIncidents.map(normalizeIncident).filter(Boolean);
  }, [suppliedIncidents]);

  // Telemetry stats calculated directly from live authoritative incidents and API overview
  const stats = useMemo(() => {
    const total = incidents.length;
    const p1 = incidents.filter((i) => (i.priority || '').startsWith('P1')).length;
    const p2 = incidents.filter((i) => (i.priority || '').startsWith('P2')).length;
    const p3 = incidents.filter((i) => (i.priority || '').startsWith('P3')).length;
    const p4 = incidents.filter((i) => (i.priority || '').startsWith('P4')).length;
    const alertSum = incidents.reduce((sum, i) => sum + (i.alert_count || 0), 0);

    return {
      alerts: suppliedMetrics?.total_alerts ?? suppliedMetrics?.totalAlerts ?? (alertSum > 0 ? alertSum : 0),
      incidents: suppliedMetrics?.grouped_incidents ?? suppliedMetrics?.clusters ?? total,
      p1: suppliedMetrics?.critical_incidents ?? suppliedMetrics?.p1Critical ?? p1,
      p2: suppliedMetrics?.high_incidents ?? suppliedMetrics?.highCount ?? p2,
      p3: suppliedMetrics?.medium_incidents ?? suppliedMetrics?.mediumCount ?? p3,
      p4: suppliedMetrics?.low_incidents ?? suppliedMetrics?.lowCount ?? p4,
    };
  }, [incidents, suppliedMetrics]);

  const handleSelect = useCallback(
    (incident) => {
      onIncidentSelect?.(incident);
    },
    [onIncidentSelect]
  );

  // Scroll reveal observer: smoothly reveals sections once scrolled into view
  useEffect(() => {
    const root = scrollTrackRef.current;
    if (!root) return;

    const sections = root.querySelectorAll('.scroll-reveal-section');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root,
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="sentinel-spatial-master">
      {/* SCROLLABLE PRODUCT NARRATIVE OVERLAY */}
      <div ref={scrollTrackRef} className="sentinel-product-scroll-track">
        
        {/* HERO VIEWPORT STAGE: Two-column layout with generous vertical space */}
        <div className="sentinel-hero-viewport">
          {/* Subtle dark atmospheric vignette behind left copy to eliminate contrast competition */}
          <div className="hero-atmosphere-backdrop" aria-hidden="true" />

          {/* Left Hero Column: Eye, Title, Lead, Triage, and KPI Strip in Normal Flow */}
          <div className="sentinel-hero-block hero-copy">
            <div className="sentinel-hero-eyebrow mono anim-enter-eyebrow">
              SENTINELOPS AI &bull; SECURITY OPERATIONS
            </div>

            <h1 className="sentinel-hero-title anim-enter-title">
              3,000 ALERTS.
              <br />
              <span className="hero-subline">
                <span className="hero-accent-one">ONE</span> ANALYST.
              </span>
            </h1>

            <p className="sentinel-hero-lead anim-enter-lead">
              Turn alert chaos into incident intelligence.
            </p>

            <div className="sentinel-triage-badge mono anim-enter-status">
              <span className="triage-live-dot" />
              <span>TRIAGE CORE ACTIVE</span>
            </div>

            {/* Compact Information Rail (KPI Strip) — Normal Document Flow, Zero Overlap */}
            <div
              className="sentinel-glass-metrics hero-metrics anim-enter-kpi"
              aria-label="Security Telemetry Key Indicators"
            >
              <div className="metric-col">
                <span className="metric-tag mono">ALERTS</span>
                <b className="metric-number mono">
                  <AnimatedNumber value={stats.alerts} />
                </b>
                <div className="mini-waveform cyan" />
              </div>

              <div className="metric-sep" />

              <div className="metric-col">
                <span className="metric-tag mono">INCIDENTS</span>
                <b className="metric-number mono">
                  <AnimatedNumber value={stats.incidents} />
                </b>
                <div className="mini-waveform white" />
              </div>

              <div className="metric-sep" />

              <div className="metric-col">
                <span className="metric-tag mono p1-tag">P1</span>
                <b className="metric-number p1-val mono">
                  <AnimatedNumber value={stats.p1} />
                </b>
                <div className="mini-waveform red" />
              </div>

              <div className="metric-sep" />

              <div className="metric-col">
                <span className="metric-tag mono p2-tag">P2</span>
                <b className="metric-number p2-val mono">
                  <AnimatedNumber value={stats.p2} />
                </b>
                <div className="mini-waveform amber" />
              </div>

              <div className="metric-sep" />

              <div className="metric-col">
                <span className="metric-tag mono p3-tag">P3</span>
                <b className="metric-number p3-val mono">
                  <AnimatedNumber value={stats.p3} />
                </b>
                <div className="mini-waveform cyan" />
              </div>

              <div className="metric-sep" />

              <div className="metric-col">
                <span className="metric-tag mono p4-tag">P4</span>
                <b className="metric-number p4-val mono">
                  <AnimatedNumber value={stats.p4} />
                </b>
                <div className="mini-waveform slate" />
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated 3D Incident Intelligence Map Window */}
          <div className="sentinel-hero-map-wrapper anim-enter-map">
            <IncidentMapPanel
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={handleSelect}
              loading={loading}
              error={error}
              onRetry={onRetry}
            />
          </div>

          {/* Bottom 7-Stage Connected Workflow Dock */}
          <div className="sentinel-workflow-dock anim-enter-workflow">
            <div className="workflow-modules-track">
              {WORKFLOW_STAGES.map((stage, idx) => {
                const isActive = activeWorkflowStage === stage.step;
                return (
                  <React.Fragment key={stage.step}>
                    <div
                      className={`workflow-stage-card ${isActive ? 'active' : ''}`}
                      onClick={() =>
                        setActiveWorkflowStage(isActive ? null : stage.step)
                      }
                      role="button"
                      tabIndex={0}
                      title={`Stage ${stage.step}: ${stage.name}`}
                    >
                      <div className="stage-top align-center mono">
                        <span className="stage-num">{stage.step}</span>
                        <span className="stage-name">{stage.name}</span>
                      </div>
                      <div className="stage-desc">{stage.desc}</div>
                    </div>

                    {idx < WORKFLOW_STAGES.length - 1 && (
                      <div className="workflow-connector-arrow" aria-hidden="true">
                        &rarr;
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Smooth Expanded Explanation Drawer on Click */}
            {activeWorkflowStage && (() => {
              const activeStageData = WORKFLOW_STAGES.find((s) => s.step === activeWorkflowStage);
              if (!activeStageData) return null;
              return (
                <div className="workflow-expanded-drawer">
                  <div className="drawer-header align-center mono">
                    <div className="drawer-title-group align-center">
                      <span className="drawer-step">{activeStageData.step}</span>
                      <span className="drawer-name">{activeStageData.name} ARCHITECTURAL STAGE</span>
                    </div>
                    <div className="drawer-right align-center">
                      <span className="drawer-metric">{activeStageData.metric}</span>
                      <button
                        type="button"
                        className="drawer-close-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveWorkflowStage(null);
                        }}
                        aria-label="Close stage explanation"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                  <p className="drawer-detail-text">{activeStageData.detail}</p>
                </div>
              );
            })()}
          </div>

          {/* Subtle Scroll Hint */}
          <div className="scroll-down-hint mono align-center">
            <span>SCROLL TO EXPLORE ARCHITECTURE &bull; RISK &bull; MITRE &bull; AI</span>
            <span className="scroll-arrow-anim">&darr;</span>
          </div>
        </div>

        {/* 00 / TRIAGE IMPACT SECTION */}
        <div className="scroll-reveal-section">
          <TriageImpactSection telemetry={stats} />
        </div>

        {/* 01 / ALERT INTELLIGENCE ARCHITECTURE SECTION */}
        <div className="scroll-reveal-section">
          <ArchitectureSection
            telemetry={stats}
          />
        </div>

        {/* 02 / RISK INTELLIGENCE SECTION */}
        <div className="scroll-reveal-section">
          <RiskIntelligenceSection incidents={incidents} />
        </div>

        {/* 03 / CORRELATION & TOP ASSETS SECTION */}
        <div className="scroll-reveal-section">
          <CorrelationSection
            incidents={incidents}
            onSelectIncident={handleSelect}
          />
        </div>

        {/* 04 / MITRE ATT&CK SECTION */}
        <div className="scroll-reveal-section">
          <MitreSection />
        </div>

        {/* 05 / AI SHIFT HANDOVER & HUMAN REVIEW SECTION */}
        <div className="scroll-reveal-section">
          <AiShiftHandoverSection
            selectedIncident={selectedIncident || (incidents.length > 0 ? incidents[0] : null)}
            onOpenFullDetail={(inc) => handleSelect(inc)}
          />
        </div>

      </div>
    </div>
  );
}

