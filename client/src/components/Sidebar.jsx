// client/src/components/Sidebar.jsx
// DAQ-inspired restrained, quiet enterprise navigation
import React from 'react';

export function Sidebar({ activeNav = 'overview', onSelectNav }) {
  const operationsItems = [
    { id: 'overview', index: '01.1', label: 'SOC Overview' },
    { id: 'queue', index: '01.2', label: 'Incident Queue' },
    { id: 'timeline', index: '01.3', label: 'Attack Timeline' },
    { id: 'mitre', index: '01.4', label: 'MITRE ATT&CK' },
    { id: 'impact', index: '01.5', label: 'Triage Impact' },
    { id: 'aiml', index: '01.6', label: 'AI / ML Evaluation' },
    { id: 'raw', index: '01.7', label: 'Raw Alerts' }
  ];

  const platformItems = [
    { id: 'health', index: '02.1', label: 'Telemetry Health' },
    { id: 'settings', index: '02.2', label: 'Console Settings' }
  ];

  return (
    <aside className="enterprise-sidebar">
      {/* Brand Header: Architectural & Minimal */}
      <div className="sidebar-brand-block">
        <div className="brand-title">SENTINELOPS</div>
        <div className="brand-sub mono">SECURITY OPERATIONS ARCHITECTURE</div>
      </div>

      <div className="sidebar-divider" />

      {/* 01 / OPERATIONS */}
      <div className="sidebar-section">
        <div className="sidebar-section-header mono">
          <span className="section-num">01</span>
          <span className="section-slash">/</span>
          <span className="section-label">OPERATIONS</span>
        </div>
        <nav className="sidebar-nav-list">
          {operationsItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectNav && onSelectNav(item.id)}
              >
                <span className="nav-index mono">{item.index}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-spacer" />

      <div className="sidebar-divider" />

      {/* 02 / PLATFORM */}
      <div className="sidebar-section">
        <div className="sidebar-section-header mono">
          <span className="section-num">02</span>
          <span className="section-slash">/</span>
          <span className="section-label">PLATFORM</span>
        </div>
        <nav className="sidebar-nav-list">
          {platformItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectNav && onSelectNav(item.id)}
              >
                <span className="nav-index mono">{item.index}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <style>{`
        .enterprise-sidebar {
          width: 100%;
          height: 100%;
          background: var(--surface-1);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.25rem 0.85rem;
          user-select: none;
        }

        .sidebar-brand-block {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          padding: 0.25rem 0.5rem 0.5rem 0.5rem;
        }

        .brand-title {
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--text-primary);
        }

        .brand-sub {
          font-size: 0.55rem;
          letter-spacing: 0.10em;
          color: var(--text-muted);
        }

        .sidebar-divider {
          height: 1px;
          background: var(--border);
          margin: 0.65rem 0.25rem;
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sidebar-section-header {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.5rem 0.2rem 0.5rem;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.10em;
        }

        .section-num {
          color: var(--accent-copper);
        }

        .section-slash {
          color: var(--border);
        }

        .section-label {
          color: var(--text-muted);
        }

        .sidebar-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.12rem;
        }

        .sidebar-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.45rem 0.5rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.74rem;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--transition-fast) ease, color var(--transition-fast) ease;
          text-align: left;
        }

        .sidebar-nav-btn:hover {
          background: var(--surface-2);
          color: var(--text-primary);
        }

        .sidebar-nav-btn.active {
          background: var(--surface-3);
          color: var(--text-primary);
          font-weight: 600;
          border-left: 2px solid var(--accent-copper);
        }

        .nav-index {
          font-size: 0.60rem;
          color: var(--text-muted);
          width: 24px;
          flex-shrink: 0;
        }

        .sidebar-nav-btn.active .nav-index {
          color: var(--accent-copper);
        }

        .nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-spacer {
          flex: 1;
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
