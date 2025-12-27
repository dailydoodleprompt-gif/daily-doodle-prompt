// FILE: src/routes/privacy.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';

export const Route = createFileRoute('/privacy')({
  component: PrivacyRoute,
});

function PrivacyRoute() {
  return <PrivacyPolicyView onBack={() => window.history.back()} />;
}
