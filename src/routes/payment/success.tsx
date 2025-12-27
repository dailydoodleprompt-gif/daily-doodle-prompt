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
        if (view === 'profile') {
          window.location.href = '/';
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
