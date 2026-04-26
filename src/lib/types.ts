export type ProjectType =
  | 'planter'
  | 'street-mural'
  | 'flex-post'
  | 'daylighting'
  | 'crosswalk'
  | 'speed-bump'
  | 'curb-extension'
  | 'signal'
  | 'other';

export type ProjectStatus = 'installed' | 'proposed' | 'idea';

export type StreetSide = 'north' | 'south' | 'center' | 'both';

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  lng: number;
  lat: number;
  side: StreetSide;
  spanMeters?: number;
  images?: string[];
  links?: { label: string; url: string }[];
  date?: string;
  tags?: string[];
}

export type IncidentSeverity = 'fatal' | 'severe' | 'moderate' | 'minor';
export type IncidentType = 'pedestrian' | 'cyclist' | 'vehicle';

export interface Incident {
  id: string;
  date: string;
  lng: number;
  lat: number;
  severity: IncidentSeverity;
  type: IncidentType;
  description?: string;
}

export interface Intersection {
  name: string;
  shortName: string;
  order: number;
  lng: number;
  lat: number;
  slug?: string;
}

export type ViewMode = 'map' | 'satellite';

export interface FilterState {
  statuses: ProjectStatus[];
  types: ProjectType[];
  showIncidents: boolean;
}
