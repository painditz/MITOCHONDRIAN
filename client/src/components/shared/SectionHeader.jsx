// client/src/components/shared/SectionHeader.jsx
// Standardized editorial section header across all SentinelOps workspaces
// Dark architectural typography with Warm Ivory (#F3EFE8) and Muted Copper (#A96B42)
import React from 'react';

export function SectionHeader({
  code = '01',
  eyebrow = 'WORKFLOW',
  title = '',
  subtitle = '',
  rightContent = null,
}) {
  return (
    <div className="sentinel-section-header">
      <div className="header-meta-eyebrow mono flex-between">
        <div className="align-center" style={{ gap: '0.55rem' }}>
          <span className="meta-code">{code}</span>
          <span className="meta-sep">/</span>
          <span className="meta-eyebrow">{eyebrow}</span>
        </div>
        {rightContent && <div className="header-right-meta mono">{rightContent}</div>}
      </div>

      {title && (
        <div className="header-headline-row flex-between">
          <h1 className="header-main-title">{title}</h1>
          {subtitle && <p className="header-main-subtitle">{subtitle}</p>}
        </div>
      )}

      <style>{`
        .sentinel-section-header {
          margin-bottom: 2.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
        }

        .header-meta-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          margin-bottom: 0.75rem;
        }

        .meta-code {
          color: #A96B42;
          font-weight: 700;
        }

        .meta-sep {
          color: rgba(255, 255, 255, 0.2);
        }

        .meta-eyebrow {
          color: #B9B3AA;
        }

        .header-headline-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .header-main-title {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: clamp(2rem, 3.4vw, 3rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: #F3EFE8;
          text-transform: uppercase;
        }

        .header-main-subtitle {
          color: #B9B3AA;
          font-size: clamp(0.85rem, 1.1vw, 0.98rem);
          max-width: 540px;
          line-height: 1.6;
          margin-bottom: 0.25rem;
        }
      `}</style>
    </div>
  );
}

export default SectionHeader;
