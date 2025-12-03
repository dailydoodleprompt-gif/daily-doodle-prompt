import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <h1>Privacy Policy</h1>
      <p>Last updated: December 2025</p>

      <p>
        Daily Doodle Prompt (“we,” “us,” or “our”) provides a creative platform
        where users can explore daily drawing prompts, upload doodles, and track
        creative streaks. This Privacy Policy explains how we collect, use, and
        protect your information when you use our service.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We may collect account data (name, email), Google sign-in data, usage
        analytics, doodles you upload, likes you give or receive, and other
        activity within the app.
      </p>

      <h2>Third-Party Authentication</h2>
      <p>
        If you sign in with Google, we receive your Google account ID, name,
        email, and profile image (if permitted). We never receive your Google
        password.
      </p>

      <h2>How We Use Your Information</h2>
      <ul>
        <li>Maintain your account and profile</li>
        <li>Track streaks, favorites, badges, and doodles</li>
        <li>Improve and personalize the Service</li>
        <li>Communicate updates and security notices</li>
        <li>Comply with legal requirements</li>
      </ul>

      <h2>Your GDPR & CCPA Rights</h2>
      <p>
        Depending on your location, you may have rights including access,
        correction, deletion, restriction, portability, and the right to object
        to certain types of processing. California residents may request details
        on collected personal information and request deletion.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have questions about this policy or want to make a privacy
        request, email: <strong>dailydooleprompt@gmail.com</strong>.
      </p>
    </div>
  );
}
