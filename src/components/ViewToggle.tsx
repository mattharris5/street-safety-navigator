'use client';

import type { ViewMode } from '@/lib/types';

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
      <button
        onClick={() => onChange('map')}
        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
          mode === 'map'
            ? 'bg-green-700 text-white'
            : 'bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        Map
      </button>
      <button
        onClick={() => onChange('satellite')}
        className={`px-3 py-1.5 text-xs font-medium transition-colors ${
          mode === 'satellite'
            ? 'bg-green-700 text-white'
            : 'bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        Satellite
      </button>
    </div>
  );
}
