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
import { useAppStore } from '@/store/app-store';
import { AlertCircle, Loader2, Mail, KeyRound, CheckCircle2, ArrowLeft } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const resetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type EmailFormData = z.infer<typeof emailSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordDialog({
  open,
  onOpenChange,
  onBackToLogin,
}: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const { requestPasswordReset, resetPassword } = useAppStore();

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      token: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await requestPasswordReset(data.email);
      setResetToken(token);
      resetForm.setValue('token', token);
      setStep('reset');
    } catch (err) {
      // For security, always show success message even if email doesn't exist
      // In a real app, you'd still send an email with a link if the user exists
      setStep('reset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword(data.token, data.newPassword);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setError(null);
    setResetToken(null);
    emailForm.reset();
    resetForm.reset();
    onOpenChange(false);
  };

  const handleBackToLogin = () => {
    handleClose();
    onBackToLogin();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'email' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle>Forgot Password?</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a reset link
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  {...emailForm.register('email')}
                  disabled={isLoading}
                />
                {emailForm.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleBackToLogin}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </form>
          </>
        )}

        {step === 'reset' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle>Reset Your Password</DialogTitle>
              <DialogDescription>
                {resetToken
                  ? 'Enter the reset token and your new password (for demo, the token is pre-filled)'
                  : 'Check your email for the reset link and enter your new password'}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-token">Reset Token</Label>
                <Input
                  id="reset-token"
                  type="text"
                  placeholder="Enter reset token from email"
                  {...resetForm.register('token')}
                  disabled={isLoading}
                />
                {resetForm.formState.errors.token && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.token.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="At least 6 characters"
                  {...resetForm.register('newPassword')}
                  disabled={isLoading}
                />
                {resetForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  placeholder="Confirm your new password"
                  {...resetForm.register('confirmPassword')}
                  disabled={isLoading}
                />
                {resetForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {resetForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('email')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </form>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <DialogTitle>Password Reset Successfully!</DialogTitle>
              <DialogDescription>
                Your password has been updated. You can now sign in with your new password.
              </DialogDescription>
            </DialogHeader>

            <Button className="w-full" onClick={handleBackToLogin}>
              Back to Login
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
