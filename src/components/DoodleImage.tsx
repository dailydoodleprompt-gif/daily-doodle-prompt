import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface DoodleImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'auto';
}

export function DoodleImage({ src, alt, className, aspectRatio = 'square' }: DoodleImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn(
      'relative overflow-hidden bg-muted',
      aspectRatio === 'square' && 'aspect-square',
      className
    )}>
      {/* Skeleton placeholder while loading */}
      {isLoading && !hasError && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          'w-full h-full object-contain transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
