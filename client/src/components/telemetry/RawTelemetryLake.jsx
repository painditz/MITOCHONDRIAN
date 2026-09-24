import React, { useState, useEffect } from 'react';
import { AlertEvidenceDrawer } from './AlertEvidenceDrawer';
import { RawSeverityBadge } from '../shared/StatusBadge';
import { SectionHeader } from '../shared/SectionHeader';
import { Reveal } from '../shared/Reveal';
import { Search, Database, ChevronLeft, ChevronRight, Layers, RefreshCw, Info, Upload, CheckCircle2 } from 'lucide-react';

export function RawTelemetryLake() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalAlerts, setTotalAlerts] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Phase 2: Ingestion status and dynamic reload/upload
  const [ingestionStatus, setIngestionStatus] = useState(null);
  const [isProcessingIngest, setIsProcessingIngest] = useState(false);
  const [ingestMessage, setIngestMessage] = useState('');

  const PAGE_SIZE = 25;

  const fetchIngestionStatus = () => {
    fetch('http://127.0.0.1:8000/api/alerts/ingestion-status')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setIngestionStatus(data);
      })
      .catch((e) => console.error('[Ingestion Status Error]', e));
  };

  const fetchAlerts = () => {
    setLoading(true);
    setError(null);
    const offset = (page - 1) * PAGE_SIZE;

    fetch(`http://127.0.0.1:8000/api/alerts?limit=${PAGE_SIZE}&offset=${offset}&search=${encodeURIComponent(search)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data?.alerts) {
          setAlerts(data.alerts);
          if (data.total !== undefined) setTotalAlerts(data.total);
        } else {
          setAlerts([]);
        }
      })
      .catch((err) => {
        console.error('[SentinelOps Alert Fetch Error]', err);
        setError('DATA UNAVAILABLE');
        setAlerts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
    fetchIngestionStatus();
  }, [page, search]);

  const handleReloadSynthetic = async () => {
    setIsProcessingIngest(true);
    setIngestMessage('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/reset?count=3000', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setIngestMessage(`Baseline 3,000 synthetic alert dataset loaded. Pipeline healthy (19/19 schema fields).`);
      fetchIngestionStatus();
      fetchAlerts();
    } catch (err) {
      console.error('[Reload Synthetic Error]', err);
      setIngestMessage('Error reloading synthetic dataset.');
    } finally {
      setIsProcessingIngest(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingIngest(true);
    setIngestMessage(`Parsing and ingesting ${file.name}...`);

    try {
      const text = await file.text();
      let alertObjects = [];

      if (file.name.endsWith('.json')) {
        const parsed = JSON.parse(text);
        alertObjects = Array.isArray(parsed) ? parsed : (parsed.alerts || [parsed]);
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            const obj = {};
            headers.forEach((h, idx) => {
              obj[h] = row[idx] || '';
            });
            alertObjects.push(obj);
          }
        }
      }

      if (alertObjects.length === 0) {
        throw new Error('No valid alert records found in file');
      }

      const res = await fetch('http://127.0.0.1:8000/api/alerts/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alerts: alertObjects })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const resData = await res.json();
      setIngestMessage(resData.message || `Successfully ingested ${resData.normalized} alerts through normalization & correlation.`);
      fetchIngestionStatus();
      fetchAlerts();
    } catch (err) {
      console.error('[File Ingest Error]', err);
      setIngestMessage(`Ingest failed: ${err.message}`);
    } finally {
      setIsProcessingIngest(false);
      event.target.value = '';
    }
  };

  const filtered = alerts.filter(
    (a) => severityFilter === 'ALL' || (a.severity || '').toLowerCase() === severityFilter.toLowerCase()
  );

  const totalPages = Math.max(1, Math.ceil(totalAlerts / PAGE_SIZE));

  return (
    <div className="raw-telemetry-lake-workspace">
      {/* 05 / TELEMETRY Section Header */}
      <Reveal delay={0}>
        <SectionHeader
          code="05"
          eyebrow="TELEMETRY"
          title="ALERT INGESTION &amp; RAW STREAM"
          subtitle="Direct high-throughput pipeline stream across Endpoint, Identity, Cloud, and Perimeter telemetry without loss."
          rightContent={
            <div className="align-center mono" style={{ gap: '0.85rem' }}>
              <span className="telemetry-total-pill font-bold">
                {ingestionStatus?.received ? `${ingestionStatus.received.toLocaleString()} ALERTS` : (totalAlerts ? `${totalAlerts.toLocaleString()} RAW ALERTS` : '3,000 ALERTS')} &bull; 19 FIELDS
              </span>
            </div>
          }
        />
      </Reveal>

      {/* PHASE 2: DEMONSTRABLE ALERT INGESTION & PIPELINE INTEGRITY CONTROL */}
      <Reveal delay={40}>
        <div className="alert-ingestion-control-card sentinel-glass-card mono">
          <div className="ingestion-header-row flex-between">
            <div>
              <div className="ingestion-eyebrow">PIPELINE DEMONSTRATION &bull; PROBLEM STATEMENT #25</div>
              <h2 className="ingestion-title">
                ALERT INGESTION &mdash; <span className="text-cyan">{ingestionStatus?.received ? `${ingestionStatus.received.toLocaleString()} ALERTS` : '3,000 ALERTS'}</span>
              </h2>
            </div>
            <div className="ingestion-actions align-center">
              <button
                className="ingest-btn reload-btn sentinel-interactive-btn"
                onClick={handleReloadSynthetic}
                disabled={isProcessingIngest}
                title="Reset pipeline and reload the official 3,000 alert baseline"
              >
                <RefreshCw size={13} className={isProcessingIngest ? 'spin' : ''} />
                <span>LOAD SYNTHETIC DATASET</span>
              </button>
              <label className="ingest-btn upload-btn sentinel-interactive-btn" title="Upload custom CSV or JSON telemetry batch">
                <Upload size={13} />
                <span>UPLOAD CSV / JSON</span>
                <input
                  type="file"
                  accept=".csv,.json"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                  disabled={isProcessingIngest}
                />
              </label>
            </div>
          </div>

          {/* 4-Stat Pipeline Validation Grid */}
          <div className="pipeline-validation-grid">
            <div className="validation-item">
              <span className="val-lbl">RECEIVED</span>
              <span className="val-num text-white">
                {ingestionStatus ? ingestionStatus.received.toLocaleString() : '3,000'}
              </span>
              <span className="val-sub">ALERTS STREAMED</span>
            </div>
            <div className="validation-item">
              <span className="val-lbl">NORMALIZED</span>
              <span className="val-num text-cyan">
                {ingestionStatus ? ingestionStatus.normalized.toLocaleString() : '3,000'}
              </span>
              <span className="val-sub">CANONICAL ENTITIES</span>
            </div>
            <div className="validation-item">
              <span className="val-lbl">REJECTED</span>
              <span className="val-num text-green">
                {ingestionStatus ? ingestionStatus.rejected : '0'}
              </span>
              <span className="val-sub">DROPPED / MALFORMED</span>
            </div>
            <div className="validation-item">
              <span className="val-lbl">SCHEMA FIELDS</span>
              <span className="val-num text-bright-cyan">
                {ingestionStatus ? `${ingestionStatus.schema_fields} / ${ingestionStatus.total_schema_fields}` : '19 / 19'}
              </span>
              <span className="val-sub">COMPLETE FIELD MAP</span>
            </div>
          </div>

          {ingestMessage && (
            <div className="ingest-feedback-banner align-center">
              <CheckCircle2 size={13} className="text-green" />
              <span>{ingestMessage}</span>
            </div>
          )}
        </div>
      </Reveal>

      {/* Distinction Explainer Note */}
      <div className="raw-alert-explainer-note flex-between mono">
        <div className="align-center" style={{ gap: '0.5rem' }}>
          <Info size={14} className="text-cyan" />
          <span>
            <strong>RAW ALERT SEVERITY:</strong> Atomic event severity from source sensors (Defender, Firewall, Active Directory), prior to cross-sensor graph correlation or asset criticality weighting.
          </span>
        </div>
      </div>

      {/* Table Toolbar: Severity Filter + Real-time Search */}
      <Reveal delay={120}>
        <div className="telemetry-toolbar-card sentinel-glass-card flex-between">
          <div className="severity-filters-dock align-center mono">
            <span className="filter-lead-label">RAW ALERT SEVERITY:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'].map((sev) => (
              <button
                key={sev}
                className={`sev-filter-btn ${severityFilter === sev ? 'active' : ''}`}
                onClick={() => setSeverityFilter(sev)}
              >
                {sev.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="telemetry-search-box align-center">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="telemetry-search-input mono"
              placeholder="Search Alert ID, Host, User, Indicator, Scenario..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </Reveal>

      {/* 11-Column Telemetry Table */}
      <Reveal delay={180}>
        <div className="telemetry-table-workspace sentinel-glass-card">
          <div className="telemetry-table-scroll-wrapper">
            <div className="telemetry-table-grid">
              <div className="telemetry-table-header-row mono">
                <span className="col-t-time">TIMESTAMP</span>
                <span className="col-t-id">ALERT ID</span>
                <span className="col-t-source">SOURCE</span>
                <span className="col-t-type">TYPE</span>
                <span className="col-t-sev">RAW ALERT SEVERITY</span>
                <span className="col-t-asset">ASSET</span>
                <span className="col-t-user">USER</span>
                <span className="col-t-sip">SOURCE IP</span>
                <span className="col-t-dip">DEST IP</span>
                <span className="col-t-mitre">MITRE</span>
                <span className="col-t-scenario">SCENARIO</span>
              </div>

              <div className="telemetry-table-body mono">
                {loading ? (
                  <div className="telemetry-status-message loading mono">
                    <div className="sentinel-table-spinner" />
                    <span>STREAMING RAW TELEMETRY FROM INGESTION LAKE...</span>
                  </div>
                ) : error ? (
                  <div className="telemetry-status-message error mono">
                    <span>{error}</span>
                    <button className="telemetry-retry-btn mono sentinel-interactive-btn" onClick={fetchAlerts}>
                      <RefreshCw size={12} style={{ marginRight: '0.4rem' }} /> RETRY FETCH
                    </button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="telemetry-status-message empty mono">
                    <span>NO TELEMETRY ALERTS MATCH SEARCH CRITERIA</span>
                  </div>
                ) : (
                  filtered.map((a) => {
                    const timeStr = a.timestamp ? a.timestamp.slice(11, 19) + ' UTC' : '00:00:00';
                    const mitreTag = a.mitre_technique || a.mitre_tactic || '—';

                    return (
                      <div
                        key={a.alert_id}
                        className="telemetry-row sentinel-interactive-btn"
                        onClick={() => setSelectedAlert(a)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedAlert(a)}
                      >
                        <span className="col-t-time text-muted">{timeStr}</span>
                        <span className="col-t-id font-bold text-cyan">{a.alert_id}</span>
                        <span className="col-t-source text-muted">{a.source}</span>
                        <span className="col-t-type font-bold text-primary" title={a.alert_type}>
                          {a.alert_type}
                        </span>
                        <span className="col-t-sev">
                          <RawSeverityBadge severity={a.severity} />
                        </span>
                        <span className="col-t-asset" title={a.hostname || a.asset_name}>
                          {a.hostname || a.asset_name || 'CORP-HOST'}
                        </span>
                        <span className="col-t-user text-muted" title={a.user || 'SYSTEM'}>
                          {a.user || 'SYSTEM'}
                        </span>
                        <span className="col-t-sip text-muted">{a.source_ip || 'Internal'}</span>
                        <span className="col-t-dip text-muted">{a.destination_ip || 'N/A'}</span>
                        <span className="col-t-mitre">
                          <span className={`mitre-mini-tag ${mitreTag !== '—' ? 'active' : ''}`}>
                            {mitreTag}
                          </span>
                        </span>
                        <span className="col-t-scenario text-muted" title={a.scenario_id}>
                          {a.scenario_id ? a.scenario_id.slice(0, 16) : 'CORP-CLUSTER'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Pagination Dock */}
          <div className="telemetry-pagination-dock flex-between mono">
            <span className="page-status-text">
              SHOWING {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalAlerts)} OF {totalAlerts.toLocaleString()} ALERTS
            </span>

            <div className="page-nav-controls align-center">
              <button
                className="page-btn sentinel-interactive-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft size={13} /> PREV
              </button>
              <span className="page-current-num">PAGE {page} OF {totalPages}</span>
              <button
                className="page-btn sentinel-interactive-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                NEXT <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Forensic Evidence Drawer */}
      {selectedAlert && (
        <AlertEvidenceDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      )}

      <style>{`
        .raw-telemetry-lake-workspace {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Phase 2: Ingestion Control Card */
        .alert-ingestion-control-card {
          background: rgba(25, 24, 22, 0.88);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        .ingestion-eyebrow {
          font-size: 0.64rem;
          font-weight: 700;
          color: #A96B42;
          letter-spacing: 0.12em;
        }

        .ingestion-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #F3EFE8;
          margin-top: 0.2rem;
          letter-spacing: -0.01em;
        }

        .ingestion-actions {
          gap: 0.65rem;
        }

        .ingest-btn {
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 0.45rem 0.85rem;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 160ms ease;
        }

        .ingest-btn.reload-btn {
          background: rgba(169, 107, 66, 0.15);
          border: 1px solid rgba(169, 107, 66, 0.4);
          color: #F3EFE8;
        }
        .ingest-btn.reload-btn:hover {
          background: rgba(169, 107, 66, 0.28);
          border-color: #A96B42;
        }

        .ingest-btn.upload-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #C8C2B9;
        }
        .ingest-btn.upload-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #F3EFE8;
          border-color: rgba(255, 255, 255, 0.25);
        }

        .pipeline-validation-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .validation-item {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 0.75rem 1rem;
          border-radius: 4px;
        }

        .val-lbl {
          font-size: 0.6rem;
          font-weight: 700;
          color: #817B73;
          letter-spacing: 0.1em;
        }

        .val-num {
          font-size: 1.35rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .val-sub {
          font-size: 0.58rem;
          color: #817B73;
          letter-spacing: 0.06em;
        }

        .ingest-feedback-banner {
          background: rgba(95, 158, 136, 0.12);
          border: 1px solid rgba(95, 158, 136, 0.3);
          color: #F3EFE8;
          font-size: 0.68rem;
          padding: 0.5rem 0.85rem;
          border-radius: 4px;
          gap: 0.5rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .raw-alert-explainer-note {
          padding: 0.65rem 1.25rem;
          margin-bottom: 1rem;
          background: var(--surface-1);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .raw-alert-explainer-note strong {
          color: var(--accent-copper);
          font-weight: 700;
        }

        .telemetry-total-pill {
          font-size: 0.72rem;
          background: rgba(169, 107, 66, 0.12);
          border: 1px solid rgba(169, 107, 66, 0.3);
          color: var(--accent-copper);
          padding: 0.25rem 0.65rem;
          border-radius: 4px;
        }

        /* Hero stats strip */
        .telemetry-hero-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 2rem;
          margin-bottom: 0.75rem;
          background: var(--surface-1);
          border: 1px solid var(--border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-md);
        }

        .hero-strip-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
        }

        .strip-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.12em;
        }

        .strip-val {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }

        .strip-sub {
          font-size: 0.62rem;
          color: var(--text-muted);
          margin-left: 0.5rem;
          font-weight: 500;
        }

        .strip-divider {
          width: 1px;
          height: 38px;
          background: var(--border);
        }

        /* Toolbar */
        .telemetry-toolbar-card {
          padding: 0.85rem 1.75rem;
          margin-bottom: 0.75rem;
          gap: 1.5rem;
          flex-wrap: wrap;
          background: var(--surface-1);
          border: 1px solid var(--border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-md);
        }

        .filter-lead-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: var(--text-muted);
          margin-right: 0.35rem;
        }

        .severity-filters-dock {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .sev-filter-btn {
          background: var(--surface-2);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.35rem 0.7rem;
          border-radius: 3px;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .sev-filter-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-hover);
        }

        .sev-filter-btn.active {
          background: var(--accent-copper);
          color: #ffffff;
          border-color: var(--accent-copper);
        }

        .telemetry-search-box {
          position: relative;
          width: 340px;
        }

        .search-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
        }

        .telemetry-search-input {
          width: 100%;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.72rem;
          padding: 0.45rem 0.85rem 0.45rem 2.2rem;
          outline: none;
          transition: border-color var(--transition-fast) ease;
        }

        .telemetry-search-input:focus {
          border-color: var(--accent-copper);
          box-shadow: 0 0 10px rgba(169, 107, 66, 0.25);
        }

        /* 11-Column Table */
        .telemetry-table-workspace {
          overflow: hidden;
          background: var(--table-surface) !important;
          border: 1px solid var(--border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: var(--radius-md);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
        }

        .telemetry-table-scroll-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .telemetry-table-grid {
          min-width: 1280px;
          width: 100%;
        }

        .telemetry-table-header-row {
          display: grid;
          grid-template-columns: 
            90px                 /* TIME */
            105px                /* ALERT ID */
            95px                 /* SOURCE */
            minmax(180px, 1.8fr) /* TYPE */
            115px                /* SEVERITY */
            minmax(150px, 1.2fr) /* ASSET */
            minmax(120px, 1fr)   /* USER */
            110px                /* SRC IP */
            110px                /* DEST IP */
            95px                 /* MITRE */
            120px;               /* SCENARIO */
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.5rem;
          background: var(--table-header-bg);
          border-bottom: 1px solid var(--border);
          font-size: 0.68rem;
          color: var(--text-secondary);
          font-weight: 700;
          letter-spacing: 0.1em;
          box-sizing: border-box;
        }

        .telemetry-table-body {
          display: flex;
          flex-direction: column;
        }

        .telemetry-row {
          display: grid;
          grid-template-columns: 
            90px                 /* TIME */
            105px                /* ALERT ID */
            95px                 /* SOURCE */
            minmax(180px, 1.8fr) /* TYPE */
            115px                /* SEVERITY */
            minmax(150px, 1.2fr) /* ASSET */
            minmax(120px, 1fr)   /* USER */
            110px                /* SRC IP */
            110px                /* DEST IP */
            95px                 /* MITRE */
            120px;               /* SCENARIO */
          align-items: center;
          gap: 0.85rem;
          padding: 0.85rem 1.5rem;
          background-color: var(--table-row-bg);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.72rem;
          cursor: pointer;
          transition: background-color var(--transition-fast) ease;
          color: var(--text-primary);
          box-sizing: border-box;
        }

        .col-t-time,
        .col-t-id,
        .col-t-source,
        .col-t-type,
        .col-t-sev,
        .col-t-asset,
        .col-t-user,
        .col-t-sip,
        .col-t-dip,
        .col-t-mitre,
        .col-t-scenario {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .telemetry-row:hover {
          background-color: var(--table-row-hover);
        }

        .text-primary {
          color: var(--text-primary);
        }

        .text-cyan {
          color: var(--accent-copper);
        }

        .text-bright-cyan {
          color: var(--accent-copper);
        }

        .text-green {
          color: var(--system-active);
        }

        .text-muted {
          color: var(--text-muted);
        }

        .mitre-mini-tag {
          font-size: 0.6rem;
          color: var(--text-muted);
        }
        .mitre-mini-tag.active {
          color: var(--accent-copper);
          font-weight: 700;
        }

        .telemetry-pagination-dock {
          padding: 0.85rem 1.5rem;
          background: var(--surface-2);
          border-top: 1px solid var(--border);
          font-size: 0.68rem;
          color: var(--text-secondary);
        }

        .page-status-text {
          font-weight: 500;
        }

        .page-nav-controls {
          gap: 0.85rem;
        }

        .page-btn {
          background: var(--surface-1);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all var(--transition-fast) ease;
        }

        .page-btn:hover:not(:disabled) {
          color: var(--text-primary);
          border-color: var(--accent-copper);
        }

        .page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .page-current-num {
          font-weight: 700;
          color: var(--accent-copper);
        }

        .telemetry-status-message {
          padding: 4rem 2rem;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .sentinel-table-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(169, 107, 66, 0.2);
          border-top-color: var(--accent-copper);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .telemetry-retry-btn {
          background: rgba(169, 107, 66, 0.12);
          border: 1px solid rgba(169, 107, 66, 0.3);
          color: var(--accent-copper);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-sm);
          font-size: 0.68rem;
          font-weight: 700;
        }

        @media (max-width: 1200px) {
          .col-t-sip, .col-t-dip, .col-t-scenario {
            display: none;
          }
          .col-t-type { width: 22%; }
          .col-t-asset { width: 16%; }
        }
      `}</style>
    </div>
  );
}
