import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useOpenSheetPrompts } from '@/hooks/use-opensheet-prompts';
import { useAppStore, useIsAuthenticated, useUser } from '@/store/app-store';
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
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const [currentView, setCurrentView] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState('landing');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogDefaultTab, setAuthDialogDefaultTab] =
    useState<'login' | 'signup'>('login');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [viewingArtistId, setViewingArtistId] = useState<string | null>(null);

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
  }, []);

  useEffect(() => {
    if (!currentView) {
      if (isAuthenticated) {
        setCurrentView('prompt');
      } else {
        setCurrentView('landing');
      }
    }
  }, [isAuthenticated, currentView]);

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

  const handleNavigate = (view: string) => {
    if (!currentView) return;
    setPreviousView(currentView);
    setCurrentView(view);
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
    if (viewingArtistId) {
      setViewingArtistId(null);
    } else {
      setCurrentView(previousView);
    }
  };

  const handleViewArtist = (artistId: string) => {
    setViewingArtistId(artistId);
  };

  const renderView = () => {
    if (viewingArtistId) {
      return (
        <ArtistProfileView
          artistId={viewingArtistId}
          onBack={() => setViewingArtistId(null)}
          onPromptClick={() => {
            setViewingArtistId(null);
            handleNavigate('archive');
          }}
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
          />
        );
      case 'archive':
        return (
          <ArchiveView
            prompts={displayPrompts}
            isLoading={isLoading}
            error={error}
            onUpgrade={() => handleNavigate('pricing')}
          />
        );
      case 'bookmarks':
        return (
          <BookmarksView
            prompts={displayPrompts}
            onUpgrade={() => handleNavigate('pricing')}
            onBrowseArchive={() => handleNavigate('archive')}
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

  const showNavigation =
    currentView !== null &&
    !['landing', 'payment-success', 'payment-cancel'].includes(currentView);

  const showFooter =
    currentView !== null &&
    !['landing', 'payment-success', 'payment-cancel'].includes(currentView);

  if (!currentView) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {showNavigation && (
        <SimpleHeader currentView={currentView} onNavigate={handleNavigate} />
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