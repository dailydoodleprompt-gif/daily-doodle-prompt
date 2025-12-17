import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UtilityHeaderProps {
  onBack?: () => void;
}

export function UtilityHeader({ onBack }: UtilityHeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
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

        <div className="ml-auto flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Pencil className="h-4 w-4" />
          DailyDoodlePrompt
        </div>
      </div>
    </header>
  );
}
