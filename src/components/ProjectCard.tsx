import Link from 'next/link';
import Image from 'next/image';
import { STATUS_COLORS, STATUS_BG_COLORS, STATUS_LABELS, TYPE_ICONS, TYPE_LABELS } from '@/lib/constants';
import { nearestIntersectionName } from '@/lib/geo';
import type { Project, Intersection } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  intersections: Intersection[];
}

export default function ProjectCard({ project, intersections }: ProjectCardProps) {
  const statusColor = STATUS_COLORS[project.status];
  const statusBg = STATUS_BG_COLORS[project.status];
  const TypeIcon = TYPE_ICONS[project.type];
  const heroImage = project.images?.[0];
  const intersection = nearestIntersectionName(project.lng, project.lat, intersections);

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden
                 hover:border-stone-300 transition-all duration-150"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      {/* Image / placeholder */}
      <div className="relative h-44 flex-shrink-0 overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={project.name}
            fill
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: statusBg }}
          >
            <TypeIcon size={36} strokeWidth={1.5} style={{ color: statusColor, opacity: 0.6 }} />
          </div>
        )}

        {/* Status badge on image */}
        <span
          className="absolute top-2.5 left-2.5 text-[10px] font-semibold tracking-wide uppercase
                     px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: statusColor }}
        >
          {STATUS_LABELS[project.status]}
        </span>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1.5">
          <TypeIcon size={11} strokeWidth={2} />
          <span>{TYPE_LABELS[project.type]}</span>
          {intersection && (
            <>
              <span className="text-stone-300">·</span>
              <span>@ {intersection}</span>
            </>
          )}
        </div>

        <h3
          className="text-[15px] font-semibold text-stone-900 leading-snug mb-1.5 group-hover:text-green-800 transition-colors line-clamp-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {project.name}
        </h3>

        {project.description && (
          <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 flex-1">
            {project.description}
          </p>
        )}

        {project.date && (
          <p className="text-[10px] text-stone-300 mt-3">
            {new Date(project.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>
    </Link>
  );
}
