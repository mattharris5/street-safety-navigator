'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseStreetScrollOptions {
  initialProgress?: number;
  sensitivity?: number;
  onProgressChange?: (progress: number) => void;
}

export function useStreetScroll({
  initialProgress = 0.5,
  sensitivity = 0.0008,
  onProgressChange,
}: UseStreetScrollOptions = {}) {
  const [progress, setProgress] = useState(initialProgress);
  const progressRef = useRef(initialProgress);
  const rafRef = useRef<number | null>(null);

  // Touch tracking
  const touchXRef = useRef<number | null>(null);
  const touchTimeRef = useRef<number>(0);
  // Momentum: velocity in progress-units/ms
  const velocityRef = useRef(0);
  const momentumRafRef = useRef<number | null>(null);

  const updateProgress = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(1, progressRef.current + delta));
      if (next !== progressRef.current) {
        progressRef.current = next;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
          setProgress(next);
          onProgressChange?.(next);
        });
      }
    },
    [onProgressChange]
  );

  const stopMomentum = useCallback(() => {
    if (momentumRafRef.current) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    const container = document.getElementById('street-explorer');
    if (!container) return;

    // ── Wheel ──────────────────────────────────────────────────────────────
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      stopMomentum();
      const delta = (e.deltaX !== 0 ? e.deltaX : e.deltaY) * sensitivity;
      updateProgress(delta);
    };

    // ── Touch ──────────────────────────────────────────────────────────────
    const handleTouchStart = (e: TouchEvent) => {
      stopMomentum();
      touchXRef.current = e.touches[0].clientX;
      touchTimeRef.current = performance.now();
      velocityRef.current = 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchXRef.current === null) return;
      const now = performance.now();
      const x = e.touches[0].clientX;
      const dx = touchXRef.current - x; // positive = scrolling east

      // Rolling velocity in progress-units/ms
      const dt = now - touchTimeRef.current;
      if (dt > 0 && dt < 100) {
        const instantV = (dx * sensitivity * 0.5) / dt;
        // Smooth with previous value to reduce jitter
        velocityRef.current = velocityRef.current * 0.5 + instantV * 0.5;
      }

      touchXRef.current = x;
      touchTimeRef.current = now;
      updateProgress(dx * sensitivity * 0.5);
    };

    const handleTouchEnd = () => {
      touchXRef.current = null;

      // Kick off momentum if fast enough
      const v = velocityRef.current;
      if (Math.abs(v) < 0.00005) return; // too slow, skip

      // Simulate deceleration: each frame apply v * frameMs, then decay
      const FRICTION = 0.88;
      let frameV = v * 16; // convert velocity/ms → velocity/frame at ~60fps

      const step = () => {
        frameV *= FRICTION;
        if (Math.abs(frameV) < 0.00005) return;
        updateProgress(frameV);
        momentumRafRef.current = requestAnimationFrame(step);
      };
      momentumRafRef.current = requestAnimationFrame(step);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      stopMomentum();
    };
  }, [updateProgress, sensitivity, stopMomentum]);

  return { progress, setProgress };
}
