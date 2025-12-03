import { Button } from '@/components/ui/button';
import { type Prompt } from '@/hooks/use-google-sheets';
import { Share2, Copy, Check } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore, useIsAuthenticated } from '@/store/app-store';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  prompt: Prompt;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ShareButton({
  prompt,
  className,
  variant = 'outline',
  size = 'default',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const recordShare = useAppStore((state) => state.recordShare);

  const shareText = `Today's drawing prompt: "${prompt.title}" - ${prompt.description} #DailyDoodlePrompt @DailyDoodlePrompt`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const trackShare = useCallback((platform: string) => {
    if (isAuthenticated) {
      recordShare(prompt.id, platform);
    }
  }, [isAuthenticated, recordShare, prompt.id]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `DailyDoodlePrompt: ${prompt.title}`,
      text: shareText,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        trackShare('native');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  }, [prompt.title, shareText, shareUrl, trackShare]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
      setCopied(true);
      trackShare('clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shareText, shareUrl, trackShare]);

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator;

  if (canNativeShare) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={cn('gap-2', className)}
      >
        <Share2 className="w-4 h-4" />
        {size !== 'icon' && 'Share'}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn('gap-2', className)}>
          <Share2 className="w-4 h-4" />
          {size !== 'icon' && 'Share'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy to clipboard
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
