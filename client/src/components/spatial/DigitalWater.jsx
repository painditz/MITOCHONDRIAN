// client/src/components/spatial/DigitalWater.jsx
// SentinelOps AI - Fluid Atmospheric Background (Microsoft Innovate 2026 Phase 3 Freeze)
// Visual target: Dark Graphite + Smooth Fluid Depth + Subtle Bronze + Subtle Burgundy + Very Subtle Slate Reflections
// Strictly NO bright white ribbons, NO laser lines, NO fog bands, NO pointer event capture.

import React from 'react';

export function DigitalWater() {
  return (
    <div className="sentinel-atmosphere" aria-hidden="true">
      <div className="sentinel-fluid" />
      <div className="sentinel-sheen" />
      <div className="sentinel-vignette" />
      <div className="sentinel-readability-scrim" />

      <style>{`
        /* LAYER 1: ATMOSPHERE CONTAINER (Fixed, Non-interactive) */
        .sentinel-atmosphere {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
          background: #1D1C1A; /* Dark Graphite Ground */
        }

        /* Fluid depth with subtle bronze, burgundy, and slate gradients */
        .sentinel-fluid {
          position: absolute;
          inset: -25%;
          opacity: 0.35;
          filter: blur(48px);
          background:
            radial-gradient(
              ellipse 45% 25% at 20% 30%,
              rgba(169, 107, 66, 0.18) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 50% 30% at 78% 35%,
              rgba(110, 53, 68, 0.14) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 40% 28% at 45% 75%,
              rgba(57, 65, 73, 0.16) 0%,
              transparent 70%
            ),
            radial-gradient(
              ellipse 35% 22% at 85% 80%,
              rgba(169, 107, 66, 0.12) 0%,
              transparent 65%
            );
          animation: sentinel-fluid-drift 28s ease-in-out infinite alternate;
          will-change: transform;
        }

        /* Subtle dark sheen reflection (slate & bronze tones only - NO white paths) */
        .sentinel-sheen {
          position: absolute;
          inset: -15%;
          opacity: 0.22;
          filter: blur(60px);
          background:
            radial-gradient(
              ellipse 60% 12% at 30% 25%,
              rgba(57, 65, 73, 0.20) 0%,
              transparent 68%
            ),
            radial-gradient(
              ellipse 50% 10% at 65% 60%,
              rgba(169, 107, 66, 0.14) 0%,
              transparent 68%
            );
          animation: sentinel-sheen-drift 36s ease-in-out infinite alternate;
          will-change: transform;
        }

        /* Dark edge vignette */
        .sentinel-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 30%,
            rgba(20, 19, 18, 0.65) 100%
          );
        }

        /* LAYER 2: READABILITY SCRIM (Guarantees 100% contrast for data layers) */
        .sentinel-readability-scrim {
          position: absolute;
          inset: 0;
          background: rgba(29, 28, 26, 0.35);
          pointer-events: none;
        }

        @keyframes sentinel-fluid-drift {
          0% {
            transform: translate3d(-1.5%, -1%, 0) scale(1);
          }
          50% {
            transform: translate3d(2%, 1.5%, 0) scale(1.025);
          }
          100% {
            transform: translate3d(-1%, 2%, 0) scale(1.015);
          }
        }

        @keyframes sentinel-sheen-drift {
          0% {
            transform: translate3d(1%, -1.5%, 0) scale(1);
          }
          100% {
            transform: translate3d(-1.5%, 1.5%, 0) scale(1.03);
          }
        }
      `}</style>
    </div>
  );
}

export const SentinelAtmosphere = DigitalWater;
export default DigitalWater;
