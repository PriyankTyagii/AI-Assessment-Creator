import Image from 'next/image';

interface VedaLogoProps {
  size?: 'sm' | 'md';
  showText?: boolean;
}

export function VedaLogo({ size = 'md', showText = true }: VedaLogoProps) {
  const dimension = size === 'sm' ? 32 : 36;
  const textSize = size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/Component 1.png"
        alt="VedaAI logo"
        width={dimension}
        height={dimension}
        className="rounded-xl flex-shrink-0"
        priority
      />
      {showText && (
        <span className={`font-bold text-gray-900 ${textSize}`}>VedaAI</span>
      )}
    </div>
  );
}
