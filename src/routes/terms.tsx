import { createLazyFileRoute } from '@tanstack/react-router';
import { TermsOfServiceView } from '@/views/TermsOfServiceView';

export const Route = createLazyFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  return <TermsOfServiceView onBack={() => window.history.back()} />;
}
