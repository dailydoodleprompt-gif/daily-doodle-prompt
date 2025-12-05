import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppStore, useUser } from '@/store/app-store';
import { AlertCircle, Loader2, User, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const usernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
});

type UsernameFormData = z.infer<typeof usernameSchema>;

interface UsernameSetupDialogProps {
  open: boolean;
  onComplete?: () => void;
}

export function UsernameSetupDialog({ open, onComplete }: UsernameSetupDialogProps) {
  const user = useUser();
  const completeUsernameSetup = useAppStore((state) => state.completeUsernameSetup);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
    defaultValues: {
      username: '',
    },
    mode: 'onChange',
  });

  const watchedUsername = form.watch('username');
  const isValidFormat =
    watchedUsername.length >= 3 &&
    watchedUsername.length <= 20 &&
    /^[a-zA-Z0-9_]+$/.test(watchedUsername);

  const handleSubmit = async (data: UsernameFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await completeUsernameSetup(data.username);
      onComplete?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set username');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle>Choose Your Username</DialogTitle>
          <DialogDescription>
            Pick a unique username to show on your profile and doodles.
            You can change this later in settings.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="your_username"
                {...form.register('username')}
                disabled={isLoading}
                className={cn(
                  'pr-10',
                  form.formState.errors.username && 'border-destructive'
                )}
              />
              {watchedUsername.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidFormat ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>

            {form.formState.errors.username && (
              <p className="text-sm text-destructive">
                {form.formState.errors.username.message}
              </p>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p
                className={cn(
                  watchedUsername.length >= 3 && watchedUsername.length <= 20
                    ? 'text-green-600'
                    : ''
                )}
              >
                {watchedUsername.length >= 3 && watchedUsername.length <= 20 ? '✓' : '•'} 3-20 characters
              </p>
              <p
                className={cn(
                  watchedUsername.length > 0 && /^[a-zA-Z0-9_]+$/.test(watchedUsername)
                    ? 'text-green-600'
                    : ''
                )}
              >
                {watchedUsername.length > 0 && /^[a-zA-Z0-9_]+$/.test(watchedUsername)
                  ? '✓'
                  : '•'}{' '}
                Letters, numbers, and underscores only
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !isValidFormat}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
