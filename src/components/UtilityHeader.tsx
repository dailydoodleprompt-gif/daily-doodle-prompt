import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UtilityHeaderProps {
  onBack?: () => void;
}

export function UtilityHeader({ onBack }: UtilityHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background">
      <div className="container flex h-14 items-center gap-2 px-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        )}

        <span className="text-sm font-medium text-muted-foreground">
          DailyDoodlePrompt
        </span>
      </div>
    </header>
  );
}
