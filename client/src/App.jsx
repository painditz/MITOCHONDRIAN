// client/src/App.jsx
// SentinelOps AI - Unified Enterprise Security Operations Console
// Authoritative architecture: Operations is the master visual language across all workspaces.
// Backend /api/incidents, /api/overview, /api/mttt, /api/ml/metrics, /api/alerts are the SINGLE sources of truth.
import React, { useState, useEffect, useCallback } from 'react';
import { Navigation } from './components/Navigation';
import SentinelSpatial from './components/SentinelSpatial';
import { IncidentIntelligence } from './components/incidents/IncidentIntelligence';
import { IncidentDetailModal } from './components/incidents/IncidentDetailModal';
import { ArchitecturePipeline } from './components/architecture/ArchitecturePipeline';
import { MitreIntelligence } from './components/mitre/MitreIntelligence';
import { TriageImpactWorkspace } from './components/triage/TriageImpactWorkspace';
import { AiMlEvaluationLab } from './components/ml/AiMlEvaluationLab';
import { RawTelemetryLake } from './components/telemetry/RawTelemetryLake';
import { DigitalWater } from './components/spatial/DigitalWater';

export function App() {
  const [activeNav, setActiveNav] = useState('operations');
  const [incidents, setIncidents] = useState([]);
  const [loadingIncidents, setLoadingIncidents] = useState(true);
  const [incidentsError, setIncidentsError] = useState(null);

  const [overviewMetrics, setOverviewMetrics] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showRawAlertsModal, setShowRawAlertsModal] = useState(false);

  // Authoritative fetch from Backend /api/incidents
  const fetchIncidents = useCallback(() => {
    setLoadingIncidents(true);
    setIncidentsError(null);
    fetch('http://127.0.0.1:8000/api/incidents')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.incidents && Array.isArray(data.incidents)) {
          setIncidents(data.incidents);
          setIncidentsError(null);
        } else {
          setIncidents([]);
          setIncidentsError('DATA UNAVAILABLE');
        }
      })
      .catch((err) => {
        console.error('[SentinelOps] Incident API fetch error:', err);
        setIncidents([]);
        setIncidentsError('INCIDENT DATA UNAVAILABLE');
      })
      .finally(() => {
        setLoadingIncidents(false);
      });
  }, []);

  // Live overview telemetry metrics
  const fetchOverview = useCallback(() => {
    fetch('http://127.0.0.1:8000/api/overview')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data) {
          setOverviewMetrics({
            totalAlerts: data.total_alerts,
            clusters: data.grouped_incidents,
            p1Critical: data.critical_incidents,
            highCount: data.high_incidents,
            mediumCount: data.medium_incidents,
            lowCount: data.low_incidents,
            ...data,
          });
        }
      })
      .catch((err) => {
        console.error('[SentinelOps] Overview API fetch error:', err);
      });
  }, []);

  useEffect(() => {
    fetchIncidents();
    fetchOverview();
  }, [fetchIncidents, fetchOverview]);

  const handleIncidentSelect = useCallback((incident) => {
    if (!incident) {
      setSelectedIncident(null);
      return;
    }
    // Match against authoritative incidents array to ensure identical object reference
    const id = incident.incident_id || incident.id;
    setIncidents((currentList) => {
      const live = currentList.find((i) => (i.incident_id || i.id) === id);
      setSelectedIncident(live || incident);
      return currentList;
    });
  }, []);

  const handleReviewAction = useCallback((id, action, notes) => {
    let backendAction = action.toLowerCase();
    if (backendAction.includes('investigate')) backendAction = 'investigated';
    else if (backendAction.includes('confirm')) backendAction = 'confirm';
    else if (backendAction.includes('reject')) backendAction = 'reject';
    else if (backendAction.includes('modify')) backendAction = 'modify';

    return fetch(`http://127.0.0.1:8000/api/incidents/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: backendAction,
        note: notes || `Analyst audit: ${action} via SentinelOps Console`,
        elapsed_seconds: 5.0,
      }),
    })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        const statusMap = {
          CONFIRMED: 'Confirmed by Analyst',
          REJECTED: 'Rejected by Analyst',
          MODIFIED: 'Modified by Analyst',
          INVESTIGATED: 'Marked Investigated',
        };
        const newStatus = statusMap[action] || action;

        // Persist update into both authoritative list and selected state
        setIncidents((prev) =>
          prev.map((inc) =>
            (inc.incident_id || inc.id) === id
              ? { ...inc, investigation_status: newStatus }
              : inc
          )
        );

        setSelectedIncident((prev) =>
          prev && (prev.incident_id || prev.id) === id
            ? { ...prev, investigation_status: newStatus }
            : prev
        );

        return data;
      })
      .catch((err) => {
        console.error('[SentinelOps Review Persistence Error]', err);
        throw err;
      });
  }, []);

  return (
    <div className="sentinel-app-root">
      {/* PERSISTENT GLOBAL 3D DIGITAL WATER ENVIRONMENT */}
      <DigitalWater incidents={incidents} />

      {/* Global Top Navigation (Sticky Glass 60px) */}
      <Navigation
        activeNav={activeNav}
        onSelectNav={(navId) => {
          setActiveNav(navId);
        }}
      />

      <main className="sentinel-main-stage">
        {/* Animated View Transition Container (280–380ms) */}
        <div key={activeNav} className="sentinel-view-transition-stage">
          {/* OPERATIONS MASTER VIEW (Hero + 3D Water + 3D Map + Complete Narrative Flow) */}
          {activeNav === 'operations' && (
            <SentinelSpatial
              incidents={incidents}
              selectedIncident={selectedIncident}
              onIncidentSelect={handleIncidentSelect}
              metrics={overviewMetrics}
              loading={loadingIncidents}
              error={incidentsError}
              onRetry={fetchIncidents}
            />
          )}

          {/* 1. INCIDENTS WORKSPACE */}
          {activeNav === 'incidents' && (
            <div className="sub-view-container daq-container">
              <IncidentIntelligence
                incidents={incidents}
                onSelectIncident={handleIncidentSelect}
                loading={loadingIncidents}
                error={incidentsError}
                onRetry={fetchIncidents}
                onOpenRawAlerts={() => setActiveNav('telemetry')}
                totalAlerts={overviewMetrics?.totalAlerts ?? null}
              />
            </div>
          )}

          {/* 3. ARCHITECTURE PIPELINE WORKSPACE */}
          {activeNav === 'architecture' && (
            <ArchitecturePipeline telemetry={overviewMetrics} incidents={incidents} />
          )}

          {/* 4. MITRE ATT&CK WORKSPACE */}
          {activeNav === 'mitre' && (
            <div className="sub-view-container daq-container">
              <MitreIntelligence
                incidents={incidents}
                onSelectIncident={handleIncidentSelect}
              />
            </div>
          )}

          {/* 5. TRIAGE IMPACT & MTTT WORKSPACE */}
          {activeNav === 'triage' && (
            <div className="sub-view-container daq-container">
              <TriageImpactWorkspace />
            </div>
          )}

          {/* 6. AI / ML EVALUATION LABORATORY */}
          {activeNav === 'aiml' && (
            <div className="sub-view-container daq-container">
              <AiMlEvaluationLab />
            </div>
          )}

          {/* 7. RAW ALERTS TELEMETRY LAKE */}
          {activeNav === 'telemetry' && (
            <div className="sub-view-container daq-container">
              <RawTelemetryLake />
            </div>
          )}
        </div>
      </main>

      {/* 2. FORENSIC INCIDENT INVESTIGATION WORKSTATION */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onReviewAction={handleReviewAction}
        />
      )}

      {/* RAW ALERTS MODAL EXPLORER (when opened as modal) */}
      {showRawAlertsModal && (
        <div className="raw-alerts-backdrop" onClick={() => setShowRawAlertsModal(false)}>
          <div className="raw-alerts-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top-bar flex-between mono">
              <span>RAW TELEMETRY ALERT EXPLORER &bull; STREAM EVENTS</span>
              <button
                className="raw-modal-close-btn sentinel-interactive-btn"
                onClick={() => setShowRawAlertsModal(false)}
              >
                ESC / CLOSE &times;
              </button>
            </div>
            <div className="modal-scroll-area">
              <RawTelemetryLake />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sentinel-app-root {
          min-height: 100vh;
          background: #141312;
          color: #F3EFE8;
          position: relative;
        }

        .sentinel-main-stage {
          position: relative;
          z-index: 10;
        }

        .sub-view-container {
          padding-top: 4.5rem;
          padding-bottom: 5rem;
          min-height: calc(100vh - 60px);
        }

        .daq-container {
          max-width: 1600px;
          margin: 0 auto;
          padding-left: clamp(1.5rem, 4vw, 3.5rem);
          padding-right: clamp(1.5rem, 4vw, 3.5rem);
        }

        .raw-alerts-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(20, 19, 18, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 2500;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .raw-alerts-modal {
          background: #2D2B28;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 8px;
          width: min(1500px, calc(100vw - 40px));
          height: calc(100vh - 60px);
          display: flex;
          flex-direction: column;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }

        .modal-top-bar {
          padding: 0.85rem 1.5rem;
          background: rgba(255, 255, 255, 0.055);
          border-bottom: 1px solid rgba(255, 255, 255, 0.11);
          font-size: 0.68rem;
          color: #C58A52;
          font-weight: 700;
        }

        .raw-modal-close-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.11);
          border-radius: 4px;
          color: #B9B3AA;
          font-family: inherit;
          font-size: 0.65rem;
          cursor: pointer;
          padding: 0.25rem 0.65rem;
          transition: all 140ms ease;
        }

        .raw-modal-close-btn:hover {
          color: #F3EFE8;
          border-color: #C58A52;
          background: rgba(255, 255, 255, 0.08);
        }

        .modal-scroll-area {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
        }
      `}</style>
    </div>
  );
}

export default App;
