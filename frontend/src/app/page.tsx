'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { listAssignments, deleteAssignment } from '@/lib/api';
import { Assignment } from '@/types';
import { format } from 'date-fns';
import {
  Filter,
  Search,
  Plus,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { clsx } from 'clsx';

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-6 px-8">
      {/* Illustration placeholder */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gray-200/60" />
        <div className="relative w-28 h-32 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-3 gap-2">
          <div className="h-2 w-16 bg-gray-800 rounded-full" />
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-full bg-gray-200 rounded-full" />
          <div className="h-1.5 w-3/4 bg-gray-200 rounded-full" />
          <div className="mt-auto flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <div className="h-2 w-10 bg-gray-200 rounded-full" />
          </div>
        </div>
        {/* Magnifying glass overlay */}
        <div className="absolute -right-3 -bottom-1 w-16 h-16 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-gray-300 relative">
            <div className="absolute -bottom-2 -right-2 w-3 h-1 bg-gray-300 rounded-full rotate-45" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 text-red-500 font-bold text-lg">✕</div>
          </div>
        </div>
        {/* Sparkle */}
        <div className="absolute left-2 top-12 text-blue-400 text-xl">✦</div>
        <div className="absolute -top-2 right-8 w-2 h-2 rounded-full bg-blue-400" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">No assignments yet</h2>
        <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
          Create your first assignment to start collecting and grading student submissions.
          You can set up rubrics, define marking criteria, and let AI assist with grading.
        </p>
      </div>

      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Create Your First Assignment
      </button>
    </div>
  );
}

interface CardMenuProps {
  assignmentId: string;
  onView: () => void;
  onDelete: () => void;
}

function CardMenu({ assignmentId, onView, onDelete }: CardMenuProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    try {
      await deleteAssignment(assignmentId);
      setOpen(false);
      onDelete();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o); }}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={(e) => { e.preventDefault(); setOpen(false); onView(); }}
          >
            View Assignment
          </button>
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  );
}

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Processing', value: 'processing' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
];

export default function HomePage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listAssignments()
      .then((res) => setAssignments(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = assignments.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-7 h-7 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 relative min-h-full">
      {/* Page header */}
      <div className="mb-5 flex items-start gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assignments</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and create assignments for your classes.</p>
        </div>
      </div>

      {assignments.length === 0 ? (
        <EmptyState onCreateClick={() => router.push('/create')} />
      ) : (
        <>
          {/* Filter + Search */}
          <div className="flex items-center justify-between gap-4 mb-5">
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={clsx(
                  'flex items-center gap-2 text-sm transition-colors bg-white rounded-full px-4 py-2 border shadow-sm',
                  statusFilter
                    ? 'text-gray-900 border-gray-400 font-medium'
                    : 'text-gray-600 hover:text-gray-900 border-gray-200'
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                {statusFilter ? STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label : 'Filter By'}
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-10 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[150px]">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setStatusFilter(opt.value); setFilterOpen(false); }}
                      className={clsx(
                        'w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50',
                        statusFilter === opt.value ? 'text-gray-900 font-semibold' : 'text-gray-600'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search Assignment"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 w-56 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
            {filtered.map((a) => (
              <div
                key={a._id}
                className="bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer hover:shadow-sm transition-shadow group"
                onClick={() => a.status === 'completed' && router.push(`/output/${a._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h2 className={clsx(
                    'font-bold text-gray-900 text-base leading-snug group-hover:text-brand transition-colors',
                    a.status === 'completed' && 'underline underline-offset-2'
                  )}>
                    {a.title}
                  </h2>
                  <CardMenu
                    assignmentId={a._id}
                    onView={() => router.push(`/output/${a._id}`)}
                    onDelete={() => setAssignments((prev) => prev.filter((x) => x._id !== a._id))}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    <span className="font-medium text-gray-600">Assigned on</span> :{' '}
                    {format(new Date(a.createdAt), 'dd-MM-yyyy')}
                  </span>
                  {a.dueDate && (
                    <span>
                      <span className="font-medium text-gray-600">Due</span> :{' '}
                      {format(new Date(a.dueDate), 'dd-MM-yyyy')}
                    </span>
                  )}
                </div>

                {a.status === 'processing' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Generating…
                  </div>
                )}
                {a.status === 'failed' && (
                  <p className="mt-2 text-xs text-red-500">Generation failed</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Floating CTA */}
      {assignments.length > 0 && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-30 md:[margin-left:7.5rem]">
          <button
            onClick={() => router.push('/create')}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      )}
    </div>
  );
}
