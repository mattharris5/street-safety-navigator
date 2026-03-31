'use client';

import { STATUS_COLORS, STATUS_LABELS } from '@/lib/constants';
import type { FilterState, ProjectStatus } from '@/lib/types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

const STATUSES: ProjectStatus[] = ['installed', 'proposed', 'idea'];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggleStatus = (status: ProjectStatus) => {
    const statuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses });
  };

  return (
    <div className="flex items-center gap-2">
      {STATUSES.map((status) => {
        const active = filters.statuses.includes(status);
        return (
          <button
            key={status}
            onClick={() => toggleStatus(status)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              active
                ? 'text-white border-transparent shadow-sm'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
            style={active ? { backgroundColor: STATUS_COLORS[status], borderColor: STATUS_COLORS[status] } : {}}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: active ? 'rgba(255,255,255,0.7)' : STATUS_COLORS[status] }}
            />
            {STATUS_LABELS[status].split(' ')[0]}
          </button>
        );
      })}

      <button
        onClick={() => onChange({ ...filters, showIncidents: !filters.showIncidents })}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
          filters.showIncidents
            ? 'bg-red-600 text-white border-red-600 shadow-sm'
            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${
            filters.showIncidents ? 'bg-red-200' : 'bg-red-500'
          }`}
        />
        Incidents
      </button>
    </div>
  );
}
