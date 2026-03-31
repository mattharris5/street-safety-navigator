'use client';

import { Marker } from 'react-map-gl/mapbox';
import type { Intersection } from '@/lib/types';

interface IntersectionMarkerProps {
  intersection: Intersection;
}

export default function IntersectionMarker({ intersection }: IntersectionMarkerProps) {
  return (
    <Marker
      longitude={intersection.lng}
      latitude={intersection.lat}
      anchor="center"
    >
      {/* Small labeled crosshair — sits below project markers (z-index via order) */}
      <div className="flex flex-col items-center pointer-events-none select-none" style={{ zIndex: 1 }}>
        {/* Vertical tick */}
        <div className="w-px h-4 bg-slate-400/70" />
        {/* Label */}
        <div
          className="text-[9px] font-semibold text-slate-600 bg-white/80 backdrop-blur-sm
                     px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm border border-slate-200/60"
        >
          {intersection.shortName}
        </div>
      </div>
    </Marker>
  );
}
