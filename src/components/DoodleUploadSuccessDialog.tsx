import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DoodleImage } from '@/components/DoodleImage';
import {
  Twitter,
  Facebook,
  Link2,
  Check,
  PartyPopper,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoodleUploadSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  promptTitle: string;
}

export function DoodleUploadSuccessDialog({
  open,
  onOpenChange,
  imageUrl,
  promptTitle,
}: DoodleUploadSuccessDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `I just completed today's doodle prompt: "${promptTitle}" on Daily Doodle Prompt! 🎨\n\nJoin me:`;
  const shareUrl = 'https://www.dailydoodleprompt.com';

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `${shareText} ${shareUrl}`
    )}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleClose = () => {
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <PartyPopper className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            Doodle Uploaded!
          </DialogTitle>
          <DialogDescription className="text-center">
            Your artwork has been shared with the community
          </DialogDescription>
        </DialogHeader>

        {/* Doodle Preview */}
        <div className="flex justify-center my-4">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
            <DoodleImage
              src={imageUrl}
              alt={promptTitle}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Prompt Title */}
        <p className="text-center text-sm text-muted-foreground mb-4">
          <span className="font-medium text-foreground">{promptTitle}</span>
        </p>

        {/* Share Section */}
        <div className="space-y-3">
          <p className="text-center text-sm font-medium">
            Share your achievement!
          </p>

          <div className="flex justify-center gap-3">
            {/* Twitter/X */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleTwitterShare}
              className="flex-1 gap-2 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]"
            >
              <Twitter className="h-5 w-5" />
              Twitter
            </Button>

            {/* Facebook */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleFacebookShare}
              className="flex-1 gap-2 hover:bg-[#4267B2]/10 hover:text-[#4267B2] hover:border-[#4267B2]"
            >
              <Facebook className="h-5 w-5" />
              Facebook
            </Button>

            {/* Copy Link */}
            <Button
              variant="outline"
              size="lg"
              onClick={handleCopyLink}
              className={cn(
                'flex-1 gap-2',
                copied && 'bg-green-50 text-green-600 border-green-500 dark:bg-green-900/20'
              )}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Link2 className="h-5 w-5" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full text-muted-foreground"
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
