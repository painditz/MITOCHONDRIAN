// client/src/components/incidents/IncidentDetailModal.jsx
// SentinelOps AI - Incident Investigation Forensic Workstation
// Master SOC 3-Column Forensic Layout:
// LEFT: Incident Identity & Vertical Evidence Timeline
// CENTER: Evidence Workspace + Sophisticated Risk Composition Breakdown + MITRE Attribution
// RIGHT: AI Shift Handover Brief + Human Review Controls
import React, { useState, useEffect, useMemo } from 'react';
import { PriorityBadge, CriticalityBadge, AuditStatusBadge } from '../shared/StatusBadge';
import { X, CheckCircle, AlertTriangle, Edit3, MessageSquare, ShieldCheck, Activity, ChevronRight, ThumbsUp, ThumbsDown, Scissors } from 'lucide-react';
import { AnalystDecisionCenter } from './AnalystDecisionCenter';
import { AiBriefReviewPanel } from './AiBriefReviewPanel';
import { EvidenceReviewPanel } from './EvidenceReviewPanel';
import { InvestigationCompletenessBadge } from './InvestigationCompletenessBadge';
import { ReviewHistoryAudit } from './ReviewHistoryAudit';
import { AnalystNotesPanel } from './AnalystNotesPanel';
import { IncidentSplitModal } from './IncidentSplitModal';

function parseRiskFactors(incident) {
  if (incident?.priority_reason) {
    // Regex extract factors from backend priority_reason string:
    // e.g. "Asset Criticality [Critical] (+45.0 pts), Peak Severity [Critical] (+25.0 pts)..."
    const regex = /([A-Za-z\s\-]+)\s*\[?[^\]\(\)]*\]?\s*\(\+([0-9.]+)\s*pts\)/g;
    const matches = [...incident.priority_reason.matchAll(regex)];
    if (matches.length >= 3) {
      return matches.map((m) => {
        const name = m[1].trim();
        const pts = parseFloat(m[2]);
        let maxPts = 45;
        let color = '#21C7F3';

        if (name.includes('Criticality')) {
          maxPts = 45;
          color = pts >= 30 ? '#FF4655' : '#FFB52E';
        } else if (name.includes('Severity')) {
          maxPts = 25;
          color = pts >= 20 ? '#FF4655' : '#FFB52E';
        } else if (name.includes('Kill-Chain')) {
          maxPts = 15;
          color = '#21D4FF';
        } else if (name.includes('ML')) {
          maxPts = 10;
          color = '#62DFFF';
        } else if (name.includes('Volume')) {
          maxPts = 5;
          color = '#10B981';
        }

        return {
          name: name.toUpperCase(),
          points: pts,
          maxPoints: maxPts,
          percent: Math.min(100, Math.round((pts / maxPts) * 100)),
          color,
        };
      });
    }
  }

  // Fallback to exact values from incident model properties
  const crit = (incident?.asset_criticality || 'Medium').toLowerCase();
  const critPts = crit === 'critical' ? 45 : crit === 'high' ? 30 : crit === 'medium' ? 15 : 0;

  const sev = (incident?.severity || 'Medium').toLowerCase();
  const sevPts = sev === 'critical' ? 25 : sev === 'high' ? 18 : sev === 'medium' ? 10 : 5;

  const alertCount = Number(incident?.alert_count ?? 1);
  const volPts = Math.min(alertCount * 0.5, 5.0);

  const tacticsCount = incident?.mitre_mappings?.length || 0;
  const kcPts = tacticsCount >= 2 ? 12 : tacticsCount === 1 ? 4 : 0;

  const risk = Number(incident?.risk_score ?? 50);
  const mlPts = Math.max(0, Math.min(10, risk - (critPts + sevPts + volPts + kcPts)));

  return [
    { name: 'ASSET CRITICALITY', points: critPts, maxPoints: 45, percent: (critPts / 45) * 100, color: critPts >= 30 ? '#FF4655' : '#FFB52E' },
    { name: 'PEAK SEVERITY', points: sevPts, maxPoints: 25, percent: (sevPts / 25) * 100, color: sevPts >= 20 ? '#FF4655' : '#FFB52E' },
    { name: 'KILL-CHAIN DEPTH', points: kcPts, maxPoints: 15, percent: (kcPts / 15) * 100, color: '#21D4FF' },
    { name: 'ML RELEVANCE', points: mlPts, maxPoints: 10, percent: (mlPts / 10) * 100, color: '#62DFFF' },
    { name: 'ALERT VOLUME', points: volPts, maxPoints: 5, percent: (volPts / 5) * 100, color: '#10B981' },
  ];
}

export function IncidentDetailModal({ incident, onClose, onReviewAction }) {
  const [activeIncident, setActiveIncident] = useState(incident);
  const [showSplitModal, setShowSplitModal] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setActiveIncident(incident);
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

  const riskFactors = parseRiskFactors(incident);

  const mitreList = incident.mitre_mappings || incident.mitre_techniques || [];

  const aiBriefText =
    incident.shift_brief?.custom_brief_text ||
    incident.shift_brief?.what_happened ||
    (typeof incident.ai_brief === 'string' ? incident.ai_brief : incident.ai_brief?.brief) ||
    '';

  const investigationPoints = incident.shift_brief?.investigation_points || [];

  // Build timeline events from actual incident.alerts
  const timelineEvents = useMemo(() => {
    if (incident.alerts && Array.isArray(incident.alerts) && incident.alerts.length > 0) {
      const sorted = [...incident.alerts].sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));
      return sorted.map((al, idx) => {
        let phase = 'CORRELATED ACTIVITY';
        if (idx === 0) phase = 'INITIAL SIGNAL';
        else if (al.mitre_technique || al.mitre_tactic) phase = 'MITRE EVIDENCE';
        else if (String(al.severity || '').toLowerCase() === 'critical') phase = 'ESCALATION';
        else if (idx === sorted.length - 1) phase = 'CURRENT STATE';

        return {
          phase,
          timestamp: al.timestamp ? new Date(al.timestamp).toUTCString().slice(17, 25) + ' UTC' : '00:00:00 UTC',
          alertType: al.alert_type || 'Observed Signal',
          source: al.source || 'Endpoint Telemetry',
          evidence: al.evidence ? JSON.stringify(al.evidence) : al.description || 'Observed telemetry anomaly',
          mitre: al.mitre_technique || al.mitre_tactic || null,
          severity: al.severity || 'Medium',
        };
      });
    }

    // Fallback using shift_brief.timeline_events
    if (incident.shift_brief?.timeline_events && incident.shift_brief.timeline_events.length > 0) {
      return incident.shift_brief.timeline_events.map((evt, idx) => ({
        phase: idx === 0 ? 'INITIAL SIGNAL' : idx === incident.shift_brief.timeline_events.length - 1 ? 'CURRENT STATE' : 'CORRELATED ACTIVITY',
        timestamp: `${idx * 4}m offset`,
        alertType: 'Security Signal',
        source: 'Normalized Pipeline',
        evidence: evt,
        mitre: null,
        severity: prio === 'P1' ? 'Critical' : 'High',
      }));
    }

    return [
      {
        phase: 'INITIAL SIGNAL',
        timestamp: (incident.start_time || '').slice(11, 19) || '14:22:10 UTC',
        alertType: incident.title || 'Anomalous Activity',
        source: 'Security Pipeline',
        evidence: incident.correlation_reason || 'Pairwise correlation match',
        mitre: mitreList[0]?.technique_id || null,
        severity: prio === 'P1' ? 'Critical' : 'High',
      },
    ];
  }, [incident, mitreList, prio]);

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

              {/* Vertical Evidence Timeline */}
              <div className="vertical-timeline-container">
                <div className="timeline-spine" />
                {timelineEvents.map((evt, idx) => (
                  <div key={idx} className="timeline-node-item">
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
                      {evt.mitre && (
                        <div className="node-mitre-pill mono">
                          MITRE: {evt.mitre}
                        </div>
                      )}
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
                <span className="col-sub-pill text-cyan">DETERMINISTIC</span>
              </div>

              {/* Large Risk Composition Panel */}
              <div className="risk-composition-panel">
                <div className="risk-main-display flex-between">
                  <div>
                    <span className="risk-lead-label mono">CALCULATED INCIDENT RISK</span>
                    <div className="risk-hero-number mono">
                      <span className="hero-val">{risk.toFixed(1)}</span>
                      <span className="hero-denom">/ 100</span>
                    </div>
                  </div>
                  <div className="risk-prio-lock mono">
                    <span className="lock-label">TIER ASSIGNMENT</span>
                    <PriorityBadge priority={prio} />
                  </div>
                </div>

                {/* Horizontal Risk Composition Progress Bars */}
                <div className="risk-bars-stack">
                  {riskFactors.map((rf, i) => (
                    <div key={i} className="risk-factor-progress-item mono">
                      <div className="factor-meta flex-between">
                        <span className="factor-name">{rf.name}</span>
                        <span className="factor-pts" style={{ color: rf.color }}>
                          +{rf.points.toFixed(1)} PTS
                        </span>
                      </div>
                      <div className="factor-track">
                        <div
                          className="factor-fill"
                          style={{
                            width: `${rf.percent}%`,
                            backgroundColor: rf.color,
                            boxShadow: `0 0 10px ${rf.color}40`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
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

              {/* Evidence-Grounded MITRE Panel */}
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
                    NO VERIFIED MITRE MAPPING
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

        /* Center Column: Risk Composition Panel */
        .risk-composition-panel {
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 1.15rem;
        }

        .risk-lead-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: #817B73;
          letter-spacing: 0.12em;
        }

        .risk-hero-number {
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1;
          color: #B84D61;
          margin-top: 0.25rem;
        }
        .hero-denom {
          font-size: 1rem;
          color: #817B73;
          margin-left: 0.3rem;
        }

        .risk-prio-lock {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.3rem;
        }
        .lock-label {
          font-size: 0.6rem;
          color: #817B73;
          letter-spacing: 0.1em;
        }

        .risk-bars-stack {
          margin-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .factor-meta {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .factor-name {
          color: #F3EFE8;
        }

        .factor-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.25rem;
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
