import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { extractLineString, progressAlongLine } from '../lib/geo';

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const geojson = JSON.parse(readFileSync(join(process.cwd(), 'public/data/cortland.geojson'), 'utf-8'));
  const cortlandLine = extractLineString(geojson);
  if (!cortlandLine) { console.error('No line found in GeoJSON'); process.exit(1); }

  const { data: rows, error } = await supabase.from('intersections').select('id,slug,name,lng,lat');
  if (error || !rows) { console.error('Fetch failed:', error?.message); process.exit(1); }

  const withProgress = rows.map((r) => ({
    ...r,
    progress: progressAlongLine(cortlandLine!, r.lng, r.lat),
  })).sort((a, b) => a.progress - b.progress);

  console.log('Sorted order (west → east along street):');
  withProgress.forEach((r, i) => console.log(`  ${String(i).padStart(2)}. ${r.slug.padEnd(15)} progress=${r.progress.toFixed(4)}`));

  for (let i = 0; i < withProgress.length; i++) {
    const { error: updateError } = await supabase
      .from('intersections')
      .update({ sort_order: i })
      .eq('id', withProgress[i].id);
    if (updateError) { console.error(`Update failed for ${withProgress[i].slug}:`, updateError.message); }
  }
  console.log(`\nUpdated sort_order for ${rows.length} intersections.`);
}

main().catch(console.error);
