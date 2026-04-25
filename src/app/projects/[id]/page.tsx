import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, MapPin, Calendar, Ruler } from 'lucide-react';
import { getProjects, getIntersections } from '@/lib/data';
import { STATUS_COLORS, STATUS_LABELS, TYPE_ICONS, TYPE_LABELS } from '@/lib/constants';
import { nearestIntersectionName } from '@/lib/geo';

export const revalidate = 30;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ id: p.id }));
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [projects, intersections] = await Promise.all([getProjects(), getIntersections()]);
  const project = projects.find((p) => p.id === id);
  if (!project) notFound();

  const statusColor = STATUS_COLORS[project.status];
  const TypeIcon = TYPE_ICONS[project.type];
  const heroImage = project.images?.[0];
  const gallery = project.images ?? [];
  const intersection = nearestIntersectionName(project.lng, project.lat, intersections);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
      {/* Breadcrumb */}
      <div className="py-4 flex items-center gap-2 text-sm text-stone-400">
        <Link href="/projects" className="flex items-center gap-1 hover:text-stone-700 transition-colors">
          <ArrowLeft size={14} />
          Projects
        </Link>
        <span>/</span>
        <span className="text-stone-600 truncate">{project.name}</span>
      </div>

      {/* Hero image */}
      {heroImage && (
        <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden mb-8 border border-stone-200">
          <Image src={heroImage} alt={project.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <span
            className="absolute bottom-4 left-4 text-xs font-semibold tracking-wide uppercase
                       px-2.5 py-1 rounded-full text-white"
            style={{ backgroundColor: statusColor }}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>
      )}

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left — main content */}
        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-3 flex-wrap">
            <span className="flex items-center gap-1">
              <TypeIcon size={12} strokeWidth={2} />
              {TYPE_LABELS[project.type]}
            </span>
            {intersection && (
              <>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} strokeWidth={2} />
                  {intersection}
                </span>
              </>
            )}
            {project.date && (
              <>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={11} strokeWidth={2} />
                  {new Date(project.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </>
            )}
            {project.spanMeters && (
              <>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-1">
                  <Ruler size={11} strokeWidth={2} />
                  {project.spanMeters}m
                </span>
              </>
            )}
          </div>

          {!heroImage && (
            <span
              className="inline-block text-xs font-semibold tracking-wide uppercase
                         px-2.5 py-1 rounded-full text-white mb-3"
              style={{ backgroundColor: statusColor }}
            >
              {STATUS_LABELS[project.status]}
            </span>
          )}

          <h1
            className="text-3xl sm:text-4xl font-semibold text-stone-900 leading-tight mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {project.name}
          </h1>

          {project.description && (
            <p className="text-stone-600 leading-relaxed text-[15px] mb-8">
              {project.description}
            </p>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-8">
              {project.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-stone-100 text-stone-500 text-xs rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Photo gallery */}
          {gallery.length > 1 && (
            <div className="mb-8">
              <h2
                className="text-lg font-semibold text-stone-800 mb-3"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Photos
              </h2>
              <div className="columns-2 gap-2">
                {gallery.map((url, i) => (
                  <div key={url} className={`relative rounded-xl overflow-hidden mb-2 ${i === 0 ? 'h-48' : 'h-36'}`}>
                    <Image src={url} alt={`${project.name} photo ${i + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:w-72 flex-shrink-0 space-y-4">
          {/* Status card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${statusColor}18` }}
              >
                <TypeIcon size={20} strokeWidth={1.75} style={{ color: statusColor }} />
              </div>
              <div>
                <div
                  className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: statusColor }}
                >
                  {STATUS_LABELS[project.status]}
                </div>
                <div className="text-xs text-stone-400">{TYPE_LABELS[project.type]}</div>
              </div>
            </div>
            <div className="text-xs text-stone-400 font-mono leading-relaxed">
              {project.lat.toFixed(5)}, {project.lng.toFixed(5)}
            </div>
          </div>

          {/* Links */}
          {project.links && project.links.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                Documents & Links
              </h3>
              <div className="space-y-2">
                {project.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-sm text-green-700
                               hover:text-green-800 py-1 group/link"
                  >
                    <span className="truncate">{link.label}</span>
                    <ExternalLink size={12} className="flex-shrink-0 opacity-50 group-hover/link:opacity-100" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* View on map */}
          <Link
            href={`/?project=${project.id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                       border border-green-200 text-green-700 text-sm font-medium
                       hover:bg-green-50 transition-colors"
          >
            <MapPin size={14} />
            View on map
          </Link>

          {/* Audit placeholder */}
          <p className="text-[11px] text-stone-300 text-center">
            Attribution available after sign-in is enabled.
          </p>
        </div>
      </div>
    </div>
  );
}
