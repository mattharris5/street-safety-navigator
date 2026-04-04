'use client';

import { motion } from 'framer-motion';
import { lngLatToSVG, distanceMeters, SVG_SIZE } from '@/lib/intersection-geometry';
import { STATUS_COLORS, TYPE_ICONS } from '@/lib/constants';
import type { Project, Intersection } from '@/lib/types';

interface InterventionOverlayProps {
  projects: Project[];
  intersection: Intersection;
  selectedId?: string | null;
  onSelect: (project: Project) => void;
}

const NEARBY_RADIUS_M = 60;

export default function InterventionOverlay({
  projects,
  intersection,
  selectedId,
  onSelect,
}: InterventionOverlayProps) {
  const nearby = projects.filter(
    (p) => distanceMeters(p.lng, p.lat, intersection.lng, intersection.lat) <= NEARBY_RADIUS_M
  );

  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    >
      {nearby.map((project, i) => {
        const [x, y] = lngLatToSVG(
          project.lng,
          project.lat,
          intersection.lng,
          intersection.lat
        );
        const color = STATUS_COLORS[project.status];
        const icon = TYPE_ICONS[project.type];
        const isSelected = project.id === selectedId;

        return (
          <g
            key={project.id}
            style={{ pointerEvents: 'all', cursor: 'pointer' }}
            onClick={() => onSelect(project)}
            role="button"
            aria-label={project.name}
          >
            {/* Pulse ring */}
            {isSelected && (
              <motion.circle
                cx={x}
                cy={y}
                r={18}
                fill="none"
                stroke={color}
                strokeWidth={2}
                initial={{ r: 14, opacity: 1 }}
                animate={{ r: 22, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}

            {/* Marker circle */}
            <motion.circle
              cx={x}
              cy={y}
              r={isSelected ? 14 : 11}
              fill={color}
              fillOpacity={0.9}
              stroke="#ffffff"
              strokeWidth={2}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
              whileHover={{ scale: 1.2 }}
            />

            {/* Icon */}
            <text
              x={x}
              y={y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isSelected ? 10 : 8}
              style={{ userSelect: 'none' }}
            >
              {icon}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
