interface VedaLogoProps {
  size?: 'sm' | 'md';
  showText?: boolean;
}

export function VedaLogo({ size = 'md', showText = true }: VedaLogoProps) {
  const boxSize = size === 'sm' ? 'w-8 h-8 rounded-lg' : 'w-9 h-9 rounded-xl';
  const textSize = size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${boxSize} bg-gray-900 flex items-center justify-center flex-shrink-0 shadow-sm`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'}
          aria-hidden="true"
        >
          <path
            d="M4 5L12 19L20 5"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${textSize}`}>VedaAI</span>
      )}
    </div>
  );
}
