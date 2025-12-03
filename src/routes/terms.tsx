import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Terms of Service</h1>
      <p>Last updated: December 2025</p>

      <h2>Introduction</h2>
      <p>
        By accessing or using Daily Doodle Prompt, you agree to these Terms of
        Service. If you do not agree, please discontinue use of the Service.
      </p>

      <h2>Accounts</h2>
      <p>
        You must be at least 13 years old to use the Service. You are
        responsible for maintaining the security of your account.
      </p>

      <h2>User Content</h2>
      <p>
        You retain ownership of the doodles and content you create. By uploading
        content, you grant us a non-exclusive license to host and display it
        within the app.
      </p>

      <h2>Acceptable Use</h2>
      <ul>
        <li>No unlawful or harmful content</li>
        <li>No harassment, hate, or explicit material</li>
        <li>No attempts to disrupt or hack the Service</li>
      </ul>

      <h2>Premium Features</h2>
      <p>
        Some features may require payment. Payment processing is handled by
        third-party providers such as Stripe.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate accounts that violate these terms. You may
        delete your account at any time.
      </p>

      <h2>Contact Us</h2>
      <p>
        For questions about these Terms, email: <strong>dailydooldeprompt@gmail.com</strong>.
      </p>
    </div>
  );
}
