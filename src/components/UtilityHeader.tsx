import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UtilityHeaderProps {
  onBack?: () => void;
}

export function UtilityHeader({ onBack }: UtilityHeaderProps) {
  return (
    <header className="border-b bg-background">
      <div className="container flex h-14 items-center gap-4">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <button
          onClick={() => {
            window.location.href = '/';
          }}
          className="flex items-center gap-2 font-semibold"
        >
          <img
            src="/logo.svg"
            alt="Daily Doodle Prompt"
            className="h-7 w-auto"
          />
          <span className="hidden sm:inline">Daily Doodle Prompt</span>
        </button>
      </div>
    </header>
  );
}
