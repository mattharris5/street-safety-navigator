import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'project-images';

let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );
  }
  return _client;
}
