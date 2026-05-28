import { create } from 'zustand';
import { Result, WSEvent } from '@/types';

type GenerationStatus = 'idle' | 'connecting' | 'generating' | 'completed' | 'failed';

interface GenerationStore {
  status: GenerationStatus;
  percent: number;
  message: string;
  error: string | null;
  result: Result | null;
  setStatus: (status: GenerationStatus) => void;
  setProgress: (percent: number, message: string) => void;
  setResult: (result: Result) => void;
  setError: (error: string) => void;
  handleWSEvent: (event: WSEvent) => void;
  reset: () => void;
}

export const useGenerationStore = create<GenerationStore>((set) => ({
  status: 'idle',
  percent: 0,
  message: '',
  error: null,
  result: null,

  setStatus: (status) => set({ status }),
  setProgress: (percent, message) => set({ percent, message }),
  setResult: (result) => set({ result, status: 'completed' }),
  setError: (error) => set({ error, status: 'failed' }),

  handleWSEvent: (event: WSEvent) => {
    if (event.type === 'progress') {
      set({ status: 'generating', percent: event.percent ?? 0, message: event.message ?? '' });
    } else if (event.type === 'completed') {
      set({ percent: 100, message: 'Complete!' });
    } else if (event.type === 'failed') {
      set({ status: 'failed', error: event.error ?? 'Generation failed' });
    }
  },

  reset: () =>
    set({ status: 'idle', percent: 0, message: '', error: null, result: null }),
}));
