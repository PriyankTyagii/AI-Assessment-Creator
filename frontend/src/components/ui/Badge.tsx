import { clsx } from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-slate-700 text-slate-300',
  success: 'bg-emerald-900/60 text-emerald-400 border border-emerald-800',
  warning: 'bg-amber-900/60 text-amber-400 border border-amber-800',
  danger: 'bg-red-900/60 text-red-400 border border-red-800',
  info: 'bg-blue-900/60 text-blue-400 border border-blue-800',
  pending: 'bg-slate-700/60 text-slate-400 border border-slate-600',
};

export function Badge({ label, variant = 'default', size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantStyles[variant]
      )}
    >
      {label}
    </span>
  );
}
