import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { getProjects, getIntersections } from '@/lib/data';
import { nearestIntersection } from '@/lib/geo';
import type { ProjectStatus } from '@/lib/types';

async function getData() {
  const [{ data: intRows }, projects, intersections] = await Promise.all([
    getSupabase().from('intersections').select('*').order('sort_order'),
    getProjects(),
    getIntersections(),
  ]);

  // Build slug → Project[] map
  const projectsBySlug: Record<string, { status: ProjectStatus }[]> = {};
  for (const p of projects) {
    const int = nearestIntersection(p.lng, p.lat, intersections, 150);
    if (int?.slug) {
      if (!projectsBySlug[int.slug]) projectsBySlug[int.slug] = [];
      projectsBySlug[int.slug].push({ status: p.status });
    }
  }

  return { intersections: intRows ?? [], projectsBySlug };
}

const STATUS_DOT: Record<ProjectStatus, string> = {
  installed: 'bg-green-500',
  proposed: 'bg-amber-400',
  idea: 'bg-blue-400',
};

export default async function IntersectionsPage() {
  const { intersections, projectsBySlug } = await getData();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900 mb-2">
          Cortland Ave Intersections
        </h1>
        <p className="text-stone-500 max-w-xl">
          Every cross-street on the corridor — crash history, 311 reports, and proposed safety improvements.
        </p>
      </div>

      <div className="grid gap-3">
        {intersections.map((int) => {
          const projects = projectsBySlug[int.slug] ?? [];
          return (
            <Link
              key={int.id}
              href={`/intersections/${int.slug}`}
              className="flex items-center gap-4 bg-white border border-stone-200 rounded-xl p-4
                         hover:border-green-300 hover:shadow-[var(--shadow-card)] transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0
                              group-hover:bg-green-100 transition-colors">
                <MapPin size={18} className="text-green-800" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-800">{int.name}</p>
                {int.description && (
                  <p className="text-sm text-stone-500 truncate mt-0.5">{int.description}</p>
                )}
              </div>
              {projects.length > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {projects.map((p, i) => (
                    <span
                      key={i}
                      className={`w-2 h-2 rounded-full ${STATUS_DOT[p.status]}`}
                      title={p.status}
                    />
                  ))}
                </div>
              )}
              <span className="text-stone-400 text-sm group-hover:text-green-700 transition-colors flex-shrink-0">→</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-5 text-xs text-stone-400">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Built</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> In progress</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Idea</span>
      </div>
    </div>
  );
}
