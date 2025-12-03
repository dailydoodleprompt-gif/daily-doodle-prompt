import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pencil, Home, ArrowLeft } from 'lucide-react';

interface NotFoundViewProps {
  onGoHome: () => void;
  onGoBack: () => void;
}

export function NotFoundView({ onGoHome, onGoBack }: NotFoundViewProps) {
  return (
    <div className="container px-4 py-16 mx-auto max-w-lg">
      <Card>
        <CardContent className="py-12 text-center">
          {/* Playful illustration */}
          <div className="relative inline-block mb-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-muted mx-auto">
              <Pencil className="h-16 w-16 text-muted-foreground transform rotate-45" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 border shadow-sm">
              <span className="text-2xl">?</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-2">404</h1>
          <h2 className="text-xl font-semibold mb-4 text-muted-foreground">
            Oops! Looks like this page is still sketching itself.
          </h2>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            The page you're looking for doesn't exist or has been moved. Maybe
            it's off drawing inspiration somewhere?
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={onGoBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Button onClick={onGoHome} className="gap-2">
              <Home className="w-4 h-4" />
              Return Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
