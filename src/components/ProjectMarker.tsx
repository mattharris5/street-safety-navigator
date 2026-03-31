'use client';

import { Marker } from 'react-map-gl/mapbox';
import { STATUS_COLORS, TYPE_ICONS } from '@/lib/constants';
import type { Project } from '@/lib/types';

interface ProjectMarkerProps {
  project: Project;
  selected: boolean;
  onClick: (project: Project) => void;
}

export default function ProjectMarker({ project, selected, onClick }: ProjectMarkerProps) {
  const color = STATUS_COLORS[project.status];
  const icon = TYPE_ICONS[project.type];

  return (
    <Marker
      longitude={project.lng}
      latitude={project.lat}
      anchor="bottom"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(project);
      }}
    >
      <div
        className="relative cursor-pointer transition-transform hover:scale-110 active:scale-95"
        style={{ transform: selected ? 'scale(1.2)' : undefined }}
      >
        {/* Pin body */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white text-base"
          style={{ backgroundColor: color }}
          title={project.name}
        >
          {icon}
        </div>

        {/* Pin tail */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-0 h-0"
          style={{
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `8px solid ${color}`,
          }}
        />

        {/* Selected ring */}
        {selected && (
          <div
            className="absolute inset-0 rounded-full border-4 pointer-events-none animate-pulse"
            style={{ borderColor: color, margin: '-4px' }}
          />
        )}
      </div>
    </Marker>
  );
}
