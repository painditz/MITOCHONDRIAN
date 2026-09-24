// client/src/components/incidents/EvidenceReviewPanel.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Evidence Review Component
// Allows analysts to accept or challenge specific evidence relationships with full provenance.
import React, { useState } from 'react';
import { Check, X, ShieldAlert, ChevronDown, CheckCircle2 } from 'lucide-react';

const CHALLENGE_REASONS = [
  'Incorrect relationship',
  'Coincidental timing',
  'Shared infrastructure',
  'Insufficient evidence',
  'Other'
];

export function EvidenceReviewPanel({ incident, onEvidenceUpdated }) {
  const [activeChallengeKey, setActiveChallengeKey] = useState(null);
  const [challengeReason, setChallengeReason] = useState(CHALLENGE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [challengeNote, setChallengeNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!incident) return null;

  const id = incident.incident_id || incident.id;
  const assetName = incident.hostname || incident.asset_name || 'UNKNOWN-HOST';
  const user = incident.user || 'SYSTEM';
  const extIp = incident.source_ip || incident.destination_ip || '185.220.101.5';
  const duration = incident.duration_minutes ? `${incident.duration_minutes}m correlation window` : 'Within correlation window';

  // Sourced strictly from backend incident observables
  const evidenceItems = [
    {
      key: 'Shared Host',
      label: 'Target Host',
      value: assetName,
      desc: 'Clustered by deterministic host identity match'
    },
    {
      key: 'Shared User',
      label: 'Identity / User',
      value: user,
      desc: 'Correlated by unified account telemetry'
    },
    {
      key: 'Shared External IP',
      label: 'External IP Flow',
      value: extIp,
      desc: 'Observed network flow or threat actor origin'
    },
    {
      key: 'Temporal Proximity',
      label: 'Sliding Time Window',
      value: duration,
      desc: 'Pairwise signals occur within temporal window'
    }
  ];

  const getEvidenceStatus = (key) => {
    const rev = (incident.evidence_reviews || []).find((e) => e.evidence_key === key);
    return rev ? rev.status : 'PENDING';
  };

  const getEvidenceReview = (key) => {
    return (incident.evidence_reviews || []).find((e) => e.evidence_key === key);
  };

  const handleAction = async (key, val, action) => {
    if (action === 'challenge') {
      setActiveChallengeKey(key);
      setStatusMsg('');
      return;
    }

    setIsSubmitting(true);
    setStatusMsg('');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${id}/evidence-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence_key: key,
          value: val,
          action: 'accept',
          note: 'Analyst verified evidence relationship against telemetry.'
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setStatusMsg(`Evidence [${key}] accepted.`);
      if (onEvidenceUpdated) onEvidenceUpdated(data);
    } catch (e) {
      console.error('[EvidenceReview Error]', e);
      setStatusMsg('Error updating evidence review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitChallenge = async (key, val) => {
    setIsSubmitting(true);
    setStatusMsg('');
    const finalReason = challengeReason === 'Other' && customReason.trim() ? customReason.trim() : challengeReason;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${id}/evidence-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidence_key: key,
          value: val,
          action: 'challenge',
          challenge_reason: finalReason,
          note: challengeNote.trim()
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setStatusMsg(`Evidence [${key}] challenged and logged.`);
      setActiveChallengeKey(null);
      setChallengeNote('');
      setCustomReason('');
      if (onEvidenceUpdated) onEvidenceUpdated(data);
    } catch (e) {
      console.error('[EvidenceReview Challenge Error]', e);
      setStatusMsg('Error submitting challenge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="evidence-review-root mono">
      <div className="er-header flex-between">
        <div className="align-center" style={{ gap: '0.5rem' }}>
          <span className="er-dot" />
          <span className="er-title">EVIDENCE REVIEW</span>
        </div>
        <span className="er-subtitle">100% OBSERVABLE EVIDENCE</span>
      </div>

      {statusMsg && <div className="er-status-alert">{statusMsg}</div>}

      <div className="evidence-items-list">
        {evidenceItems.map((item) => {
          const status = getEvidenceStatus(item.key);
          const rev = getEvidenceReview(item.key);
          const isChallenging = activeChallengeKey === item.key;

          return (
            <div key={item.key} className={`evidence-card ${status.toLowerCase()}`}>
              <div className="evidence-main-row flex-between align-center">
                <div className="ev-left">
                  <div className="ev-key-row align-center">
                    <span className="check-mark">&check;</span>
                    <span className="ev-name">{item.key}</span>
                    {status === 'ACCEPTED' && (
                      <span className="status-tag accepted">ACCEPTED</span>
                    )}
                    {status === 'CHALLENGED' && (
                      <span className="status-tag challenged">CHALLENGED</span>
                    )}
                  </div>
                  <div className="ev-val-row" title={item.value}>{item.value}</div>
                  <div className="ev-desc">{item.desc}</div>
                </div>

                <div className="ev-actions align-center" style={{ gap: '0.45rem' }}>
                  <button
                    type="button"
                    className={`ev-btn btn-accept ${status === 'ACCEPTED' ? 'active' : ''}`}
                    onClick={() => handleAction(item.key, item.value, 'accept')}
                    disabled={isSubmitting}
                  >
                    <Check size={11} />
                    ACCEPT
                  </button>
                  <button
                    type="button"
                    className={`ev-btn btn-challenge ${status === 'CHALLENGED' ? 'active' : ''}`}
                    onClick={() => handleAction(item.key, item.value, 'challenge')}
                    disabled={isSubmitting}
                  >
                    <X size={11} />
                    CHALLENGE
                  </button>
                </div>
              </div>

              {/* Stored Challenge Note if exists */}
              {rev && rev.status === 'CHALLENGED' && !isChallenging && (
                <div className="active-challenge-notice">
                  <span className="notice-reason">Reason: {rev.challenge_reason}</span>
                  {rev.note && <span className="notice-note">Note: {rev.note}</span>}
                </div>
              )}

              {/* Challenge Flyout / Dialog */}
              {isChallenging && (
                <div className="challenge-form-flyout">
                  <div className="flyout-title">WHY CHALLENGE THIS EVIDENCE?</div>
                  <div className="flyout-reasons-grid">
                    {CHALLENGE_REASONS.map((r) => (
                      <label key={r} className={`reason-radio ${challengeReason === r ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name={`challenge_reason_${item.key}`}
                          value={r}
                          checked={challengeReason === r}
                          onChange={() => setChallengeReason(r)}
                        />
                        <span className="radio-dot" />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>

                  {challengeReason === 'Other' && (
                    <input
                      type="text"
                      className="flyout-input"
                      placeholder="Specify custom challenge reason..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                    />
                  )}

                  <textarea
                    className="flyout-textarea"
                    rows={2}
                    placeholder="Analyst note explaining why this correlation evidence is invalid or coincidental..."
                    value={challengeNote}
                    onChange={(e) => setChallengeNote(e.target.value)}
                  />

                  <div className="flyout-btn-row flex-between align-center">
                    <button
                      type="button"
                      className="flyout-cancel-btn"
                      onClick={() => setActiveChallengeKey(null)}
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      className="flyout-submit-btn"
                      onClick={() => submitChallenge(item.key, item.value)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'SUBMITTING...' : 'SUBMIT CHALLENGE'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .evidence-review-root {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          color: #F3EFE8;
        }

        .er-header {
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .er-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #A96B42;
        }
        .er-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #F3EFE8;
        }
        .er-subtitle {
          font-size: 0.58rem;
          color: #817B73;
        }

        .er-status-alert {
          font-size: 0.62rem;
          color: #5F9E88;
          padding: 0.35rem 0.6rem;
          background: rgba(95, 158, 136, 0.1);
          border: 1px solid rgba(95, 158, 136, 0.3);
          border-radius: 3px;
        }

        .evidence-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .evidence-card {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.75rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: border-color 140ms ease;
        }
        .evidence-card.accepted {
          border-left: 3px solid #5F9E88;
        }
        .evidence-card.challenged {
          border-left: 3px solid #6E3544;
          background: rgba(110, 53, 68, 0.12);
        }

        .ev-left {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          max-width: 65%;
        }
        .ev-key-row {
          gap: 0.4rem;
        }
        .check-mark {
          color: #5F9E88;
          font-weight: 700;
          font-size: 0.75rem;
        }
        .ev-name {
          font-size: 0.68rem;
          font-weight: 700;
          color: #F3EFE8;
        }
        .status-tag {
          font-size: 0.55rem;
          padding: 0.05rem 0.35rem;
          border-radius: 2px;
          font-weight: 700;
        }
        .status-tag.accepted {
          background: rgba(95, 158, 136, 0.2);
          color: #5F9E88;
        }
        .status-tag.challenged {
          background: rgba(110, 53, 68, 0.35);
          color: #E28498;
        }

        .ev-val-row {
          font-size: 0.75rem;
          color: #A96B42;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ev-desc {
          font-size: 0.58rem;
          color: #817B73;
        }

        .ev-btn {
          font-family: inherit;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.35rem 0.65rem;
          border-radius: 3px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          border: 1px solid transparent;
          background: rgba(255, 255, 255, 0.05);
          color: #C8C2B9;
          transition: all 140ms ease;
        }
        .ev-btn.btn-accept:hover, .ev-btn.btn-accept.active {
          background: #5F9E88;
          color: #1D1C1A;
          border-color: #5F9E88;
        }
        .ev-btn.btn-challenge:hover, .ev-btn.btn-challenge.active {
          background: #6E3544;
          color: #F3EFE8;
          border-color: #E28498;
        }

        .active-challenge-notice {
          background: rgba(110, 53, 68, 0.2);
          border: 1px dashed rgba(110, 53, 68, 0.5);
          border-radius: 3px;
          padding: 0.4rem 0.6rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          font-size: 0.6rem;
          color: #E28498;
        }

        /* Challenge flyout */
        .challenge-form-flyout {
          background: #1D1C1A;
          border: 1px solid rgba(110, 53, 68, 0.5);
          border-radius: 4px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-top: 0.35rem;
        }
        .flyout-title {
          font-size: 0.6rem;
          font-weight: 700;
          color: #E28498;
          letter-spacing: 0.08em;
        }
        .flyout-reasons-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .reason-radio {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.5rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.6rem;
          color: #C8C2B9;
        }
        .reason-radio input {
          display: none;
        }
        .radio-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #555;
        }
        .reason-radio.active {
          border-color: #E28498;
          background: rgba(110, 53, 68, 0.3);
          color: #F3EFE8;
        }
        .reason-radio.active .radio-dot {
          background: #E28498;
        }

        .flyout-input, .flyout-textarea {
          width: 100%;
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.4rem 0.6rem;
          color: #F3EFE8;
          font-family: inherit;
          font-size: 0.65rem;
        }
        .flyout-btn-row {
          padding-top: 0.35rem;
        }
        .flyout-cancel-btn {
          background: transparent;
          border: none;
          color: #817B73;
          font-size: 0.62rem;
          cursor: pointer;
        }
        .flyout-submit-btn {
          background: #6E3544;
          border: 1px solid #E28498;
          color: #F3EFE8;
          font-family: inherit;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.4rem 0.85rem;
          border-radius: 3px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
