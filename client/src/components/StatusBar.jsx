// client/src/components/StatusBar.jsx
// DAQ-inspired minimal, architectural system telemetry bar
// Dark glass architecture matching SentinelOps master tokens
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
          ALERTS: <strong className="text-light">{alertsCount}</strong>
        </span>
        <span className="status-sep">|</span>
        <span className="status-item">
          CLUSTERS: <strong className="text-light">{clustersCount}</strong>
        </span>
        <span className="status-sep">|</span>
        <span className="status-item">
          MITRE: <strong className="text-light">{mitreCount} MAPPED</strong>
        </span>
      </div>

      <div className="status-right align-center">
        <span className="status-item">
          CORRELATION: <strong className="text-copper">ACTIVE</strong>
        </span>
        <span className="status-sep">|</span>
        <span className="status-item">
          ENVIRONMENT: <strong className="text-light">HYBRID ENTERPRISE</strong>
        </span>
      </div>

      <style>{`
        .enterprise-status-bar {
          width: 100%;
          height: 100%;
          background: rgba(36, 35, 33, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0 1.5rem;
          font-size: 0.64rem;
          color: #817B73;
          user-select: none;
        }

        .status-left, .status-right {
          gap: 0.75rem;
        }

        .status-indicator {
          gap: 0.45rem;
          color: #F3EFE8;
          font-weight: 600;
        }

        .status-pulse-dot {
          width: 6px;
          height: 6px;
          background: #5F9E88;
          box-shadow: 0 0 6px rgba(95, 158, 136, 0.6);
          border-radius: 50%;
        }

        .status-sep {
          color: rgba(255, 255, 255, 0.12);
        }

        .text-light {
          color: #F3EFE8;
        }

        .text-copper {
          color: #A96B42;
        }
      `}</style>
    </footer>
  );
}

export default StatusBar;
