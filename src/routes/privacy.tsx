// FILE: src/routes/privacy.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPolicyView } from '@/views/PrivacyPolicyView';

export const Route = createFileRoute('/')({
  component: PrivacyPolicyView,
});
