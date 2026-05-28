'use client';

import { useEffect } from 'react';
import { clsx } from 'clsx';
import { CheckCircle, XCircle } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGenerationStore } from '@/store/useGenerationStore';
import { getResult } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Props {
  assignmentId: string;
  onClose: () => void;
}

export function GeneratingModal({ assignmentId, onClose }: Props) {
  const router = useRouter();
  const { status, percent, message, error, handleWSEvent, setResult, setStatus } =
    useGenerationStore();

  const { disconnect } = useWebSocket({
    assignmentId,
    onEvent: async (event) => {
      handleWSEvent(event);
      if (event.type === 'completed') {
        try {
          const result = await getResult(assignmentId);
          setResult(result);
          disconnect();
          setTimeout(() => router.push(`/output/${assignmentId}`), 600);
        } catch {
          setStatus('failed');
        }
      }
    },
    onOpen: () => setStatus('generating'),
  });

  useEffect(() => { setStatus('connecting'); }, [setStatus]);

  const isFailed = status === 'failed';
  const isComplete = status === 'completed';

  const steps = [
    { label: 'Preparing prompt', threshold: 10 },
    { label: 'Generating with AI', threshold: 30 },
    { label: 'Structuring output', threshold: 80 },
    { label: 'Saving results', threshold: 95 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex flex-col items-center gap-5">
          {/* Icon */}
          {isComplete ? (
            <CheckCircle className="w-14 h-14 text-green-500" />
          ) : isFailed ? (
            <XCircle className="w-14 h-14 text-red-500" />
          ) : (
            <div className="relative w-14 h-14">
              <div className="w-14 h-14 rounded-full border-4 border-gray-100 border-t-brand animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-brand text-lg">✦</div>
            </div>
          )}

          <div className="text-center">
            <h2 className="text-lg font-bold text-gray-900">
              {isComplete ? 'Paper Generated!' : isFailed ? 'Generation Failed' : 'Generating Paper…'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isFailed ? error : message || 'Connecting…'}
            </p>
          </div>

          {!isFailed && (
            <div className="w-full">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    'h-full rounded-full transition-all duration-500',
                    isComplete ? 'bg-green-500' : 'bg-brand'
                  )}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Progress</span>
                <span>{percent}%</span>
              </div>
            </div>
          )}

          {!isFailed && !isComplete && (
            <ul className="w-full space-y-1.5">
              {steps.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-sm">
                  <span className={clsx('w-2 h-2 rounded-full flex-shrink-0', percent >= s.threshold ? 'bg-brand' : 'bg-gray-200')} />
                  <span className={percent >= s.threshold ? 'text-gray-700' : 'text-gray-400'}>{s.label}</span>
                </li>
              ))}
            </ul>
          )}

          {isFailed && (
            <button
              onClick={onClose}
              className="bg-gray-900 text-white text-sm font-medium py-2 px-6 rounded-full hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
