import { supabase } from "./supabase";
import { getAuthTokenAsync } from "./auth";

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // The auth.ts file will automatically pick up the Supabase session
  // from localStorage on the next initialization
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error);
  
  // Clear the token from your auth system
  const { clearAuth } = await import("./auth");
  await clearAuth();
  
  // Reload to ensure clean state
  window.location.href = "/";
}

export async function getCurrentUser() {
  const token = await getAuthTokenAsync();
  if (!token) return null;

  const response = await fetch("/api/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) return null;
  return response.json();
}