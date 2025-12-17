// FILE: src/routes/support.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold mb-6">Support</h1>
      <p className="mb-4">
        Need help? We’re here for you. Use the in-app support form or email our team:
      </p>

      <p className="font-mono bg-gray-100 px-3 py-2 rounded">
        support@dailydoodleprompt.com
      </p>

      <p className="mt-6 text-sm text-gray-500">
        We typically respond within 1–2 business days.
      </p>
    </div>
  );
}
