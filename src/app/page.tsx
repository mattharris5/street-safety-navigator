import { readFileSync } from 'fs';
import { join } from 'path';
import { Suspense } from 'react';
import StreetExplorer from '@/components/StreetExplorer';
import { getIntersections } from '@/lib/data';

export default async function Home() {
  const cortlandGeoJSON = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'cortland.geojson'), 'utf-8')
  );
  const intersections = await getIntersections();

  return (
    <Suspense>
      <StreetExplorer cortlandGeoJSON={cortlandGeoJSON} intersections={intersections} />
    </Suspense>
  );
}
