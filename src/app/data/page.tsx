import { getSupabase } from '@/lib/supabase';
import { getIntersections } from '@/lib/data';
import CorridorChart from './CorridorChart';
import CrashTrendChart, { type YearPoint, type MajorIncident } from './CrashTrendChart';

const ENDPOINT_IDS = new Set(['int-mission', 'int-bayshore']);

type TrendRow = { occurred_at: string; severity: string; raw: Record<string, string> | null; datasf_id: string; intersection_id: string | null };

function buildTrend(rows: TrendRow[]): { trendData: YearPoint[]; majorIncidents: MajorIncident[] } {
  const yearMap: Record<number, { total: number; fatal: number; severe: number }> = {};
  for (const r of rows) {
    const year = new Date(r.occurred_at).getFullYear();
    if (!yearMap[year]) yearMap[year] = { total: 0, fatal: 0, severe: 0 };
    yearMap[year].total++;
    if (r.severity === 'Fatal') yearMap[year].fatal++;
    else if (r.severity === 'Severe Injury') yearMap[year].severe++;
  }

  const years = Object.keys(yearMap).map(Number).sort();
  const trendData: YearPoint[] = [];
  if (years.length > 0) {
    for (let y = years[0]; y <= years[years.length - 1]; y++) {
      const d = yearMap[y] ?? { total: 0, fatal: 0, severe: 0 };
      trendData.push({ year: y, total: d.total, fatal: d.fatal, severe: d.severe, other: d.total - d.fatal - d.severe, avg3yr: 0 });
    }
    trendData.forEach((d, i) => {
      const window = trendData.slice(Math.max(0, i - 1), Math.min(trendData.length, i + 2));
      d.avg3yr = window.reduce((s, w) => s + w.total, 0) / window.length;
    });
  }

  const majorIncidents: MajorIncident[] = rows
    .filter((r) => r.severity === 'Fatal' || r.severity === 'Severe Injury')
    .map((r) => {
      const raw = (r.raw ?? {}) as Record<string, string>;
      return {
        datasf_id: r.datasf_id,
        occurred_at: r.occurred_at,
        severity: r.severity,
        killed: parseInt(raw.number_killed ?? '0', 10),
        injured: parseInt(raw.number_injured ?? '0', 10),
        type: raw.type_of_collision ?? null,
        primaryRd: raw.primary_rd ?? null,
        crossRd: raw.secondary_rd ?? null,
      };
    })
    .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime());

  return { trendData, majorIncidents };
}

async function getData() {
  const supabase = getSupabase();
  const [intersections, { data: crashRows }, { data: srRows }, { data: rawTrendRows }] = await Promise.all([
    getIntersections(),
    supabase.from('crashes').select('intersection_id').not('intersection_id', 'is', null),
    supabase.from('service_requests').select('intersection_id').not('intersection_id', 'is', null),
    supabase.from('crashes')
      .select('occurred_at, severity, raw, datasf_id, intersection_id')
      .not('occurred_at', 'is', null)
      .order('occurred_at'),
  ]);

  // Per-intersection counts for the corridor chart
  const crashCounts: Record<string, number> = {};
  for (const r of crashRows ?? []) crashCounts[r.intersection_id] = (crashCounts[r.intersection_id] ?? 0) + 1;
  const srCounts: Record<string, number> = {};
  for (const r of srRows ?? []) srCounts[r.intersection_id] = (srCounts[r.intersection_id] ?? 0) + 1;

  const { data: intRows } = await supabase.from('intersections').select('id,slug').order('sort_order');
  const idBySlug = Object.fromEntries((intRows ?? []).map((r) => [r.slug, r.id]));

  const chartData = intersections.map((int) => {
    const id = int.slug ? idBySlug[int.slug] : null;
    return { name: int.shortName, slug: int.slug ?? null, crashes: id ? (crashCounts[id] ?? 0) : 0, requests: id ? (srCounts[id] ?? 0) : 0 };
  });

  const totalCrashes = Object.values(crashCounts).reduce((a, b) => a + b, 0);
  const totalRequests = Object.values(srCounts).reduce((a, b) => a + b, 0);

  const trendRows = (rawTrendRows ?? []) as TrendRow[];
  const coreRows = trendRows.filter((r) => !r.intersection_id || !ENDPOINT_IDS.has(r.intersection_id));

  const { trendData, majorIncidents } = buildTrend(trendRows);
  const { trendData: trendDataCore, majorIncidents: majorIncidentsCore } = buildTrend(coreRows);

  return { chartData, totalCrashes, totalRequests, trendData, majorIncidents, trendDataCore, majorIncidentsCore };
}

export default async function DataPage() {
  const { chartData, totalCrashes, totalRequests, trendData, majorIncidents, trendDataCore, majorIncidentsCore } = await getData();

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900 mb-2">
          Corridor Data
        </h1>
        <p className="text-stone-500 max-w-xl">
          Injury crashes and 311 reports at each intersection along Cortland Ave, sourced from DataSF.
        </p>
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <p className="text-2xl font-semibold text-red-600">{totalCrashes}</p>
            <p className="text-xs text-stone-400 mt-0.5">Injury crashes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-blue-600">{totalRequests}</p>
            <p className="text-xs text-stone-400 mt-0.5">311 reports</p>
          </div>
        </div>
      </div>

      {trendData.length > 0 && (
        <div className="mb-10">
          <CrashTrendChart
            trendData={trendData}
            majorIncidents={majorIncidents}
            trendDataCore={trendDataCore}
            majorIncidentsCore={majorIncidentsCore}
          />
        </div>
      )}

      <CorridorChart data={chartData} />
    </div>
  );
}
