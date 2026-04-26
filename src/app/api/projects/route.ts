import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getSupabase, BUCKET } from '@/lib/supabase';
import type { Project } from '@/lib/types';

const PROJECTS_PATH = 'data/projects.json';

async function loadProjects(): Promise<Project[]> {
  const { data, error } = await getSupabase().storage.from(BUCKET).download(PROJECTS_PATH);
  if (!error && data) {
    return JSON.parse(await data.text());
  }
  // Fall back to the static seed file
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'public/data/projects.json'), 'utf-8'));
  } catch {
    return [];
  }
}

async function saveProjects(projects: Project[]): Promise<void> {
  const bytes = new TextEncoder().encode(JSON.stringify(projects, null, 2));
  await getSupabase().storage.from(BUCKET).upload(PROJECTS_PATH, bytes, {
    contentType: 'application/json',
    upsert: true,
  });
}

function checkAuth(req: NextRequest) {
  return req.headers.get('x-admin-token') === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  return NextResponse.json(await loadProjects());
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const project: Project = await req.json();
  if (!project.id) project.id = `proj-${Date.now()}`;
  const projects = [...(await loadProjects()), project];
  await saveProjects(projects);
  return NextResponse.json(project, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const updated: Project = await req.json();
  const projects = (await loadProjects()).map((p) => (p.id === updated.id ? updated : p));
  await saveProjects(projects);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const projects = (await loadProjects()).filter((p) => p.id !== id);
  await saveProjects(projects);
  return NextResponse.json({ success: true });
}
