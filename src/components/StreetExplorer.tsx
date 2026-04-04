'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { extractLineString, extractIntersections } from '@/lib/geo';
import { useIntersectionNav } from '@/hooks/useIntersectionNav';
import { useProjects } from '@/hooks/useProjects';
import { useIncidents } from '@/hooks/useIncidents';
import MapView from './MapView';
import IntersectionMarker from './IntersectionMarker';
import IntersectionView from './intersection/IntersectionView';
import DetailPanel from './DetailPanel';
import Header from './Header';
import ViewToggle from './ViewToggle';
import CortlandStrip from './CortlandStrip';
import FilterBar from './FilterBar';
import type { Project, Incident, ViewMode, FilterState } from '@/lib/types';

interface StreetExplorerProps {
  cortlandGeoJSON: GeoJSON.FeatureCollection;
  initialIntersection?: string;
}

export default function StreetExplorer({ cortlandGeoJSON, initialIntersection }: StreetExplorerProps) {
  const router = useRouter();
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

  // Resolve initial intersection from URL param
  const initialIndex = useMemo(() => {
    if (!initialIntersection) return 0;
    const slug = initialIntersection.toLowerCase();
    const idx = intersections.findIndex(
      (int) =>
        int.shortName?.toLowerCase() === slug ||
        int.name.toLowerCase().includes(slug)
    );
    return idx >= 0 ? idx : 0;
  }, [initialIntersection, intersections]);

  const { currentIndex, currentIntersection, goTo, next, prev } = useIntersectionNav({
    intersections,
    initialIndex,
  });

  // Update URL on navigation (shallow)
  const updateUrl = useCallback(
    (index: number) => {
      const int = intersections[index];
      if (!int) return;
      const slug = (int.shortName ?? int.name).toLowerCase().replace(/\s+/g, '-');
      router.replace(`/?intersection=${slug}`, { scroll: false });
    },
    [intersections, router]
  );

  useEffect(() => {
    updateUrl(currentIndex);
  }, [currentIndex, updateUrl]);

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

  return (
    <div
      id="street-explorer"
      className="relative w-full h-screen overflow-hidden select-none"
      style={{ background: 'var(--color-cream)', cursor: 'grab', touchAction: 'none' }}
    >
      {/* Mapbox base — dimmed under SVG overlay */}
      <div
        className="absolute inset-0"
        style={{ filter: 'saturate(0.3) brightness(0.85)', opacity: 0.7 }}
      >
        <MapView intersection={currentIntersection} viewMode={viewMode} cortlandLine={cortlandLine}>
          {intersections.map((int) => (
            <IntersectionMarker key={int.name} intersection={int} />
          ))}
        </MapView>
      </div>

      {/* SVG intersection overlay */}
      {currentIntersection && (
        <IntersectionView
          intersection={currentIntersection}
          intersectionIndex={currentIndex}
          projects={filteredProjects}
          selectedProjectId={selectedItem?.type === 'project' ? selectedItem.data.id : null}
          onSelectProject={(p) => setSelectedItem({ type: 'project', data: p })}
        />
      )}

      {/* Header */}
      <Header projectCount={projects.length} />

      {/* Cortland strip navigator */}
      <CortlandStrip
        intersections={intersections}
        currentIndex={currentIndex}
        onNavigate={goTo}
        onPrev={prev}
        onNext={next}
      />

      {/* Controls toolbar */}
      <div className="absolute top-[132px] left-4 right-4 z-10 flex items-center justify-end gap-3 flex-wrap">
        <FilterBar filters={filters} onChange={setFilters} />
        <div className="flex items-center gap-2 ml-auto">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Detail panel */}
      <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
