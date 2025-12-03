import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppStore, useIsPremium, useIsAuthenticated, useUser } from '@/store/app-store';
import { Check, Crown, Sparkles, Infinity, Lock, Unlock, Image, Heart, Users, Rss, Lightbulb, Archive, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PricingViewProps {
  onSignUp: () => void;
}

// Free features available to all users
const freeFeatures = [
  { text: "Today's prompt + last 3 days in Prompt Vault", icon: Archive },
  { text: 'Favorite prompts', icon: Heart },
  { text: 'View public doodles', icon: Image },
  { text: 'Streak tracking & basic badges', icon: Sparkles },
];

// Premium features unlocked by lifetime purchase
const premiumFeatures = [
  { text: 'Access to ALL past prompts in the Doodle Vault', icon: Archive },
  { text: 'Upload doodles', icon: Image },
  { text: 'Public/Private doodle gallery', icon: Image },
  { text: 'Like public doodles', icon: Heart },
  { text: 'Follow other users', icon: Users },
  { text: 'Doodle Feed newsfeed', icon: Rss },
  { text: 'Submit original prompt ideas', icon: Lightbulb },
  { text: 'Eligibility for upload/like/follow badges', icon: Sparkles },
  { text: 'All future premium upgrades', icon: Infinity },
  { text: 'Monthly streak freeze token', icon: Sparkles },
];

export function PricingView({ onSignUp }: PricingViewProps) {
  const isAuthenticated = useIsAuthenticated();
  const isPremium = useIsPremium();
  const user = useUser();
  const purchaseLifetimeAccess = useAppStore((state) => state.purchaseLifetimeAccess);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (!isAuthenticated || !user) {
      onSignUp();
      return;
    }

    setIsProcessing(true);

    try {
      // Check if we're in development mode (no actual Stripe integration)
      const isDev = import.meta.env.DEV || !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

      if (isDev) {
        // Development mode - simulate payment
        toast.info('Development mode: Simulating payment...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        purchaseLifetimeAccess();
        setShowSuccessDialog(true);
        setIsProcessing(false);
        return;
      }

      // Production mode - use real Stripe
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
      setIsProcessing(false);
    }
  };

  return (
    <div className="container px-4 py-12 mx-auto max-w-5xl">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          <Infinity className="w-3 h-3 mr-1" />
          One-Time Purchase
        </Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Unlock Lifetime Access
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Pay once, unlock forever. No subscriptions, no recurring fees.
          Get full access to all premium features with a single purchase.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier Card */}
        <Card className="relative">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Free
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-1">forever</span>
            </div>
            <CardDescription className="mt-2">
              Get started with daily creative challenges
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              disabled={isAuthenticated}
              onClick={onSignUp}
            >
              {isAuthenticated ? 'Current Plan' : 'Create Free Account'}
            </Button>
          </CardFooter>
        </Card>

        {/* Lifetime Premium Card */}
        <Card className="relative border-primary shadow-lg scale-105 md:scale-110">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white gap-1">
              <Crown className="w-3 h-3" />
              Lifetime Access
            </Badge>
          </div>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Premium
            </CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$4.99</span>
              <span className="text-muted-foreground ml-1">one-time</span>
            </div>
            <CardDescription className="mt-2">
              Unlock everything, forever. No subscriptions.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              Everything in Free, plus:
            </p>
            <ul className="space-y-3">
              {premiumFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                    <Unlock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white"
              disabled={isPremium || isProcessing}
              onClick={handlePurchase}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : isPremium ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Lifetime Access Unlocked
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Unlock Lifetime Access
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Trust Indicators */}
      <div className="mt-16 text-center space-y-4">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>One-time payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>No subscriptions</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>Lifetime updates</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Questions? Contact us at{' '}
          <button type="button" className="text-primary hover:underline">
            support@dailydoodleprompt.com
          </button>
        </p>
      </div>

      {/* Purchase Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center flex items-center justify-center gap-2">
              <Crown className="w-8 h-8 text-amber-500" />
              Welcome to Premium!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your lifetime access has been unlocked!
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Unlock className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">You're all set!</h3>
              <p className="text-muted-foreground">
                All premium features are now unlocked. You've also earned the <strong>Premium Patron</strong> badge!
              </p>
            </div>
            <ul className="text-left space-y-2 bg-muted/50 rounded-lg p-4">
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Full Doodle Vault access
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Doodle uploads enabled
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Social features unlocked
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                Premium Patron badge awarded
              </li>
            </ul>
          </div>

          <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
            Start Exploring!
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
