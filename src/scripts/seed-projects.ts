import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

const projects = JSON.parse(
  readFileSync(join(process.cwd(), 'public/data/projects.json'), 'utf-8'),
);

const rows = projects.map((p: Record<string, unknown>) => ({
  id: p.id,
  name: p.name,
  type: p.type,
  status: p.status,
  description: p.description ?? '',
  lng: p.lng,
  lat: p.lat,
  side: p.side ?? 'center',
  span_meters: p.spanMeters ?? null,
  images: p.images ?? [],
  links: p.links ?? [],
  date: p.date ?? null,
  tags: p.tags ?? [],
}));

const { error } = await supabase.from('projects').upsert(rows, { onConflict: 'id' });
if (error) {
  console.error('Seed failed:', error.message);
  process.exit(1);
}
console.log(`Seeded ${rows.length} projects.`);
