import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/sdk/core/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DoodleImage } from '@/components/DoodleImage';
import { ShareButton } from '@/components/ShareButton';
import { ArrowLeft, Flame, Image, Award } from 'lucide-react';

export const Route = createFileRoute('/profile/$username')({
  component: ProfileDeepLink,
});

interface ProfileData {
  id: string;
  username: string;
  current_title?: string;
  current_avatar?: string;
  is_premium?: boolean;
  created_at: string;
}

interface DoodlePreview {
  id: string;
  image_url: string;
  prompt_title: string;
}

function ProfileDeepLink() {
  const { username } = useParams({ from: '/profile/$username' });
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [doodles, setDoodles] = useState<DoodlePreview[]>([]);
  const [stats, setStats] = useState({ doodleCount: 0, streak: 0, badgeCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Try to find by username first, then by ID
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      let { data: profileData, error: profileError } = await query;

      // If not found by username, try by ID
      if (profileError || !profileData) {
        const { data: profileById, error: idError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', username)
          .single();

        if (idError || !profileById) {
          setError('Profile not found');
          setLoading(false);
          return;
        }
        profileData = profileById;
      }

      setProfile(profileData);

      // Fetch stats in parallel
      const [doodlesResult, streakResult, badgesResult] = await Promise.all([
        supabase
          .from('doodles')
          .select('id, image_url, prompt_title')
          .eq('user_id', profileData.id)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(6),
        supabase
          .from('streaks')
          .select('current_streak')
          .eq('user_id', profileData.id)
          .single(),
        supabase
          .from('badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profileData.id),
      ]);

      if (doodlesResult.data) {
        setDoodles(doodlesResult.data);
      }

      setStats({
        doodleCount: doodlesResult.data?.length || 0,
        streak: streakResult.data?.current_streak || 0,
        badgeCount: badgesResult.count || 0,
      });

      setLoading(false);
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <div className="text-6xl mb-4">👤</div>
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          {error || 'This profile may have been deleted or does not exist.'}
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
          <CardContent className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                {profile.is_premium && (
                  <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-lg">👑</span>
                  </div>
                )}
              </div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {profile.current_title && (
                <p className="text-muted-foreground italic">{profile.current_title}</p>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <Image className="h-5 w-5" />
                  {stats.doodleCount}
                </div>
                <p className="text-sm text-muted-foreground">Doodles</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <Flame className="h-5 w-5" />
                  {stats.streak}
                </div>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold text-primary">
                  <Award className="h-5 w-5" />
                  {stats.badgeCount}
                </div>
                <p className="text-sm text-muted-foreground">Badges</p>
              </div>
            </div>

            {/* Recent Doodles Preview */}
            {doodles.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3">Recent Doodles</h2>
                <div className="grid grid-cols-3 gap-2">
                  {doodles.slice(0, 6).map((doodle) => (
                    <div key={doodle.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <DoodleImage
                        src={doodle.image_url}
                        alt={doodle.prompt_title}
                        className="w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center">
              <ShareButton
                type="profile"
                username={profile.username}
                userId={profile.id}
                variant="outline"
                size="default"
              />
            </div>

            {/* CTA */}
            <div className="border-t pt-6">
              <p className="text-muted-foreground text-center mb-3">
                Want to share your own creative journey?
              </p>
              <Button onClick={() => navigate({ to: '/' })} className="w-full">
                Join Daily Doodle Prompt
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
