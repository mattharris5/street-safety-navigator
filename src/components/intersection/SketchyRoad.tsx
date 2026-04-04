'use client';

import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { SVG_SIZE, HALF } from '@/lib/intersection-geometry';

interface SketchyRoadProps {
  /** Cortland road width in pixels (default ~72px = ~7.2m) */
  cortlandWidth?: number;
  /** Cross street width in pixels (default ~56px = ~5.6m) */
  crossStreetWidth?: number;
  /** Bearing offset of cross street from vertical (degrees, usually ~0) */
  crossStreetAngle?: number;
}

const ROAD_FILL = '#e8e4df';
const CURB_COLOR = '#bab5ad';
const CENTER_LINE_COLOR = '#c9a84c';

export default function SketchyRoad({
  cortlandWidth = 72,
  crossStreetWidth = 56,
  crossStreetAngle = 0,
}: SketchyRoadProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Clear existing rough elements
    const existing = svg.querySelectorAll('.rough-road');
    existing.forEach((el) => el.remove());

    const rc = rough.svg(svg);
    const opts = { roughness: 1.2, bowing: 0.8, stroke: CURB_COLOR, strokeWidth: 1.5 };
    const fillOpts = { ...opts, fill: ROAD_FILL, fillStyle: 'solid', fillWeight: 0.5 };

    const hw = cortlandWidth / 2;
    const cw = crossStreetWidth / 2;
    const half = HALF;
    const size = SVG_SIZE;

    // Cortland road rectangle (horizontal, full width)
    const cortlandRect = rc.rectangle(0, half - hw, size, cortlandWidth, {
      ...fillOpts,
      stroke: 'none',
    });
    cortlandRect.classList.add('rough-road');
    svg.insertBefore(cortlandRect, svg.firstChild);

    // Cross street rectangle (vertical, full height)
    const crossRect = rc.rectangle(half - cw, 0, crossStreetWidth, size, {
      ...fillOpts,
      stroke: 'none',
    });
    crossRect.classList.add('rough-road');
    svg.insertBefore(crossRect, svg.firstChild?.nextSibling ?? null);

    // Intersection box fill (covers the junction cleanly)
    const junctionRect = rc.rectangle(half - cw, half - hw, crossStreetWidth, cortlandWidth, {
      ...fillOpts,
      stroke: 'none',
      roughness: 0.5,
    });
    junctionRect.classList.add('rough-road');
    svg.appendChild(junctionRect);

    // Cortland curb lines (top + bottom)
    const curbTop = rc.line(0, half - hw, size, half - hw, {
      ...opts,
      roughness: 1.4,
      strokeWidth: 2,
    });
    curbTop.classList.add('rough-road');
    svg.appendChild(curbTop);

    const curbBottom = rc.line(0, half + hw, size, half + hw, {
      ...opts,
      roughness: 1.4,
      strokeWidth: 2,
    });
    curbBottom.classList.add('rough-road');
    svg.appendChild(curbBottom);

    // Cross street curb lines (left + right)
    const curbLeft = rc.line(half - cw, 0, half - cw, size, {
      ...opts,
      roughness: 1.4,
      strokeWidth: 2,
    });
    curbLeft.classList.add('rough-road');
    svg.appendChild(curbLeft);

    const curbRight = rc.line(half + cw, 0, half + cw, size, {
      ...opts,
      roughness: 1.4,
      strokeWidth: 2,
    });
    curbRight.classList.add('rough-road');
    svg.appendChild(curbRight);

    // Cortland center dashed line (yellow)
    const dashCount = 12;
    const dashLen = 20;
    const gap = (size - (dashCount * dashLen)) / (dashCount - 1);
    for (let i = 0; i < dashCount; i++) {
      const x1 = i * (dashLen + gap);
      const x2 = x1 + dashLen;
      // Skip over intersection
      if (x2 > half - cw - 4 && x1 < half + cw + 4) continue;
      const dash = rc.line(x1, half, x2, half, {
        stroke: CENTER_LINE_COLOR,
        strokeWidth: 2,
        roughness: 0.8,
      });
      dash.classList.add('rough-road');
      svg.appendChild(dash);
    }
  }, [cortlandWidth, crossStreetWidth, crossStreetAngle]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
