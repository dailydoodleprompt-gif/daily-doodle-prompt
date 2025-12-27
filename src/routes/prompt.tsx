// FILE: src/routes/prompt.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/prompt')({
  component: PromptRedirect,
});

function PromptRedirect() {
  // Redirect to root; App will show Today's Prompt via currentView = 'prompt'
  window.location.replace('/');
  return null;
}
