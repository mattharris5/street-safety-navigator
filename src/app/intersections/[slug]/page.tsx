import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, AlertTriangle, MessageSquare, ChevronRight } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';
import { getProjects } from '@/lib/data';
import { nearestIntersectionName } from '@/lib/geo';

async function getData(slug: string) {
  const supabase = getSupabase();
  const [{ data: int }, projects] = await Promise.all([
    supabase.from('intersections').select('*').eq('slug', slug).single(),
    getProjects(),
  ]);
  if (!int) return null;

  const [{ data: crashes }, { data: requests }] = await Promise.all([
    supabase.from('crashes').select('*').eq('intersection_id', int.id).order('occurred_at', { ascending: false }),
    supabase.from('service_requests').select('*').eq('intersection_id', int.id).order('opened', { ascending: false }),
  ]);

  const nearbyProjects = projects.filter((p) => {
    const nearest = nearestIntersectionName(p.lng, p.lat, [{ name: int.name, shortName: int.short_name, lng: int.lng, lat: int.lat, order: 0 }], 200);
    return nearest !== null;
  });

  return { int, crashes: crashes ?? [], requests: requests ?? [], nearbyProjects };
}

export default async function IntersectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getData(slug);
  if (!result) notFound();

  const { int, crashes, requests, nearbyProjects } = result;

  const severityCounts = crashes.reduce((acc: Record<string, number>, c) => {
    if (c.severity) acc[c.severity] = (acc[c.severity] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: crash + 311 data */}
        <div className="lg:col-span-2 space-y-8">
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

        {/* Right: nearby projects */}
        <div>
          <h2 className="font-semibold text-stone-800 mb-4">
            Nearby Projects
            <span className="ml-2 text-stone-400 font-normal text-sm">({nearbyProjects.length})</span>
          </h2>
          {nearbyProjects.length === 0 ? (
            <p className="text-stone-400 text-sm">No projects near this intersection yet.</p>
          ) : (
            <div className="space-y-3">
              {nearbyProjects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="block bg-white border border-stone-200 rounded-lg p-3 hover:border-green-300 transition-colors"
                >
                  <p className="text-sm font-medium text-stone-800 leading-snug">{p.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5 capitalize">{p.status} · {p.type.replace('-', ' ')}</p>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Link
              href={`/?intersection=${slug}`}
              className="text-sm text-green-800 hover:text-green-900 font-medium"
            >
              View on map →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
