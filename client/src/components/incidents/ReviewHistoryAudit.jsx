// client/src/components/incidents/ReviewHistoryAudit.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Auditable Review History
// Chronological timeline displaying real timestamps, actors, actions, and states.
import React from 'react';
import { History, Shield, Cpu, UserCheck } from 'lucide-react';

export function ReviewHistoryAudit({ incident }) {
  if (!incident) return null;

  const history = incident.review_history || [];

  const formatTime = (ts) => {
    if (!ts) return '00:00:00 UTC';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      return d.toUTCString().slice(17, 25) + ' UTC';
    } catch {
      return ts;
    }
  };

  const getActorIcon = (actor) => {
    const a = (actor || '').toUpperCase();
    if (a.includes('AI')) return <Cpu size={12} className="actor-icon ai" />;
    if (a.includes('SYSTEM')) return <Shield size={12} className="actor-icon sys" />;
    return <UserCheck size={12} className="actor-icon analyst" />;
  };

  return (
    <div className="review-history-audit-root mono">
      <div className="rha-header flex-between align-center">
        <div className="align-center" style={{ gap: '0.45rem' }}>
          <History size={13} className="text-copper" />
          <span className="rha-title">REVIEW HISTORY</span>
        </div>
        <span className="rha-count">{history.length} AUDIT ENTRIES</span>
      </div>

      <div className="rha-timeline-container">
        {history.length === 0 ? (
          <div className="no-history-state">NO AUDIT LOGS RECORDED</div>
        ) : (
          history.map((entry, idx) => (
            <div key={idx} className="rha-entry-item">
              <div className="rha-time-col">
                <span className="entry-time">{formatTime(entry.timestamp)}</span>
              </div>
              <div className="rha-actor-badge align-center">
                {getActorIcon(entry.actor)}
                <span className="actor-name">{(entry.actor || 'SYSTEM').toUpperCase()}</span>
              </div>
              <div className="rha-content-col">
                <div className="action-title">{entry.action}</div>
                {(entry.previous_state || entry.new_state) && (
                  <div className="state-transition-line">
                    {entry.previous_state && <span className="prev-state">{entry.previous_state} &rarr; </span>}
                    {entry.new_state && <span className="new-state">{entry.new_state}</span>}
                  </div>
                )}
                {entry.details && <div className="entry-details-text">{entry.details}</div>}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .review-history-audit-root {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 1.15rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          color: #F3EFE8;
        }

        .rha-header {
          padding-bottom: 0.65rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .text-copper {
          color: #A96B42;
        }
        .rha-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #F3EFE8;
        }
        .rha-count {
          font-size: 0.58rem;
          color: #817B73;
        }

        .rha-timeline-container {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          max-height: 260px;
          overflow-y: auto;
          padding-right: 0.35rem;
        }

        .rha-entry-item {
          display: grid;
          grid-template-columns: 85px 85px 1fr;
          gap: 0.65rem;
          align-items: flex-start;
          padding: 0.45rem 0.55rem;
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          font-size: 0.65rem;
        }

        .rha-time-col {
          color: #A7A096;
        }
        .entry-time {
          font-size: 0.62rem;
        }

        .rha-actor-badge {
          gap: 0.3rem;
          font-size: 0.58rem;
          font-weight: 700;
          padding: 0.1rem 0.35rem;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 2px;
          white-space: nowrap;
        }
        .actor-icon.ai {
          color: #A96B42;
        }
        .actor-icon.sys {
          color: #817B73;
        }
        .actor-icon.analyst {
          color: #5F9E88;
        }

        .rha-content-col {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .action-title {
          font-weight: 700;
          color: #F3EFE8;
        }
        .state-transition-line {
          font-size: 0.6rem;
        }
        .prev-state {
          color: #817B73;
        }
        .new-state {
          color: #A96B42;
          font-weight: 600;
        }
        .entry-details-text {
          font-size: 0.58rem;
          color: #817B73;
        }

        .no-history-state {
          text-align: center;
          padding: 1.5rem;
          color: #817B73;
          font-size: 0.65rem;
        }
      `}</style>
    </div>
  );
}
