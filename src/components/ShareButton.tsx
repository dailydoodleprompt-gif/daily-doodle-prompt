import { Button } from '@/components/ui/button';
import { type Prompt } from '@/hooks/use-google-sheets';
import { Share2, Copy, Check, Facebook, Twitter, MessageCircle } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore, useIsAuthenticated } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Check if device is mobile for native share (desktop shows system apps, not social media)
const isMobileDevice = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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

  const handleFacebookShare = useCallback(() => {
    if (!shareData) return;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.text)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
    trackShare('facebook');
  }, [shareData, trackShare]);

  const handleTwitterShare = useCallback(() => {
    if (!shareData) return;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}&hashtags=DailyDoodlePrompt`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    trackShare('twitter');
  }, [shareData, trackShare]);

  const handleRedditShare = useCallback(() => {
    if (!shareData) return;
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}`;
    window.open(redditUrl, '_blank', 'width=800,height=600');
    trackShare('reddit');
  }, [shareData, trackShare]);

  // Only use native share on mobile devices - desktop shows system utilities instead of social media
  const canNativeShare =
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator &&
    isMobileDevice();

  if (!shareData) return null;

  // On mobile, use native share for best UX
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

  // On desktop, show dropdown with social media options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn('gap-2', className)}>
          <Share2 className="w-4 h-4" />
          {size !== 'icon' && 'Share'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={handleFacebookShare}>
          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="w-4 h-4 mr-2 text-sky-500" />
          Share on X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleRedditShare}>
          <MessageCircle className="w-4 h-4 mr-2 text-orange-600" />
          Share on Reddit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
