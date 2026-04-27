import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getProjects, getIntersections } from '@/lib/data';
import { nearestIntersection } from '@/lib/geo';
import { TYPE_LABELS, STATUS_COLORS } from '@/lib/constants';
import type { ProjectType, ProjectStatus } from '@/lib/types';

export const revalidate = 30;

export default async function MasterPlanPage() {
  const [projects, intersections] = await Promise.all([getProjects(), getIntersections()]);

  // Build slug → deduplicated (type, status) chip list
  const bySlug: Record<string, { type: ProjectType; status: ProjectStatus }[]> = {};
  for (const p of projects) {
    const nearest = nearestIntersection(p.lng, p.lat, intersections, 200);
    if (nearest?.slug) {
      if (!bySlug[nearest.slug]) bySlug[nearest.slug] = [];
      bySlug[nearest.slug].push({ type: p.type, status: p.status });
    }
  }

  const totalProjects = projects.length;
  const installed = projects.filter((p) => p.status === 'installed').length;
  const proposed = projects.filter((p) => p.status === 'proposed').length;
  const ideas = projects.filter((p) => p.status === 'idea').length;

  return (
    <div className="h-full overflow-y-auto bg-stone-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        {/* Hero */}
        <div className="py-12 sm:py-16 border-b border-stone-200 mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-700 mb-3">
            Cortland Ave · Bernal Heights, SF
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The Cortland Corridor<br className="hidden sm:block" /> Master Plan
          </h1>
          <p className="text-stone-500 text-base max-w-2xl leading-relaxed mb-6">
            A community-driven effort to make Cortland Avenue safer for everyone who walks, bikes,
            and lives here. Every intersection and its planned improvements, at a glance.
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span>
              <strong className="text-stone-800">{totalProjects}</strong>
              <span className="text-stone-400 ml-1">total projects</span>
            </span>
            <span>
              <strong className="text-green-700">{installed}</strong>
              <span className="text-stone-500 ml-1">built</span>
            </span>
            <span>
              <strong className="text-amber-600">{proposed}</strong>
              <span className="text-stone-500 ml-1">in progress</span>
            </span>
            <span>
              <strong className="text-blue-600">{ideas}</strong>
              <span className="text-stone-500 ml-1">ideas</span>
            </span>
          </div>
        </div>

        {/* Intersection rows */}
        <div className="grid gap-2">
          {intersections.map((int) => {
            if (!int.slug) return null;

            const raw = bySlug[int.slug] ?? [];
            // Deduplicate by type+status
            const chips = Array.from(
              new Map(raw.map((p) => [`${p.type}-${p.status}`, p])).values()
            ).sort((a, b) => {
              // installed first, then proposed, then idea
              const order = { installed: 0, proposed: 1, idea: 2 };
              return order[a.status] - order[b.status];
            });

            return (
              <Link
                key={int.slug}
                href={`/intersections/${int.slug}`}
                className="flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-4
                           hover:border-green-300 hover:shadow-[var(--shadow-card)] transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 leading-snug">{int.name}</p>
                  {chips.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {chips.map((c, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: `${STATUS_COLORS[c.status]}18`,
                            color: STATUS_COLORS[c.status],
                            border: `1px solid ${STATUS_COLORS[c.status]}30`,
                          }}
                        >
                          {TYPE_LABELS[c.type]}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 mt-1">No projects yet</p>
                  )}
                </div>
                <ChevronRight
                  size={16}
                  className="text-stone-300 group-hover:text-green-600 flex-shrink-0 mt-0.5 transition-colors"
                />
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            {intersections.length} intersections along the corridor
          </p>
          <Link href="/projects" className="text-sm text-green-800 hover:text-green-900 font-medium">
            Browse all projects →
          </Link>
        </div>
      </div>
    </div>
  );
}
