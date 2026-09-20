// client/src/components/RiskIntelligenceSection.jsx
// 02 / RISK INTELLIGENCE & EXPLAINABILITY
// Explains the five additive risk components (0-100 index)
// Case study: INC-102 (10 alerts, Critical, 96.4) vs INC-114 (1,452 alerts, Medium, 15.0)
import React from 'react';

export function RiskIntelligenceSection() {
  const riskComponents = [
    {
      name: 'ASSET CRITICALITY',
      points: '0–45 PTS',
      maxPts: 45,
      weight: '45%',
      color: '#ff3b4d',
      desc: 'Dominant risk multiplier. Domain Controllers, Exchange, and Key Vaults outrank lower tier telemetry regardless of volume.',
    },
    {
      name: 'PEAK SEVERITY',
      points: '0–25 PTS',
      maxPts: 25,
      weight: '25%',
      color: '#ffb020',
      desc: 'Highest single alert severity within the cluster (Critical=25, High=18, Medium=10, Low=3).',
    },
    {
      name: 'KILL-CHAIN DEPTH',
      points: '0–15 PTS',
      maxPts: 15,
      weight: '15%',
      color: '#38bdf8',
      desc: 'Progression across MITRE tactics (Initial Access -> Execution -> Persistence -> Lateral Movement -> Exfiltration).',
    },
    {
      name: 'ML RELEVANCE SCORE',
      points: '0–10 PTS',
      maxPts: 10,
      weight: '10%',
      color: '#a855f7',
      desc: 'RandomForest probability calibrated on synthetic test groups. Intentionally capped at 10 pts to prevent model drift hallucinations.',
    },
    {
      name: 'ALERT VOLUME FACTOR',
      points: '0–5 PTS',
      maxPts: 5,
      weight: '5%',
      color: '#10b981',
      desc: 'Logarithmic signal density bonus capped strictly at 5 points to suppress noisy denial-of-service or telemetry storms.',
    },
  ];

  return (
    <section className="sentinel-section risk-intelligence-section" id="risk-intelligence">
      <div className="section-inner-container">
        {/* Section Header */}
        <div className="section-header-block">
          <div className="section-eyebrow-tag mono">
            <span className="code-accent">02</span>
            <span className="code-sep">/</span>
            <span>EXPLAINABLE RISK INTELLIGENCE</span>
          </div>
          <div className="section-headline-row flex-between">
            <h2 className="section-title-large">
              WHY ASSET WEIGHT OUTRANKS NOISE.
            </h2>
            <p className="section-description-text">
              Volume is not severity. SentinelOps enforces a bounded 0–100 risk scale where asset criticality prevents millions of harmless telemetry events from burying targeted breaches.
            </p>
          </div>
        </div>

        {/* 5 Risk Components Grid */}
        <div className="risk-formula-grid">
          {riskComponents.map((comp, idx) => (
            <div key={idx} className="risk-comp-card">
              <div className="comp-top flex-between mono">
                <span className="comp-weight" style={{ color: comp.color }}>
                  {comp.weight}
                </span>
                <span className="comp-pts">{comp.points}</span>
              </div>

              <div className="comp-name-row">
                <div className="comp-color-bar" style={{ background: comp.color }} />
                <h3 className="comp-name mono">{comp.name}</h3>
              </div>

              <p className="comp-desc">{comp.desc}</p>

              <div className="comp-bar-track">
                <div
                  className="comp-bar-fill"
                  style={{ width: `${(comp.maxPts / 45) * 100}%`, background: comp.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Case Study Comparison: INC-102 vs INC-114 */}
        <div className="case-study-banner">
          <div className="case-study-header flex-between mono">
            <span className="case-tag">ENTERPRISE CASE STUDY &bull; REAL APPLICATION TELEMETRY</span>
            <span className="case-sub">THE ASSET CRITICALITY SAFEGUARD</span>
          </div>

          <div className="case-study-comparison-row">
            {/* Critical Low-Volume Incident */}
            <div className="case-card critical-case">
              <div className="case-badge-row flex-between mono">
                <span className="case-id">INC-102</span>
                <span className="case-priority-badge p1">P1 CRITICAL</span>
              </div>
              <div className="case-asset-name">CORP-EXCHANGE-ONLINE</div>
              <div className="case-metrics-strip flex-between mono">
                <div>
                  <span className="label">SIGNAL COUNT</span>
                  <b className="val text-white">10 ALERTS</b>
                </div>
                <div>
                  <span className="label">ASSET TIER</span>
                  <b className="val text-red">CRITICAL (+45)</b>
                </div>
                <div>
                  <span className="label">CALCULATED RISK</span>
                  <b className="val risk-large text-red">96.4</b>
                </div>
              </div>
              <p className="case-explanation">
                Executive mailbox compromise with remote forwarding rule. Despite having only 10 signals, the critical asset priority and kill-chain depth correctly elevate this to <b>#1 SOC Priority</b>.
              </p>
            </div>

            <div className="case-versus-badge mono">VS</div>

            {/* High-Volume Telemetry Noise Cluster */}
            <div className="case-card noisy-case">
              <div className="case-badge-row flex-between mono">
                <span className="case-id">INC-114</span>
                <span className="case-priority-badge p4">P4 LOW</span>
              </div>
              <div className="case-asset-name">CORP-TELEMETRY-HOST</div>
              <div className="case-metrics-strip flex-between mono">
                <div>
                  <span className="label">SIGNAL COUNT</span>
                  <b className="val text-amber">1,452 ALERTS</b>
                </div>
                <div>
                  <span className="label">ASSET TIER</span>
                  <b className="val text-slate">MEDIUM (+10)</b>
                </div>
                <div>
                  <span className="label">CALCULATED RISK</span>
                  <b className="val risk-large text-slate">15.0</b>
                </div>
              </div>
              <p className="case-explanation">
                High-volume diagnostic log storm. In traditional alert queues, 1,452 alerts would drown the queue. In SentinelOps, capped volume weight (+5) ensures it remains ranked at <b>Risk 15.0</b>.
              </p>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .risk-intelligence-section {
          padding: 5rem 0;
          position: relative;
          z-index: 5;
        }

        .risk-formula-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2.5rem;
        }

        .risk-comp-card {
          background: rgba(7, 12, 18, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: transform 180ms ease, border-color 180ms ease;
        }

        .risk-comp-card:hover {
          transform: translateY(-2px);
          border-color: rgba(56, 189, 248, 0.3);
        }

        .comp-top {
          font-size: 0.68rem;
          font-weight: 700;
        }

        .comp-pts {
          color: #64748b;
        }

        .comp-name-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        .comp-color-bar {
          width: 3px;
          height: 16px;
          border-radius: 2px;
        }

        .comp-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0;
          letter-spacing: 0.04em;
        }

        .comp-desc {
          color: #94a3b8;
          font-size: 0.72rem;
          line-height: 1.5;
          margin: 0;
          flex: 1;
        }

        .comp-bar-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 0.5rem;
        }

        .comp-bar-fill {
          height: 100%;
          border-radius: 2px;
        }

        .case-study-banner {
          background: rgba(7, 12, 18, 0.75);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }

        .case-study-header {
          font-size: 0.68rem;
          color: #64748b;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }

        .case-tag { color: #38bdf8; font-weight: 700; }

        .case-study-comparison-row {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .case-card {
          flex: 1;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .case-card.critical-case {
          border-left: 3px solid #ff3b4d;
        }

        .case-card.noisy-case {
          border-left: 3px solid #64748b;
        }

        .case-id { font-size: 0.75rem; font-weight: 700; color: #f8fafc; }

        .case-priority-badge {
          font-size: 0.62rem;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          font-weight: 700;
        }
        .case-priority-badge.p1 { background: rgba(255, 59, 77, 0.15); color: #ff3b4d; border: 1px solid rgba(255, 59, 77, 0.3); }
        .case-priority-badge.p4 { background: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); }

        .case-asset-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
        }

        .case-metrics-strip {
          background: rgba(5, 8, 12, 0.6);
          padding: 0.75rem 1rem;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .case-metrics-strip .label { font-size: 0.58rem; color: #64748b; display: block; margin-bottom: 0.2rem; }
        .case-metrics-strip .val { font-size: 0.85rem; }
        .case-metrics-strip .risk-large { font-size: 1.4rem; }

        .text-white { color: #f8fafc; }
        .text-red { color: #ff3b4d; }
        .text-amber { color: #ffb020; }
        .text-slate { color: #94a3b8; }

        .case-explanation {
          color: #94a3b8;
          font-size: 0.75rem;
          line-height: 1.55;
          margin: 0;
        }

        .case-versus-badge {
          font-size: 0.85rem;
          font-weight: 800;
          color: #38bdf8;
          padding: 0.5rem;
          user-select: none;
        }

        @media (max-width: 900px) {
          .case-study-comparison-row {
            flex-direction: column;
          }
          .case-versus-badge {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </section>
  );
}
export default RiskIntelligenceSection;
