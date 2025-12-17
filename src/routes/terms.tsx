// FILE: src/routes/terms.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({});


// FILE: src/routes/terms.tsx
import { createFileRoute } from '@tanstack/react-router';
import { TermsOfServiceView } from '@/views/TermsOfServiceView';

export const Route = createFileRoute('/')({
  component: PrivacyRoute,
});

function TermsRoute() {
  return <TermsofServiceView onBack={() => window.history.back()} />;
}
