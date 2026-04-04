'use client';

import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { SVG_SIZE, HALF } from '@/lib/intersection-geometry';
import type { RoadMarking } from '@/data/intersection-details';

interface SketchyMarkingsProps {
  markings: RoadMarking[];
  cortlandWidth?: number;
  crossStreetWidth?: number;
}

const STOP_BAR_COLOR = '#ffffff';
const STOP_BAR_INSET = 6; // px from crosswalk/curb edge

export default function SketchyMarkings({
  markings,
  cortlandWidth = 72,
  crossStreetWidth = 56,
}: SketchyMarkingsProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const existing = svg.querySelectorAll('.rough-marking');
    existing.forEach((el) => el.remove());

    const rc = rough.svg(svg);
    const hw = cortlandWidth / 2;
    const cw = crossStreetWidth / 2;
    const half = HALF;
    const CROSSWALK_DEPTH = 36;

    for (const marking of markings) {
      switch (marking.type) {
        case 'stop-bar': {
          if (marking.leg === 'east' || marking.leg === 'west') {
            // Stop bar on Cortland: vertical line spanning road width
            const x = marking.leg === 'west'
              ? half - cw - CROSSWALK_DEPTH - STOP_BAR_INSET
              : half + cw + CROSSWALK_DEPTH + STOP_BAR_INSET;
            const stopBar = rc.line(x, half - hw + 4, x, half + hw - 4, {
              stroke: STOP_BAR_COLOR,
              strokeWidth: 3,
              roughness: 0.8,
            });
            stopBar.classList.add('rough-marking');
            svg.appendChild(stopBar);
          } else if (marking.leg === 'north' || marking.leg === 'south') {
            // Stop bar on cross street: horizontal line
            const y = marking.leg === 'north'
              ? half - hw - CROSSWALK_DEPTH - STOP_BAR_INSET
              : half + hw + CROSSWALK_DEPTH + STOP_BAR_INSET;
            const stopBar = rc.line(half - cw + 4, y, half + cw - 4, y, {
              stroke: STOP_BAR_COLOR,
              strokeWidth: 3,
              roughness: 0.8,
            });
            stopBar.classList.add('rough-marking');
            svg.appendChild(stopBar);
          }
          break;
        }
        // center-dashed is handled by SketchyRoad; skip here
        case 'center-dashed':
          break;
      }
    }
  }, [markings, cortlandWidth, crossStreetWidth]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
