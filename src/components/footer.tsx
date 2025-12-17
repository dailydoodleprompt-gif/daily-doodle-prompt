export function Footer() {
  return (
    <footer className="py-8 border-t">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" className="h-8 w-auto" />
            <span className="font-semibold">DailyDoodlePrompt</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-foreground">Privacy</a>
            <a href="/terms" className="hover:text-foreground">Terms</a>
            <a href="/support" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
