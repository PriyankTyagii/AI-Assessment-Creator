import { clsx } from 'clsx';

interface Props {
  difficulty: 'easy' | 'medium' | 'hard';
  size?: 'sm' | 'md';
}

const styles = {
  easy: 'bg-emerald-50 text-emerald-700 border border-emerald-200 print:bg-emerald-50',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200 print:bg-amber-50',
  hard: 'bg-red-50 text-red-700 border border-red-200 print:bg-red-50',
};

const labels = { easy: 'Easy', medium: 'Moderate', hard: 'Hard' };

export function DifficultyBadge({ difficulty, size = 'sm' }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        styles[difficulty]
      )}
    >
      {labels[difficulty]}
    </span>
  );
}
