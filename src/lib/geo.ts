import along from '@turf/along';
import length from '@turf/length';
import nearestPointOnLine from '@turf/nearest-point-on-line';
import { lineString, point } from '@turf/helpers';
import type { Feature, LineString, Position } from 'geojson';
import type { StreetSide } from './types';

/**
 * Offset a [lng, lat] point perpendicular to the street by a given number of meters.
 * streetBearingDeg: the bearing of the street from west to east (degrees clockwise from north).
 * side: 'north' offsets toward the north side of the street, 'south' toward south.
 * Returns adjusted [lng, lat].
 */
export function offsetForSide(
  lng: number,
  lat: number,
  side: StreetSide,
  streetBearingDeg: number,
  offsetMeters: number
): [number, number] {
  if (side === 'center' || side === 'both') return [lng, lat];

  // Perpendicular bearing: north side = streetBearing - 90, south side = streetBearing + 90
  const perpBearingDeg =
    side === 'north' ? streetBearingDeg - 90 : streetBearingDeg + 90;
  const perpRad = (perpBearingDeg * Math.PI) / 180;

  // 1° lat ≈ 111,000m; 1° lng ≈ 111,000m * cos(lat)
  const metersPerLat = 111000;
  const metersPerLng = 111000 * Math.cos((lat * Math.PI) / 180);

  const dLat = (offsetMeters * Math.cos(perpRad)) / metersPerLat;
  const dLng = (offsetMeters * Math.sin(perpRad)) / metersPerLng;

  return [lng + dLng, lat + dLat];
}

/**
 * Given a GeoJSON LineString and a progress value (0–1),
 * returns the [lng, lat] coordinate at that position along the line.
 */
export function interpolateAlongLine(
  line: Feature<LineString>,
  progress: number
): [number, number] {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalLength = length(line, { units: 'kilometers' });
  const targetDistance = totalLength * clampedProgress;
  const pt = along(line, targetDistance, { units: 'kilometers' });
  const [lng, lat] = pt.geometry.coordinates as [number, number];
  return [lng, lat];
}

/**
 * Given a GeoJSON LineString and a [lng, lat] coordinate,
 * returns the progress value (0–1) along the line closest to that coordinate.
 */
export function progressAlongLine(
  line: Feature<LineString>,
  lng: number,
  lat: number
): number {
  const pt = point([lng, lat]);
  const snapped = nearestPointOnLine(line, pt, { units: 'kilometers' });
  const location = snapped.properties?.location ?? 0;
  const totalLength = length(line, { units: 'kilometers' });
  return totalLength > 0 ? location / totalLength : 0;
}

/**
 * Returns the total length of a LineString in kilometers.
 */
export function lineLength(line: Feature<LineString>): number {
  return length(line, { units: 'kilometers' });
}

/**
 * Converts a GeoJSON FeatureCollection to a LineString feature
 * by extracting the first LineString geometry found.
 */
export function extractLineString(
  geojson: GeoJSON.FeatureCollection
): Feature<LineString> | null {
  const feature = geojson.features.find(
    (f) => f.geometry.type === 'LineString'
  );
  if (!feature) return null;
  return feature as Feature<LineString>;
}

/**
 * Extracts intersection points from a FeatureCollection,
 * sorted by their order property.
 */
export function extractIntersections(geojson: GeoJSON.FeatureCollection) {
  return geojson.features
    .filter((f) => f.properties?.type === 'intersection')
    .sort((a, b) => (a.properties?.order ?? 0) - (b.properties?.order ?? 0))
    .map((f) => ({
      name: f.properties?.name as string,
      shortName: f.properties?.shortName as string,
      order: f.properties?.order as number,
      lng: (f.geometry as GeoJSON.Point).coordinates[0],
      lat: (f.geometry as GeoJSON.Point).coordinates[1],
    }));
}
