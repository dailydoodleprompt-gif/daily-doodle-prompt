import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
}

export function TermsView({ onBack }: TermsViewProps) {
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
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: December 3, 2025</p>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agreement to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                By accessing or using DailyDoodlePrompt, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Eligibility</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                You must be at least 13 years old to use DailyDoodlePrompt. By using our service, you represent and warrant that you meet this age requirement. If you are under 18, you should have your parent or guardian's permission to use this service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>When creating an account, you agree to:</p>
              <ul>
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Not share your account with others</li>
                <li>Not create multiple accounts to abuse features</li>
              </ul>
              <p>
                We reserve the right to suspend or terminate accounts that violate these terms or engage in suspicious activity.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acceptable Use</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>You agree NOT to:</p>
              <ul>
                <li>Upload content that is illegal, harmful, threatening, abusive, harassing, or offensive</li>
                <li>Impersonate any person or entity</li>
                <li>Upload content that infringes on intellectual property rights</li>
                <li>Post spam, advertisements, or promotional content</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use automated tools (bots, scrapers) without permission</li>
                <li>Manipulate streaks, badges, or other gamification features</li>
                <li>Harass, bully, or threaten other users</li>
                <li>Upload viruses, malware, or other malicious code</li>
              </ul>
              <p>
                Violations may result in content removal, account suspension, or permanent termination.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Content and License</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4 className="font-semibold mt-4 mb-2">Your Content</h4>
              <p>
                You retain all ownership rights to content you upload (drawings, images, comments, etc.). You are solely responsible for your content and the consequences of posting it.
              </p>

              <h4 className="font-semibold mt-4 mb-2">License to Us</h4>
              <p>
                By uploading content, you grant DailyDoodlePrompt a worldwide, non-exclusive, royalty-free license to use, display, reproduce, and distribute your content solely for the purpose of operating and promoting the service. This includes:
              </p>
              <ul>
                <li>Displaying your drawings on the platform</li>
                <li>Showing your work in community galleries or featured sections</li>
                <li>Using your work in promotional materials (with attribution)</li>
              </ul>
              <p>
                You can delete your content at any time, which will remove it from public display (though cached or backup copies may persist temporarily).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Premium Features and Payments</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <h4 className="font-semibold mt-4 mb-2">Lifetime Premium Access</h4>
              <p>
                DailyDoodlePrompt offers a one-time lifetime premium purchase that includes:
              </p>
              <ul>
                <li>Unlimited bookmarks</li>
                <li>Access to full prompt archive</li>
                <li>Exclusive premium badges</li>
                <li>Early access to new features</li>
              </ul>

              <h4 className="font-semibold mt-4 mb-2">Payment Terms</h4>
              <p>
                All payments are processed securely through Stripe. By purchasing premium, you agree to:
              </p>
              <ul>
                <li>Pay the current listed price at time of purchase</li>
                <li>Provide valid payment information</li>
                <li>Accept that lifetime purchases are non-refundable after 14 days</li>
              </ul>

              <h4 className="font-semibold mt-4 mb-2">Refund Policy</h4>
              <p>
                Lifetime premium purchases are eligible for a full refund within 14 days of purchase. After 14 days, all sales are final. To request a refund, contact support@dailydoodleprompt.com.
              </p>

              <h4 className="font-semibold mt-4 mb-2">Price Changes</h4>
              <p>
                We reserve the right to change pricing for new purchases. Existing premium members will not be affected by price changes.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                The DailyDoodlePrompt platform, including its design, code, logos, prompts, and features, is protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission.
              </p>
              <p>
                The daily prompts themselves are provided for personal creative use. You may not redistribute, sell, or commercialize the prompts without permission.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                DailyDoodlePrompt is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied. We do not guarantee that:
              </p>
              <ul>
                <li>The service will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The service is free of viruses or harmful components</li>
                <li>Results from using the service will meet your expectations</li>
              </ul>
              <p>
                You use the service at your own risk. We are not responsible for any content posted by users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                To the maximum extent permitted by law, DailyDoodlePrompt and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from:
              </p>
              <ul>
                <li>Your use or inability to use the service</li>
                <li>Unauthorized access to or alteration of your content</li>
                <li>Loss of data or content</li>
                <li>Any user conduct or content on the service</li>
                <li>Service interruptions or errors</li>
              </ul>
              <p>
                Our total liability for any claims related to the service is limited to the amount you paid us in the past 12 months, or $100, whichever is greater.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We reserve the right to suspend or terminate your account at any time for:
              </p>
              <ul>
                <li>Violation of these Terms of Service</li>
                <li>Fraudulent, abusive, or illegal activity</li>
                <li>Extended periods of inactivity</li>
                <li>At our sole discretion</li>
              </ul>
              <p>
                You may delete your account at any time through the Settings page. Upon termination, your right to access the service will immediately cease.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Governing Law and Disputes</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                These Terms are governed by the laws of the United States, without regard to conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the service shall be resolved through binding arbitration, except where prohibited by law. You waive the right to participate in class action lawsuits.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                We may modify these Terms at any time. We will notify you of significant changes by posting a notice on the service or sending you an email. Your continued use of the service after changes constitutes acceptance of the new Terms.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm dark:prose-invert max-w-none">
              <p>
                If you have questions about these Terms of Service, please contact us at:
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
