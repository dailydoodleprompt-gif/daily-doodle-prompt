import { useMemo, useState } from 'react';
import { type Prompt } from '@/hooks/use-google-sheets';
import { PromptCard } from '@/components/PromptCard';
import { PromptDetailDialog } from '@/components/PromptDetailDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBookmarks, useIsPremium } from '@/store/app-store';
import { Bookmark, Lock, Archive } from 'lucide-react';

interface BookmarksViewProps {
  prompts: Prompt[];
  onUpgrade: () => void;
  onBrowseArchive: () => void;
}

export function BookmarksView({
  prompts,
  onUpgrade,
  onBrowseArchive,
}: BookmarksViewProps) {
  const bookmarks = useBookmarks();
  const isPremium = useIsPremium();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDialogOpen(true);
  };

  const bookmarkedPrompts = useMemo(() => {
    const bookmarkIds = new Set(bookmarks.map((b) => b.prompt_id));
    return prompts.filter((p) => bookmarkIds.has(p.id));
  }, [prompts, bookmarks]);

  if (!isPremium) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Premium Feature</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Bookmarks are available for premium users. Upgrade to save your
              favorite prompts and access them anytime.
            </p>
            <Button onClick={onUpgrade}>Upgrade to Premium</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookmarkedPrompts.length === 0) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Your Bookmarks</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Bookmarks Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start saving your favorite prompts by clicking the star icon on any
              prompt.
            </p>
            <Button variant="outline" onClick={onBrowseArchive} className="gap-2">
              <Archive className="w-4 h-4" />
              Browse Archive
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Bookmarks</h1>
          <p className="text-muted-foreground">
            {bookmarkedPrompts.length} saved prompt
            {bookmarkedPrompts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {bookmarkedPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            variant="compact"
            onClick={() => handlePromptClick(prompt)}
          />
        ))}
      </div>

      {/* Prompt Detail Dialog */}
      <PromptDetailDialog
        prompt={selectedPrompt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
