import { Button } from '@/components/ui/button';
import { type Prompt } from '@/hooks/use-google-sheets';
import {
  Share2,
  Copy,
  Check,
  Facebook,
  Twitter,
  Instagram,
  Link2,
  MessageCircle,
} from 'lucide-react';
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

interface SocialShareButtonsProps {
  prompt: Prompt;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  layout?: 'dropdown' | 'inline'; // New layout option
  showLabel?: boolean;
}

export function SocialShareButtons({
  prompt,
  className,
  variant = 'outline',
  size = 'default',
  layout = 'dropdown',
  showLabel = true,
}: SocialShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const recordShare = useAppStore((state) => state.recordShare);

  // Build share content
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/prompt/${prompt.id}`
      : '';

  const shareTitle = `Daily Doodle Prompt: ${prompt.title}`;
  const shareText = `${prompt.title}\n\n${prompt.description}\n\nTry it on Daily Doodle Prompt!`;
  const shareHashtags = 'DailyDoodlePrompt,ArtPrompt,DrawingChallenge';

  // UTM parameters for analytics
  const utmParams = '?utm_source=social&utm_medium=share&utm_campaign=prompt_share';
  const shareUrlWithUTM = `${shareUrl}${utmParams}`;

  const trackShare = useCallback(
    (platform: string) => {
      if (isAuthenticated) {
        recordShare(prompt.id, platform);
        toast.success(`Shared to ${platform}!`);
      } else {
        toast.info('Sign in to track your shares and earn badges!');
      }
    },
    [isAuthenticated, recordShare, prompt.id]
  );

  const handleNativeShare = useCallback(async () => {
    const shareData = {
      title: shareTitle,
      text: shareText,
      url: shareUrlWithUTM,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        trackShare('native');
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
          toast.error('Failed to share');
        }
      }
    }
  }, [shareTitle, shareText, shareUrlWithUTM, trackShare]);

  const handleCopyLink = useCallback(async () => {
    try {
      const textToCopy = `${shareText}\n\n${shareUrlWithUTM}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      trackShare('clipboard');
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy link');
    }
  }, [shareText, shareUrlWithUTM, trackShare]);

  const handleFacebookShare = useCallback(() => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrlWithUTM)}&quote=${encodeURIComponent(shareText)}`;
    window.open(fbUrl, '_blank', 'width=600,height=400');
    trackShare('facebook');
  }, [shareUrlWithUTM, shareText, trackShare]);

  const handleTwitterShare = useCallback(() => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrlWithUTM)}&hashtags=${encodeURIComponent(shareHashtags)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
    trackShare('twitter');
  }, [shareText, shareUrlWithUTM, trackShare]);

  const handleRedditShare = useCallback(() => {
    const redditUrl = `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrlWithUTM)}&title=${encodeURIComponent(shareTitle)}`;
    window.open(redditUrl, '_blank', 'width=800,height=600');
    trackShare('reddit');
  }, [shareUrlWithUTM, shareTitle, trackShare]);

  const handlePinterestShare = useCallback(() => {
    // Pinterest requires an image URL, so we'll use a placeholder or app logo
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrlWithUTM)}&description=${encodeURIComponent(shareText)}`;
    window.open(pinterestUrl, '_blank', 'width=600,height=400');
    trackShare('pinterest');
  }, [shareUrlWithUTM, shareText, trackShare]);

  const handleInstagramShare = useCallback(() => {
    // Instagram doesn't support direct sharing via web, so we copy the text and provide instructions
    const textToCopy = `${shareText}\n\n${shareUrlWithUTM}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        trackShare('instagram');
        toast.info(
          'Text copied! Open Instagram and paste it into a new post or story.',
          { duration: 5000 }
        );
      })
      .catch(() => {
        toast.error('Failed to copy text');
      });
  }, [shareText, shareUrlWithUTM, trackShare]);

  const canNativeShare =
    typeof navigator !== 'undefined' &&
    'share' in navigator &&
    'canShare' in navigator;

  // Inline layout - shows all buttons horizontally
  if (layout === 'inline') {
    return (
      <div className={cn('flex flex-wrap items-center gap-2', className)}>
        {showLabel && (
          <span className="text-sm text-muted-foreground mr-1">Share:</span>
        )}

        {canNativeShare && (
          <Button
            variant="outline"
            size="icon"
            onClick={handleNativeShare}
            title="Share via device"
            className="shrink-0"
          >
            <Share2 className="w-4 h-4" />
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={handleFacebookShare}
          title="Share on Facebook"
          className="shrink-0 hover:bg-blue-50 dark:hover:bg-blue-950"
        >
          <Facebook className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleTwitterShare}
          title="Share on X (Twitter)"
          className="shrink-0 hover:bg-sky-50 dark:hover:bg-sky-950"
        >
          <Twitter className="w-4 h-4 text-sky-500 dark:text-sky-400" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleRedditShare}
          title="Share on Reddit"
          className="shrink-0 hover:bg-orange-50 dark:hover:bg-orange-950"
        >
          <MessageCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handlePinterestShare}
          title="Share on Pinterest"
          className="shrink-0 hover:bg-red-50 dark:hover:bg-red-950"
        >
          <svg
            className="w-4 h-4 text-red-600 dark:text-red-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
          </svg>
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleInstagramShare}
          title="Share on Instagram (copy text)"
          className="shrink-0 hover:bg-pink-50 dark:hover:bg-pink-950"
        >
          <Instagram className="w-4 h-4 text-pink-600 dark:text-pink-400" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={handleCopyLink}
          title="Copy link to clipboard"
          className="shrink-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  // Dropdown layout - default for compact spaces
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={cn('gap-2', className)}>
          <Share2 className="w-4 h-4" />
          {size !== 'icon' && showLabel && 'Share'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {canNativeShare && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share via device
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={handleFacebookShare}>
          <Facebook className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          Share on Facebook
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleTwitterShare}>
          <Twitter className="w-4 h-4 mr-2 text-sky-500 dark:text-sky-400" />
          Share on X (Twitter)
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleRedditShare}>
          <MessageCircle className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
          Share on Reddit
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handlePinterestShare}>
          <svg
            className="w-4 h-4 mr-2 text-red-600 dark:text-red-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
          </svg>
          Share on Pinterest
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleInstagramShare}>
          <Instagram className="w-4 h-4 mr-2 text-pink-600 dark:text-pink-400" />
          Share on Instagram
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleCopyLink}>
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
