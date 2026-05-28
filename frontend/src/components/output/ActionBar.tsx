'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Download, ArrowLeft } from 'lucide-react';
import { regenerateAssignment } from '@/lib/api';
import { useGenerationStore } from '@/store/useGenerationStore';
import { Button } from '@/components/ui/Button';
import { GeneratingModal } from '@/components/create/GeneratingModal';

interface Props {
  assignmentId: string;
  onDownloadPdf: () => void;
  pdfLoading?: boolean;
}

export function ActionBar({ assignmentId, onDownloadPdf, pdfLoading }: Props) {
  const router = useRouter();
  const { reset: resetGeneration } = useGenerationStore();
  const [regenerating, setRegenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      await regenerateAssignment(assignmentId);
      resetGeneration();
      setShowModal(true);
    } catch {
      // silently fail — user can retry
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <>
      <div className="no-print sticky top-16 z-30 bg-surface-2/90 backdrop-blur border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRegenerate}
              loading={regenerating}
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
            <Button size="sm" onClick={onDownloadPdf} loading={pdfLoading}>
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {showModal && (
        <GeneratingModal
          assignmentId={assignmentId}
          onClose={() => { setShowModal(false); resetGeneration(); }}
        />
      )}
    </>
  );
}
