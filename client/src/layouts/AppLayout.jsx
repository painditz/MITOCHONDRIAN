// client/src/layouts/AppLayout.jsx
// Strict CSS Grid/Flexbox Viewport Shell (Light Neutral Architectural Palette)
import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { StatusBar } from '../components/StatusBar';

export function AppLayout({ 
  activeNav, 
  onSelectNav, 
  telemetry, 
  children 
}) {
  return (
    <div className="app-shell-root">
      {/* 1. Left Sidebar (Fixed 220px) */}
      <div className="shell-sidebar-zone">
        <Sidebar activeNav={activeNav} onSelectNav={onSelectNav} />
      </div>

      {/* 2. Main Column: Header + Workspace + Status Bar */}
      <div className="shell-main-zone">
        <div className="shell-header-zone">
          <Header currentSection="01 / OPERATIONS" />
        </div>

        <main className="shell-workspace-zone">
          {children}
        </main>

        <div className="shell-status-zone">
          <StatusBar telemetry={telemetry} />
        </div>
      </div>

      <style>{`
        .app-shell-root {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #F8F9FA;
          position: relative;
        }

        .shell-sidebar-zone {
          width: 220px;
          min-width: 220px;
          max-width: 220px;
          height: 100vh;
          flex-shrink: 0;
          border-right: 1px solid rgba(10, 13, 18, 0.08);
          z-index: 30;
          background: #FFFFFF;
        }

        .shell-main-zone {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100vh;
          overflow: hidden;
          background: #F8F9FA;
        }

        .shell-header-zone {
          height: 52px;
          min-height: 52px;
          max-height: 52px;
          width: 100%;
          flex-shrink: 0;
          border-bottom: 1px solid rgba(10, 13, 18, 0.08);
          z-index: 20;
          background: #FFFFFF;
        }

        .shell-workspace-zone {
          flex: 1;
          min-height: 0;
          width: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          background: #F8F9FA;
        }

        .shell-status-zone {
          height: 26px;
          min-height: 26px;
          max-height: 26px;
          width: 100%;
          flex-shrink: 0;
          border-top: 1px solid rgba(10, 13, 18, 0.08);
          z-index: 20;
          background: #FFFFFF;
        }
      `}</style>
    </div>
  );
}

export default AppLayout;
