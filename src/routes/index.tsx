import { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useOpenSheetPrompts } from '@/hooks/use-opensheet-prompts';
import { useAppStore, useIsAuthenticated, useUser } from '@/store/app-store';
import { Navigation } from '@/components/Navigation';
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

function App() {
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  const [currentView, setCurrentView] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState('landing');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogDefaultTab, setAuthDialogDefaultTab] = useState<'login' | 'signup'>('login');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [viewingArtistId, setViewingArtistId] = useState<string | null>(null);

  const showOnboarding = useAppStore((state) => state.showOnboarding);
  const needsUsernameSetup = isAuthenticated && user?.needs_username_setup;

  // Payment return handling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');

    if (sessionId) {
      setCurrentView('payment-success');
    } else if (canceled) {
      setCurrentView('payment-cancel');
    }

    if (sessionId || canceled) {
      const { protocol, host, pathname } = window.location;
      const cleanUrl = `${protocol}//${host}${pathname}`;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // ✅ Auth hydration restore
  useEffect(() => {
    if (!currentView) {
      setCurrentView(isAuthenticated ? 'prompt' : 'landing');
    }
  }, [isAuthenticated, currentView]);

  const {
    data: prompts = [],
    isLoading,
    error,
  } = useOpenSheetPrompts();

  const demoPrompts = getDemoPrompts();
  const displayPrompts = prompts.length > 0 ? prompts : demoPrompts;

  const handleNavigate = (view: string) => {
    if (!currentView) return;
    setPreviousView(currentView);
    setCurrentView(view);
  };

  const handleGoBack = () => {
    if (viewingArtistId) {
      setViewingArtistId(null);
    } else {
      setCurrentView(previousView);
    }
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
        return <LandingView onGetStarted={() => handleNavigate('prompt')} onSignUp={() => setAuthDialogOpen(true)} onLogin={() => setAuthDialogOpen(true)} onPricing={() => handleNavigate('pricing')} onNavigate={handleNavigate} />;
      case 'prompt':
        return <PromptView prompts={displayPrompts} isLoading={isLoading} error={error} onUserClick={setViewingArtistId} />;
      case 'archive':
        return <ArchiveView prompts={displayPrompts} isLoading={isLoading} error={error} onUpgrade={() => handleNavigate('pricing')} />;
      case 'bookmarks':
        return <BookmarksView prompts={displayPrompts} onUpgrade={() => handleNavigate('pricing')} onBrowseArchive={() => handleNavigate('archive')} />;
      case 'profile':
        return <ProfileView prompts={displayPrompts} onUpgrade={() => handleNavigate('pricing')} onSettings={() => handleNavigate('settings')} onAdminDashboard={() => handleNavigate('admin')} onUserClick={setViewingArtistId} />;
      case 'settings':
        return <SettingsView onBack={handleGoBack} onForgotPassword={() => setForgotPasswordOpen(true)} onUpgrade={() => handleNavigate('pricing')} />;
      case 'pricing':
        return <PricingView onSignUp={() => setAuthDialogOpen(true)} />;
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
      case 'notifications':
        return <NotificationsListView onBack={handleGoBack} onNavigate={handleNavigate} />;
      case 'support':
        return <SupportView onBack={handleGoBack} onLogin={() => setAuthDialogOpen(true)} />;
      case 'prompt-ideas':
        return <PromptIdeaSubmissionView onBack={handleGoBack} onUpgrade={() => handleNavigate('pricing')} />;
      case 'admin-support':
        return <AdminSupportTicketsView onBack={handleGoBack} />;
      default:
        return <NotFoundView onGoHome={() => handleNavigate('landing')} onGoBack={handleGoBack} />;
    }
  };

  const showNavigation = !['landing', 'payment-success', 'payment-cancel'].includes(currentView ?? '');

  if (!currentView) return null;

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation currentView={currentView} onNavigate={handleNavigate} />}

      <main>{renderView()}</main>

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

      <UsernameSetupDialog open={needsUsernameSetup ?? false} onComplete={() => handleNavigate('profile')} />

      <BadgeUnlockPopup />
    </div>
  );
}

function getDemoPrompts() {
  return [];
}
