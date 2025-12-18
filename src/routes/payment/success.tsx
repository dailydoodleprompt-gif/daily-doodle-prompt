// FILE: src/routes/payment/success.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PaymentSuccessView } from '@/views/PaymentSuccessView';

export const Route = createFileRoute('/payment/success')({
  component: PaymentSuccessRoute,
});

function PaymentSuccessRoute() {
  return (
    <PaymentSuccessView
      onNavigate={(view) => {
        // Keep utility routes simple and bulletproof: hard redirects.
        if (view === 'profile') {
          window.location.href = '/profile';
          return;
        }

        if (view === 'prompt') {
          window.location.href = '/';
          return;
        }
      }}
    />
  );
}
