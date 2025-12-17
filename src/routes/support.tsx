// src/routes/support.tsx
import { createFileRoute } from '@tanstack/react-router';
import { SupportView } from '@/views/SupportView';
import { UtilityHeader } from '@/components/UtilityHeader';

export const Route = createFileRoute('/support')({
  component: SupportRoute,
});

function SupportRoute() {
  return (
    <>
      <UtilityHeader />
      <SupportView />
    </>
  );
}
