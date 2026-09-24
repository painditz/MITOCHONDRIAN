// client/src/components/telemetry/AlertEvidenceDrawer.jsx
// Telemetry Evidence Drawer sliding in to show all 19 fields for an alert
import React from 'react';
import { X, Terminal, Network, Shield, User, Server, Layers, Clock } from 'lucide-react';
import { CriticalityBadge } from '../shared/StatusBadge';

export function AlertEvidenceDrawer({ alert, onClose }) {
  if (!alert) return null;

  const sev = String(alert.severity || 'Medium').toLowerCase();

  return (
    <div className="telemetry-drawer-backdrop" onClick={onClose} role="presentation">
      <div
        className="telemetry-drawer-window sentinel-glass-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-drawer-title"
      >
        {/* Drawer Header */}
        <div className="drawer-top-bar flex-between mono">
          <div className="align-center" style={{ gap: '0.65rem' }}>
            <span className="drawer-live-dot" />
            <span className="drawer-tag">ALERT EVIDENCE DRAWER</span>
            <span className="drawer-sep">/</span>
            <span className="drawer-alert-id font-bold text-cyan" id="alert-drawer-title">
              {alert.alert_id}
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

        {/* Scrollable Fields Body */}
        <div className="drawer-fields-body mono">
          {/* Hero Strip */}
          <div className="alert-identity-hero">
            <div className="hero-tags flex-between">
              <span className={`sev-tag-pill ${sev}`}>{alert.severity}</span>
              <span className="time-tag-pill">
                <Clock size={11} style={{ marginRight: '0.3rem' }} />
                {alert.timestamp || 'N/A'}
              </span>
            </div>
            <h2 className="alert-type-title text-white">{alert.alert_type}</h2>
            <div className="alert-source-subtitle text-muted">
              INGESTION SOURCE: <span className="text-cyan">{alert.source}</span>
            </div>
          </div>

          {/* Description Block */}
          <div className="drawer-field-section">
            <div className="section-title text-cyan">DESCRIPTION &amp; EVENT OBSERVABLES</div>
            <div className="desc-box">{alert.description}</div>
          </div>

          {/* Asset & Identity Section */}
          <div className="drawer-field-section">
            <div className="section-title text-cyan">ASSET &amp; USER IDENTITY</div>
            <div className="fields-grid-two">
              <div className="field-card">
                <span className="field-key">TARGET HOSTNAME:</span>
                <span className="field-value text-white">{alert.hostname || alert.asset_name || 'N/A'}</span>
              </div>
              <div className="field-card">
                <span className="field-key">ASSET ID:</span>
                <span className="field-value text-muted">{alert.asset_id || 'AST-CORP'}</span>
              </div>
              <div className="field-card">
                <span className="field-key">ASSET CRITICALITY:</span>
                <CriticalityBadge criticality={alert.asset_criticality || 'MEDIUM'} />
              </div>
              <div className="field-card">
                <span className="field-key">ACCOUNT IDENTITY:</span>
                <span className="field-value text-cyan">{alert.user || 'SYSTEM / Service Account'}</span>
              </div>
            </div>
          </div>

          {/* Network Flow Section */}
          <div className="drawer-field-section">
            <div className="section-title text-cyan">NETWORK TELEMETRY</div>
            <div className="fields-grid-two">
              <div className="field-card">
                <span className="field-key">SOURCE IP:</span>
                <span className="field-value">{alert.source_ip || 'Internal / Local'}</span>
              </div>
              <div className="field-card">
                <span className="field-key">DESTINATION IP:</span>
                <span className="field-value">{alert.destination_ip || 'Internal / N/A'}</span>
              </div>
              <div className="field-card">
                <span className="field-key">PROTOCOL:</span>
                <span className="field-value text-white">{alert.protocol || 'TCP'}</span>
              </div>
              <div className="field-card">
                <span className="field-key">FORENSIC INDICATOR:</span>
                <span className="field-value text-bright-cyan" title={alert.indicator}>
                  {alert.indicator || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* MITRE ATT&CK Attribution */}
          <div className="drawer-field-section">
            <div className="section-title text-cyan">MITRE ATT&amp;CK MAPPING</div>
            <div className="fields-grid-two">
              <div className="field-card">
                <span className="field-key">TACTIC:</span>
                <span className="field-value text-white">{alert.mitre_tactic || 'Execution'}</span>
              </div>
              <div className="field-card">
                <span className="field-key">TECHNIQUE:</span>
                <span className="field-value text-cyan">{alert.mitre_technique || 'T1059.001'}</span>
              </div>
            </div>
          </div>

          {/* Correlation Context */}
          <div className="drawer-field-section">
            <div className="section-title text-cyan">CORRELATION CONTEXT</div>
            <div className="fields-grid-two">
              <div className="field-card">
                <span className="field-key">SCENARIO ID:</span>
                <span className="field-value text-white">{alert.scenario_id || 'SCN-CORP-EXCHANGE'}</span>
              </div>
              <div className="field-card">
                <span className="field-key">GROUND TRUTH INCIDENT:</span>
                <span className="field-value text-muted">{alert.ground_truth_incident_id || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Evidence Payload */}
          {alert.evidence && Object.keys(alert.evidence).length > 0 && (
            <div className="drawer-field-section">
              <div className="section-title text-cyan">RAW EVIDENCE OBJECT</div>
              <pre className="evidence-json-block">
                {JSON.stringify(alert.evidence, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .telemetry-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(18, 17, 16, 0.75);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          z-index: 2600;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 1.5rem;
          animation: drawerFade 200ms ease;
        }

        @keyframes drawerFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .telemetry-drawer-window {
          background: #1D1C1A;
          border: 1px solid var(--border);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.8);
          border-radius: var(--radius-md);
          width: min(680px, 95vw);
          height: calc(100vh - 50px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: drawerSlide 240ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes drawerSlide {
          from { transform: translateX(30px); opacity: 0.8; }
          to { transform: translateX(0); opacity: 1; }
        }

        .drawer-top-bar {
          padding: 1rem 1.5rem;
          background: var(--surface-2);
          border-bottom: 1px solid var(--border);
          font-size: 0.7rem;
        }

        .drawer-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--system-active);
          box-shadow: 0 0 8px rgba(95, 158, 136, 0.5);
        }

        .drawer-tag {
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }

        .drawer-sep {
          color: var(--border);
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

        .drawer-fields-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          background: transparent;
        }

        .alert-identity-hero {
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 1.25rem;
        }

        .sev-tag-pill {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
        }
        .sev-tag-pill.critical { background: rgba(184, 77, 97, 0.15); color: var(--p1); border: 1px solid rgba(184, 77, 97, 0.3); }
        .sev-tag-pill.high { background: rgba(193, 138, 74, 0.15); color: var(--p2); border: 1px solid rgba(193, 138, 74, 0.3); }
        .sev-tag-pill.medium { background: rgba(92, 148, 128, 0.15); color: var(--p3); border: 1px solid rgba(92, 148, 128, 0.3); }
        .sev-tag-pill.low { background: rgba(119, 129, 138, 0.15); color: var(--p4); border: 1px solid rgba(119, 129, 138, 0.3); }
        .sev-tag-pill.informational { background: rgba(255, 255, 255, 0.05); color: var(--text-muted); border: 1px solid var(--border); }

        .time-tag-pill {
          font-size: 0.65rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
        }

        .alert-type-title {
          font-family: inherit;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0.75rem 0 0.25rem;
        }

        .alert-source-subtitle {
          font-size: 0.65rem;
          color: var(--text-muted);
        }

        .drawer-field-section {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .section-title {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--accent-copper);
        }

        .desc-box {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          font-size: 0.72rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .fields-grid-two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .field-card {
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .field-key {
          font-size: 0.58rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .field-value {
          font-size: 0.72rem;
          color: var(--text-primary);
          word-break: break-all;
        }

        .evidence-json-block {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          font-size: 0.65rem;
          color: var(--accent-copper);
          overflow-x: auto;
          line-height: 1.4;
        }

        .text-cyan { color: var(--accent-copper); }
        .text-bright-cyan { color: var(--accent-copper); }
      `}</style>
    </div>
  );
}
