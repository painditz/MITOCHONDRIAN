// client/src/components/CorrelationSection.jsx
// CORRELATION EXPLANATION & ASSET RISK DISTRIBUTION
// Visual pipeline: 3,000 Alerts -> Observable Evidence (Host, User, Observable, Time) -> 15 Correlated Clusters
// Explicit technical distinction: 15 Clusters include actionable security attacks + operational baseline noise!
import React, { useMemo } from 'react';

export function CorrelationSection({ incidents = [], onSelectIncident }) {
  // Top assets by risk dynamically aggregated from live incidents
  const topAssets = useMemo(() => {
    const assetMap = {};
    incidents.forEach((inc) => {
      const asset = inc.asset_name || inc.hostname || inc.asset || 'CORP-HOST';
      const risk = Number(inc.risk_score ?? inc.riskScore ?? 0);
      const crit = inc.asset_criticality || inc.criticality || 'HIGH';
      const prio = inc.priority || 'P1';

      if (!assetMap[asset] || assetMap[asset].risk < risk) {
        assetMap[asset] = { asset, risk, crit, prio, incId: inc.incident_id || inc.id };
      }
    });

    return Object.values(assetMap)
      .sort((a, b) => b.risk - a.risk)
      .slice(0, 5);
  }, [incidents]);

  // Priority distribution counts
  const prioCounts = useMemo(() => {
    const c = { P1: 0, P2: 0, P3: 0, P4: 0 };
    incidents.forEach((i) => {
      const p = String(i.priority || 'P1').slice(0, 2);
      if (c[p] !== undefined) c[p]++;
      else c.P4++;
    });
    return c;
  }, [incidents]);

  const totalInc = incidents.length || 15;

  return (
    <section className="sentinel-section correlation-section" id="correlation">
      <div className="section-inner-container">
        
        {/* Section Header */}
        <div className="section-header-block">
          <div className="section-eyebrow-tag mono">
            <span className="code-accent">03</span>
            <span className="code-sep">/</span>
            <span>DETERMINISTIC OBSERVABLE CORRELATION</span>
          </div>
          <div className="section-headline-row flex-between">
            <h2 className="section-title-large">
              FROM 3,000 ALERTS TO 15 CLUSTERS.
            </h2>
            <p className="section-description-text">
              Zero black-box clustering. SentinelOps builds deterministic correlation graphs from shared observable telemetry anchors across temporal sliding windows.
            </p>
          </div>
        </div>

        {/* 4-Stage Horizontal Observable Funnel */}
        <div className="funnel-diagram-card">
          <div className="funnel-step">
            <div className="funnel-step-badge mono">INPUT STREAM</div>
            <div className="funnel-step-num mono">3,000</div>
            <div className="funnel-step-label">RAW ALERTS</div>
            <p className="funnel-step-desc">
              Heterogeneous alerts from CrowdStrike, Suricata, Windows Security Events, and Azure AD.
            </p>
          </div>

          <div className="funnel-chevron mono">&rarr;</div>

          <div className="funnel-step highlight-step">
            <div className="funnel-step-badge mono">OBSERVABLE PIVOTS</div>
            <div className="observable-tags-grid mono">
              <span className="obs-tag">HOST FQDN</span>
              <span className="obs-tag">USER sAMAccount</span>
              <span className="obs-tag">EXTERNAL IP</span>
              <span className="obs-tag">TIME &Delta; &le; 60m</span>
            </div>
            <div className="funnel-step-label">PAIRWISE GRAPH</div>
            <p className="funnel-step-desc">
              Entity graph links signals that share identity, network, or endpoint infrastructure.
            </p>
          </div>

          <div className="funnel-chevron mono">&rarr;</div>

          <div className="funnel-step">
            <div className="funnel-step-badge mono">SYNTHESIS</div>
            <div className="funnel-step-num mono text-cyan">15</div>
            <div className="funnel-step-label">CORRELATED CLUSTERS</div>
            <p className="funnel-step-desc">
              <b>Important:</b> Clusters include actionable security attacks AND operational baseline noise.
            </p>
          </div>
        </div>

        {/* Dual Grid: Top Assets by Risk & Priority Distribution */}
        <div className="correlation-metrics-dual-grid">
          
          {/* Top Assets by Risk */}
          <div className="assets-table-card">
            <div className="card-top flex-between mono">
              <span className="card-title">TOP ASSETS BY RISK INDEX</span>
              <span className="card-subtitle">DYNAMIC FROM API</span>
            </div>

            <div className="asset-rows-stack">
              {topAssets.map((item, idx) => (
                <div
                  key={idx}
                  className="asset-row flex-between"
                  onClick={() => onSelectIncident?.(incidents.find((i) => (i.incident_id || i.id) === item.incId))}
                >
                  <div className="asset-left">
                    <span className="asset-rank mono">0{idx + 1}</span>
                    <div>
                      <div className="asset-name-text mono">{item.asset}</div>
                      <span className="asset-crit-text mono">{item.crit}</span>
                    </div>
                  </div>

                  <div className="asset-right align-center">
                    <span className={`prio-pill ${item.prio.toLowerCase()} mono`}>{item.prio}</span>
                    <span className="asset-risk-score mono">{Number(item.risk).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Incident Priority Distribution */}
          <div className="prio-dist-card">
            <div className="card-top flex-between mono">
              <span className="card-title">INCIDENT RISK DISTRIBUTION</span>
              <span className="card-subtitle">{totalInc} TOTAL CLUSTERS</span>
            </div>

            <div className="prio-bars-container">
              {/* P1 Bar */}
              <div className="prio-dist-row">
                <div className="prio-info flex-between mono">
                  <span className="prio-name text-red">P1 &bull; CRITICAL SEVERITY</span>
                  <span className="prio-stat">{prioCounts.P1} CLUSTERS ({Math.round((prioCounts.P1 / totalInc) * 100)}%)</span>
                </div>
                <div className="prio-track">
                  <div className="prio-fill red" style={{ width: `${(prioCounts.P1 / totalInc) * 100}%` }} />
                </div>
              </div>

              {/* P2 Bar */}
              <div className="prio-dist-row">
                <div className="prio-info flex-between mono">
                  <span className="prio-name text-amber">P2 &bull; HIGH SEVERITY</span>
                  <span className="prio-stat">{prioCounts.P2} CLUSTERS ({Math.round((prioCounts.P2 / totalInc) * 100)}%)</span>
                </div>
                <div className="prio-track">
                  <div className="prio-fill amber" style={{ width: `${(prioCounts.P2 / totalInc) * 100}%` }} />
                </div>
              </div>

              {/* P3 Bar */}
              <div className="prio-dist-row">
                <div className="prio-info flex-between mono">
                  <span className="prio-name text-cyan">P3 &bull; MEDIUM SEVERITY</span>
                  <span className="prio-stat">{prioCounts.P3} CLUSTERS ({Math.round((prioCounts.P3 / totalInc) * 100)}%)</span>
                </div>
                <div className="prio-track">
                  <div className="prio-fill cyan" style={{ width: `${(prioCounts.P3 / totalInc) * 100}%` }} />
                </div>
              </div>

              {/* P4 Bar */}
              <div className="prio-dist-row">
                <div className="prio-info flex-between mono">
                  <span className="prio-name text-slate">P4 &bull; LOW / OPERATIONAL NOISE</span>
                  <span className="prio-stat">{prioCounts.P4} CLUSTERS ({Math.round((prioCounts.P4 / totalInc) * 100)}%)</span>
                </div>
                <div className="prio-track">
                  <div className="prio-fill slate" style={{ width: `${(prioCounts.P4 / totalInc) * 100}%` }} />
                </div>
              </div>
            </div>

            <div className="prio-footnote mono">
              Distribution reflects verified triage queue: critical assets prioritized first, benign baseline relegated.
            </div>
          </div>

        </div>

      </div>

      <style>{`
        .correlation-section {
          padding: 5rem 0;
          position: relative;
          z-index: 5;
        }

        .funnel-diagram-card {
          background: rgba(7, 12, 18, 0.75);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 8px;
          padding: 2.2rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }

        .funnel-step {
          flex: 1;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .funnel-step.highlight-step {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.35);
        }

        .funnel-step-badge {
          font-size: 0.62rem;
          color: #64748b;
          letter-spacing: 0.12em;
        }

        .funnel-step-num {
          font-size: 2.2rem;
          font-weight: 800;
          line-height: 1;
          color: #ffffff;
        }

        .funnel-step-label {
          font-size: 0.85rem;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: 0.06em;
        }

        .funnel-step-desc {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }

        .observable-tags-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.4rem;
          margin: 0.4rem 0;
        }

        .obs-tag {
          font-size: 0.62rem;
          padding: 0.25rem 0.45rem;
          background: rgba(56, 189, 248, 0.12);
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #38bdf8;
          border-radius: 3px;
          text-align: center;
        }

        .funnel-chevron {
          font-size: 1.5rem;
          color: #64748b;
          user-select: none;
        }

        .correlation-metrics-dual-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .assets-table-card, .prio-dist-card {
          background: rgba(7, 12, 18, 0.65);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 8px;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .card-top {
          font-size: 0.68rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.75rem;
        }

        .card-title { font-weight: 700; color: #f8fafc; }
        .card-subtitle { color: #64748b; }

        .asset-rows-stack {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .asset-row {
          padding: 0.75rem 1rem;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
        }

        .asset-row:hover {
          background: rgba(56, 189, 248, 0.1);
          border-color: rgba(56, 189, 248, 0.35);
          transform: translateX(4px);
        }

        .asset-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .asset-rank {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 700;
        }

        .asset-name-text {
          font-size: 0.82rem;
          font-weight: 700;
          color: #ffffff;
        }

        .asset-crit-text {
          font-size: 0.62rem;
          color: #94a3b8;
        }

        .asset-right {
          gap: 0.75rem;
        }

        .prio-pill {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
        }
        .prio-pill.p1 { background: rgba(255, 59, 77, 0.2); color: #ff3b4d; }
        .prio-pill.p2 { background: rgba(255, 176, 32, 0.2); color: #ffb020; }
        .prio-pill.p3 { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
        .prio-pill.p4 { background: rgba(100, 116, 139, 0.2); color: #94a3b8; }

        .asset-risk-score {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
          min-width: 42px;
          text-align: right;
        }

        .prio-bars-container {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }

        .prio-dist-row {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .prio-info {
          font-size: 0.68rem;
        }

        .prio-track {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          overflow: hidden;
        }

        .prio-fill {
          height: 100%;
          border-radius: 4px;
        }
        .prio-fill.red { background: #ff3b4d; box-shadow: 0 0 10px rgba(255, 59, 77, 0.6); }
        .prio-fill.amber { background: #ffb020; box-shadow: 0 0 10px rgba(255, 176, 32, 0.6); }
        .prio-fill.cyan { background: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.6); }
        .prio-fill.slate { background: #64748b; }

        .prio-footnote {
          font-size: 0.68rem;
          color: #64748b;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 0.75rem;
          margin-top: auto;
        }

        @media (max-width: 900px) {
          .funnel-diagram-card {
            flex-direction: column;
          }
          .funnel-chevron {
            transform: rotate(90deg);
          }
          .correlation-metrics-dual-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
export default CorrelationSection;
