'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { lngLatToSVG, SVG_SIZE } from '@/lib/intersection-geometry';
import { SVGToLngLat } from '@/lib/intersection-geometry-admin';
import type { GeoJSONGeometry, Intersection } from '@/lib/types';

type DrawMode = 'point' | 'line' | 'polygon';

interface GeometryDrawerProps {
  intersection: Intersection;
  onComplete: (geometry: GeoJSONGeometry) => void;
  onCancel: () => void;
}

export default function GeometryDrawer({
  intersection,
  onComplete,
  onCancel,
}: GeometryDrawerProps) {
  const [mode, setMode] = useState<DrawMode>('point');
  const [vertices, setVertices] = useState<[number, number][]>([]); // in [lng, lat]
  const svgRef = useRef<SVGSVGElement>(null);

  const svgEventToLngLat = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): [number, number] => {
      const svg = svgRef.current!;
      const rect = svg.getBoundingClientRect();
      const scaleX = SVG_SIZE / rect.width;
      const scaleY = SVG_SIZE / rect.height;
      const svgX = (e.clientX - rect.left) * scaleX;
      const svgY = (e.clientY - rect.top) * scaleY;
      return SVGToLngLat(svgX, svgY, intersection.lng, intersection.lat);
    },
    [intersection]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (e.detail === 2) return; // handled by dblclick
      const coord = svgEventToLngLat(e);

      if (mode === 'point') {
        onComplete({ type: 'Point', coordinates: coord });
        return;
      }

      setVertices((v) => [...v, coord]);
    },
    [mode, svgEventToLngLat, onComplete]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      e.preventDefault();
      if (vertices.length < 2) return;

      if (mode === 'line') {
        onComplete({ type: 'LineString', coordinates: vertices });
      } else if (mode === 'polygon' && vertices.length >= 3) {
        onComplete({ type: 'Polygon', coordinates: [[...vertices, vertices[0]]] });
      }
    },
    [mode, vertices, onComplete]
  );

  const handleUndo = useCallback(() => {
    setVertices((v) => v.slice(0, -1));
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if (e.key === 'Escape') onCancel();
    },
    [handleUndo, onCancel]
  );

  // Convert vertices to SVG coordinates for rendering
  const svgVertices = vertices.map(([lng, lat]) =>
    lngLatToSVG(lng, lat, intersection.lng, intersection.lat)
  );

  const strokeColor =
    mode === 'polygon' ? '#2563eb' : mode === 'line' ? '#d97706' : '#16a34a';

  return (
    <div className="flex flex-col gap-3" onKeyDown={handleKeyDown} tabIndex={-1}>
      {/* Mode selector */}
      <div className="flex gap-2">
        {(['point', 'line', 'polygon'] as DrawMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setVertices([]); }}
            className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
              mode === m
                ? 'bg-green-700 text-white border-green-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
        <button
          type="button"
          onClick={handleUndo}
          disabled={vertices.length === 0}
          className="ml-auto px-3 py-1.5 text-xs rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"
        >
          Undo (⌘Z)
        </button>
      </div>

      {/* Instructions */}
      <p className="text-xs text-slate-400">
        {mode === 'point' && 'Click to place a point.'}
        {mode === 'line' && 'Click to add vertices. Double-click to finish.'}
        {mode === 'polygon' && `Click to add vertices (min 3). Double-click to close. (${vertices.length} placed)`}
      </p>

      {/* Drawing canvas */}
      <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-50" style={{ aspectRatio: '1/1' }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          className="w-full h-full cursor-crosshair"
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
        >
          {/* Grid hint */}
          <rect width={SVG_SIZE} height={SVG_SIZE} fill="#f8f8f8" />
          <line x1={SVG_SIZE / 2} y1={0} x2={SVG_SIZE / 2} y2={SVG_SIZE} stroke="#e5e7eb" strokeWidth={1} />
          <line x1={0} y1={SVG_SIZE / 2} x2={SVG_SIZE} y2={SVG_SIZE / 2} stroke="#e5e7eb" strokeWidth={1} />
          <text x={SVG_SIZE / 2 + 4} y={SVG_SIZE / 2 - 4} fontSize={10} fill="#9ca3af">Cortland</text>

          {/* Drawn path */}
          {svgVertices.length >= 2 && (
            <polyline
              points={svgVertices.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke={strokeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          )}

          {/* Polygon close line preview */}
          {mode === 'polygon' && svgVertices.length >= 3 && (
            <line
              x1={svgVertices[svgVertices.length - 1][0]}
              y1={svgVertices[svgVertices.length - 1][1]}
              x2={svgVertices[0][0]}
              y2={svgVertices[0][1]}
              stroke={strokeColor}
              strokeWidth={1.5}
              strokeDasharray="4,4"
              opacity={0.5}
            />
          )}

          {/* Vertex dots */}
          {svgVertices.map(([x, y], i) => (
            <motion.circle
              key={i}
              cx={x}
              cy={y}
              r={5}
              fill={i === 0 ? '#ffffff' : strokeColor}
              stroke={strokeColor}
              strokeWidth={2}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            />
          ))}
        </svg>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
          Cancel
        </button>
        {(mode === 'line' || mode === 'polygon') && vertices.length >= (mode === 'line' ? 2 : 3) && (
          <button
            type="button"
            onClick={() => {
              if (mode === 'line') onComplete({ type: 'LineString', coordinates: vertices });
              else onComplete({ type: 'Polygon', coordinates: [[...vertices, vertices[0]]] });
            }}
            className="px-4 py-1.5 text-xs bg-green-700 text-white rounded-lg hover:bg-green-800"
          >
            Finish Drawing
          </button>
        )}
      </div>
    </div>
  );
}
