'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Cpu } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { label: 'Home', icon: LayoutDashboard, href: '/' },
  { label: 'My Groups', icon: Users, href: '/groups' },
  { label: 'Assignments', icon: FileText, href: '/assignments' },
  { label: 'AI Toolkit', icon: Cpu, href: '/toolkit' },
];

function isActive(pathname: string, label: string, href: string): boolean {
  if (label === 'Assignments') {
    return (
      pathname === '/assignments' ||
      pathname.startsWith('/output') ||
      pathname.startsWith('/create')
    );
  }
  if (label === 'Home') return pathname === '/';
  return pathname.startsWith(href);
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-gray-900 flex items-center h-16">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.label, item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2"
          >
            <item.icon
              className={clsx('w-5 h-5', active ? 'text-white' : 'text-gray-500')}
            />
            <span
              className={clsx(
                'text-[10px] font-medium leading-none',
                active ? 'text-white' : 'text-gray-500'
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
