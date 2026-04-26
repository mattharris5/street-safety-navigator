import { readFileSync } from 'fs';
import path from 'path';
import type { Project } from './types';
import { extractIntersections } from './geo';
import { getSupabase, BUCKET } from './supabase';

const PROJECTS_PATH = 'data/projects.json';

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await getSupabase().storage.from(BUCKET).download(PROJECTS_PATH);
  if (!error && data) return JSON.parse(await data.text());
  const file = path.join(process.cwd(), 'public/data/projects.json');
  return JSON.parse(readFileSync(file, 'utf-8'));
}

export function getIntersections() {
  const file = path.join(process.cwd(), 'public/data/cortland.geojson');
  const geojson = JSON.parse(readFileSync(file, 'utf-8'));
  return extractIntersections(geojson);
}
