import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, MapPin, ExternalLink, Calendar, CloudRain, Sun, Moon } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

async function getData(datasf_id: string) {
  const supabase = getSupabase();
  const { data: crash } = await supabase
    .from('crashes')
    .select('*, intersections(slug, short_name)')
    .eq('datasf_id', datasf_id)
    .single();
  return crash ?? null;
}

const SEVERITY_STYLES: Record<string, string> = {
  'Fatal': 'bg-red-100 text-red-800 border-red-200',
  'Severe Injury': 'bg-orange-100 text-orange-800 border-orange-200',
  'Injury (Visible)': 'bg-amber-100 text-amber-800 border-amber-200',
  'Injury (Complaint of Pain)': 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

function severityStyle(sev: string | null) {
  if (!sev) return 'bg-stone-100 text-stone-600 border-stone-200';
  return SEVERITY_STYLES[sev] ?? 'bg-stone-100 text-stone-600 border-stone-200';
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value || value === 'Not Stated' || value === 'No Pedestrian Involved') return null;
  return (
    <div className="flex gap-3 px-4 py-2 border-b border-stone-100 last:border-0">
      <span className="text-xs text-stone-400 w-40 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-stone-700">{value}</span>
    </div>
  );
}

export default async function CrashDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const crash = await getData(id);
  if (!crash) notFound();

  const r = crash.raw as Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const intersection = (crash as any).intersections as { slug: string; short_name: string } | null;

  const date = crash.occurred_at ? new Date(crash.occurred_at) : null;
  const killed = parseInt(r.number_killed ?? '0', 10);
  const injured = parseInt(r.number_injured ?? '0', 10);

  const involvedParties = [r.party1_type, r.party2_type, r.party3_type]
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(', ');

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
        <span className="text-stone-700">Crash #{crash.datasf_id}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle size={18} className="text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-display)] font-semibold text-stone-900">
            {r.type_of_collision ?? 'Collision'}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {crash.severity && (
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${severityStyle(crash.severity)}`}>
                {crash.severity}
              </span>
            )}
            {date && (
              <span className="text-sm text-stone-400 flex items-center gap-1">
                <Calendar size={12} />
                {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {' '}at{' '}
                {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Outcome banner */}
      {(killed > 0 || injured > 0) && (
        <div className={`rounded-xl border px-4 py-3 mb-6 ${killed > 0 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
          <p className={`text-sm font-medium ${killed > 0 ? 'text-red-800' : 'text-amber-800'}`}>
            {killed > 0 && `${killed} killed`}
            {killed > 0 && injured > 0 && ' · '}
            {injured > 0 && `${injured} injured`}
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Parties */}
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Parties Involved</h2>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <Row label="Party types" value={involvedParties || null} />
            <Row label="Party 1 direction" value={r.party1_dir_of_travel} />
            <Row label="Party 1 movement" value={r.party1_move_pre_acc} />
            <Row label="Party 2 direction" value={r.party2_dir_of_travel} />
            <Row label="Party 2 movement" value={r.party2_move_pre_acc} />
            <Row label="Pedestrian action" value={r.ped_action !== 'No Pedestrian Involved' ? r.ped_action : null} />
          </div>
        </section>

        {/* Contributing factor */}
        {r.vz_pcf_description && (
          <section>
            <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Primary Contributing Factor</h2>
            <div className="bg-white border border-stone-200 rounded-xl px-4 py-3">
              <p className="text-sm text-stone-700">{r.vz_pcf_description}</p>
              {r.vz_pcf_link && (
                <a
                  href={r.vz_pcf_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-700 hover:text-green-900 flex items-center gap-1 mt-1.5"
                >
                  Vehicle Code §{r.vz_pcf_code} <ExternalLink size={10} />
                </a>
              )}
            </div>
          </section>
        )}

        {/* Conditions */}
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Conditions</h2>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <Row label="Weather" value={r.weather_1 !== 'Not Stated' ? r.weather_1 : null} />
            <Row label="Lighting" value={r.lighting} />
            <Row label="Road surface" value={r.road_surface} />
            <Row label="Road condition" value={r.road_cond_1 !== 'No Unusual Condition' ? r.road_cond_1 : null} />
            <Row label="Traffic control" value={r.control_device} />
            <Row label="Time of day" value={r.time_cat} />
          </div>
        </section>

        {/* Location */}
        <section>
          <h2 className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-2">Location</h2>
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <Row label="Primary street" value={r.primary_rd} />
            <Row label="Cross street" value={r.secondary_rd} />
            <Row label="Geocode source" value={r.geocode_source?.replace(/-/g, ' ')} />
            <div className="flex gap-3 px-4 py-2">
              <span className="text-xs text-stone-400 w-40 flex-shrink-0 pt-0.5">Coordinates</span>
              <span className="text-sm text-stone-700">
                {crash.lat?.toFixed(5)}, {crash.lng?.toFixed(5)}
              </span>
            </div>
          </div>
          {r.street_view && (
            <a
              href={r.street_view}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-2 text-sm text-green-700 hover:text-green-900 font-medium"
            >
              <MapPin size={14} />
              View in Google Street View <ExternalLink size={12} />
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
