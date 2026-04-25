'use client';

import { Marker } from 'react-map-gl/mapbox';
import { STATUS_COLORS, TYPE_ICONS, STREET_BEARING_DEG, OFFSET_METERS } from '@/lib/constants';
import { offsetForSide } from '@/lib/geo';
import type { Project } from '@/lib/types';

interface ProjectMarkerProps {
  project: Project;
  selected: boolean;
  onClick: (project: Project) => void;
  editMode?: boolean;
  onDragEnd?: (project: Project, lng: number, lat: number) => void;
}

export default function ProjectMarker({ project, selected, onClick, editMode = false, onDragEnd }: ProjectMarkerProps) {
  const color = STATUS_COLORS[project.status];
  const Icon = TYPE_ICONS[project.type];

  // Offset marker to correct side of street
  const [markerLng, markerLat] = offsetForSide(
    project.lng,
    project.lat,
    project.side,
    STREET_BEARING_DEG,
    OFFSET_METERS
  );

  return (
    <Marker
      longitude={markerLng}
      latitude={markerLat}
      anchor="center"
      draggable={editMode}
      onDragEnd={editMode && onDragEnd ? (e) => onDragEnd(project, e.lngLat.lng, e.lngLat.lat) : undefined}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick(project);
      }}
    >
      <div
        className="relative group"
        style={{
          cursor: editMode ? 'move' : 'pointer',
          transform: selected ? 'scale(1.25)' : undefined,
          transition: 'transform 0.15s ease',
        }}
      >
        {/* Edit mode drag handle ring */}
        {editMode && (
          <div
            className="absolute rounded-full pointer-events-none"
            style={{ inset: -5, border: '2px dashed rgba(255,255,255,0.85)', borderRadius: '50%' }}
          />
        )}

        {/* Flat circular marker — sits on the map surface like a painted mark */}
        <div
          className="flex items-center justify-center rounded-full border-2 border-white shadow-md text-sm"
          style={{
            width: selected ? 38 : 32,
            height: selected ? 38 : 32,
            backgroundColor: color,
            boxShadow: selected
              ? `0 0 0 3px ${color}55, 0 2px 8px rgba(0,0,0,0.35)`
              : '0 1px 4px rgba(0,0,0,0.3)',
            transition: 'width 0.15s ease, height 0.15s ease, box-shadow 0.15s ease',
          }}
          title={project.name}
        >
          <Icon size={selected ? 15 : 12} strokeWidth={2} />
        </div>

        {/* Pulse ring when selected */}
        {selected && (
          <div
            className="absolute inset-0 rounded-full pointer-events-none animate-ping"
            style={{ backgroundColor: color, opacity: 0.25 }}
          />
        )}

        {/* Hover label */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap
                     bg-slate-900/90 text-white text-[10px] font-medium px-2 py-0.5 rounded
                     opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none
                     shadow-lg max-w-[160px] truncate"
        >
          {project.name}
        </div>
      </div>
    </Marker>
  );
}
