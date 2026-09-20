/**
 * SentinelOps AI - Phase A Centralized Design Tokens
 * Direct Translation of DAQ Consulting Architecture:
 * - Base: #F3F1EC (Warm architectural off-white)
 * - Primary: #111111 (Near-black / Charcoal)
 * - Secondary: #6F6F6F (Warm gray)
 * - Structural line: #D8D5CE
 * - Dark section: #111111 (with #F4F2ED text)
 * - Primary accent: #2563EB / #0052FF (Restrained technical blue)
 * - Semantic security colors:
 *   P1: #C73B3B (Restrained red)
 *   P2: #B98621 (Warm amber)
 *   P3: #3A83B8 (Blue)
 *   P4: #777777 (Neutral gray)
 */

export const tokens = {
  colors: {
    base: '#F3F1EC',
    surface: '#FFFFFF',
    surfaceDark: '#111111',
    textPrimary: '#111111',
    textSecondary: '#6F6F6F',
    textLight: '#F4F2ED',
    line: '#D8D5CE',
    lineDark: 'rgba(244, 242, 237, 0.12)',
    accent: '#2563EB',
    
    // Security Semantic Only
    p1: '#C73B3B',
    p2: '#B98621',
    p3: '#3A83B8',
    p4: '#777777'
  },
  typography: {
    fontDisplay: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
    fontBody: "'Inter', -apple-system, sans-serif",
    fontMono: "'IBM Plex Mono', monospace"
  },
  grid: {
    maxWidth: '1600px',
    padding: 'clamp(24px, 5vw, 96px)'
  }
};

export default tokens;
