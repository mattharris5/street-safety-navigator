'use client';

import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { SVG_SIZE, HALF } from '@/lib/intersection-geometry';
import type { StopSignConfig } from '@/data/intersection-details';

interface SketchySignsProps {
  stopSigns: StopSignConfig[];
  signals?: boolean;
  cortlandWidth?: number;
  crossStreetWidth?: number;
}

const STOP_RED = '#dc2626';
const STOP_WHITE = '#ffffff';
const SIGN_SIZE = 14;
const SIGN_OFFSET = 22; // distance from road edge

function drawOctagon(
  rc: ReturnType<typeof rough.svg>,
  cx: number, cy: number, r: number
) {
  const a = r / Math.SQRT2;
  const points: [number, number][] = [
    [cx - a, cy - r],
    [cx + a, cy - r],
    [cx + r, cy - a],
    [cx + r, cy + a],
    [cx + a, cy + r],
    [cx - a, cy + r],
    [cx - r, cy + a],
    [cx - r, cy - a],
  ];
  return rc.polygon(points, {
    fill: STOP_RED,
    fillStyle: 'solid',
    stroke: STOP_WHITE,
    strokeWidth: 1.5,
    roughness: 1.5,
  });
}

export default function SketchySigns({
  stopSigns,
  signals = false,
  cortlandWidth = 72,
  crossStreetWidth = 56,
}: SketchySignsProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const existing = svg.querySelectorAll('.rough-sign');
    existing.forEach((el) => el.remove());

    const rc = rough.svg(svg);
    const hw = cortlandWidth / 2;
    const cw = crossStreetWidth / 2;
    const half = HALF;

    for (const sign of stopSigns) {
      let cx: number, cy: number;
      switch (sign.approach) {
        case 'north':
          cx = half + cw + SIGN_OFFSET;
          cy = half - hw - SIGN_OFFSET;
          break;
        case 'south':
          cx = half - cw - SIGN_OFFSET;
          cy = half + hw + SIGN_OFFSET;
          break;
        case 'east':
          cx = half + cw + SIGN_OFFSET;
          cy = half + hw + SIGN_OFFSET;
          break;
        case 'west':
          cx = half - cw - SIGN_OFFSET;
          cy = half - hw - SIGN_OFFSET;
          break;
        default:
          continue;
      }

      // Sign pole
      const pole = rc.line(cx, cy + SIGN_SIZE, cx, cy + SIGN_SIZE + 16, {
        stroke: '#6b7280',
        strokeWidth: 1.5,
        roughness: 0.8,
      });
      pole.classList.add('rough-sign');
      svg.appendChild(pole);

      // Stop octagon
      const oct = drawOctagon(rc, cx, cy, SIGN_SIZE / 2);
      oct.classList.add('rough-sign');
      svg.appendChild(oct);

      // "STOP" text
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(cx));
      text.setAttribute('y', String(cy + 2));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'middle');
      text.setAttribute('font-size', '4');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('fill', STOP_WHITE);
      text.setAttribute('font-family', 'sans-serif');
      text.textContent = 'STOP';
      text.classList.add('rough-sign');
      svg.appendChild(text);
    }

    // Traffic signal indicators (simple circles)
    if (signals) {
      const positions: [number, number][] = [
        [half + cw + SIGN_OFFSET, half - hw - SIGN_OFFSET],
        [half - cw - SIGN_OFFSET, half + hw + SIGN_OFFSET],
      ];
      for (const [cx, cy] of positions) {
        const signal = rc.rectangle(cx - 5, cy - 10, 10, 20, {
          fill: '#1f2937',
          fillStyle: 'solid',
          stroke: '#374151',
          strokeWidth: 1,
          roughness: 0.8,
        });
        signal.classList.add('rough-sign');
        svg.appendChild(signal);

        // Three signal dots
        for (let i = 0; i < 3; i++) {
          const colors = ['#dc2626', '#f59e0b', '#16a34a'];
          const dot = rc.circle(cx, cy - 7 + i * 7, 5, {
            fill: i === 2 ? colors[2] : '#374151',
            fillStyle: 'solid',
            stroke: 'none',
            roughness: 0.5,
          });
          dot.classList.add('rough-sign');
          svg.appendChild(dot);
        }
      }
    }
  }, [stopSigns, signals, cortlandWidth, crossStreetWidth]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
