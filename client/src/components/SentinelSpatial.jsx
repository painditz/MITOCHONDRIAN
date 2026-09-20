// client/src/components/SentinelSpatial.jsx
// SentinelOps AI - Spatial 3D Digital Water Environment & Enterprise Glass Product Experience
// Flow:
// 1. HERO + 3D DIGITAL WATER ENVIRONMENT (Continuous waves, pointer disturbance, expanding click shockwaves)
// 2. DEDICATED INCIDENT INTELLIGENCE MAP (Isolated 3D Viewport with OrbitControls)
// 3. KPI / LIVE METRICS WITH WAVEFORMS
// 4. 00 / TRIAGE IMPACT (Mode 1 Simulation vs Mode 2 Empirical Stopwatch Trials)
// 5. 01 / ALERT INTELLIGENCE ARCHITECTURE (7 Interactive Stages, Control/Data Planes)
// 6. 02 / RISK INTELLIGENCE (5 explainable components + INC-102 vs INC-114 Case Study)
// 7. 03 / DETERMINISTIC CORRELATION (3,000 Alerts -> Observable Pivots -> 15 Clusters + Top Assets)
// 8. 04 / MITRE ATT&CK (Evidence-grounded technique attribution)
// 9. 05 / AI SHIFT HANDOVER & HUMAN REVIEW & SYSTEM HEALTH
// 10. FORENSIC INCIDENT INSPECTION MODAL (Opens on incident click)

import React, { useState, useMemo, useCallback } from 'react';
import { DigitalWater } from './spatial/DigitalWater';
import { IncidentMapPanel } from './spatial/IncidentMapPanel';
import { TriageImpactSection } from './TriageImpactSection';
import { ArchitectureSection } from './ArchitectureSection';
import { RiskIntelligenceSection } from './RiskIntelligenceSection';
import { CorrelationSection } from './CorrelationSection';
import { MitreSection } from './MitreSection';
import { AiShiftHandoverSection } from './AiShiftHandoverSection';
import { IncidentInspectionModal } from './IncidentInspectionModal';
import { ARCHITECTURE_DATA } from '../data/mockData';
import './SentinelSpatial.css';

const FALLBACK_INCIDENTS = [
  {
    incident_id: 'INC-101',
    id: 'INC-101',
    priority: 'P1',
    risk_score: 92.1,
    riskScore: 92.1,
    alert_count: 14,
    signalsCount: 14,
    asset_name: 'CORP-ENDPOINT-DC',
    asset: 'CORP-ENDPOINT-DC',
    asset_criticality: 'CRITICAL',
    criticality: 'CRITICAL ASSET',
    user: 'svc-replication',
    observable: '10.0.1.5',
    duration: '45.2 min',
    mitre_techniques: [{ id: 'T1078.002', name: 'Domain Accounts' }],
    ai_brief: 'Directory replication service anomaly originating from non-DC internal host targeting Directory Services replication RPC endpoint.',
  },
  {
    incident_id: 'INC-102',
    id: 'INC-102',
    priority: 'P1',
    risk_score: 96.4,
    riskScore: 96.4,
    alert_count: 10,
    signalsCount: 10,
    asset_name: 'CORP-EXCHANGE-ONLINE',
    asset: 'CORP-EXCHANGE-ONLINE',
    asset_criticality: 'CRITICAL',
    criticality: 'CRITICAL ASSET',
    user: 'marcus.vance.cfo',
    observable: '185.220.101.5',
    duration: '60.4 min',
    mitre_techniques: [
      { id: 'T1114.002', name: 'Email Collection: Remote Email Forwarding' },
      { id: 'T1567.002', name: 'Cloud Storage Exfiltration' },
    ],
    ai_brief: 'Executive account compromise followed by cloud data exfiltration involving Exchange Online asset. Automated mailbox forwarding rule to mega.nz cloud storage endpoint.',
  },
  {
    incident_id: 'INC-103',
    id: 'INC-103',
    priority: 'P2',
    risk_score: 78.2,
    riskScore: 78.2,
    alert_count: 18,
    signalsCount: 18,
    asset_name: 'CORP-AD',
    asset: 'CORP-AD',
    asset_criticality: 'HIGH',
    criticality: 'HIGH ASSET',
    user: 'sarah.connor',
    observable: '194.26.29.112',
    duration: '32.1 min',
    mitre_techniques: [{ id: 'T1566.001', name: 'Spearphishing Attachment' }],
    ai_brief: 'Malicious macro document execution spawned encoded PowerShell session attempting outbound connection to suspicious IP.',
  },
  {
    incident_id: 'INC-105',
    id: 'INC-105',
    priority: 'P2',
    risk_score: 71.3,
    riskScore: 71.3,
    alert_count: 24,
    signalsCount: 24,
    asset_name: 'CORP-FILE-SERVER',
    asset: 'CORP-FILE-SERVER',
    asset_criticality: 'HIGH',
    criticality: 'HIGH ASSET',
    user: 'db_service_acct',
    observable: '198.51.100.77',
    duration: '42.0 min',
    mitre_techniques: [{ id: 'T1190', name: 'Exploit Public-Facing Application' }],
    ai_brief: 'Anomalous SQL queries with union-select patterns targeting customer records table.',
  },
  {
    incident_id: 'INC-106',
    id: 'INC-106',
    priority: 'P3',
    risk_score: 54.7,
    riskScore: 54.7,
    alert_count: 7,
    signalsCount: 7,
    asset_name: 'CORP-WORKSTATION',
    asset: 'CORP-WORKSTATION',
    asset_criticality: 'MEDIUM',
    criticality: 'MEDIUM ASSET',
    user: 'dev_intern',
    observable: '10.0.4.12',
    duration: '15.4 min',
    mitre_techniques: [{ id: 'T1059.001', name: 'PowerShell Execution' }],
    ai_brief: 'Local script execution in developer workspace. Bounded risk score due to non-critical asset.',
  },
  {
    incident_id: 'INC-108',
    id: 'INC-108',
    priority: 'P1',
    risk_score: 88.5,
    riskScore: 88.5,
    alert_count: 21,
    signalsCount: 21,
    asset_name: 'CORP-IDENTITY',
    asset: 'CORP-IDENTITY',
    asset_criticality: 'CRITICAL',
    criticality: 'CRITICAL ASSET',
    user: 'admin_ad',
    observable: '10.0.1.1',
    duration: '50.1 min',
    mitre_techniques: [{ id: 'T1003.001', name: 'LSASS Memory Dumping' }],
    ai_brief: 'Credential dumping detected on Azure AD synchronization server targeting Kerberos TGT tickets.',
  },
  {
    incident_id: 'INC-111',
    id: 'INC-111',
    priority: 'P3',
    risk_score: 46.8,
    riskScore: 46.8,
    alert_count: 8,
    signalsCount: 8,
    asset_name: 'CORP-ENDPOINT',
    asset: 'CORP-ENDPOINT',
    asset_criticality: 'MEDIUM',
    criticality: 'MEDIUM ASSET',
    user: 'guest_user',
    observable: '10.0.5.88',
    duration: '18.0 min',
    mitre_techniques: [{ id: 'T1078', name: 'Valid Accounts' }],
    ai_brief: 'Guest account failed logon storm followed by successful connection from guest Wi-Fi subnet.',
  },
  {
    incident_id: 'INC-114',
    id: 'INC-114',
    priority: 'P4',
    risk_score: 15.0,
    riskScore: 15.0,
    alert_count: 1452,
    signalsCount: 1452,
    asset_name: 'CORP-TELEMETRY',
    asset: 'CORP-TELEMETRY',
    asset_criticality: 'MEDIUM',
    criticality: 'MEDIUM ASSET',
    user: 'sys_logger',
    observable: '10.0.9.9',
    duration: '120.0 min',
    mitre_techniques: [],
    ai_brief: 'High-volume diagnostic log storm. Capped volume factor correctly keeps priority at P4 Low.',
  },
];

const WORKFLOW_STAGES = [
  { step: '01', name: 'INGEST', desc: '3,000 alerts from multiple sources' },
  { step: '02', name: 'NORMALIZE', desc: 'Standardize & enrich telemetry' },
  { step: '03', name: 'CORRELATE', desc: 'Group related alerts into incidents' },
  { step: '04', name: 'PRIORITIZE', desc: 'Risk scoring & asset criticality' },
  { step: '05', name: 'MAP', desc: 'MITRE ATT&CK techniques' },
  { step: '06', name: 'SUMMARIZE', desc: 'AI-generated shift handover' },
  { step: '07', name: 'REVIEW', desc: 'Analyst validation & investigation' },
];

function normalizeIncident(raw) {
  const id = raw?.incident_id || raw?.id || raw?.incidentId;
  if (!id) return null;

  const risk = Number(raw?.risk_score ?? raw?.risk ?? raw?.score ?? raw?.riskScore ?? 0);
  let priority = raw?.priority || (risk >= 80 ? 'P1' : risk >= 60 ? 'P2' : risk >= 40 ? 'P3' : 'P4');
  if (typeof priority === 'string') {
    if (priority.startsWith('P1')) priority = 'P1';
    else if (priority.startsWith('P2')) priority = 'P2';
    else if (priority.startsWith('P3')) priority = 'P3';
    else if (priority.startsWith('P4')) priority = 'P4';
  }

  const aiBriefText =
    typeof raw?.shift_brief?.what_happened === 'string'
      ? raw?.shift_brief?.what_happened
      : typeof raw?.ai_brief === 'string'
      ? raw?.ai_brief
      : raw?.ai_brief?.brief || raw?.aiBrief;

  const mitreList =
    raw?.mitre_techniques ||
    raw?.mitre_mappings ||
    raw?.shift_brief?.mitre_techniques?.map((m) => ({
      id: m.technique_id,
      name: m.technique_name,
    })) ||
    raw?.mitre ||
    [];

  return {
    ...raw,
    incident_id: id,
    id,
    risk_score: Number.isFinite(risk) ? risk : 0,
    riskScore: Number.isFinite(risk) ? risk : 0,
    priority,
    alert_count: Number(raw?.alert_count ?? raw?.alertCount ?? raw?.signalsCount ?? 1),
    signalsCount: Number(raw?.alert_count ?? raw?.alertCount ?? raw?.signalsCount ?? 1),
    asset_name: raw?.asset_name || raw?.hostname || raw?.asset || 'UNKNOWN ASSET',
    asset: raw?.asset_name || raw?.hostname || raw?.asset || 'UNKNOWN ASSET',
    asset_criticality: raw?.asset_criticality || raw?.criticality || 'HIGH',
    criticality: raw?.asset_criticality || raw?.criticality || 'HIGH',
    user: raw?.user || 'marcus.vance.cfo',
    observable: raw?.observable || '185.220.101.5',
    ai_brief: aiBriefText,
    aiBrief: aiBriefText,
    mitre_techniques: mitreList,
    mitreTechniques: mitreList,
  };
}

export default function SentinelSpatial({
  incidents: suppliedIncidents,
  onIncidentSelect,
  metrics: suppliedMetrics,
}) {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [inspectionModalIncident, setInspectionModalIncident] = useState(null);

  const incidents = useMemo(() => {
    const source =
      Array.isArray(suppliedIncidents) && suppliedIncidents.length
        ? suppliedIncidents
        : FALLBACK_INCIDENTS;

    return source.map(normalizeIncident).filter(Boolean);
  }, [suppliedIncidents]);

  // Production Telemetry Stats
  const stats = useMemo(() => {
    const total = incidents.length;
    const p1 = incidents.filter((i) => i.priority === 'P1').length;
    const p2 = incidents.filter((i) => i.priority === 'P2').length;
    const p3 = incidents.filter((i) => i.priority === 'P3').length;
    const p4 = incidents.filter((i) => i.priority === 'P4').length;
    const alertSum = incidents.reduce((sum, i) => sum + (i.alert_count || 0), 0);

    return {
      alerts: suppliedMetrics?.total_alerts || suppliedMetrics?.totalAlerts || alertSum || 3000,
      incidents: suppliedMetrics?.grouped_incidents || suppliedMetrics?.clusters || total || 15,
      p1: suppliedMetrics?.critical_incidents || suppliedMetrics?.p1Critical || p1 || 7,
      p2: suppliedMetrics?.high_incidents || suppliedMetrics?.highCount || p2 || 2,
      p3: suppliedMetrics?.medium_incidents || suppliedMetrics?.mediumCount || p3 || 1,
      p4: suppliedMetrics?.low_incidents || suppliedMetrics?.lowCount || p4 || 5,
    };
  }, [incidents, suppliedMetrics]);

  const handleSelect = useCallback(
    (incident) => {
      setSelectedIncident(incident);
      if (incident) {
        setInspectionModalIncident(incident);
      }
      onIncidentSelect?.(incident);
    },
    [onIncidentSelect]
  );

  return (
    <div className="sentinel-spatial-master">
      {/* 1. REAL 3D DIGITAL WATER ENVIRONMENT (Fixed in background across whole scroll flow) */}
      <DigitalWater incidents={incidents} />

      {/* 2. SCROLLABLE PRODUCT NARRATIVE OVERLAY */}
      <div className="sentinel-product-scroll-track">
        
        {/* HERO VIEWPORT STAGE (100vh Atmospheric Anchor) */}
        <div className="sentinel-hero-viewport">
          
          {/* Left Hero Content */}
          <div className="sentinel-hero-block">
            <div className="sentinel-hero-eyebrow mono">
              SENTINELOPS AI &bull; SECURITY OPERATIONS
            </div>

            <h1 className="sentinel-hero-title">
              3,000 ALERTS.
              <br />
              <span className="hero-subline">ONE ANALYST.</span>
            </h1>

            <p className="sentinel-hero-lead">
              Turn alert chaos into incident intelligence.
            </p>

            <div className="sentinel-triage-badge mono">
              <span className="triage-live-dot" />
              <span>TRIAGE CORE ACTIVE</span>
            </div>
          </div>

          {/* Left Metrics Panel with Waveforms */}
          <div className="sentinel-glass-metrics">
            <div className="metric-col">
              <span className="metric-tag mono">ALERTS</span>
              <b className="metric-number">{stats.alerts.toLocaleString()}</b>
              <div className="mini-waveform cyan" />
            </div>

            <div className="metric-sep" />

            <div className="metric-col">
              <span className="metric-tag mono">INCIDENTS</span>
              <b className="metric-number">{stats.incidents}</b>
              <div className="mini-waveform white" />
            </div>

            <div className="metric-sep" />

            <div className="metric-col">
              <span className="metric-tag mono p1-tag">P1</span>
              <b className="metric-number p1-val">{stats.p1}</b>
              <div className="mini-waveform red" />
            </div>

            <div className="metric-sep" />

            <div className="metric-col">
              <span className="metric-tag mono p2-tag">P2</span>
              <b className="metric-number p2-val">{stats.p2}</b>
              <div className="mini-waveform amber" />
            </div>

            <div className="metric-sep" />

            <div className="metric-col">
              <span className="metric-tag mono p3-tag">P3</span>
              <b className="metric-number p3-val">{stats.p3}</b>
              <div className="mini-waveform cyan" />
            </div>

            <div className="metric-sep" />

            <div className="metric-col">
              <span className="metric-tag mono p4-tag">P4</span>
              <b className="metric-number p4-val">{stats.p4}</b>
              <div className="mini-waveform slate" />
            </div>
          </div>

          {/* Right Dedicated Incident Intelligence Map Panel (Isolated 3D Viewport) */}
          <IncidentMapPanel
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelect}
          />

          {/* Bottom 7-Stage Workflow Dock */}
          <div className="sentinel-workflow-dock">
            <div className="workflow-modules-track">
              {WORKFLOW_STAGES.map((stage, idx) => (
                <React.Fragment key={stage.step}>
                  <div className="workflow-stage-card">
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
              ))}
            </div>
          </div>

          {/* Scroll Prompt Arrow */}
          <div className="scroll-down-hint mono align-center">
            <span>SCROLL TO EXPLORE ARCHITECTURE &bull; RISK &bull; MITRE &bull; AI</span>
            <span className="scroll-arrow-anim">&darr;</span>
          </div>
        </div>

        {/* 00 / TRIAGE IMPACT SECTION */}
        <TriageImpactSection telemetry={stats} />

        {/* 01 / ALERT INTELLIGENCE ARCHITECTURE SECTION */}
        <ArchitectureSection
          stages={ARCHITECTURE_DATA.stages}
          telemetry={stats}
        />

        {/* 02 / RISK INTELLIGENCE SECTION */}
        <RiskIntelligenceSection />

        {/* 03 / CORRELATION & TOP ASSETS SECTION */}
        <CorrelationSection
          incidents={incidents}
          onSelectIncident={handleSelect}
        />

        {/* 04 / MITRE ATT&CK SECTION */}
        <MitreSection />

        {/* 05 / AI SHIFT HANDOVER & HUMAN REVIEW SECTION */}
        <AiShiftHandoverSection
          selectedIncident={selectedIncident || incidents[1] || incidents[0]}
          onOpenFullDetail={(inc) => setInspectionModalIncident(inc)}
        />

      </div>

      {/* FORENSIC INCIDENT INSPECTION MODAL */}
      {inspectionModalIncident && (
        <IncidentInspectionModal
          incident={inspectionModalIncident}
          onClose={() => setInspectionModalIncident(null)}
          onReviewAction={(id, action, notes) => {
            console.log(`[SentinelOps] Analyst reviewed ${id}: ${action} (${notes})`);
          }}
        />
      )}
    </div>
  );
}
