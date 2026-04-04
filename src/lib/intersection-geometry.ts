/**
 * Coordinate transforms for intersection SVG rendering.
 * Each intersection SVG is a 600×600 viewport representing 60m × 60m
 * centered on the intersection point. Scale: 10px per meter.
 */

export const SVG_SIZE = 600; // px
export const METERS_PER_PX = 0.1; // 1px = 0.1m → 10px = 1m
export const PX_PER_METER = 10; // 10px per meter
export const HALF = SVG_SIZE / 2; // 300px = center

// Earth constants
const METERS_PER_LAT = 111000;

function metersPerLng(lat: number) {
  return 111000 * Math.cos((lat * Math.PI) / 180);
}

/**
 * Convert a real-world [lng, lat] to SVG pixel coordinates [x, y]
 * given a center intersection coordinate.
 * North is up (decreasing y), east is right (increasing x).
 */
export function lngLatToSVG(
  lng: number,
  lat: number,
  centerLng: number,
  centerLat: number
): [number, number] {
  const dLng = lng - centerLng;
  const dLat = lat - centerLat;
  const dx = dLng * metersPerLng(centerLat) * PX_PER_METER;
  const dy = dLat * METERS_PER_LAT * PX_PER_METER;
  // SVG y increases downward, lat increases upward → flip dy
  return [HALF + dx, HALF - dy];
}

/**
 * Convert meter offsets (dx east, dy north) from center to SVG coordinates.
 */
export function metersToSVG(dxMeters: number, dyMeters: number): [number, number] {
  return [
    HALF + dxMeters * PX_PER_METER,
    HALF - dyMeters * PX_PER_METER, // flip y
  ];
}

/**
 * Rotate a point [x, y] around the SVG center by bearingDeg (clockwise from north).
 * Used to orient the cross street correctly.
 */
export function rotateSVGPoint(
  x: number,
  y: number,
  bearingDeg: number
): [number, number] {
  const rad = ((bearingDeg - 90) * Math.PI) / 180; // convert bearing to math angle
  const dx = x - HALF;
  const dy = y - HALF;
  const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ry = dx * Math.sin(rad) + dy * Math.cos(rad);
  return [HALF + rx, HALF + ry];
}

/**
 * Get SVG pixel offset of the intersection center from the SVG center,
 * applying a street bearing rotation.
 * For Cortland (bearing ~95°), the street goes left-to-right slightly downward.
 */
export function getCortlandTransform(cortlandBearingDeg: number): string {
  // The map is oriented with Cortland horizontal (bearing CORTLAND_BEARING = 5°)
  // So in the SVG, Cortland should run horizontally (no extra rotation needed)
  return `rotate(${cortlandBearingDeg - 90}, ${HALF}, ${HALF})`;
}

/**
 * Convert lngLat offset from intersection center to local meters (east, north).
 */
export function lngLatToLocalMeters(
  lng: number,
  lat: number,
  centerLng: number,
  centerLat: number
): [number, number] {
  const dLng = lng - centerLng;
  const dLat = lat - centerLat;
  const eastMeters = dLng * metersPerLng(centerLat);
  const northMeters = dLat * METERS_PER_LAT;
  return [eastMeters, northMeters];
}

/**
 * Distance in meters between two lngLat points.
 */
export function distanceMeters(
  lng1: number,
  lat1: number,
  lng2: number,
  lat2: number
): number {
  const [dx, dy] = lngLatToLocalMeters(lng2, lat2, lng1, lat1);
  return Math.sqrt(dx * dx + dy * dy);
}
