'use client';

import { useEffect, useRef } from 'react';
import rough from 'roughjs';
import { SVG_SIZE, HALF } from '@/lib/intersection-geometry';
import type { CrosswalkConfig } from '@/data/intersection-details';

interface SketchyCrosswalkProps {
  crosswalks: CrosswalkConfig[];
  cortlandWidth?: number;
  crossStreetWidth?: number;
}

const CROSSWALK_FILL = '#f5f3f0';
const CROSSWALK_STROKE = '#ccc9c4';
const STRIPE_WIDTH = 8;
const STRIPE_GAP = 6;
const CROSSWALK_DEPTH = 36; // px from curb edge

export default function SketchyCrosswalk({
  crosswalks,
  cortlandWidth = 72,
  crossStreetWidth = 56,
}: SketchyCrosswalkProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const existing = svg.querySelectorAll('.rough-crosswalk');
    existing.forEach((el) => el.remove());

    const rc = rough.svg(svg);
    const hw = cortlandWidth / 2; // half cortland width
    const cw = crossStreetWidth / 2; // half cross street width
    const half = HALF;
    const size = SVG_SIZE;

    const drawLadder = (
      x1: number, y1: number,
      x2: number, y2: number,
      stripeDir: 'h' | 'v'
    ) => {
      // Background fill
      const bg = rc.rectangle(x1, y1, x2 - x1, y2 - y1, {
        fill: CROSSWALK_FILL,
        fillStyle: 'solid',
        stroke: 'none',
        roughness: 0.6,
      });
      bg.classList.add('rough-crosswalk');
      svg.appendChild(bg);

      // Ladder stripes
      if (stripeDir === 'h') {
        // Horizontal stripes (for north/south crosswalks)
        const total = y2 - y1;
        const stripeCount = Math.floor(total / (STRIPE_WIDTH + STRIPE_GAP));
        for (let i = 0; i < stripeCount; i++) {
          const sy = y1 + i * (STRIPE_WIDTH + STRIPE_GAP);
          const stripe = rc.rectangle(x1, sy, x2 - x1, STRIPE_WIDTH, {
            fill: '#ffffff',
            fillStyle: 'solid',
            stroke: CROSSWALK_STROKE,
            strokeWidth: 0.5,
            roughness: 0.8,
          });
          stripe.classList.add('rough-crosswalk');
          svg.appendChild(stripe);
        }
      } else {
        // Vertical stripes (for east/west crosswalks)
        const total = x2 - x1;
        const stripeCount = Math.floor(total / (STRIPE_WIDTH + STRIPE_GAP));
        for (let i = 0; i < stripeCount; i++) {
          const sx = x1 + i * (STRIPE_WIDTH + STRIPE_GAP);
          const stripe = rc.rectangle(sx, y1, STRIPE_WIDTH, y2 - y1, {
            fill: '#ffffff',
            fillStyle: 'solid',
            stroke: CROSSWALK_STROKE,
            strokeWidth: 0.5,
            roughness: 0.8,
          });
          stripe.classList.add('rough-crosswalk');
          svg.appendChild(stripe);
        }
      }
    };

    for (const cw_config of crosswalks) {
      switch (cw_config.leg) {
        case 'north':
          // North crosswalk: above the intersection, spans cortland width
          drawLadder(
            half - cw, half - hw - CROSSWALK_DEPTH,
            half + cw, half - hw,
            'h'
          );
          break;
        case 'south':
          // South crosswalk: below the intersection
          drawLadder(
            half - cw, half + hw,
            half + cw, half + hw + CROSSWALK_DEPTH,
            'h'
          );
          break;
        case 'west':
          // West crosswalk: left of intersection, spans cross street width
          drawLadder(
            half - cw - CROSSWALK_DEPTH, half - hw,
            half - cw, half + hw,
            'v'
          );
          break;
        case 'east':
          // East crosswalk: right of intersection
          drawLadder(
            half + cw, half - hw,
            half + cw + CROSSWALK_DEPTH, half + hw,
            'v'
          );
          break;
      }
    }
  }, [crosswalks, cortlandWidth, crossStreetWidth]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  );
}
