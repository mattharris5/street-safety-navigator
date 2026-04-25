import type { LucideIcon } from 'lucide-react';
import {
  Leaf, Palette, Triangle, Eye, Footprints,
  MoveHorizontal, CornerDownRight, TrafficCone, MapPin,
} from 'lucide-react';
import type { ProjectStatus, ProjectType } from './types';

// Cortland Ave runs roughly west-to-east at bearing ~5 degrees
// (nearly east-west but tilted slightly south-of-east)
export const CORTLAND_BEARING = 5;

// Bounds of Cortland Ave — Mission St (west) to Bayshore Blvd (east)
export const CORTLAND_WEST = { lng: -122.422848, lat: 37.741030 };
export const CORTLAND_EAST = { lng: -122.406920, lat: 37.739570 };

// Center of Cortland Ave
export const CORTLAND_CENTER = {
  lng: (CORTLAND_WEST.lng + CORTLAND_EAST.lng) / 2,
  lat: (CORTLAND_WEST.lat + CORTLAND_EAST.lat) / 2,
};

export const DEFAULT_ZOOM = 18.5;
export const MIN_ZOOM = 16;
export const MAX_ZOOM = 22;

// Mapbox styles — streets-v12 shows lane markings, crosswalks, stop bars at high zoom
export const MAPBOX_STYLE_MAP = 'mapbox://styles/mapbox/streets-v12';
export const MAPBOX_STYLE_SATELLITE = 'mapbox://styles/mapbox/satellite-streets-v12';

// Perpendicular offset from Cortland centerline for side-of-street placement
// Cortland bearing ~95° → perpendicular toward north is ~5° from north
// At lat 37.74: 1° lat ≈ 111,000m, 1° lng ≈ 88,000m
// OFFSET_METERS: ~10m puts markers at the edge of the travel lane / start of parking lane
export const STREET_BEARING_DEG = 95; // actual bearing of Cortland (not map rotation)
export const OFFSET_METERS = 10;

// Project status colors
export const STATUS_COLORS: Record<ProjectStatus, string> = {
  installed: '#16a34a',   // green-600
  proposed: '#d97706',    // amber-600
  idea: '#2563eb',        // blue-600
};

export const STATUS_BG_COLORS: Record<ProjectStatus, string> = {
  installed: '#dcfce7',   // green-100
  proposed: '#fef3c7',    // amber-100
  idea: '#dbeafe',        // blue-100
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  installed: 'Installed',
  proposed: 'Proposed / In Progress',
  idea: 'Idea / Potential',
};

// Project type labels
export const TYPE_LABELS: Record<ProjectType, string> = {
  planter: 'Planter',
  'street-mural': 'Street Mural',
  'flex-post': 'Flex Post',
  daylighting: 'Daylighting Zone',
  crosswalk: 'Crosswalk',
  'speed-bump': 'Speed Cushion',
  'curb-extension': 'Curb Extension',
  signal: 'Signal Upgrade',
  other: 'Other',
};

export const TYPE_ICONS: Record<ProjectType, LucideIcon> = {
  planter: Leaf,
  'street-mural': Palette,
  'flex-post': Triangle,
  daylighting: Eye,
  crosswalk: Footprints,
  'speed-bump': MoveHorizontal,
  'curb-extension': CornerDownRight,
  signal: TrafficCone,
  other: MapPin,
};

// Branding
export const BRAND = {
  name: 'Safe Streets Bernal',
  street: 'Cortland Ave',
  neighborhood: 'Bernal Heights, SF',
  primaryColor: '#166534',    // forest green
  secondaryColor: '#d97706',  // amber
  slateColor: '#334155',      // slate
};
