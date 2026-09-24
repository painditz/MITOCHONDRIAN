// client/src/components/spatial/DigitalWater.jsx
// SentinelOps AI - Premium Atmospheric Fluid Background
// Visual direction: Dark Graphite + Deep Charcoal + Subtle Burgundy + Subtle Copper + Very Dark Slate + Soft Liquid Depth
// Subtle but clearly visible fluid atmosphere. Layered behind all application content.
// Strictly NO white ribbons, NO bright streaks, NO diagonal stripes, NO glowing cables, NO cyberpunk neon.

import React from 'react';

export function DigitalWater() {
  return (
    <div className="sentinel-atmosphere" aria-hidden="true">
      {/* LAYER 1: Deep fluid pools (Copper, Burgundy, Slate, Charcoal) */}
      <div className="sentinel-fluid-deep" />

      {/* LAYER 2: Secondary liquid surface sheen (Soft Slate-Teal & Copper refraction) */}
      <div className="sentinel-fluid-surface" />

      {/* LAYER 3: Soft ambient liquid drift */}
      <div className="sentinel-fluid-ambient" />

      {/* LAYER 4: Dark edge vignette */}
      <div className="sentinel-vignette" />

      {/* LAYER 5: Dark readability scrim (Guarantees high contrast for typography while keeping fluid visible) */}
      <div className="sentinel-readability-scrim" />

      <style>{`
        /* GLOBAL ATMOSPHERE CONTAINER (Fixed, Non-interactive, Viewport-wide) */
        .sentinel-atmosphere {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
          background: #141312; /* Deep Charcoal / Dark Graphite Ground */
        }

        /* 1. Deep Liquid Atmosphere: Clearly visible, rich, organic pools */
        .sentinel-fluid-deep {
          position: absolute;
          inset: -25%;
          opacity: 0.65;
          filter: blur(52px);
          background:
            radial-gradient(
              ellipse 52% 32% at 18% 28%,
              rgba(169, 107, 66, 0.42) 0%,
              rgba(169, 107, 66, 0.15) 45%,
              transparent 72%
            ),
            radial-gradient(
              ellipse 48% 30% at 82% 32%,
              rgba(110, 53, 68, 0.38) 0%,
              rgba(110, 53, 68, 0.12) 48%,
              transparent 72%
            ),
            radial-gradient(
              ellipse 55% 35% at 38% 78%,
              rgba(45, 62, 74, 0.44) 0%,
              rgba(45, 62, 74, 0.14) 50%,
              transparent 74%
            ),
            radial-gradient(
              ellipse 42% 26% at 86% 76%,
              rgba(169, 107, 66, 0.32) 0%,
              rgba(110, 53, 68, 0.15) 50%,
              transparent 70%
            );
          animation: sentinel-fluid-drift 38s ease-in-out infinite alternate;
          will-change: transform;
        }

        /* 2. Liquid Surface Sheen: Soft secondary fluid drift with slate & copper refraction */
        .sentinel-fluid-surface {
          position: absolute;
          inset: -20%;
          opacity: 0.45;
          filter: blur(64px);
          background:
            radial-gradient(
              ellipse 55% 18% at 32% 22%,
              rgba(57, 78, 92, 0.32) 0%,
              rgba(57, 78, 92, 0.10) 45%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 46% 16% at 72% 64%,
              rgba(142, 88, 54, 0.28) 0%,
              rgba(90, 42, 54, 0.12) 45%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 38% 22% at 55% 45%,
              rgba(38, 50, 60, 0.35) 0%,
              transparent 65%
            );
          animation: sentinel-sheen-drift 52s ease-in-out infinite alternate;
          will-change: transform;
        }

        /* 3. Soft Ambient Liquid Swell */
        .sentinel-fluid-ambient {
          position: absolute;
          inset: -15%;
          opacity: 0.35;
          filter: blur(75px);
          background:
            radial-gradient(
              ellipse 60% 40% at 50% 50%,
              rgba(40, 36, 32, 0.50) 0%,
              rgba(26, 24, 22, 0.20) 60%,
              transparent 80%
            );
          animation: sentinel-ambient-swell 42s ease-in-out infinite alternate;
          will-change: transform;
        }

        /* 4. Dark Edge Vignette */
        .sentinel-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 35%,
            rgba(16, 15, 14, 0.70) 100%
          );
        }

        /* 5. Dark Readability Scrim: Controlled contrast for text without flattening liquid depth */
        .sentinel-readability-scrim {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse 85% 70% at 48% 45%,
            rgba(20, 19, 18, 0.18) 0%,
            rgba(18, 17, 16, 0.48) 100%
          );
          pointer-events: none;
        }

        /* Extremely slow, hypnotic fluid animations */
        @keyframes sentinel-fluid-drift {
          0% {
            transform: translate3d(-2%, -1.5%, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate3d(2.5%, 2%, 0) scale(1.04) rotate(0.8deg);
          }
          100% {
            transform: translate3d(-1.5%, 2.5%, 0) scale(1.02) rotate(-0.5deg);
          }
        }

        @keyframes sentinel-sheen-drift {
          0% {
            transform: translate3d(1.5%, -2%, 0) scale(1) rotate(0deg);
          }
          50% {
            transform: translate3d(-2%, 1%, 0) scale(1.03) rotate(-0.6deg);
          }
          100% {
            transform: translate3d(1%, 2%, 0) scale(1.01) rotate(0.4deg);
          }
        }

        @keyframes sentinel-ambient-swell {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.06);
          }
        }
      `}</style>
    </div>
  );
}

export const SentinelAtmosphere = DigitalWater;
export default DigitalWater;
