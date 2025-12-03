import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  useAppStore,
  useUser,
  useIsAuthenticated,
  useIsPremium,
} from '@/store/app-store';
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
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const isPremium = useIsPremium();
  const logout = useAppStore((state) => state.logout);

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

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center gap-2 mr-4">
            <button
              onClick={() => handleNavigation('landing')}
              className="flex items-center gap-2 font-semibold"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Pencil className="h-4 w-4 text-primary-foreground" />
              </div>
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

            {/* PRIVACY + TERMS — DESKTOP */}
            <div className="ml-4 flex flex-col text-left">
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleNavigation('privacy')}
              >
                Privacy Policy
              </button>
              <button
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => handleNavigation('terms')}
              >
                Terms of Service
              </button>
            </div>
          </nav>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 ml-auto">
            {isAuthenticated && <StreakBadge />}

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
                  <DropdownMenuItem onClick={() => handleNavigation('profile')}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>

                  {isPremium && (
                    <DropdownMenuItem onClick={() => handleNavigation('bookmarks')}>
                      <Bookmark className="mr-2 h-4 w-4" /> Bookmarks
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => handleNavigation('settings')}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>

                  {user?.is_admin && (
                    <DropdownMenuItem onClick={() => handleNavigation('admin')}>
                      <Shield className="mr-2 h-4 w-4" /> Admin Dashboard
                    </DropdownMenuItem>
                  )}

                  {!isPremium && (
                    <DropdownMenuItem
                      onClick={() => handleNavigation('pricing')}
                      className="text-primary"
                    >
                      <Crown className="mr-2 h-4 w-4" /> Upgrade to Premium
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setAuthDialogOpen(true)} size="sm">
                Sign In
              </Button>
            )}

            {/* Mobile menu toggle */}
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container py-4 flex flex-col gap-2">

              {/* Core nav items */}
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

              {/* PRIVACY + TERMS — MOBILE */}
              <div className="mt-4 flex flex-col gap-1 pl-1">
                <button
                  className="text-xs text-muted-foreground hover:text-foreground text-left"
                  onClick={() => handleNavigation('privacy')}
                >
                  Privacy Policy
                </button>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground text-left"
                  onClick={() => handleNavigation('terms')}
                >
                  Terms of Service
                </button>
              </div>

            </nav>
          </div>
        )}
      </header>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </>
  );
}
