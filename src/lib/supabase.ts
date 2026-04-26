import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client using service role key — never expose to the browser
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const BUCKET = 'project-images';
