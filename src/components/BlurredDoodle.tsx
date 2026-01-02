import { useState } from 'react';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlurredDoodleProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  isBlurred: boolean;
  onReveal?: () => void;
}

/**
 * BlurredDoodle - A component that displays a doodle with an optional blur overlay.
 * When blurred, users can click to reveal the artwork.
 * Used for the "blur other users' doodles" privacy feature.
 */
export function BlurredDoodle({
  imageUrl,
  alt = 'Doodle',
  className,
  isBlurred,
  onReveal,
}: BlurredDoodleProps) {
  const [revealed, setRevealed] = useState(false);
  const showBlur = isBlurred && !revealed;

  const handleReveal = () => {
    setRevealed(true);
    onReveal?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <img
        src={imageUrl}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-all duration-300',
          showBlur && 'blur-xl scale-105'
        )}
      />
      {showBlur && (
        <button
          onClick={handleReveal}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm cursor-pointer transition-opacity hover:bg-black/40"
          aria-label="Click to reveal artwork"
        >
          <div className="flex flex-col items-center gap-2 text-white">
            <Eye className="h-8 w-8" />
            <span className="text-sm font-medium">Click to reveal</span>
          </div>
        </button>
      )}
    </div>
  );
}
