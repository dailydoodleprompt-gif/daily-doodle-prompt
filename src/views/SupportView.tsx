import { useState } from 'react';
import { useAppStore, useUser, useIsAuthenticated } from '@/store/app-store';
import { type SupportTicketCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { AlertCircle, CheckCircle2, HelpCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { UtilityHeader } from '@/components/UtilityHeader';

interface SupportViewProps {
  onBack?: () => void;
  onLogin?: () => void;
}

export function SupportView({ onBack, onLogin }: SupportViewProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('other');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const user = useUser();
  const isAuthenticated = useIsAuthenticated();
  const createSupportTicket = useAppStore((state) => state.createSupportTicket);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!subject.trim()) {
      setError('Please enter a subject');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    if (message.length > 5000) {
      setError('Message is too long (max 5000 characters)');
      return;
    }

    setLoading(true);

    try {
      const result = await createSupportTicket(category, subject.trim(), message.trim());

      if (result.success) {
        setSuccess(true);
        setSubject('');
        setMessage('');
        setCategory('other');
        toast.success('Support ticket submitted successfully!');
      } else {
        throw new Error(result.error || 'Failed to create ticket');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit support ticket');
      toast.error('Failed to submit support ticket');
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container max-w-2xl py-16">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Please sign in to submit a support request</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={onLogin} className="w-full">
              Sign In
            </Button>
            {onBack && (
              <Button variant="outline" onClick={onBack} className="w-full">
                Go Back
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold">Contact Support</h1>
          <p className="text-muted-foreground mt-1">
            Need help? Submit a support request and we'll get back to you soon.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your support request has been submitted successfully. We'll review your ticket and
            get back to you soon. You'll receive a notification when we respond.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Support Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Support Request</CardTitle>
          <CardDescription>
            Fill out the form below and our team will respond as quickly as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as SupportTicketCategory)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account Issues</SelectItem>
                  <SelectItem value="billing">Billing & Payments</SelectItem>
                  <SelectItem value="bug">Bug Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                type="text"
                placeholder="Brief description of your issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-xs text-muted-foreground">
                {subject.length}/200 characters
              </p>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Please describe your issue in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                maxLength={5000}
                required
              />
              <p className="text-xs text-muted-foreground">
                {message.length}/5000 characters
              </p>
            </div>

            {/* User Info Display */}
            <div className="space-y-2">
              <Label>Your Contact Information</Label>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p>
                  <strong>Email:</strong> {user?.email}
                </p>
                <p>
                  <strong>Username:</strong> {user?.username}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                We'll use this information to respond to your request.
              </p>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Support Request'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">What happens next?</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Your support ticket will be sent to our team</li>
            <li>• We'll review your request and respond within 24-48 hours</li>
            <li>• You'll receive a notification when we reply</li>
            <li>• Check your email or the notifications bell icon in the header</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
