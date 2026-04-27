import { readFileSync } from 'fs';
import path from 'path';
import type { Project, ProjectType, ProjectStatus, StreetSide, Intersection } from './types';
import { extractIntersections } from './geo';
import { getSupabase, type ProjectRow } from './supabase';

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await getSupabase().from('projects').select('*').order('name');
  if (error || !data) {
    const file = path.join(process.cwd(), 'public/data/projects.json');
    return JSON.parse(readFileSync(file, 'utf-8'));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map((row: ProjectRow) => ({
    id: row.id,
    name: row.name,
    type: row.type as ProjectType,
    status: row.status as ProjectStatus,
    description: row.description,
    lng: row.lng,
    lat: row.lat,
    side: row.side as StreetSide,
    ...(row.span_meters != null && { spanMeters: row.span_meters }),
    images: row.images ?? [],
    links: row.links ?? [],
    ...(row.date && { date: row.date }),
    tags: row.tags ?? [],
    ...(row.sponsor && { sponsor: row.sponsor }),
  }));
}

export async function getIntersections(): Promise<Intersection[]> {
  const { data, error } = await getSupabase()
    .from('intersections')
    .select('id,slug,name,short_name,sort_order,lng,lat')
    .order('sort_order');
  if (!error && data?.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any[]).map((row) => ({
      name: row.name as string,
      shortName: row.short_name as string,
      order: row.sort_order as number,
      lng: row.lng as number,
      lat: row.lat as number,
      slug: row.slug as string,
    }));
  }
  // Fallback to GeoJSON if DB unavailable
  const file = path.join(process.cwd(), 'public/data/cortland.geojson');
  const geojson = JSON.parse(readFileSync(file, 'utf-8'));
  return extractIntersections(geojson);
}
