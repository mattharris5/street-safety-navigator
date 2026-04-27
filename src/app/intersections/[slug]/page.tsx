import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, AlertTriangle, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { getProjects, getIntersections } from '@/lib/data';
import { nearestIntersection } from '@/lib/geo';

async function getData(slug: string) {
  const supabase = getSupabase();
  const [{ data: int }, projects, allIntersections] = await Promise.all([
    supabase.from('intersections').select('*').eq('slug', slug).single(),
    getProjects(),
    getIntersections(),
  ]);
  if (!int) return null;

  const [{ data: crashes }, { data: requests }] = await Promise.all([
    supabase.from('crashes').select('*').eq('intersection_id', int.id).order('occurred_at', { ascending: false }),
    supabase.from('service_requests').select('*').eq('intersection_id', int.id).order('opened', { ascending: false }),
  ]);

  // A project belongs here only if this is its nearest intersection across the whole corridor.
  const nearbyProjects = projects.filter((p) => {
    const nearest = nearestIntersection(p.lng, p.lat, allIntersections, 200);
    return nearest?.slug === slug;
  });

  // Prev/next by sort_order for corridor navigation
  const idx = allIntersections.findIndex((i) => i.slug === slug);
  const prev = idx > 0 ? allIntersections[idx - 1] : null;
  const next = idx < allIntersections.length - 1 ? allIntersections[idx + 1] : null;

  return { int, crashes: crashes ?? [], requests: requests ?? [], nearbyProjects, prev, next };
}

export default async function IntersectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getData(slug);
  if (!result) notFound();

  const { int, crashes, requests, nearbyProjects, prev, next } = result;

  const severityCounts = crashes.reduce((acc: Record<string, number>, c) => {
    if (c.severity) acc[c.severity] = (acc[c.severity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative max-w-4xl mx-auto px-6 py-10">
      {/* Corridor navigation arrows — fixed to viewport sides */}
      {prev?.slug && (
        <Link
          href={`/intersections/${prev.slug}`}
          className="fixed left-2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1
                     bg-white border border-stone-200 rounded-xl px-2 py-4 shadow-md
                     hover:border-green-300 hover:shadow-lg transition-all group max-w-[72px]"
        >
          <ChevronLeft size={20} className="text-stone-400 group-hover:text-green-700 transition-colors" />
          <span className="text-[10px] text-stone-400 group-hover:text-green-700 text-center leading-tight transition-colors">
            {prev.shortName}
          </span>
        </Link>
      )}
      {next?.slug && (
        <Link
          href={`/intersections/${next.slug}`}
          className="fixed right-2 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-1
                     bg-white border border-stone-200 rounded-xl px-2 py-4 shadow-md
                     hover:border-green-300 hover:shadow-lg transition-all group max-w-[72px]"
        >
          <ChevronRight size={20} className="text-stone-400 group-hover:text-green-700 transition-colors" />
          <span className="text-[10px] text-stone-400 group-hover:text-green-700 text-center leading-tight transition-colors">
            {next.shortName}
          </span>
        </Link>
      )}
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
        <Link href="/intersections" className="hover:text-stone-600">Intersections</Link>
        <span>/</span>
        <span className="text-stone-700">{int.short_name}</span>
      </div>

      <h1 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900 mb-1">
        {int.name}
      </h1>
      <div className="flex items-center gap-1.5 text-stone-400 text-sm mb-8">
        <MapPin size={13} />
        <span>{int.lat.toFixed(5)}, {int.lng.toFixed(5)}</span>
      </div>

      {int.description && (
        <p className="text-stone-600 mb-8 max-w-2xl leading-relaxed">{int.description}</p>
      )}

      {/* Striping image */}
      {int.striping_image_url && (
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-3">SFMTA Striping Plan</h2>
          <div className="relative w-full rounded-xl overflow-hidden border border-stone-200" style={{ height: 400 }}>
            <Image src={int.striping_image_url} alt="SFMTA striping plan" fill className="object-contain bg-white" />
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Projects — prominent, full width */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">
              Projects
              <span className="ml-2 text-stone-400 font-normal text-sm">({nearbyProjects.length})</span>
            </h2>
            <Link href={`/map?project=${slug}`} className="text-sm text-green-800 hover:text-green-900 font-medium">
              View on map →
            </Link>
          </div>
          {nearbyProjects.length === 0 ? (
            <p className="text-stone-400 text-sm">No projects near this intersection yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {nearbyProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block bg-white border border-stone-200 rounded-xl p-4 hover:border-green-300 hover:shadow-[var(--shadow-card)] transition-all"
                >
                  <p className="text-sm font-semibold text-stone-800 leading-snug mb-1">{p.name}</p>
                  <p className="text-xs text-stone-400 capitalize">{p.status} · {p.type.replace(/-/g, ' ')}</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Crashes + 311 side by side */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Crashes */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-red-500" />
              <h2 className="font-semibold text-stone-800">
                Injury Crashes
                <span className="ml-2 text-stone-400 font-normal text-sm">({crashes.length})</span>
              </h2>
            </div>
            {crashes.length === 0 ? (
              <p className="text-stone-400 text-sm">No injury crashes recorded at this intersection.</p>
            ) : (
              <>
                {Object.keys(severityCounts).length > 0 && (
                  <div className="flex gap-3 mb-4 flex-wrap">
                    {Object.entries(severityCounts).map(([sev, count]) => (
                      <span key={sev} className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        {count} {sev}
                      </span>
                    ))}
                  </div>
                )}
                <div className="divide-y divide-stone-100">
                  {crashes.slice(0, 10).map((c) => (
                    <Link
                      key={c.id}
                      href={`/crashes/${c.datasf_id}`}
                      className="flex items-center gap-3 py-3 cursor-pointer hover:bg-stone-50 active:bg-stone-100 transition-colors"
                    >
                      <span className="text-xs text-stone-400 w-24 flex-shrink-0">
                        {c.occurred_at ? new Date(c.occurred_at).toLocaleDateString() : '—'}
                      </span>
                      <span className="text-sm text-stone-700 flex-1 capitalize">{c.severity ?? 'injury'}</span>
                      <ChevronRight size={14} className="text-stone-400 flex-shrink-0" />
                    </Link>
                  ))}
                  {crashes.length > 10 && (
                    <p className="text-xs text-stone-400 pt-1">+ {crashes.length - 10} more</p>
                  )}
                </div>
              </>
            )}
          </section>

          {/* 311 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-blue-500" />
              <h2 className="font-semibold text-stone-800">
                311 Requests
                <span className="ml-2 text-stone-400 font-normal text-sm">({requests.length})</span>
              </h2>
            </div>
            {requests.length === 0 ? (
              <p className="text-stone-400 text-sm">No 311 requests recorded near this intersection.</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {requests.slice(0, 10).map((r) => (
                  <Link
                    key={r.id}
                    href={`/service-requests/${r.datasf_id}`}
                    className="flex items-center gap-3 py-3 cursor-pointer hover:bg-stone-50 active:bg-stone-100 transition-colors"
                  >
                    <span className="text-xs text-stone-400 w-24 flex-shrink-0">
                      {r.opened ? new Date(r.opened).toLocaleDateString() : '—'}
                    </span>
                    <span className="text-sm text-stone-700 flex-1">{r.category ?? '—'}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      r.status === 'Closed' ? 'bg-stone-100 text-stone-500' : 'bg-blue-50 text-blue-700'
                    }`}>{r.status ?? '—'}</span>
                    <ChevronRight size={14} className="text-stone-400 flex-shrink-0" />
                  </Link>
                ))}
                {requests.length > 10 && (
                  <p className="text-xs text-stone-400 pt-1">+ {requests.length - 10} more</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
