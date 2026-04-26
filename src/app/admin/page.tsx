'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ProjectList from '@/components/admin/ProjectList';
import ProjectForm from '@/components/admin/ProjectForm';
import type { Project } from '@/lib/types';
import { BRAND } from '@/lib/constants';
import type { Session } from '@supabase/supabase-js';

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) { router.replace('/login?redirect=/admin'); return; }
      setSession(s);
      fetchProjects(s.access_token);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!s) router.replace('/login?redirect=/admin');
      else setSession(s);
    });
    return () => subscription.unsubscribe();
  }, [router]);

  async function fetchProjects(token: string) {
    setLoading(true);
    const res = await fetch('/api/projects', { headers: { 'x-admin-token': token } });
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }

  async function handleSave(project: Project) {
    const method = editingProject ? 'PUT' : 'POST';
    await fetch('/api/projects', {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': session!.access_token },
      body: JSON.stringify(project),
    });
    await fetchProjects(session!.access_token);
    setShowForm(false);
    setEditingProject(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': session!.access_token },
    });
    await fetchProjects(session!.access_token);
  }

  async function handleSignOut() {
    await createClient().auth.signOut();
    router.replace('/login');
  }

  if (!session) return null;

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-700 text-white flex items-center justify-center font-bold text-sm">S</div>
          <div>
            <h1 className="font-semibold text-slate-800 text-sm">{BRAND.name} — Admin</h1>
            <p className="text-xs text-slate-500">Manage safety improvement projects</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-xs text-slate-500 hover:text-slate-700">← View map</a>
          <button onClick={handleSignOut} className="text-xs text-slate-400 hover:text-slate-600">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {showForm || editingProject ? (
          <div>
            <button
              onClick={() => { setShowForm(false); setEditingProject(null); }}
              className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1"
            >
              ← Back to projects
            </button>
            <ProjectForm
              project={editingProject ?? undefined}
              adminToken={session.access_token}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditingProject(null); }}
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800">
                Projects <span className="text-slate-400 font-normal text-base">({projects.length})</span>
              </h2>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
              >
                + Add Project
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12 text-slate-400">Loading…</div>
            ) : (
              <ProjectList
                projects={projects}
                onEdit={(p) => setEditingProject(p)}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
