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
    base: '#242321',
    surface: 'rgba(255, 255, 255, 0.055)',
    surfaceHighlight: 'rgba(255, 255, 255, 0.085)',
    surfaceDark: '#2D2B28',
    textPrimary: '#F3EFE8',
    textSecondary: '#B9B3AA',
    textMuted: '#817B73',
    textLabel: '#A59F96',
    line: 'rgba(255, 255, 255, 0.11)',
    lineDark: 'rgba(255, 255, 255, 0.07)',
    accent: '#C58A52',
    accentBurgundy: '#B64A5F',
    accentIvory: '#F3EFE8',
    
    // Security Semantic (Sophisticated & Muted)
    p1: '#B64A5F',
    p2: '#C58A52',
    p3: '#5F9480',
    p4: '#78828A'
  },
  typography: {
    fontDisplay: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'IBM Plex Mono', 'JetBrains Mono', monospace"
  },
  grid: {
    maxWidth: '1600px',
    padding: 'clamp(24px, 5vw, 96px)'
  }
};

export default tokens;
