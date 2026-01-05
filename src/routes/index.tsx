import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useOpenSheetPrompts } from '@/hooks/use-opensheet-prompts';
import { useAppStore, useIsAuthenticated, useUser, useHasHydrated } from '@/store/app-store';
import { SimpleHeader } from '@/components/SimpleHeader';
import { Footer } from '@/components/Footer';
import { AuthDialog } from '@/components/AuthDialog';
import { OnboardingDialog } from '@/components/OnboardingDialog';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import { BadgeUnlockPopup } from '@/components/BadgeUnlockPopup';
import { UsernameSetupDialog } from '@/components/UsernameSetupDialog';
import { LandingView } from '@/views/LandingView';
import { PromptView } from '@/views/PromptView';
import { ArchiveView } from '@/views/ArchiveView';
import { BookmarksView } from '@/views/BookmarksView';
import { ProfileView } from '@/views/ProfileView';
import { SettingsView } from '@/views/SettingsView';
import { PricingView } from '@/views/PricingView';
import { NotFoundView } from '@/views/NotFoundView';
import { AdminView } from '@/views/AdminView';
import { ArtistProfileView } from '@/views/ArtistProfileView';
import { PaymentSuccessView } from '@/views/PaymentSuccessView';
import { PaymentCancelView } from '@/views/PaymentCancelView';
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';
import { TermsOfServiceView } from '@/views/TermsOfServiceView';
import { NotificationsListView } from '@/views/NotificationsListView';
import { SupportView } from '@/views/SupportView';
import { PromptIdeaSubmissionView } from '@/views/PromptIdeaSubmissionView';
import { AdminSupportTicketsView } from '@/views/admin/AdminSupportTicketsView';

export const Route = createFileRoute('/')({
  component: App,
});

type Prompt = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  publish_date: string;
};

function App() {
  const hasHydrated = useHasHydrated();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  // Debug auth state on every render
  console.log('[App] Render - hasHydrated:', hasHydrated, 'isAuthenticated:', isAuthenticated, 'user:', user?.email || 'null');

  const [currentView, setCurrentView] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState('landing');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogDefaultTab, setAuthDialogDefaultTab] =
    useState<'login' | 'signup'>('login');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [viewingArtistId, setViewingArtistId] = useState<string | null>(null);
  const [archiveInitialPromptId, setArchiveInitialPromptId] = useState<string | null>(null);

  const showOnboarding = useAppStore((state) => state.showOnboarding);
  const needsUsernameSetup = isAuthenticated && user?.needs_username_setup;

  useEffect(() => {
    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');
    const path = url.pathname;

    if (sessionId) {
      setCurrentView('payment-success');
    } else if (canceled) {
      setCurrentView('payment-cancel');
    } else if (path === '/privacy') {
      setCurrentView('privacy');
    } else if (path === '/terms') {
      setCurrentView('terms');
    } else if (path === '/support') {
      setCurrentView('support');
    }

    if (sessionId || canceled) {
      const { protocol, host, pathname } = window.location;
      const cleanUrl = `${protocol}//${host}${pathname}`;
      window.history.replaceState({}, '', cleanUrl);
    }

    // Handle initial hash-based route
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      if (hash.startsWith('artist/')) {
        const artistId = hash.replace('artist/', '');
        setViewingArtistId(artistId);
      } else if (['prompt', 'archive', 'bookmarks', 'profile', 'settings', 'pricing', 'admin', 'notifications', 'prompt-ideas'].includes(hash)) {
        setCurrentView(hash);
      }
    }
  }, []);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      if (state) {
        if (state.artistId) {
          setViewingArtistId(state.artistId);
        } else {
          setViewingArtistId(null);
          if (state.view) {
            setCurrentView(state.view);
          }
        }
      } else {
        // No state means we're at the initial page
        const hash = window.location.hash.replace('#', '');
        if (hash.startsWith('artist/')) {
          setViewingArtistId(hash.replace('artist/', ''));
        } else if (hash && hash !== 'landing') {
          setViewingArtistId(null);
          setCurrentView(hash);
        } else {
          setViewingArtistId(null);
          setCurrentView(isAuthenticated ? 'prompt' : 'landing');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  useEffect(() => {
    console.log('[App] Auth effect - hasHydrated:', hasHydrated, 'currentView:', currentView, 'isAuthenticated:', isAuthenticated);
    // Wait for hydration before setting initial view
    if (!hasHydrated) {
      console.log('[App] Waiting for hydration, skipping view set');
      return;
    }
    if (!currentView) {
      const newView = isAuthenticated ? 'prompt' : 'landing';
      console.log('[App] Setting currentView to:', newView);
      setCurrentView(newView);
    }
  }, [hasHydrated, isAuthenticated, currentView]);

  const { data, isLoading, error } = useOpenSheetPrompts();
  const rawPrompts = (data as any[]) ?? [];

  const normalizePrompts = (items: any[]): Prompt[] =>
    items.map((item) => ({
      id: String(item.id ?? ''),
      title: String(item.title ?? ''),
      description: String(item.description ?? ''),
      category: String(item.category ?? ''),
      tags: Array.isArray(item.tags)
        ? item.tags.map((t: any) => String(t))
        : [],
      publish_date: String(item.publish_date ?? ''),
    }));

  const sheetPrompts: Prompt[] = normalizePrompts(rawPrompts);
  const demoPrompts: Prompt[] = [];
  const displayPrompts: Prompt[] =
    sheetPrompts.length > 0 ? sheetPrompts : demoPrompts;

  const handleNavigate = (view: string, replace = false) => {
    if (!currentView) return;
    setPreviousView(currentView);
    setCurrentView(view);
    // Clear archive prompt ID when navigating away from archive
    if (view !== 'archive') {
      setArchiveInitialPromptId(null);
    }
    // Update browser history for back/forward navigation
    const newUrl = view === 'landing' ? '/' : `/#${view}`;
    if (replace) {
      window.history.replaceState({ view, artistId: null }, '', newUrl);
    } else {
      window.history.pushState({ view, artistId: null }, '', newUrl);
    }
  };

  const handleNavigateToPrompt = (promptId: string) => {
    setArchiveInitialPromptId(promptId);
    handleNavigate('archive');
  };

  const handleSignUp = () => {
    setAuthDialogDefaultTab('signup');
    setAuthDialogOpen(true);
  };

  const handleLogin = () => {
    setAuthDialogDefaultTab('login');
    setAuthDialogOpen(true);
  };

  const handleGoBack = () => {
    // Use browser history for proper back navigation
    window.history.back();
  };

  const handleViewArtist = (artistId: string) => {
    setViewingArtistId(artistId);
    // Update browser history for back/forward navigation
    window.history.pushState({ view: currentView, artistId }, '', `/#artist/${artistId}`);
  };

  const renderView = () => {
    if (viewingArtistId) {
      return (
        <ArtistProfileView
          artistId={viewingArtistId}
          onBack={() => setViewingArtistId(null)}
          onPromptClick={(promptId: string) => {
            setViewingArtistId(null);
            handleNavigateToPrompt(promptId);
          }}
          onAuthRequired={handleLogin}
        />
      );
    }

    switch (currentView) {
      case 'landing':
        return (
          <LandingView
            onGetStarted={() => handleNavigate('prompt')}
            onSignUp={handleSignUp}
            onLogin={handleLogin}
            onPricing={() => handleNavigate('pricing')}
            onNavigate={handleNavigate}
          />
        );
      case 'prompt':
        return (
          <PromptView
            prompts={displayPrompts}
            isLoading={isLoading}
            error={error}
            onUserClick={handleViewArtist}
            onAuthRequired={handleLogin}
          />
        );
      case 'archive':
        return (
          <ArchiveView
            prompts={displayPrompts}
            isLoading={isLoading}
            error={error}
            onUpgrade={() => handleNavigate('pricing')}
            initialPromptId={archiveInitialPromptId || undefined}
            onAuthRequired={handleLogin}
          />
        );
      case 'bookmarks':
        return (
          <BookmarksView
            prompts={displayPrompts}
            onBrowseArchive={() => handleNavigate('archive')}
            onAuthRequired={handleLogin}
          />
        );
      case 'profile':
        return (
          <ProfileView
            prompts={displayPrompts}
            onUpgrade={() => handleNavigate('pricing')}
            onSettings={() => handleNavigate('settings')}
            onAdminDashboard={() => handleNavigate('admin')}
            onUserClick={handleViewArtist}
            onPromptClick={handleNavigateToPrompt}
          />
        );
      case 'settings':
        return (
          <SettingsView
            onBack={handleGoBack}
            onForgotPassword={() => setForgotPasswordOpen(true)}
            onUpgrade={() => handleNavigate('pricing')}
          />
        );
      case 'pricing':
        return <PricingView onSignUp={handleSignUp} />;
      case 'admin':
        return <AdminView onBack={handleGoBack} onNavigate={handleNavigate} />;
      case 'payment-success':
        return <PaymentSuccessView onNavigate={handleNavigate} />;
      case 'payment-cancel':
        return <PaymentCancelView onNavigate={handleNavigate} />;
      case 'privacy':
        return <PrivacyPolicyView onBack={handleGoBack} />;
      case 'terms':
        return <TermsOfServiceView onBack={handleGoBack} />;
      case 'support':
        return <SupportView onBack={handleGoBack} onLogin={handleLogin} />;
      case 'notifications':
        return (
          <NotificationsListView onBack={handleGoBack} onNavigate={handleNavigate} />
        );
      case 'prompt-ideas':
        return (
          <PromptIdeaSubmissionView
            onBack={handleGoBack}
            onUpgrade={() => handleNavigate('pricing')}
          />
        );
      case 'admin-support':
        return <AdminSupportTicketsView onBack={handleGoBack} />;
      default:
        return (
          <NotFoundView
            onGoHome={() => handleNavigate('landing')}
            onGoBack={handleGoBack}
          />
        );
    }
  };

  const showNavigation = currentView !== null && !['payment-success', 'payment-cancel'].includes(currentView);

  const showFooter =
    currentView !== null &&
    !['landing', 'payment-success', 'payment-cancel'].includes(currentView);

  // Wait for hydration before rendering
  if (!hasHydrated) {
    console.log('[App] Waiting for hydration...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentView) {
    console.log('[App] currentView is null after hydration, returning null');
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNavigation && (
        <SimpleHeader currentView={currentView} onNavigate={handleNavigate} onLoginClick={handleLogin} />
      )}

      <main className="flex-1">{renderView()}</main>

      {showFooter && <Footer />}

      <AuthDialog
        open={authDialogOpen}
        onOpenChange={setAuthDialogOpen}
        defaultTab={authDialogDefaultTab}
        onForgotPassword={() => setForgotPasswordOpen(true)}
        onAuthSuccess={() => handleNavigate('profile')}
        onNavigate={handleNavigate}
      />

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
        onBackToLogin={() => {
          setForgotPasswordOpen(false);
          setAuthDialogDefaultTab('login');
          setAuthDialogOpen(true);
        }}
      />

      <OnboardingDialog open={showOnboarding} onOpenChange={() => {}} />

      <UsernameSetupDialog
        open={needsUsernameSetup ?? false}
        onComplete={() => handleNavigate('profile')}
      />

      <BadgeUnlockPopup />
    </div>
  );
}