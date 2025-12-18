import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtilityHeader } from '@/components/UtilityHeader';

interface TermsOfServiceViewProps {
  onBack?: () => void;
}

export function TermsOfServiceView({ onBack }: TermsOfServiceViewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Utility Navigation */}
      <UtilityHeader onBack={onBack} />

      {/* Centered Page Content */}
      <main className="flex justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Terms of Service</CardTitle>
              <p className="text-sm text-muted-foreground">
                Last updated:{' '}
                {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </CardHeader>

            <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-6">
              <section>
                <h2>Acceptance of Terms</h2>
                <p>
                  By creating an account or using DailyDoodlePrompt, you agree to
                  be bound by these Terms of Service. If you do not agree, please
                  do not use the service.
                </p>
              </section>

              <section>
                <h2>Description of Service</h2>
                <p>
                  DailyDoodlePrompt provides daily creative drawing prompts and
                  a platform for artists to track progress, upload doodles, and
                  engage with the community.
                </p>
              </section>

              <section>
                <h2>Account Registration</h2>
                <ul>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain password security</li>
                  <li>Accept responsibility for account activity</li>
                  <li>Be at least 13 years old</li>
                </ul>
              </section>

              <section>
                <h2>User Content</h2>
                <p>
                  You retain ownership of your content. By sharing publicly,
                  you grant DailyDoodlePrompt a license to display it within
                  the service.
                </p>
              </section>

              <section>
                <h2>Premium Access</h2>
                <p>
                  Premium access is a one-time lifetime purchase processed
                  securely through Stripe. Purchases are non-refundable except
                  where required by law.
                </p>
              </section>

              <section>
                <h2>Termination</h2>
                <p>
                  We may suspend or terminate accounts that violate these terms.
                  Upon termination, premium access is revoked.
                </p>
              </section>

              <section>
                <h2>Governing Law</h2>
                <p>
                  These terms are governed by U.S. law and the laws of the state
                  in which our company is registered.
                </p>
              </section>

              <div className="mt-8 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                By using DailyDoodlePrompt, you acknowledge that you have read,
                understood, and agree to these Terms of Service.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
