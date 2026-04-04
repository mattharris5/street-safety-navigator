'use client';

import { useState } from 'react';
import GeometryDrawer from './GeometryDrawer';
import type { GeoJSONGeometry, Intersection } from '@/lib/types';

interface IntersectionEditorProps {
  intersections: Intersection[];
  initialIntersectionIndex?: number;
  onGeometryComplete: (geometry: GeoJSONGeometry, intersectionIndex: number) => void;
  onClose: () => void;
}

export default function IntersectionEditor({
  intersections,
  initialIntersectionIndex = 0,
  onGeometryComplete,
  onClose,
}: IntersectionEditorProps) {
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(0, Math.min(initialIntersectionIndex, intersections.length - 1))
  );

  const currentIntersection = intersections[selectedIndex];
  if (!currentIntersection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">Draw on Map</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Intersection selector */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1">Intersection</label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value))}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {intersections.map((int, i) => (
              <option key={int.name} value={i}>{int.name}</option>
            ))}
          </select>
        </div>

        <GeometryDrawer
          key={currentIntersection.name}
          intersection={currentIntersection}
          onComplete={(geometry) => {
            onGeometryComplete(geometry, selectedIndex);
            onClose();
          }}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
