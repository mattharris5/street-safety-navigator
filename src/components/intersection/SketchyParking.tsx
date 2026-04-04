'use client';

import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { SVG_SIZE, HALF } from '@/lib/intersection-geometry';
import type { ParkingConfig } from '@/data/intersection-details';

interface SketchyParkingProps {
  parkingNorth: ParkingConfig;
  parkingSouth: ParkingConfig;
  cortlandWidth?: number;
  crossStreetWidth?: number;
}

const SPACE_WIDTH = 28;   // px along Cortland
const SPACE_DEPTH = 22;   // px perpendicular to Cortland (parking depth)
const PARKING_FILL = '#f0ede8';
const PARKING_STROKE = '#d4cfc9';

export default function SketchyParking({
  parkingNorth,
  parkingSouth,
  cortlandWidth = 72,
  crossStreetWidth = 56,
}: SketchyParkingProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const existing = svg.querySelectorAll('.rough-parking');
    existing.forEach((el) => el.remove());

    const rc = rough.svg(svg);
    const hw = cortlandWidth / 2;
    const cw = crossStreetWidth / 2;
    const half = HALF;
    const size = SVG_SIZE;

    const drawParkingRow = (
      sideY: number,
      spaceDir: 'north' | 'south',
      spaces: number
    ) => {
      if (spaces <= 0) return;
      const depthDir = spaceDir === 'north' ? -1 : 1;
      const y1 = spaceDir === 'north' ? sideY - SPACE_DEPTH : sideY;
      const startX = half - (spaces * SPACE_WIDTH) / 2;

      for (let i = 0; i < spaces; i++) {
        const x = startX + i * SPACE_WIDTH;
        // Skip spaces that overlap the intersection
        if (x + SPACE_WIDTH > half - cw - 4 && x < half + cw + 4) continue;

        const space = rc.rectangle(x, y1, SPACE_WIDTH, SPACE_DEPTH, {
          fill: PARKING_FILL,
          fillStyle: 'solid',
          stroke: PARKING_STROKE,
          strokeWidth: 0.8,
          roughness: 1.0,
        });
        space.classList.add('rough-parking');
        svg.appendChild(space);
      }
    };

    // North parking (above Cortland → negative y direction from north curb)
    if (parkingNorth.type === 'parallel' && (parkingNorth.spaces ?? 0) > 0) {
      drawParkingRow(half - hw, 'north', parkingNorth.spaces ?? 0);
    }

    // South parking (below Cortland → positive y direction from south curb)
    if (parkingSouth.type === 'parallel' && (parkingSouth.spaces ?? 0) > 0) {
      drawParkingRow(half + hw, 'south', parkingSouth.spaces ?? 0);
    }
  }, [parkingNorth, parkingSouth, cortlandWidth, crossStreetWidth]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
