import { useState } from 'react';
import { useAppStore, useUser, useIsAuthenticated } from '@/store/app-store';
import { type SupportTicketCategory } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UtilityHeader } from '@/components/UtilityHeader';

interface SupportViewProps {
  onBack?: () => void;
  onLogin?: () => void;
}

export function SupportView({ onBack, onLogin }: SupportViewProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] =
    useState<SupportTicketCategory>('other');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const createSupportTicket = useAppStore(
    (state) => state.createSupportTicket,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);

    try {
      const result = await createSupportTicket(
        category,
        subject.trim(),
        message.trim(),
      );

      if (result.success) {
        setSuccess(true);
        setSubject('');
        setMessage('');
        setCategory('other');
        toast.success('Support ticket submitted');
      } else {
        throw new Error(result.error || 'Failed to submit');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit support request',
      );
    } finally {
      setLoading(false);
    }
  };

  // Logged out view
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <UtilityHeader onBack={onBack} />

        <main className="container max-w-2xl py-16">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Please sign in to submit a support request
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={onLogin}>Sign In</Button>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Go Back
                </Button>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Logged in view
  return (
    <div className="min-h-screen bg-background">
      <UtilityHeader onBack={onBack} />

      <main className="container max-w-2xl py-8">
        <h1 className="text-3xl font-bold mb-2">Contact Support</h1>
        <p className="text-muted-foreground mb-6">
          Submit a support request and we’ll get back to you.
        </p>

        {success && (
          <Alert className="mb-6 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Your support request has been submitted.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Submit Support Request</CardTitle>
            <CardDescription>
              Our team typically responds within 1–2 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={category}
                  onValueChange={(v) =>
                    setCategory(v as SupportTicketCategory)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
