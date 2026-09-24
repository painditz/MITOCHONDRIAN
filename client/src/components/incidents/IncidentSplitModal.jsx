// client/src/components/incidents/IncidentSplitModal.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Incident Split Modal
// Allows analysts to propose cluster splits into sub-incidents while preserving original system grouping.
import React, { useState } from 'react';
import { Scissors, Check, X, AlertTriangle } from 'lucide-react';

export function IncidentSplitModal({ incident, onClose, onSplitConfirmed }) {
  const [selectedAlertIds, setSelectedAlertIds] = useState(new Set());
  const [showReviewStep, setShowReviewStep] = useState(false);
  const [splitReason, setSplitReason] = useState('Separate attack vectors identified across distinct subnets.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!incident) return null;

  const id = incident.incident_id || incident.id;
  const alerts = incident.alerts || [];

  const toggleAlert = (alertId) => {
    const next = new Set(selectedAlertIds);
    if (next.has(alertId)) next.delete(alertId);
    else next.add(alertId);
    setSelectedAlertIds(next);
  };

  const handleCreateProposal = () => {
    if (selectedAlertIds.size === 0) {
      setErrorMsg('Please select at least 1 alert to split out.');
      return;
    }
    if (selectedAlertIds.size === alerts.length) {
      setErrorMsg('Cannot split all alerts into the new group. At least 1 alert must remain in the primary group.');
      return;
    }
    setErrorMsg('');
    setShowReviewStep(true);
  };

  const handleConfirmSplit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');

    const clusterAAlerts = alerts.filter((a) => !selectedAlertIds.has(a.alert_id)).map((a) => a.alert_id);
    const clusterBAlerts = alerts.filter((a) => selectedAlertIds.has(a.alert_id)).map((a) => a.alert_id);

    const payload = {
      clusters: [
        { name: `${id}-A`, alert_count: clusterAAlerts.length, alert_ids: clusterAAlerts },
        { name: `${id}-B`, alert_count: clusterBAlerts.length, alert_ids: clusterBAlerts }
      ],
      reason: splitReason.trim()
    };

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/incidents/${id}/split`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (onSplitConfirmed) onSplitConfirmed(data);
      onClose();
    } catch (err) {
      console.error('[IncidentSplit Error]', err);
      setErrorMsg('Failed to record split proposal to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="incident-split-backdrop mono" onClick={onClose}>
      <div className="incident-split-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between align-center">
          <div className="align-center" style={{ gap: '0.5rem' }}>
            <Scissors size={14} className="text-copper" />
            <span className="modal-title">SPLIT INCIDENT &bull; {id}</span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>

        {!showReviewStep ? (
          <div className="modal-body">
            <p className="split-instructions">
              Select specific alerts from <b>{id}</b> ({alerts.length} alerts) to branch into a separate proposed incident cluster.
              Original system grouping will remain intact for audit provenance.
            </p>

            {errorMsg && <div className="error-alert">{errorMsg}</div>}

            <div className="alerts-selection-list">
              {alerts.map((al) => {
                const isSelected = selectedAlertIds.has(al.alert_id);
                return (
                  <div
                    key={al.alert_id}
                    className={`alert-select-item flex-between align-center ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleAlert(al.alert_id)}
                  >
                    <div className="al-info">
                      <div className="al-top align-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                        />
                        <span className="al-id">{al.alert_id}</span>
                        <span className="al-type">{al.alert_type}</span>
                      </div>
                      <div className="al-desc text-truncate">{al.description}</div>
                    </div>
                    <span className={`al-sev ${al.severity?.toLowerCase()}`}>{al.severity}</span>
                  </div>
                );
              })}
            </div>

            <div className="modal-footer flex-between align-center">
              <span className="selection-count">
                {selectedAlertIds.size} of {alerts.length} alerts selected for proposed split
              </span>
              <div className="align-center" style={{ gap: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>CANCEL</button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleCreateProposal}
                  disabled={selectedAlertIds.size === 0}
                >
                  CREATE PROPOSED SPLIT &rarr;
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="modal-body review-step-body">
            <div className="review-lead">ANALYST SPLIT REVIEW</div>

            <div className="split-review-card">
              <div className="review-row">
                <span className="lbl">Original System Incident:</span>
                <span className="val">{id} ({alerts.length} alerts)</span>
              </div>
              <div className="review-row">
                <span className="lbl">Analyst Proposal:</span>
                <div className="val clusters-breakdown">
                  <div className="cluster-pill">{id}-A: {alerts.length - selectedAlertIds.size} alerts</div>
                  <div className="cluster-pill">{id}-B: {selectedAlertIds.size} alerts (Branch)</div>
                </div>
              </div>
            </div>

            <div className="reason-field-group">
              <label className="reason-lbl">REASON FOR SPLIT:</label>
              <textarea
                className="reason-textarea"
                rows={2}
                value={splitReason}
                onChange={(e) => setSplitReason(e.target.value)}
              />
            </div>

            <div className="split-disclaimer align-center">
              <AlertTriangle size={13} className="text-copper" />
              <span>
                System correlation provenance is preserved. This action creates an auditable analyst grouping.
              </span>
            </div>

            {errorMsg && <div className="error-alert">{errorMsg}</div>}

            <div className="modal-footer flex-between align-center">
              <button type="button" className="btn-secondary" onClick={() => setShowReviewStep(false)}>
                &larr; BACK
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleConfirmSplit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'CONFIRMING SPLIT...' : 'CONFIRM SPLIT'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .incident-split-backdrop {
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

        .incident-split-modal {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85);
          border-radius: 8px;
          width: min(720px, calc(100vw - 40px));
          max-height: calc(100vh - 80px);
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
        .close-btn:hover {
          color: #F3EFE8;
        }

        .modal-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
        }

        .split-instructions {
          font-size: 0.7rem;
          line-height: 1.45;
          color: #C8C2B9;
          margin: 0;
        }

        .error-alert {
          background: rgba(110, 53, 68, 0.25);
          border: 1px solid #6E3544;
          color: #E28498;
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
          font-size: 0.62rem;
        }

        .alerts-selection-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          max-height: 280px;
          overflow-y: auto;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.5rem;
          background: #242321;
        }

        .alert-select-item {
          padding: 0.45rem 0.65rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          cursor: pointer;
          transition: all 120ms ease;
        }
        .alert-select-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .alert-select-item.selected {
          border-color: #A96B42;
          background: rgba(169, 107, 66, 0.12);
        }

        .al-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          max-width: 80%;
        }
        .al-top {
          gap: 0.45rem;
          font-size: 0.65rem;
        }
        .al-id {
          font-weight: 700;
          color: #A96B42;
        }
        .al-type {
          color: #F3EFE8;
        }
        .al-desc {
          font-size: 0.6rem;
          color: #817B73;
        }
        .al-sev {
          font-size: 0.58rem;
          font-weight: 700;
          padding: 0.1rem 0.4rem;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.08);
        }
        .al-sev.critical {
          color: #E28498;
          background: rgba(110, 53, 68, 0.3);
        }
        .al-sev.high {
          color: #C18A4A;
        }

        .modal-footer {
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .selection-count {
          font-size: 0.62rem;
          color: #817B73;
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
          padding: 0.45rem 1rem;
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

        /* Review step */
        .review-step-body {
          gap: 1rem;
        }
        .review-lead {
          font-size: 0.7rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.1em;
        }

        .split-review-card {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .review-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          font-size: 0.65rem;
        }
        .review-row .lbl {
          color: #817B73;
        }
        .review-row .val {
          color: #F3EFE8;
          font-weight: 600;
        }
        .clusters-breakdown {
          display: flex;
          gap: 0.5rem;
        }
        .cluster-pill {
          background: rgba(169, 107, 66, 0.15);
          border: 1px solid rgba(169, 107, 66, 0.35);
          color: #F3EFE8;
          padding: 0.25rem 0.6rem;
          border-radius: 3px;
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

        .split-disclaimer {
          gap: 0.45rem;
          font-size: 0.6rem;
          color: #817B73;
          background: rgba(255, 255, 255, 0.02);
          padding: 0.4rem 0.65rem;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
