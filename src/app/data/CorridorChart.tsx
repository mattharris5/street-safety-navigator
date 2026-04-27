'use client';

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
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

// Recharts needs negative values to render bars below the axis
function toChart(d: DataPoint) {
  return { ...d, requestsNeg: -d.requests };
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const crashes = payload.find((p) => p.name === 'crashes')?.value ?? 0;
  const requests = Math.abs(payload.find((p) => p.name === 'requestsNeg')?.value ?? 0);
  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-md px-3 py-2 text-sm">
      <p className="font-medium text-stone-800 mb-1">{label}</p>
      <p className="text-red-600">{crashes} crash{crashes !== 1 ? 'es' : ''}</p>
      <p className="text-blue-600">{requests} 311 report{requests !== 1 ? 's' : ''}</p>
    </div>
  );
}

export default function CorridorChart({ data }: Props) {
  const router = useRouter();
  const chartData = data.map(toChart);
  const maxCrashes = Math.max(...data.map((d) => d.crashes), 1);
  const maxRequests = Math.max(...data.map((d) => d.requests), 1);
  const yMax = Math.ceil(maxCrashes * 1.1);
  const yMin = -Math.ceil(maxRequests * 1.1);

  function handleClick(entry: { slug?: string | null }) {
    if (entry?.slug) router.push(`/intersections/${entry.slug}`);
  }

  return (
    <div className="w-full bg-white border border-stone-200 rounded-xl p-4 overflow-x-auto">
      <div style={{ minWidth: data.length * 36 }}>
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 60, left: 28 }}
            onClick={(e) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const payload = (e as any)?.activePayload?.[0]?.payload;
              if (payload) handleClick(payload);
            }}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <ReferenceLine y={0} stroke="#78716c" strokeWidth={1.5} />
            <XAxis
              dataKey="name"
              angle={-55}
              textAnchor="end"
              tick={{ fontSize: 10, fill: '#78716c' }}
              interval={0}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fontSize: 10, fill: '#78716c' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => String(Math.abs(v))}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f4' }} />
            <Bar dataKey="crashes" maxBarSize={20} radius={[3, 3, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.crashes > 0 ? '#f87171' : '#fecaca'} />
              ))}
            </Bar>
            <Bar dataKey="requestsNeg" maxBarSize={20} radius={[0, 0, 3, 3]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.requestsNeg < 0 ? '#60a5fa' : '#bfdbfe'} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
