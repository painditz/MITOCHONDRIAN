// client/src/components/triage/HumanReviewDashboard.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Enterprise Review Dashboard & Analytics
// Derived strictly from backend review persistence with zero manufactured metrics.
import React, { useState, useEffect } from 'react';
import { UserCheck, ShieldCheck, AlertOctagon, GitMerge, Scissors, RefreshCw, BarChart2 } from 'lucide-react';

export function HumanReviewDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = () => {
    setLoading(true);
    fetch('http://127.0.0.1:8000/api/reviews/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSummary(data);
      })
      .catch((err) => {
        console.error('[HumanReviewDashboard Fetch Error]', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const kpis = summary?.kpi_metrics || {};
  const analytics = summary?.analytics || {};
  const hasData = Boolean(summary?.has_empirical_data);

  return (
    <div className="human-review-dashboard-root mono">
      <div className="hrd-header flex-between align-center">
        <div className="align-center" style={{ gap: '0.5rem' }}>
          <UserCheck size={14} className="text-copper" />
          <span className="hrd-title">HUMAN REVIEW &bull; SOC ANALYST DECISION LAYER</span>
        </div>
        <button
          type="button"
          className="hrd-refresh-btn align-center"
          onClick={fetchSummary}
          title="Refresh live review metrics"
        >
          <RefreshCw size={11} className={loading ? 'spinning' : ''} />
          <span>LIVE AUDIT DATA</span>
        </button>
      </div>

      {!hasData ? (
        <div className="no-data-card align-center justify-center">
          <span className="no-data-text">NO EMPIRICAL DATA YET</span>
          <span className="no-data-sub">
            Analyst decisions, brief reviews, overrides, or correlation validations will appear here as they occur.
          </span>
        </div>
      ) : (
        <div className="hrd-content-grid">
          {/* Top 6 KPI Metric Cards */}
          <div className="hrd-kpi-strip">
            <div className="kpi-mini-card">
              <span className="kpi-label">INCIDENTS REVIEWED</span>
              <span className="kpi-value text-white">{kpis.incidents_reviewed ?? 0}</span>
            </div>
            <div className="kpi-mini-card">
              <span className="kpi-label">AI BRIEFS REVIEWED</span>
              <span className="kpi-value text-copper">{kpis.ai_briefs_reviewed ?? 0}</span>
            </div>
            <div className="kpi-mini-card">
              <span className="kpi-label">ANALYST CONFIRMATIONS</span>
              <span className="kpi-value text-green">{kpis.analyst_confirmations ?? 0}</span>
            </div>
            <div className="kpi-mini-card">
              <span className="kpi-label">ANALYST REJECTIONS</span>
              <span className="kpi-value text-burgundy">{kpis.analyst_rejections ?? 0}</span>
            </div>
            <div className="kpi-mini-card">
              <span className="kpi-label">PRIORITY OVERRIDES</span>
              <span className="kpi-value text-copper">{kpis.analyst_overrides ?? 0}</span>
            </div>
            <div className="kpi-mini-card">
              <span className="kpi-label">OPEN REVIEWS</span>
              <span className="kpi-value text-slate">{kpis.open_reviews ?? 0}</span>
            </div>
          </div>

          {/* Explicitly Labelled: ANALYST REVIEW DATA */}
          <div className="analyst-review-data-panel">
            <div className="ard-header flex-between align-center">
              <div className="align-center" style={{ gap: '0.45rem' }}>
                <BarChart2 size={13} className="text-copper" />
                <span className="ard-title">ANALYST REVIEW DATA</span>
              </div>
              <span className="ard-disclaimer">EMPIRICAL HUMAN DECISION METRICS (NOT MODEL ACCURACY)</span>
            </div>

            <div className="analytics-quad-grid">
              {/* Decision Breakdown */}
              <div className="analytics-quad-card">
                <span className="quad-title">ANALYST DECISIONS</span>
                <div className="metrics-list">
                  {Object.entries(analytics.decisions || {}).length === 0 ? (
                    <span className="dim-text">No decisions submitted</span>
                  ) : (
                    Object.entries(analytics.decisions).map(([dec, count]) => (
                      <div key={dec} className="metric-row flex-between">
                        <span className="metric-name">{dec}</span>
                        <span className="metric-count">{count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Brief Acceptance Breakdown */}
              <div className="analytics-quad-card">
                <span className="quad-title">AI BRIEF EVALUATION</span>
                <div className="metrics-list">
                  <div className="metric-row flex-between">
                    <span className="metric-name">Accepted Unchanged</span>
                    <span className="metric-count text-green">{analytics.ai_brief_acceptance?.Accepted ?? 0}</span>
                  </div>
                  <div className="metric-row flex-between">
                    <span className="metric-name">Analyst Modified</span>
                    <span className="metric-count text-copper">{analytics.ai_brief_acceptance?.Modified ?? 0}</span>
                  </div>
                  <div className="metric-row flex-between">
                    <span className="metric-name">Rejected / Replaced</span>
                    <span className="metric-count text-burgundy">{analytics.ai_brief_acceptance?.Rejected ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Topology Oversight */}
              <div className="analytics-quad-card">
                <span className="quad-title">GRAPH &amp; TOPOLOGY ACTIONS</span>
                <div className="metrics-list">
                  <div className="metric-row flex-between">
                    <span className="metric-name">Correlation Challenges</span>
                    <span className="metric-count text-burgundy">{analytics.correlation_challenges ?? 0}</span>
                  </div>
                  <div className="metric-row flex-between">
                    <span className="metric-name">Merge Proposals</span>
                    <span className="metric-count text-copper">{analytics.merge_decisions ?? 0}</span>
                  </div>
                  <div className="metric-row flex-between">
                    <span className="metric-name">Split Proposals</span>
                    <span className="metric-count text-slate">{analytics.split_decisions ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Priority Overrides List */}
              <div className="analytics-quad-card">
                <span className="quad-title">ACTIVE PRIORITY OVERRIDES</span>
                <div className="overrides-list">
                  {(analytics.priority_overrides || []).length === 0 ? (
                    <span className="dim-text">Zero priority overrides active</span>
                  ) : (
                    analytics.priority_overrides.map((po, idx) => (
                      <div key={idx} className="override-item">
                        <span className="po-id">{po.incident_id}:</span>
                        <span className="po-change">{po.system_priority} &rarr; <b>{po.analyst_priority}</b></span>
                        <span className="po-reason text-truncate" title={po.reason}>{po.reason}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .human-review-dashboard-root {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          color: #F3EFE8;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .hrd-header {
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .text-copper { color: #A96B42; }
        .text-green { color: #5F9E88; }
        .text-burgundy { color: #E28498; }
        .text-slate { color: #C8C2B9; }

        .hrd-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #F3EFE8;
        }

        .hrd-refresh-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #817B73;
          font-size: 0.6rem;
          padding: 0.25rem 0.55rem;
          border-radius: 3px;
          gap: 0.35rem;
          cursor: pointer;
        }
        .hrd-refresh-btn:hover {
          color: #F3EFE8;
          border-color: #A96B42;
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .no-data-card {
          padding: 2.5rem 1.5rem;
          background: #242321;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          flex-direction: column;
          gap: 0.5rem;
          text-align: center;
        }
        .no-data-text {
          font-size: 0.72rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.12em;
        }
        .no-data-sub {
          font-size: 0.62rem;
          color: #817B73;
          max-width: 440px;
        }

        .hrd-content-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hrd-kpi-strip {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.65rem;
        }
        @media (max-width: 1024px) {
          .hrd-kpi-strip {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .kpi-mini-card {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .kpi-label {
          font-size: 0.56rem;
          color: #817B73;
          letter-spacing: 0.06em;
        }
        .kpi-value {
          font-size: 1.15rem;
          font-weight: 700;
        }

        .analyst-review-data-panel {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ard-header {
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .ard-title {
          font-size: 0.68rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.08em;
        }
        .ard-disclaimer {
          font-size: 0.55rem;
          color: #817B73;
        }

        .analytics-quad-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 1024px) {
          .analytics-quad-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .analytics-quad-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          padding: 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }
        .quad-title {
          font-size: 0.58rem;
          font-weight: 700;
          color: #817B73;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .metric-row {
          font-size: 0.62rem;
        }
        .metric-name {
          color: #C8C2B9;
        }
        .metric-count {
          font-weight: 700;
          color: #F3EFE8;
        }

        .overrides-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          font-size: 0.6rem;
        }
        .override-item {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;
        }
        .po-id {
          font-weight: 700;
          color: #A96B42;
        }
        .po-change {
          color: #F3EFE8;
        }
        .po-reason {
          font-size: 0.55rem;
          color: #817B73;
        }
        .dim-text {
          font-size: 0.58rem;
          color: #555;
        }
      `}</style>
    </div>
  );
}
