'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Users,
  FileText,
  Cpu,
  BookOpen,
  Settings,
  Sparkles,
} from 'lucide-react';
import { VedaLogo } from './VedaLogo';

const NAV_ITEMS = [
  { label: 'Home', icon: LayoutDashboard, href: '/' },
  { label: 'My Groups', icon: Users, href: '/groups' },
  { label: 'Assignments', icon: FileText, href: '/assignments', badge: true },
  { label: "AI Teacher's Toolkit", icon: Cpu, href: '/toolkit' },
  { label: 'My Library', icon: BookOpen, href: '/library' },
];

interface SidebarProps {
  assignmentCount?: number;
}

export function Sidebar({ assignmentCount }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="hidden md:flex w-60 flex-shrink-0 bg-white h-screen flex-col border-r border-gray-100 sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <VedaLogo size="md" />
      </div>

      {/* Create Assignment button */}
      <div className="px-4 mb-5">
        <button
          onClick={() => router.push('/create')}
          className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-4 rounded-full transition-colors"
        >
          <Sparkles className="w-4 h-4 text-brand" />
          Create Assignment
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isAssignments = item.label === 'Assignments';
          const isActive = isAssignments
            ? pathname === '/assignments' || pathname.startsWith('/output') || pathname.startsWith('/create')
            : pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={clsx(
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group',
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={clsx('w-4 h-4', isActive ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600')} />
                <span>{item.label}</span>
              </div>
              {item.badge && assignmentCount != null && assignmentCount > 0 && (
                <span className="bg-brand text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {assignmentCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 flex flex-col gap-2">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          Settings
        </Link>

        {/* School card */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
            DPS
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-900 truncate">Delhi Public School</p>
            <p className="text-xs text-gray-500 truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
