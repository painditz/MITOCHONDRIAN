// client/src/components/spatial/CorrelationReviewModal.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Graph Correlation Review Modal
// Explicit correlation verification triggered from 3D spatial graph edges.
import React, { useState } from 'react';
import { ArrowLeftRight, Check, X, ShieldAlert } from 'lucide-react';

const CHALLENGE_REASONS = [
  'Incorrect relationship',
  'Coincidental timing',
  'Shared infrastructure',
  'Insufficient evidence',
  'Other'
];

export function CorrelationReviewModal({ edgeData, onClose, onCorrelationReviewed }) {
  const [activeDecision, setActiveDecision] = useState(null);
  const [challengeReason, setChallengeReason] = useState(CHALLENGE_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [analystNote, setAnalystNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!edgeData) return null;

  const sourceId = edgeData.idA || edgeData.source;
  const targetId = edgeData.idB || edgeData.target;
  const evidenceList = edgeData.evidence || [];

  const handleDecision = async (action) => {
    setActiveDecision(action);
    if (action === 'challenge') return; // Wait for reason form

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${sourceId}/correlation-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_incident_id: targetId,
          action: 'accept',
          note: 'Analyst verified correlation link via 3D Graph Console.',
          evidence_types: evidenceList.map((e) => e.title || e.type || 'Shared Observable')
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (onCorrelationReviewed) onCorrelationReviewed(data);
      onClose();
    } catch (err) {
      console.error('[CorrelationReview Error]', err);
      setErrorMsg('Failed to record correlation review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitChallenge = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    const finalReason = challengeReason === 'Other' && customReason.trim() ? customReason.trim() : challengeReason;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${sourceId}/correlation-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_incident_id: targetId,
          action: 'challenge',
          challenge_reason: finalReason,
          note: analystNote.trim(),
          evidence_types: evidenceList.map((e) => e.title || e.type || 'Shared Observable')
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (onCorrelationReviewed) onCorrelationReviewed(data);
      onClose();
    } catch (err) {
      console.error('[CorrelationReview Challenge Error]', err);
      setErrorMsg('Failed to submit correlation challenge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="correlation-review-backdrop mono" onClick={onClose}>
      <div className="correlation-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between align-center">
          <div className="align-center" style={{ gap: '0.5rem' }}>
            <ArrowLeftRight size={14} className="text-copper" />
            <span className="modal-title">CORRELATION REVIEW</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* Pairwise Cluster Identity */}
          <div className="clusters-pair-box flex-between align-center">
            <span className="cluster-tag">{sourceId}</span>
            <span className="pair-arrow">&harr;</span>
            <span className="cluster-tag">{targetId}</span>
          </div>

          {/* System Detection & Observables */}
          <div className="system-detection-box">
            <div className="sys-label">SYSTEM: Correlation detected</div>
            <div className="evidence-rows-list">
              <span className="ev-header">Evidence:</span>
              {evidenceList.length > 0 ? (
                evidenceList.map((ev, i) => (
                  <div key={i} className="ev-row align-center">
                    <span className="bullet">&bull;</span>
                    <span className="ev-type">{ev.title || ev.type}:</span>
                    <span className="ev-val">{ev.value}</span>
                  </div>
                ))
              ) : (
                <div className="ev-row align-center">
                  <span className="bullet">&bull;</span>
                  <span className="ev-val">Deterministic entity overlap in 60-min correlation window</span>
                </div>
              )}
            </div>
          </div>

          {/* Analyst Decision Selection */}
          <div className="analyst-decision-block">
            <div className="ad-label">ANALYST DECISION:</div>
            <div className="ad-btns-row align-center">
              <button
                type="button"
                className={`ad-btn btn-accept ${activeDecision === 'accept' ? 'active' : ''}`}
                onClick={() => handleDecision('accept')}
                disabled={isSubmitting}
              >
                <Check size={12} />
                ACCEPT CORRELATION
              </button>
              <button
                type="button"
                className={`ad-btn btn-reject ${activeDecision === 'challenge' ? 'active' : ''}`}
                onClick={() => handleDecision('challenge')}
                disabled={isSubmitting}
              >
                <X size={12} />
                CHALLENGE / REJECT
              </button>
            </div>
          </div>

          {/* Challenge Reason Form */}
          {activeDecision === 'challenge' && (
            <div className="challenge-expanded-form">
              <div className="cf-title">WHY CHALLENGE THIS CORRELATION?</div>
              <div className="reasons-pill-row">
                {CHALLENGE_REASONS.map((r) => (
                  <label key={r} className={`reason-pill ${challengeReason === r ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="corr_reason"
                      value={r}
                      checked={challengeReason === r}
                      onChange={() => setChallengeReason(r)}
                    />
                    <span className="dot" />
                    <span>{r}</span>
                  </label>
                ))}
              </div>

              {challengeReason === 'Other' && (
                <input
                  type="text"
                  className="cf-input"
                  placeholder="Specify custom challenge reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}

              <textarea
                className="cf-textarea"
                rows={2}
                placeholder="Analyst note (e.g. Traffic is expected egress via central NAT)..."
                value={analystNote}
                onChange={(e) => setAnalystNote(e.target.value)}
              />

              <div className="cf-btn-row flex-between align-center">
                <button
                  type="button"
                  className="cf-cancel-btn"
                  onClick={() => setActiveDecision(null)}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  className="cf-submit-btn"
                  onClick={submitChallenge}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'PERSISTING...' : 'CONFIRM CHALLENGE'}
                </button>
              </div>
            </div>
          )}

          {/* Provenance Guarantee */}
          <div className="provenance-footnote">
            SYSTEM CORRELATION: PRESERVED &bull; PROVENANCE REMAINS FULLY AUDITABLE
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}
        </div>
      </div>

      <style>{`
        .correlation-review-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 17, 16, 0.85);
          backdrop-filter: blur(14px);
          z-index: 3100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .correlation-review-modal {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85);
          border-radius: 8px;
          width: min(580px, calc(100vw - 40px));
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: #F3EFE8;
        }

        .modal-header {
          padding: 0.85rem 1.25rem;
          background: #242321;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .modal-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #F3EFE8;
        }
        .close-btn {
          background: transparent;
          border: none;
          color: #817B73;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .modal-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .clusters-pair-box {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.75rem 1rem;
        }
        .cluster-tag {
          font-size: 0.76rem;
          font-weight: 700;
          color: #A96B42;
          background: rgba(169, 107, 66, 0.15);
          border: 1px solid rgba(169, 107, 66, 0.35);
          padding: 0.25rem 0.65rem;
          border-radius: 3px;
        }
        .pair-arrow {
          color: #817B73;
          font-size: 1.1rem;
        }

        .system-detection-box {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .sys-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: #F3EFE8;
          letter-spacing: 0.06em;
        }
        .evidence-rows-list {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          font-size: 0.65rem;
        }
        .ev-header {
          color: #817B73;
          font-size: 0.6rem;
        }
        .ev-row {
          gap: 0.4rem;
        }
        .bullet {
          color: #A96B42;
        }
        .ev-type {
          color: #817B73;
        }
        .ev-val {
          color: #F3EFE8;
          font-weight: 600;
        }

        .analyst-decision-block {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .ad-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.08em;
        }
        .ad-btns-row {
          gap: 0.6rem;
        }
        .ad-btn {
          flex: 1;
          font-family: inherit;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.5rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          border: 1px solid transparent;
          transition: all 140ms ease;
        }
        .ad-btn.btn-accept {
          background: rgba(95, 158, 136, 0.18);
          border-color: rgba(95, 158, 136, 0.4);
          color: #5F9E88;
        }
        .ad-btn.btn-accept:hover, .ad-btn.btn-accept.active {
          background: #5F9E88;
          color: #1D1C1A;
        }
        .ad-btn.btn-reject {
          background: rgba(110, 53, 68, 0.25);
          border-color: rgba(110, 53, 68, 0.5);
          color: #E28498;
        }
        .ad-btn.btn-reject:hover, .ad-btn.btn-reject.active {
          background: #6E3544;
          color: #F3EFE8;
          border-color: #E28498;
        }

        .challenge-expanded-form {
          background: rgba(110, 53, 68, 0.15);
          border: 1px solid rgba(110, 53, 68, 0.4);
          border-radius: 4px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .cf-title {
          font-size: 0.62rem;
          font-weight: 700;
          color: #E28498;
          letter-spacing: 0.06em;
        }
        .reasons-pill-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
        }
        .reason-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.2rem 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          font-size: 0.6rem;
          cursor: pointer;
          color: #C8C2B9;
        }
        .reason-pill input {
          display: none;
        }
        .reason-pill .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #555;
        }
        .reason-pill.active {
          background: rgba(110, 53, 68, 0.4);
          border-color: #E28498;
          color: #F3EFE8;
        }
        .reason-pill.active .dot {
          background: #E28498;
        }

        .cf-input, .cf-textarea {
          width: 100%;
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.45rem 0.6rem;
          color: #F3EFE8;
          font-family: inherit;
          font-size: 0.65rem;
        }

        .cf-btn-row {
          padding-top: 0.35rem;
        }
        .cf-cancel-btn {
          background: transparent;
          border: none;
          color: #817B73;
          font-size: 0.62rem;
          cursor: pointer;
        }
        .cf-submit-btn {
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

        .provenance-footnote {
          font-size: 0.55rem;
          color: #817B73;
          text-align: center;
          padding-top: 0.25rem;
        }

        .error-alert {
          background: rgba(110, 53, 68, 0.25);
          border: 1px solid #6E3544;
          color: #E28498;
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
          font-size: 0.62rem;
        }
      `}</style>
    </div>
  );
}
