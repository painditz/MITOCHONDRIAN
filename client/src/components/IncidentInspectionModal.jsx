// client/src/components/IncidentInspectionModal.jsx
// Detailed Forensic Incident Inspection State
// Opens smoothly when an incident (e.g. INC-102) is clicked from the Hero Incident Field or Incident List
import React, { useState, useEffect } from 'react';

export function IncidentInspectionModal({ incident, onClose, onReviewAction }) {
  const [reviewStatus, setReviewStatus] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!incident) return null;

  const handleAction = (action) => {
    setReviewStatus(action);
    if (onReviewAction) {
      onReviewAction(incident.id, action, feedbackNote);
    }
  };

  const getPriorityBadgeStyle = (prio) => {
    switch (prio) {
      case 'P1': return { color: '#C73B3B', borderColor: '#C73B3B' };
      case 'P2': return { color: '#B98621', borderColor: '#B98621' };
      case 'P3': return { color: '#3A83B8', borderColor: '#3A83B8' };
      default: return { color: '#777777', borderColor: '#777777' };
    }
  };

  const prioStyle = getPriorityBadgeStyle(incident.priority);

  return (
    <div className="inspection-backdrop" onClick={onClose}>
      <div 
        className="inspection-drawer" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspection-title"
      >
        {/* Top Operational Bar */}
        <div className="drawer-top-bar flex-between mono">
          <div className="bar-left align-center">
            <span className="dot-active" />
            <span>INCIDENT INSPECTION STATE</span>
            <span className="bar-sep">/</span>
            <span className="incident-id-highlight">{incident.id}</span>
          </div>
          <button 
            className="drawer-close-btn align-center" 
            onClick={onClose}
            aria-label="Close inspection"
          >
            <span>ESC / CLOSE</span>
            <span className="close-x">×</span>
          </button>
        </div>

        <div className="drawer-scroll-body">
          {/* Main Incident Identity Header */}
          <div className="inspection-hero-strip flex-between">
            <div className="strip-left">
              <div className="incident-meta-tags align-center mono">
                <span className="prio-tag" style={prioStyle}>{incident.priority}</span>
                <span className="asset-tag">{incident.criticality || 'CRITICAL ASSET'}</span>
                <span className="timing-tag">{incident.duration || '60.4 min active'}</span>
              </div>
              <h2 id="inspection-title" className="incident-main-heading">
                {incident.asset}
              </h2>
              <div className="incident-subline mono">
                TARGET ASSET &bull; CORRELATED TELEMETRY CLUSTER &bull; {incident.signalsCount} SIGNALS
              </div>
            </div>

            <div className="strip-right-score text-right">
              <div className="risk-score-large mono">
                {incident.riskScore}
                <span className="score-denom"> / 100</span>
              </div>
              <div className="score-caption mono">CALCULATED RISK INDEX</div>
            </div>
          </div>

          {/* Core Multi-Column Content Grid */}
          <div className="inspection-grid">
            {/* Column 1: Explainable Risk Factors */}
            <div className="grid-cell risk-factors-cell">
              <div className="cell-header mono">
                <span>01 / RISK FACTORS</span>
                <span className="header-badge">EXPLAINABLE</span>
              </div>
              <p className="cell-lead">
                Prioritization is computed from observable enterprise asset criticality and attack depth, rather than alert volume.
              </p>
              <div className="factors-stack">
                {(incident.riskFactors || [
                  { name: 'Asset Criticality', value: '+45', color: '#C73B3B' },
                  { name: 'Peak Severity', value: '+25', color: '#B98621' },
                  { name: 'Kill-Chain Depth', value: '+12', color: '#B98621' },
                  { name: 'ML Relevance', value: '+9', color: '#3A83B8' },
                  { name: 'Alert Volume', value: '+5', color: '#16A34A' }
                ]).map((rf, idx) => (
                  <div key={idx} className="factor-row flex-between mono">
                    <span className="factor-name">{rf.name}</span>
                    <span className="factor-val" style={{ color: rf.color || '#111111' }}>
                      {rf.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="factor-footnote mono">
                Dominant factor: Asset Criticality (+45 pts)
              </div>
            </div>

            {/* Column 2: Forensic Evidence & Observables */}
            <div className="grid-cell evidence-cell">
              <div className="cell-header mono">
                <span>02 / EVIDENCE</span>
                <span className="header-badge">{incident.signalsCount || 10} SIGNALS</span>
              </div>
              <p className="cell-lead">
                Observable identity, network, and endpoint entities clustered by deterministic pairwise correlation.
              </p>
              <div className="evidence-table mono">
                <div className="evidence-row flex-between">
                  <span className="ev-key">Identity</span>
                  <span className="ev-val strong">{incident.user || 'marcus.vance.cfo'}</span>
                </div>
                <div className="evidence-row flex-between">
                  <span className="ev-key">Observable IP</span>
                  <span className="ev-val">{incident.observable || '185.220.101.5'}</span>
                </div>
                <div className="evidence-row flex-between">
                  <span className="ev-key">Signals Clustered</span>
                  <span className="ev-val">{incident.signalsCount || 10}</span>
                </div>
                <div className="evidence-row flex-between">
                  <span className="ev-key">Duration</span>
                  <span className="ev-val">{incident.duration || '60.4 min'}</span>
                </div>
                <div className="evidence-row flex-between">
                  <span className="ev-key">Correlation Basis</span>
                  <span className="ev-val">Host + Kerberos RPC Pivot</span>
                </div>
              </div>
            </div>

            {/* Column 3: MITRE ATT&CK Attribution */}
            <div className="grid-cell mitre-cell">
              <div className="cell-header mono">
                <span>03 / MITRE ATT&CK</span>
                <span className="header-badge">EVIDENCE-GROUNDED</span>
              </div>
              <p className="cell-lead">
                Technique mappings require forensic command or API proof. Speculative tagging is rejected.
              </p>
              <div className="mitre-tags-list">
                {(incident.mitreTechniques || [
                  { id: 'T1114.002', name: 'Email Collection (Remote Forwarding)' },
                  { id: 'T1567.002', name: 'Cloud Storage Exfiltration (mega.nz)' }
                ]).map((tech, idx) => (
                  <div key={idx} className="mitre-item">
                    <span className="mitre-id mono">{tech.id}</span>
                    <span className="mitre-name">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Shift Handover Brief */}
          <div className="inspection-ai-section">
            <div className="ai-header flex-between mono">
              <div className="ai-title align-center">
                <span className="ai-indicator" />
                <span>AI SHIFT HANDOVER BRIEF &bull; FLAN-T5 LOCAL INFERENCE</span>
              </div>
              <span className="ai-badge">ZERO DATA EGRESS &bull; 420ms</span>
            </div>
            <div className="ai-brief-box">
              <p className="ai-brief-text">
                "{incident.aiBrief || 'Executive account compromise followed by cloud data exfiltration involving Exchange Online. Automated mailbox forwarding rule targeting mega.nz cloud storage endpoint.'}"
              </p>
              <div className="ai-recommendation mono">
                Recommended Action: Revoke active session tokens for {incident.user || 'marcus.vance.cfo'}, block egress to destination IP {incident.observable || '185.220.101.5'}, remove unauthorized forwarding rule.
              </div>
            </div>
          </div>

          {/* Human Review Decision Strip */}
          <div className="inspection-review-section">
            <div className="review-header flex-between mono">
              <span>HUMAN REVIEW &bull; ANALYST VERIFICATION</span>
              {reviewStatus ? (
                <span className="status-confirmed mono">
                  ACTION RECORDED: {reviewStatus} &bull; AUDIT PERSISTED
                </span>
              ) : (
                <span className="status-pending mono">DECISION REQUIRED</span>
              )}
            </div>

            <div className="review-actions-bar align-center">
              <button 
                className={`review-btn confirm ${reviewStatus === 'CONFIRMED' ? 'active' : ''}`}
                onClick={() => handleAction('CONFIRMED')}
              >
                CONFIRM
              </button>
              <button 
                className={`review-btn reject ${reviewStatus === 'REJECTED' ? 'active' : ''}`}
                onClick={() => handleAction('REJECTED')}
              >
                REJECT
              </button>
              <button 
                className={`review-btn modify ${reviewStatus === 'MODIFIED' ? 'active' : ''}`}
                onClick={() => handleAction('MODIFIED')}
              >
                MODIFY
              </button>
              <button 
                className={`review-btn investigated ${reviewStatus === 'INVESTIGATED' ? 'active' : ''}`}
                onClick={() => handleAction('INVESTIGATED')}
              >
                MARK INVESTIGATED
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .inspection-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(11, 11, 11, 0.45);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          animation: fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .inspection-drawer {
          background: #F3F1EC;
          border: 1px solid var(--color-line);
          width: 100%;
          max-width: 1100px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);
          animation: slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0.85; }
          to { transform: translateY(0); opacity: 1; }
        }

        .drawer-top-bar {
          padding: 0.85rem 1.75rem;
          border-bottom: 1px solid var(--color-line);
          font-size: 0.68rem;
          background: #EDEAE3;
          color: var(--color-secondary);
        }

        .bar-left {
          gap: 0.6rem;
        }

        .dot-active {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #16A34A;
        }

        .bar-sep {
          color: var(--color-line);
        }

        .incident-id-highlight {
          color: var(--color-primary);
          font-weight: 700;
        }

        .drawer-close-btn {
          background: transparent;
          border: none;
          color: var(--color-secondary);
          font-family: var(--font-mono);
          font-size: 0.68rem;
          cursor: pointer;
          gap: 0.4rem;
          padding: 0.2rem 0.5rem;
          transition: color 140ms ease;
        }

        .drawer-close-btn:hover {
          color: var(--color-primary);
        }

        .close-x {
          font-size: 1.1rem;
          line-height: 1;
        }

        .drawer-scroll-body {
          overflow-y: auto;
          padding: 2rem 2.25rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        /* Hero Strip */
        .inspection-hero-strip {
          align-items: flex-start;
          border-bottom: 1px solid var(--color-line);
          padding-bottom: 1.75rem;
          gap: 2rem;
        }

        .incident-meta-tags {
          gap: 0.6rem;
          margin-bottom: 0.6rem;
          font-size: 0.66rem;
        }

        .prio-tag {
          padding: 0.15rem 0.55rem;
          border: 1px solid;
          font-weight: 700;
        }

        .asset-tag {
          background: #E5E1D8;
          padding: 0.15rem 0.55rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .timing-tag {
          color: var(--color-secondary);
        }

        .incident-main-heading {
          font-size: 2.2rem;
          font-weight: 600;
          letter-spacing: -0.02em;
          color: var(--color-primary);
          margin-bottom: 0.4rem;
        }

        .incident-subline {
          font-size: 0.68rem;
          color: var(--color-secondary);
          letter-spacing: 0.04em;
        }

        .risk-score-large {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1;
          color: #C73B3B;
          letter-spacing: -0.03em;
        }

        .score-denom {
          font-size: 1.2rem;
          font-weight: 400;
          color: var(--color-secondary);
        }

        .score-caption {
          font-size: 0.65rem;
          color: var(--color-secondary);
          margin-top: 0.4rem;
          letter-spacing: 0.05em;
        }

        /* Grid */
        .inspection-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 900px) {
          .inspection-grid {
            grid-template-columns: 1fr;
          }
        }

        .grid-cell {
          background: #FFFFFF;
          border: 1px solid var(--color-line);
          padding: 1.4rem;
          display: flex;
          flex-direction: column;
        }

        .cell-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.66rem;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--color-line);
        }

        .header-badge {
          font-size: 0.58rem;
          color: var(--color-secondary);
          background: var(--color-base);
          padding: 0.1rem 0.4rem;
          border: 1px solid var(--color-line);
        }

        .cell-lead {
          font-size: 0.76rem;
          line-height: 1.45;
          color: var(--color-secondary);
          margin-bottom: 1.1rem;
        }

        .factors-stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .factor-row {
          font-size: 0.72rem;
          padding: 0.3rem 0;
          border-bottom: 1px dashed rgba(216, 213, 206, 0.7);
        }

        .factor-name {
          color: var(--color-primary);
        }

        .factor-val {
          font-weight: 700;
        }

        .factor-footnote {
          font-size: 0.62rem;
          color: var(--color-secondary);
          margin-top: auto;
          padding-top: 0.5rem;
        }

        .evidence-table {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }

        .evidence-row {
          font-size: 0.72rem;
          padding: 0.35rem 0;
          border-bottom: 1px dashed rgba(216, 213, 206, 0.7);
        }

        .ev-key {
          color: var(--color-secondary);
        }

        .ev-val {
          color: var(--color-primary);
          font-weight: 500;
        }

        .ev-val.strong {
          font-weight: 700;
          color: #2563EB;
        }

        .mitre-tags-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .mitre-item {
          display: flex;
          flex-direction: column;
          background: #F9F8F6;
          border: 1px solid var(--color-line);
          padding: 0.6rem 0.75rem;
        }

        .mitre-id {
          font-size: 0.70rem;
          font-weight: 700;
          color: var(--color-primary);
          margin-bottom: 0.2rem;
        }

        .mitre-name {
          font-size: 0.74rem;
          color: var(--color-secondary);
        }

        /* AI Section */
        .inspection-ai-section {
          background: #FFFFFF;
          border: 1px solid var(--color-line);
          padding: 1.4rem;
        }

        .ai-header {
          font-size: 0.66rem;
          color: var(--color-secondary);
          margin-bottom: 0.85rem;
        }

        .ai-title {
          gap: 0.5rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        .ai-indicator {
          width: 6px;
          height: 6px;
          background: #2563EB;
          border-radius: 50%;
        }

        .ai-badge {
          font-size: 0.60rem;
          color: var(--color-secondary);
        }

        .ai-brief-box {
          background: #F8F7F4;
          border-left: 3px solid #2563EB;
          padding: 1rem 1.25rem;
        }

        .ai-brief-text {
          font-size: 0.92rem;
          line-height: 1.55;
          color: var(--color-primary);
          font-weight: 500;
          margin-bottom: 0.75rem;
        }

        .ai-recommendation {
          font-size: 0.68rem;
          color: var(--color-secondary);
          line-height: 1.45;
        }

        /* Review Section */
        .inspection-review-section {
          border-top: 1px solid var(--color-line);
          padding-top: 1.25rem;
        }

        .review-header {
          font-size: 0.66rem;
          color: var(--color-secondary);
          margin-bottom: 1rem;
        }

        .status-confirmed {
          color: #16A34A;
          font-weight: 700;
        }

        .status-pending {
          color: #B98621;
        }

        .review-actions-bar {
          display: flex;
          gap: 0.85rem;
          flex-wrap: wrap;
        }

        .review-btn {
          padding: 0.75rem 1.4rem;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          border: 1px solid var(--color-primary);
          background: transparent;
          color: var(--color-primary);
          cursor: pointer;
          transition: all 140ms ease;
        }

        .review-btn.confirm {
          background: var(--color-primary);
          color: #FFFFFF;
        }

        .review-btn.confirm:hover {
          background: #2563EB;
          border-color: #2563EB;
        }

        .review-btn:hover {
          background: #E5E1D8;
        }

        .review-btn.active {
          outline: 2px solid #2563EB;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default IncidentInspectionModal;
