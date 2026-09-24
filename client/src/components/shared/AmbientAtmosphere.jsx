// client/src/components/shared/AmbientAtmosphere.jsx
// Subdued atmospheric continuation of the SentinelOps environment for non-Operations pages
// Dark blue atmospheric gradient, subtle moving grid lines, and drifting telemetry particles
import React, { useEffect, useRef } from 'react';

export function AmbientAtmosphere() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle drifting telemetry particles
    const particleCount = 28;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -0.15 - Math.random() * 0.2,
      size: 1 + Math.random() * 1.5,
      alpha: 0.15 + Math.random() * 0.3,
    }));

    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Render subtle drifting particles
      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.fillStyle = `rgba(197, 138, 82, ${p.alpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="sentinel-ambient-atmosphere" aria-hidden="true">
      <div className="ambient-gradient-vignette" />
      <div className="ambient-grid-overlay" />
      <canvas ref={canvasRef} className="ambient-particle-canvas" />

      <style>{`
        .sentinel-ambient-atmosphere {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .ambient-gradient-vignette {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 75% 60% at 50% 0%, rgba(45, 43, 40, 0.6) 0%, rgba(36, 35, 33, 0.95) 75%),
            linear-gradient(180deg, rgba(45, 43, 40, 0.4) 0%, #242321 100%);
        }

        .ambient-grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 80px 80px;
          opacity: 0.6;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 80%);
        }

        .ambient-particle-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
