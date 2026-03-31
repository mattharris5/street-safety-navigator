'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  STATUS_COLORS,
  STATUS_BG_COLORS,
  STATUS_LABELS,
  TYPE_LABELS,
  TYPE_ICONS,
} from '@/lib/constants';
import type { Project, Incident } from '@/lib/types';

type PanelItem = { type: 'project'; data: Project } | { type: 'incident'; data: Incident };

interface DetailPanelProps {
  item: PanelItem | null;
  onClose: () => void;
}

export default function DetailPanel({ item, onClose }: DetailPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={panelRef}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-2xl max-h-[55vh] overflow-y-auto"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors text-sm"
          >
            ✕
          </button>

          <div className="px-5 pb-8">
            {item.type === 'project' ? (
              <ProjectDetail project={item.data} />
            ) : (
              <IncidentDetail incident={item.data} />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ProjectDetail({ project }: { project: Project }) {
  const statusColor = STATUS_COLORS[project.status];
  const statusBg = STATUS_BG_COLORS[project.status];

  return (
    <div>
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ backgroundColor: statusBg }}
        >
          {TYPE_ICONS[project.type]}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-slate-800 leading-tight">{project.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: statusColor }}
            >
              {STATUS_LABELS[project.status]}
            </span>
            <span className="text-xs text-slate-400">{TYPE_LABELS[project.type]}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-4">{project.description}</p>

      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {project.links && project.links.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-lg hover:bg-green-100 transition-colors"
            >
              {link.label} →
            </a>
          ))}
        </div>
      )}

      {project.date && (
        <p className="text-xs text-slate-400 mt-3">
          {project.status === 'installed' ? 'Installed' : 'Added'}: {new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
        </p>
      )}
    </div>
  );
}

const SEVERITY_LABELS: Record<string, string> = {
  fatal: 'Fatal Crash',
  severe: 'Severe Injury',
  moderate: 'Moderate Injury',
  minor: 'Minor Injury',
};

const SEVERITY_COLORS_TEXT: Record<string, string> = {
  fatal: 'text-red-900 bg-red-100',
  severe: 'text-red-700 bg-red-50',
  moderate: 'text-orange-700 bg-orange-50',
  minor: 'text-orange-500 bg-orange-50',
};

function IncidentDetail({ incident }: { incident: Incident }) {
  return (
    <div>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-red-50 flex-shrink-0">
          ⚠️
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-800">Traffic Incident</h2>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
              SEVERITY_COLORS_TEXT[incident.severity] ?? 'text-slate-600 bg-slate-100'
            }`}
          >
            {SEVERITY_LABELS[incident.severity] ?? incident.severity}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p><span className="font-medium text-slate-700">Date:</span> {new Date(incident.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p><span className="font-medium text-slate-700">Involved:</span> {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}</p>
        {incident.description && <p>{incident.description}</p>}
      </div>

      <p className="text-xs text-slate-400 mt-4">
        Source: SF OpenData — Traffic Crashes Resulting in Injury
      </p>
    </div>
  );
}
