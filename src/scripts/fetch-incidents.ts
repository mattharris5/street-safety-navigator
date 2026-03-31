/**
 * Fetches pedestrian/cyclist incident data from SF OpenData for Cortland Ave
 * and saves it to public/data/incidents.json.
 *
 * Run with: npx tsx src/scripts/fetch-incidents.ts
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const SODA_API = 'https://data.sfgov.org/resource/ubvf-ztfx.json';
const APP_TOKEN = process.env.SF_OPENDATA_TOKEN ?? '';

// Cortland Ave bounding box
const BOUNDS = {
  minLng: -122.408,
  maxLng: -122.392,
  minLat: 37.737,
  maxLat: 37.742,
};

const FIVE_YEARS_AGO = new Date();
FIVE_YEARS_AGO.setFullYear(FIVE_YEARS_AGO.getFullYear() - 5);
const dateFilter = FIVE_YEARS_AGO.toISOString().split('T')[0];

async function fetchIncidents() {
  const params = new URLSearchParams({
    $where: [
      `collision_date >= '${dateFilter}'`,
      `latitude >= ${BOUNDS.minLat}`,
      `latitude <= ${BOUNDS.maxLat}`,
      `longitude >= ${BOUNDS.minLng}`,
      `longitude <= ${BOUNDS.maxLng}`,
    ].join(' AND '),
    $select: [
      'case_id_number',
      'collision_date',
      'latitude',
      'longitude',
      'collision_severity',
      'pedestrian_killed_count',
      'pedestrian_injured_count',
      'bicycle_killed_count',
      'bicycle_injured_count',
    ].join(','),
    $limit: '1000',
    $order: 'collision_date DESC',
  });

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (APP_TOKEN) headers['X-App-Token'] = APP_TOKEN;

  console.log('Fetching incidents from SF OpenData…');
  const res = await fetch(`${SODA_API}?${params}`, { headers });

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const raw: Record<string, string>[] = await res.json();
  console.log(`Fetched ${raw.length} raw records`);

  const incidents = raw
    .filter((r) => r.latitude && r.longitude)
    .map((r) => {
      const pedKilled = parseInt(r.pedestrian_killed_count ?? '0');
      const pedInjured = parseInt(r.pedestrian_injured_count ?? '0');
      const bikeKilled = parseInt(r.bicycle_killed_count ?? '0');
      const bikeInjured = parseInt(r.bicycle_injured_count ?? '0');

      let type: 'pedestrian' | 'cyclist' | 'vehicle' = 'vehicle';
      if (pedKilled > 0 || pedInjured > 0) type = 'pedestrian';
      else if (bikeKilled > 0 || bikeInjured > 0) type = 'cyclist';

      const severityMap: Record<string, string> = {
        'Fatal': 'fatal',
        'Severe Injury': 'severe',
        'Other Visible Injury': 'moderate',
        'Complaint of Pain': 'minor',
        'Property Damage Only': 'minor',
      };

      const severity = (severityMap[r.collision_severity] ?? 'minor') as
        'fatal' | 'severe' | 'moderate' | 'minor';

      return {
        id: r.case_id_number ?? `inc-${Math.random().toString(36).slice(2)}`,
        date: r.collision_date?.split('T')[0] ?? '',
        lng: parseFloat(r.longitude),
        lat: parseFloat(r.latitude),
        severity,
        type,
      };
    });

  console.log(`Processed ${incidents.length} incidents`);

  const outPath = join(process.cwd(), 'public', 'data', 'incidents.json');
  writeFileSync(outPath, JSON.stringify(incidents, null, 2));
  console.log(`Saved to ${outPath}`);
}

fetchIncidents().catch(console.error);
