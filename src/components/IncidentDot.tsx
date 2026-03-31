'use client';

import { Marker } from 'react-map-gl/mapbox';
import type { Incident } from '@/lib/types';

interface IncidentDotProps {
  incident: Incident;
  onClick: (incident: Incident) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  fatal: '#7f1d1d',
  severe: '#dc2626',
  moderate: '#f97316',
  minor: '#fca5a5',
};

const SEVERITY_SIZE: Record<string, number> = {
  fatal: 18,
  severe: 14,
  moderate: 11,
  minor: 8,
};

export default function IncidentDot({ incident, onClick }: IncidentDotProps) {
  const color = SEVERITY_COLORS[incident.severity] ?? '#ef4444';
  const size = SEVERITY_SIZE[incident.severity] ?? 10;

  return (
    <Marker
      longitude={incident.lng}
      latitude={incident.lat}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(incident);
      }}
    >
      <div
        className="rounded-full cursor-pointer opacity-70 hover:opacity-100 transition-opacity border border-white/50"
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
        title={`${incident.severity} incident — ${incident.date}`}
      />
    </Marker>
  );
}
