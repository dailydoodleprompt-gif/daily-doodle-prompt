import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtilityHeader } from '@/components/UtilityHeader';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

export function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <UtilityHeader onBack={onBack} />

      <main className="mx-auto w-full max-w-4xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
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
              <h2 className="text-xl font-semibold mb-3">Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to DailyDoodlePrompt. We respect your privacy and are committed to protecting your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
                creative drawing prompt application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Account Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    When you create an account, we collect your email address, username, and password (encrypted).
                    If you sign up using OAuth providers (Google or Apple), we receive your email, name, and profile
                    picture from those services.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">User-Generated Content</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We store the doodles you upload, including images, captions, and visibility preferences.
                    Public doodles may be visible to other users of the service.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Usage Data</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We track your activity within the app, including prompts viewed, favorites saved, streak data,
                    badges earned, and social interactions (likes, follows, shares).
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    If you purchase premium access, payment processing is handled securely by Stripe. We store your
                    Stripe customer ID and transaction details, but never store your credit card information directly.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>To provide and maintain our service</li>
                <li>To authenticate your account and enable features</li>
                <li>To track your progress, streaks, and achievements</li>
                <li>To process premium purchases and manage subscriptions</li>
                <li>To display your public doodles to other users</li>
                <li>To send daily prompt notifications (if enabled)</li>
                <li>To improve our service and develop new features</li>
                <li>To respond to support requests and moderate content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Storage and Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Your data is stored securely using industry-standard encryption. Passwords are hashed using bcrypt.
                We use secure HTTPS connections for all data transmission.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                While we implement reasonable security measures, no method of transmission over the internet is 100%
                secure. We cannot guarantee absolute security of your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Cookies and Local Storage</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use browser local storage to save your authentication session, preferences, and cached data for
                offline functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li><strong>Google OAuth</strong> – Authentication</li>
                <li><strong>Apple Sign In</strong> – Authentication</li>
                <li><strong>Stripe</strong> – Payment processing</li>
                <li><strong>Google Sheets</strong> – Daily prompt source</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Children’s Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not directed to children under 13. We do not knowingly collect personal information
                from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion</li>
                <li>Export your data</li>
                <li>Opt out of notifications</li>
                <li>Close your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your data while your account is active. Deleted accounts are fully removed within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this policy from time to time. Continued use constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                Questions? Contact us via the Support page.
              </p>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                This policy is designed to align with GDPR and CCPA guidelines.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
