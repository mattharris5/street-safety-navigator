import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractIntersections } from '../lib/geo';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
);

const geojson = JSON.parse(readFileSync(join(process.cwd(), 'public/data/cortland.geojson'), 'utf-8'));
const intersections = extractIntersections(geojson);

const rows = intersections.map((int, i) => ({
  id: `int-${int.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
  slug: int.shortName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  name: int.name,
  short_name: int.shortName,
  sort_order: i,
  lng: int.lng,
  lat: int.lat,
  description: null,
  striping_image_url: null,
}));

const { error } = await supabase.from('intersections').upsert(rows, { onConflict: 'id' });
if (error) { console.error('Seed failed:', error.message); process.exit(1); }
console.log(`Seeded ${rows.length} intersections:`, rows.map(r => r.slug).join(', '));
