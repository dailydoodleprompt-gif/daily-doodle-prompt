import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
  Crown,
  LogOut,
  Settings,
  User as UserIcon,
  Bookmark,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { supabase } from '@/sdk/core/supabase';
import { useAppStore } from '@/store/app-store';

interface SimpleHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLoginClick: () => void;
}

export function SimpleHeader({ currentView, onNavigate, onLoginClick }: SimpleHeaderProps) {
  // NO loading state - we trust hydrated state immediately
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get user from app store
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  const loadUserData = useAppStore((state) => state.loadUserData);
  const clearUserData = useAppStore((state) => state.clearUserData);
  const setViewedBadges = useAppStore((state) => state.setViewedBadges);

  // SIMPLIFIED AUTH: Only use onAuthStateChange, NEVER getSession()
  useEffect(() => {
    let mounted = true;

    console.log('[SimpleHeader] Setting up auth listener, current user:', user?.email || 'none');

    // Helper to load user data from session
    const loadUserFromSession = async (session: { user: { id: string; email?: string }; access_token: string }) => {
      if (!mounted) return;

      console.log('[SimpleHeader] Loading user from session:', session.user.email);

      try {
        const response = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (response.ok && mounted) {
          const data = await response.json();
          console.log('[SimpleHeader] User data received:', data.email);

          setUser({
            id: data.id,
            email: data.email,
            username: data.username || data.email?.split('@')[0] || 'User',
            is_premium: data.is_premium || false,
            is_admin: data.is_admin || false,
            avatar_type: data.avatar_type || 'initial',
            avatar_icon: data.avatar_icon || undefined,
            current_title: data.current_title || null,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString(),
          });

          if (data.viewed_badges && Array.isArray(data.viewed_badges)) {
            setViewedBadges(data.viewed_badges);
          }

          try {
            await loadUserData(data.id);
          } catch (loadErr) {
            console.warn('[SimpleHeader] loadUserData failed:', loadErr);
          }
        } else if (mounted) {
          console.warn('[SimpleHeader] /api/me failed, clearing user');
          clearUserData();
        }
      } catch (err) {
        console.error('[SimpleHeader] Error loading user from session:', err);
        if (mounted) clearUserData();
      }
    };

    // Set up auth state change listener - this is the ONLY source of truth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('[SimpleHeader] Auth event:', event, 'session:', session?.user?.email || 'none');

      switch (event) {
        case 'INITIAL_SESSION':
          // This fires on page load with the current session state
          if (session) {
            // Valid session exists
            if (user && user.id === session.user.id) {
              // Hydrated user matches session - just refresh data in background
              console.log('[SimpleHeader] INITIAL_SESSION: Hydrated user matches, refreshing data');
              loadUserData(user.id).catch(err => {
                console.warn('[SimpleHeader] Background refresh failed:', err);
              });
            } else if (user && user.id !== session.user.id) {
              // Hydrated user doesn't match session - clear and reload
              console.warn('[SimpleHeader] INITIAL_SESSION: User mismatch, reloading');
              clearUserData();
              await loadUserFromSession(session);
            } else {
              // No hydrated user but valid session - load user
              console.log('[SimpleHeader] INITIAL_SESSION: Loading user from session');
              await loadUserFromSession(session);
            }
          } else {
            // No valid session
            if (user) {
              // We thought we were logged in, but no session - log out
              console.log('[SimpleHeader] INITIAL_SESSION: No session but had hydrated user, logging out');
              clearUserData();
            }
            // else: no session, no user - already in correct state
          }
          break;

        case 'SIGNED_IN':
          console.log('[SimpleHeader] SIGNED_IN event');
          if (session) {
            // Check if this is a new user signup
            const welcomeEmailKey = `welcome_email_sent_${session.user.id}`;
            const alreadySent = localStorage.getItem(welcomeEmailKey);

            if (!alreadySent) {
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('created_at')
                  .eq('id', session.user.id)
                  .single();

                if (profile?.created_at) {
                  const createdAt = new Date(profile.created_at);
                  const now = new Date();
                  const secondsSinceCreation = (now.getTime() - createdAt.getTime()) / 1000;

                  if (secondsSinceCreation < 60) {
                    console.log('[Auth] New user detected, sending welcome email');
                    localStorage.setItem(welcomeEmailKey, 'true');

                    fetch('/api/email/welcome', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                      },
                    }).catch(err => {
                      console.error('[Auth] Failed to send welcome email:', err);
                    });
                  }
                }
              } catch (err) {
                console.warn('[Auth] Error checking user profile:', err);
              }
            }

            await loadUserFromSession(session);
          }
          break;

        case 'SIGNED_OUT':
          console.log('[SimpleHeader] SIGNED_OUT event');
          clearUserData();
          break;

        case 'TOKEN_REFRESHED':
          console.log('[SimpleHeader] TOKEN_REFRESHED event');
          // Token refreshed, optionally refresh user data
          if (session && user) {
            loadUserData(user.id).catch(err => {
              console.warn('[SimpleHeader] Token refresh data update failed:', err);
            });
          }
          break;

        case 'USER_UPDATED':
          console.log('[SimpleHeader] USER_UPDATED event');
          if (session) {
            await loadUserFromSession(session);
          }
          break;

        default:
          console.log('[SimpleHeader] Unhandled auth event:', event);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setUser, loadUserData, clearUserData, setViewedBadges]);

  const isAuthenticated = !!user;
  const isPremium = user?.is_premium || false;

  const handleLogout = () => {
    console.log('[SimpleHeader] Logging out...');

    // 1. Clear Zustand state FIRST (instant UI update)
    clearUserData();

    // 2. Navigate to landing immediately
    onNavigate('landing');

    // 3. Tell Supabase to sign out (fire and forget - don't block on it)
    supabase.auth.signOut().catch(err => {
      console.warn('[SimpleHeader] signOut error (ignored):', err);
    });

    console.log('[SimpleHeader] Logout complete');
  };

  const handleLogoClick = () => {
    onNavigate(isAuthenticated ? 'prompt' : 'landing');
    setMobileMenuOpen(false);
  };

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'prompt', label: "Today's Prompt", icon: Pencil },
    { id: 'archive', label: 'Archive', icon: Archive },
    { id: 'pricing', label: 'Pricing', icon: Crown },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2 font-semibold hover:opacity-80 transition-opacity"
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
              onClick={() => handleNav(item.id)}
              className="gap-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Show Unlock Lifetime button for non-premium users */}
          {!isPremium && (
            <Button
              variant="outline"
              onClick={() => handleNav('pricing')}
              className="gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white border-0"
            >
              <Crown className="w-4 h-4" />
              Unlock Lifetime
            </Button>
          )}

          {/* Auth state */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                    <span className="text-sm font-semibold">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                    {isPremium && (
                      <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none flex items-center gap-2">
                      {user?.username}
                      {isPremium && (
                        <Crown className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      )}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNav('profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {isPremium && (
                  <DropdownMenuItem onClick={() => handleNav('bookmarks')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmarks
                  </DropdownMenuItem>
                )}
                {isPremium && (
                  <DropdownMenuItem onClick={() => handleNav('prompt-ideas')}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Submit Prompt Idea
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleNav('settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {user?.is_admin && (
                  <DropdownMenuItem onClick={() => handleNav('admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                {!isPremium && (
                  <DropdownMenuItem
                    onClick={() => handleNav('pricing')}
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
            <Button onClick={onLoginClick} size="sm" variant="ghost">
              Log In
            </Button>
          )}

          {/* Mobile Menu Toggle */}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2"
                onClick={() => handleNav(item.id)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}