'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import ProjectList from '@/components/admin/ProjectList';
import ProjectForm from '@/components/admin/ProjectForm';
import type { Project, Intersection } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';

function AdminPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [session, setSession] = useState<Session | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [intersections, setIntersections] = useState<Intersection[]>([]);
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

    fetch('/api/intersections').then((r) => r.ok ? r.json() : []).then(setIntersections);

    return () => subscription.unsubscribe();
  }, [router]);

  // Auto-open edit form when ?edit=id is in URL
  useEffect(() => {
    if (editId && projects.length > 0 && !editingProject && !showForm) {
      const p = projects.find((proj) => proj.id === editId);
      if (p) setEditingProject(p);
    }
  }, [editId, projects]);

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
              intersections={intersections}
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
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSignOut}
                  className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  Sign out
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
                >
                  + Add Project
                </button>
              </div>
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

export default function AdminPage() {
  return (
    <Suspense>
      <AdminPageInner />
    </Suspense>
  );
}
