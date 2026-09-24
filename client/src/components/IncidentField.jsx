// client/src/components/IncidentField.jsx
// Spatial Live Incident Intelligence Field in Hero (40% of hero width, 8 incidents, relationships, inspection modal)
import React, { useState } from 'react';

export function IncidentField({ incidents = [], onSelectIncident, activeIncidentId }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Observable relationships (lines connecting incidents)
  const edges = [
    { from: 'INC-101', to: 'INC-102', reason: 'HOST & KERBEROS RPC TRAVERSAL' },
    { from: 'INC-103', to: 'INC-102', reason: 'EXECUTIVE PHISHING PIVOT' },
    { from: 'INC-102', to: 'INC-105', reason: 'CROSS-TIER EXFILTRATION' },
    { from: 'INC-102', to: 'INC-108', reason: 'ACTIVE DIRECTORY TICKET INJECTION' },
    { from: 'INC-106', to: 'INC-103', reason: 'PERIMETER SPRAY OVERLAP' },
    { from: 'INC-108', to: 'INC-111', reason: 'INTERNAL SUBNET RECONNAISSANCE' },
    { from: 'INC-114', to: 'INC-101', reason: 'DISCOVERY BROADCAST' }
  ];

  const getPriorityColor = (prio) => {
    switch (prio) {
      case 'P1': return '#C73B3B';
      case 'P2': return '#B98621';
      case 'P3': return '#3A83B8';
      default: return '#777777';
    }
  };

  const activeInc = incidents.find(i => i.id === (hoveredId || activeIncidentId)) || incidents[1];

  return (
    <div className="incident-field-blueprint" aria-label="Incident Intelligence Topology">
      {/* Blueprint Header */}
      <div className="blueprint-top-strip flex-between mono">
        <div className="strip-title align-center">
          <span className="live-dot" />
          <span>INCIDENT INTELLIGENCE FIELD</span>
        </div>
        <div className="strip-meta">
          8 CLUSTERS • SPATIAL PIVOTS
        </div>
      </div>

      {/* SVG Canvas for Observable Relationship Lines */}
      <div className="field-canvas-container">
        <svg className="field-svg-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
          {edges.map((edge, idx) => {
            const source = incidents.find(i => i.id === edge.from);
            const target = incidents.find(i => i.id === edge.to);
            if (!source || !target) return null;

            const isHighlighted = hoveredId === source.id || hoveredId === target.id || 
                                  activeIncidentId === source.id || activeIncidentId === target.id;

            return (
              <line
                key={idx}
                x1={source.coords.x}
                y1={source.coords.y}
                x2={target.coords.x}
                y2={target.coords.y}
                stroke={isHighlighted ? '#111111' : '#D8D5CE'}
                strokeWidth={isHighlighted ? '0.75' : '0.35'}
                strokeDasharray={isHighlighted ? 'none' : '1.5 1.5'}
                opacity={isHighlighted ? 0.95 : 0.45}
                className="relationship-hairline"
              />
            );
          })}
        </svg>

        {/* Spatially Positioned Incident Nodes */}
        {incidents.map((inc) => {
          const isHovered = hoveredId === inc.id;
          const isSelected = activeIncidentId === inc.id;
          const prioColor = getPriorityColor(inc.priority);

          return (
            <div
              key={inc.id}
              className={`incident-spatial-node ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
              style={{
                left: `${inc.coords.x}%`,
                top: `${inc.coords.y}%`
              }}
              onMouseEnter={() => setHoveredId(inc.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onSelectIncident && onSelectIncident(inc.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') onSelectIncident && onSelectIncident(inc.id); }}
            >
              {/* Technical Marker Circle */}
              <div 
                className="marker-circle"
                style={{ 
                  borderColor: isSelected || isHovered ? prioColor : 'rgba(17, 17, 17, 0.25)',
                  backgroundColor: isSelected ? prioColor : '#FFFFFF'
                }}
              >
                <div 
                  className="marker-inner-dot" 
                  style={{ backgroundColor: isSelected ? '#FFFFFF' : prioColor }}
                />
              </div>

              {/* Technical ID & Risk Label */}
              <div className="marker-caption mono">
                <span className="caption-id">{inc.id}</span>
                <span className="caption-prio" style={{ color: prioColor }}>{inc.priority}</span>
                <span className="caption-score">{inc.riskScore}</span>
              </div>
            </div>
          );
        })}

        {/* Compact Scannable Tooltip upon Hover */}
        {hoveredId && activeInc && (
          <div 
            className="spatial-hover-tooltip mono"
            style={{
              left: `${Math.min(activeInc.coords.x + 4, 72)}%`,
              top: `${Math.max(activeInc.coords.y - 12, 6)}%`
            }}
          >
            <div className="tooltip-head flex-between">
              <span className="tooltip-inc-id">{activeInc.id}</span>
              <span className="tooltip-prio-tag" style={{ color: getPriorityColor(activeInc.priority) }}>
                {activeInc.priority} / {activeInc.riskScore}
              </span>
            </div>
            <div className="tooltip-asset-text">{activeInc.asset}</div>
            <div className="tooltip-footer-row flex-between">
              <span>{activeInc.signalsCount} alerts</span>
              <span>{activeInc.criticality}</span>
            </div>
          </div>
        )}
      </div>

      {/* Blueprint Legend Footer */}
      <div className="blueprint-bottom-bar flex-between mono">
        <div className="legend-pills-row align-center">
          <span className="legend-chip align-center">
            <span className="chip-dot" style={{ backgroundColor: '#C73B3B' }} />
            <span>P1 Critical</span>
          </span>
          <span className="legend-chip align-center">
            <span className="chip-dot" style={{ backgroundColor: '#B98621' }} />
            <span>P2 High</span>
          </span>
          <span className="legend-chip align-center">
            <span className="chip-dot" style={{ backgroundColor: '#3A83B8' }} />
            <span>P3 Medium</span>
          </span>
        </div>
        <div className="legend-instruction">
          CLICK INCIDENT TO INSPECT →
        </div>
      </div>

      <style>{`
        .incident-field-blueprint {
          width: 100%;
          height: 100%;
          min-height: 480px;
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          user-select: none;
        }

        .blueprint-top-strip {
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--border);
          background: var(--surface-2);
          font-size: 0.64rem;
          color: var(--text-muted);
        }

        .strip-title {
          gap: 0.4rem;
          color: var(--text-primary);
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .live-dot {
          width: 5px;
          height: 5px;
          background-color: var(--system-active);
          border-radius: 50%;
        }

        .field-canvas-container {
          flex: 1;
          position: relative;
          background: transparent;
          min-height: 400px;
        }

        .field-svg-lines {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .relationship-hairline {
          transition: stroke var(--transition-fast) ease, stroke-width var(--transition-fast) ease, opacity var(--transition-fast) ease;
        }

        /* Spatial Incident Nodes */
        .incident-spatial-node {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 140ms ease;
          outline: none;
          z-index: 5;
        }

        .incident-spatial-node:hover,
        .incident-spatial-node:focus-visible {
          transform: translate(-50%, -50%) scale(1.08);
          z-index: 10;
        }

        .marker-circle {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1D1C1A;
          transition: all 140ms ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .marker-inner-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .marker-caption {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          margin-top: 0.35rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          padding: 0.08rem 0.4rem;
          border-radius: 2px;
          font-size: 0.60rem;
          white-space: nowrap;
        }

        .caption-id {
          font-weight: 700;
          color: var(--color-primary);
        }

        .caption-score {
          color: var(--color-secondary);
        }

        /* Hover Tooltip */
        .spatial-hover-tooltip {
          position: absolute;
          width: 190px;
          background: #111111;
          color: #F4F2ED;
          padding: 0.65rem 0.85rem;
          font-size: 0.64rem;
          pointer-events: none;
          z-index: 20;
          border: 1px solid rgba(244, 242, 237, 0.20);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
        }

        .tooltip-head {
          margin-bottom: 0.25rem;
        }

        .tooltip-inc-id {
          font-weight: 700;
        }

        .tooltip-prio-tag {
          font-weight: 700;
        }

        .tooltip-asset-text {
          font-size: 0.60rem;
          color: rgba(244, 242, 237, 0.75);
          margin-bottom: 0.35rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tooltip-footer-row {
          font-size: 0.55rem;
          color: rgba(244, 242, 237, 0.50);
          border-top: 1px solid rgba(244, 242, 237, 0.12);
          padding-top: 0.3rem;
        }

        /* Bottom Legend Strip */
        .blueprint-bottom-bar {
          padding: 0.65rem 1.25rem;
          border-top: 1px solid var(--border);
          background: var(--surface-2);
          font-size: 0.60rem;
          color: var(--text-muted);
        }

        .legend-pills-row {
          gap: 1rem;
        }

        .legend-chip {
          gap: 0.35rem;
        }

        .chip-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .legend-instruction {
          color: var(--accent-copper);
          font-weight: 600;
          letter-spacing: 0.04em;
        }
      `}</style>
    </div>
  );
}

export default IncidentField;
