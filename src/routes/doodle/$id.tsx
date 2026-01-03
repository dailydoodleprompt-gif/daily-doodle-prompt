import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/sdk/core/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DoodleImage } from '@/components/DoodleImage';
import { LikeButton } from '@/components/LikeButton';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, Calendar } from 'lucide-react';

export const Route = createFileRoute('/doodle/$id')({
  component: DoodleDeepLink,
});

interface DoodleData {
  id: string;
  image_url: string;
  prompt_title: string;
  prompt_id: string;
  user_id: string;
  user_username: string;
  caption?: string;
  likes_count: number;
  is_public: boolean;
  created_at: string;
}

function DoodleDeepLink() {
  const { id } = useParams({ from: '/doodle/$id' });
  const navigate = useNavigate();
  const [doodle, setDoodle] = useState<DoodleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoodle = async () => {
      const { data, error: fetchError } = await supabase
        .from('doodles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        setError('Doodle not found');
        setLoading(false);
        return;
      }

      if (!data.is_public) {
        setError('This doodle is private');
        setLoading(false);
        return;
      }

      setDoodle(data);
      setLoading(false);
    };

    fetchDoodle();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading doodle...</p>
        </div>
      </div>
    );
  }

  if (error || !doodle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="text-6xl mb-4">🎨</div>
        <h1 className="text-2xl font-bold">Doodle Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {error || 'This doodle may have been deleted or is no longer available.'}
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    );
  }

  const formattedDate = new Date(doodle.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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
            {/* Doodle Image */}
            <div className="bg-muted flex items-center justify-center">
              <DoodleImage
                src={doodle.image_url}
                alt={doodle.prompt_title}
                className="w-full"
                aspectRatio="auto"
              />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Prompt Title */}
              <h1 className="text-2xl font-bold">"{doodle.prompt_title}"</h1>

              {/* Artist Info */}
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {doodle.user_username?.[0]?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{doodle.user_username || 'Artist'}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formattedDate}
                  </p>
                </div>
              </div>

              {/* Caption */}
              {doodle.caption && (
                <p className="text-muted-foreground">{doodle.caption}</p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                <LikeButton
                  doodleId={doodle.id}
                  likesCount={doodle.likes_count}
                  isOwnDoodle={false}
                />
                <ShareButton
                  type="doodle"
                  doodleId={doodle.id}
                  promptTitle={doodle.prompt_title}
                  artistName={doodle.user_username}
                  variant="outline"
                  size="default"
                />
              </div>

              {/* CTA */}
              <div className="border-t pt-6 mt-6">
                <p className="text-muted-foreground mb-3">
                  Want to create your own doodles?
                </p>
                <Button onClick={() => navigate({ to: '/' })} className="w-full">
                  Join Daily Doodle Prompt
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
