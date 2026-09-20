// client/src/App.jsx
// SentinelOps AI - Phase 1 Complete Experience
// Composition:
// - Atmospheric Security Telemetry Background (60 FPS Procedural Canvas)
// - Global Navigation
// - Full Viewport Hero (Left: Enormous Typography & Pipeline | Right: Live Incident Intelligence Field)
// - Detailed Forensic Incident Inspection State (Modal / Drawer for INC-102 etc.)
// - Manifesto (ALERT VOLUME IS NOT INCIDENT INTELLIGENCE with expansive whitespace)
// - 01 / Alert Intelligence Architecture (The Incident Core, 7 Interactive Stages, Control/Data Plane)
// - Architectural Footer
import React, { useState } from 'react';
import { TelemetryBackground } from './components/TelemetryBackground';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { IncidentInspectionModal } from './components/IncidentInspectionModal';
import { Manifesto } from './components/Manifesto';
import { ArchitectureSection } from './components/ArchitectureSection';
import { ARCHITECTURE_DATA } from './data/mockData';

export function App() {
  const [activeNav, setActiveNav] = useState('operations');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [incidents, setIncidents] = useState(ARCHITECTURE_DATA.incidents);

  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  const handleReviewAction = (incidentId, action) => {
    // Optimistic local state update for analyst decision
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          analystDecision: action,
          status: action === 'CONFIRMED' ? 'INVESTIGATED' : inc.status
        };
      }
      return inc;
    }));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="daq-app-root">
      {/* Procedural Atmospheric Telemetry Background */}
      <TelemetryBackground />

      {/* Global Compact Navigation (64px) */}
      <Navigation 
        activeNav={activeNav} 
        onSelectNav={(navId) => {
          setActiveNav(navId);
          if (navId === 'architecture') scrollToSection('architecture');
          if (navId === 'operations') window.scrollTo({ top: 0, behavior: 'smooth' });
          if (navId === 'incidents') setSelectedIncidentId('INC-102');
        }} 
      />

      <main className="daq-main-flow">
        {/* Full Viewport Hero with 2-Column Split: Typography + Live Incident Field */}
        <Hero 
          incidents={incidents}
          onSelectIncident={(id) => setSelectedIncidentId(id)}
          activeIncidentId={selectedIncidentId}
          onExploreClick={() => scrollToSection('architecture')}
        />

        {/* Manifesto Section */}
        <Manifesto />

        {/* 01 / Alert Intelligence Architecture & The Incident Core (7 interactive stages + Control/Data Plane) */}
        <ArchitectureSection 
          stages={ARCHITECTURE_DATA.stages} 
          telemetry={ARCHITECTURE_DATA.telemetry} 
        />
      </main>

      {/* Deep Forensic Incident Inspection Modal */}
      {selectedIncident && (
        <IncidentInspectionModal 
          incident={selectedIncident}
          onClose={() => setSelectedIncidentId(null)}
          onReviewAction={handleReviewAction}
        />
      )}

      {/* Architectural Compact Footer Note */}
      <footer className="daq-global-footer">
        <div className="daq-container footer-inner flex-between mono">
          <div className="footer-left">
            <span>SENTINELOPS AI</span>
            <span className="footer-sep">/</span>
            <span>MICROSOFT PROBLEM STATEMENT #25</span>
          </div>
          <div className="footer-right">
            <span>3,000 ALERTS, ONE ANALYST</span>
            <span className="footer-sep">•</span>
            <span>AUTONOMOUS TRIAGE ENGINE</span>
          </div>
        </div>
      </footer>

      <style>{`
        .daq-app-root {
          min-height: 100vh;
          width: 100%;
          background-color: var(--color-base);
          color: var(--color-primary);
          display: flex;
          flex-direction: column;
          position: relative;
        }

        .daq-main-flow {
          flex: 1;
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 1;
        }

        .daq-global-footer {
          border-top: 1px solid var(--color-line);
          padding: 2.25rem 0;
          background-color: var(--color-base);
          font-size: 0.70rem;
          color: var(--color-secondary);
          position: relative;
          z-index: 1;
        }

        .footer-sep {
          margin: 0 0.5rem;
          color: var(--color-line);
        }
      `}</style>
    </div>
  );
}

export default App;
