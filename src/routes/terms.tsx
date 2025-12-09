import { createFileRoute } from '@tanstack/react-router';
import { TermsOfServiceView } from '@/views/TermsOfServiceView';

export const Route = createFileRoute()({
  component: () => <TermsOfServiceView onBack={() => window.history.back()} />,
});
