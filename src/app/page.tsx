import { readFileSync } from 'fs';
import { join } from 'path';
import StreetExplorer from '@/components/StreetExplorer';

interface PageProps {
  searchParams: Promise<{ intersection?: string }>;
}

export default async function Home({ searchParams }: PageProps) {
  const cortlandGeoJSON = JSON.parse(
    readFileSync(join(process.cwd(), 'public', 'data', 'cortland.geojson'), 'utf-8')
  );

  const params = await searchParams;
  const initialIntersection = params.intersection;

  return (
    <StreetExplorer
      cortlandGeoJSON={cortlandGeoJSON}
      initialIntersection={initialIntersection}
    />
  );
}
