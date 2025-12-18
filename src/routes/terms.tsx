// FILE: src/routes/terms.tsx
import { createFileRoute } from '@tanstack/react-router';
import { TermsOfServiceView } from '@/views/TermsOfServiceView';

export const Route = createFileRoute('/')({
  component: TermsRoute,
});

function TermsRoute() {
  return <TermsOfServiceView onBack={() => window.history.back()} />;
}
