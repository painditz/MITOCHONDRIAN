// client/src/components/RawAlertsExplorer.jsx
// Raw Alerts Explorer: Compact dark glass table for browsing the 3,000 raw telemetry alert stream
import React, { useState, useEffect } from 'react';

export function RawAlertsExplorer() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * 20;
    fetch(`http://127.0.0.1:8000/api/alerts?limit=20&offset=${offset}&search=${encodeURIComponent(search)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (data?.alerts) {
          setAlerts(data.alerts);
          if (data.total) setTotalAlerts(data.total);
          setError(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('[RawAlertsExplorer] Live telemetry API error:', err);
        setAlerts([]);
        setError('DATA UNAVAILABLE');
        setLoading(false);
      });
  }, [page, search]);

  const filtered = alerts.filter(
    (a) => severityFilter === 'ALL' || (a.severity || '').toLowerCase() === severityFilter.toLowerCase()
  );

  return (
    <div className="raw-alerts-explorer-view">
      {/* Search & Filter Toolbar */}
      <div className="explorer-toolbar flex-between">
        <div className="prio-filters align-center mono">
          {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
            <button
              key={sev}
              className={`sev-btn ${severityFilter === sev ? 'active' : ''} ${sev.toLowerCase()}`}
              onClick={() => setSeverityFilter(sev)}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="search-and-count align-center mono">
          <input
            type="text"
            className="alerts-search-input mono"
            placeholder="Search raw alerts (ID, host, type, user)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <span className="alerts-count-tag">{totalAlerts} ALERTS IN PIPELINE</span>
        </div>
      </div>

      {/* Sleek Dark Table */}
      <div className="alerts-table-card">
        <div className="alerts-table-header flex-between mono">
          <span className="col-aid">ALERT ID</span>
          <span className="col-asev">SEVERITY</span>
          <span className="col-atype">ALERT TYPE</span>
          <span className="col-ahost">HOST / ASSET</span>
          <span className="col-auser">USER</span>
          <span className="col-atime">TIMESTAMP</span>
          <span className="col-adesc">OBSERVED EVENT</span>
        </div>

        <div className="alerts-table-rows">
          {loading ? (
            <div className="alerts-loading-row mono">Streaming raw telemetry alerts...</div>
          ) : error ? (
            <div className="alerts-empty-row mono font-bold text-red" style={{ padding: '2rem' }}>DATA UNAVAILABLE</div>
          ) : filtered.length === 0 ? (
            <div className="alerts-empty-row mono">No alerts match search criteria.</div>
          ) : (
            filtered.map((a) => (
              <div key={a.alert_id} className="alerts-table-row flex-between mono">
                <span className="col-aid font-bold text-cyan">{a.alert_id}</span>
                <span className="col-asev">
                  <span className={`sev-badge ${(a.severity || 'low').toLowerCase()}`}>{a.severity}</span>
                </span>
                <span className="col-atype text-white">{a.alert_type}</span>
                <span className="col-ahost text-slate">{a.hostname}</span>
                <span className="col-auser text-slate">{a.user || 'SYSTEM'}</span>
                <span className="col-atime text-slate">{(a.timestamp || '').slice(11, 19)} UTC</span>
                <span className="col-adesc text-slate">{a.description}</span>
              </div>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        <div className="alerts-pagination-bar flex-between mono">
          <span>PAGE {page} OF {Math.ceil(totalAlerts / 20)}</span>
          <div className="page-btn-group">
            <button
              className="page-nav-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              &larr; PREVIOUS
            </button>
            <button
              className="page-nav-btn"
              disabled={page * 20 >= totalAlerts}
              onClick={() => setPage((p) => p + 1)}
            >
              NEXT &rarr;
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .raw-alerts-explorer-view {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .explorer-toolbar {
          align-items: center;
          gap: 1rem;
        }

        .prio-filters {
          gap: 0.5rem;
        }

        .sev-btn {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
        }

        .sev-btn:hover { color: #ffffff; border-color: rgba(56, 189, 248, 0.3); }
        .sev-btn.active { background: rgba(56, 189, 248, 0.15); border-color: #38bdf8; color: #38bdf8; }
        .sev-btn.active.critical { border-color: #ff3b4d; color: #ff3b4d; background: rgba(255, 59, 77, 0.15); }
        .sev-btn.active.high { border-color: #ffb020; color: #ffb020; background: rgba(255, 176, 32, 0.15); }

        .search-and-count {
          gap: 1rem;
        }

        .alerts-search-input {
          background: rgba(7, 12, 18, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          padding: 0.45rem 0.85rem;
          color: #f8fafc;
          font-size: 0.72rem;
          width: 300px;
        }

        .alerts-count-tag {
          font-size: 0.65rem;
          color: #64748b;
        }

        .alerts-table-card {
          background: rgba(7, 12, 18, 0.75);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
        }

        .alerts-table-header {
          background: rgba(15, 23, 42, 0.7);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.85rem 1.25rem;
          font-size: 0.64rem;
          color: #64748b;
          font-weight: 700;
          letter-spacing: 0.1em;
          align-items: center;
        }

        .alerts-table-rows {
          display: flex;
          flex-direction: column;
        }

        .alerts-table-row {
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.72rem;
          align-items: center;
        }

        .alerts-table-row:hover {
          background: rgba(56, 189, 248, 0.06);
        }

        .col-aid { width: 12%; }
        .col-asev { width: 10%; }
        .col-atype { width: 18%; }
        .col-ahost { width: 16%; }
        .col-auser { width: 12%; }
        .col-atime { width: 10%; }
        .col-adesc { width: 22%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .sev-badge {
          font-size: 0.6rem;
          padding: 0.15rem 0.45rem;
          border-radius: 3px;
        }
        .sev-badge.critical { background: rgba(255, 59, 77, 0.18); color: #ff3b4d; }
        .sev-badge.high { background: rgba(255, 176, 32, 0.18); color: #ffb020; }
        .sev-badge.medium { background: rgba(56, 189, 248, 0.18); color: #38bdf8; }
        .sev-badge.low { background: rgba(148, 163, 184, 0.18); color: #94a3b8; }

        .alerts-loading-row, .alerts-empty-row {
          padding: 3rem;
          text-align: center;
          color: #64748b;
          font-size: 0.78rem;
        }

        .alerts-pagination-bar {
          background: rgba(15, 23, 42, 0.7);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 0.75rem 1.25rem;
          font-size: 0.65rem;
          color: #64748b;
        }

        .page-btn-group {
          display: flex;
          gap: 0.5rem;
        }

        .page-nav-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          font-size: 0.65rem;
          padding: 0.35rem 0.75rem;
          border-radius: 3px;
          cursor: pointer;
        }

        .page-nav-btn:hover:not(:disabled) {
          background: rgba(56, 189, 248, 0.15);
          color: #38bdf8;
        }

        .page-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
export default RawAlertsExplorer;
