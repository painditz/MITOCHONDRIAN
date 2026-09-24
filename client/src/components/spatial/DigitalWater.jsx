// client/src/components/spatial/DigitalWater.jsx
// SentinelOps AI - New Global Atmospheric Background
import React from 'react';

export function DigitalWater() {
  return (
    <div className="sentinel-atmosphere" aria-hidden="true">
      <div className="sentinel-fluid sentinel-fluid-a" />
      <div className="sentinel-fluid sentinel-fluid-b" />
      <div className="sentinel-fluid sentinel-fluid-c" />
      <div className="sentinel-atmosphere-vignette" />

      <style>{`
        .sentinel-atmosphere {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
          background:
            radial-gradient(
              ellipse 80% 60% at 15% 20%,
              rgba(166, 93, 53, 0.16) 0%,
              rgba(91, 47, 39, 0.10) 28%,
              transparent 65%
            ),
            radial-gradient(
              ellipse 70% 65% at 82% 28%,
              rgba(110, 53, 68, 0.18) 0%,
              rgba(66, 35, 40, 0.10) 32%,
              transparent 68%
            ),
            radial-gradient(
              ellipse 90% 70% at 55% 88%,
              rgba(64, 42, 36, 0.16) 0%,
              transparent 65%
            ),
            #0e0d0d;
        }

        .sentinel-fluid {
          position: absolute;
          width: 75vw;
          height: 45vw;
          min-width: 700px;
          min-height: 420px;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(45px);
          will-change: transform;
        }

        .sentinel-fluid-a {
          top: -15%;
          left: -12%;
          background:
            radial-gradient(
              ellipse at 45% 50%,
              rgba(169, 107, 66, 0.25) 0%,
              rgba(169, 107, 66, 0.12) 25%,
              transparent 68%
            );
          transform: rotate(-12deg);
          animation: sentinel-fluid-a 22s ease-in-out infinite alternate;
        }

        .sentinel-fluid-b {
          top: 12%;
          right: -18%;
          background:
            radial-gradient(
              ellipse at 45% 50%,
              rgba(110, 53, 68, 0.28) 0%,
              rgba(110, 53, 68, 0.12) 28%,
              transparent 70%
            );
          transform: rotate(14deg);
          animation: sentinel-fluid-b 28s ease-in-out infinite alternate;
        }

        .sentinel-fluid-c {
          bottom: -28%;
          left: 20%;
          background:
            radial-gradient(
              ellipse at 50% 40%,
              rgba(73, 52, 46, 0.22) 0%,
              rgba(73, 52, 46, 0.08) 30%,
              transparent 70%
            );
          transform: rotate(-8deg);
          animation: sentinel-fluid-c 32s ease-in-out infinite alternate;
        }

        @keyframes sentinel-fluid-a {
          from {
            transform: translate3d(-3%, -2%, 0) rotate(-12deg) scale(1);
          }
          to {
            transform: translate3d(9%, 7%, 0) rotate(-7deg) scale(1.08);
          }
        }

        @keyframes sentinel-fluid-b {
          from {
            transform: translate3d(4%, -3%, 0) rotate(14deg) scale(1);
          }
          to {
            transform: translate3d(-8%, 8%, 0) rotate(20deg) scale(1.1);
          }
        }

        @keyframes sentinel-fluid-c {
          from {
            transform: translate3d(-4%, 2%, 0) rotate(-8deg) scale(1);
          }
          to {
            transform: translate3d(7%, -5%, 0) rotate(-3deg) scale(1.07);
          }
        }

        .sentinel-atmosphere-vignette {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              ellipse at center,
              transparent 35%,
              rgba(5, 5, 5, 0.28) 78%,
              rgba(5, 5, 5, 0.58) 100%
            );
        }
      `}</style>
    </div>
  );
}

export const SentinelAtmosphere = DigitalWater;
export default DigitalWater;
