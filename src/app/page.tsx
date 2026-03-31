import { readFileSync } from 'fs';
import { join } from 'path';
import StreetExplorer from '@/components/StreetExplorer';

export default function Home() {
  const cortlandGeoJSON = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'cortland.geojson'), 'utf-8')
  );

  return <StreetExplorer cortlandGeoJSON={cortlandGeoJSON} />;
}
