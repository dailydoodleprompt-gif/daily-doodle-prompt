import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAppStore, useUser, useIsPremium } from '@/store/app-store';
import {
  type ProfileTitleType,
  DEFAULT_TITLES,
  SECRET_TITLES,
  ADMIN_TITLE,
  getTitleDisplayName,
} from '@/types';
import { Crown, Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TitleSelectorProps {
  onUpgrade?: () => void;
  compact?: boolean;
}

export function TitleSelector({ onUpgrade, compact = false }: TitleSelectorProps) {
  const user = useUser();
  const isPremium = useIsPremium();
  const setTitle = useAppStore((state) => state.setTitle);
  const getAvailableTitles = useAppStore((state) => state.getAvailableTitles);
  const clearNewlyUnlockedTitles = useAppStore((state) => state.clearNewlyUnlockedTitles);

  const [selectedTitle, setSelectedTitle] = useState<ProfileTitleType | null>(
    user?.current_title ?? null
  );

  if (!user) return null;

  const availableTitles = getAvailableTitles();
  const newlyUnlocked = user.newly_unlocked_titles || [];
  const canSelectTitle = isPremium || user.is_admin;

  // If not premium and not admin, show locked state
  if (!canSelectTitle) {
    return (
      <Card className={cn(compact && 'border-0 shadow-none')}>
        <CardHeader className={cn(compact && 'p-0 pb-4')}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="h-5 w-5 text-amber-500" />
            Profile Title
          </CardTitle>
          <CardDescription>
            Display a custom title under your username
          </CardDescription>
        </CardHeader>
        <CardContent className={cn(compact && 'p-0')}>
          <div className="flex flex-col items-center gap-4 py-6 px-4 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30">
            <Lock className="h-10 w-10 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-muted-foreground">
                Unlock a custom Doodle Title with Premium
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Choose from fun titles like "Doodle Diva" or "Duke of Doodle"
              </p>
            </div>
            {onUpgrade && (
              <Button
                onClick={onUpgrade}
                className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleTitleChange = (titleId: string) => {
    if (titleId === 'none') {
      setSelectedTitle(null);
      setTitle(null);
    } else {
      const newTitle = titleId as ProfileTitleType;
      setSelectedTitle(newTitle);
      setTitle(newTitle);
    }

    // Clear newly unlocked badges if viewing them
    if (newlyUnlocked.length > 0) {
      clearNewlyUnlockedTitles();
    }
  };

  // Organize titles by category
  const adminTitle = user.is_admin ? ADMIN_TITLE : null;
  const defaultTitles = DEFAULT_TITLES.filter((t) => availableTitles.includes(t.id));
  const secretTitles = SECRET_TITLES.filter((t) => availableTitles.includes(t.id));

  return (
    <Card className={cn(compact && 'border-0 shadow-none')}>
      <CardHeader className={cn(compact && 'p-0 pb-4')}>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-amber-500" />
          Profile Title
        </CardTitle>
        <CardDescription>
          Choose a title to display under your username
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(compact && 'p-0')}>
        <RadioGroup
          value={selectedTitle ?? 'none'}
          onValueChange={handleTitleChange}
          className="space-y-3"
        >
          {/* No Title option */}
          <div
            className={cn(
              'flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer',
              selectedTitle === null
                ? 'border-primary bg-primary/5'
                : 'border-transparent hover:border-muted-foreground/20'
            )}
          >
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none" className="flex-1 cursor-pointer text-muted-foreground">
              No Title
            </Label>
          </div>

          {/* Admin title first if admin */}
          {adminTitle && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Admin Title
              </p>
              <div
                className={cn(
                  'flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer',
                  selectedTitle === adminTitle.id
                    ? 'border-violet-500 bg-violet-500/5'
                    : 'border-transparent hover:border-muted-foreground/20'
                )}
              >
                <RadioGroupItem value={adminTitle.id} id={adminTitle.id} />
                <Label
                  htmlFor={adminTitle.id}
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <span className="font-medium">{adminTitle.displayName}</span>
                  <Badge variant="secondary" className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                    Admin
                  </Badge>
                </Label>
              </div>
            </div>
          )}

          {/* Default titles */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Default Titles
            </p>
            <div className="grid gap-2">
              {defaultTitles.map((title) => (
                <div
                  key={title.id}
                  className={cn(
                    'flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer',
                    selectedTitle === title.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-muted-foreground/20'
                  )}
                >
                  <RadioGroupItem value={title.id} id={title.id} />
                  <Label htmlFor={title.id} className="flex-1 cursor-pointer">
                    {title.displayName}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Secret titles (if any unlocked) */}
          {secretTitles.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Secret Titles
              </p>
              <div className="grid gap-2">
                {secretTitles.map((title) => {
                  const isNew = newlyUnlocked.includes(title.id);
                  return (
                    <div
                      key={title.id}
                      className={cn(
                        'flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors cursor-pointer',
                        selectedTitle === title.id
                          ? 'border-purple-500 bg-purple-500/5'
                          : 'border-transparent hover:border-muted-foreground/20'
                      )}
                    >
                      <RadioGroupItem value={title.id} id={title.id} />
                      <Label
                        htmlFor={title.id}
                        className="flex-1 cursor-pointer flex items-center gap-2"
                      >
                        <span className="font-medium">{title.displayName}</span>
                        {isNew && (
                          <Badge className="bg-gradient-to-r from-purple-400 to-pink-500 text-white text-xs">
                            New!
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-purple-600 dark:text-purple-400 border-purple-300">
                          Secret
                        </Badge>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </RadioGroup>

        {/* Current title preview */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-2">Preview:</p>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">{user.username}</span>
          </div>
          {selectedTitle ? (
            <p className="text-sm text-muted-foreground italic">
              {getTitleDisplayName(selectedTitle)}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/50 italic">
              No title displayed
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
