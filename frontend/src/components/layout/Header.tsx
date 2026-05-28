'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { BookOpen, PlusCircle, LayoutDashboard } from 'lucide-react';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="h-16 bg-surface-2 border-b border-slate-700/50 flex items-center px-6 gap-6 sticky top-0 z-40">
      <Link href="/" className="flex items-center gap-2.5 font-bold text-white text-lg">
        <BookOpen className="w-6 h-6 text-primary-500" />
        <span>VedaAI</span>
        <span className="text-slate-400 font-normal text-sm hidden sm:inline">Assessment Creator</span>
      </Link>

      <nav className="flex items-center gap-1 ml-auto">
        <Link
          href="/"
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === '/'
              ? 'bg-primary-600/20 text-primary-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-3'
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <Link
          href="/create"
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
            pathname === '/create'
              ? 'bg-primary-600/20 text-primary-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-surface-3'
          )}
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Create</span>
        </Link>
      </nav>
    </header>
  );
}
