import { readFileSync } from 'fs';
import path from 'path';
import type { Project } from './types';
import { extractIntersections } from './geo';

export async function getProjects(): Promise<Project[]> {
  if (process.env.PROJECTS_BLOB_URL) {
    const res = await fetch(process.env.PROJECTS_BLOB_URL, {
      next: { revalidate: 30 },
    });
    return res.json();
  }
  const file = path.join(process.cwd(), 'public/data/projects.json');
  return JSON.parse(readFileSync(file, 'utf-8'));
}

export function getIntersections() {
  const file = path.join(process.cwd(), 'public/data/cortland.geojson');
  const geojson = JSON.parse(readFileSync(file, 'utf-8'));
  return extractIntersections(geojson);
}
