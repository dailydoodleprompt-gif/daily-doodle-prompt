import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { StreakBadge } from '@/components/StreakBadge';
import { AuthDialog } from '@/components/AuthDialog';
import { UserAvatar } from '@/components/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Pencil,
  Menu,
  X,
  Archive,
  Bookmark,
  User,
  Settings,
  Crown,
  LogOut,
  Shield,
  Bell,
  Lightbulb,
} from 'lucide-react';
import { supabase } from '@/sdk/core/supabase';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

interface UserProfile {
  id: string;
  email: string | null;
  username?: string;
  is_admin?: boolean;
  is_premium?: boolean;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth status and fetch user profile
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          setIsAuthenticated(true);
          
          // Fetch user profile
          const response = await fetch('/api/me', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (response.ok) {
            const data = await response.json();
            setUser({
              id: data.id,
              email: data.email,
              username: data.username || data.email?.split('@')[0] || 'User',
              is_admin: data.is_admin || false,
              is_premium: data.is_premium || false,
            });
          }
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('[Navigation] Auth check failed:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[Navigation] Auth state changed:', _event);
      if (session?.access_token) {
        setIsAuthenticated(true);
        checkAuth(); // Refetch user profile
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const isPremium = user?.is_premium || false;

  const navItems = [
    { id: 'prompt', label: "Today's Prompt", icon: Pencil },
    { id: 'archive', label: 'Archive', icon: Archive },
    ...(isAuthenticated && isPremium
      ? [{ id: 'bookmarks', label: 'Bookmarks', icon: Bookmark }]
      : []),
    { id: 'pricing', label: 'Pricing', icon: Crown },
  ];

  const handleNavigation = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    onNavigate('landing');
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      onNavigate('prompt');
    } else {
      onNavigate('landing');
    }
    setMobileMenuOpen(false);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center gap-2 mr-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 font-semibold"
            >
              <img
                src="/logo.svg"
                alt="Daily Doodle Prompt"
                className="h-8 w-auto"
              />
              <span className="hidden sm:inline-block">DailyDoodlePrompt</span>
            </button>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center px-4">
          <div className="flex items-center gap-2 mr-4">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 font-semibold"
            >
              <img
                src="/logo.svg"
                alt="Daily Doodle Prompt"
                className="h-8 w-auto"
              />
              <span className="hidden sm:inline-block">DailyDoodlePrompt</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => handleNavigation(item.id)}
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated && <StreakBadge />}

            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => handleNavigation('notifications')}
              >
                <Bell className="h-5 w-5" />
                {unreadNotificationsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </Badge>
                )}
              </Button>
            )}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <UserAvatar size="sm" />
                    {isPremium && (
                      <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.username || 'User'}
                        {isPremium && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Premium
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => handleNavigation('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>

                  {isPremium && (
                    <DropdownMenuItem onClick={() => handleNavigation('bookmarks')}>
                      <Bookmark className="mr-2 h-4 w-4" />
                      Bookmarks
                    </DropdownMenuItem>
                  )}

                  {isPremium && (
                    <DropdownMenuItem onClick={() => handleNavigation('prompt-ideas')}>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Submit Prompt Idea
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => handleNavigation('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>

                  {user?.is_admin && (
                    <DropdownMenuItem onClick={() => handleNavigation('admin')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}

                  {!isPremium && (
                    <DropdownMenuItem
                      onClick={() => handleNavigation('pricing')}
                      className="text-primary"
                    >
                      <Crown className="mr-2 h-4 w-4" />
                      Upgrade to Premium
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setAuthDialogOpen(true)} size="sm">
                Log In
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-2"
                  onClick={() => handleNavigation(item.id)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              ))}
            </nav>
          </div>
        )}
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}