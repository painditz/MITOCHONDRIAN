// client/src/components/common/InteractionCursor.jsx
// Subtle custom interaction cursor: minimal cyan dot + soft responsive halo ring
// Enhanced with subtle magnetic attraction on buttons, navigation tabs, and workflow cards.
// Automatically respects prefers-reduced-motion and touch devices.
import React, { useEffect, useRef, useState } from 'react';

export function InteractionCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const activeMagneticEl = useRef(null);

  useEffect(() => {
    // Disable on touch devices or if user prefers reduced motion
    const isTouch = window.matchMedia('(hover: none)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let rafId;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Check if hovering interactive elements
      const target = e.target;
      const isInteractive = target && (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('textarea') ||
        target.closest('.interactive') ||
        target.closest('.queue-table-row') ||
        target.closest('.workflow-stage-card')
      );
      setIsHovered(!!isInteractive);

      // Subtle Magnetic Hover (Max 3-4px pull) on buttons, tabs, cards
      const magneticTarget = target && (
        target.closest('button') ||
        target.closest('.queue-filter-tab') ||
        target.closest('.workflow-stage-card') ||
        target.closest('.nav-item-btn') ||
        target.closest('.open-raw-alerts-btn')
      );

      if (magneticTarget) {
        if (activeMagneticEl.current && activeMagneticEl.current !== magneticTarget) {
          activeMagneticEl.current.style.transform = 'translate3d(0, 0, 0)';
        }
        activeMagneticEl.current = magneticTarget;
        const rect = magneticTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (mouseX - centerX) * 0.12;
        const dy = (mouseY - centerY) * 0.12;
        const clampedX = Math.max(-3.5, Math.min(3.5, dx));
        const clampedY = Math.max(-3.5, Math.min(3.5, dy));

        magneticTarget.style.transition = 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)';
        magneticTarget.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`;
      } else if (activeMagneticEl.current) {
        activeMagneticEl.current.style.transition = 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)';
        activeMagneticEl.current.style.transform = 'translate3d(0, 0, 0)';
        activeMagneticEl.current = null;
      }
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => {
      setIsVisible(false);
      if (activeMagneticEl.current) {
        activeMagneticEl.current.style.transform = 'translate3d(0, 0, 0)';
        activeMagneticEl.current = null;
      }
    };
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    const render = () => {
      // Direct position for inner dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Smooth lerp for outer halo ring
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        const scale = isClicked ? 0.85 : isHovered ? 1.55 : 1.0;
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${scale})`;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (activeMagneticEl.current) {
        activeMagneticEl.current.style.transform = 'translate3d(0, 0, 0)';
      }
      cancelAnimationFrame(rafId);
    };
  }, [isVisible, isHovered, isClicked]);

  return (
    <div
      className={`sentinel-cursor-stage ${isVisible ? 'visible' : ''}`}
      aria-hidden="true"
    >
      <div ref={dotRef} className="cursor-dot" />
      <div
        ref={ringRef}
        className={`cursor-ring ${isHovered ? 'hovered' : ''} ${isClicked ? 'clicked' : ''}`}
      />

      <style>{`
        .sentinel-cursor-stage {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 9999;
          opacity: 0;
          transition: opacity 200ms ease;
        }

        .sentinel-cursor-stage.visible {
          opacity: 1;
        }

        .cursor-dot {
          position: absolute;
          top: -2px;
          left: -2px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #35CFFF;
          box-shadow: 0 0 6px rgba(53, 207, 255, 0.8);
          will-change: transform;
        }

        .cursor-ring {
          position: absolute;
          top: -12px;
          left: -12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid rgba(53, 207, 255, 0.45);
          background: rgba(53, 207, 255, 0.04);
          will-change: transform;
          transition: border-color 160ms ease, background-color 160ms ease;
        }

        .cursor-ring.hovered {
          border-color: rgba(53, 207, 255, 0.85);
          background: rgba(53, 207, 255, 0.12);
          box-shadow: 0 0 14px rgba(53, 207, 255, 0.25);
        }

        .cursor-ring.clicked {
          border-color: #21D4FF;
          background: rgba(33, 212, 255, 0.25);
        }

        @media (hover: none) or (prefers-reduced-motion: reduce) {
          .sentinel-cursor-stage {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default InteractionCursor;
