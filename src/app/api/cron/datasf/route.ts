import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const BBOX = '37.738,-122.424,37.742,-122.406'; // lat_min,lng_min,lat_max,lng_max
const CORRIDOR_LNG_MIN = -122.424;
const CORRIDOR_LNG_MAX = -122.406;
const CORRIDOR_LAT_MIN = 37.738;
const CORRIDOR_LAT_MAX = 37.742;
const INTERSECTION_RADIUS_M = 60;

// Returns meters between two lat/lng points (Haversine, fast approximation)
function distanceM(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function fetchDataSF(dataset: string, where: string, limit = 1000) {
  const params = new URLSearchParams({
    $where: where,
    $limit: String(limit),
    $order: ':id',
  });
  const url = `https://data.sfgov.org/resource/${dataset}.json?${params}`;
  const res = await fetch(url, { headers: { 'X-App-Token': process.env.DATASF_APP_TOKEN ?? '' } });
  if (!res.ok) throw new Error(`DataSF ${dataset}: ${res.status}`);
  return res.json();
}

export async function GET(req: NextRequest) {
  // Allow Vercel cron (no auth header) or manual trigger with CRON_SECRET
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const { data: intersections } = await supabase.from('intersections').select('id,lat,lng');
  const ints = intersections ?? [];

  function nearestIntersection(lat: number, lng: number) {
    let best: { id: string } | null = null;
    let bestDist = Infinity;
    for (const i of ints) {
      const d = distanceM(lat, lng, i.lat, i.lng);
      if (d < bestDist && d <= INTERSECTION_RADIUS_M) { best = i; bestDist = d; }
    }
    return best?.id ?? null;
  }

  const errors: string[] = [];
  let crashCount = 0;
  let srCount = 0;

  // ── Vision Zero crashes (ubvf-ztfx) ────────────────────────────────────
  try {
    const bboxWhere = `latitude between '${CORRIDOR_LAT_MIN}' and '${CORRIDOR_LAT_MAX}' AND longitude between '${CORRIDOR_LNG_MIN}' and '${CORRIDOR_LNG_MAX}'`;
    const raw = await fetchDataSF('ubvf-ztfx', bboxWhere, 2000);
    const rows = raw
      .filter((r: Record<string, string>) => r.case_id_number && r.latitude && r.longitude)
      .map((r: Record<string, string>) => {
        const lat = parseFloat(r.latitude);
        const lng = parseFloat(r.longitude);
        return {
          id: `crash-${r.case_id_number}`,
          datasf_id: r.case_id_number,
          intersection_id: nearestIntersection(lat, lng),
          lat,
          lng,
          occurred_at: r.collision_datetime ?? r.date ?? null,
          severity: r.collision_severity ?? r.injury_severity ?? null,
          raw: r,
        };
      });
    if (rows.length > 0) {
      const { error } = await supabase.from('crashes').upsert(rows, { onConflict: 'datasf_id' });
      if (error) errors.push(`crashes: ${error.message}`);
      else crashCount = rows.length;
    }
  } catch (e) {
    errors.push(`crashes fetch: ${(e as Error).message}`);
  }

  // ── SF 311 requests (vw6y-z8j6) ────────────────────────────────────────
  try {
    const bboxWhere = `lat between '${CORRIDOR_LAT_MIN}' and '${CORRIDOR_LAT_MAX}' AND long between '${CORRIDOR_LNG_MIN}' and '${CORRIDOR_LNG_MAX}'`;
    const raw = await fetchDataSF('vw6y-z8j6', bboxWhere, 2000);
    const rows = raw
      .filter((r: Record<string, string>) => r.service_request_id && r.lat && r.long)
      .map((r: Record<string, string>) => {
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.long);
        return {
          id: `sr-${r.service_request_id}`,
          datasf_id: r.service_request_id,
          intersection_id: nearestIntersection(lat, lng),
          lat,
          lng,
          category: r.service_name ?? r.type ?? null,
          status: r.status_description ?? r.status ?? null,
          opened: r.requested_datetime ?? null,
          closed: r.closed_date ?? null,
          raw: r,
        };
      });
    if (rows.length > 0) {
      const { error } = await supabase.from('service_requests').upsert(rows, { onConflict: 'datasf_id' });
      if (error) errors.push(`service_requests: ${error.message}`);
      else srCount = rows.length;
    }
  } catch (e) {
    errors.push(`311 fetch: ${(e as Error).message}`);
  }

  return NextResponse.json({
    crashes: crashCount,
    service_requests: srCount,
    errors: errors.length ? errors : undefined,
  });
}
