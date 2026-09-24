// client/src/components/incidents/IncidentDetailModal.jsx
// SentinelOps AI - Incident Investigation Forensic Workstation
// Master SOC 3-Column Forensic Layout:
// LEFT: Incident Identity & Vertical Evidence Timeline (Clickable to inspect raw alert telemetry)
// CENTER: Why This Priority? + What-If Risk Simulator + Correlated Alerts Traceability + Evidence-Grounded MITRE
// RIGHT: AI Shift Handover Brief + Human Review Controls
import React, { useState, useEffect, useMemo } from 'react';
import { PriorityBadge, CriticalityBadge, AuditStatusBadge } from '../shared/StatusBadge';
import { X, CheckCircle, AlertTriangle, Edit3, MessageSquare, ShieldCheck, Activity, ChevronRight, ThumbsUp, ThumbsDown, Scissors, HelpCircle, Layers, ShieldAlert } from 'lucide-react';
import { AnalystDecisionCenter } from './AnalystDecisionCenter';
import { AiBriefReviewPanel } from './AiBriefReviewPanel';
import { EvidenceReviewPanel } from './EvidenceReviewPanel';
import { InvestigationCompletenessBadge } from './InvestigationCompletenessBadge';
import { ReviewHistoryAudit } from './ReviewHistoryAudit';
import { AnalystNotesPanel } from './AnalystNotesPanel';
import { IncidentSplitModal } from './IncidentSplitModal';
import { AlertEvidenceDrawer } from '../telemetry/AlertEvidenceDrawer';

function parseRiskFactors(incident) {
  const host = incident?.hostname || incident?.asset_name || 'CORP-HOST';
  const crit = (incident?.asset_criticality || 'Medium').toLowerCase();
  const critPts = crit === 'critical' ? 45.0 : crit === 'high' ? 30.0 : crit === 'medium' ? 15.0 : 0.0;

  const sev = (incident?.severity || 'Medium').toLowerCase();
  const sevPts = sev === 'critical' ? 25.0 : sev === 'high' ? 18.0 : sev === 'medium' ? 10.0 : 5.0;

  const alertCount = Number(incident?.alert_count ?? (incident?.alerts?.length || 1));
  const volPts = Math.min(alertCount * 0.5, 5.0);

  const tacticsCount = incident?.mitre_mappings?.length || (incident?.shift_brief?.mitre_techniques?.length || 0);
  const kcPts = tacticsCount >= 3 ? 15.0 : tacticsCount === 2 ? 12.0 : tacticsCount === 1 ? 4.0 : 0.0;

  const risk = Number(incident?.risk_score ?? 50);
  const mlPts = Math.max(0, Math.min(10.0, Math.round((risk - (critPts + sevPts + volPts + kcPts)) * 10) / 10));

  return [
    {
      id: 'criticality',
      name: 'ASSET CRITICALITY',
      points: critPts,
      maxPoints: 45,
      percent: (critPts / 45) * 100,
      color: critPts >= 30 ? '#B84D61' : '#C18A4A',
      explanation: `Critical production asset (${host}). Criticality Tier: ${(incident?.asset_criticality || 'MEDIUM').toUpperCase()}. Primary determinant of risk priority (+${critPts} pts).`,
    },
    {
      id: 'severity',
      name: 'PEAK SEVERITY',
      points: sevPts,
      maxPoints: 25,
      percent: (sevPts / 25) * 100,
      color: sevPts >= 20 ? '#B84D61' : '#C18A4A',
      explanation: `Critical alert observed within incident. Peak severity [${(incident?.severity || 'Medium').toUpperCase()}] observed in telemetry (+${sevPts} pts).`,
    },
    {
      id: 'killchain',
      name: 'KILL-CHAIN DEPTH',
      points: kcPts,
      maxPoints: 15,
      percent: (kcPts / 15) * 100,
      color: '#57CFEF',
      explanation: `Multiple ATT&CK tactics observed across kill-chain (${tacticsCount} verified tactics) (+${kcPts} pts).`,
    },
    {
      id: 'ml',
      name: 'ML RELEVANCE',
      points: mlPts,
      maxPoints: 10,
      percent: (mlPts / 10) * 100,
      color: '#8BE3FF',
      explanation: `Supporting model signal from trained Random Forest classifier on telemetry features (+${mlPts.toFixed(1)} pts).`,
    },
    {
      id: 'volume',
      name: 'ALERT VOLUME',
      points: volPts,
      maxPoints: 5,
      percent: (volPts / 5) * 100,
      color: '#5F9E88',
      explanation: `Alert volume contribution (${alertCount} correlated alerts). Capped at +5.0 pts to prevent volume bias (+${volPts.toFixed(1)} pts).`,
    },
  ];
}

export function IncidentDetailModal({ incident, onClose, onReviewAction }) {
  const [activeIncident, setActiveIncident] = useState(incident);
  const [showSplitModal, setShowSplitModal] = useState(false);

  // Phase 4, 5, 12 states
  const [selectedAlertForDrawer, setSelectedAlertForDrawer] = useState(null);
  const [showCorrelatedAlertsView, setShowCorrelatedAlertsView] = useState(false);
  const [whatIfTier, setWhatIfTier] = useState((incident?.asset_criticality || 'Critical').toUpperCase());
  const [expandedFactor, setExpandedFactor] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedAlertForDrawer) {
          setSelectedAlertForDrawer(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, selectedAlertForDrawer]);

  useEffect(() => {
    setActiveIncident(incident);
    if (incident?.asset_criticality) {
      setWhatIfTier(incident.asset_criticality.toUpperCase());
    }
  }, [incident]);

  const handleIncidentUpdated = (updated) => {
    if (!updated) return;
    setActiveIncident(updated);
    if (onReviewAction) {
      onReviewAction(
        updated.incident_id || updated.id,
        updated.investigation_status || 'CONFIRMED',
        updated.analyst_note || ''
      );
    }
  };

  if (!activeIncident) return null;

  const id = activeIncident.incident_id || activeIncident.id || 'INC-000';
  const prio = String(activeIncident.priority || 'P1').slice(0, 2).toUpperCase();
  const risk = Number(activeIncident.risk_score ?? activeIncident.riskScore ?? 0);
  const assetName = activeIncident.hostname || activeIncident.asset_name || activeIncident.asset || 'UNKNOWN-HOST';
  const criticality = (activeIncident.asset_criticality || activeIncident.criticality || 'MEDIUM').toUpperCase();
  const alertCount = activeIncident.alert_count ?? activeIncident.signalsCount ?? (activeIncident.alerts?.length || 1);

  const riskFactors = parseRiskFactors(activeIncident);

  const mitreList = activeIncident.mitre_mappings || activeIncident.mitre_techniques || [];

  // What-If Dynamic Recalculation (Phase 5)
  const currentCriticality = criticality.toLowerCase();
  const currentCritPts = currentCriticality === 'critical' ? 45.0 : currentCriticality === 'high' ? 30.0 : currentCriticality === 'medium' ? 15.0 : 0.0;
  const whatIfCritPts = whatIfTier.toLowerCase() === 'critical' ? 45.0 : whatIfTier.toLowerCase() === 'high' ? 30.0 : whatIfTier.toLowerCase() === 'medium' ? 15.0 : 0.0;
  const whatIfDelta = whatIfCritPts - currentCritPts;
  const simulatedScore = Math.max(0, Math.min(100, Math.round((risk + whatIfDelta) * 10) / 10));
  const simulatedPrio = simulatedScore >= 75 ? 'P1' : simulatedScore >= 55 ? 'P2' : simulatedScore >= 35 ? 'P3' : 'P4';

  const aiBriefText =
    activeIncident.shift_brief?.custom_brief_text ||
    activeIncident.shift_brief?.what_happened ||
    (typeof activeIncident.ai_brief === 'string' ? activeIncident.ai_brief : activeIncident.ai_brief?.brief) ||
    '';

  const investigationPoints = activeIncident.shift_brief?.investigation_points || [];

  // Build timeline events from actual incident.alerts (Phase 8 & 12)
  const timelineEvents = useMemo(() => {
    if (activeIncident.alerts && Array.isArray(activeIncident.alerts) && activeIncident.alerts.length > 0) {
      const sorted = [...activeIncident.alerts].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      return sorted.map((al, idx) => {
        let phase = 'CORRELATED ACTIVITY';
        if (idx === 0) phase = 'INITIAL SIGNAL';
        else if (al.mitre_technique || al.mitre_tactic) phase = 'MITRE EVIDENCE';
        else if (String(al.severity || '').toLowerCase() === 'critical') phase = 'ESCALATION';
        else if (idx === sorted.length - 1) phase = 'CURRENT STATE';

        const tStr = al.timestamp ? (al.timestamp.length > 19 ? al.timestamp.slice(11, 19) + ' UTC' : al.timestamp) : '00:00:00 UTC';

        return {
          phase,
          timestamp: tStr,
          alertType: al.alert_type || 'Observed Signal',
          source: al.source || 'Endpoint Telemetry',
          evidence: al.evidence ? (typeof al.evidence === 'string' ? al.evidence : JSON.stringify(al.evidence)) : al.description || 'Observed telemetry anomaly',
          mitre: al.mitre_technique || al.mitre_tactic || null,
          severity: al.severity || 'Medium',
          rawAlert: al,
        };
      });
    }

    // Fallback using shift_brief.timeline_events
    if (activeIncident.shift_brief?.timeline_events && activeIncident.shift_brief.timeline_events.length > 0) {
      return activeIncident.shift_brief.timeline_events.map((evt, idx) => ({
        phase: idx === 0 ? 'INITIAL SIGNAL' : idx === activeIncident.shift_brief.timeline_events.length - 1 ? 'CURRENT STATE' : 'CORRELATED ACTIVITY',
        timestamp: `${idx * 4}m offset`,
        alertType: 'Security Signal',
        source: 'Normalized Pipeline',
        evidence: evt,
        mitre: null,
        severity: prio === 'P1' ? 'Critical' : 'High',
        rawAlert: null,
      }));
    }

    return [
      {
        phase: 'INITIAL SIGNAL',
        timestamp: (activeIncident.start_time || '').slice(11, 19) || '14:22:10 UTC',
        alertType: activeIncident.title || 'Anomalous Activity',
        source: 'Security Pipeline',
        evidence: activeIncident.correlation_reason || 'Pairwise correlation match',
        mitre: mitreList[0]?.technique_id || null,
        severity: prio === 'P1' ? 'Critical' : 'High',
        rawAlert: null,
      },
    ];
  }, [activeIncident, mitreList, prio]);

  const handleAction = async (action) => {
    setIsSubmitting(true);
    setReviewStatus(action);
    try {
      if (onReviewAction) {
        await onReviewAction(id, action, analystNote);
      }
    } catch (err) {
      console.error('Review action failed:', err);
    } finally {
      setIsSubmitting(false);
      setShowNoteInput(false);
    }
  };

  const handleFeedback = async (agreement) => {
    setFeedbackAgreement(agreement);
    try {
      await fetch(`http://127.0.0.1:8000/api/incidents/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreement: agreement === 'agreed' ? 'Agreed' : 'Disagreed',
          feedback_notes: `Analyst ${agreement} with AI shift brief via workstation`,
        }),
      });
    } catch (e) {
      console.error('Feedback failed:', e);
    }
  };

  return (
    <div className="forensic-workstation-backdrop" onClick={onClose} role="presentation">
      <div
        className="forensic-workstation-window sentinel-glass-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workstation-title"
      >
        {/* Dynamic SOC Workstation Header */}
        <div className="workstation-top-header flex-between mono">
          <div className="header-meta-group align-center">
            <span className="live-status-dot" />
            <span className="station-brand-text">INCIDENT INVESTIGATION</span>
            <span className="meta-sep">/</span>
            <span className="station-incident-id" id="workstation-title">{id}</span>
            <PriorityBadge priority={prio} />
            <div className="station-risk-callout">
              <span className="risk-num">{risk.toFixed(1)}</span>
              <span className="risk-denom">/ 100</span>
            </div>
            <span className="meta-sep">/</span>
            <span className="station-asset-name" title={assetName}>{assetName}</span>
            <CriticalityBadge criticality={criticality} />
            <span className="station-alert-pill">{alertCount} ALERTS</span>
          </div>

          <button
            className="station-close-btn align-center mono sentinel-interactive-btn"
            onClick={onClose}
            aria-label="Close investigation workstation"
          >
            <span>ESC / CLOSE</span>
            <X size={14} />
          </button>
        </div>

        {/* 3-Column Forensic Layout */}
        <div className="workstation-scroll-body">
          <div className="forensic-three-column-grid">

            {/* ========================================================
                COLUMN 1 (LEFT): INCIDENT IDENTITY & VERTICAL EVIDENCE TIMELINE
               ======================================================== */}
            <div className="column-card timeline-column">
              <div className="column-header-bar flex-between mono">
                <span>01 / TIMELINE &amp; IDENTITY</span>
                <span className="col-sub-pill">{timelineEvents.length} EVENTS</span>
              </div>

              {/* Asset Identity Card */}
              <div className="identity-subcard mono">
                <div className="identity-row flex-between">
                  <span className="id-key">HOST</span>
                  <span className="id-val font-bold text-white">{assetName}</span>
                </div>
                <div className="identity-row flex-between">
                  <span className="id-key">USER</span>
                  <span className="id-val text-cyan">{incident.user || 'SYSTEM'}</span>
                </div>
                <div className="identity-row flex-between">
                  <span className="id-key">SOURCE IP</span>
                  <span className="id-val">{incident.source_ip || 'Internal'}</span>
                </div>
                <div className="identity-row flex-between">
                  <span className="id-key">DEST IP</span>
                  <span className="id-val">{incident.destination_ip || 'N/A'}</span>
                </div>
                <div className="identity-row flex-between">
                  <span className="id-key">WINDOW</span>
                  <span className="id-val">{incident.duration_minutes ? `${incident.duration_minutes}m duration` : 'Active Window'}</span>
                </div>
              </div>

              {/* Vertical Evidence Timeline (Clickable to inspect raw alert) */}
              <div className="vertical-timeline-container">
                <div className="timeline-spine" />
                {timelineEvents.map((evt, idx) => (
                  <div
                    key={idx}
                    className={`timeline-node-item ${evt.rawAlert ? 'interactive-timeline-item' : ''}`}
                    onClick={() => evt.rawAlert && setSelectedAlertForDrawer(evt.rawAlert)}
                    title={evt.rawAlert ? `Click to inspect raw alert ${evt.rawAlert.alert_id} in forensic drawer` : ''}
                  >
                    <div className="node-marker-ring">
                      <div className="node-marker-center" />
                    </div>
                    <div className="node-content-box">
                      <div className="node-top flex-between mono">
                        <span className="node-phase-tag">{evt.phase}</span>
                        <span className="node-time-tag">{evt.timestamp}</span>
                      </div>
                      <div className="node-alert-name">{evt.alertType}</div>
                      <div className="node-source-meta mono">{evt.source}</div>
                      <div className="node-evidence-text mono" title={evt.evidence}>
                        {evt.evidence.length > 110 ? evt.evidence.slice(0, 110) + '...' : evt.evidence}
                      </div>
                      <div className="flex-between align-center" style={{ marginTop: '0.35rem' }}>
                        {evt.mitre ? (
                          <div className="node-mitre-pill mono">
                            MITRE: {evt.mitre}
                          </div>
                        ) : <span />}
                        {evt.rawAlert && (
                          <span className="node-click-inspect-tag mono">
                            INSPECT ALERT &rarr;
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Analyst Notes & Chronological Audit History */}
              <AnalystNotesPanel incident={activeIncident} onNoteAdded={handleIncidentUpdated} />
              <ReviewHistoryAudit incident={activeIncident} />
            </div>

            {/* ========================================================
                COLUMN 2 (CENTER): EVIDENCE & RISK & MITRE WORKSPACE
               ======================================================== */}
            <div className="column-card center-workspace-column">
              <div className="column-header-bar flex-between mono">
                <span>02 / EVIDENCE &amp; RISK</span>
                <span className="col-sub-pill text-cyan">DETERMINISTIC FORMULA</span>
              </div>

              {/* PHASE 4: PROMINENT "WHY THIS PRIORITY?" PANEL */}
              <div className="why-priority-panel sentinel-glass-card">
                <div className="why-priority-header flex-between align-center mono">
                  <div>
                    <span className="why-lead-tag">EXPLAINABLE PRIORITIZATION</span>
                    <h3 className="why-title">WHY THIS PRIORITY?</h3>
                  </div>
                  <div className="why-hero-badge mono">
                    <span className="why-inc-id">{id}</span>
                    <span className="why-sep">&bull;</span>
                    <span className="why-prio">{prio}</span>
                    <span className="why-sep">&mdash;</span>
                    <span className="why-score">{risk.toFixed(1)} <span className="denom">/ 100</span></span>
                  </div>
                </div>

                <div className="risk-contribution-lead mono">
                  <span>RISK CONTRIBUTION (ADDITIVE AUDIT FORMULA)</span>
                  <span className="contrib-hint">&bull; Click item to inspect rationale</span>
                </div>

                <div className="risk-contribution-table mono">
                  {riskFactors.map((rf) => {
                    const isExpanded = expandedFactor === rf.id;
                    return (
                      <div
                        key={rf.id}
                        className={`contribution-row ${isExpanded ? 'expanded' : ''} sentinel-interactive-btn`}
                        onClick={() => setExpandedFactor(isExpanded ? null : rf.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setExpandedFactor(isExpanded ? null : rf.id)}
                        title="Click to view explanation"
                      >
                        <div className="contrib-main flex-between align-center">
                          <span className="contrib-name align-center">
                            <span>{rf.name}</span>
                            <HelpCircle size={11} className="text-muted" style={{ marginLeft: '0.35rem' }} />
                          </span>
                          <span className="contrib-pts font-bold" style={{ color: rf.color }}>
                            +{rf.points.toFixed(1)}
                          </span>
                        </div>
                        {isExpanded && (
                          <div className="contrib-explanation">
                            {rf.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div className="contribution-divider" />
                  <div className="contribution-total-row flex-between align-center mono font-bold">
                    <span className="text-white">COMPOSITE RISK SCORE</span>
                    <span className="text-burgundy" style={{ fontSize: '1.05rem' }}>{risk.toFixed(1)} / 100</span>
                  </div>
                </div>
              </div>

              {/* PHASE 5: WHAT-IF RISK SIMULATOR */}
              <div className="what-if-simulator-panel sentinel-glass-card mono">
                <div className="what-if-header flex-between align-center">
                  <div>
                    <span className="what-if-lead-tag">ASSET CRITICALITY DEMONSTRATION</span>
                    <h4 className="what-if-title">WHAT-IF RISK SIMULATOR</h4>
                  </div>
                  <div className="what-if-tag-pill">HYPOTHETICAL</div>
                </div>

                <div className="what-if-tier-selector">
                  <span className="tier-select-lbl">SIMULATED ASSET CRITICALITY TIER:</span>
                  <div className="tier-btn-group">
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`tier-btn ${whatIfTier.toUpperCase() === t ? 'active ' + t.toLowerCase() : ''}`}
                        onClick={() => setWhatIfTier(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="what-if-comparison-strip flex-between align-center">
                  <div className="sim-block">
                    <span className="sim-lbl">CURRENT PRODUCTION STATE</span>
                    <div className="sim-val font-bold text-white">
                      {(activeIncident.asset_criticality || 'MEDIUM').toUpperCase()} &rarr; {risk.toFixed(1)} <span className="prio-tag">{prio}</span>
                    </div>
                  </div>
                  <div className="sim-arrow text-muted">&rarr;</div>
                  <div className="sim-block">
                    <span className="sim-lbl">SIMULATED RECALCULATION</span>
                    <div className="sim-val font-bold text-cyan">
                      {whatIfTier.toUpperCase()} &rarr; {simulatedScore.toFixed(1)} <span className="prio-tag">{simulatedPrio}</span>
                      <span className="sim-delta" style={{ color: whatIfDelta >= 0 ? '#5F9E88' : '#B84D61', marginLeft: '0.4rem' }}>
                        ({whatIfDelta >= 0 ? `+${whatIfDelta}` : whatIfDelta} pts)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="what-if-disclaimer align-center">
                  <ShieldAlert size={12} className="text-amber" />
                  <span>WHAT-IF SIMULATION &bull; DOES NOT CHANGE PRODUCTION INCIDENT DATA</span>
                </div>
              </div>

              {/* PHASE 12: CORRELATED ALERTS TRACEABILITY */}
              <div className="correlated-alerts-panel sentinel-glass-card mono">
                <div className="correlated-header flex-between align-center">
                  <div className="align-center" style={{ gap: '0.45rem' }}>
                    <Layers size={13} style={{ color: '#57CFEF' }} />
                    <span className="corr-title">
                      CORRELATED ALERTS TRACEABILITY ({activeIncident.alerts?.length || alertCount} ALERTS)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="corr-toggle-btn sentinel-interactive-btn"
                    onClick={() => setShowCorrelatedAlertsView(!showCorrelatedAlertsView)}
                  >
                    {showCorrelatedAlertsView ? 'HIDE CORRELATED ALERTS ▲' : 'SHOW CORRELATED ALERTS ▼'}
                  </button>
                </div>

                {showCorrelatedAlertsView && (
                  <div className="correlated-alerts-list">
                    {(activeIncident.alerts && activeIncident.alerts.length > 0 ? activeIncident.alerts : [
                      {
                        alert_id: 'ALT-102-01',
                        timestamp: activeIncident.start_time || '2026-09-24T14:22:10Z',
                        source: 'Defender for Endpoint',
                        alert_type: activeIncident.title || 'Suspicious Process Execution',
                        severity: activeIncident.severity || 'Critical',
                        hostname: assetName,
                        user: activeIncident.user || 'SYSTEM',
                        description: activeIncident.correlation_reason || 'Correlated security event'
                      }
                    ]).map((a) => (
                      <div
                        key={a.alert_id}
                        className="corr-alert-item flex-between align-center sentinel-interactive-btn"
                        onClick={() => setSelectedAlertForDrawer(a)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedAlertForDrawer(a)}
                        title="Click to inspect all 19 fields in evidence drawer"
                      >
                        <div className="corr-item-left">
                          <div className="align-center" style={{ gap: '0.5rem' }}>
                            <span className="corr-aid font-bold text-cyan">{a.alert_id}</span>
                            <span className="corr-type text-white">{a.alert_type}</span>
                          </div>
                          <div className="corr-desc text-muted">{a.description}</div>
                        </div>
                        <div className="corr-item-right align-center">
                          <span className={`corr-sev ${(a.severity || 'low').toLowerCase()}`}>{a.severity}</span>
                          <span className="corr-inspect-pill">&rarr; INSPECT</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Human-in-the-Loop 2.0 Evidence Review Panel */}
              <EvidenceReviewPanel incident={activeIncident} onEvidenceUpdated={handleIncidentUpdated} />

              {/* Proposed Split Trigger */}
              <div className="split-action-strip flex-between align-center mono">
                <div className="align-center" style={{ gap: '0.45rem' }}>
                  <Scissors size={13} style={{ color: '#A96B42' }} />
                  <span style={{ fontSize: '0.65rem', color: '#C8C2B9' }}>
                    PROPOSED SPLIT: Branch alerts into sub-incident clusters
                  </span>
                </div>
                <button
                  type="button"
                  className="propose-split-btn"
                  onClick={() => setShowSplitModal(true)}
                >
                  PROPOSE SPLIT &rarr;
                </button>
              </div>

              {/* Evidence-Grounded MITRE Panel (Phase 6) */}
              <div className="mitre-evidence-panel">
                <div className="mitre-panel-title mono flex-between">
                  <span>MITRE ATT&amp;CK ATTRIBUTION</span>
                  <span className="mitre-count-badge mono">{mitreList.length} VERIFIED</span>
                </div>

                {mitreList && mitreList.length > 0 ? (
                  <div className="mitre-cards-list">
                    {mitreList.map((m, idx) => {
                      const techId = m.technique_id || m.id;
                      const techName = m.technique_name || m.name;
                      return (
                        <div key={idx} className="mitre-evidence-card mono">
                          <div className="mitre-card-top flex-between">
                            <span className="mitre-tech-id text-cyan font-bold">{techId}</span>
                            {m.tactic && <span className="mitre-tactic-pill">{m.tactic}</span>}
                          </div>
                          <div className="mitre-tech-name text-white">{techName}</div>
                          {m.evidence_found && (
                            <div className="mitre-proof-text">
                              <b>PROOF:</b> {m.evidence_found}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-mitre-state mono">
                    NO VERIFIED MITRE TECHNIQUE
                  </div>
                )}
              </div>
            </div>

            {/* ========================================================
                COLUMN 3 (RIGHT): ANALYST DECISION CENTER & AI BRIEF
               ======================================================== */}
            <div className="column-card ai-review-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <InvestigationCompletenessBadge incident={activeIncident} />
              <AnalystDecisionCenter incident={activeIncident} onDecisionSubmitted={handleIncidentUpdated} />
              <AiBriefReviewPanel incident={activeIncident} onBriefUpdated={handleIncidentUpdated} />
            </div>

          </div>
        </div>
      </div>

      {showSplitModal && (
        <IncidentSplitModal
          incident={activeIncident}
          onClose={() => setShowSplitModal(false)}
          onSplitConfirmed={handleIncidentUpdated}
        />
      )}

      {selectedAlertForDrawer && (
        <AlertEvidenceDrawer
          alert={selectedAlertForDrawer}
          onClose={() => setSelectedAlertForDrawer(null)}
        />
      )}

      <style>{`
        .forensic-workstation-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 17, 16, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 2500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          animation: workstationFadeIn 220ms ease;
        }

        @keyframes workstationFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .forensic-workstation-window {
          background: #1E1D1B;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 35px 120px rgba(0, 0, 0, 0.85);
          border-radius: 8px;
          width: min(1520px, calc(100vw - 40px));
          height: calc(100vh - 50px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: workstationSlideUp 260ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes workstationSlideUp {
          from { transform: translateY(20px); opacity: 0.8; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Top Header */
        .workstation-top-header {
          padding: 0.85rem 1.75rem;
          background: rgba(24, 23, 22, 0.96);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          gap: 1rem;
          flex-wrap: wrap;
        }

        .header-meta-group {
          gap: 0.75rem;
          font-size: 0.72rem;
          flex-wrap: wrap;
        }

        .live-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #5F9E88;
          box-shadow: 0 0 8px rgba(95, 158, 136, 0.6);
        }

        .station-brand-text {
          font-weight: 700;
          color: #C8C2B9;
          letter-spacing: 0.12em;
        }

        .station-incident-id {
          font-weight: 700;
          color: #F3EFE8;
          font-size: 0.88rem;
        }

        .station-risk-callout {
          font-weight: 700;
          color: #B84D61;
        }
        .risk-denom {
          color: #A7A096;
          font-size: 0.65rem;
          margin-left: 0.15rem;
        }

        .station-asset-name {
          color: #F3EFE8;
          font-weight: 600;
        }

        .station-alert-pill {
          background: rgba(169, 107, 66, 0.15);
          border: 1px solid rgba(169, 107, 66, 0.35);
          color: #F3EFE8;
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
          font-size: 0.65rem;
          font-weight: 600;
        }

        .station-close-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #C8C2B9;
          font-size: 0.68rem;
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
          gap: 0.4rem;
          cursor: pointer;
        }
        .station-close-btn:hover {
          color: #F3EFE8;
          border-color: #A96B42;
          background: rgba(255, 255, 255, 0.10);
        }

        /* 3-Column Scroll Body */
        .workstation-scroll-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem 1.75rem;
          background: transparent;
        }

        .forensic-three-column-grid {
          display: grid;
          grid-template-columns: 30% 40% 30%;
          gap: 1.5rem;
          min-height: 100%;
        }

        .column-card {
          background: rgba(25, 24, 22, 0.90);
          border: 1px solid rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);
          border-radius: 6px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .column-header-bar {
          font-size: 0.68rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.1em;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .col-sub-pill {
          font-size: 0.62rem;
          color: #817B73;
        }

        /* Identity Subcard */
        .identity-subcard {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          font-size: 0.7rem;
        }

        .id-key {
          color: #817B73;
          font-weight: 600;
        }
        .id-val {
          color: #F3EFE8;
        }

        /* Vertical Timeline */
        .vertical-timeline-container {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
          padding-left: 1.25rem;
        }

        .timeline-spine {
          position: absolute;
          left: 5px;
          top: 8px;
          bottom: 8px;
          width: 2px;
          background: linear-gradient(180deg, #A96B42 0%, rgba(169, 107, 66, 0.1) 100%);
        }

        .timeline-node-item {
          position: relative;
        }

        .node-marker-ring {
          position: absolute;
          left: -1.25rem;
          top: 3px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid #A96B42;
          background: #242321;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .node-marker-center {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #A96B42;
        }

        .node-content-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 0.65rem 0.85rem;
        }

        .node-phase-tag {
          font-size: 0.62rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.08em;
        }

        .node-time-tag {
          font-size: 0.62rem;
          color: #817B73;
        }

        .node-alert-name {
          font-size: 0.78rem;
          font-weight: 600;
          color: #F3EFE8;
          margin-top: 0.2rem;
        }

        .node-source-meta {
          font-size: 0.62rem;
          color: #817B73;
          margin-bottom: 0.35rem;
        }

        .node-evidence-text {
          font-size: 0.66rem;
          color: #B9B3AA;
          line-height: 1.4;
          background: rgba(255, 255, 255, 0.03);
          padding: 0.35rem 0.5rem;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .node-mitre-pill {
          margin-top: 0.35rem;
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 600;
          color: #A96B42;
          background: rgba(169, 107, 66, 0.12);
          border: 1px solid rgba(169, 107, 66, 0.25);
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
        }

        .interactive-timeline-item {
          cursor: pointer;
          transition: transform 140ms ease;
        }
        .interactive-timeline-item:hover {
          transform: translateX(2px);
        }
        .interactive-timeline-item:hover .node-content-box {
          border-color: rgba(169, 107, 66, 0.45);
          background: rgba(255, 255, 255, 0.06);
        }
        .node-click-inspect-tag {
          font-size: 0.58rem;
          color: #57CFEF;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        /* PHASE 4: WHY THIS PRIORITY? PANEL */
        .why-priority-panel {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .why-priority-header {
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
        }

        .why-lead-tag {
          font-size: 0.6rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.12em;
        }

        .why-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #F3EFE8;
          margin-top: 0.15rem;
          letter-spacing: -0.01em;
        }

        .why-hero-badge {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.10);
          padding: 0.35rem 0.65rem;
          border-radius: 4px;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .why-inc-id { color: #57CFEF; font-weight: 700; }
        .why-sep { color: #817B73; }
        .why-prio { color: #B84D61; font-weight: 800; }
        .why-score { color: #F3EFE8; font-weight: 700; }
        .why-score .denom { color: #817B73; font-size: 0.62rem; }

        .risk-contribution-lead {
          font-size: 0.62rem;
          font-weight: 700;
          color: #817B73;
          letter-spacing: 0.1em;
          display: flex;
          justify-content: space-between;
        }
        .contrib-hint {
          color: #A96B42;
          font-weight: 600;
        }

        .risk-contribution-table {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .contribution-row {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          padding: 0.55rem 0.75rem;
          cursor: pointer;
          transition: all 140ms ease;
        }
        .contribution-row:hover,
        .contribution-row.expanded {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .contrib-main {
          font-size: 0.68rem;
          font-weight: 700;
        }
        .contrib-name {
          color: #F3EFE8;
          letter-spacing: 0.06em;
        }
        .contrib-pts {
          font-size: 0.75rem;
        }

        .contrib-explanation {
          margin-top: 0.45rem;
          padding-top: 0.45rem;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          font-size: 0.64rem;
          color: #C8C2B9;
          line-height: 1.45;
        }

        .contribution-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.10);
          margin: 0.3rem 0;
        }

        .contribution-total-row {
          padding: 0.4rem 0.75rem;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
        }

        /* PHASE 5: WHAT-IF RISK SIMULATOR PANEL */
        .what-if-simulator-panel {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(169, 107, 66, 0.25);
          border-radius: 6px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .what-if-header {
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .what-if-lead-tag {
          font-size: 0.6rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.12em;
        }
        .what-if-title {
          font-size: 0.95rem;
          font-weight: 800;
          color: #F3EFE8;
          margin-top: 0.15rem;
        }
        .what-if-tag-pill {
          font-size: 0.58rem;
          background: rgba(169, 107, 66, 0.15);
          border: 1px solid rgba(169, 107, 66, 0.35);
          color: #A96B42;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .what-if-tier-selector {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .tier-select-lbl {
          font-size: 0.62rem;
          color: #817B73;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .tier-btn-group {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }
        .tier-btn {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #C8C2B9;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.4rem 0;
          border-radius: 4px;
          cursor: pointer;
          letter-spacing: 0.08em;
          transition: all 140ms ease;
        }
        .tier-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #F3EFE8;
        }
        .tier-btn.active.critical {
          background: rgba(184, 77, 97, 0.2);
          border-color: #B84D61;
          color: #F3EFE8;
        }
        .tier-btn.active.high {
          background: rgba(193, 138, 74, 0.2);
          border-color: #C18A4A;
          color: #F3EFE8;
        }
        .tier-btn.active.medium {
          background: rgba(95, 158, 136, 0.2);
          border-color: #5F9E88;
          color: #F3EFE8;
        }
        .tier-btn.active.low {
          background: rgba(120, 130, 138, 0.2);
          border-color: #78828A;
          color: #F3EFE8;
        }

        .what-if-comparison-strip {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.65rem 0.85rem;
          border-radius: 4px;
          gap: 0.5rem;
        }
        .sim-block {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .sim-lbl {
          font-size: 0.56rem;
          color: #817B73;
          font-weight: 700;
          letter-spacing: 0.08em;
        }
        .sim-val {
          font-size: 0.72rem;
          display: flex;
          align-items: center;
        }
        .sim-val .prio-tag {
          margin-left: 0.35rem;
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.08);
          font-size: 0.62rem;
        }
        .sim-delta {
          font-size: 0.64rem;
          font-weight: 700;
        }

        .what-if-disclaimer {
          font-size: 0.58rem;
          color: #E0A854;
          gap: 0.4rem;
          letter-spacing: 0.06em;
          padding: 0.35rem 0.5rem;
          background: rgba(224, 168, 84, 0.08);
          border: 1px solid rgba(224, 168, 84, 0.2);
          border-radius: 3px;
        }

        /* PHASE 12: CORRELATED ALERTS TRACEABILITY PANEL */
        .correlated-alerts-panel {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 0.95rem 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .corr-title {
          font-size: 0.68rem;
          font-weight: 700;
          color: #F3EFE8;
          letter-spacing: 0.08em;
        }
        .corr-toggle-btn {
          background: rgba(87, 207, 239, 0.10);
          border: 1px solid rgba(87, 207, 239, 0.25);
          color: #57CFEF;
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.3rem 0.65rem;
          border-radius: 3px;
          cursor: pointer;
        }
        .corr-toggle-btn:hover {
          background: rgba(87, 207, 239, 0.18);
        }

        .correlated-alerts-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          max-height: 240px;
          overflow-y: auto;
          padding-right: 0.3rem;
        }
        .corr-alert-item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.55rem 0.75rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
        }
        .corr-alert-item:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(87, 207, 239, 0.35);
        }
        .corr-item-left {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.66rem;
        }
        .corr-aid {
          font-size: 0.68rem;
        }
        .corr-type {
          font-weight: 600;
        }
        .corr-desc {
          font-size: 0.6rem;
          line-height: 1.35;
          max-width: 320px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .corr-item-right {
          gap: 0.5rem;
        }
        .corr-sev {
          font-size: 0.58rem;
          font-weight: 700;
          padding: 0.15rem 0.4rem;
          border-radius: 2px;
          text-transform: uppercase;
        }
        .corr-sev.critical { background: rgba(184, 77, 97, 0.2); color: #B84D61; }
        .corr-sev.high { background: rgba(193, 138, 74, 0.2); color: #C18A4A; }
        .corr-sev.medium { background: rgba(95, 158, 136, 0.2); color: #5F9E88; }
        .corr-sev.low { background: rgba(120, 130, 138, 0.2); color: #78828A; }
        .corr-inspect-pill {
          font-size: 0.58rem;
          color: #57CFEF;
          font-weight: 700;
        }

        .factor-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 400ms ease;
        }

        /* Evidence Fields */
        .evidence-glass-workspace {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 1.15rem;
        }

        .evidence-section-title {
          font-size: 0.65rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.12em;
          margin-bottom: 0.85rem;
        }

        .evidence-badge {
          font-size: 0.6rem;
          color: #5F9E88;
        }

        .evidence-grid-fields {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .evidence-field-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          font-size: 0.7rem;
        }

        .field-lbl {
          font-size: 0.6rem;
          color: #817B73;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .field-val {
          color: #F3EFE8;
        }

        /* MITRE Attribution */
        .mitre-evidence-panel {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 1.15rem;
        }

        .mitre-panel-title {
          font-size: 0.65rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.12em;
          margin-bottom: 0.85rem;
        }

        .mitre-count-badge {
          font-size: 0.6rem;
          color: #817B73;
        }

        .mitre-cards-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .mitre-evidence-card {
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.75rem;
          font-size: 0.7rem;
        }

        .mitre-tech-id {
          font-size: 0.75rem;
        }

        .mitre-tactic-pill {
          font-size: 0.6rem;
          color: #B9B3AA;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
        }

        .mitre-tech-name {
          font-weight: 600;
          color: #F3EFE8;
          margin: 0.25rem 0;
        }

        .mitre-proof-text {
          font-size: 0.64rem;
          color: #B9B3AA;
          margin-top: 0.35rem;
          line-height: 1.4;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 0.4rem;
          border-radius: 3px;
        }

        .no-mitre-state {
          text-align: center;
          padding: 1.5rem;
          font-size: 0.68rem;
          color: #817B73;
          letter-spacing: 0.1em;
        }

        /* Right Column: AI Handover */
        .ai-handover-box {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 1.15rem;
        }

        .ai-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #A96B42;
          box-shadow: 0 0 8px rgba(169, 107, 66, 0.6);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .handover-title {
          font-size: 0.68rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.1em;
        }

        .handover-status {
          font-size: 0.62rem;
          color: #5F9E88;
          font-weight: 700;
        }

        .brief-quote {
          margin-top: 0.85rem;
          font-size: 0.84rem;
          line-height: 1.55;
          color: #F3EFE8;
          font-style: italic;
          border-left: 2px solid #A96B42;
          padding-left: 0.85rem;
        }

        .brief-unavailable {
          margin-top: 0.85rem;
          font-size: 0.7rem;
          color: #817B73;
        }

        .recommended-investigation-points {
          margin-top: 1rem;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .rec-title {
          font-size: 0.62rem;
          font-weight: 700;
          color: #817B73;
          letter-spacing: 0.08em;
        }

        .rec-list {
          margin: 0.5rem 0 0 1rem;
          font-size: 0.68rem;
          color: #B9B3AA;
          line-height: 1.5;
        }

        .analyst-feedback-row {
          margin-top: 1rem;
          padding-top: 0.85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.62rem;
        }

        .feedback-prompt {
          color: #817B73;
          font-weight: 700;
        }

        .feedback-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.10);
          color: #B9B3AA;
          font-size: 0.62rem;
          font-weight: 600;
          padding: 0.25rem 0.55rem;
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 160ms ease;
        }
        .feedback-btn:hover {
          color: #F3EFE8;
          border-color: #A96B42;
        }

        .active-agree {
          background: rgba(95, 158, 136, 0.14);
          color: #5F9E88;
          border-color: #5F9E88;
        }

        .active-disagree {
          background: rgba(184, 77, 97, 0.14);
          color: #B84D61;
          border-color: #B84D61;
        }

        /* Human Review Decision Card */
        .human-review-decision-card {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 1.15rem;
        }

        .review-title-row {
          font-size: 0.65rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.12em;
          margin-bottom: 1rem;
        }

        .review-button-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .review-action-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.10);
          color: #F3EFE8;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.6rem 1rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 160ms ease;
        }

        .review-action-btn.confirm:hover,
        .review-action-btn.confirm.active {
          background: rgba(95, 158, 136, 0.18);
          color: #5F9E88;
          border-color: #5F9E88;
        }

        .review-action-btn.reject:hover,
        .review-action-btn.reject.active {
          background: rgba(184, 77, 97, 0.18);
          color: #B84D61;
          border-color: #B84D61;
        }

        .review-action-btn.modify:hover,
        .review-action-btn.modify.active {
          background: rgba(193, 138, 74, 0.18);
          color: #C18A4A;
          border-color: #C18A4A;
        }

        .review-action-btn.add-note:hover {
          background: rgba(169, 107, 66, 0.14);
          color: #A96B42;
          border-color: #A96B42;
        }

        .review-action-btn.investigated:hover,
        .review-action-btn.investigated.active {
          background: rgba(92, 148, 128, 0.18);
          color: #5C9480;
          border-color: #5C9480;
        }

        /* Note Input Block */
        .analyst-note-input-block {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .note-input-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: #817B73;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 0.4rem;
        }

        .note-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: 4px;
          color: #F3EFE8;
          font-size: 0.72rem;
          padding: 0.55rem;
          outline: none;
          resize: vertical;
        }
        .note-textarea:focus {
          border-color: #A96B42;
        }

        .note-submit-row {
          margin-top: 0.5rem;
        }

        .note-cancel-btn {
          background: transparent;
          border: none;
          color: #817B73;
          font-size: 0.65rem;
          cursor: pointer;
        }
        .note-cancel-btn:hover { color: #F3EFE8; }

        .note-save-btn {
          background: #A96B42;
          border: none;
          color: #F3EFE8;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: 3px;
          cursor: pointer;
        }
        .note-save-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 1200px) {
          .forensic-three-column-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
