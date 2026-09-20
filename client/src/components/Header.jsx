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
          background: #FFFFFF;
          padding: 0 1.5rem;
          user-select: none;
        }

        .header-left {
          gap: 0.5rem;
          font-size: 0.72rem;
        }

        .header-section {
          font-weight: 700;
          color: #0052FF;
        }

        .header-divider {
          color: rgba(10, 13, 18, 0.20);
        }

        .header-page {
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #0A0D12;
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
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.10);
          border-radius: 4px;
          padding: 0 0.65rem;
          height: 30px;
          transition: border-color 120ms ease;
        }

        .search-field-wrap:focus-within {
          border-color: #0052FF;
          background: #FFFFFF;
        }

        .search-icon {
          color: #6C757D;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #0A0D12;
          font-family: inherit;
          font-size: 0.72rem;
        }

        .search-input::placeholder {
          color: #868E96;
        }

        .search-shortcut {
          font-size: 0.56rem;
          color: #6C757D;
          background: #FFFFFF;
          border: 1px solid rgba(10, 13, 18, 0.10);
          padding: 0.05rem 0.3rem;
          border-radius: 2px;
        }

        .header-right {
          gap: 0.75rem;
        }

        .utc-pill {
          padding: 0.2rem 0.55rem;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.08);
          border-radius: 3px;
          font-size: 0.66rem;
          color: #495057;
        }

        .system-pill {
          gap: 0.4rem;
          padding: 0.2rem 0.55rem;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.08);
          border-radius: 3px;
          font-size: 0.64rem;
          color: #495057;
        }

        .system-dot {
          width: 6px;
          height: 6px;
          background: #16A34A;
          border-radius: 50%;
        }

        .header-settings-btn {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8F9FA;
          border: 1px solid rgba(10, 13, 18, 0.08);
          border-radius: 3px;
          color: #495057;
          cursor: pointer;
          transition: color 120ms ease, border-color 120ms ease;
        }

        .header-settings-btn:hover {
          color: #0A0D12;
          border-color: rgba(10, 13, 18, 0.20);
        }
      `}</style>
    </header>
  );
}

export default Header;
