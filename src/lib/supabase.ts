import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type ProjectRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  description: string;
  lng: number;
  lat: number;
  side: string;
  span_meters: number | null;
  images: string[];
  links: { label: string; url: string }[];
  date: string | null;
  tags: string[];
  sponsor: string | null;
};

export const BUCKET = 'project-images';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<any> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );
  }
  return _client;
}
