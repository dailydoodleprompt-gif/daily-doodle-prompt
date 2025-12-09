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
  const showOnboarding = useAppStore((state) => state.showOnboarding);

  const [currentView, setCurrentView] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState('landing');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogDefaultTab, setAuthDialogDefaultTab] = useState<'login' | 'signup'>('login');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [viewingArtistId, setViewingArtistId] = useState<string | null>(null);

  const needsUsernameSetup = isAuthenticated && user?.needs_username_setup;

  // ✅ ✅ URL → VIEW MAPPING (THIS FIXES STRIPE LINKS)
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/privacy') setCurrentView('privacy');
    else if (path === '/terms') setCurrentView('terms');
    else if (path === '/support') setCurrentView('support');
    else if (path === '/pricing') setCurrentView('pricing');
    else if (isAuthenticated) setCurrentView('prompt');
    else setCurrentView('landing');
  }, [isAuthenticated]);

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
    window.history.pushState({}, '', view === 'landing' ? '/' : `/${view}`);
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

  if (!currentView) return null;

  const showNavigation = !['landing', 'payment-success', 'payment-cancel'].includes(currentView);

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
        return <LandingView onGetStarted={() => handleNavigate('prompt')} onSignUp={handleSignUp} onLogin={handleLogin} onPricing={() => handleNavigate('pricing')} onNavigate={handleNavigate} />;
      case 'prompt':
        return <PromptView prompts={displayPrompts} isLoading={isLoading} error={error} onUserClick={handleViewArtist} />;
      case 'archive':
        return <ArchiveView prompts={displayPrompts} isLoading={isLoading} error={error} onUpgrade={() => handleNavigate('pricing')} />;
      case 'bookmarks':
        return <BookmarksView prompts={displayPrompts} onUpgrade={() => handleNavigate('pricing')} onBrowseArchive={() => handleNavigate('archive')} />;
      case 'profile':
        return <ProfileView prompts={displayPrompts} onUpgrade={() => handleNavigate('pricing')} onSettings={() => handleNavigate('settings')} onAdminDashboard={() => handleNavigate('admin')} onUserClick={handleViewArtist} />;
      case 'settings':
        return <SettingsView onBack={handleGoBack} onForgotPassword={() => setForgotPasswordOpen(true)} onUpgrade={() => handleNavigate('pricing')} />;
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
      case 'notifications':
        return <NotificationsListView onBack={handleGoBack} onNavigate={handleNavigate} />;
      case 'support':
        return <SupportView onBack={handleGoBack} onLogin={handleLogin} />;
      case 'prompt-ideas':
        return <PromptIdeaSubmissionView onBack={handleGoBack} onUpgrade={() => handleNavigate('pricing')} />;
      case 'admin-support':
        return <AdminSupportTicketsView onBack={handleGoBack} />;
      default:
        return <NotFoundView onGoHome={() => handleNavigate('landing')} onGoBack={handleGoBack} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation currentView={currentView} onNavigate={handleNavigate} />}
      <main>{renderView()}</main>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} defaultTab={authDialogDefaultTab} onForgotPassword={() => setForgotPasswordOpen(true)} onAuthSuccess={() => handleNavigate('profile')} onNavigate={handleNavigate} />
      <ForgotPasswordDialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen} />
      <OnboardingDialog open={showOnboarding} onOpenChange={() => {}} />
      <UsernameSetupDialog open={needsUsernameSetup ?? false} onComplete={() => handleNavigate('profile')} />
      <BadgeUnlockPopup />
    </div>
  );
}

// ✅ Demo prompts preserved (unchanged)
function getDemoPrompts() {
  const getDateOffsetEST = (days: number): string => {
    const now = new Date();
    const estNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    estNow.setDate(estNow.getDate() + days);
    const year = estNow.getFullYear();
    const month = String(estNow.getMonth() + 1).padStart(2, '0');
    const day = String(estNow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = (offset: number) => getDateOffsetEST(offset);

  return [
    { id: formatDate(0), title: 'A yeti performing cool snowboard tricks.', description: 'Massive yeti executing daring stunts across snowy mountain slope', category: 'Silly', tags: ['yeti', 'snowboard'], publish_date: formatDate(0) },
    { id: formatDate(-1), title: 'A scarecrow who protects a pumpkin village.', category: 'Spooky', publish_date: formatDate(-1) },
  ];
}
