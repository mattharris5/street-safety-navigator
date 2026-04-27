'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useRouter } from 'next/navigation';

interface DataPoint {
  name: string;
  slug: string | null;
  crashes: number;
  requests: number;
}

interface Props {
  data: DataPoint[];
}

function CrashTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-stone-700 mb-0.5">{label}</p>
      <p className="text-red-600">{v} crash{v !== 1 ? 'es' : ''}</p>
    </div>
  );
}

function RequestTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-stone-700 mb-0.5">{label}</p>
      <p className="text-blue-600">{v} 311 report{v !== 1 ? 's' : ''}</p>
    </div>
  );
}

const SYNC_ID = 'corridor';
const MARGIN = { top: 8, right: 8, bottom: 4, left: 28 };
const MARGIN_BOTTOM = { top: 4, right: 8, bottom: 60, left: 28 };
const BAR_SIZE = 20;

export default function CorridorChart({ data }: Props) {
  const router = useRouter();
  const minWidth = data.length * 36;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleBarClick(entry: any) {
    if (entry?.slug) router.push(`/intersections/${entry.slug}`);
  }

  return (
    <div className="space-y-3">
      {/* Crashes */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-3">Injury Crashes</p>
        <div className="overflow-x-auto">
          <div style={{ minWidth }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data} margin={MARGIN} syncId={SYNC_ID}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis tick={{ fontSize: 10, fill: '#78716c' }} tickLine={false} axisLine={false} width={24} />
                <Tooltip content={<CrashTooltip />} cursor={{ fill: '#fef2f2' }} />
                <Bar dataKey="crashes" maxBarSize={BAR_SIZE} radius={[3, 3, 0, 0]} onClick={handleBarClick} cursor="pointer">
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.crashes > 0 ? '#f87171' : '#fecaca'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 311 Reports */}
      <div className="bg-white border border-stone-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-3">311 Reports</p>
        <div className="overflow-x-auto">
          <div style={{ minWidth }}>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data} margin={MARGIN_BOTTOM} syncId={SYNC_ID}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-55}
                  textAnchor="end"
                  tick={{ fontSize: 10, fill: '#78716c' }}
                  interval={0}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis tick={{ fontSize: 10, fill: '#78716c' }} tickLine={false} axisLine={false} width={24} />
                <Tooltip content={<RequestTooltip />} cursor={{ fill: '#eff6ff' }} />
                <Bar dataKey="requests" maxBarSize={BAR_SIZE} radius={[3, 3, 0, 0]} onClick={handleBarClick} cursor="pointer">
                  {data.map((d, i) => (
                    <Cell key={i} fill={d.requests > 0 ? '#60a5fa' : '#bfdbfe'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
