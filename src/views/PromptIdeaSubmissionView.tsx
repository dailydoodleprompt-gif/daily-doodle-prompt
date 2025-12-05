import { useState } from 'react';
import { useAppStore, useUser, useIsPremium } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Lightbulb, Crown, ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface PromptIdeaSubmissionViewProps {
  onBack?: () => void;
  onUpgrade?: () => void;
}

export function PromptIdeaSubmissionView({ onBack, onUpgrade }: PromptIdeaSubmissionViewProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const user = useUser();
  const isPremium = useIsPremium();
  const submitPromptIdeaPremium = useAppStore((state) => state.submitPromptIdeaPremium);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }

    if (title.length > 200) {
      setError('Title is too long (max 200 characters)');
      return;
    }

    if (description.length > 2000) {
      setError('Description is too long (max 2000 characters)');
      return;
    }

    setLoading(true);

    try {
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const result = await submitPromptIdeaPremium(
        title.trim(),
        description.trim(),
        tagsArray.length > 0 ? tagsArray : undefined
      );

      if (result.success) {
        setSuccess(true);
        setTitle('');
        setDescription('');
        setTags('');
        toast.success('Prompt idea submitted successfully!');
      } else {
        throw new Error(result.error || 'Failed to submit idea');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit prompt idea');
      toast.error('Failed to submit prompt idea');
    } finally {
      setLoading(false);
    }
  };

  // If not premium, show upgrade prompt
  if (!isPremium) {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="border-2 border-primary">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
              <Crown className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <CardTitle>Premium Feature</CardTitle>
            <CardDescription>
              Submit prompt ideas is a premium-only feature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                What you get with Premium:
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Submit your creative prompt ideas</li>
                <li>• Earn the exclusive "Idea Fairy" badge</li>
                <li>• See your ideas featured in future prompts</li>
                <li>• Get notified when your ideas are reviewed</li>
                <li>• Plus all other premium benefits</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={onUpgrade} className="w-full">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
              {onBack && (
                <Button variant="outline" onClick={onBack} className="w-full">
                  Go Back
                </Button>
              )}
            </div>
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
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">Submit Prompt Idea</h1>
            <Badge variant="secondary" className="gap-1">
              <Crown className="h-3 w-3" />
              Premium
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Share your creative prompt ideas with the community
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Thank you for your submission!</strong> Your prompt idea has been received
            and will be reviewed by our team. You'll be notified when it's reviewed. If this is
            your first submission, check your badges - you may have earned "Idea Fairy"!
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

      {/* Submission Form */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>Share Your Idea</CardTitle>
              <CardDescription>
                Describe your prompt idea in detail. The best ideas may be featured in future
                daily prompts!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Prompt Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., A robot learning to paint watercolors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                required
              />
              <p className="text-xs text-muted-foreground">
                {title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your prompt idea in detail. What should be happening? What's the mood or setting? The more detail, the better!"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                maxLength={2000}
                required
              />
              <p className="text-xs text-muted-foreground">
                {description.length}/2000 characters
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (optional)</Label>
              <Input
                id="tags"
                type="text"
                placeholder="e.g., robot, art, watercolor, wholesome"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated tags that describe your prompt (e.g., cozy, adventure, silly)
              </p>
            </div>

            {/* User Info Display */}
            <div className="space-y-2">
              <Label>Your Information</Label>
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                <p>
                  <strong>Username:</strong> {user?.username}
                </p>
                <p className="text-xs mt-1">
                  If your idea is featured, you'll be credited!
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={loading}>
              <Lightbulb className="mr-2 h-4 w-4" />
              {loading ? 'Submitting...' : 'Submit Prompt Idea'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Tips for great prompt ideas:</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Be specific and descriptive</li>
            <li>• Include interesting details (setting, mood, actions)</li>
            <li>• Think about what would inspire creative doodles</li>
            <li>• Keep it family-friendly and positive</li>
            <li>• Avoid overly complex or technical subjects</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
