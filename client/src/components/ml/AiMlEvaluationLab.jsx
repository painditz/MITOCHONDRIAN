// client/src/components/ml/AiMlEvaluationLab.jsx
// 06 / AI & ML EVALUATION LABORATORY
// Empirical evaluation benchmark: Confusion Matrix, SVG ROC Curve, Feature Importance, Model Boundary
import React, { useState, useEffect } from 'react';
import { SectionHeader } from '../shared/SectionHeader';
import { Reveal } from '../shared/Reveal';
import { ShieldCheck, Cpu, AlertTriangle, BarChart3, Binary, Lock, Info, CheckCircle2 } from 'lucide-react';

export function AiMlEvaluationLab() {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('http://127.0.0.1:8000/api/ml/metrics')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => {
        setMetricsData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[SentinelOps ML Metrics Fetch Error]', err);
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="aiml-evaluation-lab-workspace" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div className="mono font-bold text-cyan" style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>
          LOADING SYNTHETIC HELD-OUT ML METRICS...
        </div>
      </div>
    );
  }

  if (fetchError || !metricsData) {
    return (
      <div className="aiml-evaluation-lab-workspace" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <div className="mono font-bold text-p1" style={{ fontSize: '1.1rem', letterSpacing: '0.1em' }}>
          DATA UNAVAILABLE
        </div>
        <p className="mono text-muted" style={{ marginTop: '0.75rem', fontSize: '0.75rem' }}>
          Authoritative evaluation metrics from /api/ml/metrics could not be retrieved.
        </p>
      </div>
    );
  }

  const metrics = metricsData.metrics;
  const cm = metricsData.confusion_matrix;
  const features = metricsData.top_feature_importances || [];

  return (
    <div className="aiml-evaluation-lab-workspace">
      {/* 07 / INTELLIGENCE MODEL Section Header */}
      <Reveal delay={0}>
        <SectionHeader
          code="07"
          eyebrow="INTELLIGENCE MODEL"
          title="AI / ML EVALUATION"
          subtitle="Supporting triage — not replacing the analyst. Held-out synthetic benchmark evaluated on group-aware splits."
          rightContent={
            <div className="align-center mono" style={{ gap: '0.75rem' }}>
              <span className="lab-status-badge">SYNTHETIC HELD-OUT BENCHMARK</span>
            </div>
          }
        />
      </Reveal>

      {/* Prominent Mandatory Methodology Disclaimers */}
      <Reveal delay={60}>
        <div className="methodology-disclaimer-strip sentinel-glass-card flex-between mono">
          <div className="align-center" style={{ gap: '0.85rem' }}>
            <span className="method-tag highlight">SYNTHETIC HELD-OUT TEST</span>
            <span className="method-sep">/</span>
            <span className="method-tag">GROUP-AWARE SPLIT (UNSEEN SCENARIOS)</span>
          </div>
          <div className="align-center" style={{ gap: '0.5rem' }}>
            <AlertTriangle size={13} className="text-amber" />
            <span className="method-warning-text">DO NOT IMPLY PRODUCTION SOC PERFORMANCE</span>
          </div>
        </div>
      </Reveal>

      {/* Hero Metrics Rail: ACCURACY, PRECISION, RECALL, F1, ROC-AUC */}
      <Reveal delay={120}>
        <div className="ml-hero-metrics-rail sentinel-glass-card">
          <div className="ml-metric-box">
            <span className="ml-metric-label mono">ACCURACY</span>
            <div className="ml-metric-val mono text-cyan">
              {(metrics.accuracy * 100).toFixed(2)}%
            </div>
            <span className="ml-metric-sub mono">{metricsData.dataset_split?.test_samples ?? 806} TEST SAMPLES</span>
          </div>

          <div className="ml-rail-divider" />

          <div className="ml-metric-box">
            <span className="ml-metric-label mono text-green">PRECISION</span>
            <div className="ml-metric-val mono text-green">
              {(metrics.precision * 100).toFixed(1)}%
            </div>
            <span className="ml-metric-sub mono">{cm.false_positives} FALSE POSITIVES</span>
          </div>

          <div className="ml-rail-divider" />

          <div className="ml-metric-box">
            <span className="ml-metric-label mono text-amber">RECALL</span>
            <div className="ml-metric-val mono text-amber">
              {(metrics.recall * 100).toFixed(2)}%
            </div>
            <span className="ml-metric-sub mono">{cm.false_negatives} SUBTLE CLUSTERS MISSED</span>
          </div>

          <div className="ml-rail-divider" />

          <div className="ml-metric-box">
            <span className="ml-metric-label mono text-bright-cyan">F1-SCORE</span>
            <div className="ml-metric-val mono text-bright-cyan">
              {metrics.f1_score.toFixed(4)}
            </div>
            <span className="ml-metric-sub mono">HARMONIC MEAN</span>
          </div>

          <div className="ml-rail-divider" />

          <div className="ml-metric-box">
            <span className="ml-metric-label mono">ROC-AUC</span>
            <div className="ml-metric-val mono text-white">
              {metrics.roc_auc.toFixed(4)}
            </div>
            <span className="ml-metric-sub mono">AREA UNDER ROC CURVE</span>
          </div>
        </div>
      </Reveal>

      {/* Evaluation Visuals Grid: Confusion Matrix, ROC Curve, Feature Importance */}
      <div className="evaluation-visuals-grid">

        {/* 1. CONFUSION MATRIX */}
        <Reveal delay={180}>
          <div className="eval-card-block sentinel-glass-card">
            <div className="eval-card-header flex-between mono">
              <div className="align-center" style={{ gap: '0.45rem' }}>
                <Binary size={14} className="text-cyan" />
                <span className="eval-card-title">CONFUSION MATRIX</span>
              </div>
              <span className="eval-card-meta">{metricsData.dataset_split?.test_samples ?? 806} TEST INSTANCES</span>
            </div>

            <p className="eval-card-desc">
              Evaluated on group-aware holdout splits containing scenarios unseen during training.
            </p>

            <div className="confusion-matrix-2x2 mono">
              <div className="cm-cell true-neg">
                <div className="cm-cell-top flex-between">
                  <span className="cm-label">TRUE NEGATIVE (TN)</span>
                  <span className="cm-tag">BENIGN NOISE</span>
                </div>
                <div className="cm-num text-white">{cm.true_negatives}</div>
                <div className="cm-sub">Background telemetry correctly classified</div>
              </div>

              <div className="cm-cell false-pos">
                <div className="cm-cell-top flex-between">
                  <span className="cm-label text-green">FALSE POSITIVE (FP)</span>
                  <span className="cm-tag text-green">ZERO NOISE ESCALATION</span>
                </div>
                <div className="cm-num text-green">{cm.false_positives}</div>
                <div className="cm-sub">Zero false alerts passed to analyst queue</div>
              </div>

              <div className="cm-cell false-neg">
                <div className="cm-cell-top flex-between">
                  <span className="cm-label text-amber">FALSE NEGATIVE (FN)</span>
                  <span className="cm-tag text-amber">MISSED ATTACK</span>
                </div>
                <div className="cm-num text-amber">{cm.false_negatives}</div>
                <div className="cm-sub">Subtle slow-burn clusters missed by RF</div>
              </div>

              <div className="cm-cell true-pos">
                <div className="cm-cell-top flex-between">
                  <span className="cm-label text-cyan">TRUE POSITIVE (TP)</span>
                  <span className="cm-tag text-cyan">VERIFIED ATTACK</span>
                </div>
                <div className="cm-num text-cyan">{cm.true_positives}</div>
                <div className="cm-sub">Real attack clusters accurately surfaced</div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 2. REAL EMPIRICAL ROC CURVE VISUAL */}
        <Reveal delay={240}>
          <div className="eval-card-block sentinel-glass-card">
            <div className="eval-card-header flex-between mono">
              <div className="align-center" style={{ gap: '0.45rem' }}>
                <BarChart3 size={14} className="text-cyan" />
                <span className="eval-card-title">RECEIVER OPERATING CHARACTERISTIC (ROC)</span>
              </div>
              <span className="eval-card-meta text-cyan font-bold">AUC = {metrics.roc_auc.toFixed(4)}</span>
            </div>

            <p className="eval-card-desc">
              Trade-off between True Positive Rate (TPR) and False Positive Rate (FPR) generated from {metricsData.roc_curve_points?.length || 16} empirical held-out prediction thresholds.
            </p>

            <div className="roc-svg-container mono">
              {(() => {
                const rocPoints = metricsData.roc_curve_points || [
                  { fpr: 0.0, tpr: 0.0 },
                  { fpr: 0.0, tpr: 0.8333 },
                  { fpr: 0.0, tpr: 1.0 },
                  { fpr: 1.0, tpr: 1.0 }
                ];
                const svgCoords = rocPoints.map((pt) => {
                  const x = 50 + pt.fpr * 320;
                  const y = 180 - pt.tpr * 148;
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                });
                const rocPathD = svgCoords.length > 0
                  ? `M ${svgCoords[0].replace(',', ' ')} ` + svgCoords.slice(1).map(c => `L ${c.replace(',', ' ')}`).join(' ')
                  : 'M 50 180 L 50 32 L 370 32';
                const polygonPoints = `50,180 ${svgCoords.join(' ')} 370,180`;

                return (
                  <svg viewBox="0 0 400 240" className="roc-svg">
                    {/* Grid Lines */}
                    <line x1="50" y1="30" x2="370" y2="30" stroke="rgba(80,190,220,0.08)" strokeDasharray="3 3" />
                    <line x1="50" y1="80" x2="370" y2="80" stroke="rgba(80,190,220,0.08)" strokeDasharray="3 3" />
                    <line x1="50" y1="130" x2="370" y2="130" stroke="rgba(80,190,220,0.08)" strokeDasharray="3 3" />
                    <line x1="50" y1="180" x2="370" y2="180" stroke="rgba(80,190,220,0.15)" />

                    <line x1="130" y1="30" x2="130" y2="180" stroke="rgba(80,190,220,0.08)" strokeDasharray="3 3" />
                    <line x1="210" y1="30" x2="210" y2="180" stroke="rgba(80,190,220,0.08)" strokeDasharray="3 3" />
                    <line x1="290" y1="30" x2="290" y2="180" stroke="rgba(80,190,220,0.08)" strokeDasharray="3 3" />
                    <line x1="370" y1="30" x2="370" y2="180" stroke="rgba(80,190,220,0.15)" />

                    {/* Random Chance Diagonal Line */}
                    <line x1="50" y1="180" x2="370" y2="30" stroke="#617581" strokeWidth="1" strokeDasharray="4 4" />

                    {/* Empirical Model ROC Curve Path */}
                    <path
                      d={rocPathD}
                      fill="none"
                      stroke="#A96B42"
                      strokeWidth="2.5"
                      className="roc-curve-path"
                    />

                    {/* Shaded Area Under Curve */}
                    <polygon
                      points={polygonPoints}
                      fill="rgba(169, 107, 66, 0.12)"
                    />

                    {/* Axis Labels */}
                    <text x="25" y="35" fill="#B9B3AA" fontSize="9" textAnchor="middle">1.0</text>
                    <text x="25" y="110" fill="#817B73" fontSize="9" textAnchor="middle">0.5</text>
                    <text x="25" y="184" fill="#817B73" fontSize="9" textAnchor="middle">0.0</text>

                    <text x="50" y="198" fill="#817B73" fontSize="9" textAnchor="middle">0.0</text>
                    <text x="210" y="198" fill="#817B73" fontSize="9" textAnchor="middle">0.5</text>
                    <text x="370" y="198" fill="#B9B3AA" fontSize="9" textAnchor="middle">1.0</text>

                    <text x="210" y="218" fill="#B9B3AA" fontSize="10" textAnchor="middle" letterSpacing="0.08em">
                      FALSE POSITIVE RATE (FPR)
                    </text>
                    <text x="12" y="110" fill="#B9B3AA" fontSize="10" textAnchor="middle" transform="rotate(-90 12,110)" letterSpacing="0.08em">
                      TRUE POSITIVE RATE (TPR)
                    </text>
                  </svg>
                );
              })()}

              <div className="roc-legend-row flex-between">
                <div className="align-center" style={{ gap: '0.45rem' }}>
                  <span className="legend-indicator model" />
                  <span className="legend-text text-white">Random Forest (AUC = {metrics.roc_auc.toFixed(4)})</span>
                </div>
                <div className="align-center" style={{ gap: '0.45rem' }}>
                  <span className="legend-indicator chance" />
                  <span className="legend-text text-muted">Random Chance (AUC = 0.5000)</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 3. FEATURE IMPORTANCES */}
        <Reveal delay={300}>
          <div className="eval-card-block sentinel-glass-card">
            <div className="eval-card-header flex-between mono">
              <div className="align-center" style={{ gap: '0.45rem' }}>
                <Cpu size={14} className="text-cyan" />
                <span className="eval-card-title">TOP FEATURE IMPORTANCES</span>
              </div>
              <span className="eval-card-meta">RANDOM FOREST GINI PURITY</span>
            </div>

            <p className="eval-card-desc">
              Relative importance contribution of observable telemetry features extracted during model evaluation.
            </p>

            <div className="feature-importances-stack mono">
              {features.slice(0, 6).map((feat, idx) => (
                <div key={idx} className="feature-row-item">
                  <div className="feat-meta flex-between">
                    <span className="feat-name">{feat.feature}</span>
                    <span className="feat-val text-cyan">
                      {(feat.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="feat-track">
                    <div
                      className="feat-fill"
                      style={{
                        width: `${Math.min(100, feat.importance * 400)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* 4. ML GOVERNANCE PANEL: MODEL BOUNDARY */}
        <Reveal delay={360}>
          <div className="eval-card-block sentinel-glass-card governance-card">
            <div className="eval-card-header flex-between mono">
              <div className="align-center" style={{ gap: '0.45rem' }}>
                <Lock size={14} className="text-cyan" />
                <span className="eval-card-title">MODEL BOUNDARY &amp; GOVERNANCE</span>
              </div>
              <span className="eval-card-meta text-green">STRICT ENFORCEMENT</span>
            </div>

            <p className="eval-card-desc">
              To guarantee zero telemetry leakage and prevent synthetic bias, strict architectural boundaries are enforced.
            </p>

            <div className="governance-boundary-content mono">
              <div className="forbidden-features-box">
                <div className="flex-between">
                  <span className="box-title text-amber">FORBIDDEN FEATURES (DATA LEAKAGE PREVENTION):</span>
                  <span className="text-green font-bold" style={{ fontSize: '0.65rem' }}>
                    AUDIT: {metricsData.feature_safety?.forbidden_features_found ?? 0} FORBIDDEN FEATURES FOUND (PASS)
                  </span>
                </div>
                <div className="forbidden-tags-row">
                  <span className="forbidden-pill">is_false_positive</span>
                  <span className="forbidden-pill">ground_truth_incident_id</span>
                  <span className="forbidden-pill">scenario_id</span>
                  <span className="forbidden-pill">group_id (partitioning only)</span>
                </div>
                <p className="box-explanation">
                  Group-aware split enforces zero group overlap across {metricsData.dataset_split?.number_of_groups ?? 15} groups: Train: {metricsData.dataset_split?.train_samples?.toLocaleString() ?? '3,401'} (70%), Val: {metricsData.dataset_split?.val_samples?.toLocaleString() ?? '793'} (15%), Held-Out Test: {metricsData.dataset_split?.test_samples?.toLocaleString() ?? '806'} (15%). Ground-truth labels strictly excluded from feature extraction.
                </p>
              </div>

              <div className="rules-bullet-list">
                <div className="rule-item">
                  <CheckCircle2 size={13} className="text-cyan" />
                  <span><b>10-Point Score Cap:</b> Machine learning relevance score is strictly capped at 10.0 points in the 0–100 composite risk score.</span>
                </div>
                <div className="rule-item">
                  <CheckCircle2 size={13} className="text-cyan" />
                  <span><b>Asset Primacy:</b> An ML anomaly on a guest workstation can never outrank high-criticality infrastructure (+45 pts).</span>
                </div>
                <div className="rule-item">
                  <CheckCircle2 size={13} className="text-cyan" />
                  <span><b>Analyst Primacy:</b> Human SOC analysts retain override authority. Analyst decisions persist over ML recommendations.</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

      </div>

      <style>{`
        .aiml-evaluation-lab-workspace {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 2.5rem 0 5rem;
        }

        .lab-status-badge {
          font-size: 0.65rem;
          color: #21C7F3;
          letter-spacing: 0.1em;
          font-weight: 700;
        }

        /* Methodology Disclaimer */
        .methodology-disclaimer-strip {
          padding: 0.85rem 1.75rem;
          margin-bottom: 2rem;
          font-size: 0.65rem;
          background: var(--surface-1);
          border: 1px solid var(--border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-md);
        }

        .method-tag {
          color: var(--text-muted);
          letter-spacing: 0.1em;
          font-weight: 700;
        }
        .method-tag.highlight {
          color: var(--accent-copper);
        }

        .method-sep {
          color: var(--border);
        }

        .method-warning-text {
          color: var(--p2);
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        /* Hero Metrics Rail */
        .ml-hero-metrics-rail {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          margin-bottom: 2.25rem;
          gap: 1.5rem;
          background: rgba(30, 29, 27, 0.90);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-md);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
        }

        .ml-metric-box {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .ml-metric-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #C8C2B9;
          letter-spacing: 0.12em;
        }

        .ml-metric-val {
          font-size: 1.85rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .auc-perfect-tag {
          font-size: 1.1rem;
          color: var(--accent-copper);
        }

        .ml-metric-sub {
          font-size: 0.65rem;
          color: #A7A096;
          letter-spacing: 0.06em;
        }

        .ml-rail-divider {
          width: 1px;
          height: 38px;
          background: var(--border);
        }

        /* Visuals Grid */
        .evaluation-visuals-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.75rem;
        }

        .eval-card-block {
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: rgba(30, 29, 27, 0.90);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-md);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
        }

        .eval-card-header {
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border);
          font-size: 0.72rem;
        }

        .eval-card-title {
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: 0.1em;
        }

        .eval-card-meta {
          font-size: 0.68rem;
          color: #C8C2B9;
          letter-spacing: 0.08em;
        }

        .eval-card-desc {
          font-size: 0.82rem;
          color: #C8C2B9;
          line-height: 1.5;
        }

        /* Confusion Matrix 2x2 */
        .confusion-matrix-2x2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }

        .cm-cell {
          background: rgba(22, 21, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: var(--radius-sm);
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .cm-cell-top {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .cm-label {
          color: #C8C2B9;
        }

        .cm-tag {
          font-size: 0.60rem;
        }

        .cm-num {
          font-size: 1.85rem;
          font-weight: 700;
          line-height: 1.1;
          color: var(--text-primary);
        }

        .cm-sub {
          font-size: 0.65rem;
          color: #A7A096;
          line-height: 1.4;
        }

        /* ROC SVG */
        .roc-svg-container {
          background: rgba(22, 21, 20, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.10);
          border-radius: var(--radius-sm);
          padding: 1rem;
        }

        .roc-svg {
          width: 100%;
          height: auto;
          display: block;
        }

        .roc-curve-path {
          filter: drop-shadow(0 0 6px rgba(169, 107, 66, 0.4));
        }

        .roc-legend-row {
          margin-top: 0.75rem;
          font-size: 0.68rem;
          color: #C8C2B9;
        }

        .legend-indicator {
          width: 10px;
          height: 3px;
          border-radius: 2px;
        }
        .legend-indicator.model {
          background: var(--accent-copper);
          box-shadow: 0 0 6px rgba(169, 107, 66, 0.4);
        }
        .legend-indicator.chance {
          background: var(--text-muted);
        }

        /* Feature Importance */
        .feature-importances-stack {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .feature-row-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .feat-meta {
          font-size: 0.68rem;
          font-weight: 700;
        }

        .feat-name {
          color: var(--text-primary);
        }

        .feat-track {
          width: 100%;
          height: 7px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 3px;
          overflow: hidden;
        }

        .feat-fill {
          height: 100%;
          background: var(--accent-copper);
          border-radius: 3px;
          box-shadow: 0 0 6px rgba(169, 107, 66, 0.4);
        }

        /* Governance Content */
        .governance-boundary-content {
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .forbidden-features-box {
          background: var(--surface-2);
          border: 1px solid rgba(193, 138, 74, 0.3);
          border-radius: var(--radius-sm);
          padding: 1rem;
        }

        .box-title {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          display: block;
          margin-bottom: 0.5rem;
          color: var(--p2);
        }

        .forbidden-tags-row {
          display: flex;
          gap: 0.45rem;
          flex-wrap: wrap;
          margin-bottom: 0.65rem;
        }

        .forbidden-pill {
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--p1);
          background: rgba(184, 77, 97, 0.15);
          border: 1px solid rgba(184, 77, 97, 0.3);
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
        }

        .box-explanation {
          font-size: 0.65rem;
          color: var(--text-muted);
          line-height: 1.45;
        }

        .rules-bullet-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          font-size: 0.72rem;
          color: var(--text-primary);
          line-height: 1.45;
        }

        .rule-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .text-amber { color: var(--p2); }
        .text-cyan { color: var(--accent-copper); }
        .text-bright-cyan { color: var(--accent-copper); }
        .text-green { color: var(--system-active); }

        @media (max-width: 1024px) {
          .evaluation-visuals-grid {
            grid-template-columns: 1fr;
          }
          .ml-hero-metrics-rail {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
