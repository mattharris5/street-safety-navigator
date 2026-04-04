'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Intersection } from '@/lib/types';

interface UseIntersectionNavOptions {
  intersections: Intersection[];
  initialIndex?: number;
}

export function useIntersectionNav({
  intersections,
  initialIndex = 0,
}: UseIntersectionNavOptions) {
  const count = intersections.length;
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, count - 1))
  );
  const [animating, setAnimating] = useState(false);

  // For swipe/scroll accumulation
  const touchXRef = useRef<number | null>(null);
  const scrollAccRef = useRef(0);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, count - 1));
      setCurrentIndex(clamped);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
    },
    [count]
  );

  const next = useCallback(() => {
    setCurrentIndex((i) => {
      const n = Math.min(i + 1, count - 1);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
      return n;
    });
  }, [count]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => {
      const n = Math.max(i - 1, 0);
      setAnimating(true);
      setTimeout(() => setAnimating(false), 500);
      return n;
    });
  }, []);

  useEffect(() => {
    const container = document.getElementById('street-explorer');
    if (!container) return;

    // Keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prev();
      }
    };

    // Scroll wheel — accumulate delta, snap after brief pause
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaX !== 0 ? e.deltaX : e.deltaY;
      scrollAccRef.current += delta;

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

      if (Math.abs(scrollAccRef.current) > 80) {
        if (scrollAccRef.current > 0) {
          next();
        } else {
          prev();
        }
        scrollAccRef.current = 0;
      } else {
        scrollTimerRef.current = setTimeout(() => {
          scrollAccRef.current = 0;
        }, 300);
      }
    };

    // Touch swipe
    const handleTouchStart = (e: TouchEvent) => {
      touchXRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchXRef.current === null) return;
      const dx = touchXRef.current - e.changedTouches[0].clientX;
      if (Math.abs(dx) > 40) {
        if (dx > 0) next();
        else prev();
      }
      touchXRef.current = null;
    };

    window.addEventListener('keydown', handleKeyDown);
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [next, prev]);

  return {
    currentIndex,
    currentIntersection: intersections[currentIndex] ?? null,
    animating,
    goTo,
    next,
    prev,
  };
}
