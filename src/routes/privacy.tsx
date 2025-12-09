import { createLazyFileRoute } from '@tanstack/react-router';
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';

export const Route = createLazyFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return <PrivacyPolicyView onBack={() => window.history.back()} />;
}
