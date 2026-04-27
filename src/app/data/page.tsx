import { getSupabase } from '@/lib/supabase';
import { getIntersections } from '@/lib/data';
import CorridorChart from './CorridorChart';

async function getData() {
  const supabase = getSupabase();
  const [intersections, { data: crashRows }, { data: srRows }] = await Promise.all([
    getIntersections(),
    supabase.from('crashes').select('intersection_id').not('intersection_id', 'is', null),
    supabase.from('service_requests').select('intersection_id').not('intersection_id', 'is', null),
  ]);

  // Count per intersection
  const crashCounts: Record<string, number> = {};
  for (const r of crashRows ?? []) {
    crashCounts[r.intersection_id] = (crashCounts[r.intersection_id] ?? 0) + 1;
  }
  const srCounts: Record<string, number> = {};
  for (const r of srRows ?? []) {
    srCounts[r.intersection_id] = (srCounts[r.intersection_id] ?? 0) + 1;
  }

  // Intersection IDs from DB (slugs map to id via slug)
  const { data: intRows } = await supabase
    .from('intersections')
    .select('id,slug')
    .order('sort_order');

  const idBySlug = Object.fromEntries((intRows ?? []).map((r) => [r.slug, r.id]));

  const chartData = intersections.map((int) => {
    const id = int.slug ? idBySlug[int.slug] : null;
    return {
      name: int.shortName,
      slug: int.slug ?? null,
      crashes: id ? (crashCounts[id] ?? 0) : 0,
      requests: id ? (srCounts[id] ?? 0) : 0,
    };
  });

  const totalCrashes = Object.values(crashCounts).reduce((a, b) => a + b, 0);
  const totalRequests = Object.values(srCounts).reduce((a, b) => a + b, 0);

  return { chartData, totalCrashes, totalRequests };
}

export default async function DataPage() {
  const { chartData, totalCrashes, totalRequests } = await getData();

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

      <CorridorChart data={chartData} />

      <div className="mt-6 flex items-center gap-6 text-xs text-stone-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" />
          Injury crashes (above)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-blue-400 inline-block" />
          311 reports (below)
        </span>
      </div>
    </div>
  );
}
