import { createFileRoute } from '@tanstack/react-router';
import { UtilityHeader } from '@/components/UtilityHeader';

export const Route = createFileRoute('/support')({
  component: SupportRoute,
});

function SupportRoute() {
  return (
    <div className="min-h-screen bg-background">
      <UtilityHeader />

      <main className="container max-w-2xl py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Support</h1>

        <p className="text-muted-foreground mb-6">
          Need help? We’re here for you. Use the in-app support form or email our team:
        </p>

        <div className="rounded-md bg-muted px-4 py-3 font-mono text-sm mb-2">
          support@dailydoodleprompt.com
        </div>

        <p className="text-sm text-muted-foreground">
          We typically respond within 1–2 business days.
        </p>
      </main>
    </div>
  );
}
