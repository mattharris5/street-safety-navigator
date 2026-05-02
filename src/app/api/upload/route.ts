import { NextRequest, NextResponse } from 'next/server';
import { getSupabase, BUCKET } from '@/lib/supabase';
import { isAdmin } from '@/lib/auth';

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic', 'image/heif'];

export async function POST(req: NextRequest) {
  try {
    const adminOk = await isAdmin(req).catch((err) => {
      console.error('isAdmin threw:', err);
      return false;
    });
    if (!adminOk) {
      const tokenPresent = !!req.headers.get('x-admin-token');
      console.error('Upload auth failed — token present:', tokenPresent);
      return NextResponse.json({ error: 'Unauthorized — please sign in again' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const projectId = formData.get('projectId') as string | null;

    console.log('Upload request — projectId:', projectId, 'file type:', file?.type, 'file size:', file?.size);

    if (!file || !projectId) {
      return NextResponse.json({ error: 'file and projectId are required' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `File type not allowed: ${file.type}` }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)} MB (max 10 MB)` }, { status: 400 });
    }

    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `projects/${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const { error } = await getSupabase().storage
      .from(BUCKET)
      .upload(path, arrayBuffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error('Supabase upload error:', error.message, error);
      return NextResponse.json({ error: `Storage error: ${error.message}` }, { status: 500 });
    }

    const { data } = getSupabase().storage.from(BUCKET).getPublicUrl(path);
    console.log('Upload succeeded:', data.publicUrl);
    return NextResponse.json({ url: data.publicUrl }, { status: 201 });
  } catch (err) {
    console.error('Upload route unhandled error:', err);
    return NextResponse.json({ error: `Server error: ${err instanceof Error ? err.message : String(err)}` }, { status: 500 });
  }
}
