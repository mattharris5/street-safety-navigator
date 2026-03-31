import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Project } from '@/lib/types';

function getProjectsFromFile(): Project[] {
  try {
    const filePath = join(process.cwd(), 'public', 'data', 'projects.json');
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// In production with Vercel Blob, we'd read/write from Blob storage.
// For local dev and initial deployment, we read from the static file.
// The admin routes handle persistence via Vercel Blob when available.
let projectsCache: Project[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 10_000; // 10 seconds

function getProjects(): Project[] {
  const now = Date.now();
  if (!projectsCache || now - cacheTime > CACHE_TTL) {
    projectsCache = getProjectsFromFile();
    cacheTime = now;
  }
  return projectsCache;
}

export async function GET() {
  // Try blob storage first (set via env after first save from admin)
  const blobUrl = process.env.PROJECTS_BLOB_URL;
  if (blobUrl) {
    try {
      const res = await fetch(blobUrl, { next: { revalidate: 10 } });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {}
  }

  return NextResponse.json(getProjects());
}

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get('x-admin-token');
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const project: Project = await req.json();
    if (!project.id) project.id = `proj-${Date.now()}`;

    let projects = getProjects();
    projects = [...projects, project];

    await persistProjects(projects);
    projectsCache = projects;
    cacheTime = Date.now();

    return NextResponse.json(project, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = req.headers.get('x-admin-token');
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updated: Project = await req.json();
    let projects = getProjects();
    projects = projects.map((p) => (p.id === updated.id ? updated : p));

    await persistProjects(projects);
    projectsCache = projects;
    cacheTime = Date.now();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = req.headers.get('x-admin-token');
  if (auth !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  let projects = getProjects();
  projects = projects.filter((p) => p.id !== id);

  await persistProjects(projects);
  projectsCache = projects;
  cacheTime = Date.now();

  return NextResponse.json({ success: true });
}

async function persistProjects(projects: Project[]): Promise<void> {
  // Use Vercel Blob in production
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const blob = await put('projects.json', JSON.stringify(projects, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    // Note: In production you'd store blob.url in a persistent env var or KV
    // For now we log it so the user can set PROJECTS_BLOB_URL
    console.log('Projects saved to Blob:', blob.url);
  }
  // In dev, changes are in-memory only (file not written to avoid git noise)
}
