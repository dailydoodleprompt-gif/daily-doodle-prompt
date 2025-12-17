export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container px-4 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Daily Doodle Prompt"
            className="h-8 w-auto"
          />
          <span className="font-semibold">DailyDoodlePrompt</span>
        </div>

        <div className="flex gap-6 text-sm text-muted-foreground">
          <a
            href="/privacy"
            className="hover:text-foreground transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="hover:text-foreground transition-colors"
          >
            Terms of Service
          </a>
          <a
            href="/support"
            className="hover:text-foreground transition-colors"
          >
            Support
          </a>
        </div>
      </div>
    </footer>
  );
}
