import { supabase } from "./supabase";
import { useAuthStore } from "./auth";

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (data.session?.access_token) {
    await useAuthStore.getState().setToken(data.session.access_token, "supabase");
  }

  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) throw error;
  return data;
}

export async function signInWithApple() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
  await useAuthStore.getState().clearAuth();
}