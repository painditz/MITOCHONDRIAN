// client/src/components/IncidentQueueTable.jsx
// Redesigned Incident Queue: Compact editorial table rows with P1-P4 filters
// Authoritative data binding to the exact backend incident dataset
import React, { useState } from 'react';

export function IncidentQueueTable({
  incidents = [],
  onSelectIncident,
  loading = false,
  error = null,
  onRetry,
}) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const priorityOptions = ['ALL', 'P1', 'P2', 'P3', 'P4'];

  const filteredIncidents = incidents.filter((inc) => {
    const p = String(inc.priority || 'P1').slice(0, 2).toUpperCase();
    const matchesPrio = priorityFilter === 'ALL' || p === priorityFilter;

    const id = (inc.incident_id || inc.id || '').toLowerCase();
    const asset = (inc.hostname || inc.asset_name || inc.asset || '').toLowerCase();
    const user = (inc.user || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = !q || id.includes(q) || asset.includes(q) || user.includes(q);
    return matchesPrio && matchesSearch;
  });

  return (
    <div className="incident-queue-table-view">
      {/* Table Toolbar with Filters and Search */}
      <div className="queue-toolbar flex-between">
        <div className="priority-tabs-row mono align-center">
          {priorityOptions.map((opt) => {
            const count =
              opt === 'ALL'
                ? incidents.length
                : incidents.filter((i) => String(i.priority || 'P1').slice(0, 2).toUpperCase() === opt).length;
            return (
              <button
                key={opt}
                className={`queue-filter-tab ${priorityFilter === opt ? 'active' : ''} ${opt.toLowerCase()}`}
                onClick={() => setPriorityFilter(opt)}
              >
                <span>{opt}</span>
                <span className="tab-count mono">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="queue-search-box">
          <input
            type="text"
            className="queue-search-input mono"
            placeholder="Filter by Incident ID, Asset, User..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sleek Dark Table */}
      <div className="queue-table-card">
        <div className="queue-table-header flex-between mono">
          <span className="col-id">INCIDENT ID</span>
          <span className="col-prio">PRIORITY</span>
          <span className="col-risk">RISK INDEX</span>
          <span className="col-asset">TARGET ASSET</span>
          <span className="col-crit">CRITICALITY</span>
          <span className="col-signals">SIGNALS</span>
          <span className="col-mitre">MITRE ATT&amp;CK</span>
          <span className="col-status">AUDIT STATUS</span>
        </div>

        <div className="queue-table-rows">
          {loading ? (
            <div className="queue-status-banner loading mono">
              <div className="queue-spinner" />
              <span>LOADING INCIDENT INTELLIGENCE</span>
            </div>
          ) : error ? (
            <div className="queue-status-banner error mono">
              <span className="error-text">INCIDENT DATA UNAVAILABLE</span>
              {onRetry && (
                <button className="queue-retry-btn mono" onClick={onRetry}>
                  RETRY
                </button>
              )}
            </div>
          ) : incidents.length === 0 ? (
            <div className="queue-status-banner empty mono">
              <span>NO INCIDENTS AVAILABLE</span>
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="queue-empty-row mono">No incidents match the active filters.</div>
          ) : (
            filteredIncidents.map((inc) => {
              const id = inc.incident_id || inc.id;
              const prio = String(inc.priority || 'P1').slice(0, 2).toUpperCase();
              const risk = Number(inc.risk_score ?? inc.riskScore ?? 0);
              const asset = inc.hostname || inc.asset_name || inc.asset || 'CORP-HOST';
              const crit = inc.asset_criticality || inc.criticality || 'MEDIUM';
              const alertCount = inc.alert_count ?? inc.signalsCount ?? 1;

              const mitreList = inc.mitre_mappings || inc.mitre_techniques || inc.mitreTechniques || [];
              const topMitre = Array.isArray(mitreList) && mitreList.length > 0
                ? (typeof mitreList[0] === 'string'
                    ? mitreList[0]
                    : mitreList[0].technique_id || mitreList[0].id)
                : 'NONE';

              const auditStatus = inc.investigation_status || 'Pending Review';
              const isConfirmed = auditStatus.toLowerCase().includes('confirm');
              const isInvestigated = auditStatus.toLowerCase().includes('investigated');

              return (
                <div
                  key={id}
                  className="queue-table-row flex-between"
                  onClick={() => onSelectIncident?.(inc)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="col-id mono font-bold text-white">{id}</span>
                  <span className="col-prio">
                    <span className={`prio-badge ${prio.toLowerCase()} mono`}>{prio}</span>
                  </span>
                  <span className="col-risk mono font-bold">
                    <span className={risk >= 80 ? 'text-red' : risk >= 60 ? 'text-amber' : risk >= 40 ? 'text-cyan' : 'text-slate'}>
                      {risk.toFixed(1)}
                    </span>
                  </span>
                  <span className="col-asset mono">{asset}</span>
                  <span className="col-crit mono">
                    <span className={`crit-badge ${crit.toLowerCase()}`}>{crit}</span>
                  </span>
                  <span className="col-signals mono text-slate">{alertCount} ALERTS</span>
                  <span className="col-mitre mono text-cyan">{topMitre}</span>
                  <span className="col-status mono">
                    <span className={`status-dot ${isConfirmed || isInvestigated ? 'active' : ''}`} />
                    <span>{auditStatus.toUpperCase()}</span>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .incident-queue-table-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .queue-toolbar {
          align-items: center;
          gap: 1rem;
        }

        .priority-tabs-row {
          gap: 0.5rem;
        }

        .queue-filter-tab {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.45rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 160ms ease;
        }

        .queue-filter-tab:hover {
          border-color: rgba(33, 212, 255, 0.4);
          color: #f8fafc;
        }

        .queue-filter-tab.active {
          background: rgba(33, 212, 255, 0.14);
          border-color: #21D4FF;
          color: #21D4FF;
        }

        .tab-count {
          font-size: 0.62rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 0.1rem 0.35rem;
          border-radius: 3px;
        }

        .queue-search-box {
          flex: 1;
          max-width: 380px;
        }

        .queue-search-input {
          width: 100%;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f8fafc;
          font-size: 0.75rem;
          padding: 0.55rem 0.85rem;
          border-radius: 4px;
          outline: none;
          transition: border-color 160ms ease;
        }

        .queue-search-input:focus {
          border-color: #21D4FF;
        }

        .queue-table-card {
          background: rgba(5, 12, 18, 0.85);
          border: 1px solid rgba(75, 190, 225, 0.16);
          border-radius: 8px;
          overflow: hidden;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .queue-table-header {
          padding: 0.85rem 1.25rem;
          background: rgba(3, 10, 16, 0.9);
          border-bottom: 1px solid rgba(75, 190, 225, 0.14);
          font-size: 0.64rem;
          font-weight: 700;
          color: #71838F;
          letter-spacing: 0.08em;
        }

        .queue-table-rows {
          display: flex;
          flex-direction: column;
        }

        .queue-table-row {
          padding: 0.95rem 1.25rem;
          border-bottom: 1px solid rgba(75, 190, 225, 0.08);
          align-items: center;
          cursor: pointer;
          transition: background 140ms ease;
          font-size: 0.78rem;
        }

        .queue-table-row:last-child {
          border-bottom: none;
        }

        .queue-table-row:hover {
          background: rgba(33, 212, 255, 0.06);
        }

        .col-id { width: 110px; font-weight: 700; color: #F1F6F8; }
        .col-prio { width: 75px; }
        .col-risk { width: 100px; }
        .col-asset { width: 220px; color: #A5B5BF; }
        .col-crit { width: 120px; }
        .col-signals { width: 110px; }
        .col-mitre { width: 140px; }
        .col-status { width: 180px; display: flex; align-items: center; gap: 0.5rem; font-size: 0.68rem; color: #75D8F5; }

        .prio-badge {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
          border: 1px solid transparent;
        }

        .prio-badge.p1 {
          background: rgba(255, 77, 93, 0.12);
          border-color: rgba(255, 77, 93, 0.35);
          color: #FF4D5D;
        }

        .prio-badge.p2 {
          background: rgba(255, 181, 46, 0.12);
          border-color: rgba(255, 181, 46, 0.35);
          color: #FFB52E;
        }

        .prio-badge.p3 {
          background: rgba(33, 212, 255, 0.12);
          border-color: rgba(33, 212, 255, 0.35);
          color: #21D4FF;
        }

        .prio-badge.p4 {
          background: rgba(183, 197, 207, 0.08);
          border-color: rgba(183, 197, 207, 0.25);
          color: #B7C5CF;
        }

        .crit-badge {
          font-size: 0.62rem;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
          font-weight: 600;
        }

        .crit-badge.critical {
          background: rgba(255, 77, 93, 0.1);
          color: #FF4D5D;
        }

        .crit-badge.high {
          background: rgba(255, 181, 46, 0.1);
          color: #FFB52E;
        }

        .crit-badge.medium {
          background: rgba(33, 212, 255, 0.1);
          color: #21D4FF;
        }

        .crit-badge.low {
          background: rgba(183, 197, 207, 0.08);
          color: #B7C5CF;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #71838F;
        }

        .status-dot.active {
          background: #10B981;
          box-shadow: 0 0 6px #10B981;
        }

        .text-red { color: #FF4D5D; }
        .text-amber { color: #FFB52E; }
        .text-cyan { color: #21D4FF; }
        .text-slate { color: #71838F; }

        .queue-status-banner {
          padding: 3rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          color: #75D8F5;
          letter-spacing: 0.12em;
          font-size: 0.75rem;
        }

        .queue-status-banner.error {
          color: #FF4D5D;
        }

        .queue-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(33, 212, 255, 0.2);
          border-top-color: #21D4FF;
          border-radius: 50%;
          animation: qSpin 800ms linear infinite;
        }

        @keyframes qSpin {
          to { transform: rotate(360deg); }
        }

        .queue-retry-btn {
          background: rgba(255, 77, 93, 0.15);
          border: 1px solid rgba(255, 77, 93, 0.4);
          color: #FF4D5D;
          padding: 0.4rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 700;
        }

        .queue-empty-row {
          padding: 2.5rem;
          text-align: center;
          color: #71838F;
          font-size: 0.75rem;
        }
      `}</style>
    </div>
  );
}

export default IncidentQueueTable;
