import { useNavigate } from '@tanstack/react-router';

export function UtilityHeader() {
  const navigate = useNavigate();

  return (
    <header className="w-full border-b bg-background">
      <div className="container mx-auto flex h-14 items-center px-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 font-semibold hover:opacity-80 transition"
        >
          <img
            src="/logo.svg"
            alt="Daily Doodle Prompt"
            className="h-8 w-auto"
          />
          <span className="hidden sm:inline-block">DailyDoodlePrompt</span>
        </button>
      </div>
    </header>
  );
}
