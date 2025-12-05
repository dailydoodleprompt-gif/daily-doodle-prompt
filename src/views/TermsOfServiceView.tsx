import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceViewProps {
  onBack: () => void;
}

export function TermsOfServiceView({ onBack }: TermsOfServiceViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-8 px-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms of Service</CardTitle>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By creating an account or using DailyDoodlePrompt, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                DailyDoodlePrompt provides daily creative drawing prompts and a platform for artists to track their
                progress, upload doodles, and engage with a community of fellow creators. The service includes both
                free and premium features.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Account Registration</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>When creating an account, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your password</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                  <li>You must be at least 13 years old to create an account</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">User Content and Conduct</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Content Ownership</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    You retain ownership of the doodles and content you upload. By sharing content publicly, you grant
                    DailyDoodlePrompt a non-exclusive, worldwide license to display, reproduce, and distribute your
                    content within the service.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Prohibited Content</h3>
                  <p className="text-muted-foreground leading-relaxed mb-2">You agree not to upload or share content that:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Is illegal, harmful, threatening, abusive, or offensive</li>
                    <li>Contains hate speech, discrimination, or harassment</li>
                    <li>Depicts violence, explicit sexual content, or graphic imagery</li>
                    <li>Infringes on intellectual property rights</li>
                    <li>Contains personal information of others without consent</li>
                    <li>Promotes illegal activities or violates any laws</li>
                    <li>Contains spam, advertising, or promotional material</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Content Moderation</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to review, moderate, and remove any content that violates these terms.
                    Repeated violations may result in account warnings, suspension, or permanent bans.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Premium Access</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>Premium features include:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Full access to the prompt archive</li>
                  <li>Unlimited favorites/bookmarks</li>
                  <li>Streak freeze capability</li>
                  <li>Custom profile titles</li>
                  <li>Ad-free experience</li>
                  <li>Priority support</li>
                  <li>Ability to submit prompt ideas</li>
                </ul>
                <p className="mt-3">
                  Premium access is offered as a one-time lifetime purchase for $4.99 USD. All payments are processed
                  securely through Stripe. Premium purchases are non-refundable except where required by law.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Use automated systems (bots, scrapers) to access the service</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Reverse engineer or decompile any part of the service</li>
                <li>Interfere with or disrupt the service or servers</li>
                <li>Impersonate others or create fake accounts</li>
                <li>Collect or harvest user information without consent</li>
                <li>Use the service for any illegal purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                The DailyDoodlePrompt name, logo, design, and original prompts are protected by copyright and trademark
                laws. You may not use our branding without explicit written permission. Daily prompts are provided for
                personal creative use and may not be republished commercially without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                You may close your account at any time through your account settings. We reserve the right to suspend
                or terminate accounts that violate these terms, engage in abusive behavior, or for any reason at our
                discretion. Upon termination, your access to premium features will be revoked.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Disclaimers and Limitation of Liability</h2>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT
                  GUARANTEE UNINTERRUPTED, SECURE, OR ERROR-FREE SERVICE.
                </p>
                <p>
                  TO THE FULLEST EXTENT PERMITTED BY LAW, DAILYDOODLEPROMPT SHALL NOT BE LIABLE FOR ANY INDIRECT,
                  INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
                </p>
                <p>
                  Our total liability for any claims related to the service is limited to the amount you paid us in
                  the past 12 months, or $100 USD, whichever is less.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless DailyDoodlePrompt from any claims, damages, or expenses
                (including legal fees) arising from your use of the service, your content, or your violation of these
                terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your use of the service is also governed by our Privacy Policy. Please review our Privacy Policy to
                understand how we collect, use, and protect your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may modify these Terms of Service at any time. We will notify users of significant changes via
                email or in-app notification. Continued use of the service after changes constitutes acceptance of
                the updated terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Dispute Resolution</h2>
              <p className="text-muted-foreground leading-relaxed">
                Any disputes arising from these terms or your use of the service shall be resolved through binding
                arbitration in accordance with the rules of the American Arbitration Association. You waive your
                right to participate in class action lawsuits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
              <p className="text-muted-foreground leading-relaxed">
                These terms are governed by the laws of the United States and the state in which our company is
                registered, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us through the Support page in the app.
              </p>
            </section>

            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                By creating an account or using DailyDoodlePrompt, you acknowledge that you have read, understood,
                and agree to be bound by these Terms of Service.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
