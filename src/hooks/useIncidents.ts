'use client';

import { useEffect, useState } from 'react';
import type { Incident } from '@/lib/types';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/incidents.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setIncidents(Array.isArray(data) ? data : []))
      .catch(() => setIncidents([]))
      .finally(() => setLoading(false));
  }, []);

  return { incidents, loading };
}
