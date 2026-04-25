'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { href: '/', label: 'Map' },
  { href: '/projects', label: 'Master Plan' },
  { href: '/intersections', label: 'Intersections' },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="flex-shrink-0 bg-white/95 backdrop-blur-md border-b border-stone-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-full bg-green-800 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={16} className="text-white" strokeWidth={2} />
          </div>
          <div className="leading-none">
            <span
              className="block text-[15px] font-semibold text-stone-900 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Safe Streets Bernal
            </span>
            <span className="block text-[10px] text-stone-400 tracking-wide uppercase mt-0.5">
              Cortland Ave
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'text-green-800 bg-green-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                )}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Sign in placeholder — wired in auth phase */}
          <Link
            href="/admin"
            className="hidden sm:inline-flex text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-md hover:bg-stone-100 transition-colors"
          >
            Admin
          </Link>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-stone-500 hover:bg-stone-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-stone-100 bg-white px-4 py-2 flex flex-col gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  active
                    ? 'text-green-800 bg-green-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                )}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className="px-3 py-2 rounded-md text-sm text-stone-500 hover:bg-stone-100 transition-colors"
          >
            Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
