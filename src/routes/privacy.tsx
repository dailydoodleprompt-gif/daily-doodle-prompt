// FILE: src/routes/privacy.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: December 9, 2025</p>

      <div className="space-y-8 leading-relaxed">

        <section>
          <h2 className="text-xl font-semibold mb-2">Payment Information</h2>
          <p>
            If you purchase premium access, payment processing is handled securely by Stripe.
            We store your Stripe customer ID and transaction details, but never store your
            credit card information directly.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">How We Use Your Information</h2>
          <ul className="list-disc ml-6 space-y-1">
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
          <h2 className="text-xl font-semibold mb-2">Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption. Passwords are
            hashed using bcrypt. We use secure HTTPS connections for all data transmission.
            Despite reasonable measures, no method of transmission over the internet is
            entirely secure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Cookies and Local Storage</h2>
          <p>
            We use browser local storage to save your authentication session, preferences,
            and cached data for offline functionality. This data remains on your device
            and can be cleared through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Third-Party Services</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Google OAuth — account authentication</li>
            <li>Apple Sign-In — account authentication</li>
            <li>Stripe — payment processing</li>
            <li>Google Sheets — prompt retrieval (public data only)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Children's Privacy</h2>
          <p>
            DailyDoodlePrompt is not directed to children under 13. We do not knowingly
            collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Your Rights</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li>Access your data</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Export your data</li>
            <li>Opt out of notifications</li>
            <li>Close your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
          <p>
            We retain your account data while your account is active. If deleted, we remove
            personal information within 30 days, with backups retained for up to 90 days.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Changes to This Policy</h2>
          <p>
            We may update this policy periodically. Continued use of the service constitutes
            acceptance of updates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us through the
            Support page in the app.
          </p>
        </section>

      </div>
    </div>
  );
}
