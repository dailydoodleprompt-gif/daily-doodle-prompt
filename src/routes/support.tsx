import { createFileRoute } from '@tanstack/react-router';
import { SupportView } from '@/views/SupportView';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: SupportRoute,
});

function SupportRoute() {
  const navigate = useNavigate();

  return (
    <SupportView
      onBack={() => navigate({ to: '/' })}
      onLogin={() => navigate({ to: '/' })}
    />
  );
}
