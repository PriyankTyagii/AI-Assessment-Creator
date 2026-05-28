'use client';

interface Props {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}

export function NumberStepper({ value, onChange, min = 1, max = 99 }: Props) {
  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 select-none">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors font-medium text-base leading-none"
        disabled={value <= min}
      >
        −
      </button>
      <span className="text-sm font-medium w-5 text-center text-gray-800">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors font-medium text-base leading-none"
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
}
