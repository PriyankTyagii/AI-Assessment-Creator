'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getResult, getAssignment, regenerateAssignment } from '@/lib/api';
import { Result, Assignment } from '@/types';
import { QuestionPaper } from '@/components/output/QuestionPaper';
import { downloadPDF } from '@/lib/pdfExport';
import { useGenerationStore } from '@/store/useGenerationStore';
import { GeneratingModal } from '@/components/create/GeneratingModal';
import { Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function OutputPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [result, setResult] = useState<Result | null>(null);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { reset: resetGeneration } = useGenerationStore();
  const printRef = useRef<HTMLDivElement | null>(null) as React.RefObject<HTMLDivElement>;

  useEffect(() => {
    async function load() {
      try {
        const [res, asgn] = await Promise.all([getResult(id), getAssignment(id)]);
        setResult(res);
        setAssignment(asgn);
      } catch {
        setError('Could not load question paper.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleDownloadPdf() {
    if (!result) return;
    setPdfLoading(true);
    try { await downloadPDF(result); } finally { setPdfLoading(false); }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await regenerateAssignment(id);
      resetGeneration();
      setShowModal(true);
    } finally {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  // Build intro message
  const introText = assignment
    ? `Certainly! Here are customized Question Paper for your ${assignment.className ? `Class ${assignment.className} ` : ''}${assignment.subject} ${assignment.title}:`
    : 'Here is your AI-generated question paper:';

  return (
    <div className="px-5 py-6">
      {/* Dark banner */}
      <div className="bg-gray-900 rounded-2xl px-6 py-4 mb-5 flex items-start justify-between gap-4">
        <p className="text-sm text-white font-medium leading-relaxed flex-1">{introText}</p>
        <button
          onClick={handleDownloadPdf}
          disabled={pdfLoading}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2 px-4 rounded-full transition-colors flex-shrink-0 border border-white/20"
        >
          {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download as PDF
        </button>
      </div>

      {/* Regenerate button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium py-2 px-4 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerate
        </button>
      </div>

      {/* Exam paper */}
      <QuestionPaper result={result} printRef={printRef} />

      {showModal && (
        <GeneratingModal
          assignmentId={id}
          onClose={() => { setShowModal(false); resetGeneration(); }}
        />
      )}
    </div>
  );
}
