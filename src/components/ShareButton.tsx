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
import { toast } from 'sonner';

// Base share button props for all share types
interface BaseShareButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

// Props for sharing a prompt
interface PromptShareButtonProps extends BaseShareButtonProps {
  type: 'prompt';
  prompt: Prompt;
}

// Props for sharing a doodle
interface DoodleShareButtonProps extends BaseShareButtonProps {
  type: 'doodle';
  doodleId: string;
  promptTitle: string;
  artistName?: string;
}

// Props for sharing a profile
interface ProfileShareButtonProps extends BaseShareButtonProps {
  type: 'profile';
  username: string;
  userId?: string;
}

// Legacy props for backwards compatibility
interface LegacyShareButtonProps extends BaseShareButtonProps {
  prompt: Prompt;
  type?: never;
}

type ShareButtonProps =
  | PromptShareButtonProps
  | DoodleShareButtonProps
  | ProfileShareButtonProps
  | LegacyShareButtonProps;

export function ShareButton(props: ShareButtonProps) {
  const { className, variant = 'outline', size = 'default' } = props;
  const [copied, setCopied] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const recordShare = useAppStore((state) => state.recordShare);

  // Determine share type and generate URLs
  const getShareData = useCallback(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dailydoodleprompt.com';

    // Legacy or prompt type
    if (!('type' in props) || props.type === 'prompt') {
      const prompt = 'prompt' in props ? props.prompt : null;
      if (!prompt) return null;

      return {
        title: `DailyDoodlePrompt: ${prompt.title}`,
        text: `Today's drawing prompt: "${prompt.title}" - ${prompt.description} #DailyDoodlePrompt`,
        url: `${baseUrl}/prompt/${prompt.publish_date}`,
        ogUrl: `${baseUrl}/api/og/prompt?title=${encodeURIComponent(prompt.title)}&category=${encodeURIComponent(prompt.category)}&date=${prompt.publish_date}`,
        promptId: prompt.id,
      };
    }

    if (props.type === 'doodle') {
      return {
        title: `"${props.promptTitle}" by ${props.artistName || 'an artist'}`,
        text: `Check out this doodle for "${props.promptTitle}" on Daily Doodle Prompt! #DailyDoodlePrompt`,
        url: `${baseUrl}/doodle/${props.doodleId}`,
        ogUrl: `${baseUrl}/api/og/doodle?id=${props.doodleId}`,
        promptId: null,
      };
    }

    if (props.type === 'profile') {
      return {
        title: `${props.username}'s Profile on Daily Doodle Prompt`,
        text: `Check out ${props.username}'s creative journey on Daily Doodle Prompt! #DailyDoodlePrompt`,
        url: `${baseUrl}/profile/${props.userId || props.username}`,
        ogUrl: `${baseUrl}/api/og/profile?username=${encodeURIComponent(props.username)}`,
        promptId: null,
      };
    }

    return null;
  }, [props]);

  const shareData = getShareData();

  const trackShare = useCallback((platform: string) => {
    if (isAuthenticated && shareData?.promptId) {
      recordShare(shareData.promptId, platform);
    }
  }, [isAuthenticated, recordShare, shareData?.promptId]);

  const handleShare = useCallback(async () => {
    if (!shareData) return;

    const nativeShareData = {
      title: shareData.title,
      text: shareData.text,
      url: shareData.url,
    };

    if (navigator.share && navigator.canShare?.(nativeShareData)) {
      try {
        await navigator.share(nativeShareData);
        trackShare('native');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    }
  }, [shareData, trackShare]);

  const handleCopy = useCallback(async () => {
    if (!shareData) return;

    try {
      await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
      setCopied(true);
      trackShare('clipboard');
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  }, [shareData, trackShare]);

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator;

  if (!shareData) return null;

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
