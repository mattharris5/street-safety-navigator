import { readFileSync } from 'fs';
import { join } from 'path';
import StreetExplorer from '@/components/StreetExplorer';
import { getIntersections } from '@/lib/data';

export default async function Home() {
  const cortlandGeoJSON = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'cortland.geojson'), 'utf-8')
  );
  const intersections = await getIntersections();

  return <StreetExplorer cortlandGeoJSON={cortlandGeoJSON} intersections={intersections} />;
}
