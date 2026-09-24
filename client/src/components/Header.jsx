// client/src/components/Header.jsx
// DAQ-inspired restrained, architectural single-row header
import React, { useState, useEffect } from 'react';
import { Search, Settings } from 'lucide-react';

export function Header({ currentSection = '01 / OPERATIONS' }) {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="enterprise-header flex-between">
      {/* Left: Clean Technical Breadcrumb */}
      <div className="header-left align-center mono">
        <span className="header-section">{currentSection}</span>
        <span className="header-divider">/</span>
        <span className="header-page">INTELLIGENCE CONSOLE</span>
      </div>

      {/* Center: Search Field */}
      <div className="header-center">
        <div className="search-field-wrap">
          <Search size={13} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search incidents, assets, identities, indicators..." 
            className="search-input"
          />
          <span className="search-shortcut mono">⌘K</span>
        </div>
      </div>

      {/* Right: UTC Time, System Status, Settings */}
      <div className="header-right align-center">
        <div className="utc-pill mono">
          <span className="utc-time">{currentTime || '00:00:00 UTC'}</span>
        </div>

        <div className="system-pill mono align-center">
          <span className="system-dot" />
          <span>OPERATIONAL</span>
        </div>

        <button className="header-settings-btn" title="Console Settings">
          <Settings size={14} />
        </button>
      </div>

      <style>{`
        .enterprise-header {
          width: 100%;
          height: 100%;
          background: var(--surface-1);
          border-bottom: 1px solid var(--border);
          padding: 0 1.5rem;
          user-select: none;
        }

        .header-left {
          gap: 0.5rem;
          font-size: 0.72rem;
        }

        .header-section {
          font-weight: 700;
          color: var(--accent-copper);
        }

        .header-divider {
          color: var(--border);
        }

        .header-page {
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--text-primary);
        }

        .header-center {
          flex: 1;
          max-width: 420px;
          margin: 0 2rem;
        }

        .search-field-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          padding: 0 0.65rem;
          height: 30px;
          transition: border-color var(--transition-fast) ease;
        }

        .search-field-wrap:focus-within {
          border-color: var(--accent-copper);
          background: var(--surface-3);
        }

        .search-icon {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.72rem;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-shortcut {
          font-size: 0.56rem;
          color: var(--text-muted);
          background: var(--surface-1);
          border: 1px solid var(--border);
          padding: 0.05rem 0.3rem;
          border-radius: 2px;
        }

        .header-right {
          gap: 0.75rem;
        }

        .utc-pill {
          padding: 0.2rem 0.55rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 3px;
          font-size: 0.66rem;
          color: var(--text-secondary);
        }

        .system-pill {
          gap: 0.4rem;
          padding: 0.2rem 0.55rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 3px;
          font-size: 0.64rem;
          color: var(--text-secondary);
        }

        .system-dot {
          width: 6px;
          height: 6px;
          background: var(--system-active);
          border-radius: 50%;
        }

        .header-settings-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
          transition: color var(--transition-fast) ease, border-color var(--transition-fast) ease;
        }

        .header-settings-btn:hover {
          color: var(--text-primary);
          border-color: var(--accent-copper);
        }
      `}</style>
    </header>
  );
}

export default Header;
