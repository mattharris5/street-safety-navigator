'use client';

import Link from 'next/link';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export interface YearPoint {
  year: number;
  total: number;
  fatal: number;
  severe: number;
  other: number;
  avg3yr: number;
}

export interface MajorIncident {
  datasf_id: string;
  occurred_at: string;
  severity: string;
  killed: number;
  injured: number;
  type: string | null;
  primaryRd: string | null;
  crossRd: string | null;
}

interface Props {
  trendData: YearPoint[];
  majorIncidents: MajorIncident[];
}

function TrendTooltip({ active, payload, label }: {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  label?: number;
}) {
  if (!active || !payload?.length) return null;
  const fatal = payload.find((p) => p.dataKey === 'fatal')?.value ?? 0;
  const severe = payload.find((p) => p.dataKey === 'severe')?.value ?? 0;
  const other = payload.find((p) => p.dataKey === 'other')?.value ?? 0;
  const avg = payload.find((p) => p.dataKey === 'avg3yr')?.value;
  const total = fatal + severe + other;
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-md px-3 py-2.5 text-sm min-w-[160px]">
      <p className="font-semibold text-stone-700 mb-1.5">{label}</p>
      <p className="text-stone-600 text-xs mb-1">{total} total crash{total !== 1 ? 'es' : ''}</p>
      {fatal > 0 && <p className="text-red-600 text-xs">{fatal} fatal</p>}
      {severe > 0 && <p className="text-orange-500 text-xs">{severe} severe injury</p>}
      {other > 0 && <p className="text-amber-500 text-xs">{other} other injury</p>}
      {avg !== undefined && (
        <p className="text-green-700 text-xs mt-1 border-t border-stone-100 pt-1">
          3-yr avg: {avg.toFixed(1)}
        </p>
      )}
    </div>
  );
}

const SEVERITY_BADGE: Record<string, string> = {
  'Fatal': 'bg-red-100 text-red-800 border-red-200',
  'Severe Injury': 'bg-orange-100 text-orange-800 border-orange-200',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function CrashTrendChart({ trendData, majorIncidents }: Props) {
  const minWidth = Math.max(trendData.length * 32, 400);

  return (
    <div className="space-y-6">
      {/* Trend chart */}
      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Crashes Over Time
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Injury crashes along Cortland corridor by year
            </p>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-stone-400 flex-wrap justify-end">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Fatal</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-orange-400 inline-block" /> Severe</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-300 inline-block" /> Other injury</span>
            <span className="flex items-center gap-1"><span className="w-8 h-0.5 bg-green-700 inline-block" /> 3-yr avg</span>
          </div>
        </div>

        <div className="overflow-x-auto mt-4">
          <div style={{ minWidth }}>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart
                data={trendData}
                margin={{ top: 8, right: 16, bottom: 4, left: 28 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 10, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  interval={trendData.length > 15 ? 2 : 0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#78716c' }}
                  tickLine={false}
                  axisLine={false}
                  width={24}
                  allowDecimals={false}
                />
                <Tooltip content={<TrendTooltip />} cursor={{ fill: '#f5f5f4' }} />
                <Bar dataKey="other" stackId="a" fill="#fde68a" maxBarSize={24} />
                <Bar dataKey="severe" stackId="a" fill="#fb923c" maxBarSize={24} />
                <Bar dataKey="fatal" stackId="a" fill="#dc2626" maxBarSize={24} radius={[3, 3, 0, 0]} />
                <Line
                  dataKey="avg3yr"
                  type="monotone"
                  stroke="#166534"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="4 2"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Major incidents list */}
      {majorIncidents.length > 0 && (
        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1">
            Major Incidents
          </p>
          <p className="text-xs text-stone-400 mb-4">
            Fatal and severe injury crashes along the corridor
          </p>
          <div className="divide-y divide-stone-100">
            {majorIncidents.map((incident) => (
              <Link
                key={incident.datasf_id}
                href={`/crashes/${incident.datasf_id}`}
                className="flex items-start gap-3 py-3 hover:bg-stone-50 -mx-1 px-1 rounded-lg transition-colors group"
              >
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${incident.severity === 'Fatal' ? 'bg-red-500' : 'bg-orange-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${SEVERITY_BADGE[incident.severity] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                      {incident.severity}
                    </span>
                    <span className="text-xs text-stone-400">{formatDate(incident.occurred_at)}</span>
                  </div>
                  <p className="text-sm text-stone-700 truncate">
                    {incident.type ?? 'Collision'}
                    {incident.primaryRd && ` · ${incident.primaryRd}`}
                    {incident.crossRd && ` & ${incident.crossRd}`}
                  </p>
                  {(incident.killed > 0 || incident.injured > 0) && (
                    <p className="text-xs text-stone-400 mt-0.5">
                      {incident.killed > 0 && `${incident.killed} killed`}
                      {incident.killed > 0 && incident.injured > 0 && ' · '}
                      {incident.injured > 0 && `${incident.injured} injured`}
                    </p>
                  )}
                </div>
                <ExternalLink size={12} className="text-stone-300 group-hover:text-stone-500 flex-shrink-0 mt-1 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
