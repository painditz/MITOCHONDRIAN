// client/src/components/IncidentQueueTable.jsx
// Redesigned Incident Queue: Compact editorial table rows with P1-P4 filters
import React, { useState } from 'react';

export function IncidentQueueTable({ incidents = [], onSelectIncident }) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const priorityOptions = ['ALL', 'P1', 'P2', 'P3', 'P4'];

  const filteredIncidents = incidents.filter((inc) => {
    const p = String(inc.priority || 'P1').slice(0, 2).toUpperCase();
    const matchesPrio = priorityFilter === 'ALL' || p === priorityFilter;

    const id = (inc.incident_id || inc.id || '').toLowerCase();
    const asset = (inc.asset_name || inc.hostname || inc.asset || '').toLowerCase();
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
          {filteredIncidents.length === 0 ? (
            <div className="queue-empty-row mono">No incidents match the active filters.</div>
          ) : (
            filteredIncidents.map((inc) => {
              const id = inc.incident_id || inc.id;
              const prio = String(inc.priority || 'P1').slice(0, 2);
              const risk = Number(inc.risk_score ?? inc.riskScore ?? 0);
              const asset = inc.asset_name || inc.hostname || inc.asset || 'CORP-HOST';
              const crit = inc.asset_criticality || inc.criticality || 'HIGH';
              const alertCount = inc.alert_count ?? inc.signalsCount ?? 1;
              const mitreList = inc.mitre_techniques || inc.mitreTechniques || inc.mitre || [];
              const topMitre = Array.isArray(mitreList) && mitreList.length > 0
                ? (typeof mitreList[0] === 'string' ? mitreList[0] : mitreList[0].id || mitreList[0].technique_id)
                : 'T1078';

              return (
                <div
                  key={id}
                  className="queue-table-row flex-between"
                  onClick={() => onSelectIncident?.(inc)}
                >
                  <span className="col-id mono font-bold text-white">{id}</span>
                  <span className="col-prio">
                    <span className={`prio-badge ${prio.toLowerCase()} mono`}>{prio}</span>
                  </span>
                  <span className="col-risk mono font-bold">
                    <span className={risk >= 80 ? 'text-red' : risk >= 60 ? 'text-amber' : 'text-cyan'}>
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
                    <span className="status-dot-active" />
                    <span>INVESTIGATE &rarr;</span>
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
          padding: 0.4rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          transition: all 140ms ease;
        }

        .queue-filter-tab:hover {
          color: #ffffff;
          border-color: rgba(56, 189, 248, 0.35);
        }

        .queue-filter-tab.active {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
          color: #38bdf8;
        }
        .queue-filter-tab.active.p1 { border-color: #ff3b4d; color: #ff3b4d; background: rgba(255, 59, 77, 0.15); }
        .queue-filter-tab.active.p2 { border-color: #ffb020; color: #ffb020; background: rgba(255, 176, 32, 0.15); }
        .queue-filter-tab.active.p3 { border-color: #38bdf8; color: #38bdf8; background: rgba(56, 189, 248, 0.15); }
        .queue-filter-tab.active.p4 { border-color: #94a3b8; color: #94a3b8; background: rgba(148, 163, 184, 0.15); }

        .tab-count {
          font-size: 0.62rem;
          opacity: 0.75;
        }

        .queue-search-input {
          background: rgba(7, 12, 18, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.45rem 0.85rem;
          color: #f8fafc;
          font-size: 0.72rem;
          width: 280px;
        }

        .queue-search-input:focus {
          outline: none;
          border-color: #38bdf8;
        }

        .queue-table-card {
          background: rgba(7, 12, 18, 0.75);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }

        .queue-table-header {
          background: rgba(15, 23, 42, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.85rem 1.25rem;
          font-size: 0.64rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.1em;
          align-items: center;
        }

        .queue-table-rows {
          display: flex;
          flex-direction: column;
        }

        .queue-table-row {
          padding: 0.95rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          align-items: center;
          font-size: 0.75rem;
          transition: all 140ms ease;
        }

        .queue-table-row:hover {
          background: rgba(56, 189, 248, 0.08);
          border-color: rgba(56, 189, 248, 0.3);
        }

        .queue-table-row:last-child {
          border-bottom: none;
        }

        .col-id { width: 12%; }
        .col-prio { width: 8%; }
        .col-risk { width: 10%; }
        .col-asset { width: 22%; }
        .col-crit { width: 14%; }
        .col-signals { width: 10%; }
        .col-mitre { width: 12%; }
        .col-status { width: 12%; text-align: right; display: flex; align-items: center; justify-content: flex-end; gap: 0.4rem; color: #38bdf8; }

        .prio-badge {
          font-size: 0.62rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
        }
        .prio-badge.p1 { background: rgba(255, 59, 77, 0.18); color: #ff3b4d; }
        .prio-badge.p2 { background: rgba(255, 176, 32, 0.18); color: #ffb020; }
        .prio-badge.p3 { background: rgba(56, 189, 248, 0.18); color: #38bdf8; }
        .prio-badge.p4 { background: rgba(148, 163, 184, 0.18); color: #94a3b8; }

        .crit-badge {
          font-size: 0.58rem;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .crit-badge.critical { color: #ff3b4d; border-color: rgba(255, 59, 77, 0.3); }
        .crit-badge.high { color: #ffb020; border-color: rgba(255, 176, 32, 0.3); }
        .crit-badge.medium { color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); }

        .status-dot-active {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38bdf8;
        }

        .queue-empty-row {
          padding: 2.5rem;
          text-align: center;
          color: #64748b;
          font-size: 0.8rem;
        }

        @media (max-width: 900px) {
          .queue-table-card {
            overflow-x: auto;
          }
          .queue-table-header, .queue-table-row {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  );
}
export default IncidentQueueTable;
