import Link from 'next/link';
import { getProjects, getIntersections } from '@/lib/data';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/types';

export const revalidate = 30;

const SECTIONS: { status: Project['status']; label: string; sub: string }[] = [
  { status: 'installed', label: 'Built', sub: 'Treatments already on the ground' },
  { status: 'proposed', label: 'In Progress', sub: 'Funded, planned, or under review' },
  { status: 'idea', label: 'Community Ideas', sub: 'Proposals from residents and advocates' },
];

export default async function HomePage() {
  const [projects, intersections] = await Promise.all([getProjects(), getIntersections()]);

  const byStatus = (status: Project['status']) => projects.filter((p) => p.status === status);
  const installed = byStatus('installed');
  const proposed = byStatus('proposed');
  const ideas = byStatus('idea');
  const counts = { installed: installed.length, proposed: proposed.length, idea: ideas.length };
  const grouped = { installed, proposed, idea: ideas };

  const lastUpdated = projects.map((p) => p.date).filter(Boolean).sort().at(-1);

  return (
    <div className="h-full overflow-y-auto bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {/* Hero band */}
        <div className="py-12 sm:py-16 border-b border-stone-200">
          <p className="text-xs font-semibold tracking-widest uppercase text-green-700 mb-3">
            Cortland Ave · Bernal Heights, SF
          </p>
          <h1
            className="text-4xl sm:text-5xl font-semibold text-stone-900 leading-tight mb-4"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            The Cortland Corridor<br className="hidden sm:block" /> Master Plan
          </h1>
          <p className="text-stone-500 text-base max-w-2xl leading-relaxed mb-5">
            A community-driven effort to make Cortland Avenue safer for everyone who walks, bikes,
            and lives here. From painted crosswalks to traffic-calming infrastructure — every
            improvement is tracked here.
          </p>

          <Link
            href="/intersections"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-800 hover:text-green-900 mb-6"
          >
            Explore by intersection →
          </Link>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm mt-2">
            <span>
              <strong className="text-green-700">{counts.installed}</strong>
              <span className="text-stone-500 ml-1">built</span>
            </span>
            <span>
              <strong className="text-amber-600">{counts.proposed}</strong>
              <span className="text-stone-500 ml-1">in progress</span>
            </span>
            <span>
              <strong className="text-blue-600">{counts.idea}</strong>
              <span className="text-stone-500 ml-1">community ideas</span>
            </span>
            {lastUpdated && (
              <span className="text-stone-400 text-xs self-center">
                Last updated {new Date(lastUpdated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Sections */}
        {SECTIONS.map(({ status, label, sub }) => {
          const items = grouped[status];
          if (items.length === 0) return null;
          return (
            <section key={status} className="mt-12">
              <div className="flex items-baseline gap-3 mb-1">
                <h2
                  className="text-2xl font-semibold text-stone-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {label}
                </h2>
                <span className="text-stone-400 text-sm">{items.length}</span>
              </div>
              <p className="text-stone-400 text-sm mb-6">{sub}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((project) => (
                  <ProjectCard key={project.id} project={project} intersections={intersections} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
