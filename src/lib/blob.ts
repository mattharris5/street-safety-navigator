import { put, head, del } from '@vercel/blob';
import type { Project } from './types';

const BLOB_KEY = 'projects.json';

export async function getProjects(): Promise<Project[]> {
  try {
    // Try Vercel Blob first
    const blobUrl = process.env.PROJECTS_BLOB_URL;
    if (blobUrl) {
      const res = await fetch(blobUrl, { next: { revalidate: 10 } });
      if (res.ok) return res.json();
    }
  } catch {}

  // Fall back to the static public file
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/data/projects.json`, {
      next: { revalidate: 60 },
    });
    if (res.ok) return res.json();
  } catch {}

  return [];
}

export async function saveProjects(projects: Project[]): Promise<string> {
  const blob = await put(BLOB_KEY, JSON.stringify(projects, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });

  // Store the URL in env for subsequent reads (via PROJECTS_BLOB_URL)
  return blob.url;
}
