// client/src/components/incidents/MyReviewQueueRail.jsx
// SentinelOps AI - Human-in-the-Loop 2.0 My Review Queue Rail
// Real live counts calculated from backend review state.
import React, { useState, useEffect } from 'react';
import { ListFilter, AlertCircle, FileText, Share2, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function MyReviewQueueRail({ incidents = [], onFilterSelect, activeFilter = 'ALL', onIncidentClick }) {
  const [counts, setCounts] = useState({
    needs_review: 0,
    ai_briefs: 0,
    correlations: 0,
    escalated: 0,
    investigated: 0
  });

  const fetchCounts = () => {
    fetch('http://127.0.0.1:8000/api/reviews/summary')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.queue_counts) {
          setCounts(data.queue_counts);
        }
      })
      .catch((err) => {
        console.error('[MyReviewQueue Fetch Error]', err);
      });
  };

  useEffect(() => {
    fetchCounts();
  }, [incidents]);

  const queueItems = [
    { id: 'NEEDS_REVIEW', label: 'NEEDS REVIEW', count: counts.needs_review, icon: AlertCircle, color: '#A96B42' },
    { id: 'AI_BRIEFS', label: 'AI BRIEFS', count: counts.ai_briefs, icon: FileText, color: '#A96B42' },
    { id: 'CORRELATIONS', label: 'CORRELATION', count: counts.correlations, icon: Share2, color: '#C8C2B9' },
    { id: 'ESCALATED', label: 'ESCALATED', count: counts.escalated, icon: ArrowUpRight, color: '#C18A4A' },
    { id: 'INVESTIGATED', label: 'INVESTIGATED', count: counts.investigated, icon: CheckCircle2, color: '#5F9E88' }
  ];

  const handleItemClick = (item) => {
    if (onFilterSelect) onFilterSelect(item.id);

    // If there is an incident matching this queue category, open or select it
    if (onIncidentClick && incidents.length > 0) {
      let match = null;
      if (item.id === 'ESCALATED') {
        match = incidents.find((i) => (i.investigation_status || '').toUpperCase() === 'ESCALATED');
      } else if (item.id === 'INVESTIGATED') {
        match = incidents.find((i) => (i.investigation_status || '').toUpperCase() === 'INVESTIGATED');
      } else if (item.id === 'NEEDS_REVIEW') {
        match = incidents.find((i) => ['NEW', 'NEEDS REVIEW', 'IN REVIEW', 'NEEDS MORE EVIDENCE'].includes((i.investigation_status || '').toUpperCase()));
      } else if (item.id === 'AI_BRIEFS') {
        match = incidents.find((i) => !i.ai_brief_review || !i.ai_brief_review.status);
      } else if (item.id === 'CORRELATIONS') {
        match = incidents.find((i) => i.correlation_reviews && i.correlation_reviews.length > 0);
      }
      if (match) {
        onIncidentClick(match);
      }
    }
  };

  return (
    <div className="my-review-queue-root mono">
      <div className="mrq-header align-center">
        <ListFilter size={13} className="text-copper" />
        <span className="mrq-title">MY REVIEW QUEUE</span>
      </div>

      <div className="mrq-items-rail">
        {queueItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`mrq-item-btn flex-between align-center ${isActive ? 'active' : ''}`}
              onClick={() => handleItemClick(item)}
              title={`Filter incidents by ${item.label}`}
            >
              <div className="item-left align-center">
                <Icon size={12} style={{ color: item.color }} />
                <span className="item-label">{item.label}</span>
              </div>
              <span className="item-count" style={{ borderColor: item.color, color: item.count > 0 ? item.color : '#817B73' }}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        .my-review-queue-root {
          background: #1D1C1A;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          color: #F3EFE8;
        }

        .mrq-header {
          gap: 0.45rem;
        }
        .text-copper {
          color: #A96B42;
        }
        .mrq-title {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #A96B42;
        }

        .mrq-items-rail {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.5rem;
        }
        @media (max-width: 900px) {
          .mrq-items-rail {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        .mrq-item-btn {
          background: #242321;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          padding: 0.45rem 0.65rem;
          font-family: inherit;
          font-size: 0.62rem;
          cursor: pointer;
          color: #C8C2B9;
          transition: all 120ms ease;
        }
        .mrq-item-btn:hover {
          border-color: #A96B42;
          background: rgba(169, 107, 66, 0.1);
          color: #F3EFE8;
        }
        .mrq-item-btn.active {
          border-color: #A96B42;
          background: rgba(169, 107, 66, 0.18);
          color: #F3EFE8;
        }

        .item-left {
          gap: 0.35rem;
        }
        .item-label {
          font-weight: 600;
          letter-spacing: 0.04em;
        }
        .item-count {
          font-size: 0.68rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.04);
          padding: 0.1rem 0.4rem;
          border-radius: 3px;
          border: 1px solid transparent;
        }
      `}</style>
    </div>
  );
}
