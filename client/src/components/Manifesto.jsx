// client/src/components/Manifesto.jsx
// SentinelOps Manifesto Section
// Enormous whitespace, editorial typography, zero card clutter
import React from 'react';

export function Manifesto() {
  return (
    <section id="manifesto" className="sentinel-manifesto-section">
      <div className="daq-container manifesto-container">
        {/* Editorial Section Label */}
        <div className="manifesto-label-row">
          <span className="editorial-label">MANIFESTO</span>
        </div>

        {/* Massive Typographic Statement */}
        <div className="manifesto-statement-block">
          <h2 className="manifesto-giant-text">
            ALERT VOLUME<br />
            IS NOT<br />
            INCIDENT<br />
            INTELLIGENCE.
          </h2>
        </div>

        {/* Supporting Narrative Text with Enormous Whitespace */}
        <div className="manifesto-sub-grid">
          <div className="manifesto-lead-block">
            <p className="manifesto-headline-paragraph">
              Thousands of security alerts are not thousands of investigations.
            </p>
            <p className="manifesto-body-paragraph">
              SentinelOps correlates observable evidence, prioritizes incidents using asset criticality, 
              maps activity to MITRE ATT&CK, and prepares shift-ready intelligence for human review.
            </p>
          </div>

          <div className="manifesto-proof-points mono">
            <div className="proof-point-item">
              <span className="proof-index">01</span>
              <span className="proof-desc">OBSERVABLE EVIDENCE GRAPH CLUSTERING</span>
            </div>
            <div className="proof-point-item">
              <span className="proof-index">02</span>
              <span className="proof-desc">ASSET CRITICALITY PRIORITIZATION ENGINE</span>
            </div>
            <div className="proof-point-item">
              <span className="proof-index">03</span>
              <span className="proof-desc">LOCAL DETERMINISTIC AI SHIFT HANDOVER</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sentinel-manifesto-section {
          padding-top: clamp(90px, 11vw, 160px);
          padding-bottom: clamp(90px, 11vw, 160px);
          background-color: transparent;
          border-bottom: 1px solid var(--color-line);
        }

        .manifesto-container {
          display: flex;
          flex-direction: column;
          gap: clamp(2.5rem, 4vw, 4.5rem);
        }

        .manifesto-label-row {
          display: flex;
        }

        .editorial-label {
          font-family: var(--font-mono);
          font-size: 0.70rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--color-secondary);
          text-transform: uppercase;
        }

        .manifesto-statement-block {
          max-width: 1200px;
        }

        .manifesto-giant-text {
          font-size: clamp(48px, 7vw, 112px);
          font-weight: 550;
          line-height: 0.94;
          letter-spacing: -0.035em;
          color: var(--color-primary);
          text-transform: uppercase;
        }

        .manifesto-sub-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: clamp(2rem, 5vw, 6rem);
          padding-top: 3rem;
          border-top: 1px solid var(--color-line);
          align-items: start;
        }

        .manifesto-lead-block {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          max-width: 680px;
        }

        .manifesto-headline-paragraph {
          font-size: clamp(1.2rem, 1.6vw, 1.55rem);
          color: var(--color-primary);
          line-height: 1.4;
          font-weight: 500;
        }

        .manifesto-body-paragraph {
          font-size: clamp(0.95rem, 1.2vw, 1.15rem);
          color: var(--color-secondary);
          line-height: 1.65;
        }

        .manifesto-proof-points {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .proof-point-item {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          font-size: 0.72rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--color-line);
        }

        .proof-index {
          color: var(--color-accent);
          font-weight: 700;
        }

        .proof-desc {
          color: var(--color-primary);
          letter-spacing: 0.04em;
        }

        @media (max-width: 900px) {
          .manifesto-sub-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

export default Manifesto;
