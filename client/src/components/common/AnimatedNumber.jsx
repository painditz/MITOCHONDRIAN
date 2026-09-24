// client/src/components/common/AnimatedNumber.jsx
// Soft number count-up animation from 0 to value on initial mount
// Duration: 600-850ms with easeOutCubic. Respects prefers-reduced-motion.
import React, { useState, useEffect, useRef } from 'react';

export function AnimatedNumber({ value, duration = 750 }) {
  const [current, setCurrent] = useState(0);
  const target = Number(value) || 0;
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // If user prefers reduced motion or if target is 0, display instantly
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || target === 0) {
      setCurrent(target);
      return;
    }

    // Animate only once on initial mount
    if (hasAnimatedRef.current) {
      setCurrent(target);
      return;
    }
    hasAnimatedRef.current = true;

    let start = null;
    let rafId;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic: 1 - (1 - progress)^3
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(ease * target));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return <>{current.toLocaleString()}</>;
}

export default AnimatedNumber;
