'use client';

import Link from 'next/link';
import { Marker } from 'react-map-gl/mapbox';
import type { Intersection } from '@/lib/types';

interface IntersectionMarkerProps {
  intersection: Intersection;
}

export default function IntersectionMarker({ intersection }: IntersectionMarkerProps) {
  const label = (
    <div
      className="text-[9px] font-semibold text-slate-600 bg-white/80 backdrop-blur-sm
                 px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm border border-slate-200/60"
    >
      {intersection.shortName}
    </div>
  );

  return (
    <Marker
      longitude={intersection.lng}
      latitude={intersection.lat}
      anchor="center"
    >
      <div className="flex flex-col items-center select-none" style={{ zIndex: 1 }}>
        <div className="w-px h-4 bg-slate-400/70 pointer-events-none" />
        {intersection.slug ? (
          <Link
            href={`/intersections/${intersection.slug}`}
            className="hover:opacity-70 transition-opacity"
            prefetch={false}
          >
            {label}
          </Link>
        ) : (
          <div className="pointer-events-none">{label}</div>
        )}
      </div>
    </Marker>
  );
}
