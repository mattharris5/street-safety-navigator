'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Intersection } from '@/lib/types';

interface CortlandStripProps {
  intersections: Intersection[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

// Cortland lng bounds (west to east, same as MiniMap)
const WEST_LNG = -122.40603;
const EAST_LNG = -122.39370;
const TOTAL_SPAN = WEST_LNG - EAST_LNG; // negative → positive = east

function lngToPct(lng: number): number {
  return ((WEST_LNG - lng) / TOTAL_SPAN) * 100;
}

export default function CortlandStrip({
  intersections,
  currentIndex,
  onNavigate,
  onPrev,
  onNext,
}: CortlandStripProps) {
  const currentInt = intersections[currentIndex];
  const currentPct = currentInt ? lngToPct(currentInt.lng) : 50;

  // Window spans ~20% of the strip width, centered on current intersection
  const windowWidth = 22;
  const windowLeft = Math.max(0, Math.min(100 - windowWidth, currentPct - windowWidth / 2));

  return (
    <div
      className="absolute top-14 left-0 right-0 z-20"
      style={{ background: 'linear-gradient(to bottom, #faf8f5ee, #faf8f5cc)', backdropFilter: 'blur(8px)' }}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Prev button */}
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          aria-label="Previous intersection"
        >
          ‹
        </button>

        {/* Strip */}
        <div className="relative flex-1 h-8 select-none">
          {/* Road line */}
          <div
            className="absolute top-1/2 left-0 right-0 h-[3px] -translate-y-1/2 rounded-full"
            style={{ background: '#bab5ad' }}
          />

          {/* Sliding window indicator */}
          <motion.div
            className="absolute top-0 bottom-0 rounded-md border border-amber-300/50"
            style={{ width: `${windowWidth}%` }}
            animate={{ left: `${windowLeft}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div
              className="absolute inset-0 rounded-md opacity-30"
              style={{ background: '#d97706' }}
            />
          </motion.div>

          {/* Intersection ticks + labels */}
          {intersections.map((int, i) => {
            const pct = lngToPct(int.lng);
            const isActive = i === currentIndex;
            return (
              <button
                key={int.name}
                onClick={() => onNavigate(i)}
                className="absolute -translate-x-1/2 flex flex-col items-center gap-0 group"
                style={{ left: `${pct}%`, top: 0, bottom: 0 }}
                aria-label={`Go to ${int.name}`}
                title={int.name}
              >
                {/* Tick */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 transition-all duration-200"
                  style={{
                    width: isActive ? 3 : 2,
                    height: isActive ? 16 : 10,
                    borderRadius: 2,
                    background: isActive ? '#166534' : '#9ca3af',
                  }}
                />
                {/* Label - visible on md+ or if active */}
                <div
                  className={`absolute -bottom-0.5 translate-y-full text-center whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'text-green-800 font-semibold text-[10px]'
                      : 'text-slate-400 text-[9px] hidden sm:block opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ maxWidth: 60 }}
                >
                  {int.shortName}
                </div>
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={onNext}
          disabled={currentIndex === intersections.length - 1}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm"
          aria-label="Next intersection"
        >
          ›
        </button>
      </div>

      {/* Current intersection label */}
      <div className="px-3 pb-1.5 flex items-center justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="text-[11px] font-semibold text-green-800 tracking-wide"
          >
            {currentInt?.name ?? ''}
          </motion.div>
        </AnimatePresence>
        <div className="text-[9px] text-slate-400 tabular-nums">
          {currentIndex + 1} / {intersections.length}
        </div>
      </div>
    </div>
  );
}
