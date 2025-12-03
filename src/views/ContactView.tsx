import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, MessageCircle, Bug, CreditCard, Sparkles } from 'lucide-react';

interface ContactViewProps {
  onBack: () => void;
}

export function ContactView({ onBack }: ContactViewProps) {
  const supportCategories = [
    {
      icon: MessageCircle,
      title: 'General Questions',
      description: 'Questions about how DailyDoodlePrompt works',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: CreditCard,
      title: 'Billing & Premium',
      description: 'Questions about premium features, payments, or refunds',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
    },
    {
      icon: Bug,
      title: 'Technical Issues',
      description: 'Report bugs, errors, or technical problems',
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
    {
      icon: Sparkles,
      title: 'Feedback & Suggestions',
      description: 'Share ideas for new features or improvements',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contact & Support</h1>
            <p className="text-muted-foreground">We're here to help!</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>
                Have a question, issue, or feedback? We'd love to hear from you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border bg-muted/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Mail className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Email Support</p>
                  <a
                    href="mailto:support@dailydoodleprompt.com"
                    className="text-primary hover:underline"
                  >
                    support@dailydoodleprompt.com
                  </a>
                </div>
                <Button asChild variant="outline">
                  <a href="mailto:support@dailydoodleprompt.com">
                    Send Email
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We typically respond within 24-48 hours during business days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What Can We Help You With?</CardTitle>
              <CardDescription>
                Here are some common topics our support team can assist with:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {supportCategories.map((category) => (
                  <div
                    key={category.title}
                    className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 transition-colors"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${category.bg}`}>
                      <category.icon className={`h-5 w-5 ${category.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before You Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>To help us assist you more quickly, please include:</p>
              <ul>
                <li>Your account email or username</li>
                <li>A clear description of your issue or question</li>
                <li>Screenshots (if reporting a bug or visual issue)</li>
                <li>Your browser and device type (for technical issues)</li>
                <li>Order number (for billing inquiries)</li>
              </ul>

              <h4 className="font-semibold mt-6 mb-2">Common Issues</h4>
              <p><strong>Forgot Password:</strong> Use the "Forgot Password" link on the login page to reset your password.</p>
              <p><strong>Streak Not Updating:</strong> Make sure you're logged in when submitting drawings. Streaks update after midnight EST.</p>
              <p><strong>Premium Not Activated:</strong> Premium activation can take up to 5 minutes after purchase. Try logging out and back in.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                For questions about account deletion, data access, or privacy rights, please email us with your request. We take privacy seriously and will respond to all inquiries within 30 days as required by GDPR and CCPA regulations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
