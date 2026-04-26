import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, MapPin, ExternalLink, Calendar } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

async function getData(datasf_id: string) {
  const supabase = getSupabase();
  const { data: sr } = await supabase
    .from('service_requests')
    .select('*, intersections(slug, short_name)')
    .eq('datasf_id', datasf_id)
    .single();
  return sr ?? null;
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex gap-3 py-2 border-b border-stone-100 last:border-0">
      <span className="text-xs text-stone-400 w-40 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-stone-700">{value}</span>
    </div>
  );
}

function DateRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  const d = new Date(value);
  return (
    <div className="flex gap-3 py-2 border-b border-stone-100 last:border-0">
      <span className="text-xs text-stone-400 w-40 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-stone-700 flex items-center gap-1.5">
        <Calendar size={12} className="text-stone-400" />
        {d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        {' '}at{' '}
        {d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
      </span>
    </div>
  );
}

export default async function ServiceRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sr = await getData(id);
  if (!sr) notFound();

  const r = sr.raw as Record<string, string | { url?: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const intersection = (sr as any).intersections as { slug: string; short_name: string } | null;

  const isOpen = sr.status !== 'Closed';
  const mediaUrl = typeof r.media_url === 'object' ? r.media_url?.url : null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-6 flex-wrap">
        <Link href="/intersections" className="hover:text-stone-600">Intersections</Link>
        {intersection && (
          <>
            <span>/</span>
            <Link href={`/intersections/${intersection.slug}`} className="hover:text-stone-600">
              {intersection.short_name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-stone-700">311 #{sr.datasf_id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare size={18} className="text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-display)] font-semibold text-stone-900">
            {sr.category ?? 'Service Request'}
          </h1>
          {typeof r.service_subtype === 'string' && r.service_subtype && (
            <p className="text-sm text-stone-500 mt-0.5 capitalize">
              {r.service_subtype.replace(/_/g, ' ')}
              {typeof r.service_details === 'string' && r.service_details && ` · ${r.service_details}`}
            </p>
          )}
          <div className="mt-1.5">
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              isOpen
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-stone-100 text-stone-500 border-stone-200'
            }`}>
              {sr.status ?? 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Status notes */}
      {typeof r.status_notes === 'string' && r.status_notes && (
        <div className="bg-stone-100 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-stone-600">{r.status_notes}</p>
        </div>
      )}

      {/* Photo */}
      {mediaUrl && (
        <div className="mb-6 rounded-xl overflow-hidden border border-stone-200 relative" style={{ height: 260 }}>
          <Image src={mediaUrl} alt="311 report photo" fill className="object-cover" />
        </div>
      )}

      <div className="space-y-6">
        {/* Timeline */}
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Timeline</h2>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <DateRow label="Opened" value={sr.opened} />
            <DateRow label="Closed" value={sr.closed} />
            <DateRow label="Last updated" value={typeof r.updated_datetime === 'string' ? r.updated_datetime : null} />
            <Row label="Source" value={typeof r.source === 'string' ? r.source : null} />
          </div>
        </section>

        {/* Agency */}
        {typeof r.agency_responsible === 'string' && r.agency_responsible && (
          <section>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Handling Agency</h2>
            <div className="bg-white border border-stone-200 rounded-xl px-4 py-3">
              <p className="text-sm text-stone-700">{r.agency_responsible}</p>
            </div>
          </section>
        )}

        {/* Location */}
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Location</h2>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            {typeof r.address === 'string' && <Row label="Address" value={r.address} />}
            {typeof r.street === 'string' && !r.address && <Row label="Street" value={r.street} />}
            <Row label="Neighborhood" value={typeof r.analysis_neighborhood === 'string' ? r.analysis_neighborhood : null} />
            <div className="flex gap-3 py-2">
              <span className="text-xs text-stone-400 w-40 flex-shrink-0 pt-0.5">Coordinates</span>
              <span className="text-sm text-stone-700">
                {sr.lat?.toFixed(5)}, {sr.lng?.toFixed(5)}
              </span>
            </div>
          </div>
          {sr.lat && sr.lng && (
            <a
              href={`https://maps.google.com/maps?q=${sr.lat},${sr.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium"
            >
              <MapPin size={14} />
              View in Google Maps <ExternalLink size={12} />
            </a>
          )}
        </section>
      </div>

      {intersection && (
        <div className="mt-8 pt-6 border-t border-stone-200">
          <Link
            href={`/intersections/${intersection.slug}`}
            className="text-sm text-stone-500 hover:text-stone-700"
          >
            ← Back to {intersection.short_name}
          </Link>
        </div>
      )}
    </div>
  );
}
