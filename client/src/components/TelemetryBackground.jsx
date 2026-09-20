// client/src/components/TelemetryBackground.jsx
// Subtle Atmospheric Security Telemetry Field
// Flowing faint contours, network traces, signal interference, subtle data points (60 FPS canvas)
import React, { useRef, useEffect } from 'react';

export function TelemetryBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId = null;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Slow drifting telemetry points
    const pointsCount = 38;
    const points = [];
    for (let i = 0; i < pointsCount; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.18,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.25 + 0.08
      });
    }

    let time = 0;

    const render = () => {
      time += 0.005;
      ctx.clearRect(0, 0, width, height);

      // 1. Faint Structural Background Grid (very faint warm charcoal lines)
      ctx.strokeStyle = 'rgba(10, 13, 18, 0.025)';
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Faint Flowing Wave Contours (Simulating telemetry signal dispersion)
      ctx.save();
      ctx.strokeStyle = 'rgba(10, 13, 18, 0.035)';
      ctx.lineWidth = 1.2;

      for (let lineIdx = 0; lineIdx < 3; lineIdx++) {
        ctx.beginPath();
        const yBase = height * (0.28 + lineIdx * 0.22);
        for (let x = 0; x <= width; x += 30) {
          const wave = Math.sin(x * 0.003 + time + lineIdx) * 28 + Math.cos(x * 0.0015 - time * 0.8) * 16;
          const y = yBase + wave;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();

      // 3. Drifting Telemetry Points & Subtle Proximity Traces
      ctx.fillStyle = '#111111';
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        // Connect nearby points with faint hairlines
        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(10, 13, 18, 0.04)';
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="telemetry-background-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="telemetry-background-canvas" />
      <style>{`
        .telemetry-background-canvas-wrap {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .telemetry-background-canvas {
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
    </div>
  );
}

export default TelemetryBackground;
