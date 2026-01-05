import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/sdk/core/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DoodleImage } from '@/components/DoodleImage';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, Crown, Image, Users, ExternalLink } from 'lucide-react';

export const Route = createFileRoute('/gallery/$username')({
  component: PublicGallery,
});

interface ProfileData {
  id: string;
  username: string;
  current_title?: string;
  avatar_type?: string;
  avatar_icon?: string;
  is_premium?: boolean;
  created_at: string;
}

interface GalleryDoodle {
  id: string;
  image_url: string;
  prompt_title: string;
  caption?: string;
  likes_count: number;
  created_at: string;
}

function PublicGallery() {
  const { username } = useParams({ from: '/gallery/$username' });
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [doodles, setDoodles] = useState<GalleryDoodle[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      // Try to find by username first, then by ID
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      // If not found by username, try by ID
      if (profileError || !profileData) {
        const { data: profileById, error: idError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', username)
          .single();

        if (idError || !profileById) {
          setError('Gallery not found');
          setLoading(false);
          return;
        }
        profileData = profileById;
      }

      setProfile(profileData);

      // Fetch all public doodles and follower count
      const [doodlesResult, followersResult] = await Promise.all([
        supabase
          .from('doodles')
          .select('id, image_url, prompt_title, caption, likes_count, created_at')
          .eq('user_id', profileData.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', profileData.id),
      ]);

      if (doodlesResult.data) {
        setDoodles(doodlesResult.data);
      }

      setFollowerCount(followersResult.count || 0);
      setLoading(false);
    };

    fetchGallery();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="text-6xl mb-4">🎨</div>
        <h1 className="text-2xl font-bold">Gallery Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {error || 'This gallery may have been deleted or does not exist.'}
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Home
        </Button>
      </div>
    );
  }

  const initial = (profile.username || 'U')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 items-center justify-between px-4">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="Daily Doodle Prompt" className="h-8 w-auto" />
            <span className="hidden sm:inline-block">DailyDoodlePrompt</span>
          </button>
          <ShareButton
            type="profile"
            username={profile.username}
            userId={profile.id}
            variant="outline"
            size="sm"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto py-8 px-4">
        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                {profile.is_premium && (
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold mb-1">{profile.username}'s Gallery</h1>
                {profile.current_title && (
                  <p className="text-muted-foreground italic mb-3">{profile.current_title}</p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 justify-center sm:justify-start">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{doodles.length}</p>
                    <p className="text-xs text-muted-foreground">Doodles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{followerCount}</p>
                    <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {doodles.reduce((sum, d) => sum + (d.likes_count || 0), 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Likes</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Public Doodles
              <Badge variant="secondary" className="ml-2">{doodles.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {doodles.length === 0 ? (
              <div className="py-12 text-center">
                <Image className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-medium text-lg mb-2">No public doodles yet</h3>
                <p className="text-muted-foreground">
                  {profile.username} hasn't shared any doodles publicly yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {doodles.map((doodle) => (
                  <div
                    key={doodle.id}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => navigate({ to: `/doodle/${doodle.id}` })}
                  >
                    <DoodleImage
                      src={doodle.image_url}
                      alt={doodle.prompt_title}
                      className="w-full h-full"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
                      <p className="text-sm font-medium text-center line-clamp-2 mb-1">
                        {doodle.prompt_title}
                      </p>
                      {doodle.likes_count > 0 && (
                        <p className="text-xs">❤️ {doodle.likes_count}</p>
                      )}
                      <ExternalLink className="w-4 h-4 mt-2 opacity-70" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Card className="mt-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-lg mb-2">Want your own gallery?</h3>
            <p className="text-muted-foreground mb-4">
              Join Daily Doodle Prompt and start your creative journey today!
            </p>
            <Button onClick={() => navigate({ to: '/' })} size="lg">
              Get Started Free
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Made with ❤️ by Daily Doodle Prompt</p>
        </div>
      </footer>
    </div>
  );
}
