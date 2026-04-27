'use client';

import { useState } from 'react';
import { TYPE_LABELS, STATUS_LABELS } from '@/lib/constants';
import ImageUploader from '@/components/ImageUploader';
import type { Project, ProjectType, ProjectStatus, StreetSide, Intersection } from '@/lib/types';

interface ProjectFormProps {
  project?: Project;
  initialValues?: { lng?: number; lat?: number };
  intersections?: Intersection[];
  adminToken: string;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

const PROJECT_TYPES: ProjectType[] = [
  'painted-safety-zone', 'planter', 'pedestrian-island', 'street-mural',
  'flex-post', 'daylighting', 'crosswalk', 'speed-bump', 'curb-extension',
  'signal', 'bike-share', 'bus-stop', 'other',
];
const STATUSES: ProjectStatus[] = ['installed', 'proposed', 'idea'];
const SIDES: StreetSide[] = ['north', 'south', 'center', 'both'];

const DEFAULT_LNG = -122.39987;
const DEFAULT_LAT = 37.73943;

export default function ProjectForm({ project, initialValues, intersections = [], adminToken, onSave, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState<Omit<Project, 'id'>>({
    name: project?.name ?? '',
    type: project?.type ?? 'daylighting',
    status: project?.status ?? 'idea',
    description: project?.description ?? '',
    lng: project?.lng ?? initialValues?.lng ?? DEFAULT_LNG,
    lat: project?.lat ?? initialValues?.lat ?? DEFAULT_LAT,
    side: project?.side ?? 'both',
    spanMeters: project?.spanMeters,
    images: project?.images ?? [],
    links: project?.links ?? [],
    date: project?.date ?? new Date().toISOString().split('T')[0],
    tags: project?.tags ?? [],
    sponsor: project?.sponsor ?? '',
  });

  const [tagInput, setTagInput] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function handleIntersectionSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const slug = e.target.value;
    if (!slug) return;
    const int = intersections.find((i) => i.slug === slug);
    if (int) {
      setForm((f) => ({ ...f, lng: int.lng, lat: int.lat }));
    }
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !form.tags?.includes(t)) set('tags', [...(form.tags ?? []), t]);
    setTagInput('');
  }

  function addLink() {
    if (linkLabel && linkUrl) {
      set('links', [...(form.links ?? []), { label: linkLabel, url: linkUrl }]);
      setLinkLabel('');
      setLinkUrl('');
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const toSave: Project = {
      ...form,
      id: project?.id ?? `proj-${Date.now()}`,
    };
    if (!toSave.sponsor) delete toSave.sponsor;
    onSave(toSave);
  }

  // Find current intersection based on coordinates
  const currentIntSlug = intersections.find(
    (i) => Math.abs(i.lng - form.lng) < 0.0001 && Math.abs(i.lat - form.lat) < 0.0001
  )?.slug ?? '';

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-800 mb-6">
        {project ? 'Edit Project' : 'Add New Project'}
      </h2>

      <div className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Name *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. Daylighting Zone — Cortland @ Bocana"
          />
        </div>

        {/* Type + Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
            <select
              value={form.type}
              onChange={(e) => set('type', e.target.value as ProjectType)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as ProjectStatus)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Describe this project, its goals, and current status…"
          />
        </div>

        {/* Intersection */}
        {intersections.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Intersection</label>
            <select
              value={currentIntSlug}
              onChange={handleIntersectionSelect}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">— Mid-block or unassigned —</option>
              {intersections.map((i) => (
                <option key={i.slug} value={i.slug ?? ''}>{i.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Selecting an intersection auto-fills coordinates below.</p>
          </div>
        )}

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Coordinates</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400">Longitude</label>
              <input
                type="number"
                step="0.00001"
                value={form.lng}
                onChange={(e) => set('lng', parseFloat(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Latitude</label>
              <input
                type="number"
                step="0.00001"
                value={form.lat}
                onChange={(e) => set('lat', parseFloat(e.target.value))}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Or right-click on{' '}
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a>{' '}
            to copy coordinates.
          </p>
        </div>

        {/* Side + Span */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Street Side</label>
            <select
              value={form.side}
              onChange={(e) => set('side', e.target.value as StreetSide)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {SIDES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Span (meters)</label>
            <input
              type="number"
              value={form.spanMeters ?? ''}
              onChange={(e) => set('spanMeters', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. 10"
            />
          </div>
        </div>

        {/* Sponsor */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Sponsoring Organization</label>
          <input
            type="text"
            value={form.sponsor ?? ''}
            onChange={(e) => set('sponsor', e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g. Civic Joy + Greening Projects"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input
            type="date"
            value={form.date ?? ''}
            onChange={(e) => set('date', e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {form.tags?.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => set('tags', form.tags?.filter((t) => t !== tag) ?? [])}
                  className="text-slate-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g. daylighting"
            />
            <button type="button" onClick={addTag} className="text-xs text-green-700 font-medium px-3 py-1.5 border border-green-200 rounded-lg hover:bg-green-50">
              Add
            </button>
          </div>
        </div>

        {/* Links */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Links</label>
          {form.links?.map((link, i) => (
            <div key={i} className="flex items-center gap-2 mb-1.5">
              <span className="text-xs text-slate-600 flex-1 truncate">{link.label} — {link.url}</span>
              <button
                type="button"
                onClick={() => set('links', form.links?.filter((_, j) => j !== i) ?? [])}
                className="text-slate-300 hover:text-red-500 text-xs"
              >
                ×
              </button>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input
              type="text"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Label"
            />
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://…"
            />
          </div>
          <button type="button" onClick={addLink} className="mt-1.5 text-xs text-green-700 font-medium px-3 py-1 border border-green-200 rounded-lg hover:bg-green-50">
            Add Link
          </button>
        </div>
      </div>

        {/* Photos */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-slate-700 mb-2">Photos</label>
          <ImageUploader
            images={form.images ?? []}
            onChange={(imgs) => set('images', imgs)}
            projectId={project?.id ?? `proj-${Date.now()}`}
            adminToken={adminToken}
          />
        </div>

      {/* Buttons */}
      <div className="flex gap-3 mt-8">
        <button
          type="submit"
          className="flex-1 bg-green-700 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-green-800 transition-colors"
        >
          {project ? 'Save Changes' : 'Create Project'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 border border-slate-200 text-slate-600 rounded-lg py-2.5 text-sm hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
