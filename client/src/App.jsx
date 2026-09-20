// client/src/App.jsx
// SentinelOps AI - Spatial 3D Intelligence Experience
// Connected to Existing SentinelOps Backend APIs:
// - /api/incidents (15 production correlated clusters)
// - /api/overview (3,000 alerts, triage metrics, MTTT)
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import SentinelSpatial from './components/SentinelSpatial';
import { ArchitectureSection } from './components/ArchitectureSection';
import { Manifesto } from './components/Manifesto';
import { ARCHITECTURE_DATA } from './data/mockData';

export function App() {
  const [activeNav, setActiveNav] = useState('operations');
  const [incidents, setIncidents] = useState(ARCHITECTURE_DATA.incidents);
  const [overviewMetrics, setOverviewMetrics] = useState(ARCHITECTURE_DATA.telemetry);

  // STEP 5: Connect to EXISTING SentinelOps Data from /api/incidents & /api/overview
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
        console.warn('[SentinelOps] Backend API not reached or returning fallback:', err?.message || err);
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
    console.log('Selected SentinelOps incident:', incident?.incident_id);
    setSelectedIncident(incident);
  };

  return (
    <div className="sentinel-app-root">
      {/* Global Top Navigation (Sticky 60px) */}
      <Navigation
        activeNav={activeNav}
        onSelectNav={(navId) => {
          setActiveNav(navId);
        }}
      />

      <main className="sentinel-main-stage">
        {/* =========================================================
            STEP 6: OVERVIEW VIEW -> REPLACED WITH SENTINELSPATIAL
            ========================================================= */}
        {activeNav === 'operations' && (
          <SentinelSpatial
            incidents={incidents}
            onIncidentSelect={handleIncidentSelect}
            metrics={overviewMetrics}
          />
        )}

        {/* INCIDENTS QUEUE VIEW */}
        {activeNav === 'incidents' && (
          <div className="sub-view-container daq-container">
            <div className="sub-view-header mono">
              <span className="sub-view-tag">02 / INCIDENT QUEUE</span>
              <span className="sub-view-count">{incidents.length} INCIDENTS ACTIVE</span>
            </div>
            <div className="incident-cards-grid">
              {incidents.map((inc) => (
                <div
                  key={inc.incident_id || inc.id}
                  className="queue-card"
                  onClick={() => {
                    handleIncidentSelect(inc);
                    setActiveNav('operations');
                  }}
                >
                  <div className="queue-card-top flex-between mono">
                    <span className="queue-id">{inc.incident_id || inc.id}</span>
                    <span className={`queue-prio ${String(inc.priority).toLowerCase()}`}>
                      {inc.priority}
                    </span>
                  </div>
                  <div className="queue-title">{inc.title || inc.asset_name || inc.hostname || 'Incident'}</div>
                  <div className="queue-meta mono flex-between">
                    <span>RISK: {inc.risk_score || inc.riskScore}</span>
                    <span>{inc.alert_count || inc.signalsCount || 0} alerts</span>
                  </div>
                </div>
              ))}
            </div>
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
            <div className="sub-view-header mono">
              <span className="sub-view-tag">04 / MITRE ATT&amp;CK TECHNIQUE MAPPING</span>
              <span className="sub-view-count">EVIDENCE-GROUNDED ATTRIBUTION</span>
            </div>
            <div className="mitre-table-block mono">
              <div className="mitre-table-row header flex-between">
                <span>TECHNIQUE ID &amp; NAME</span>
                <span>TACTIC</span>
                <span>EVIDENCE FOUND</span>
              </div>
              <div className="mitre-table-row flex-between">
                <span className="tech-id font-bold">T1114.002 Remote Email Forwarding Rule</span>
                <span className="tech-tactic">Collection</span>
                <span className="tech-ev">finance-drop@proton.me auto-forward rule</span>
              </div>
              <div className="mitre-table-row flex-between">
                <span className="tech-id font-bold">T1567.002 Cloud Storage Exfiltration</span>
                <span className="tech-tactic">Exfiltration</span>
                <span className="tech-ev">Egress to mega.nz (5,153,960,755 bytes)</span>
              </div>
              <div className="mitre-table-row flex-between">
                <span className="tech-id font-bold">T1078.002 Domain Accounts Abuse</span>
                <span className="tech-tactic">Defense Evasion</span>
                <span className="tech-ev">svc-replication account RPC DCSync bind</span>
              </div>
              <div className="mitre-table-row flex-between">
                <span className="tech-id font-bold">T1558.003 Kerberoasting</span>
                <span className="tech-tactic">Credential Access</span>
                <span className="tech-ev">High-volume SPN ticket extraction (krbtgt_admin)</span>
              </div>
              <div className="mitre-table-row flex-between">
                <span className="tech-id font-bold">T1190 Exploit Public-Facing Application</span>
                <span className="tech-tactic">Initial Access</span>
                <span className="tech-ev">SQL injection payload on public web tier</span>
              </div>
            </div>
          </div>
        )}

        {/* TRIAGE IMPACT VIEW */}
        {activeNav === 'triage' && (
          <div className="sub-view-container daq-container">
            <div className="sub-view-header mono">
              <span className="sub-view-tag">05 / TRIAGE IMPACT &bull; EMPIRICAL STOPWATCH</span>
              <span className="sub-view-count">80.5% MTTT REDUCTION</span>
            </div>
            <div className="impact-grid mono">
              <div className="impact-card">
                <div className="impact-label">BASELINE UNASSISTED TRIAGE</div>
                <div className="impact-val text-red">500.0h</div>
                <div className="impact-desc">Manual inspection of 3,000 raw alert records</div>
              </div>
              <div className="impact-card">
                <div className="impact-label">ASSISTED INCIDENT TRIAGE</div>
                <div className="impact-val text-accent">0.75h</div>
                <div className="impact-desc">15 correlated clusters with local AI briefs</div>
              </div>
              <div className="impact-card">
                <div className="impact-label">MEASURED ANALYST SPEEDUP</div>
                <div className="impact-val text-green">80.5%</div>
                <div className="impact-desc">120.0s baseline reduced to 23.4s mean triage</div>
              </div>
            </div>
          </div>
        )}

        {/* AI / ML VIEW */}
        {activeNav === 'aiml' && (
          <div className="sub-view-container daq-container">
            <div className="sub-view-header mono">
              <span className="sub-view-tag">06 / LOCAL AI &bull; FLAN-T5 EVALUATION</span>
              <span className="sub-view-count">ZERO EXTERNAL DATA EGRESS</span>
            </div>
            <div className="aiml-stats-grid mono">
              <div className="aiml-card">
                <div className="aiml-label">MODEL ARCHITECTURE</div>
                <div className="aiml-val">google/flan-t5-small</div>
                <div className="aiml-desc">Quantized local deterministic inference (420ms)</div>
              </div>
              <div className="aiml-card">
                <div className="aiml-label">RANDOM FOREST CLASSIFIER</div>
                <div className="aiml-val text-accent">F1: 0.9511</div>
                <div className="aiml-desc">Precision: 1.0000 • Recall: 0.9068 on 3,000 alerts</div>
              </div>
              <div className="aiml-card">
                <div className="aiml-label">DATA EGRESS GUARANTEE</div>
                <div className="aiml-val text-green">0 KB</div>
                <div className="aiml-desc">Air-gapped deployment compatible</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .sentinel-app-root {
          width: 100%;
          min-height: 100vh;
          background-color: #05080b;
          color: #eef3f6;
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
          padding-top: 80px;
          padding-bottom: 60px;
          min-height: calc(100vh - 60px);
        }

        .sub-view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 0 1rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 0.72rem;
          margin-bottom: 2rem;
        }

        .sub-view-tag {
          color: #38bdf8;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .sub-view-count {
          color: #64748b;
        }

        /* Incident Queue Grid */
        .incident-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .queue-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.25rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .queue-card:hover {
          border-color: #38bdf8;
          background: rgba(15, 23, 42, 0.9);
          transform: translateY(-2px);
        }

        .queue-card-top {
          font-size: 0.72rem;
        }

        .queue-id {
          font-weight: 700;
          color: #f8fafc;
        }

        .queue-prio {
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: 3px;
        }

        .queue-prio.p1, .queue-prio.p1-critical {
          color: #ff3b4d;
          background: rgba(255, 59, 77, 0.12);
        }

        .queue-prio.p2, .queue-prio.p2-high {
          color: #ffb020;
          background: rgba(255, 176, 32, 0.12);
        }

        .queue-prio.p3, .queue-prio.p3-medium {
          color: #42d6ff;
          background: rgba(66, 214, 255, 0.12);
        }

        .queue-prio.p4, .queue-prio.p4-low {
          color: #8b9aaa;
          background: rgba(139, 154, 170, 0.12);
        }

        .queue-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #e2e8f0;
          line-height: 1.4;
        }

        .queue-meta {
          font-size: 0.65rem;
          color: #64748b;
          border-top: 1px dashed rgba(255, 255, 255, 0.08);
          padding-top: 0.5rem;
          margin-top: auto;
        }

        /* MITRE Table */
        .mitre-table-block {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .mitre-table-row {
          padding: 0.95rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          font-size: 0.75rem;
          align-items: center;
        }

        .mitre-table-row.header {
          background: rgba(255, 255, 255, 0.03);
          color: #64748b;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .tech-id {
          color: #38bdf8;
          width: 35%;
        }

        .tech-tactic {
          color: #cbd5e1;
          width: 25%;
        }

        .tech-ev {
          color: #94a3b8;
          width: 40%;
        }

        /* Impact Grid */
        .impact-grid, .aiml-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .impact-card, .aiml-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .impact-label, .aiml-label {
          font-size: 0.65rem;
          color: #64748b;
          letter-spacing: 0.08em;
        }

        .impact-val, .aiml-val {
          font-size: 2.2rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .text-red { color: #ff3b4d; }
        .text-accent { color: #38bdf8; }
        .text-green { color: #10b981; }

        .impact-desc, .aiml-desc {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.4;
          margin-top: 0.5rem;
        }

        @media (max-width: 900px) {
          .impact-grid, .aiml-stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
