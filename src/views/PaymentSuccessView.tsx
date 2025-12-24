import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { Crown, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/sdk/core/supabase';

interface PaymentSuccessViewProps {
  onNavigate: (view: string) => void;
}

export function PaymentSuccessView({ onNavigate }: PaymentSuccessViewProps) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const purchaseLifetimeAccess = useAppStore((state) => state.purchaseLifetimeAccess);
  const user = useAppStore((state) => state.user);

  useEffect(() => {
    const verifyPayment = async () => {
      // Get session_id from URL
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (!sessionId) {
        setError('No session ID found');
        setIsVerifying(false);
        return;
      }

      try {
        // Verify the session with our API
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);

        if (!response.ok) {
          throw new Error('Failed to verify payment');
        }

        const data = await response.json();

        if (data.paid) {
          // Update user premium status in app store
          purchaseLifetimeAccess();
          
          // Also update in Supabase via API if user is logged in
          if (user) {
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData.session) {
                await fetch('/api/me', {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${sessionData.session.access_token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ 
                    is_premium: true,
                    stripe_customer_id: data.stripeCustomerId,
                    stripe_session_id: data.sessionId,
                  }),
                });
              }
            } catch (err) {
              console.error('Failed to update premium status in database:', err);
              // Don't fail the whole flow if this fails
            }
          }

          setVerified(true);
          toast.success('Payment verified! Premium features unlocked.');
        } else {
          setError('Payment not completed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err instanceof Error ? err.message : 'Verification failed');
        toast.error('Failed to verify payment');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [purchaseLifetimeAccess, user]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              Verifying Payment
            </CardTitle>
            <CardDescription>
              Please wait while we confirm your purchase...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <CardTitle>Verification Failed</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Please contact support if you were charged.
            </p>
            <Button onClick={() => onNavigate('pricing')} variant="outline">
              Return to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to Premium!</CardTitle>
          <CardDescription>
            Your lifetime access has been unlocked
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium">Premium features now unlocked:</p>
            <ul className="space-y-2">
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

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onNavigate('prompt')}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white"
            >
              Start Exploring
            </Button>
            {user && (
              <Button
                onClick={() => onNavigate('profile')}
                variant="outline"
                className="w-full"
              >
                View Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}