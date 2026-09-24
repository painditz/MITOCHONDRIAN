// client/src/components/incidents/AnalystDecisionCenter.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Analyst Decision Center
// Explicit separation between automated system recommendation and final analyst judgment.
import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertOctagon, ArrowUpRight, HelpCircle, Edit3, CheckCircle, ChevronDown } from 'lucide-react';

const REASON_OPTIONS = [
  'Evidence supports system assessment',
  'Asset criticality requires escalation',
  'Correlation is valid',
  'Correlation appears incorrect',
  'AI brief is incomplete',
  'AI brief contains incorrect information',
  'Insufficient evidence',
  'False positive',
  'Duplicate incident',
  'Other'
];

export function AnalystDecisionCenter({ incident, onDecisionSubmitted }) {
  const [selectedDecision, setSelectedDecision] = useState(incident?.analyst_decision || null);
  const [confidence, setConfidence] = useState(incident?.analyst_confidence || 'HIGH');
  const [reason, setReason] = useState(incident?.analyst_reason || REASON_OPTIONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [analystNote, setAnalystNote] = useState('');
  const [priorityOverride, setPriorityOverride] = useState(incident?.analyst_priority_override || '');
  const [priorityReason, setPriorityReason] = useState(incident?.analyst_priority_reason || '');
  const [showOverrideControls, setShowOverrideControls] = useState(Boolean(incident?.analyst_priority_override));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (incident) {
      setSelectedDecision(incident.analyst_decision || null);
      setConfidence(incident.analyst_confidence || 'HIGH');
      setReason(incident.analyst_reason || REASON_OPTIONS[0]);
      setPriorityOverride(incident.analyst_priority_override || '');
      setPriorityReason(incident.analyst_priority_reason || '');
      setShowOverrideControls(Boolean(incident.analyst_priority_override));
    }
  }, [incident]);

  if (!incident) return null;

  const id = incident.incident_id || incident.id;
  const sysPriority = (incident.priority || 'P1').slice(0, 2).toUpperCase();
  const sysRisk = Number(incident.risk_score ?? incident.riskScore ?? 0);
  const assetName = incident.hostname || incident.asset_name || 'UNKNOWN-ASSET';
  const assetCrit = (incident.asset_criticality || 'MEDIUM').toUpperCase();
  const currentStatus = (incident.investigation_status || 'NEEDS REVIEW').toUpperCase();

  const handleDecisionSelect = (decision) => {
    setSelectedDecision(decision);
    setStatusMessage('');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedDecision) {
      setStatusMessage('Please select a decision action before submitting.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');

    const finalReason = reason === 'Other' && customReason.trim() ? customReason.trim() : reason;

    const payload = {
      action: selectedDecision.toLowerCase(),
      confidence: confidence,
      reason: finalReason,
      note: analystNote.trim(),
      priority_override: priorityOverride ? priorityOverride : null,
      priority_reason: priorityOverride ? (priorityReason.trim() || finalReason) : null,
      elapsed_seconds: 5.0,
      actor: 'Analyst Marcus (SOC Tier-1)'
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setStatusMessage(`Decision recorded and persisted for ${id}.`);
      setAnalystNote('');
      if (onDecisionSubmitted) {
        onDecisionSubmitted(data.incident);
      }
    } catch (err) {
      console.error('[Decision Center Error]', err);
      setStatusMessage('Failed to persist decision to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status badge styling using design palette
  const getBadgeClass = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'badge-confirmed';
      case 'REJECTED': return 'badge-rejected';
      case 'ESCALATED': return 'badge-escalated';
      case 'NEEDS MORE EVIDENCE': return 'badge-evidence';
      case 'INVESTIGATED': return 'badge-investigated';
      case 'IN REVIEW': return 'badge-inreview';
      case 'NEW':
      case 'NEEDS REVIEW':
      default: return 'badge-needsreview';
    }
  };

  return (
    <div className="analyst-decision-center-root mono">
      {/* Header with Status Badge */}
      <div className="adc-header flex-between">
        <div className="adc-header-left align-center">
          <span className="adc-indicator-dot" />
          <span className="adc-title">ANALYST DECISION CENTER</span>
        </div>
        <div className={`adc-status-badge ${getBadgeClass(currentStatus)}`}>
          {currentStatus}
        </div>
      </div>

      {/* SYSTEM RECOMMENDATION vs PROVENANCE */}
      <div className="adc-system-rec-box">
        <div className="rec-box-header flex-between">
          <span className="rec-label">SYSTEM RECOMMENDATION</span>
          <span className="rec-tag">AUTOMATED ASSESSMENT</span>
        </div>
        <div className="rec-grid">
          <div className="rec-item">
            <span className="rec-k">Priority</span>
            <span className="rec-v prio-highlight">{sysPriority}</span>
          </div>
          <div className="rec-item">
            <span className="rec-k">Calculated Risk</span>
            <span className="rec-v">{sysRisk.toFixed(1)} / 100</span>
          </div>
          <div className="rec-item">
            <span className="rec-k">Target Asset</span>
            <span className="rec-v text-truncate" title={assetName}>{assetName}</span>
          </div>
          <div className="rec-item">
            <span className="rec-k">Asset Criticality</span>
            <span className="rec-v">{assetCrit}</span>
          </div>
        </div>
      </div>

      {/* PRIORITY OVERRIDE SECTION */}
      <div className="adc-override-strip">
        <div className="override-header flex-between">
          <div className="align-center" style={{ gap: '0.5rem' }}>
            <span className="override-label">SYSTEM PRIORITY:</span>
            <span className="override-val sys">{sysPriority}</span>
            <span className="override-sep">&bull;</span>
            <span className="override-label">ANALYST PRIORITY:</span>
            <span className="override-val analyst">
              {incident.analyst_priority_override || (priorityOverride ? `${priorityOverride} (Pending)` : 'None (System Default)')}
            </span>
          </div>
          <button
            type="button"
            className="override-toggle-btn"
            onClick={() => setShowOverrideControls(!showOverrideControls)}
          >
            {showOverrideControls ? 'Hide Override' : 'Override Priority'}
          </button>
        </div>

        {showOverrideControls && (
          <div className="override-controls-body">
            <div className="override-btns-row align-center">
              <span className="ctrl-label">SET PRIORITY:</span>
              {['P1', 'P2', 'P3', 'P4'].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`prio-choice-btn ${priorityOverride === p ? 'active' : ''}`}
                  onClick={() => setPriorityOverride(priorityOverride === p ? '' : p)}
                >
                  {p}
                </button>
              ))}
              {priorityOverride && (
                <button
                  type="button"
                  className="prio-choice-btn clear"
                  onClick={() => { setPriorityOverride(''); setPriorityReason(''); }}
                >
                  RESET
                </button>
              )}
            </div>
            {priorityOverride && (
              <div className="override-reason-field">
                <input
                  type="text"
                  placeholder="Reason for priority override (e.g. Critical executive email gateway)..."
                  value={priorityReason}
                  onChange={(e) => setPriorityReason(e.target.value)}
                  className="adc-input"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ANALYST DECISION BUTTONS */}
      <div className="adc-decision-section">
        <div className="decision-lead-label">ANALYST DECISION</div>
        <div className="decision-actions-row">
          <button
            type="button"
            className={`decision-btn btn-confirm ${selectedDecision === 'CONFIRM' ? 'active' : ''}`}
            onClick={() => handleDecisionSelect('CONFIRM')}
          >
            <ShieldCheck size={13} />
            CONFIRM
          </button>
          <button
            type="button"
            className={`decision-btn btn-reject ${selectedDecision === 'REJECT' ? 'active' : ''}`}
            onClick={() => handleDecisionSelect('REJECT')}
          >
            <AlertOctagon size={13} />
            REJECT
          </button>
          <button
            type="button"
            className={`decision-btn btn-escalate ${selectedDecision === 'ESCALATE' ? 'active' : ''}`}
            onClick={() => handleDecisionSelect('ESCALATE')}
          >
            <ArrowUpRight size={13} />
            ESCALATE
          </button>
          <button
            type="button"
            className={`decision-btn btn-evidence ${selectedDecision === 'NEED MORE EVIDENCE' ? 'active' : ''}`}
            onClick={() => handleDecisionSelect('NEED MORE EVIDENCE')}
          >
            <HelpCircle size={13} />
            NEED MORE EVIDENCE
          </button>
          <button
            type="button"
            className={`decision-btn btn-modify ${selectedDecision === 'MODIFY' ? 'active' : ''}`}
            onClick={() => handleDecisionSelect('MODIFY')}
          >
            <Edit3 size={13} />
            MODIFY
          </button>
        </div>
      </div>

      {/* EXPANDED DECISION METADATA & REASON FORM */}
      <form onSubmit={handleSubmit} className="adc-form-section">
        {/* Analyst Confidence Selector */}
        <div className="form-group confidence-group">
          <span className="form-label">ANALYST CONFIDENCE</span>
          <div className="confidence-radio-row align-center">
            {['LOW', 'MEDIUM', 'HIGH'].map((level) => (
              <label key={level} className={`confidence-pill ${confidence === level ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="analyst_confidence"
                  value={level}
                  checked={confidence === level}
                  onChange={() => setConfidence(level)}
                />
                <span className="dot" />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reason for Decision Dropdown */}
        <div className="form-group reason-group">
          <label className="form-label" htmlFor="decision-reason-select">
            REASON FOR DECISION
          </label>
          <div className="select-wrapper">
            <select
              id="decision-reason-select"
              className="adc-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              {REASON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
          {reason === 'Other' && (
            <input
              type="text"
              className="adc-input custom-reason-input"
              placeholder="Specify custom reason..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
            />
          )}
        </div>

        {/* Analyst Note Multiline */}
        <div className="form-group note-group">
          <label className="form-label" htmlFor="adc-analyst-note">
            ANALYST NOTE
          </label>
          <textarea
            id="adc-analyst-note"
            className="adc-textarea"
            rows={2}
            placeholder="Add forensic notes, observable justifications, or verification steps..."
            value={analystNote}
            onChange={(e) => setAnalystNote(e.target.value)}
          />
        </div>

        {/* Submit Decision Button */}
        <div className="form-submit-row flex-between align-center">
          <div className="submit-feedback-text">
            {statusMessage && <span className="feedback-span">{statusMessage}</span>}
          </div>
          <button
            type="submit"
            className="submit-decision-btn"
            disabled={isSubmitting || !selectedDecision}
          >
            {isSubmitting ? 'PERSISTING DECISION...' : 'SUBMIT DECISION'}
          </button>
        </div>
      </form>

      <style>{`
        .analyst-decision-center-root {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          color: #F3EFE8;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .adc-header {
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .adc-indicator-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #A96B42;
          box-shadow: 0 0 8px rgba(169, 107, 66, 0.6);
          margin-right: 0.5rem;
        }
        .adc-title {
          font-size: 0.72rem;
          font-weight: 700;
          color: #F3EFE8;
          letter-spacing: 0.12em;
        }

        /* Explicit Status Badges */
        .adc-status-badge {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
          letter-spacing: 0.06em;
          border: 1px solid transparent;
        }
        .badge-confirmed {
          background: rgba(95, 158, 136, 0.15);
          color: #5F9E88;
          border-color: rgba(95, 158, 136, 0.4);
        }
        .badge-rejected {
          background: rgba(110, 53, 68, 0.25);
          color: #E28498;
          border-color: rgba(110, 53, 68, 0.5);
        }
        .badge-escalated {
          background: rgba(169, 107, 66, 0.2);
          color: #C18A4A;
          border-color: rgba(169, 107, 66, 0.45);
        }
        .badge-evidence {
          background: rgba(57, 65, 73, 0.4);
          color: #C8C2B9;
          border-color: rgba(255, 255, 255, 0.2);
        }
        .badge-investigated {
          background: rgba(95, 158, 136, 0.25);
          color: #F3EFE8;
          border-color: #5F9E88;
        }
        .badge-inreview, .badge-needsreview {
          background: rgba(169, 107, 66, 0.15);
          color: #A96B42;
          border-color: rgba(169, 107, 66, 0.35);
        }

        /* System Rec Box */
        .adc-system-rec-box {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.75rem 0.9rem;
        }
        .rec-box-header {
          font-size: 0.6rem;
          color: #817B73;
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }
        .rec-tag {
          font-size: 0.55rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
        }
        .rec-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }
        .rec-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .rec-k {
          font-size: 0.58rem;
          color: #817B73;
          text-transform: uppercase;
        }
        .rec-v {
          font-size: 0.75rem;
          font-weight: 600;
          color: #F3EFE8;
        }
        .rec-v.prio-highlight {
          color: #A96B42;
          font-weight: 700;
        }

        /* Override Strip */
        .adc-override-strip {
          background: rgba(36, 35, 33, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 0.6rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .override-label {
          font-size: 0.62rem;
          color: #817B73;
        }
        .override-val.sys {
          font-size: 0.68rem;
          font-weight: 700;
          color: #C8C2B9;
        }
        .override-val.analyst {
          font-size: 0.68rem;
          font-weight: 700;
          color: #A96B42;
        }
        .override-sep {
          color: #555;
        }
        .override-toggle-btn {
          background: transparent;
          border: none;
          color: #A96B42;
          font-size: 0.62rem;
          cursor: pointer;
          text-decoration: underline;
        }
        .override-toggle-btn:hover {
          color: #F3EFE8;
        }
        .override-controls-body {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 0.4rem;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
        }
        .ctrl-label {
          font-size: 0.6rem;
          color: #817B73;
          margin-right: 0.4rem;
        }
        .prio-choice-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #C8C2B9;
          font-size: 0.62rem;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
          cursor: pointer;
          margin-right: 0.35rem;
        }
        .prio-choice-btn:hover {
          border-color: #A96B42;
          color: #F3EFE8;
        }
        .prio-choice-btn.active {
          background: #A96B42;
          color: #1D1C1A;
          border-color: #A96B42;
          font-weight: 700;
        }
        .prio-choice-btn.clear {
          background: rgba(110, 53, 68, 0.2);
          color: #E28498;
          border-color: rgba(110, 53, 68, 0.4);
        }

        /* Decision Section */
        .adc-decision-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .decision-lead-label {
          font-size: 0.64rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.1em;
        }
        .decision-actions-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .decision-btn {
          flex: 1;
          min-width: 105px;
          padding: 0.55rem 0.65rem;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: all 140ms ease;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.05);
          color: #C8C2B9;
        }

        /* Positive Confirmation: Muted green */
        .btn-confirm {
          border-color: rgba(95, 158, 136, 0.35);
        }
        .btn-confirm:hover, .btn-confirm.active {
          background: #5F9E88;
          color: #1D1C1A;
          border-color: #5F9E88;
          box-shadow: 0 0 10px rgba(95, 158, 136, 0.4);
        }

        /* Danger / Rejection: Muted burgundy */
        .btn-reject {
          border-color: rgba(110, 53, 68, 0.5);
        }
        .btn-reject:hover, .btn-reject.active {
          background: #6E3544;
          color: #F3EFE8;
          border-color: #E28498;
          box-shadow: 0 0 10px rgba(110, 53, 68, 0.5);
        }

        /* Primary Action: Warm copper */
        .btn-escalate {
          border-color: rgba(169, 107, 66, 0.4);
        }
        .btn-escalate:hover, .btn-escalate.active {
          background: #A96B42;
          color: #1D1C1A;
          border-color: #A96B42;
          box-shadow: 0 0 10px rgba(169, 107, 66, 0.4);
        }

        /* Neutral: Slate */
        .btn-evidence, .btn-modify {
          border-color: rgba(57, 65, 73, 0.7);
        }
        .btn-evidence:hover, .btn-evidence.active,
        .btn-modify:hover, .btn-modify.active {
          background: #394149;
          color: #F3EFE8;
          border-color: #C8C2B9;
        }

        /* Form section */
        .adc-form-section {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          padding-top: 0.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .form-label {
          font-size: 0.6rem;
          color: #817B73;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* Confidence Radios */
        .confidence-radio-row {
          gap: 0.6rem;
        }
        .confidence-pill {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.25rem 0.65rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.62rem;
          color: #A7A096;
        }
        .confidence-pill input {
          display: none;
        }
        .confidence-pill .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #555;
        }
        .confidence-pill.active {
          border-color: #A96B42;
          background: rgba(169, 107, 66, 0.18);
          color: #F3EFE8;
        }
        .confidence-pill.active .dot {
          background: #A96B42;
        }

        /* Inputs & Selects */
        .select-wrapper {
          position: relative;
        }
        .adc-select {
          width: 100%;
          appearance: none;
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.45rem 2rem 0.45rem 0.75rem;
          color: #F3EFE8;
          font-size: 0.68rem;
          font-family: inherit;
        }
        .select-chevron {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #817B73;
        }
        .adc-input {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.45rem 0.75rem;
          color: #F3EFE8;
          font-size: 0.68rem;
          font-family: inherit;
          width: 100%;
        }
        .custom-reason-input {
          margin-top: 0.35rem;
        }
        .adc-textarea {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.5rem 0.75rem;
          color: #F3EFE8;
          font-size: 0.68rem;
          font-family: inherit;
          resize: vertical;
        }

        .submit-decision-btn {
          background: #A96B42;
          border: 1px solid #A96B42;
          color: #1D1C1A;
          font-family: inherit;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.55rem 1.25rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
        }
        .submit-decision-btn:hover:not(:disabled) {
          background: #C18A4A;
          box-shadow: 0 0 12px rgba(169, 107, 66, 0.5);
        }
        .submit-decision-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .feedback-span {
          font-size: 0.62rem;
          color: #5F9E88;
        }
      `}</style>
    </div>
  );
}
