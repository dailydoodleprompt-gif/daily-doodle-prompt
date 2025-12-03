import { useMemo, useEffect, useState } from 'react';
import { type Prompt } from '@/hooks/use-google-sheets';
import { PromptCard } from '@/components/PromptCard';
import { PromptDetailDialog } from '@/components/PromptDetailDialog';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { DoodleUpload } from '@/components/DoodleUpload';
import { DoodleGallery } from '@/components/DoodleGallery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAppStore, useIsAuthenticated, useIsPremium } from '@/store/app-store';
import { Calendar, AlertCircle, Image, Sparkles } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getTodayEST, getDateOffsetFromBase, formatPromptDateDisplay } from '@/lib/timezone';

interface PromptViewProps {
  prompts: Prompt[];
  isLoading: boolean;
  error: Error | null;
  onUserClick?: (userId: string) => void;
}

export function PromptView({ prompts, isLoading, error, onUserClick }: PromptViewProps) {
  const isAuthenticated = useIsAuthenticated();
  const isPremium = useIsPremium();
  const recordPromptView = useAppStore((state) => state.recordPromptView);
  const getPromptDoodles = useAppStore((state) => state.getPromptDoodles);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePromptClick = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDialogOpen(true);
  };

  const today = getTodayEST();

  // Find today's prompt or the most recent one
  const { todayPrompt, recentPrompts } = useMemo(() => {
    if (!prompts.length) return { todayPrompt: null, recentPrompts: [] };

    // Sort by publish_date descending
    const sorted = [...prompts].sort(
      (a, b) =>
        new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
    );

    // Find today's prompt or the most recent past prompt
    let todayPrompt = sorted.find((p) => p.publish_date === today);
    if (!todayPrompt) {
      // Get the most recent prompt that's not in the future
      todayPrompt = sorted.find((p) => p.publish_date <= today);
    }

    // Get last 2 days (free tier limit)
    const yesterday = getDateOffsetFromBase(today, -1);
    const dayBefore = getDateOffsetFromBase(today, -2);
    const recentPrompts = sorted.filter(
      (p) =>
        p.publish_date === yesterday ||
        p.publish_date === dayBefore
    );

    return { todayPrompt: todayPrompt || null, recentPrompts };
  }, [prompts, today]);

  // Record view for streak when prompt is displayed
  useEffect(() => {
    if (todayPrompt && isAuthenticated) {
      recordPromptView();
    }
  }, [todayPrompt?.id, isAuthenticated, recordPromptView]);

  if (isLoading) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-3xl">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load prompts. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!todayPrompt) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-3xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No Prompt Today</h2>
            <p className="text-muted-foreground">
              Check back tomorrow for a new creative challenge!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get doodles for today's prompt
  const promptDoodles = todayPrompt ? getPromptDoodles(todayPrompt.id) : [];

  const handleUploadSuccess = () => {
    setRefreshKey((k) => k + 1);
    toast.success('Doodle uploaded successfully!');
  };

  return (
    <div className="container px-4 py-8 mx-auto max-w-3xl">
      {/* Today's Prompt Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Today&apos;s Prompt</h1>
          <p className="text-muted-foreground">
            {formatPromptDateDisplay(todayPrompt.publish_date, {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <DoodleUpload
              promptId={todayPrompt.id}
              promptTitle={todayPrompt.title}
              onUploadSuccess={handleUploadSuccess}
            />
          )}
        </div>
      </div>

      {/* Main Prompt Card */}
      <PromptCard prompt={todayPrompt} showShare={false} className="mb-4" />

      {/* Social Share Section */}
      <div className="mb-8 pb-4 border-b">
        <SocialShareButtons
          prompt={todayPrompt}
          layout="inline"
          variant="outline"
          size="default"
        />
      </div>

      {/* Community Doodles Section */}
      {promptDoodles.length > 0 && (
        <Card className="mb-8" key={refreshKey}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Community Doodles
              <span className="text-sm font-normal text-muted-foreground">
                ({promptDoodles.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DoodleGallery
              doodles={promptDoodles}
              columns={3}
              emptyMessage="No doodles shared yet. Be the first!"
              onUserClick={onUserClick}
            />
          </CardContent>
        </Card>
      )}

      {/* Show prompt to upload if no doodles yet */}
      {promptDoodles.length === 0 && isAuthenticated && isPremium && (
        <Card className="mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-6 text-center">
            <Image className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Be the First to Share!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your doodle for this prompt and inspire others.
            </p>
            <DoodleUpload
              promptId={todayPrompt.id}
              promptTitle={todayPrompt.title}
              onUploadSuccess={handleUploadSuccess}
            />
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {/* Previous Days */}
      {recentPrompts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-muted-foreground">
            Previous Days
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                variant="compact"
                onClick={() => handlePromptClick(prompt)}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Free users can view the last 3 days of prompts.{' '}
            <button type="button" className="text-primary hover:underline">
              Upgrade to Premium
            </button>{' '}
            for full archive access.
          </p>
        </div>
      )}

      {/* Prompt Detail Dialog */}
      <PromptDetailDialog
        prompt={selectedPrompt}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
