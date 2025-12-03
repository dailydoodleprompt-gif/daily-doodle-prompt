import { useState } from 'react';
import { type Prompt } from '@/hooks/use-google-sheets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAppStore, useIsAuthenticated } from '@/store/app-store';
import { DoodleUpload } from '@/components/DoodleUpload';
import { DoodleGallery } from '@/components/DoodleGallery';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { cn } from '@/lib/utils';
import { formatPublishedDate } from '@/lib/timezone';
import {
  Star,
  Palette,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface PromptDetailDialogProps {
  prompt: Prompt | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShare?: () => void;
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (category: string) => void;
}

export function PromptDetailDialog({
  prompt,
  open,
  onOpenChange,
  onShare,
  onTagClick,
  onCategoryClick,
}: PromptDetailDialogProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const { user, addBookmark, removeBookmark, isBookmarked, getAppSettings, getPromptDoodles } = useAppStore();
  const isAuthenticated = useIsAuthenticated();
  const bookmarked = prompt ? isBookmarked(prompt.id) : false;
  const isPremium = user?.is_premium ?? false;
  const tagsEnabled = getAppSettings().tags_enabled;

  const handleBookmarkClick = () => {
    if (!user || !prompt) return;
    if (!isPremium) return;

    if (bookmarked) {
      removeBookmark(prompt.id);
    } else {
      addBookmark(prompt.id);
    }
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick?.(tag);
    onOpenChange(false);
  };

  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    onCategoryClick?.(category);
    onOpenChange(false);
  };

  const handleUploadSuccess = () => {
    setRefreshKey(k => k + 1);
    toast.success('Doodle uploaded successfully!');
  };

  if (!prompt) return null;

  // Get doodles for this prompt
  const promptDoodles = getPromptDoodles(prompt.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
        <DialogHeader>
          <div className="space-y-2">
            <DialogTitle className="text-xl leading-normal">
              {prompt.title}
            </DialogTitle>
            {tagsEnabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Palette className="w-4 h-4" />
                  <Badge
                    variant="outline"
                    className={cn(onCategoryClick && "cursor-pointer hover:bg-primary/10")}
                    onClick={onCategoryClick ? (e) => handleCategoryClick(e, prompt.category) : undefined}
                  >
                    {prompt.category}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <DialogDescription className="sr-only">
            Full prompt details for {prompt.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Full Description */}
          <div>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {prompt.description}
            </p>
          </div>

          {/* Tags */}
          {tagsEnabled && (
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(onTagClick && "cursor-pointer hover:bg-secondary/80")}
                  onClick={onTagClick ? (e) => handleTagClick(e, tag) : undefined}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Published Date */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
            <Calendar className="w-4 h-4" />
            <span>
              Published: {formatPublishedDate(prompt.publish_date)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 flex-wrap">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBookmarkClick}
                disabled={!isPremium}
                className="gap-2"
                title={isPremium ? (bookmarked ? 'Remove from favorites' : 'Add to favorites') : 'Premium feature'}
              >
                <Star
                  className={cn(
                    'w-4 h-4',
                    bookmarked && isPremium ? 'fill-yellow-400 text-yellow-400' : ''
                  )}
                />
                {bookmarked ? 'Saved' : 'Save'}
              </Button>
            )}
            {/* Social Share Buttons */}
            <SocialShareButtons
              prompt={prompt}
              variant="outline"
              size="sm"
            />
            {/* Upload button for past prompts */}
            {isAuthenticated && (
              <DoodleUpload
                promptId={prompt.id}
                promptTitle={prompt.title}
                onUploadSuccess={handleUploadSuccess}
              />
            )}
          </div>

          {/* Community Doodles for this prompt */}
          {promptDoodles.length > 0 && (
            <div className="pt-4 border-t" key={refreshKey}>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Community Doodles ({promptDoodles.length})
              </h3>
              <DoodleGallery
                doodles={promptDoodles}
                columns={2}
                emptyMessage="No doodles shared yet"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
