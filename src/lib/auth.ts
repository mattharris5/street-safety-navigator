import { NextRequest } from 'next/server';
import { getSupabase } from './supabase';

const ADMIN_EMAILS = (process.env.ADMIN_EMAIL ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function isAdmin(req: NextRequest): Promise<boolean> {
  const token = req.headers.get('x-admin-token');
  if (!token) return false;
  const { data: { user } } = await getSupabase().auth.getUser(token);
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}
