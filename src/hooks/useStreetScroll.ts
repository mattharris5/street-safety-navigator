'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseStreetScrollOptions {
  initialProgress?: number;
  sensitivity?: number;
  onProgressChange?: (progress: number) => void;
}

/**
 * Converts wheel and touch events into a horizontal scroll progress value (0–1)
 * along Cortland Ave. Progress 0 = west end (Bayshore), 1 = east end (Mission).
 */
export function useStreetScroll({
  initialProgress = 0.5,
  sensitivity = 0.0008,
  onProgressChange,
}: UseStreetScrollOptions = {}) {
  const [progress, setProgress] = useState(initialProgress);
  const progressRef = useRef(initialProgress);
  const touchStartXRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

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

  useEffect(() => {
    const container = document.getElementById('street-explorer');
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Use deltaX for horizontal scroll, fall back to deltaY (for vertical-only mice)
      const delta = (e.deltaX !== 0 ? e.deltaX : e.deltaY) * sensitivity;
      updateProgress(delta);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartXRef.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartXRef.current === null) return;
      const dx = touchStartXRef.current - e.touches[0].clientX;
      touchStartXRef.current = e.touches[0].clientX;
      updateProgress(dx * sensitivity * 0.5);
    };

    const handleTouchEnd = () => {
      touchStartXRef.current = null;
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
    };
  }, [updateProgress, sensitivity]);

  return { progress, setProgress };
}
