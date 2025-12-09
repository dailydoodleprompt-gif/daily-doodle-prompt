import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';

export const Route = createFileRoute('/privacy' as any)({
  component: PrivacyPage,
});

function PrivacyPage() {
  return <PrivacyPolicyView onBack={() => window.history.back()} />;
}
