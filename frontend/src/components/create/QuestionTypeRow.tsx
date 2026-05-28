'use client';

import { X, ChevronDown } from 'lucide-react';
import { QuestionTypeConfig } from '@/types';
import { NumberStepper } from './NumberStepper';

const PRESET_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Answer Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False Questions',
  'Fill in the Blank',
  'Essay Questions',
  'Case Study Questions',
];

interface Props {
  config: QuestionTypeConfig;
  onRemove: () => void;
  onTypeChange: (type: string) => void;
  onCountChange: (count: number) => void;
  onMarksChange: (marks: number) => void;
  showRemove: boolean;
}

export function QuestionTypeRow({
  config,
  onRemove,
  onTypeChange,
  onCountChange,
  onMarksChange,
  showRemove,
}: Props) {
  return (
    <div className="flex items-center gap-3">
      {/* Dropdown */}
      <div className="relative flex-1">
        <select
          value={config.type}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-full pl-4 pr-9 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 cursor-pointer"
        >
          {PRESET_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      {/* Remove */}
      {showRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}

      {/* Count stepper */}
      <NumberStepper value={config.count} onChange={onCountChange} min={1} />

      {/* Marks stepper */}
      <NumberStepper value={config.marksPerQuestion} onChange={onMarksChange} min={1} />
    </div>
  );
}
