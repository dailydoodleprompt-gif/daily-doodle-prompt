import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DoodleGallery } from '@/components/DoodleGallery';
import { AVATAR_ICONS, ICON_COLORS } from '@/components/UserAvatar';
import {
  useUser,
  useAppStore,
  useIsAuthenticated,
} from '@/store/app-store';
import {
  ArrowLeft,
  Image,
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  Loader2,
} from 'lucide-react';
import { type Doodle, type User } from '@/types';
import { getTitleDisplayName } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/sdk/core/supabase';

interface ArtistProfileViewProps {
  artistId: string;
  onBack: () => void;
  onPromptClick?: (promptId: string) => void;
  onAuthRequired?: () => void;
}

export function ArtistProfileView({ artistId, onBack, onPromptClick, onAuthRequired }: ArtistProfileViewProps) {
  const currentUser = useUser();
  const isAuthenticated = useIsAuthenticated();
  const getDoodles = useAppStore((state) => state.getDoodles);
  const getFollowerCount = useAppStore((state) => state.getFollowerCount);
  const getFollowingCount = useAppStore((state) => state.getFollowingCount);
  const isFollowing = useAppStore((state) => state.isFollowing);
  const followUser = useAppStore((state) => state.followUser);
  const unfollowUser = useAppStore((state) => state.unfollowUser);

  const [artist, setArtist] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  // Fetch artist from Supabase
  useEffect(() => {
    async function fetchArtist() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', artistId)
          .single();

        if (error || !data) {
          setArtist(null);
        } else {
          setArtist({
            id: data.id,
            email: data.email,
            username: data.username || 'Anonymous',
            is_premium: data.is_premium || false,
            is_admin: data.is_admin || false,
            avatar_type: data.avatar_type || 'initial',
            avatar_icon: data.avatar_icon,
            current_title: data.current_title,
            unlocked_titles: data.unlocked_titles || [],
            newly_unlocked_titles: data.newly_unlocked_titles || [],
            oauth_provider: data.oauth_provider,
            created_at: data.created_at,
            updated_at: data.updated_at,
          } as User);
        }
      } catch (err) {
        console.error('Failed to fetch artist:', err);
        setArtist(null);
      } finally {
        setLoading(false);
      }
    }

    fetchArtist();
  }, [artistId]);

  // Update following state when artist loads
  useEffect(() => {
    if (artist) {
      setFollowing(isFollowing(artistId));
    }
  }, [artist, artistId, isFollowing]);

  if (loading) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground animate-spin" />
            <p className="text-muted-foreground">Loading artist profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container px-4 py-8 mx-auto max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Artist Not Found</h2>
            <p className="text-muted-foreground">
              This artist profile does not exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get artist's public doodles
  const artistDoodles = (getDoodles(artistId) as Doodle[]).filter(d => d.is_public);
  const followerCount = getFollowerCount(artistId);
  const followingCount = getFollowingCount(artistId);

  const isOwnProfile = currentUser?.id === artistId;

  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast.info('Sign in Required', {
          description: 'Create a free account to follow artists.',
        });
      }
      return;
    }

    if (isOwnProfile) {
      return;
    }

    if (following) {
      unfollowUser(artistId);
      setFollowing(false);
      toast.success(`Unfollowed ${artist.username}`);
    } else {
      followUser(artistId);
      setFollowing(true);
      toast.success(`Now following ${artist.username}`);
    }
  };

  const titleDisplayName = artist.current_title ? getTitleDisplayName(artist.current_title) : null;

  return (
    <div className="container px-4 py-8 mx-auto max-w-4xl">
      <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            {(() => {
              const avatarType = artist.avatar_type ?? 'initial';
              const avatarIcon = artist.avatar_icon;

              const renderContent = () => {
                if (avatarType === 'icon' && avatarIcon && AVATAR_ICONS[avatarIcon]) {
                  const IconComponent = AVATAR_ICONS[avatarIcon];
                  return <IconComponent className="w-12 h-12" />;
                }
                return (
                  <span className="text-3xl font-medium">
                    {artist.username.charAt(0).toUpperCase()}
                  </span>
                );
              };

              const colorClass = avatarType === 'icon' && avatarIcon && ICON_COLORS[avatarIcon]
                ? ICON_COLORS[avatarIcon]
                : 'bg-primary/10 text-primary';

              return (
                <Avatar className="h-24 w-24">
                  <AvatarFallback className={cn(colorClass, 'font-medium')}>
                    {renderContent()}
                  </AvatarFallback>
                </Avatar>
              );
            })()}

            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{artist.username}</h1>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  {artist.is_premium && (
                    <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white border-0">
                      <Crown className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                  {artist.is_admin && (
                    <Badge variant="secondary" className="gap-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0">
                      <Shield className="h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
              </div>

              {/* Title */}
              {titleDisplayName && (
                <p className="text-muted-foreground italic mb-3">
                  {titleDisplayName}
                </p>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center sm:justify-start gap-6 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{artistDoodles.length}</p>
                  <p className="text-xs text-muted-foreground">Doodles</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{followerCount}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{followingCount}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </div>

              {/* Follow Button */}
              {!isOwnProfile && (
                <Button
                  variant={following ? "outline" : "default"}
                  onClick={handleFollowToggle}
                  className="gap-2"
                >
                  {following ? (
                    <>
                      <UserMinus className="h-4 w-4" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Follow
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doodles Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Public Doodles
            <span className="text-sm font-normal text-muted-foreground">
              ({artistDoodles.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {artistDoodles.length > 0 ? (
            <DoodleGallery
              doodles={artistDoodles}
              columns={3}
              showUserCredit={false}
              onPromptClick={onPromptClick}
              emptyMessage="No public doodles yet"
              onAuthRequired={onAuthRequired}
            />
          ) : (
            <div className="py-12 text-center">
              <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {artist.username} hasn&apos;t shared any public doodles yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}