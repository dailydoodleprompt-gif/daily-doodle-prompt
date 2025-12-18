// FILE: src/routes/prompt.tsx
import { createFileRoute } from '@tanstack/react-router';
import { PromptView } from '@/views/PromptView';

export const Route = createFileRoute('/')({
  component: PromptRoute,
});

function PromptRoute() {
  return <PromptView />;
}