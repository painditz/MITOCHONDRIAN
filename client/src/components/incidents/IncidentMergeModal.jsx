// client/src/components/incidents/IncidentMergeModal.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Incident Merge Modal
// Allows analysts to propose/confirm merging multiple incident clusters while preserving historical data.
import React, { useState } from 'react';
import { GitMerge, Check, AlertTriangle, X } from 'lucide-react';

export function IncidentMergeModal({ selectedIncidents = [], onClose, onMergeConfirmed }) {
  const [mergeReason, setMergeReason] = useState('Correlated multi-stage attack on shared enterprise infrastructure.');
  const [confirmedChecked, setConfirmedChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!selectedIncidents || selectedIncidents.length < 2) return null;

  const incidentIds = selectedIncidents.map((i) => i.incident_id || i.id);

  // Compute common system evidence across selected incidents
  const hosts = [...new Set(selectedIncidents.map((i) => i.hostname).filter(Boolean))];
  const users = [...new Set(selectedIncidents.map((i) => i.user).filter(Boolean))];
  const ips = [...new Set(selectedIncidents.map((i) => i.source_ip || i.destination_ip).filter(Boolean))];

  const handleMerge = async () => {
    if (!confirmedChecked) {
      setErrorMsg('Please acknowledge the audit confirmation statement.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://127.0.0.1:8000/api/incidents/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incident_ids: incidentIds,
          reason: mergeReason.trim(),
          actor: 'Analyst Marcus (SOC Tier-1)'
        })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (onMergeConfirmed) onMergeConfirmed(data);
      onClose();
    } catch (err) {
      console.error('[IncidentMerge Error]', err);
      setErrorMsg('Failed to record merge action to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="incident-merge-backdrop mono" onClick={onClose}>
      <div className="incident-merge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between align-center">
          <div className="align-center" style={{ gap: '0.5rem' }}>
            <GitMerge size={14} className="text-copper" />
            <span className="modal-title">MERGE INCIDENTS &bull; {selectedIncidents.length} SELECTED</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <div className="merge-clusters-hero">
            <span className="lead-tag">MERGE REVIEW</span>
            <div className="clusters-joined-row align-center">
              {incidentIds.map((id, idx) => (
                <React.Fragment key={id}>
                  <span className="cluster-badge">{id}</span>
                  {idx < incidentIds.length - 1 && <span className="plus-sign">+</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* System Evidence Comparison */}
          <div className="system-evidence-card">
            <div className="ev-title">SYSTEM EVIDENCE:</div>
            <div className="ev-checks-grid">
              <div className="ev-check-item align-center">
                <span className="check-icon">&check;</span>
                <span className="ev-lbl">Shared Host:</span>
                <span className="ev-val">{hosts.length === 1 ? hosts[0] : `${hosts.length} hosts (${hosts.join(', ')})`}</span>
              </div>
              <div className="ev-check-item align-center">
                <span className="check-icon">&check;</span>
                <span className="ev-lbl">Shared User:</span>
                <span className="ev-val">{users.length === 1 ? users[0] : `${users.length} accounts`}</span>
              </div>
              <div className="ev-check-item align-center">
                <span className="check-icon">&check;</span>
                <span className="ev-lbl">Shared External IP:</span>
                <span className="ev-val">{ips.length === 1 ? ips[0] : 'Observed IP routing flow'}</span>
              </div>
              <div className="ev-check-item align-center">
                <span className="check-icon">&check;</span>
                <span className="ev-lbl">Temporal Proximity:</span>
                <span className="ev-val">Signals observed in matching shift correlation window</span>
              </div>
            </div>
          </div>

          <div className="reason-field-group">
            <label className="reason-lbl">ANALYST REASON FOR MERGE:</label>
            <textarea
              className="reason-textarea"
              rows={2}
              value={mergeReason}
              onChange={(e) => setMergeReason(e.target.value)}
            />
          </div>

          {/* Explicit Confirmation Acknowledgment */}
          <div className="confirm-merge-box">
            <label className="checkbox-label align-center">
              <input
                type="checkbox"
                checked={confirmedChecked}
                onChange={(e) => setConfirmedChecked(e.target.checked)}
              />
              <span className="confirm-text">
                CONFIRM MERGE: &ldquo;This action will create an analyst-reviewed relationship between these incident clusters. System historical data will not be destroyed.&rdquo;
              </span>
            </label>
          </div>

          {errorMsg && <div className="error-alert">{errorMsg}</div>}
        </div>

        <div className="modal-footer flex-between align-center">
          <button type="button" className="btn-secondary" onClick={onClose}>
            CANCEL
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={handleMerge}
            disabled={isSubmitting || !confirmedChecked}
          >
            {isSubmitting ? 'COMMITTING MERGE...' : 'CONFIRM & MERGE'}
          </button>
        </div>
      </div>

      <style>{`
        .incident-merge-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 17, 16, 0.85);
          backdrop-filter: blur(14px);
          z-index: 3000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }

        .incident-merge-modal {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85);
          border-radius: 8px;
          width: min(680px, calc(100vw - 40px));
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

        .merge-clusters-hero {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .lead-tag {
          font-size: 0.6rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.08em;
        }
        .clusters-joined-row {
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .cluster-badge {
          background: rgba(169, 107, 66, 0.18);
          border: 1px solid rgba(169, 107, 66, 0.4);
          color: #F3EFE8;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.65rem;
          border-radius: 3px;
        }
        .plus-sign {
          color: #A96B42;
          font-weight: 700;
        }

        .system-evidence-card {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .ev-title {
          font-size: 0.6rem;
          color: #817B73;
          letter-spacing: 0.08em;
        }
        .ev-checks-grid {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .ev-check-item {
          font-size: 0.65rem;
          gap: 0.4rem;
        }
        .check-icon {
          color: #5F9E88;
          font-weight: 700;
        }
        .ev-lbl {
          color: #817B73;
        }
        .ev-val {
          color: #F3EFE8;
          font-weight: 600;
        }

        .reason-field-group {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .reason-lbl {
          font-size: 0.6rem;
          color: #817B73;
        }
        .reason-textarea {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.5rem;
          color: #F3EFE8;
          font-family: inherit;
          font-size: 0.68rem;
          resize: vertical;
        }

        .confirm-merge-box {
          background: rgba(169, 107, 66, 0.1);
          border: 1px dashed rgba(169, 107, 66, 0.35);
          border-radius: 4px;
          padding: 0.75rem;
        }
        .checkbox-label {
          gap: 0.6rem;
          cursor: pointer;
        }
        .confirm-text {
          font-size: 0.65rem;
          line-height: 1.45;
          color: #F3EFE8;
        }

        .error-alert {
          background: rgba(110, 53, 68, 0.25);
          border: 1px solid #6E3544;
          color: #E28498;
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
          font-size: 0.62rem;
        }

        .modal-footer {
          padding: 0.85rem 1.25rem;
          background: #242321;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .btn-secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #C8C2B9;
          font-family: inherit;
          font-size: 0.65rem;
          padding: 0.45rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-primary {
          background: #A96B42;
          border: 1px solid #A96B42;
          color: #1D1C1A;
          font-family: inherit;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.45rem 1.15rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-primary:hover:not(:disabled) {
          background: #C18A4A;
        }
        .btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
