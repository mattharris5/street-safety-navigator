import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, type ProjectRow } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';
import type { Project, ProjectType, ProjectStatus, StreetSide } from '@/lib/types';

function toRow(p: Project): ProjectRow {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    status: p.status,
    description: p.description ?? '',
    lng: p.lng,
    lat: p.lat,
    side: p.side,
    span_meters: p.spanMeters ?? null,
    images: p.images ?? [],
    links: p.links ?? [],
    date: p.date ?? null,
    tags: p.tags ?? [],
  };
}

function fromRow(row: ProjectRow): Project {
  return {
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
  };
}

const checkAuth = (req: NextRequest) => isAdmin(req);

export async function GET() {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .order('name');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json((data as ProjectRow[]).map(fromRow));
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const project: Project = await req.json();
  if (!project.id) project.id = `proj-${Date.now()}`;
  const { error } = await getSupabase().from('projects').insert(toRow(project));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(project, { status: 201 });
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const project: Project = await req.json();
  const { error } = await getSupabase().from('projects').upsert(toRow(project));
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(project);
}

export async function DELETE(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await getSupabase().from('projects').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
