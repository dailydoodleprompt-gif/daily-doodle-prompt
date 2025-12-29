import { type Prompt } from '@/hooks/use-google-sheets';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAppStore } from '@/store/app-store';
import { cn } from '@/lib/utils';
import { formatPublishedDate } from '@/lib/timezone';
import {
  Star,
  Palette,
  Lock,
  Maximize2,
} from 'lucide-react';
import { SocialShareButtons } from '@/components/SocialShareButtons';

interface PromptCardProps {
  prompt: Prompt;
  variant?: 'full' | 'compact';
  showBookmark?: boolean;
  showShare?: boolean;
  onShare?: () => void;
  onClick?: () => void;
  onTagClick?: (tag: string) => void;
  onCategoryClick?: (category: string) => void;
  isLocked?: boolean;
  className?: string;
  onAuthRequired?: () => void;
}

export function PromptCard({
  prompt,
  variant = 'full',
  showBookmark = true,
  showShare = true,
  onShare,
  onClick,
  onTagClick,
  onCategoryClick,
  isLocked = false,
  className,
  onAuthRequired,
}: PromptCardProps) {
  const { user, addBookmark, removeBookmark, isBookmarked, getAppSettings } = useAppStore();
  const bookmarked = isBookmarked(prompt.id);
  const isPremium = user?.is_premium ?? false;
  const tagsEnabled = getAppSettings().tags_enabled;

  const handleBookmarkClick = () => {
    if (!user) {
      onAuthRequired?.();
      return;
    }

    if (bookmarked) {
      removeBookmark(prompt.id);
    } else {
      addBookmark(prompt.id);
    }
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick?.(tag);
  };

  const handleCategoryClick = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    onCategoryClick?.(category);
  };

  if (isLocked) {
    return (
      <Card className={cn('relative overflow-hidden', className)}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="text-center p-6">
            <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground font-medium">
              Premium content
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Upgrade to access the full archive
            </p>
          </div>
        </div>
        <CardHeader className="blur-sm">
          <CardTitle>{prompt.title}</CardTitle>
        </CardHeader>
        <CardContent className="blur-sm">
          <p className="line-clamp-2">{prompt.description}</p>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card
        className={cn('hover:shadow-md transition-shadow cursor-pointer', className)}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{prompt.title}</CardTitle>
          {tagsEnabled && (
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant="outline"
                className={cn("shrink-0", onCategoryClick && "cursor-pointer hover:bg-primary/10")}
                onClick={onCategoryClick ? (e) => handleCategoryClick(e, prompt.category) : undefined}
              >
                {prompt.category}
              </Badge>
            </div>
          )}
          <CardDescription className="line-clamp-3 text-xs mt-2">
            {prompt.description}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-2 flex items-center justify-between gap-2">
          {tagsEnabled && (
            <div className="flex items-center gap-2 flex-wrap flex-1">
              {prompt.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn("text-xs px-1.5 py-0", onTagClick && "cursor-pointer hover:bg-secondary/80")}
                  onClick={onTagClick ? (e) => handleTagClick(e, tag) : undefined}
                >
                  {tag}
                </Badge>
              ))}
              {prompt.tags.length > 2 && (
                <span className="text-xs text-muted-foreground">
                  +{prompt.tags.length - 2}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1">
            {showShare && (
              <SocialShareButtons
                prompt={prompt}
                variant="ghost"
                size="icon"
                showLabel={false}
              />
            )}
            {onClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                title="View full prompt"
                className="shrink-0"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-xl">{prompt.title}</CardTitle>
            {tagsEnabled && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Palette className="w-4 h-4" />
                <Badge
                  variant="outline"
                  className={cn(onCategoryClick && "cursor-pointer hover:bg-primary/10")}
                  onClick={onCategoryClick ? (e) => handleCategoryClick(e, prompt.category) : undefined}
                >
                  {prompt.category}
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showBookmark && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBookmarkClick}
                title={bookmarked ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  className={cn(
                    'w-5 h-5',
                    bookmarked ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                  )}
                />
              </Button>
            )}
            {showShare && (
              <SocialShareButtons
                prompt={prompt}
                variant="ghost"
                size="icon"
                showLabel={false}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-foreground leading-relaxed">{prompt.description}</p>

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
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Published: {formatPublishedDate(prompt.publish_date)}
      </CardFooter>
    </Card>
  );
}
