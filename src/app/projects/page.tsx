import { getProjects, getIntersections } from '@/lib/data';
import ProjectCard from '@/components/ProjectCard';
import type { Project } from '@/lib/types';

export const revalidate = 30;

const SECTIONS: { status: Project['status']; label: string; sub: string }[] = [
  { status: 'installed', label: 'Built', sub: 'Treatments already on the ground' },
  { status: 'proposed', label: 'In Progress', sub: 'Funded, planned, or under review' },
  { status: 'idea', label: 'Community Ideas', sub: 'Proposals from residents and advocates' },
];

export default async function ProjectsPage() {
  const [projects, intersections] = await Promise.all([getProjects(), getIntersections()]);

  const byStatus = (status: Project['status']) => projects.filter((p) => p.status === status);
  const installed = byStatus('installed');
  const proposed = byStatus('proposed');
  const ideas = byStatus('idea');
  const grouped = { installed, proposed, idea: ideas };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      <div className="py-12">
        <h1
          className="text-3xl sm:text-4xl font-semibold text-stone-900 mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          All Projects
        </h1>
        <p className="text-stone-500 max-w-2xl">
          {projects.length} improvements tracked along Cortland Ave —{' '}
          {installed.length} built, {proposed.length} in progress, {ideas.length} community ideas.
        </p>
      </div>

      {SECTIONS.map(({ status, label, sub }) => {
        const items = grouped[status];
        if (items.length === 0) return null;
        return (
          <section key={status} className="mb-14">
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
  );
}
