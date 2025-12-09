import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';

export const Route = createFileRoute('privacy')({
  component: () => <PrivacyPolicyView onBack={() => window.history.back()} />,
});
