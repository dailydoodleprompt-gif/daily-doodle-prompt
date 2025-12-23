import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtilityHeader } from '@/components/UtilityHeader';
import { useState } from 'react';
import { supabase } from '@/sdk/core/supabase';

interface PrivacyPolicyViewProps {
  onBack?: () => void;
}

export function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Utility Navigation */}
      <UtilityHeader onBack={onBack} />

      {/* Centered Page Content */}
      <main className="flex justify-center px-4 py-12">
        <div className="w-full max-w-4xl space-y-8">
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
                <h2>Introduction</h2>
                <p>
                  Welcome to DailyDoodlePrompt. We respect your privacy and are
                  committed to protecting your personal information. This policy
                  explains how we collect, use, and safeguard your data.
                </p>
              </section>

              <section>
                <h2>Information We Collect</h2>

                <h3>Account Information</h3>
                <p>
                  When you create an account, we collect your email address,
                  username, and encrypted password. OAuth providers may share
                  basic profile details.
                </p>

                <h3>User-Generated Content</h3>
                <p>
                  We store the doodles you upload, including images, captions,
                  and visibility preferences.
                </p>

                <h3>Usage Data</h3>
                <p>
                  We track activity such as prompts viewed, favorites, streaks,
                  badges, and interactions.
                </p>

                <h3>Payment Information</h3>
                <p>
                  Payments are securely handled by Stripe. We store your Stripe
                  customer ID and transaction metadata, never card details.
                </p>
              </section>

              <section>
                <h2>How We Use Your Information</h2>
                <ul>
                  <li>Provide and maintain the service</li>
                  <li>Authenticate users and enable features</li>
                  <li>Track progress, streaks, and achievements</li>
                  <li>Process premium purchases</li>
                  <li>Respond to support requests</li>
                  <li>Improve the product</li>
                </ul>
              </section>

              <section>
                <h2>Data Storage and Security</h2>
                <p>
                  Data is stored securely using industry-standard encryption.
                  Passwords are hashed using bcrypt. HTTPS is enforced for all
                  traffic.
                </p>
              </section>

              <section>
                <h2>Cookies and Local Storage</h2>
                <p>
                  We use local storage to manage sessions and preferences. This
                  data remains on your device unless cleared.
                </p>
              </section>

              <section>
                <h2>Third-Party Services</h2>
                <ul>
                  <li>Google OAuth</li>
                  <li>Apple Sign In</li>
                  <li>Stripe</li>
                  <li>Google Sheets (public prompt data)</li>
                </ul>
              </section>

              <section>
                <h2>Children&apos;s Privacy</h2>
                <p>
                  DailyDoodlePrompt is not intended for children under 13. We do
                  not knowingly collect data from children.
                </p>
              </section>

              <section>
                <h2>Your Rights</h2>
                <ul>
                  <li>Access your data</li>
                  <li>Correct inaccuracies</li>
                  <li>Delete your account</li>
                  <li>Export your data</li>
                  <li>Opt out of notifications</li>
                </ul>
              </section>

              <section>
                <h2>Changes to This Policy</h2>
                <p>
                  We may update this policy periodically. Continued use of the
                  service constitutes acceptance of the updated policy.
                </p>
              </section>

              <section>
                <h2>Contact</h2>
                <p>
                  Questions? Please contact us through the Support page inside
                  the app.
                </p>
              </section>

              <div className="mt-8 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                This policy is intended to comply with GDPR, CCPA, and similar
                regulations. Consult a legal professional for formal advice.
              </div>
            </CardContent>
          </Card>

          {/* TEMPORARY AUTH TEST - DELETE AFTER TESTING */}
          <Card className="border-orange-500">
            <CardHeader>
              <CardTitle className="text-xl text-orange-600">
                🔧 Auth Test (Temporary)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AuthTestSection />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function AuthTestSection() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`Success! Check ${email} for confirmation`);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignIn() {
    setLoading(true);
    setMessage("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage(`✅ Logged in! Email: ${data.user?.email}`);
        setTimeout(() => window.location.href = "/", 2000);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="flex gap-2">
        <button 
          onClick={handleSignUp} 
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Sign Up
        </button>
        <button 
          onClick={handleSignIn} 
          disabled={loading}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Sign In
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded ${
          message.includes("Error") 
            ? "bg-red-100 text-red-700 border border-red-300" 
            : "bg-green-100 text-green-700 border border-green-300"
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
```

---

## **COMMIT COMMENT:**
```
Add temporary Supabase auth test section to Privacy page