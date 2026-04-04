import type { Intersection } from '@/lib/types';

export interface CrosswalkConfig {
  leg: 'north' | 'south' | 'east' | 'west';
  style: 'ladder' | 'continental' | 'zebra';
}

export interface ParkingConfig {
  type: 'parallel' | 'angled' | 'none';
  side: 'north' | 'south';
  spaces?: number;
}

export interface StopSignConfig {
  approach: 'north' | 'south' | 'east' | 'west';
}

export interface RoadMarking {
  type: 'center-dashed' | 'stop-bar' | 'arrow-straight' | 'arrow-left' | 'arrow-right';
  leg?: 'north' | 'south' | 'east' | 'west';
}

export interface IntersectionDetail {
  /** matches intersection shortName */
  id: string;
  intersectionIndex: number;
  /** bearing of the cross street (degrees clockwise from north) */
  crossStreetBearing: number;
  /** number of travel lanes on the cross street (total both directions) */
  crossStreetLanes: number;
  crosswalks: CrosswalkConfig[];
  parkingNorth: ParkingConfig;
  parkingSouth: ParkingConfig;
  stopSigns: StopSignConfig[];
  signals: boolean;
  roadMarkings: RoadMarking[];
}

/**
 * Intersection detail data for Cortland Ave, Bernal Heights.
 * Cortland runs roughly east-west (bearing ~95°).
 * Cross streets run roughly north-south (bearing ~5°).
 */
export const INTERSECTION_DETAILS: IntersectionDetail[] = [
  {
    id: 'Bocana',
    intersectionIndex: 0,
    crossStreetBearing: 5,
    crossStreetLanes: 2,
    crosswalks: [
      { leg: 'north', style: 'ladder' },
      { leg: 'south', style: 'ladder' },
      { leg: 'east', style: 'ladder' },
      { leg: 'west', style: 'ladder' },
    ],
    parkingNorth: { type: 'parallel', side: 'north', spaces: 4 },
    parkingSouth: { type: 'parallel', side: 'south', spaces: 4 },
    stopSigns: [
      { approach: 'north' },
      { approach: 'south' },
    ],
    signals: false,
    roadMarkings: [
      { type: 'center-dashed' },
      { type: 'stop-bar', leg: 'east' },
      { type: 'stop-bar', leg: 'west' },
    ],
  },
  {
    id: 'Folsom',
    intersectionIndex: 1,
    crossStreetBearing: 5,
    crossStreetLanes: 2,
    crosswalks: [
      { leg: 'north', style: 'ladder' },
      { leg: 'south', style: 'ladder' },
      { leg: 'east', style: 'ladder' },
      { leg: 'west', style: 'ladder' },
    ],
    parkingNorth: { type: 'parallel', side: 'north', spaces: 4 },
    parkingSouth: { type: 'parallel', side: 'south', spaces: 4 },
    stopSigns: [
      { approach: 'north' },
      { approach: 'south' },
    ],
    signals: false,
    roadMarkings: [
      { type: 'center-dashed' },
      { type: 'stop-bar', leg: 'east' },
      { type: 'stop-bar', leg: 'west' },
    ],
  },
  {
    id: 'Gates',
    intersectionIndex: 2,
    crossStreetBearing: 5,
    crossStreetLanes: 2,
    crosswalks: [
      { leg: 'north', style: 'ladder' },
      { leg: 'south', style: 'ladder' },
      { leg: 'east', style: 'ladder' },
      { leg: 'west', style: 'ladder' },
    ],
    parkingNorth: { type: 'parallel', side: 'north', spaces: 3 },
    parkingSouth: { type: 'parallel', side: 'south', spaces: 3 },
    stopSigns: [
      { approach: 'north' },
      { approach: 'south' },
    ],
    signals: false,
    roadMarkings: [
      { type: 'center-dashed' },
      { type: 'stop-bar', leg: 'east' },
      { type: 'stop-bar', leg: 'west' },
    ],
  },
  {
    id: 'Andover',
    intersectionIndex: 3,
    crossStreetBearing: 5,
    crossStreetLanes: 2,
    crosswalks: [
      { leg: 'north', style: 'ladder' },
      { leg: 'south', style: 'ladder' },
      { leg: 'east', style: 'ladder' },
      { leg: 'west', style: 'ladder' },
    ],
    parkingNorth: { type: 'parallel', side: 'north', spaces: 4 },
    parkingSouth: { type: 'parallel', side: 'south', spaces: 4 },
    stopSigns: [
      { approach: 'north' },
      { approach: 'south' },
    ],
    signals: false,
    roadMarkings: [
      { type: 'center-dashed' },
      { type: 'stop-bar', leg: 'east' },
      { type: 'stop-bar', leg: 'west' },
    ],
  },
];

/**
 * Find intersection detail by matching intersection shortName or name.
 * Falls back to a default if not found.
 */
export function getIntersectionDetail(
  intersection: Intersection,
  index: number
): IntersectionDetail {
  const found = INTERSECTION_DETAILS.find(
    (d) =>
      d.id.toLowerCase() === intersection.shortName?.toLowerCase() ||
      d.id.toLowerCase() === intersection.name?.toLowerCase().split(' ')[0]
  );
  return (
    found ?? {
      id: intersection.shortName ?? intersection.name,
      intersectionIndex: index,
      crossStreetBearing: 5,
      crossStreetLanes: 2,
      crosswalks: [
        { leg: 'north', style: 'ladder' },
        { leg: 'south', style: 'ladder' },
        { leg: 'east', style: 'ladder' },
        { leg: 'west', style: 'ladder' },
      ],
      parkingNorth: { type: 'parallel', side: 'north', spaces: 4 },
      parkingSouth: { type: 'parallel', side: 'south', spaces: 4 },
      stopSigns: [{ approach: 'north' }, { approach: 'south' }],
      signals: false,
      roadMarkings: [{ type: 'center-dashed' }],
    }
  );
}
