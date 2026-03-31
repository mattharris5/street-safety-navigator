'use client';

import { useState, useEffect } from 'react';
import ProjectList from '@/components/admin/ProjectList';
import ProjectForm from '@/components/admin/ProjectForm';
import type { Project } from '@/lib/types';
import { BRAND } from '@/lib/constants';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin-token');
    if (saved) {
      setToken(saved);
      fetchProjects(saved);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const { token: t } = await res.json();
      sessionStorage.setItem('admin-token', t);
      setToken(t);
      fetchProjects(t);
    } else {
      setAuthError('Invalid password');
    }
  }

  async function fetchProjects(t: string) {
    setLoading(true);
    const res = await fetch('/api/projects', {
      headers: { 'x-admin-token': t },
    });
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }

  async function handleSave(project: Project) {
    const method = editingProject ? 'PUT' : 'POST';
    await fetch('/api/projects', {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': token! },
      body: JSON.stringify(project),
    });
    await fetchProjects(token!);
    setShowForm(false);
    setEditingProject(null);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/projects?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': token! },
    });
    await fetchProjects(token!);
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-700 text-white flex items-center justify-center font-bold">S</div>
            <div>
              <h1 className="font-semibold text-slate-800">{BRAND.name}</h1>
              <p className="text-xs text-slate-500">Admin Panel</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Admin password"
                autoFocus
              />
              {authError && <p className="text-red-500 text-xs mt-1">{authError}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-green-700 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-800 transition-colors"
            >
              Sign In
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/" className="text-xs text-slate-400 hover:text-slate-600">← Back to map</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
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
          <button
            onClick={() => { sessionStorage.removeItem('admin-token'); setToken(null); }}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
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
