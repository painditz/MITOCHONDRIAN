// client/src/components/incidents/AiBriefReviewPanel.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 AI Brief Review Panel
// Preserves original AI brief and analyst modified brief with full provenance.
import React, { useState, useEffect } from 'react';
import { Check, Edit3, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';

const BRIEF_RATINGS = [
  'Accurate',
  'Mostly accurate',
  'Missing evidence',
  'Incorrect information',
  'Requires modification'
];

export function AiBriefReviewPanel({ incident, onBriefUpdated }) {
  const originalAiBrief =
    incident?.ai_brief_review?.original_ai_brief ||
    incident?.shift_brief?.what_happened ||
    (typeof incident?.ai_brief === 'string' ? incident.ai_brief : '') ||
    'AI Shift Handover Brief unavailable.';

  const currentModifiedBrief =
    incident?.ai_brief_review?.analyst_modified_brief ||
    incident?.shift_brief?.custom_brief_text ||
    null;

  const [rating, setRating] = useState(incident?.ai_brief_review?.rating || 'Accurate');
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(currentModifiedBrief || originalAiBrief);
  const [analystNote, setAnalystNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    if (incident) {
      setRating(incident.ai_brief_review?.rating || 'Accurate');
      setEditText(
        incident.ai_brief_review?.analyst_modified_brief ||
        incident.shift_brief?.custom_brief_text ||
        originalAiBrief
      );
    }
  }, [incident, originalAiBrief]);

  if (!incident) return null;

  const id = incident.incident_id || incident.id;
  const reviewStatus = incident?.ai_brief_review?.status || 'Pending Review';

  const handleAccept = async () => {
    setIsSubmitting(true);
    setFeedbackMsg('');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${id}/ai-brief-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: rating,
          action: 'accept',
          note: analystNote.trim() || 'Analyst accepted AI shift handover brief.'
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setFeedbackMsg('AI Brief accepted and verified in audit record.');
      setIsEditing(false);
      if (onBriefUpdated) onBriefUpdated(data);
    } catch (e) {
      console.error('[AiBriefReview Accept Error]', e);
      setFeedbackMsg('Error accepting brief.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveModification = async () => {
    if (!editText.trim()) return;
    setIsSubmitting(true);
    setFeedbackMsg('');
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${id}/ai-brief-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: rating,
          action: 'modify',
          modified_text: editText.trim(),
          note: analystNote.trim() || 'Analyst modified AI shift brief text.'
        })
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setFeedbackMsg('Modified brief saved with complete provenance.');
      setIsEditing(false);
      if (onBriefUpdated) onBriefUpdated(data);
    } catch (e) {
      console.error('[AiBriefReview Modify Error]', e);
      setFeedbackMsg('Error saving modified brief.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ai-brief-review-root mono">
      <div className="brief-panel-header flex-between">
        <div className="align-center" style={{ gap: '0.5rem' }}>
          <Sparkles size={14} className="sparkle-icon" />
          <span className="panel-title">AI SHIFT-HANDOVER BRIEF</span>
        </div>
        <div className="status-pill align-center">
          <span className="dot" />
          <span>{reviewStatus.toUpperCase()}</span>
        </div>
      </div>

      {/* DUAL DISPLAY: AI GENERATED vs ANALYST MODIFIED */}
      <div className="brief-comparison-container">
        {/* Original AI Brief (Always Available) */}
        <div className="brief-version-card original-card">
          <div className="version-header flex-between">
            <span className="version-tag ai">AI GENERATED (FLAN-T5 LOCAL)</span>
            <span className="zero-egress-tag">ZERO DATA EGRESS</span>
          </div>
          <p className="brief-body-text">{originalAiBrief}</p>
        </div>

        {/* Analyst Modified Brief (If present or editing) */}
        {(currentModifiedBrief || isEditing) && (
          <div className="brief-version-card modified-card">
            <div className="version-header flex-between">
              <span className="version-tag analyst">ANALYST MODIFIED</span>
              <span className="active-tag">AUDIT VERIFIED</span>
            </div>
            {isEditing ? (
              <textarea
                className="edit-brief-textarea"
                rows={4}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Edit the shift brief text directly..."
              />
            ) : (
              <p className="brief-body-text modified-text">{currentModifiedBrief}</p>
            )}
          </div>
        )}
      </div>

      {/* AI BRIEF REVIEW CONTROLS */}
      <div className="brief-review-controls">
        <div className="controls-lead">AI BRIEF REVIEW</div>

        {/* Rating Options */}
        <div className="ratings-row">
          {BRIEF_RATINGS.map((r) => (
            <label key={r} className={`rating-pill ${rating === r ? 'active' : ''}`}>
              <input
                type="radio"
                name="brief_rating"
                value={r}
                checked={rating === r}
                onChange={() => setRating(r)}
              />
              <span className="pill-dot" />
              <span>{r}</span>
            </label>
          ))}
        </div>

        {/* Note input if modifying or clarifying */}
        <div className="brief-note-input-row">
          <input
            type="text"
            className="brief-note-input"
            placeholder="Analyst reasoning for brief rating or modification..."
            value={analystNote}
            onChange={(e) => setAnalystNote(e.target.value)}
          />
        </div>

        {/* Actions Row */}
        <div className="actions-button-row flex-between align-center">
          <div className="feedback-slot">
            {feedbackMsg && <span className="feedback-text">{feedbackMsg}</span>}
          </div>

          <div className="align-center" style={{ gap: '0.6rem' }}>
            {!isEditing ? (
              <>
                <button
                  type="button"
                  className="brief-btn btn-modify"
                  onClick={() => setIsEditing(true)}
                  disabled={isSubmitting}
                >
                  <Edit3 size={12} />
                  MODIFY BRIEF
                </button>
                <button
                  type="button"
                  className="brief-btn btn-accept"
                  onClick={handleAccept}
                  disabled={isSubmitting}
                >
                  <Check size={12} />
                  ACCEPT BRIEF
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="brief-btn btn-cancel"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  className="brief-btn btn-save"
                  onClick={handleSaveModification}
                  disabled={isSubmitting || !editText.trim()}
                >
                  SAVE MODIFICATION
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .ai-brief-review-root {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          color: #F3EFE8;
        }

        .brief-panel-header {
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .sparkle-icon {
          color: #A96B42;
        }
        .panel-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #F3EFE8;
        }

        .status-pill {
          font-size: 0.6rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          gap: 0.35rem;
          color: #A7A096;
        }
        .status-pill .dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #A96B42;
        }

        .brief-comparison-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .brief-version-card {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.85rem;
        }
        .brief-version-card.original-card {
          border-left: 3px solid #394149;
        }
        .brief-version-card.modified-card {
          border-left: 3px solid #A96B42;
          background: rgba(36, 35, 33, 0.95);
        }

        .version-header {
          margin-bottom: 0.5rem;
        }
        .version-tag {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.1rem 0.35rem;
          border-radius: 2px;
        }
        .version-tag.ai {
          background: rgba(57, 65, 73, 0.5);
          color: #C8C2B9;
        }
        .version-tag.analyst {
          background: rgba(169, 107, 66, 0.2);
          color: #A96B42;
        }
        .zero-egress-tag, .active-tag {
          font-size: 0.55rem;
          color: #817B73;
        }

        .brief-body-text {
          font-size: 0.76rem;
          line-height: 1.55;
          color: #F3EFE8;
          margin: 0;
        }
        .modified-text {
          color: #F3EFE8;
        }

        .edit-brief-textarea {
          width: 100%;
          background: #1D1C1A;
          border: 1px solid rgba(169, 107, 66, 0.4);
          border-radius: 4px;
          color: #F3EFE8;
          font-family: inherit;
          font-size: 0.76rem;
          line-height: 1.55;
          padding: 0.6rem;
          resize: vertical;
        }

        /* Review controls */
        .brief-review-controls {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 4px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .controls-lead {
          font-size: 0.62rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.08em;
        }

        .ratings-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }
        .rating-pill {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.25rem 0.55rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.62rem;
          color: #C8C2B9;
        }
        .rating-pill input {
          display: none;
        }
        .pill-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #555;
        }
        .rating-pill.active {
          background: rgba(169, 107, 66, 0.18);
          border-color: #A96B42;
          color: #F3EFE8;
        }
        .rating-pill.active .pill-dot {
          background: #A96B42;
        }

        .brief-note-input {
          width: 100%;
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 0.45rem 0.65rem;
          font-size: 0.68rem;
          color: #F3EFE8;
          font-family: inherit;
        }

        .brief-btn {
          font-family: inherit;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.45rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 140ms ease;
          border: 1px solid transparent;
        }
        .btn-accept {
          background: rgba(95, 158, 136, 0.18);
          border-color: rgba(95, 158, 136, 0.4);
          color: #5F9E88;
        }
        .btn-accept:hover:not(:disabled) {
          background: #5F9E88;
          color: #1D1C1A;
        }
        .btn-modify {
          background: rgba(169, 107, 66, 0.18);
          border-color: rgba(169, 107, 66, 0.4);
          color: #A96B42;
        }
        .btn-modify:hover:not(:disabled) {
          background: #A96B42;
          color: #1D1C1A;
        }
        .btn-save {
          background: #A96B42;
          color: #1D1C1A;
          border-color: #A96B42;
        }
        .btn-cancel {
          background: transparent;
          border-color: rgba(255, 255, 255, 0.15);
          color: #C8C2B9;
        }
        .feedback-text {
          font-size: 0.62rem;
          color: #5F9E88;
        }
      `}</style>
    </div>
  );
}
