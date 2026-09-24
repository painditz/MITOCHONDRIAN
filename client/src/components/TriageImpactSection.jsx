// client/src/components/TriageImpactSection.jsx
// 00 / TRIAGE IMPACT & MTTT MEASUREMENT
// Strict separation between:
// - MODE 1: SIMULATION / ESTIMATE (Simulated Industry Assumption, Not Field Measured)
// - MODE 2: MEASURED ANALYST TEST (Empirical Stopwatch Sessions)
import React, { useState, useEffect } from 'react';

export function TriageImpactSection({ telemetry = {} }) {
  const [mtttData, setMtttData] = useState(null);
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isTiming, setIsTiming] = useState(false);
  const [sessionType, setSessionType] = useState('assisted_incident');
  const [recordedSessions, setRecordedSessions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/mttt')
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d) => {
        setMtttData(d);
        if (d?.measured_analyst_test?.sessions) {
          setRecordedSessions(d.measured_analyst_test.sessions);
        }
      })
      .catch((err) => {
        console.error('[TriageImpactSection] API error:', err);
        setError('DATA UNAVAILABLE');
      });
  }, []);

  useEffect(() => {
    let timer;
    if (isTiming) {
      timer = setInterval(() => {
        setStopwatchTime((t) => t + 0.1);
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isTiming]);

  const handleStopTimer = () => {
    setIsTiming(false);
    const newSession = {
      id: `SES-${sessionType === 'raw_alert' ? 'RAW' : 'ASST'}-${recordedSessions.length + 1}`,
      type: sessionType,
      duration: Math.round(stopwatchTime * 10) / 10,
      decision: 'confirmed',
    };
    setRecordedSessions((prev) => [newSession, ...prev]);

    // Persist to backend if available
    fetch('http://127.0.0.1:8000/api/mttt/session/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_type: sessionType,
        target_id: sessionType === 'raw_alert' ? 'ALT-1049' : 'INC-102',
        start_timestamp: new Date(Date.now() - stopwatchTime * 1000).toISOString(),
        end_timestamp: new Date().toISOString(),
        duration_seconds: Math.round(stopwatchTime * 10) / 10,
        analyst_decision: 'confirmed',
      }),
    })
      .then((r) => r.ok && r.json())
      .then((d) => {
        if (d?.updated_mttt) setMtttData(d.updated_mttt);
      })
      .catch(() => {});

    setStopwatchTime(0);
  };

  const sim = mtttData?.simulation_estimate || mtttData?.simulation;
  const simBaseHours = sim?.simulated_baseline_hours ?? 0;
  const simAsstHours = sim?.simulated_assisted_hours ?? 0;
  const simSaved = sim?.simulated_hours_saved ?? 0;

  const measured = mtttData?.measured_analyst_test;
  const measuredBaseSec = measured?.measured_baseline_mttt_seconds ?? 0;
  const measuredAsstSec = measured?.measured_assisted_mttt_seconds ?? 0;
  const measuredReduction = measured?.measured_percentage_reduction ?? 0;

  return (
    <section className="sentinel-section triage-impact-section" id="triage-impact">
      <div className="section-inner-container">
        
        {/* Section Header */}
        <div className="section-header-block">
          <div className="section-eyebrow-tag mono">
            <span className="code-accent">00</span>
            <span className="code-sep">/</span>
            <span>TRIAGE IMPACT &amp; MTTT MEASUREMENT</span>
          </div>
          <div className="section-headline-row flex-between">
            <h2 className="section-title-large">
              RADICAL TRIAGE EFFICIENCY.
            </h2>
            <p className="section-description-text">
              Two strictly separated methodologies: mathematical simulation of industry benchmarks versus stopwatch-measured analyst trials.
            </p>
          </div>
        </div>

        {/* Two Clearly Separated Mode Containers */}
        <div className="triage-modes-dual-grid">
          
          {/* MODE 1: SIMULATION / ESTIMATE */}
          <div className="triage-mode-card simulation-mode">
            <div className="mode-top-banner flex-between mono">
              <div className="mode-badge-group align-center">
                <span className="mode-number">MODE 1</span>
                <span className="mode-name">SIMULATION / ESTIMATE</span>
              </div>
              <span className="method-disclaimer-pill warning mono">
                SIMULATED INDUSTRY ASSUMPTION &bull; NOT FIELD MEASURED
              </span>
            </div>

            <p className="mode-explainer">
              Mathematical projection based on standard industry assumptions (10 min per raw alert vs 3 min per correlated incident cluster).
            </p>

            <div className="metrics-compare-row">
              <div className="compare-box">
                <div className="compare-meta mono">UNASSISTED RAW ALERTS</div>
                <div className="compare-number text-red mono">{simBaseHours.toFixed(1)}h</div>
                <div className="compare-sub mono">3,000 ALERTS &times; 10.0 MIN</div>
              </div>

              <div className="compare-arrow mono">&rarr;</div>

              <div className="compare-box">
                <div className="compare-meta mono">ASSISTED INCIDENTS</div>
                <div className="compare-number text-cyan mono">{simAsstHours.toFixed(2)}h</div>
                <div className="compare-sub mono">15 CLUSTERS &times; 3.0 MIN</div>
              </div>

              <div className="compare-box highlight-box">
                <div className="compare-meta mono">PROJECTED SAVINGS</div>
                <div className="compare-number text-green mono">{simSaved.toFixed(1)}h</div>
                <div className="compare-sub mono">99.8% REDUCTION (THEORETICAL)</div>
              </div>
            </div>

            <div className="mode-footer-note mono">
              &Delta; Calculated for 3,000 raw alert stream compressed into 15 correlated clusters.
            </div>
          </div>

          {/* MODE 2: MEASURED ANALYST TEST */}
          <div className="triage-mode-card empirical-mode">
            <div className="mode-top-banner flex-between mono">
              <div className="mode-badge-group align-center">
                <span className="mode-number">MODE 2</span>
                <span className="mode-name">MEASURED ANALYST TEST</span>
              </div>
              <span className="method-disclaimer-pill active-pill mono">
                EMPIRICAL STOPWATCH SESSIONS
              </span>
            </div>

            <p className="mode-explainer">
              Strictly derived from actual human analyst stopwatch trials with timed start/finish intervals on raw alerts vs SentinelOps AI-assisted incidents.
            </p>

            <div className="metrics-compare-row">
              <div className="compare-box">
                <div className="compare-meta mono">MEASURED BASELINE</div>
                <div className="compare-number text-amber mono">{measuredBaseSec.toFixed(1)}s</div>
                <div className="compare-sub mono">RAW ALERT INSPECTION</div>
              </div>

              <div className="compare-arrow mono">&rarr;</div>

              <div className="compare-box">
                <div className="compare-meta mono">MEASURED ASSISTED</div>
                <div className="compare-number text-cyan mono">{measuredAsstSec.toFixed(1)}s</div>
                <div className="compare-sub mono">SENTINELOPS AI HANDOVER</div>
              </div>

              <div className="compare-box highlight-box green-border">
                <div className="compare-meta mono">MEASURED MTTT SPEEDUP</div>
                <div className="compare-number text-green mono">-{measuredReduction.toFixed(1)}%</div>
                <div className="compare-sub mono">EMPIRICAL HUMAN ACCELERATION</div>
              </div>
            </div>

            {/* Interactive Analyst Stopwatch Trial Box */}
            <div className="stopwatch-trial-box flex-between mono">
              <div className="stopwatch-left align-center">
                <span className={`live-trial-pulse ${isTiming ? 'active' : ''}`} />
                <span>ACTIVE TRIAL STOPWATCH:</span>
                <span className="stopwatch-digits">{stopwatchTime.toFixed(1)}s</span>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  disabled={isTiming}
                  className="session-select"
                >
                  <option value="assisted_incident">Assisted Incident (INC-102)</option>
                  <option value="raw_alert">Raw Alert (ALT-1049)</option>
                </select>
              </div>

              <div className="stopwatch-right">
                {!isTiming ? (
                  <button className="trial-btn start" onClick={() => setIsTiming(true)}>
                    START TIMED TRIAL
                  </button>
                ) : (
                  <button className="trial-btn stop" onClick={handleStopTimer}>
                    RECORD DECISION
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .triage-impact-section {
          padding: 5rem 0;
          position: relative;
          z-index: 5;
        }

        .section-inner-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 clamp(1.5rem, 4vw, 3rem);
        }

        .section-header-block {
          margin-bottom: 2.5rem;
        }

        .section-eyebrow-tag {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #38bdf8;
          margin-bottom: 0.8rem;
        }

        .code-accent { color: #38bdf8; }
        .code-sep { color: #64748b; margin: 0 0.35rem; }

        .section-title-large {
          font-family: var(--font-display, Inter, sans-serif);
          font-size: clamp(2rem, 3.2vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -0.04em;
          color: #ffffff;
          line-height: 1.05;
          margin: 0;
        }

        .section-description-text {
          max-width: 480px;
          color: #94a3b8;
          font-size: 0.95rem;
          line-height: 1.6;
          margin: 0;
        }

        .triage-modes-dual-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(520px, 1fr));
          gap: 2rem;
        }

        .triage-mode-card {
          background: rgba(7, 12, 18, 0.65);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .simulation-mode {
          border-left: 3px solid #ffb020;
        }

        .empirical-mode {
          border-left: 3px solid #10b981;
        }

        .mode-top-banner {
          align-items: center;
          gap: 1rem;
        }

        .mode-badge-group {
          gap: 0.6rem;
        }

        .mode-number {
          padding: 0.2rem 0.5rem;
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: 3px;
        }

        .mode-name {
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .method-disclaimer-pill {
          font-size: 0.6rem;
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }

        .method-disclaimer-pill.warning {
          background: rgba(255, 176, 32, 0.12);
          border: 1px solid rgba(255, 176, 32, 0.35);
          color: #ffb020;
        }

        .method-disclaimer-pill.active-pill {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #10b981;
        }

        .mode-explainer {
          color: #94a3b8;
          font-size: 0.85rem;
          line-height: 1.55;
          margin: 0;
        }

        .metrics-compare-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .compare-box {
          flex: 1;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .compare-box.highlight-box {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .compare-box.green-border {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.3);
        }

        .compare-meta {
          font-size: 0.62rem;
          color: #64748b;
          letter-spacing: 0.12em;
        }

        .compare-number {
          font-size: 1.85rem;
          font-weight: 700;
          line-height: 1;
        }

        .compare-sub {
          font-size: 0.6rem;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }

        .compare-arrow {
          color: #64748b;
          font-size: 1.25rem;
          user-select: none;
        }

        .text-red { color: #ff3b4d; }
        .text-amber { color: #ffb020; }
        .text-cyan { color: #38bdf8; }
        .text-green { color: #10b981; }

        .mode-footer-note {
          font-size: 0.68rem;
          color: #64748b;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 0.75rem;
        }

        .stopwatch-trial-box {
          background: rgba(10, 16, 24, 0.8);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 6px;
          padding: 0.85rem 1.25rem;
          align-items: center;
          font-size: 0.72rem;
          color: #e2e8f0;
          gap: 1rem;
        }

        .stopwatch-left {
          gap: 0.75rem;
        }

        .live-trial-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #64748b;
        }

        .live-trial-pulse.active {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: pulse 1s infinite;
        }

        .stopwatch-digits {
          font-size: 1.15rem;
          font-weight: 700;
          color: #38bdf8;
          min-width: 50px;
        }

        .session-select {
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #e2e8f0;
          font-size: 0.68rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .trial-btn {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.45rem 0.9rem;
          border-radius: 4px;
          cursor: pointer;
          font-family: monospace;
          transition: all 140ms ease;
        }

        .trial-btn.start {
          background: rgba(56, 189, 248, 0.2);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38bdf8;
        }

        .trial-btn.start:hover {
          background: rgba(56, 189, 248, 0.35);
          color: #ffffff;
        }

        .trial-btn.stop {
          background: rgba(255, 59, 77, 0.2);
          border: 1px solid rgba(255, 59, 77, 0.4);
          color: #ff3b4d;
        }

        .trial-btn.stop:hover {
          background: rgba(255, 59, 77, 0.35);
          color: #ffffff;
        }

        @media (max-width: 900px) {
          .triage-modes-dual-grid {
            grid-template-columns: 1fr;
          }
          .metrics-compare-row {
            flex-direction: column;
            align-items: stretch;
          }
          .compare-arrow {
            text-align: center;
            transform: rotate(90deg);
          }
          .stopwatch-trial-box {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </section>
  );
}
export default TriageImpactSection;
