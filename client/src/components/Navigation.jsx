// client/src/components/Navigation.jsx
// Phase B: Compact Global Top Navigation (60-72px, no sidebar, thin bottom rule)
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
          height: 64px;
          background-color: var(--color-base);
          border-bottom: 1px solid var(--color-line);
          position: sticky;
          top: 0;
          z-index: 100;
          user-select: none;
        }

        .nav-inner {
          height: 100%;
        }

        .nav-brand {
          gap: 0.35rem;
        }

        .brand-primary {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: var(--color-primary);
        }

        .brand-accent {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--color-accent);
          letter-spacing: 0.08em;
        }

        .nav-links {
          gap: 2rem;
        }

        .nav-link-btn {
          background: transparent;
          border: none;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 450;
          color: var(--color-secondary);
          cursor: pointer;
          padding: 0.5rem 0;
          position: relative;
          transition: color 140ms ease;
        }

        .nav-link-btn:hover {
          color: var(--color-primary);
        }

        .nav-link-btn.active {
          color: var(--color-primary);
          font-weight: 600;
        }

        .nav-link-btn.active::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          right: 0;
          height: 1px;
          background-color: var(--color-primary);
        }

        .nav-meta {
          gap: 0.85rem;
          font-size: 0.65rem;
          color: var(--color-secondary);
        }

        .system-status-indicator {
          gap: 0.4rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .status-live-dot {
          width: 5px;
          height: 5px;
          background-color: #16A34A;
          border-radius: 50%;
        }

        .nav-meta-sep {
          color: var(--color-line);
        }

        .utc-clock {
          color: var(--color-secondary);
        }

        .nav-settings-btn {
          background: transparent;
          border: none;
          color: var(--color-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 120ms ease;
        }

        .nav-settings-btn:hover {
          color: var(--color-primary);
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
