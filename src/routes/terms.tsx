// FILE: src/routes/terms.tsx
import { createFileRoute } from '@tanstack/react-router';
import { UtilityHeader } from '@/components/UtilityHeader';

export const Route = createFileRoute('/')({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold mb-2">Terms of Service</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: December 9, 2025</p>

      <div className="space-y-8 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold mb-2">Acceptance of Terms</h2>
          <p>
            By creating an account or using DailyDoodlePrompt, you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please do not use
            our service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Description of Service</h2>
          <p>
            DailyDoodlePrompt provides daily creative drawing prompts and a platform 
            for artists to track their progress, upload doodles, and engage with a 
            community of fellow creators. The service includes both free and premium features.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Account Registration</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Provide accurate and complete information</li>
            <li>Maintain the security of your password</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
            <li>You must be at least 13 years old to create an account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">User Content and Conduct</h2>
          <p>You retain ownership of the doodles and content you upload. By sharing content publicly, 
             you grant DailyDoodlePrompt a non-exclusive, worldwide license to display, reproduce, 
             and distribute your content within the service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Prohibited Content</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Illegal, harmful, threatening, abusive, or offensive material</li>
            <li>Hate speech, discrimination, or harassment</li>
            <li>Violence, explicit sexual content, or graphic imagery</li>
            <li>Intellectual property infringement</li>
            <li>Personal information of others without consent</li>
            <li>Spam, advertising, or promotional material</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Premium Access</h2>
          <p>
            Premium access is a one-time lifetime purchase for $4.99 USD. Payments are processed 
            through Stripe. Purchases are non-refundable except where required by law.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Acceptable Use</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>No automated bots or scrapers</li>
            <li>No unauthorized access attempts</li>
            <li>No reverse engineering of any part of the service</li>
            <li>No interference with servers or service operation</li>
            <li>No impersonation or fake accounts</li>
            <li>No illegal activity</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Intellectual Property</h2>
          <p>
            The DailyDoodlePrompt name, branding, prompts, and design are protected by copyright 
            and trademark laws. You may not use these without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these terms. Upon termination, premium 
            access is revoked.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Disclaimers and Liability</h2>
          <p>
            The service is provided “as is.” We do not guarantee uninterrupted or error-free operation. 
            Liability is limited to the amount paid to us in the last 12 months or $100, whichever is less.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless DailyDoodlePrompt for claims arising from your 
            content, actions, or misuse of the service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Dispute Resolution</h2>
          <p>
            Disputes shall be resolved through binding arbitration under the American Arbitration 
            Association. You waive participation in class action lawsuits.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Governing Law</h2>
          <p>
            These terms are governed by U.S. law and the laws of the state where our company is registered.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
          <p>For questions, please contact us through the Support page.</p>
        </section>

      </div>
    </div>
  );
}
