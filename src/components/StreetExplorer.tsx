'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { extractLineString, extractIntersections, progressAlongLine } from '@/lib/geo';
import { useStreetScroll } from '@/hooks/useStreetScroll';
import { useProjects } from '@/hooks/useProjects';
import { useIncidents } from '@/hooks/useIncidents';
import { createClient } from '@/utils/supabase/client';
import MapView from './MapView';
import ProjectMarker from './ProjectMarker';
import IncidentDot from './IncidentDot';
import IntersectionMarker from './IntersectionMarker';
import DetailPanel from './DetailPanel';
import Header from './Header';
import ViewToggle from './ViewToggle';
import MiniMap from './MiniMap';
import FilterBar from './FilterBar';
import ProjectForm from './admin/ProjectForm';
import type { Project, Incident, ViewMode, FilterState } from '@/lib/types';

interface StreetExplorerProps {
  cortlandGeoJSON: GeoJSON.FeatureCollection;
}

export default function StreetExplorer({ cortlandGeoJSON }: StreetExplorerProps) {
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

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [formState, setFormState] = useState<{
    project?: Project;
    coords?: { lng: number; lat: number };
  } | null>(null);

  const cortlandLine = useMemo(() => extractLineString(cortlandGeoJSON), [cortlandGeoJSON]);
  const intersections = useMemo(() => extractIntersections(cortlandGeoJSON), [cortlandGeoJSON]);

  const intersectionProgress = useMemo(() => {
    if (!cortlandLine) return [];
    return intersections.map((int) => ({
      ...int,
      progress: progressAlongLine(cortlandLine, int.lng, int.lat),
    }));
  }, [cortlandLine, intersections]);

  const { progress } = useStreetScroll({ initialProgress: 0.5, disabled: editMode });
  const { projects: fetchedProjects, refetch } = useProjects();
  const { incidents } = useIncidents();

  const [localProjects, setLocalProjects] = useState<Project[]>([]);
  useEffect(() => {
    if (!editMode) setLocalProjects(fetchedProjects);
  }, [fetchedProjects, editMode]);

  // Hydrate Supabase session token for API calls
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) setAdminToken(session.access_token);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminToken(session?.access_token ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const filteredProjects = useMemo(
    () => localProjects.filter(
      (p) =>
        filters.statuses.includes(p.status) &&
        (filters.types.length === 0 || filters.types.includes(p.type))
    ),
    [localProjects, filters]
  );

  const currentBlock = useMemo(() => {
    if (!intersectionProgress.length) return null;
    const sorted = [...intersectionProgress].sort((a, b) => a.progress - b.progress);
    const nearest = sorted.reduce((best, int) =>
      Math.abs(int.progress - progress) < Math.abs(best.progress - progress) ? int : best
    );
    if (Math.abs(nearest.progress - progress) < 0.04) return `@ ${nearest.name}`;
    const before = [...sorted].reverse().find((i) => i.progress <= progress);
    const after = sorted.find((i) => i.progress > progress);
    if (before && after) return `${before.shortName} → ${after.shortName}`;
    if (before) return `East of ${before.shortName}`;
    if (after) return `West of ${after.shortName}`;
    return null;
  }, [progress, intersectionProgress]);

  // ── Edit mode handlers ──────────────────────────────────────────────────

  function toggleEdit() {
    if (editMode) {
      setEditMode(false);
      setFormState(null);
      setSelectedItem(null);
      refetch();
      return;
    }
    if (adminToken) {
      setEditMode(true);
      setSelectedItem(null);
    } else {
      router.push('/login?redirect=/');
    }
  }

  function handleMapClick(lng: number, lat: number) {
    setFormState({ coords: { lng, lat } });
  }

  async function handleDragEnd(project: Project, lng: number, lat: number) {
    const updated: Project = { ...project, lng, lat, side: 'center' };
    setLocalProjects((prev) => prev.map((p) => p.id === project.id ? updated : p));
    await fetch('/api/projects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken! },
      body: JSON.stringify(updated),
    });
  }

  async function handleFormSave(project: Project) {
    const isNew = !localProjects.find((p) => p.id === project.id);
    await fetch('/api/projects', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': adminToken! },
      body: JSON.stringify(project),
    });
    if (isNew) {
      setLocalProjects((prev) => [...prev, project]);
    } else {
      setLocalProjects((prev) => prev.map((p) => p.id === project.id ? project : p));
    }
    setFormState(null);
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      id="street-explorer"
      className="relative w-full h-full overflow-hidden bg-slate-100 select-none"
      style={{ cursor: editMode ? 'crosshair' : 'grab', touchAction: 'none' }}
    >
      <MapView
        progress={progress}
        viewMode={viewMode}
        cortlandLine={cortlandLine}
        editMode={editMode}
        onMapClick={editMode ? handleMapClick : undefined}
      >
        {intersections.map((int) => (
          <IntersectionMarker key={int.name} intersection={int} />
        ))}

        {filteredProjects.map((project) => (
          <ProjectMarker
            key={project.id}
            project={project}
            selected={!editMode && selectedItem?.type === 'project' && selectedItem.data.id === project.id}
            onClick={editMode
              ? (p) => setFormState({ project: p })
              : (p) => setSelectedItem({ type: 'project', data: p })}
            editMode={editMode}
            onDragEnd={handleDragEnd}
          />
        ))}

        {filters.showIncidents &&
          incidents.map((incident) => (
            <IncidentDot
              key={incident.id}
              incident={incident}
              onClick={(i) => setSelectedItem({ type: 'incident', data: i })}
            />
          ))}
      </MapView>

      <Header projectCount={localProjects.length} />

      <div className="absolute top-16 left-4 right-4 z-10 flex items-center justify-between gap-3 flex-wrap">
        <FilterBar filters={filters} onChange={setFilters} />
        <div className="flex items-center gap-2 ml-auto">
          <MiniMap progress={progress} intersections={intersections} />
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {editMode ? (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-green-700/90 text-white text-[11px] font-medium px-3 py-1 rounded-full
                          backdrop-blur-sm whitespace-nowrap shadow-sm tracking-wide">
            Click map to add pin · Drag pins to reposition
          </div>
        </div>
      ) : currentBlock && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-slate-900/75 text-white text-[11px] font-medium px-3 py-1 rounded-full
                          backdrop-blur-sm whitespace-nowrap shadow-sm tracking-wide">
            {currentBlock}
          </div>
        </div>
      )}

      {!editMode && <ScrollHint />}

      <button
        onClick={toggleEdit}
        className={`absolute bottom-6 right-4 z-20 flex items-center gap-1.5 px-3 py-2 rounded-full
                    text-xs font-medium shadow-md transition-all select-none
                    ${editMode
                      ? 'bg-green-700 text-white hover:bg-green-800'
                      : 'bg-white/90 backdrop-blur-sm text-slate-700 border border-slate-200 hover:bg-white'
                    }`}
      >
        {editMode ? '✓ Done Editing' : '✎ Edit Map'}
      </button>

      {!editMode && <DetailPanel item={selectedItem} onClose={() => setSelectedItem(null)} />}

      {formState !== null && (
        <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <ProjectForm
              project={formState.project}
              initialValues={formState.coords}
              adminToken={adminToken ?? ''}
              onSave={handleFormSave}
              onCancel={() => setFormState(null)}
            />
          </div>
        </div>
      )}
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
