import { useState, useEffect, useRef } from 'react';
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

// OpenSheet API URL for daily doodle prompts
// Source Sheet: https://docs.google.com/spreadsheets/d/1tWJQOUhUfENl-xBd-TOQEv0BmaRb5USG/edit
// API: https://opensheet.elk.sh/1tWJQOUhUfENl-xBd-TOQEv0BmaRb5USG/Sheet1

function App() {
  const isAuthenticated = useIsAuthenticated();
const user = useUser();

const [currentView, setCurrentView] = useState<string | null>(null);

  const [previousView, setPreviousView] = useState('landing');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogDefaultTab, setAuthDialogDefaultTab] = useState<'login' | 'signup'>('login');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [viewingArtistId, setViewingArtistId] = useState<string | null>(null);

  const isAuthenticated = useIsAuthenticated();
  const user = useUser();
  const showOnboarding = useAppStore((state) => state.showOnboarding);

  // Show username setup dialog for OAuth users who need to choose a username
  const needsUsernameSetup = isAuthenticated && user?.needs_username_setup;

    // Handle payment success/cancel routes on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const canceled = urlParams.get('canceled');

    if (sessionId) {
      setCurrentView('payment-success');
    } else if (canceled) {
      setCurrentView('payment-cancel');
    }

    // Clean the URL so we don't keep query params around
    if (sessionId || canceled) {
      const { protocol, host, pathname } = window.location;
      const cleanUrl = `${protocol}//${host}${pathname}`;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // ✅ Restore correct view after auth hydration (prevents logout on refresh)
useEffect(() => {
  if (!currentView) {
    if (isAuthenticated) {
      setCurrentView('prompt'); // ✅ Resume logged-in state
    } else {
      setCurrentView('landing'); // ✅ True logged-out users only
    }
  }
}, [isAuthenticated, currentView]);


  // Fetch prompts from OpenSheet API (no auth required)
  const {
    data: prompts = [],
    isLoading,
    error,
  } = useOpenSheetPrompts();

  // Demo prompts as fallback when API fails or returns empty
  const demoPrompts = getDemoPrompts();
  const displayPrompts = prompts.length > 0 ? prompts : demoPrompts;

  const handleNavigate = (view: string) => {
  if (!currentView) return; // ✅ Prevent pre-hydration navigation crash
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

  // Render view based on current state
  const renderView = () => {
    // If viewing an artist profile, show that instead
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
      case 'notifications':
        return <NotificationsListView onBack={handleGoBack} onNavigate={handleNavigate} />;
      case 'support':
        return <SupportView onBack={handleGoBack} onLogin={handleLogin} />;
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

  // Show navigation for all views except landing and payment pages
  const showNavigation = !['landing', 'payment-success', 'payment-cancel'].includes(currentView);

  if (!currentView) return null;

return (

    <div className="min-h-screen bg-background">
      {showNavigation && (
        <Navigation currentView={currentView} onNavigate={handleNavigate} />
      )}

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

      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={() => {}}
      />

      {/* Username setup dialog - shows for OAuth users who need to pick a username */}
      <UsernameSetupDialog
        open={needsUsernameSetup ?? false}
        onComplete={() => handleNavigate('profile')}
      />

      {/* Badge unlock popup - shows when a new badge is earned */}
      <BadgeUnlockPopup />
    </div>
  );
}

// Demo prompts for testing without Google Sheets
// Format matches the updated Google Sheet structure (id, prompt, description, category, tags)
// Uses EST timezone for consistent date handling across all users
function getDemoPrompts() {
  // Import inline to avoid circular dependencies
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
    {
      id: formatDate(0),
      title: 'A yeti performing cool snowboard tricks.',
      description:
        'Massive yeti executing daring stunts across snowy mountain slope',
      category: 'Silly',
      tags: ['yeti', 'snowboard', 'tricks', 'mountain', 'snow', 'goggles', 'ramp'],
      publish_date: formatDate(0),
    },
    {
      id: formatDate(-1),
      title: 'A scarecrow who protects a pumpkin village.',
      description:
        'Tall scarecrow guarding cozy pumpkin village with glowing windows',
      category: 'Spooky',
      tags: ['scarecrow', 'pumpkin village', 'lantern', 'crow', 'fields', 'guardian', 'hay'],
      publish_date: formatDate(-1),
    },
    {
      id: formatDate(-2),
      title: 'A fox warrior discovering ancient ruins.',
      description:
        'Brave fox exploring forgotten temple with mysterious symbols and torchlight',
      category: 'Adventure',
      tags: ['fox', 'warrior', 'ruins', 'torch', 'temple', 'armor', 'exploration'],
      publish_date: formatDate(-2),
    },
    {
      id: formatDate(-3),
      title: 'A dragon working as a mail carrier.',
      description:
        'Determined dragon delivering letters and parcels across town',
      category: 'Fantasy',
      tags: ['dragon', 'mailbag', 'letters', 'wings', 'delivery', 'town', 'post office'],
      publish_date: formatDate(-3),
    },
    {
      id: formatDate(-4),
      title: 'A rabbit reciting a dramatic poem to their secret crush.',
      description:
        'Nervous rabbit performing poetry under spotlight for someone special',
      category: 'Cozy',
      tags: ['rabbit', 'poetry', 'crush', 'stage', 'microphone', 'spotlight', 'audience'],
      publish_date: formatDate(-4),
    },
    {
      id: formatDate(-5),
      title: 'A clockmaker building a machine powered by planets and stars.',
      description:
        'Cluttered workshop scene with clockmaker inventing cosmic-powered device',
      category: 'Sci-Fi',
      tags: ['clockmaker', 'machine', 'planets', 'stars', 'gears', 'workshop', 'orrery'],
      publish_date: formatDate(-5),
    },
    {
      id: formatDate(-6),
      title: 'An owl with a tiny mouse rider soaring through a glowing forest.',
      description:
        'Owl gliding through luminescent forest with brave mouse passenger',
      category: 'Adventure',
      tags: ['owl', 'mouse rider', 'forest', 'glowing plants', 'flight', 'saddle', 'friendship'],
      publish_date: formatDate(-6),
    },
    {
      id: formatDate(-7),
      title: 'A carousel haunted by enchanted animals.',
      description:
        'Spooky carousel with magical carved animals coming alive under carnival lights',
      category: 'Spooky',
      tags: ['carousel', 'enchanted animals', 'haunted', 'carnival', 'horses', 'lights', 'ride'],
      publish_date: formatDate(-7),
    },
    {
      id: formatDate(-8),
      title: 'An engineer on a locomotive powered by laughter.',
      description:
        'Colorful train moving only when people laugh nearby',
      category: 'Silly',
      tags: ['engineer', 'locomotive', 'laughter', 'train', 'jokes', 'passengers', 'megaphone'],
      publish_date: formatDate(-8),
    },
    {
      id: formatDate(-9),
      title: 'A baker who makes extraordinary loaves of bread.',
      description:
        'Proud baker displaying bizarre, beautiful loaves with magical qualities',
      category: 'Cozy',
      tags: ['baker', 'bread', 'bakery', 'magical ingredients', 'oven', 'loaves', 'kitchen'],
      publish_date: formatDate(-9),
    },
  ];
}
