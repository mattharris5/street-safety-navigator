'use client';

import { MapPin } from 'lucide-react';
import { STATUS_COLORS, STATUS_LABELS, TYPE_ICONS, TYPE_LABELS } from '@/lib/constants';
import type { Project } from '@/lib/types';

interface ProjectListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export default function ProjectList({ projects, onEdit, onDelete }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <div className="flex justify-center mb-3"><MapPin size={32} className="text-slate-300" /></div>
        <p>No projects yet. Add your first project!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const TypeIcon = TYPE_ICONS[project.type];
        return (
        <div
          key={project.id}
          className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-4 hover:border-slate-300 transition-colors"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: `${STATUS_COLORS[project.status]}20` }}
          >
            <TypeIcon size={18} strokeWidth={1.75} style={{ color: STATUS_COLORS[project.status] }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-slate-800 text-sm leading-tight">{project.name}</h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(project)}
                  className="text-xs text-slate-500 hover:text-green-700 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
                style={{ backgroundColor: STATUS_COLORS[project.status] }}
              >
                {STATUS_LABELS[project.status]}
              </span>
              <span className="text-[11px] text-slate-400">{TYPE_LABELS[project.type]}</span>
              <span className="text-[11px] text-slate-300">·</span>
              <span className="text-[11px] text-slate-400 font-mono">
                {project.lng.toFixed(5)}, {project.lat.toFixed(5)}
              </span>
            </div>
            {project.description && (
              <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{project.description}</p>
            )}
          </div>
        </div>
        );
      })}
    </div>
  );
}
