// client/src/components/incidents/IncidentSummaryStrip.jsx
// Incident Summary Strip: TOTAL INCIDENTS, P1, P2, P3, P4, HIGHEST RISK
// Sourced 100% dynamically from authoritative API incidents
// Dark glass architecture matching SentinelOps master tokens
import React, { useMemo } from 'react';

export function IncidentSummaryStrip({ incidents = [] }) {
  const stats = useMemo(() => {
    let p1 = 0;
    let p2 = 0;
    let p3 = 0;
    let p4 = 0;
    let maxRisk = 0;

    for (const inc of incidents) {
      const p = String(inc.priority || '').slice(0, 2).toUpperCase();
      if (p === 'P1') p1++;
      else if (p === 'P2') p2++;
      else if (p === 'P3') p3++;
      else if (p === 'P4') p4++;

      const risk = Number(inc.risk_score ?? inc.riskScore ?? 0);
      if (risk > maxRisk) maxRisk = risk;
    }

    return {
      total: incidents.length,
      p1,
      p2,
      p3,
      p4,
      highestRisk: maxRisk,
    };
  }, [incidents]);

  return (
    <div className="incident-summary-strip">
      <div className="summary-metric-item">
        <span className="summary-label mono">TOTAL INCIDENTS</span>
        <div className="summary-val mono text-white">{stats.total}</div>
        <span className="summary-sub mono">ACTIVE CORRELATED</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-metric-item">
        <span className="summary-label mono text-p1">P1 CRITICAL</span>
        <div className="summary-val mono text-p1">{stats.p1}</div>
        <span className="summary-sub mono">IMMEDIATE TRIAGE</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-metric-item">
        <span className="summary-label mono text-p2">P2 HIGH</span>
        <div className="summary-val mono text-p2">{stats.p2}</div>
        <span className="summary-sub mono">ELEVATED EXPOSURE</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-metric-item">
        <span className="summary-label mono text-p3">P3 MEDIUM</span>
        <div className="summary-val mono text-p3">{stats.p3}</div>
        <span className="summary-sub mono">TACTICAL ANOMALIES</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-metric-item">
        <span className="summary-label mono text-p4">P4 LOW</span>
        <div className="summary-val mono text-p4">{stats.p4}</div>
        <span className="summary-sub mono">MONITORED CLUSTERS</span>
      </div>

      <div className="summary-divider" />

      <div className="summary-metric-item highest-risk-item">
        <span className="summary-label mono">HIGHEST RISK</span>
        <div className="summary-val mono text-p1">
          {stats.highestRisk > 0 ? stats.highestRisk.toFixed(1) : '0.0'}
          <span className="summary-denom mono">/100</span>
        </div>
        <span className="summary-sub mono">PEAK CORRELATED INDEX</span>
      </div>

      <style>{`
        .incident-summary-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          margin-bottom: 2rem;
          gap: 1.5rem;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.09);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 8px;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
        }

        .summary-metric-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .summary-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #817B73;
        }

        .summary-val {
          font-size: 1.85rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .summary-denom {
          font-size: 0.85rem;
          color: #817B73;
          margin-left: 0.25rem;
        }

        .summary-sub {
          font-size: 0.58rem;
          color: #B9B3AA;
          letter-spacing: 0.06em;
        }

        .summary-divider {
          width: 1px;
          height: 38px;
          background: rgba(255, 255, 255, 0.08);
        }

        .text-white { color: #F3EFE8; }
        .text-p1 { color: #B84D61; }
        .text-p2 { color: #C18A4A; }
        .text-p3 { color: #5C9480; }
        .text-p4 { color: #77818A; }

        @media (max-width: 900px) {
          .incident-summary-strip {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            padding: 1rem;
          }
          .summary-divider { display: none; }
        }
      `}</style>
    </div>
  );
}

export default IncidentSummaryStrip;
