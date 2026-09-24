// client/src/components/Navigation.jsx
// Global Top Navigation (Translucent dark glass, clean enterprise Inter typography, 60px)
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
    { id: 'aiml', label: 'AI / ML' },
    { id: 'telemetry', label: 'Raw Alerts' },
  ];

  return (
    <header className="daq-global-nav">
      <div className="nav-inner flex-between">
        {/* Left: Brand */}
        <div className="nav-brand align-center">
          <span className="brand-primary">SENTINELOPS</span>
          <span className="brand-accent mono">AI</span>
        </div>

        {/* Center: Enterprise Navigation */}
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
          background: rgba(36, 35, 33, 0.82);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.11);
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
          padding: 0 clamp(1.5rem, 4vw, 3.5rem);
          max-width: 1600px;
          margin: 0 auto;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .brand-primary {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #F3EFE8;
        }

        .brand-accent {
          font-size: 0.65rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.08em;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2.2rem;
        }

        .nav-link-btn {
          background: transparent;
          border: none;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 14px;
          font-weight: 550;
          color: #B9B3AA;
          cursor: pointer;
          padding: 0.4rem 0;
          position: relative;
          transition: color 140ms ease;
        }

        .nav-link-btn:hover {
          color: #F3EFE8;
        }

        .nav-link-btn.active {
          color: #F3EFE8;
          font-weight: 600;
        }

        .nav-link-btn.active::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: #A96B42;
          border-radius: 1px;
        }

        .nav-meta {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-size: 0.68rem;
          color: #C8C2B9;
        }

        .system-status-indicator {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          color: #F3EFE8;
          font-weight: 600;
          font-size: 0.68rem;
        }

        .status-live-dot {
          width: 6px;
          height: 6px;
          background-color: #5F9480;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(95, 148, 128, 0.45);
        }

        .nav-meta-sep {
          color: rgba(255, 255, 255, 0.15);
        }

        .utc-clock {
          color: #B9B3AA;
          font-size: 0.68rem;
          letter-spacing: 0.05em;
        }

        .nav-settings-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.11);
          color: #B9B3AA;
          cursor: pointer;
          padding: 0.35rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 140ms ease;
        }

        .nav-settings-btn:hover {
          color: #F3EFE8;
          border-color: rgba(197, 138, 82, 0.5);
          background: rgba(255, 255, 255, 0.085);
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
