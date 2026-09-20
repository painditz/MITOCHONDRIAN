// client/src/components/StatusBar.jsx
// DAQ-inspired minimal, architectural system telemetry bar
import React from 'react';

export function StatusBar({ telemetry }) {
  const alertsCount = telemetry?.totalAlerts?.toLocaleString() || '3,000';
  const clustersCount = telemetry?.clusters || '15';
  const mitreCount = telemetry?.mitreMapped || '6';

  return (
    <footer className="enterprise-status-bar flex-between mono">
      <div className="status-left align-center">
        <span className="status-indicator align-center">
          <span className="status-pulse-dot" />
          <span>PIPELINE ACTIVE</span>
        </span>
        <span className="status-sep">|</span>
        <span className="status-item">
          ALERTS: <strong className="text-dark">{alertsCount}</strong>
        </span>
        <span className="status-sep">|</span>
        <span className="status-item">
          CLUSTERS: <strong className="text-dark">{clustersCount}</strong>
        </span>
        <span className="status-sep">|</span>
        <span className="status-item">
          MITRE: <strong className="text-dark">{mitreCount} MAPPED</strong>
        </span>
      </div>

      <div className="status-right align-center">
        <span className="status-item">
          CORRELATION: <strong className="text-blue">ACTIVE</strong>
        </span>
        <span className="status-sep">|</span>
        <span className="status-item">
          ENVIRONMENT: <strong className="text-dark">HYBRID ENTERPRISE</strong>
        </span>
      </div>

      <style>{`
        .enterprise-status-bar {
          width: 100%;
          height: 100%;
          background: #FFFFFF;
          padding: 0 1.5rem;
          font-size: 0.64rem;
          color: #6C757D;
          user-select: none;
        }

        .status-left, .status-right {
          gap: 0.75rem;
        }

        .status-indicator {
          gap: 0.4rem;
          color: #0A0D12;
          font-weight: 600;
        }

        .status-pulse-dot {
          width: 6px;
          height: 6px;
          background: #16A34A;
          border-radius: 50%;
        }

        .status-sep {
          color: rgba(10, 13, 18, 0.15);
        }

        .text-dark {
          color: #0A0D12;
        }

        .text-blue {
          color: #0052FF;
        }
      `}</style>
    </footer>
  );
}

export default StatusBar;
