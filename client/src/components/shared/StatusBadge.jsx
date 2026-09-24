// client/src/components/shared/StatusBadge.jsx
// Enterprise status, priority, and raw severity badges matching the global dark design tokens
import React from 'react';

export function PriorityBadge({ priority = 'P1' }) {
  const p = String(priority || 'P1').slice(0, 2).toUpperCase();

  const styles = {
    P1: { color: '#B84D61', bg: 'rgba(184, 77, 97, 0.14)', border: 'rgba(184, 77, 97, 0.35)' },
    P2: { color: '#C18A4A', bg: 'rgba(193, 138, 74, 0.14)', border: 'rgba(193, 138, 74, 0.35)' },
    P3: { color: '#5C9480', bg: 'rgba(92, 148, 128, 0.14)', border: 'rgba(92, 148, 128, 0.35)' },
    P4: { color: '#77818A', bg: 'rgba(119, 129, 138, 0.14)', border: 'rgba(119, 129, 138, 0.35)' },
  };

  const theme = styles[p] || styles.P4;

  return (
    <span
      className="sentinel-prio-badge mono"
      style={{
        color: theme.color,
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        padding: '0.2rem 0.55rem',
        borderRadius: '3px',
        fontSize: '0.65rem',
        fontWeight: 700,
        letterSpacing: '0.06em',
        display: 'inline-block',
      }}
    >
      {p}
    </span>
  );
}

export function CriticalityBadge({ criticality = 'MEDIUM' }) {
  const c = String(criticality || 'MEDIUM').toUpperCase();

  const styles = {
    CRITICAL: { color: '#B84D61', bg: 'rgba(184, 77, 97, 0.14)', border: 'rgba(184, 77, 97, 0.35)' },
    HIGH: { color: '#C18A4A', bg: 'rgba(193, 138, 74, 0.14)', border: 'rgba(193, 138, 74, 0.35)' },
    MEDIUM: { color: '#5C9480', bg: 'rgba(92, 148, 128, 0.14)', border: 'rgba(92, 148, 128, 0.35)' },
    LOW: { color: '#77818A', bg: 'rgba(119, 129, 138, 0.12)', border: 'rgba(119, 129, 138, 0.28)' },
  };

  const theme = styles[c] || styles.MEDIUM;

  return (
    <span
      className="sentinel-crit-badge mono"
      style={{
        color: theme.color,
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        padding: '0.2rem 0.55rem',
        borderRadius: '3px',
        fontSize: '0.62rem',
        fontWeight: 600,
        letterSpacing: '0.06em',
        display: 'inline-block',
      }}
    >
      {c}
    </span>
  );
}

// PART 16 / Section 11: Raw Alert Severity Badges
// Distinct from incident priority (P1-P4)
export function RawSeverityBadge({ severity = 'Low' }) {
  const s = String(severity || 'Low').toLowerCase();

  let theme = { color: '#77818A', bg: 'rgba(119, 129, 138, 0.12)', border: 'rgba(119, 129, 138, 0.28)' };

  if (s.includes('info')) {
    theme = { color: '#77818A', bg: 'rgba(119, 129, 138, 0.12)', border: 'rgba(119, 129, 138, 0.25)' };
  } else if (s.includes('low')) {
    theme = { color: '#8A96A0', bg: 'rgba(138, 150, 160, 0.12)', border: 'rgba(138, 150, 160, 0.25)' };
  } else if (s.includes('med')) {
    theme = { color: '#5C9480', bg: 'rgba(92, 148, 128, 0.14)', border: 'rgba(92, 148, 128, 0.30)' };
  } else if (s.includes('high')) {
    theme = { color: '#C18A4A', bg: 'rgba(193, 138, 74, 0.14)', border: 'rgba(193, 138, 74, 0.32)' };
  } else if (s.includes('crit')) {
    theme = { color: '#B84D61', bg: 'rgba(184, 77, 97, 0.14)', border: 'rgba(184, 77, 97, 0.35)' };
  }

  return (
    <span
      className="sentinel-raw-sev-badge mono"
      style={{
        color: theme.color,
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        padding: '0.2rem 0.55rem',
        borderRadius: '3px',
        fontSize: '0.62rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        display: 'inline-block',
      }}
    >
      {severity}
    </span>
  );
}

export function AuditStatusBadge({ status = 'Pending Review' }) {
  const s = String(status || 'Pending Review').toLowerCase();
  let color = '#817B73';
  let bg = 'rgba(255, 255, 255, 0.05)';
  let border = 'rgba(255, 255, 255, 0.10)';

  if (s.includes('confirm')) {
    color = '#5F9E88';
    bg = 'rgba(95, 158, 136, 0.14)';
    border = 'rgba(95, 158, 136, 0.35)';
  } else if (s.includes('investigat')) {
    color = '#5C9480';
    bg = 'rgba(92, 148, 128, 0.14)';
    border = 'rgba(92, 148, 128, 0.35)';
  } else if (s.includes('reject')) {
    color = '#B84D61';
    bg = 'rgba(184, 77, 97, 0.14)';
    border = 'rgba(184, 77, 97, 0.35)';
  } else if (s.includes('modify')) {
    color = '#C18A4A';
    bg = 'rgba(193, 138, 74, 0.14)';
    border = 'rgba(193, 138, 74, 0.35)';
  }

  return (
    <span
      className="sentinel-audit-badge mono"
      style={{
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        padding: '0.2rem 0.55rem',
        borderRadius: '3px',
        fontSize: '0.62rem',
        fontWeight: 600,
        letterSpacing: '0.04em',
        display: 'inline-block',
      }}
    >
      {status}
    </span>
  );
}

export default PriorityBadge;
