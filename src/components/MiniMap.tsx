'use client';

import type { Intersection } from '@/lib/types';

interface MiniMapProps {
  progress: number;
  intersections: Intersection[];
}

export default function MiniMap({ progress, intersections }: MiniMapProps) {
  const WEST_LNG = -122.40603;
  const EAST_LNG = -122.39370;
  const totalSpan = WEST_LNG - EAST_LNG;

  return (
    <div className="hidden md:block bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-sm px-3 py-2 min-w-[200px]">
      <div className="text-[10px] text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Cortland Ave</div>
      <div className="relative h-2 bg-slate-100 rounded-full overflow-visible">
        {/* Street line */}
        <div className="absolute inset-y-[3px] inset-x-0 bg-slate-300 rounded-full" />

        {/* Intersection ticks */}
        {intersections.map((int) => {
          const pct = ((WEST_LNG - int.lng) / totalSpan) * 100;
          return (
            <div
              key={int.name}
              className="absolute top-0 w-px h-full bg-slate-400"
              style={{ left: `${pct}%` }}
              title={int.shortName}
            />
          );
        })}

        {/* Position indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-700 border-2 border-white shadow-md transition-[left] duration-150"
          style={{ left: `${progress * 100}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-slate-400 mt-1">
        <span>Bayshore</span>
        <span>Mission</span>
      </div>
    </div>
  );
}
