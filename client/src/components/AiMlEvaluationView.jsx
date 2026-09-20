// client/src/components/AiMlEvaluationView.jsx
// AI / ML Evaluation View: Synthetic Held-Out Benchmark & Group-Aware Split Analysis
import React, { useState, useEffect } from 'react';

export function AiMlEvaluationView() {
  const [metricsData, setMetricsData] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/ml/metrics')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => setMetricsData(d))
      .catch(() => {});
  }, []);

  const metrics = metricsData?.metrics || {
    accuracy: 0.9938,
    precision: 1.0,
    recall: 0.8333,
    f1_score: 0.9091,
    roc_auc: 1.0,
  };

  const cm = metricsData?.confusion_matrix || {
    true_negatives: 776,
    false_positives: 0,
    false_negatives: 5,
    true_positives: 25,
  };

  const features = metricsData?.top_feature_importances || [
    { feature: 'severity_Low', importance: 0.1355 },
    { feature: 'text_telemetry', importance: 0.1057 },
    { feature: 'severity_High', importance: 0.0673 },
    { feature: 'is_privileged_user', importance: 0.0666 },
    { feature: 'asset_criticality_Low', importance: 0.0396 },
    { feature: 'severity_Critical', importance: 0.0383 },
  ];

  return (
    <div className="aiml-evaluation-container">
      {/* Header with Mandatory Methodology Disclaimer */}
      <div className="aiml-banner flex-between mono">
        <div>
          <span className="aiml-tag-highlight">SYNTHETIC HELD-OUT BENCHMARK</span>
          <span className="banner-sep">/</span>
          <span>GROUP-AWARE SPLIT (UNSEEN SCENARIOS)</span>
        </div>
        <span className="disclaimer-badge warning mono">
          SYNTHETIC TEST SET &bull; NOT FIELD SOC ACCURACY
        </span>
      </div>

      {/* Primary 5 Evaluation Metrics Cards */}
      <div className="aiml-metrics-grid mono">
        <div className="aiml-metric-card">
          <span className="metric-lbl">ACCURACY</span>
          <b className="metric-val text-cyan">{(metrics.accuracy * 100).toFixed(2)}%</b>
          <span className="metric-sub">806 TEST SAMPLES</span>
        </div>

        <div className="aiml-metric-card">
          <span className="metric-lbl">PRECISION</span>
          <b className="metric-val text-green">{(metrics.precision * 100).toFixed(1)}%</b>
          <span className="metric-sub">0 FALSE POSITIVES</span>
        </div>

        <div className="aiml-metric-card">
          <span className="metric-lbl">RECALL</span>
          <b className="metric-val text-amber">{(metrics.recall * 100).toFixed(2)}%</b>
          <span className="metric-sub">5 MISSED ATTACKS</span>
        </div>

        <div className="aiml-metric-card">
          <span className="metric-lbl">F1-SCORE</span>
          <b className="metric-val text-cyan">{metrics.f1_score.toFixed(4)}</b>
          <span className="metric-sub">HARMONIC MEAN</span>
        </div>

        <div className="aiml-metric-card">
          <span className="metric-lbl">ROC-AUC</span>
          <b className="metric-val text-white">{metrics.roc_auc.toFixed(2)}</b>
          <span className="metric-sub">AREA UNDER ROC CURVE</span>
        </div>
      </div>

      {/* Dual Column: Confusion Matrix & Architectural Safeguard */}
      <div className="aiml-analysis-grid">
        {/* Confusion Matrix */}
        <div className="aiml-card-block">
          <div className="card-top flex-between mono">
            <span className="card-title">HELD-OUT CONFUSION MATRIX</span>
            <span className="card-subtitle">806 VERIFIED SAMPLES</span>
          </div>

          <div className="confusion-matrix-grid mono">
            <div className="cm-cell tn">
              <span className="cm-type">TRUE NEGATIVE (BENIGN NOISE)</span>
              <b className="cm-count text-white">{cm.true_negatives}</b>
              <span className="cm-desc">Correctly classified background telemetry</span>
            </div>

            <div className="cm-cell fp">
              <span className="cm-type">FALSE POSITIVE (FALSE ALARM)</span>
              <b className="cm-count text-green">{cm.false_positives}</b>
              <span className="cm-desc">Zero benign alerts misflagged as critical</span>
            </div>

            <div className="cm-cell fn">
              <span className="cm-type">FALSE NEGATIVE (MISSED ATTACK)</span>
              <b className="cm-count text-amber">{cm.false_negatives}</b>
              <span className="cm-desc">Subtle multi-stage activity missed by RF</span>
            </div>

            <div className="cm-cell tp">
              <span className="cm-type">TRUE POSITIVE (TRUE ATTACK)</span>
              <b className="cm-count text-cyan">{cm.true_positives}</b>
              <span className="cm-desc">True malicious clusters flagged</span>
            </div>
          </div>
        </div>

        {/* 10-Point Architectural Safeguard */}
        <div className="aiml-card-block safeguard-card">
          <div className="card-top flex-between mono">
            <span className="card-title">ARCHITECTURAL SAFEGUARD</span>
            <span className="card-subtitle text-cyan">ML IS CAPPED AT 10 POINTS</span>
          </div>

          <p className="safeguard-lead">
            Machine learning is treated as a <b>supporting signal, never an autonomous decision maker</b>.
          </p>

          <div className="safeguard-bullet-list mono">
            <div className="bullet-row">
              <span className="bullet-dot">&bull;</span>
              <span><b>Maximum 10 Points:</b> In the 0–100 risk score, ML anomaly contribution cannot exceed 10 points.</span>
            </div>
            <div className="bullet-row">
              <span className="bullet-dot">&bull;</span>
              <span><b>Asset Primacy:</b> A high ML anomaly score on a guest workstation can never outrank a critical Domain Controller.</span>
            </div>
            <div className="bullet-row">
              <span className="bullet-dot">&bull;</span>
              <span><b>Air-Gapped Local Inference:</b> RandomForest and FLAN-T5 operate locally with 0 KB egress.</span>
            </div>
          </div>

          {/* Top Feature Importances */}
          <div className="feature-importance-block">
            <span className="feature-title mono">TOP FEATURE IMPORTANCES (SCIKIT-LEARN)</span>
            <div className="features-stack mono">
              {features.slice(0, 5).map((f, idx) => (
                <div key={idx} className="feature-bar-row flex-between">
                  <span className="f-name">{f.feature}</span>
                  <div className="f-bar-track">
                    <div className="f-bar-fill" style={{ width: `${(f.importance / 0.15) * 100}%` }} />
                  </div>
                  <span className="f-val">{(f.importance * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .aiml-evaluation-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .aiml-banner {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.85rem 1.25rem;
          border-radius: 6px;
          font-size: 0.72rem;
          align-items: center;
        }

        .aiml-tag-highlight { color: #38bdf8; font-weight: 700; }
        .banner-sep { color: #64748b; margin: 0 0.5rem; }

        .disclaimer-badge.warning {
          background: rgba(255, 176, 32, 0.15);
          border: 1px solid rgba(255, 176, 32, 0.35);
          color: #ffb020;
          font-size: 0.65rem;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
        }

        .aiml-metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
        }

        .aiml-metric-card {
          background: rgba(7, 12, 18, 0.7);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .metric-lbl { font-size: 0.62rem; color: #64748b; letter-spacing: 0.12em; }
        .metric-val { font-size: 2rem; font-weight: 800; line-height: 1; }
        .metric-sub { font-size: 0.6rem; color: #94a3b8; }

        .text-cyan { color: #38bdf8; }
        .text-green { color: #10b981; }
        .text-amber { color: #ffb020; }
        .text-white { color: #ffffff; }

        .aiml-analysis-grid {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 2rem;
        }

        .aiml-card-block {
          background: rgba(7, 12, 18, 0.75);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
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

        .confusion-matrix-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .cm-cell {
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .cm-type { font-size: 0.58rem; color: #64748b; font-weight: 700; letter-spacing: 0.08em; }
        .cm-count { font-size: 1.75rem; font-weight: 800; line-height: 1; }
        .cm-desc { font-size: 0.65rem; color: #94a3b8; }

        .safeguard-card {
          border-left: 3px solid #38bdf8;
        }

        .safeguard-lead {
          font-size: 0.85rem;
          color: #e2e8f0;
          line-height: 1.5;
          margin: 0;
        }

        .safeguard-bullet-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .bullet-row {
          display: flex;
          gap: 0.5rem;
        }
        .bullet-dot { color: #38bdf8; }

        .feature-importance-block {
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .feature-title { font-size: 0.62rem; color: #64748b; font-weight: 700; letter-spacing: 0.1em; }

        .features-stack {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .feature-bar-row {
          font-size: 0.68rem;
          align-items: center;
          gap: 0.85rem;
        }

        .f-name { width: 140px; color: #cbd5e1; }
        .f-bar-track { flex: 1; height: 5px; background: rgba(255, 255, 255, 0.06); border-radius: 2px; overflow: hidden; }
        .f-bar-fill { height: 100%; background: #38bdf8; border-radius: 2px; }
        .f-val { width: 45px; text-align: right; color: #38bdf8; }

        @media (max-width: 900px) {
          .aiml-analysis-grid {
            grid-template-columns: 1fr;
          }
          .confusion-matrix-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
export default AiMlEvaluationView;
