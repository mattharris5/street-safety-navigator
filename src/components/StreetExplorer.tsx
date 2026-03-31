'use client';

import { useState, useEffect, useMemo } from 'react';
import { extractLineString, extractIntersections, progressAlongLine } from '@/lib/geo';
import { useStreetScroll } from '@/hooks/useStreetScroll';
import { useProjects } from '@/hooks/useProjects';
import { useIncidents } from '@/hooks/useIncidents';
import MapView from './MapView';
import ProjectMarker from './ProjectMarker';
import IncidentDot from './IncidentDot';
import IntersectionMarker from './IntersectionMarker';
import DetailPanel from './DetailPanel';
import Header from './Header';
import ViewToggle from './ViewToggle';
import MiniMap from './MiniMap';
import FilterBar from './FilterBar';
import type { Project, Incident, ViewMode, FilterState, Intersection } from '@/lib/types';

interface StreetExplorerProps {
  cortlandGeoJSON: GeoJSON.FeatureCollection;
}

export default function StreetExplorer({ cortlandGeoJSON }: StreetExplorerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedItem, setSelectedItem] = useState<
    { type: 'project'; data: Project } | { type: 'incident'; data: Incident } | null
  >(null);
  const [filters, setFilters] = useState<FilterState>({
    statuses: ['installed', 'proposed', 'idea'],
    types: [],
    showIncidents: true,
  });

  const cortlandLine = useMemo(() => extractLineString(cortlandGeoJSON), [cortlandGeoJSON]);
  const intersections = useMemo(() => extractIntersections(cortlandGeoJSON), [cortlandGeoJSON]);

  // Pre-compute each intersection's progress value (0–1) along the line
  const intersectionProgress = useMemo(() => {
    if (!cortlandLine) return [];
    return intersections.map((int) => ({
      ...int,
      progress: progressAlongLine(cortlandLine, int.lng, int.lat),
    }));
  }, [cortlandLine, intersections]);

  const { progress, setProgress } = useStreetScroll({ initialProgress: 0.5 });
  const { projects } = useProjects();
  const { incidents } = useIncidents();

  const filteredProjects = useMemo(
    () => projects.filter(
      (p) =>
        filters.statuses.includes(p.status) &&
        (filters.types.length === 0 || filters.types.includes(p.type))
    ),
    [projects, filters]
  );

  // Derive current block label from progress
  const currentBlock = useMemo(() => {
    if (!intersectionProgress.length) return null;
    const sorted = [...intersectionProgress].sort((a, b) => a.progress - b.progress);

    // Find the nearest intersection
    const nearest = sorted.reduce((best, int) =>
      Math.abs(int.progress - progress) < Math.abs(best.progress - progress) ? int : best
    );

    // If very close to an intersection, show "@ Name"
    if (Math.abs(nearest.progress - progress) < 0.04) {
      return `@ ${nearest.name}`;
    }

    // Otherwise show "Between A & B"
    const before = [...sorted].reverse().find((i) => i.progress <= progress);
    const after = sorted.find((i) => i.progress > progress);
    if (before && after) return `${before.shortName} → ${after.shortName}`;
    if (before) return `East of ${before.shortName}`;
    if (after) return `West of ${after.shortName}`;
    return null;
  }, [progress, intersectionProgress]);

  return (
    <div
      id="street-explorer"
      className="relative w-full h-screen overflow-hidden bg-slate-100 select-none"
      style={{ cursor: 'grab', touchAction: 'none' }}
    >
      {/* Map fills the full viewport */}
      <MapView progress={progress} viewMode={viewMode} cortlandLine={cortlandLine}>
        {/* Intersection labels */}
        {intersections.map((int) => (
          <IntersectionMarker key={int.name} intersection={int} />
        ))}

        {/* Project markers */}
        {filteredProjects.map((project) => (
          <ProjectMarker
            key={project.id}
            project={project}
            selected={selectedItem?.type === 'project' && selectedItem.data.id === project.id}
            onClick={(p) => setSelectedItem({ type: 'project', data: p })}
          />
        ))}

        {/* Incident dots */}
        {filters.showIncidents &&
          incidents.map((incident) => (
            <IncidentDot
              key={incident.id}
              incident={incident}
              onClick={(i) => setSelectedItem({ type: 'incident', data: i })}
            />
          ))}
      </MapView>

      {/* Header bar */}
      <Header projectCount={projects.length} />

      {/* Controls toolbar */}
      <div className="absolute top-16 left-4 right-4 z-10 flex items-center justify-between gap-3 flex-wrap">
        <FilterBar filters={filters} onChange={setFilters} />
        <div className="flex items-center gap-2 ml-auto">
          <MiniMap progress={progress} intersections={intersections} />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Current block indicator */}
      {currentBlock && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-slate-900/75 text-white text-[11px] font-medium px-3 py-1 rounded-full
                          backdrop-blur-sm whitespace-nowrap shadow-sm tracking-wide">
            {currentBlock}
          </div>
        </div>
      )}

      {/* Scroll hint */}
      <ScrollHint />

      {/* Detail panel */}
      <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}

function ScrollHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 4000);
    const hide = () => setVisible(false);
    window.addEventListener('wheel', hide, { once: true });
    window.addEventListener('touchstart', hide, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('wheel', hide);
      window.removeEventListener('touchstart', hide);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
      <div className="bg-black/60 text-white text-xs px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2">
        <span className="animate-bounce inline-block">←</span>
        <span className="hidden sm:inline">Scroll to travel along Cortland Ave</span>
        <span className="sm:hidden">Swipe to explore</span>
        <span className="animate-bounce inline-block">→</span>
      </div>
    </div>
  );
}
