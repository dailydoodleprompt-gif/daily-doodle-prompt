import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface DoodleImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'auto';
  priority?: boolean; // If true, load eagerly (for above-the-fold images)
}

export function DoodleImage({ src, alt, className, aspectRatio = 'square', priority = false }: DoodleImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn(
      'relative bg-muted',
      aspectRatio === 'square' ? 'overflow-hidden aspect-square' : 'flex items-center justify-center',
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
          'object-contain transition-opacity duration-300',
          aspectRatio === 'square' ? 'w-full h-full' : 'w-auto h-auto max-w-full max-h-full',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
