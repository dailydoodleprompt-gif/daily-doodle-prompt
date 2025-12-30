// FILE: src/routes/payment/cancel.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PaymentCancelView } from '@/views/PaymentCancelView';

export const Route = createFileRoute('/payment/cancel')({
  component: PaymentCancelRoute,
});

function PaymentCancelRoute() {
  return (
    <PaymentCancelView
      onNavigate={(view) => {
        if (view === 'pricing') {
          window.location.href = '/pricing';
          return;
        }

        if (view === 'prompt') {
          window.location.href = '/prompt';
          return;
        }

        // Safe fallback
        window.location.href = '/';
      }}
    />
  );
}
