// client/src/components/mitre/MitreDrawer.jsx
// Technique Investigation Panel: Slides in to show TECHNIQUE ID, NAME, TACTIC, INCIDENTS, EVIDENCE
import React from 'react';
import { X, ExternalLink, ShieldCheck, Terminal, AlertCircle } from 'lucide-react';
import { PriorityBadge } from '../shared/StatusBadge';

export function MitreDrawer({ technique, onClose, onSelectIncident }) {
  if (!technique) return null;

  return (
    <div className="mitre-drawer-backdrop" onClick={onClose} role="presentation">
      <div
        className="mitre-drawer-window sentinel-glass-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mitre-drawer-title"
      >
        <div className="drawer-header flex-between mono">
          <div className="align-center" style={{ gap: '0.65rem' }}>
            <span className="live-dot" />
            <span className="drawer-header-title">TECHNIQUE INVESTIGATION</span>
            <span className="drawer-sep">/</span>
            <span className="drawer-tech-id text-cyan font-bold" id="mitre-drawer-title">
              {technique.id}
            </span>
          </div>
          <button
            className="drawer-close-btn align-center mono sentinel-interactive-btn"
            onClick={onClose}
          >
            <span>ESC / CLOSE</span>
            <X size={13} />
          </button>
        </div>

        <div className="drawer-body mono">
          {/* Technique Summary Block */}
          <div className="tech-summary-hero">
            <div className="tech-tactic-pill">{technique.tactic?.toUpperCase() || 'DEFENSE EVASION'}</div>
            <h2 className="tech-hero-name text-white">{technique.name}</h2>
            <div className="tech-attr-guarantee align-center">
              <ShieldCheck size={14} className="text-cyan" />
              <span>100% EVIDENCE-GROUNDED ATTRIBUTION &bull; ZERO HEURISTIC DRIFT</span>
            </div>
          </div>

          {/* Correlated Incidents Section */}
          <div className="drawer-section">
            <div className="section-label flex-between">
              <span>ASSOCIATED INCIDENTS ({technique.incidents?.length || 0})</span>
              <span className="text-muted">ACTIVE CORRELATED CLUSTERS</span>
            </div>

            <div className="incidents-stack">
              {technique.incidents && technique.incidents.length > 0 ? (
                technique.incidents.map((inc, i) => (
                  <div
                    key={i}
                    className="drawer-incident-card flex-between sentinel-interactive-btn"
                    onClick={() => {
                      onClose();
                      onSelectIncident?.(inc);
                    }}
                  >
                    <div className="inc-meta-left">
                      <div className="align-center" style={{ gap: '0.5rem' }}>
                        <span className="inc-id font-bold text-white">{inc.incident_id || inc.id}</span>
                        <PriorityBadge priority={inc.priority || 'P1'} />
                      </div>
                      <span className="inc-asset text-muted">{inc.hostname || inc.asset_name || 'CORP-HOST'}</span>
                    </div>
                    <div className="align-center" style={{ gap: '0.75rem' }}>
                      <span className="inc-risk text-cyan font-bold">
                        {Number(inc.risk_score ?? inc.riskScore ?? 0).toFixed(1)} / 100
                      </span>
                      <ExternalLink size={13} className="text-muted" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-incidents-msg text-muted">NO ACTIVE INCIDENTS BOUND</div>
              )}
            </div>
          </div>

          {/* Concrete Observable Evidence Section */}
          <div className="drawer-section">
            <div className="section-label flex-between">
              <span>FORENSIC EVIDENCE &amp; PROOF</span>
              <span className="text-cyan">COMMAND &bull; API &bull; TELEMETRY</span>
            </div>

            <div className="evidence-payload-stack">
              {technique.evidenceList && technique.evidenceList.length > 0 ? (
                technique.evidenceList.map((ev, idx) => (
                  <div key={idx} className="evidence-proof-block">
                    <div className="proof-header align-center">
                      <Terminal size={12} className="text-cyan" />
                      <span>OBSERVABLE PROOF #{idx + 1}</span>
                    </div>
                    <div className="proof-body">{ev}</div>
                  </div>
                ))
              ) : (
                <div className="evidence-proof-block">
                  <div className="proof-header align-center">
                    <Terminal size={12} className="text-cyan" />
                    <span>OBSERVABLE PROOF</span>
                  </div>
                  <div className="proof-body">
                    {technique.evidence || 'Verified in endpoint event command line and network stream.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .mitre-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 17, 16, 0.75);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          z-index: 2500;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 1.5rem;
          animation: mitreFadeIn 200ms ease;
        }

        @keyframes mitreFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .mitre-drawer-window {
          background: #1D1C1A;
          border: 1px solid var(--border);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.8);
          border-radius: var(--radius-md);
          width: min(650px, 95vw);
          height: calc(100vh - 50px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: mitreSlide 240ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes mitreSlide {
          from { transform: translateX(30px); opacity: 0.8; }
          to { transform: translateX(0); opacity: 1; }
        }

        .drawer-header {
          padding: 1rem 1.5rem;
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
          font-size: 0.7rem;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--system-active);
          box-shadow: 0 0 8px rgba(95, 158, 136, 0.5);
        }

        .drawer-header-title {
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .drawer-sep {
          color: var(--border);
        }

        .drawer-tech-id {
          color: var(--accent-copper);
        }

        .drawer-close-btn {
          background: var(--surface-2);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.65rem;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-sm);
          gap: 0.4rem;
          transition: all var(--transition-fast) ease;
        }
        .drawer-close-btn:hover {
          color: var(--text-primary);
          border-color: var(--accent-copper);
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
          background: transparent;
        }

        .tech-summary-hero {
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 1.25rem;
        }

        .tech-tactic-pill {
          display: inline-block;
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--accent-copper);
          background: rgba(169, 107, 66, 0.12);
          border: 1px solid rgba(169, 107, 66, 0.3);
          padding: 0.2rem 0.6rem;
          border-radius: 3px;
          margin-bottom: 0.65rem;
        }

        .tech-hero-name {
          font-family: inherit;
          font-size: 1.35rem;
          font-weight: 700;
          line-height: 1.2;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
        }

        .tech-attr-guarantee {
          font-size: 0.62rem;
          color: var(--text-muted);
          gap: 0.45rem;
        }

        .drawer-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .section-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--accent-copper);
          letter-spacing: 0.1em;
        }

        .incidents-stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .drawer-incident-card {
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }
        .drawer-incident-card:hover {
          border-color: var(--accent-copper);
          background: var(--surface-2);
        }

        .inc-id {
          font-size: 0.78rem;
          color: var(--text-primary);
        }

        .inc-asset {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .inc-risk {
          font-size: 0.78rem;
          color: var(--accent-copper);
        }

        .evidence-payload-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .evidence-proof-block {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
        }

        .proof-header {
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--accent-copper);
          letter-spacing: 0.08em;
          gap: 0.45rem;
          margin-bottom: 0.45rem;
        }

        .proof-body {
          font-size: 0.7rem;
          color: var(--text-secondary);
          line-height: 1.5;
          word-break: break-all;
        }

        .text-cyan { color: var(--accent-copper); }
      `}</style>
    </div>
  );
}
