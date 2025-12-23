import { useState } from "react";
import { supabase } from "@/sdk/core/supabase";

export default function TestLogin() {
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
        setMessage(`Success! Check your email: ${email}`);
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
        setMessage(`Logged in! Email: ${data.user?.email}`);
        // Redirect to home after 2 seconds
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Test Login (Supabase)</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "5px" }}>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button 
          onClick={handleSignUp} 
          disabled={loading}
          style={{ padding: "10px 20px", flex: 1 }}
        >
          Sign Up
        </button>
        <button 
          onClick={handleSignIn} 
          disabled={loading}
          style={{ padding: "10px 20px", flex: 1 }}
        >
          Sign In
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: "10px", 
          background: message.includes("Error") ? "#fee" : "#efe",
          border: `1px solid ${message.includes("Error") ? "#fcc" : "#cfc"}`,
          borderRadius: "4px"
        }}>
          {message}
        </div>
      )}
    </div>
  );
}