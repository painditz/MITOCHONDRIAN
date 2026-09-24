// client/src/components/architecture/PlaneTopology.jsx
// Control Plane / Data Plane Split Architecture Visualization
// Dark Graphite Glass System with Muted Copper & Slate Governance Accents
import React from 'react';
import { ShieldAlert, Network, Cpu, Database, Eye, CheckCircle2, Sliders, Layers } from 'lucide-react';

export function PlaneTopology() {
  const controlPlaneItems = [
    {
      id: 'cp-risk',
      title: 'RISK SCORING ENGINE',
      tag: '0–100 INDEX',
      desc: 'Deterministic multi-factor calculation combining asset criticality tier (+45) and attack depth.',
      icon: <Sliders size={16} className="text-copper" />,
    },
    {
      id: 'cp-prio',
      title: 'PRIORITY GOVERNANCE',
      tag: 'P1–P4 TIERS',
      desc: 'Enforces strict asset primacy so critical enterprise infrastructure is triaged first.',
      icon: <ShieldAlert size={16} className="text-p1" />,
    },
    {
      id: 'cp-mitre',
      title: 'MITRE ATT&CK MATRIX',
      tag: 'EVIDENCE-GROUNDED',
      desc: 'Validates tactical techniques only when explicit process or network proof is observed.',
      icon: <Layers size={16} className="text-copper" />,
    },
    {
      id: 'cp-ai',
      title: 'LOCAL FLAN-T5 INFERENCE',
      tag: 'ZERO DATA EGRESS',
      desc: 'Synthesizes concise shift handovers on local CPU/GPU without cloud telemetry leakage.',
      icon: <Cpu size={16} className="text-copper" />,
    },
    {
      id: 'cp-human',
      title: 'HUMAN REVIEW CONSOLE',
      tag: 'AUDIT & FEEDBACK',
      desc: 'Analyst validation loop with persistent decision records and stopwatch MTTT tracking.',
      icon: <CheckCircle2 size={16} className="text-green" />,
    },
  ];

  const dataPlaneItems = [
    {
      id: 'dp-stream',
      title: '3,000 RAW ALERTS',
      tag: 'HETEROGENEOUS STREAM',
      desc: 'Ingests Defender, Active Directory, Azure AD, Firewall, and EDR streams simultaneously.',
      icon: <Database size={16} className="text-slate" />,
    },
    {
      id: 'dp-norm',
      title: 'NORMALIZATION ENGINE',
      tag: 'CANONICAL SCHEMA',
      desc: 'Extracts entities into canonical schemas, standardizing IP, host, and credential objects.',
      icon: <Layers size={16} className="text-slate" />,
    },
    {
      id: 'dp-corr',
      title: 'DSU GRAPH CLUSTERING',
      tag: '99.5% COMPRESSION',
      desc: 'Clusters pairwise alerts sharing host, user, IP within a 60-minute sliding window.',
      icon: <Network size={16} className="text-slate" />,
    },
    {
      id: 'dp-objects',
      title: 'INCIDENT OBJECTS',
      tag: '15 ACTIVE CLUSTERS',
      desc: 'Synthesizes structured forensic incident entities ready for human investigation.',
      icon: <Eye size={16} className="text-slate" />,
    },
    {
      id: 'dp-evidence',
      title: 'FORENSIC EVIDENCE LAKE',
      tag: '19 FIELDS PER ALERT',
      desc: 'Maintains granular raw and normalized observables for full post-incident auditability.',
      icon: <Database size={16} className="text-slate" />,
    },
  ];

  return (
    <div className="plane-topology-workspace">
      <div className="topology-header-bar flex-between mono">
        <div className="align-center" style={{ gap: '0.65rem' }}>
          <span className="topology-pulse-dot" />
          <span className="topology-title">CONTROL PLANE / DATA PLANE ARCHITECTURE</span>
        </div>
        <span className="topology-tag">DETERMINISTIC SEPARATION &bull; ZERO DRIFT</span>
      </div>

      <div className="topology-body-grid">
        {/* CONTROL PLANE TIER */}
        <div className="plane-tier-card control-plane-tier">
          <div className="tier-header mono flex-between">
            <div>
              <span className="tier-title text-copper">CONTROL PLANE</span>
              <span className="tier-sub text-muted"> / POLICY &bull; PRIORITIZATION &bull; GOVERNANCE</span>
            </div>
            <span className="tier-badge mono">HIGH PRIVILEGE</span>
          </div>

          <div className="tier-nodes-grid">
            {controlPlaneItems.map((item) => (
              <div key={item.id} className="plane-node-card mono">
                <div className="node-top-meta flex-between">
                  <span className="node-icon">{item.icon}</span>
                  <span className="node-tag">{item.tag}</span>
                </div>
                <div className="node-heading">{item.title}</div>
                <p className="node-description">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* VISUAL CONNECTING BRIDGE */}
        <div className="plane-bridge-connector mono" aria-hidden="true">
          <div className="bridge-glow-line" />
          <div className="bridge-labels-row flex-between">
            <span className="bridge-label">
              &uarr; RISK SCORING, MITRE ATTRIBUTION &amp; REVIEW FEEDBACK LOOP
            </span>
            <span className="bridge-label">
              CANONICAL ENTITY &amp; TELEMETRY EXTRACTION &darr;
            </span>
          </div>
        </div>

        {/* DATA PLANE TIER */}
        <div className="plane-tier-card data-plane-tier">
          <div className="tier-header mono flex-between">
            <div>
              <span className="tier-title text-slate">DATA PLANE</span>
              <span className="tier-sub text-muted"> / HIGH-THROUGHPUT STREAMS &bull; 3,000 ALERTS</span>
            </div>
            <span className="tier-badge mono">TELEMETRY INGEST</span>
          </div>

          <div className="tier-nodes-grid">
            {dataPlaneItems.map((item) => (
              <div key={item.id} className="plane-node-card mono">
                <div className="node-top-meta flex-between">
                  <span className="node-icon">{item.icon}</span>
                  <span className="node-tag">{item.tag}</span>
                </div>
                <div className="node-heading">{item.title}</div>
                <p className="node-description">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .plane-topology-workspace {
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
          border-radius: 8px;
          overflow: hidden;
          margin-top: 3.5rem;
          padding: 1.75rem 2rem;
        }

        .topology-header-bar {
          font-size: 0.72rem;
          padding-bottom: 1.15rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 1.75rem;
        }

        .topology-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #A96B42;
          box-shadow: 0 0 10px rgba(169, 107, 66, 0.6);
        }

        .topology-title {
          font-weight: 700;
          color: #F3EFE8;
          letter-spacing: 0.12em;
        }

        .topology-tag {
          font-size: 0.65rem;
          color: #817B73;
          letter-spacing: 0.1em;
        }

        .topology-body-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .plane-tier-card {
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 6px;
          padding: 1.25rem 1.5rem;
        }

        .tier-header {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          margin-bottom: 1rem;
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .tier-title {
          font-weight: 700;
        }

        .tier-sub {
          color: #817B73;
          font-weight: 400;
        }

        .tier-badge {
          font-size: 0.60rem;
          padding: 0.2rem 0.55rem;
          border-radius: 3px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #B9B3AA;
        }

        .tier-nodes-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.85rem;
        }

        .plane-node-card {
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.95rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          transition: all 200ms ease;
        }

        .plane-node-card:hover {
          border-color: #A96B42;
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
        }

        .node-top-meta {
          align-items: center;
          margin-bottom: 0.2rem;
        }

        .node-tag {
          font-size: 0.58rem;
          font-weight: 700;
          color: #817B73;
          letter-spacing: 0.08em;
        }

        .node-heading {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          line-height: 1.25;
          color: #F3EFE8;
        }

        .node-description {
          font-size: 0.65rem;
          color: #B9B3AA;
          line-height: 1.45;
          margin-top: 0.2rem;
        }

        /* Connecting Bridge */
        .plane-bridge-connector {
          position: relative;
          padding: 0.75rem 0;
        }

        .bridge-glow-line {
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, 
            rgba(169, 107, 66, 0.1) 0%, 
            rgba(169, 107, 66, 0.75) 50%, 
            rgba(169, 107, 66, 0.1) 100%
          );
          box-shadow: 0 0 10px rgba(169, 107, 66, 0.35);
        }

        .bridge-labels-row {
          margin-top: 0.45rem;
          font-size: 0.62rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.08em;
          padding: 0 0.5rem;
        }

        .text-copper { color: #A96B42; }
        .text-slate  { color: #78828A; }
        .text-p1     { color: #B64A5F; }
        .text-green  { color: #5F9480; }

        @media (max-width: 1200px) {
          .tier-nodes-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .tier-nodes-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

