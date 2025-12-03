import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
}

export function PrivacyView({ onBack }: PrivacyViewProps) {
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
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: December 3, 2025</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Welcome to DailyDoodlePrompt. We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4 className="font-semibold mt-4 mb-2">Personal Information</h4>
              <p>When you create an account, we collect:</p>
              <ul>
                <li>Email address</li>
                <li>Username</li>
                <li>Password (encrypted)</li>
                <li>Profile information (avatar, bio, display name)</li>
              </ul>

              <h4 className="font-semibold mt-4 mb-2">Usage Data</h4>
              <p>We automatically collect:</p>
              <ul>
                <li>Drawing submissions and timestamps</li>
                <li>Streak and activity data</li>
                <li>Badges and achievements</li>
                <li>Bookmarks and favorites</li>
                <li>Browser type and device information</li>
                <li>IP address and general location</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>We use your information to:</p>
              <ul>
                <li>Provide and maintain our service</li>
                <li>Track your progress, streaks, and achievements</li>
                <li>Send you daily prompt notifications (if enabled)</li>
                <li>Process premium subscriptions and payments</li>
                <li>Improve and personalize your experience</li>
                <li>Communicate important updates and changes</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We use cookies and similar tracking technologies to track activity on our service and store certain information. Cookies help us remember your preferences (like theme settings) and maintain your login session.
              </p>
              <p>
                You can configure your browser to refuse cookies, but some features may not work properly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Third-Party Services</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>We integrate with the following third-party services:</p>

              <h4 className="font-semibold mt-4 mb-2">Google OAuth</h4>
              <p>
                When you sign in with Google, we receive your email address and basic profile information. We do not have access to your Google password.
              </p>

              <h4 className="font-semibold mt-4 mb-2">Apple Sign In</h4>
              <p>
                When you sign in with Apple, we receive your email address (or a private relay email if you choose to hide your email). We do not have access to your Apple password.
              </p>

              <h4 className="font-semibold mt-4 mb-2">Stripe</h4>
              <p>
                Payment processing is handled by Stripe. We do not store your credit card information. Stripe's privacy policy governs how they handle your payment data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We retain your personal information for as long as your account is active or as needed to provide you services. If you delete your account, we will delete your personal information within 30 days, except where we are required to retain it for legal or regulatory purposes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information. All passwords are encrypted using industry-standard hashing algorithms. All data transmissions are encrypted using HTTPS/TLS.
              </p>
              <p>
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights (GDPR/CCPA)</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>Depending on your location, you may have the following rights:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p>
                To exercise these rights, please contact us at support@dailydoodleprompt.com.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> support@dailydoodleprompt.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
