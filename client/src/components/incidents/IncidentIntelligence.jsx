// client/src/components/incidents/IncidentIntelligence.jsx
// 02 / INCIDENT INTELLIGENCE
// Premium glass investigation queue workspace with authoritative API data binding
import React, { useState } from 'react';
import { IncidentSummaryStrip } from './IncidentSummaryStrip';
import { MyReviewQueueRail } from './MyReviewQueueRail';
import { IncidentMergeModal } from './IncidentMergeModal';
import { PriorityBadge, CriticalityBadge, AuditStatusBadge } from '../shared/StatusBadge';
import { SectionHeader } from '../shared/SectionHeader';
import { Reveal } from '../shared/Reveal';
import { ArrowRight, Search, RefreshCw, Info, GitMerge, CheckSquare, Square } from 'lucide-react';

export function IncidentIntelligence({
  incidents = [],
  onSelectIncident,
  loading = false,
  error = null,
  onRetry,
  onOpenRawAlerts,
  totalAlerts = null,
}) {
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedForMerge, setSelectedForMerge] = useState([]);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);

  const toggleSelectForMerge = (id) => {
    setSelectedForMerge((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const priorityOptions = ['ALL', 'P1', 'P2', 'P3', 'P4'];

  const filteredIncidents = incidents.filter((inc) => {
    const p = String(inc.priority || 'P1').slice(0, 2).toUpperCase();
    const matchesPrio = priorityFilter === 'ALL' || p === priorityFilter;

    const id = (inc.incident_id || inc.id || '').toLowerCase();
    const asset = (inc.hostname || inc.asset_name || inc.asset || '').toLowerCase();
    const user = (inc.user || '').toLowerCase();
    const title = (inc.title || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const matchesSearch = !q || id.includes(q) || asset.includes(q) || user.includes(q) || title.includes(q);
    return matchesPrio && matchesSearch;
  });

  return (
    <div className="incident-intelligence-workspace">
      {/* 02 / INCIDENT INTELLIGENCE Section Header */}
      <Reveal delay={0}>
        <SectionHeader
          code="02"
          eyebrow="INCIDENT INTELLIGENCE"
          title="CORRELATED SECURITY CLUSTERS"
          subtitle="Pairwise graph clustering compressing raw telemetry alerts into prioritized forensic investigation objects."
          rightContent={
            <div className="align-center" style={{ gap: '1rem' }}>
              {onOpenRawAlerts && (
                <button
                  className="explore-telemetry-btn mono sentinel-interactive-btn"
                  onClick={onOpenRawAlerts}
                >
                  EXPLORE {totalAlerts ? totalAlerts.toLocaleString() : 'RAW'} ALERTS &rarr;
                </button>
              )}
              <span className="live-clusters-tag">
                {loading ? 'SYNCING API...' : `${incidents.length} ACTIVE INCIDENTS`}
              </span>
            </div>
          }
        />
      </Reveal>

      {/* Explanatory Note (Part 17) */}
      <div className="incident-prio-explainer-note flex-between mono">
        <div className="align-center" style={{ gap: '0.5rem' }}>
          <Info size={14} className="text-cyan" />
          <span>
            <strong>INCIDENT PRIORITY:</strong> Incident priority is calculated after alert correlation using asset criticality, severity, attack depth, ML relevance and alert volume.
          </span>
        </div>
      </div>

      {/* Incident Summary Strip */}
      <Reveal delay={60}>
        <IncidentSummaryStrip incidents={incidents} />
      </Reveal>

      {/* MY REVIEW QUEUE (Part 12) */}
      <Reveal delay={90}>
        <MyReviewQueueRail onSelectIncident={onSelectIncident} />
      </Reveal>

      {/* Large Glass Intelligence Workspace */}
      <Reveal delay={120}>
        <div className="intelligence-glass-workspace sentinel-glass-card">
          {/* Workspace Toolbar: Filters and Search */}
          <div className="workspace-toolbar flex-between">
            <div className="priority-tabs-dock align-center mono">
              {priorityOptions.map((opt) => {
                const count =
                  opt === 'ALL'
                    ? incidents.length
                    : incidents.filter((i) => String(i.priority || 'P1').slice(0, 2).toUpperCase() === opt).length;
                const isActive = priorityFilter === opt;

                return (
                  <button
                    key={opt}
                    className={`prio-filter-tab ${isActive ? 'active' : ''} ${opt.toLowerCase()}`}
                    onClick={() => setPriorityFilter(opt)}
                  >
                    <span>{opt}</span>
                    <span className="prio-tab-count mono">{count}</span>
                    {isActive && <span className="prio-active-indicator" />}
                  </button>
                );
              })}
            </div>

            <div className="workspace-search-container align-center">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                className="workspace-search-input mono"
                placeholder="Search Incident ID, Host, User, Title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Real Semantic HTML Table Container */}
          <div className="incident-table-container">
            <table className="incident-table">
              <colgroup>
                <col style={{ width: '25%' }} />   {/* INCIDENT */}
                <col style={{ width: '9%' }} />    {/* PRIORITY */}
                <col style={{ width: '9%' }} />    {/* RISK */}
                <col style={{ width: '20%' }} />   {/* AFFECTED ASSET */}
                <col style={{ width: '9%' }} />    {/* ASSET TIER */}
                <col style={{ width: '7%' }} />    {/* SIGNALS */}
                <col style={{ width: '7%' }} />    {/* MITRE */}
                <col style={{ width: '9%' }} />    {/* STATUS */}
                <col style={{ width: '5%' }} />    {/* ACTION */}
              </colgroup>
              <thead>
                <tr>
                  <th className="th-incident mono">INCIDENT</th>
                  <th className="th-priority mono">PRIORITY</th>
                  <th className="th-risk mono">RISK</th>
                  <th className="th-asset mono">AFFECTED ASSET</th>
                  <th className="th-tier mono">ASSET TIER</th>
                  <th className="th-signals mono">SIGNALS</th>
                  <th className="th-mitre mono">MITRE</th>
                  <th className="th-status mono">STATUS</th>
                  <th className="th-action mono">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="table-status-cell mono">
                      <div className="table-status-message loading">
                        <div className="sentinel-table-spinner" />
                        <span>LOADING AUTHORITATIVE INCIDENT INTELLIGENCE...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="table-status-cell mono">
                      <div className="table-status-message error">
                        <span>{error}</span>
                        {onRetry && (
                          <button className="table-retry-btn mono sentinel-interactive-btn" onClick={onRetry}>
                            <RefreshCw size={12} style={{ marginRight: '0.4rem' }} /> RETRY FETCH
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : incidents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="table-status-cell mono">
                      <div className="table-status-message empty">
                        <span>NO INCIDENTS RETURNED FROM API</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="table-status-cell mono">
                      <div className="table-status-message empty">
                        <span>NO INCIDENTS MATCH THE SELECTED FILTER</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredIncidents.map((inc) => {
                    const id = inc.incident_id || inc.id;
                    const prio = String(inc.priority || 'P1').slice(0, 2).toUpperCase();
                    const risk = Number(inc.risk_score ?? inc.riskScore ?? 0);
                    const asset = inc.hostname || inc.asset_name || inc.asset || 'CORP-HOST';
                    const crit = inc.asset_criticality || inc.criticality || 'MEDIUM';
                    const alertCount = inc.alert_count ?? inc.signalsCount ?? (inc.alerts?.length || 1);

                    const mitreList = inc.mitre_mappings || inc.mitre_techniques || [];
                    const topMitre =
                      Array.isArray(mitreList) && mitreList.length > 0
                        ? typeof mitreList[0] === 'string'
                          ? mitreList[0]
                          : mitreList[0].technique_id || mitreList[0].id
                        : 'NONE';

                    const auditStatus = inc.investigation_status || 'Pending Review';

                    return (
                      <tr
                        key={id}
                        className={`incident-table-row ${selectedForMerge.includes(id) ? 'row-merge-selected' : ''}`}
                        onClick={() => onSelectIncident?.(inc)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && onSelectIncident?.(inc)}
                      >
                        {/* Incident ID & Full Title */}
                        <td className="incident-cell mono">
                          <div className="incident-id-row align-center" style={{ gap: '0.45rem', marginBottom: '0.2rem' }}>
                            <button
                              type="button"
                              className={`select-merge-btn ${selectedForMerge.includes(id) ? 'selected' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectForMerge(id);
                              }}
                              title={`Select ${id} for multi-incident merge`}
                            >
                              {selectedForMerge.includes(id) ? (
                                <CheckSquare size={13} className="text-copper" />
                              ) : (
                                <Square size={13} className="text-muted" />
                              )}
                            </button>
                            <span className="incident-id-text">{id}</span>
                          </div>
                          <span className="incident-title" title={inc.title || 'Security Cluster'}>
                            {inc.title || 'Security Cluster'}
                          </span>
                        </td>

                        {/* Priority */}
                        <td className="priority-cell">
                          <PriorityBadge priority={prio} />
                        </td>

                        {/* Risk Score */}
                        <td className="risk-cell mono">
                          <span
                            className={`risk-score-val ${
                              risk >= 80 ? 'p1-text' : risk >= 60 ? 'p2-text' : risk >= 40 ? 'p3-text' : 'p4-text'
                            }`}
                          >
                            {risk.toFixed(1)}
                          </span>
                          <span className="risk-score-max">/100</span>
                        </td>

                        {/* Target Asset & User */}
                        <td className="asset-cell mono">
                          <span className="asset-name" title={asset}>
                            {asset}
                          </span>
                          <span className="asset-user" title={inc.user || 'SYSTEM'}>
                            {inc.user || 'SYSTEM'}
                          </span>
                        </td>

                        {/* Criticality */}
                        <td className="tier-cell">
                          <CriticalityBadge criticality={crit} />
                        </td>

                        {/* Signals / Alert Volume */}
                        <td className="signals-cell mono">
                          <span className="signals-count-pill">{alertCount} ALERTS</span>
                        </td>

                        {/* MITRE Technique */}
                        <td className="mitre-cell mono">
                          <span
                            className={`mitre-tag-badge ${topMitre !== 'NONE' ? 'active' : 'empty'}`}
                            title={topMitre}
                          >
                            {topMitre}
                          </span>
                        </td>

                        {/* Investigation / Audit Status */}
                        <td className="status-cell">
                          <AuditStatusBadge status={auditStatus} />
                        </td>

                        {/* Action Callout */}
                        <td className="action-cell mono">
                          <span className="investigate-action-label">
                            INVESTIGATE <ArrowRight size={12} className="action-arrow" />
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Floating Merge Dock when 2+ Incidents Selected (Part 8) */}
          {selectedForMerge.length >= 2 && (
            <div className="merge-floating-dock flex-between align-center mono">
              <div className="align-center" style={{ gap: '0.75rem' }}>
                <GitMerge size={16} className="text-copper" />
                <span className="merge-dock-count font-bold text-copper">
                  {selectedForMerge.length} INCIDENTS SELECTED
                </span>
                <span className="merge-dock-desc text-muted">
                  Ready for analyst merge review ({selectedForMerge.join(', ')})
                </span>
              </div>
              <div className="align-center" style={{ gap: '0.6rem' }}>
                <button
                  type="button"
                  className="clear-select-btn mono"
                  onClick={() => setSelectedForMerge([])}
                >
                  CLEAR
                </button>
                <button
                  type="button"
                  className="merge-incidents-btn mono sentinel-interactive-btn"
                  onClick={() => setIsMergeModalOpen(true)}
                >
                  MERGE INCIDENTS &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* Incident Merge Modal */}
      {isMergeModalOpen && (
        <IncidentMergeModal
          selectedIncidents={incidents.filter((i) => selectedForMerge.includes(i.incident_id || i.id))}
          onClose={() => setIsMergeModalOpen(false)}
          onMergeConfirmed={() => {
            setSelectedForMerge([]);
            onRetry?.();
          }}
        />
      )}

      <style>{`
        .incident-intelligence-workspace {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 2.5rem 0 5rem;
        }

        .explore-telemetry-btn {
          background: rgba(169, 107, 66, 0.12);
          border: 1px solid rgba(169, 107, 66, 0.35);
          color: #F3EFE8;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 0.45rem 1rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          cursor: pointer;
          transition: all 160ms ease;
        }
        .explore-telemetry-btn:hover {
          background: #A96B42;
          color: #1D1C1A;
        }

        .live-clusters-tag {
          font-size: 0.68rem;
          color: #C8C2B9;
          letter-spacing: 0.1em;
        }

        .incident-prio-explainer-note {
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          margin-bottom: 1.5rem;
          font-size: 0.72rem;
          color: #B9B3AA;
          line-height: 1.4;
        }

        .incident-prio-explainer-note strong {
          color: #A96B42;
          font-weight: 700;
        }

        /* Large Glass Intelligence Workspace */
        .intelligence-glass-workspace {
          background: rgba(29, 28, 26, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.10);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }

        /* Workspace Toolbar */
        .workspace-toolbar {
          padding: 1.15rem 1.75rem;
          background: rgba(22, 21, 20, 0.95);
          border-bottom: 1px solid rgba(255, 255, 255, 0.10);
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .priority-tabs-dock {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .prio-filter-tab {
          position: relative;
          background: transparent;
          border: none;
          color: #A7A096;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.45rem 0.85rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          transition: color 160ms ease;
        }

        .prio-filter-tab:hover {
          color: #F3EFE8;
        }

        .prio-filter-tab.active {
          color: #F3EFE8;
          font-weight: 700;
        }

        .prio-active-indicator {
          position: absolute;
          bottom: -4px;
          left: 10%;
          right: 10%;
          height: 2px;
          background: #A96B42;
          border-radius: 2px;
        }

        .prio-tab-count {
          font-size: 0.62rem;
          padding: 0.1rem 0.35rem;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 3px;
          color: #C8C2B9;
        }

        .workspace-search-container {
          position: relative;
          width: 320px;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          color: #A7A096;
        }

        .workspace-search-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 4px;
          color: #F3EFE8;
          font-size: 0.72rem;
          padding: 0.5rem 0.85rem 0.5rem 2.2rem;
          outline: none;
          transition: border-color 160ms ease;
        }

        .workspace-search-input:focus {
          border-color: #A96B42;
          box-shadow: 0 0 10px rgba(169, 107, 66, 0.25);
        }

        /* Semantic Table Container and Horizontal Scroll */
        .incident-table-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          background: rgba(29, 28, 26, 0.88);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45);
        }

        .incident-table {
          width: 100%;
          min-width: 1400px;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .incident-table th {
          padding: 1rem 1.25rem;
          background: rgba(22, 21, 20, 0.98);
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #C8C2B9;
          text-align: left;
          white-space: nowrap;
          box-sizing: border-box;
        }

        .incident-table th.th-action {
          text-align: right;
        }

        .incident-table td {
          padding: 1.15rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          vertical-align: middle;
          box-sizing: border-box;
          background: transparent;
        }

        /* Enforce identical synchronized column geometry */
        .th-incident, .incident-cell {
          width: 25%;
          min-width: 280px;
        }
        .th-priority, .priority-cell {
          width: 9%;
          min-width: 110px;
          white-space: nowrap;
        }
        .th-risk, .risk-cell {
          width: 9%;
          min-width: 110px;
          white-space: nowrap;
        }
        .th-asset, .asset-cell {
          width: 20%;
          min-width: 220px;
        }
        .th-tier, .tier-cell {
          width: 9%;
          min-width: 110px;
          white-space: nowrap;
        }
        .th-signals, .signals-cell {
          width: 7%;
          min-width: 95px;
          white-space: nowrap;
        }
        .th-mitre, .mitre-cell {
          width: 7%;
          min-width: 95px;
          white-space: nowrap;
        }
        .th-status, .status-cell {
          width: 9%;
          min-width: 120px;
          white-space: nowrap;
        }
        .th-action, .action-cell {
          width: 5%;
          min-width: 85px;
          white-space: nowrap;
          text-align: right;
        }

        .incident-table-row {
          cursor: pointer;
          transition: background-color 160ms ease;
        }

        .incident-table-row:hover td {
          background-color: rgba(255, 255, 255, 0.045);
        }

        .incident-table-row:hover .incident-id-text {
          color: #A96B42;
        }

        .incident-table-row:hover .investigate-action-label {
          opacity: 1;
          transform: translateX(0);
          color: #A96B42;
        }

        .incident-cell {
          min-width: 0;
        }

        .incident-id-text {
          font-size: 0.88rem;
          font-weight: 700;
          color: #F3EFE8;
          display: block;
          white-space: nowrap;
          margin-bottom: 0.25rem;
          transition: color 160ms ease;
        }

        .incident-title {
          font-size: 0.72rem;
          color: #C8C2B9;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          line-height: 1.35;
        }

        .priority-cell {
          white-space: nowrap;
        }

        .risk-cell {
          white-space: nowrap;
        }

        .risk-score-val {
          font-size: 1.1rem;
          font-weight: 700;
          white-space: nowrap;
          transition: all 160ms ease;
        }
        .risk-score-max {
          font-size: 0.68rem;
          color: #A7A096;
          margin-left: 0.15rem;
          white-space: nowrap;
        }

        .p1-text { color: #B84D61; }
        .p2-text { color: #C18A4A; }
        .p3-text { color: #5C9480; }
        .p4-text { color: #77818A; }

        .asset-cell {
          min-width: 0;
        }

        .asset-name {
          font-size: 0.80rem;
          font-weight: 600;
          color: #F3EFE8;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 0.2rem;
        }

        .asset-user {
          font-size: 0.70rem;
          color: #A7A096;
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tier-cell {
          white-space: nowrap;
        }

        .signals-cell {
          white-space: nowrap;
        }

        .signals-count-pill {
          font-size: 0.68rem;
          font-weight: 600;
          color: #C8C2B9;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.25rem 0.55rem;
          border-radius: 3px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          white-space: nowrap;
        }

        .mitre-cell {
          white-space: nowrap;
        }

        .mitre-tag-badge {
          display: inline-block;
          font-size: 0.65rem;
          font-weight: 600;
          padding: 0.2rem 0.45rem;
          border-radius: 3px;
          white-space: nowrap;
        }
        .mitre-tag-badge.active {
          color: #A96B42;
          background: rgba(169, 107, 66, 0.12);
          border: 1px solid rgba(169, 107, 66, 0.30);
        }
        .mitre-tag-badge.empty {
          color: #A7A096;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .status-cell {
          white-space: nowrap;
        }

        .action-cell {
          white-space: nowrap;
          text-align: right;
        }

        .investigate-action-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: #A96B42;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          opacity: 0.85;
          transform: translateX(-4px);
          transition: all 180ms ease;
          white-space: nowrap;
        }

        .action-arrow {
          transition: transform 180ms ease;
        }

        .incident-table-row:hover .action-arrow {
          transform: translateX(3px);
        }

        .table-status-cell {
          text-align: center;
          padding: 4rem 2rem;
        }

        .table-status-message {
          font-size: 0.75rem;
          color: #A7A096;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .sentinel-table-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(169, 107, 66, 0.2);
          border-top-color: #A96B42;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .table-retry-btn {
          background: rgba(169, 107, 66, 0.12);
          border: 1px solid rgba(169, 107, 66, 0.35);
          color: #F3EFE8;
          padding: 0.4rem 0.85rem;
          border-radius: 4px;
          font-size: 0.68rem;
          font-weight: 700;
        }

        /* Multi-Select & Merge Styling */
        .th-select {
          text-align: center;
          color: #A96B42;
          font-size: 0.65rem;
        }

        .select-cell {
          text-align: center;
          padding: 0.5rem 0;
        }

        .select-merge-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 3px;
          transition: background 140ms ease;
        }

        .select-merge-btn:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .row-merge-selected {
          background: rgba(169, 107, 66, 0.08) !important;
          border-left: 2px solid #A96B42;
        }

        .merge-floating-dock {
          margin-top: 1rem;
          padding: 0.9rem 1.4rem;
          background: rgba(36, 35, 33, 0.95);
          border: 1px solid #A96B42;
          border-radius: 6px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
          animation: slideUp 200ms ease-out;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .merge-dock-count {
          font-size: 0.78rem;
          letter-spacing: 0.08em;
        }

        .merge-dock-desc {
          font-size: 0.68rem;
          color: #A7A096;
        }

        .clear-select-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #C8C2B9;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 140ms ease;
        }

        .clear-select-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #F3EFE8;
        }

        .merge-incidents-btn {
          background: #A96B42;
          border: 1px solid #A96B42;
          color: #F3EFE8;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.45rem 1.1rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 160ms ease;
          box-shadow: 0 2px 10px rgba(169, 107, 66, 0.3);
        }

        .merge-incidents-btn:hover {
          background: #C58A52;
          border-color: #C58A52;
          color: #1D1C1A;
        }
      `}</style>
    </div>
  );
}
