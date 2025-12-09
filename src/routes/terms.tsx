import { createFileRoute } from '@tanstack/react-router';
import { TermsOfServiceView } from '@/views/TermsOfServiceView';

export const Route = createFileRoute('/terms' as any)({
  component: TermsPage,
});

function TermsPage() {
  return <TermsOfServiceView onBack={() => window.history.back()} />;
}
