'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 gap-8">
      {/* Illustration */}
      <div className="relative w-52 h-52 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gray-200/60" />

        {/* Document */}
        <div className="relative w-28 h-36 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-3 gap-2 z-10">
          <div className="h-2 w-16 bg-gray-800 rounded-full" />
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-3/4 bg-gray-200 rounded-full" />
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-1/2 bg-gray-200 rounded-full" />
          {/* Big X overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-black text-red-400/30 select-none">✕</span>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute -right-2 -bottom-2 w-14 h-14 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center z-20">
          <span className="text-xl font-black text-red-500">!</span>
        </div>

        {/* Sparkles */}
        <div className="absolute left-2 top-10 text-blue-400 text-xl">✦</div>
        <div className="absolute -top-1 right-10 w-2 h-2 rounded-full bg-blue-400" />
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="text-6xl font-black text-gray-900 mb-2 tracking-tight">404</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">This page could not be found.</h1>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
          The page you're looking for doesn't exist or may have been moved. Check the URL or head back home.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-6 rounded-full border border-gray-200 shadow-sm transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-full shadow-sm transition-colors text-sm"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
