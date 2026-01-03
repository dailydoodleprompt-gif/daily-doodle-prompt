import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import { usePromptForDate } from '@/hooks/use-opensheet-prompts';

export const Route = createFileRoute('/prompt/$date')({
  component: PromptDeepLink,
});

function PromptDeepLink() {
  const { date } = useParams({ from: '/prompt/$date' });
  const navigate = useNavigate();
  const { prompt, loading, error } = usePromptForDate(date);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading prompt...</p>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="text-6xl mb-4">✏️</div>
        <h1 className="text-2xl font-bold">Prompt Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {error || 'This prompt may not exist or is not yet available.'}
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(prompt.publish_date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const categoryColors: Record<string, string> = {
    'Animals': 'bg-green-100 text-green-800',
    'Nature': 'bg-emerald-100 text-emerald-800',
    'Fantasy': 'bg-purple-100 text-purple-800',
    'Food': 'bg-orange-100 text-orange-800',
    'Objects': 'bg-blue-100 text-blue-800',
    'Characters': 'bg-pink-100 text-pink-800',
    'Scenes': 'bg-indigo-100 text-indigo-800',
    'Abstract': 'bg-violet-100 text-violet-800',
  };

  const categoryColor = categoryColors[prompt.category] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 items-center px-4">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="Daily Doodle Prompt" className="h-8 w-auto" />
            <span className="hidden sm:inline-block">DailyDoodlePrompt</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Prompt Header */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${categoryColor}`}>
                {prompt.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">"{prompt.title}"</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                {prompt.description}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Tags */}
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h2 className="font-semibold flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((tag, index) => (
                      <span key={index} className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-2">
                <ShareButton
                  type="prompt"
                  prompt={prompt}
                  variant="outline"
                  size="default"
                />
              </div>

              {/* CTA */}
              <div className="border-t pt-6">
                <p className="text-muted-foreground text-center mb-3">
                  Ready to draw? Join our creative community!
                </p>
                <Button onClick={() => navigate({ to: '/' })} className="w-full">
                  Start Drawing Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
