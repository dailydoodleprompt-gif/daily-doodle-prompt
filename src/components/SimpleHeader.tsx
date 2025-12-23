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
} from 'lucide-react';
import { supabase } from '@/sdk/core/supabase';

interface SimpleHeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onLoginClick: () => void;
}

interface User {
  id: string;
  email: string | null;
  username?: string;
  is_premium?: boolean;
  is_admin?: boolean;
}

export function SimpleHeader({ currentView, onNavigate, onLoginClick }: SimpleHeaderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check auth status on mount and listen for changes
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        console.log('[SimpleHeader] Loading user...');
        
        // Wait a bit for Supabase to fully initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('[SimpleHeader] Session check:', {
          hasSession: !!session,
          hasToken: !!session?.access_token,
          error: error?.message
        });
        
        if (!mounted) return;
        
        if (session?.access_token) {
          console.log('[SimpleHeader] Fetching user profile...');
          const response = await fetch('/api/me', {
            headers: { Authorization: `Bearer ${session.access_token}` },
          });

          if (response.ok) {
            const data = await response.json();
            console.log('[SimpleHeader] User loaded:', data.email);
            if (mounted) {
              setUser({
                id: data.id,
                email: data.email,
                username: data.username || data.email?.split('@')[0] || 'User',
                is_premium: data.is_premium || false,
                is_admin: data.is_admin || false,
              });
            }
          } else {
            console.error('[SimpleHeader] Failed to fetch user:', response.status);
          }
        } else {
          console.log('[SimpleHeader] No session found');
        }
      } catch (error) {
        console.error('[SimpleHeader] Error loading user:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    // Initial load
    loadUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[SimpleHeader] Auth state changed:', event, !!session);
      if (mounted) {
        loadUser();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!user;
  const isPremium = user?.is_premium || false;

  const handleLogout = async () => {
    console.log('[SimpleHeader] Logging out...');
    await supabase.auth.signOut();
    setUser(null);
    onNavigate('landing');
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
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <>
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
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {user?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      {isPremium && (
                        <Crown className="absolute -top-1 -right-1 h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.username}
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

                    <DropdownMenuItem onClick={() => handleNav('profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={() => handleNav('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>

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
            </>
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