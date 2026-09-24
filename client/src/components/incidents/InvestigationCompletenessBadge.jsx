// client/src/components/incidents/InvestigationCompletenessBadge.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 Investigation Completeness Status
// Strictly computed from stored review state with zero manufactured percentages.
import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export function InvestigationCompletenessBadge({ incident }) {
  if (!incident) return null;

  const checklist = incident.investigation_checklist || {};

  const hasHumanDecision = Boolean(
    incident.analyst_decision ||
    checklist.human_decision ||
    ['CONFIRMED', 'REJECTED', 'ESCALATED', 'INVESTIGATED'].includes((incident.investigation_status || '').toUpperCase())
  );

  const hasAiBriefReview = Boolean(
    incident.ai_brief_review?.status ||
    checklist.ai_brief_review
  );

  const hasEvidenceReview = Boolean(
    (incident.evidence_reviews && incident.evidence_reviews.length > 0) ||
    checklist.evidence_review
  );

  const hasCorrelationReview = Boolean(
    (incident.correlation_reviews && incident.correlation_reviews.length > 0) ||
    checklist.correlation_review
  );

  const hasMitreReview = Boolean(
    checklist.mitre_review ||
    (incident.review_history && incident.review_history.some((h) => (h.action || '').toLowerCase().includes('mitre')))
  );

  const items = [
    { label: 'Evidence Review', done: hasEvidenceReview },
    { label: 'Correlation Review', done: hasCorrelationReview },
    { label: 'MITRE Review', done: hasMitreReview },
    { label: 'AI Brief Review', done: hasAiBriefReview },
    { label: 'Human Decision', done: hasHumanDecision },
  ];

  const completedCount = items.filter((i) => i.done).length;

  return (
    <div className="investigation-completeness-root mono">
      <div className="ic-header flex-between align-center">
        <span className="ic-title">INVESTIGATION STATUS</span>
        <span className="ic-score">{completedCount} / {items.length} VERIFIED</span>
      </div>

      <div className="ic-items-grid">
        {items.map((item, idx) => (
          <div key={idx} className={`ic-status-item align-center flex-between ${item.done ? 'verified' : 'pending'}`}>
            <span className="item-label">{item.label}</span>
            <div className="item-status-icon align-center">
              {item.done ? (
                <>
                  <span className="check-symbol">&check;</span>
                  <span className="status-text done">REVIEWED</span>
                </>
              ) : (
                <>
                  <span className="circle-symbol">&cir;</span>
                  <span className="status-text not-reviewed">NOT REVIEWED</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .investigation-completeness-root {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          color: #F3EFE8;
        }

        .ic-header {
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .ic-title {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #A96B42;
        }
        .ic-score {
          font-size: 0.6rem;
          color: #817B73;
        }

        .ic-items-grid {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .ic-status-item {
          padding: 0.4rem 0.65rem;
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          font-size: 0.65rem;
        }
        .ic-status-item.verified {
          border-left: 2px solid #5F9E88;
        }
        .ic-status-item.pending {
          border-left: 2px solid #394149;
        }

        .item-label {
          color: #F3EFE8;
          font-weight: 600;
        }

        .item-status-icon {
          gap: 0.35rem;
          font-size: 0.6rem;
          font-weight: 700;
        }
        .check-symbol {
          color: #5F9E88;
          font-size: 0.75rem;
        }
        .circle-symbol {
          color: #817B73;
          font-size: 0.75rem;
        }

        .status-text.done {
          color: #5F9E88;
        }
        .status-text.not-reviewed {
          color: #817B73;
        }
      `}</style>
    </div>
  );
}
