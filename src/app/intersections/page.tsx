import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getSupabase } from '@/lib/supabase';

async function getIntersections() {
  const { data } = await getSupabase().from('intersections').select('*').order('sort_order');
  return data ?? [];
}

export default async function IntersectionsPage() {
  const intersections = await getIntersections();

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-[family-name:var(--font-display)] font-semibold text-stone-900 mb-2">
          Cortland Ave Intersections
        </h1>
        <p className="text-stone-500 max-w-xl">
          Every cross-street on the corridor — crash history, 311 reports, and proposed safety improvements.
        </p>
      </div>

      <div className="grid gap-3">
        {intersections.map((int) => (
          <Link
            key={int.id}
            href={`/intersections/${int.slug}`}
            className="flex items-center gap-4 bg-white border border-stone-200 rounded-xl p-4
                       hover:border-green-300 hover:shadow-[var(--shadow-card)] transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0
                            group-hover:bg-green-100 transition-colors">
              <MapPin size={18} className="text-green-800" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800">{int.name}</p>
              {int.description && (
                <p className="text-sm text-stone-500 truncate mt-0.5">{int.description}</p>
              )}
            </div>
            <span className="text-stone-400 text-sm group-hover:text-green-700 transition-colors">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
