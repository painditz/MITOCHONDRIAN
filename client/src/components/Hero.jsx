// client/src/components/Hero.jsx
// SentinelOps Full Viewport Hero
// Left: Architectural Typography & Supporting Flow (~60%)
// Right: Live Incident Intelligence Field (~40%) with observable relationships
import React from 'react';
import { IncidentField } from './IncidentField';

export function Hero({ incidents = [], onSelectIncident, activeIncidentId, onExploreClick }) {
  return (
    <section className="sentinel-hero-section">
      <div className="daq-container hero-container">
        {/* Top Technical Metadata Strip */}
        <div className="hero-meta-strip mono">
          <div className="meta-left align-center">
            <span className="meta-breadcrumb">SENTINELOPS AI / SECURITY OPERATIONS</span>
            <span className="meta-sep">/</span>
            <span className="meta-problem">PROBLEM STATEMENT #25</span>
          </div>
          <div className="meta-right align-center">
            <span className="pulse-dot" />
            <span className="meta-status">AUTONOMOUS TRIAGE CORE ACTIVE</span>
          </div>
        </div>

        {/* 2-Column Hero Split: Left Typography (60%) vs Right Incident Field (40%) */}
        <div className="hero-split-grid">
          {/* Left Column: Massive Editorial Typography & Narrative */}
          <div className="hero-left-column">
            <div className="hero-heading-block">
              <h1 className="hero-massive-title">
                WE TURN<br />
                ALERT CHAOS<br />
                INTO INCIDENT<br />
                INTELLIGENCE.
              </h1>
            </div>

            {/* Supporting End-to-End Pipeline Statement */}
            <div className="hero-supporting-flow mono">
              <div className="flow-track align-center flex-wrap">
                <span className="flow-node">3,000 alerts</span>
                <span className="flow-arrow">→</span>
                <span className="flow-node">15 incident / triage clusters</span>
                <span className="flow-arrow">→</span>
                <span className="flow-node highlight">risk-ranked investigation</span>
                <span className="flow-arrow">→</span>
                <span className="flow-node">MITRE ATT&CK</span>
                <span className="flow-arrow">→</span>
                <span className="flow-node">AI shift handover</span>
                <span className="flow-arrow">→</span>
                <span className="flow-node">human review</span>
              </div>
            </div>

            {/* Hero Action Buttons */}
            <div className="hero-actions-cluster align-center">
              <button 
                className="hero-primary-btn align-center"
                onClick={onExploreClick}
              >
                <span>EXPLORE INCIDENT CORE</span>
                <span className="btn-arrow">→</span>
              </button>
              <button 
                className="hero-secondary-btn mono align-center"
                onClick={() => onSelectIncident && onSelectIncident('INC-102')}
              >
                <span>VIEW INCIDENTS</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Incident Intelligence Field (~40% of hero width) */}
          <div className="hero-right-column">
            <div className="incident-field-wrapper">
              <IncidentField 
                incidents={incidents}
                onSelectIncident={onSelectIncident}
                activeIncidentId={activeIncidentId}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sentinel-hero-section {
          min-height: 88vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding-top: 2.25rem;
          padding-bottom: 3rem;
          position: relative;
          background-color: transparent;
          border-bottom: 1px solid var(--color-line);
        }

        .hero-container {
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .hero-meta-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.68rem;
          color: var(--color-secondary);
          letter-spacing: 0.08em;
          margin-bottom: 1.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-line);
        }

        .meta-left {
          gap: 0.5rem;
        }

        .meta-right {
          gap: 0.5rem;
        }

        .meta-breadcrumb {
          color: var(--color-primary);
          font-weight: 700;
        }

        .meta-sep {
          color: var(--color-line);
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          background: #16A34A;
          border-radius: 50%;
        }

        .meta-status {
          font-weight: 600;
          color: var(--color-primary);
        }

        /* 2-Column Responsive Layout */
        .hero-split-grid {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 3.5rem;
          align-items: center;
        }

        @media (max-width: 1100px) {
          .hero-split-grid {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        .hero-left-column {
          display: flex;
          flex-direction: column;
        }

        .hero-heading-block {
          margin-bottom: 1.75rem;
        }

        .hero-massive-title {
          font-size: clamp(48px, 6.2vw, 104px);
          font-weight: 550;
          line-height: 0.94;
          letter-spacing: -0.04em;
          color: var(--color-primary);
          text-transform: uppercase;
        }

        .hero-supporting-flow {
          font-size: 0.76rem;
          color: var(--color-secondary);
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 680px;
        }

        .flow-track {
          gap: 0.45rem 0.6rem;
        }

        .flow-node {
          color: var(--color-primary);
          font-weight: 500;
        }

        .flow-node.highlight {
          color: var(--color-accent);
          font-weight: 700;
        }

        .flow-arrow {
          color: var(--color-line);
        }

        .hero-actions-cluster {
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .hero-primary-btn {
          background-color: var(--color-primary);
          color: #FFFFFF;
          border: 1px solid var(--color-primary);
          padding: 0.85rem 1.6rem;
          font-family: var(--font-body);
          font-size: 0.80rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          gap: 0.65rem;
          transition: background-color 160ms ease, border-color 160ms ease;
        }

        .hero-primary-btn:hover {
          background-color: var(--color-accent);
          border-color: var(--color-accent);
        }

        .hero-secondary-btn {
          background: transparent;
          border: 1px solid var(--color-line);
          color: var(--color-primary);
          padding: 0.85rem 1.4rem;
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          gap: 0.5rem;
          transition: border-color 140ms ease, background-color 140ms ease;
        }

        .hero-secondary-btn:hover {
          border-color: var(--color-primary);
          background-color: #EDEAE3;
        }

        .btn-arrow {
          transition: transform 140ms ease;
        }

        .hero-primary-btn:hover .btn-arrow,
        .hero-secondary-btn:hover .btn-arrow {
          transform: translateX(3px);
        }

        /* Right Column Incident Topology Field */
        .hero-right-column {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .incident-field-wrapper {
          width: 100%;
          min-height: 520px;
          height: 100%;
        }
      `}</style>
    </section>
  );
}

export default Hero;
