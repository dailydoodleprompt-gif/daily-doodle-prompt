import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';

export const Route = createFileRoute()({
  component: () => <PrivacyPolicyView onBack={() => window.history.back()} />,
});
