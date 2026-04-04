/**
 * Inverse coordinate transforms for admin geometry drawing.
 * Converts SVG pixel coordinates back to real-world [lng, lat].
 */

import { HALF, PX_PER_METER } from './intersection-geometry';

const METERS_PER_LAT = 111000;

function metersPerLng(lat: number) {
  return 111000 * Math.cos((lat * Math.PI) / 180);
}

/**
 * Convert SVG pixel [x, y] back to [lng, lat] given the intersection center.
 */
export function SVGToLngLat(
  x: number,
  y: number,
  centerLng: number,
  centerLat: number
): [number, number] {
  const dx = x - HALF; // pixels east of center
  const dy = y - HALF; // pixels south of center (SVG y increases down)

  const eastMeters = dx / PX_PER_METER;
  const northMeters = -dy / PX_PER_METER; // flip y: SVG down = south

  const lng = centerLng + eastMeters / metersPerLng(centerLat);
  const lat = centerLat + northMeters / METERS_PER_LAT;

  return [lng, lat];
}

/**
 * Compute the centroid of a geometry for auto-setting lng/lat on a project.
 */
export function geometryCentroid(
  geometry: { type: string; coordinates: unknown }
): [number, number] | null {
  if (geometry.type === 'Point') {
    return geometry.coordinates as [number, number];
  }
  if (geometry.type === 'LineString') {
    const coords = geometry.coordinates as [number, number][];
    const lng = coords.reduce((s, c) => s + c[0], 0) / coords.length;
    const lat = coords.reduce((s, c) => s + c[1], 0) / coords.length;
    return [lng, lat];
  }
  if (geometry.type === 'Polygon') {
    const ring = (geometry.coordinates as [number, number][][])[0];
    const lng = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const lat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    return [lng, lat];
  }
  return null;
}
