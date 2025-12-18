// FILE: src/routes/payment/cancel.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PaymentCancelView } from '@/views/PaymentCancelView';

export const Route = createFileRoute('/payment/cancel')({
  component: PaymentCancelRoute,
});

function PaymentCancelRoute() {
  return <PaymentCancelView />;
}
