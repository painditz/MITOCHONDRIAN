// client/src/components/Navigation.jsx
// Global Top Navigation (Dark frosted glass, high-contrast typography, fixed 60px)
import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

export function Navigation({ activeNav = 'operations', onSelectNav }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'operations', label: 'Operations' },
    { id: 'incidents', label: 'Incidents' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'mitre', label: 'MITRE' },
    { id: 'triage', label: 'Triage' },
    { id: 'aiml', label: 'AI / ML' }
  ];

  return (
    <header className="daq-global-nav">
      <div className="daq-container nav-inner flex-between">
        {/* Left: Brand */}
        <div className="nav-brand align-center">
          <span className="brand-primary">SENTINELOPS</span>
          <span className="brand-accent mono">AI</span>
        </div>

        {/* Center: Clean Text Navigation */}
        <nav className="nav-links align-center" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectNav && onSelectNav(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: System, UTC, Settings */}
        <div className="nav-meta align-center mono">
          <div className="system-status-indicator align-center">
            <span className="status-live-dot" />
            <span>SYSTEM ACTIVE</span>
          </div>

          <span className="nav-meta-sep">/</span>

          <span className="utc-clock">{utcTime || '00:00:00 UTC'}</span>

          <span className="nav-meta-sep">/</span>

          <button className="nav-settings-btn" title="Console Settings" aria-label="Console Settings">
            <Settings size={13} />
          </button>
        </div>
      </div>

      <style>{`
        .daq-global-nav {
          width: 100%;
          height: 60px;
          background: rgba(5, 8, 11, 0.88);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          user-select: none;
        }

        .nav-inner {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(1rem, 3vw, 2.5rem);
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .brand-primary {
          font-family: var(--font-display, sans-serif);
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #f8fafc;
        }

        .brand-accent {
          font-size: 0.68rem;
          font-weight: 700;
          color: #38bdf8;
          letter-spacing: 0.08em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-link-btn {
          background: transparent;
          border: none;
          font-family: var(--font-body, sans-serif);
          font-size: 0.82rem;
          font-weight: 500;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.4rem 0;
          position: relative;
          transition: color 140ms ease;
        }

        .nav-link-btn:hover {
          color: #f8fafc;
        }

        .nav-link-btn.active {
          color: #38bdf8;
          font-weight: 600;
        }

        .nav-link-btn.active::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #38bdf8;
          border-radius: 1px;
        }

        .nav-meta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.65rem;
          color: #64748b;
        }

        .system-status-indicator {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: #e2e8f0;
          font-weight: 600;
        }

        .status-live-dot {
          width: 5px;
          height: 5px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
        }

        .nav-meta-sep {
          color: rgba(255, 255, 255, 0.12);
        }

        .utc-clock {
          color: #94a3b8;
        }

        .nav-settings-btn {
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 120ms ease;
        }

        .nav-settings-btn:hover {
          color: #f8fafc;
        }

        @media (max-width: 900px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}

export default Navigation;
