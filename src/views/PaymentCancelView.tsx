import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface PaymentCancelViewProps {
  onNavigate: (view: string) => void;
}

export function PaymentCancelView({ onNavigate }: PaymentCancelViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <CardTitle>Payment Canceled</CardTitle>
          <CardDescription>
            Your payment was canceled. No charges were made.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            You can try again anytime you're ready to upgrade to premium.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onNavigate('pricing')}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              onClick={() => onNavigate('prompt')}
              variant="outline"
              className="w-full"
            >
              Continue Exploring
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
