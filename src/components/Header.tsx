'use client';

import { BRAND } from '@/lib/constants';

interface HeaderProps {
  projectCount: number;
}

export default function Header({ projectCount }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-slate-200">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-700 text-white text-sm font-bold">
          S
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 leading-tight">
            {BRAND.name}
          </h1>
          <p className="text-xs text-slate-500 leading-tight">{BRAND.street} · {BRAND.neighborhood}</p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
          Installed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          Proposed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
          Idea
        </span>
        <span className="text-slate-400">·</span>
        <span>{projectCount} projects</span>
      </div>

      <div className="flex items-center gap-1 text-xs text-slate-400">
        <span className="hidden sm:inline">← Scroll to explore →</span>
        <span className="sm:hidden">Swipe to explore</span>
      </div>
    </header>
  );
}
