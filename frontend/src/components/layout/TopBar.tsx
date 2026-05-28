'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, ChevronDown, LayoutGrid, Menu } from 'lucide-react';
import { VedaLogo } from './VedaLogo';

interface TopBarProps {
  showBack?: boolean;
  breadcrumb?: string;
}

export function TopBar({ showBack = true, breadcrumb = 'Assignment' }: TopBarProps) {
  const router = useRouter();

  return (
    <>
      {/* Mobile top bar */}
      <header className="md:hidden h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3 sticky top-0 z-40 flex-shrink-0">
        <div className="flex items-center flex-1">
          <VedaLogo size="sm" />
        </div>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          JD
        </div>

        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Desktop top bar */}
      <header className="hidden md:flex h-14 bg-white border-b border-gray-100 items-center px-5 gap-3 sticky top-0 z-40 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <LayoutGrid className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500 font-medium">{breadcrumb}</span>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <button className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              JD
            </div>
            <span className="text-sm font-medium text-gray-700">John Doe</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        </div>
      </header>
    </>
  );
}
