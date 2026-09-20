// client/src/App.jsx
// SentinelOps AI - Spatial 3D Intelligence Experience & Product Views
// Connected to Existing SentinelOps Backend APIs:
// - /api/incidents (15 production correlated clusters)
// - /api/overview (3,000 alerts, triage metrics, MTTT)
// - /api/mttt (Simulation vs Measured Stopwatch Trials)
// - /api/ml/metrics (Held-Out Synthetic Test evaluation)
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import SentinelSpatial from './components/SentinelSpatial';
import { ArchitectureSection } from './components/ArchitectureSection';
import { Manifesto } from './components/Manifesto';
import { IncidentQueueTable } from './components/IncidentQueueTable';
import { MitreSection } from './components/MitreSection';
import { TriageImpactSection } from './components/TriageImpactSection';
import { AiMlEvaluationView } from './components/AiMlEvaluationView';
import { RawAlertsExplorer } from './components/RawAlertsExplorer';
import { IncidentInspectionModal } from './components/IncidentInspectionModal';
import { ARCHITECTURE_DATA } from './data/mockData';

export function App() {
  const [activeNav, setActiveNav] = useState('operations');
  const [incidents, setIncidents] = useState(ARCHITECTURE_DATA.incidents);
  const [overviewMetrics, setOverviewMetrics] = useState(ARCHITECTURE_DATA.telemetry);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showRawAlertsModal, setShowRawAlertsModal] = useState(false);

  // Connect to existing SentinelOps backend data
  useEffect(() => {
    // 1. Fetch real production incidents from existing backend
    fetch('http://127.0.0.1:8000/api/incidents')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data?.incidents && Array.isArray(data.incidents) && data.incidents.length > 0) {
          console.log(`[SentinelOps] Successfully loaded ${data.incidents.length} live incidents from backend API.`);
          setIncidents(data.incidents);
        }
      })
      .catch((err) => {
        console.warn('[SentinelOps] Backend API fallback active:', err?.message || err);
      });

    // 2. Fetch live overview telemetry metrics
    fetch('http://127.0.0.1:8000/api/overview')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data) {
          setOverviewMetrics((prev) => ({
            ...prev,
            totalAlerts: data.total_alerts || 3000,
            clusters: data.grouped_incidents || 15,
            p1Critical: data.critical_incidents || 7,
            highCount: data.high_incidents || 2,
            mediumCount: data.medium_incidents || 1,
            lowCount: data.low_incidents || 5,
            ...data,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleIncidentSelect = (incident) => {
    setSelectedIncident(incident);
  };

  const handleReviewAction = (id, action, notes) => {
    console.log(`[SentinelOps Review] ${id}: ${action} notes: ${notes}`);
    // Optional backend persistence
    fetch(`http://127.0.0.1:8000/api/incidents/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incident_id: id,
        decision: action.toLowerCase(),
        analyst_notes: notes || 'Reviewed via SentinelOps Console',
        analyst_name: 'Security Operations Analyst',
      }),
    }).catch(() => {});
  };

  return (
    <div className="sentinel-app-root">
      {/* Global Top Navigation (Sticky Glass 60px) */}
      <Navigation
        activeNav={activeNav}
        onSelectNav={(navId) => {
          setActiveNav(navId);
        }}
      />

      <main className="sentinel-main-stage">
        {/* OPERATIONS MASTER VIEW (Hero + 3D Water + 3D Map + Complete Narrative Flow) */}
        {activeNav === 'operations' && (
          <SentinelSpatial
            incidents={incidents}
            onIncidentSelect={handleIncidentSelect}
            metrics={overviewMetrics}
          />
        )}

        {/* INCIDENTS QUEUE VIEW (Redesigned Compact Table with P1-P4 Filters) */}
        {activeNav === 'incidents' && (
          <div className="sub-view-container daq-container">
            <div className="sub-view-header mono flex-between">
              <div>
                <span className="sub-view-tag">02 / INCIDENT QUEUE</span>
                <span className="sub-view-sep">/</span>
                <span className="sub-view-desc">CORRELATED SECURITY CLUSTERS</span>
              </div>
              <div className="align-center" style={{ gap: '1rem' }}>
                <button
                  className="open-raw-alerts-btn mono"
                  onClick={() => setShowRawAlertsModal(true)}
                >
                  EXPLORE 3,000 RAW ALERTS &rarr;
                </button>
                <span className="sub-view-count mono">{incidents.length} INCIDENTS ACTIVE</span>
              </div>
            </div>

            <IncidentQueueTable
              incidents={incidents}
              onSelectIncident={handleIncidentSelect}
            />
          </div>
        )}

        {/* ARCHITECTURE PIPELINE VIEW */}
        {activeNav === 'architecture' && (
          <div className="sub-view-container">
            <ArchitectureSection
              stages={ARCHITECTURE_DATA.stages}
              telemetry={overviewMetrics}
            />
            <Manifesto />
          </div>
        )}

        {/* MITRE ATT&CK VIEW */}
        {activeNav === 'mitre' && (
          <div className="sub-view-container daq-container">
            <MitreSection />
          </div>
        )}

        {/* TRIAGE IMPACT & MTTT VIEW */}
        {activeNav === 'triage' && (
          <div className="sub-view-container daq-container">
            <TriageImpactSection telemetry={overviewMetrics} />
          </div>
        )}

        {/* AI / ML VIEW */}
        {activeNav === 'aiml' && (
          <div className="sub-view-container daq-container">
            <div className="sub-view-header mono flex-between">
              <div>
                <span className="sub-view-tag">06 / LOCAL AI &bull; FLAN-T5 &amp; ML EVALUATION</span>
                <span className="sub-view-sep">/</span>
                <span className="sub-view-desc">GROUP-AWARE BENCHMARK</span>
              </div>
              <span className="sub-view-count mono">ZERO DATA EGRESS</span>
            </div>

            <AiMlEvaluationView />
          </div>
        )}
      </main>

      {/* FORENSIC INCIDENT INSPECTION MODAL */}
      {selectedIncident && (
        <IncidentInspectionModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onReviewAction={handleReviewAction}
        />
      )}

      {/* RAW ALERTS MODAL EXPLORER */}
      {showRawAlertsModal && (
        <div className="raw-alerts-backdrop" onClick={() => setShowRawAlertsModal(false)}>
          <div className="raw-alerts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar flex-between mono">
              <span>RAW TELEMETRY ALERT EXPLORER &bull; 3,000 STREAM EVENTS</span>
              <button className="close-btn" onClick={() => setShowRawAlertsModal(false)}>&times;</button>
            </div>
            <div className="modal-body-scroll">
              <RawAlertsExplorer />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sentinel-app-root {
          width: 100%;
          min-height: 100vh;
          background-color: #030609;
          color: #f8fafc;
          display: flex;
          flex-direction: column;
        }

        .sentinel-main-stage {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .sub-view-container {
          padding-top: 85px;
          padding-bottom: 60px;
          min-height: calc(100vh - 60px);
          max-width: 1320px;
          margin: 0 auto;
          width: 100%;
          padding-left: clamp(1.5rem, 4vw, 3rem);
          padding-right: clamp(1.5rem, 4vw, 3rem);
        }

        .sub-view-header {
          padding: 1.25rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.72rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .sub-view-tag {
          color: #38bdf8;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .sub-view-sep {
          color: #64748b;
          margin: 0 0.5rem;
        }

        .sub-view-desc {
          color: #94a3b8;
        }

        .sub-view-count {
          color: #64748b;
        }

        .open-raw-alerts-btn {
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.35);
          color: #38bdf8;
          font-size: 0.65rem;
          padding: 0.3rem 0.65rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
        }

        .open-raw-alerts-btn:hover {
          background: rgba(56, 189, 248, 0.25);
          color: #ffffff;
        }

        /* Raw Alerts Modal */
        .raw-alerts-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .raw-alerts-modal {
          background: rgba(7, 12, 18, 0.95);
          border: 1px solid rgba(56, 189, 248, 0.3);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.8);
          border-radius: 8px;
          width: min(1200px, 95vw);
          max-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-top-bar {
          background: rgba(15, 23, 42, 0.8);
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.72rem;
          color: #38bdf8;
          font-weight: 700;
          align-items: center;
        }

        .modal-top-bar .close-btn {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.5rem;
          cursor: pointer;
          line-height: 1;
        }

        .modal-body-scroll {
          padding: 1.5rem;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

export default App;
