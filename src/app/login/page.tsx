'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BRAND } from '@/lib/constants';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback?next=/admin` },
    });
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-green-800 text-white flex items-center justify-center">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-stone-800">{BRAND.name}</h1>
            <p className="text-xs text-stone-500">Admin access</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <p className="text-stone-700 font-medium mb-1">Check your email</p>
            <p className="text-sm text-stone-500">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                placeholder="you@example.com"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-900 transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send sign-in link'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <a href="/" className="text-xs text-stone-400 hover:text-stone-600">← Back to map</a>
        </div>
      </div>
    </div>
  );
}
