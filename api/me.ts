import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

function getBearerToken(req: VercelRequest): string | null {
  const header =
    (req.headers.authorization as string | undefined) ||
    (req.headers.Authorization as string | undefined);
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle GET (fetch user) and PATCH (update user)
  if (req.method !== "GET" && req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  // Prefer server-side env vars (non-VITE) for the API route
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Missing Supabase env vars for /api/me", {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
    });
    return res.status(500).json({ error: "Supabase not configured" });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !authData?.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  // Handle PATCH - update user profile
  if (req.method === "PATCH") {
    console.log("[API /api/me PATCH] Request received");
    console.log("[API /api/me PATCH] User ID:", authData.user.id);
    console.log("[API /api/me PATCH] Request body:", JSON.stringify(req.body));

    const {
      username,
      avatar_type,
      avatar_icon,
      current_title,
      viewed_badges,
      email_notifications
    } = req.body;

    // Security: Only allow users to update safe fields
    // is_premium, is_admin, stripe_* fields should ONLY be set by server-side code (webhooks, admin)
    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (avatar_type !== undefined) updates.avatar_type = avatar_type;
    if (avatar_icon !== undefined) updates.avatar_icon = avatar_icon;
    if (current_title !== undefined) updates.current_title = current_title;
    if (viewed_badges !== undefined) updates.viewed_badges = viewed_badges;
    if (email_notifications !== undefined) updates.email_notifications = email_notifications;

    console.log("[API /api/me PATCH] Updates to apply:", JSON.stringify(updates));

    if (Object.keys(updates).length === 0) {
      console.warn("[API /api/me PATCH] No valid fields to update - body may be empty or malformed");
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updatePayload = { ...updates, updated_at: new Date().toISOString() };
    console.log("[API /api/me PATCH] Sending to Supabase:", JSON.stringify(updatePayload));

    const { data: updateData, error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", authData.user.id)
      .select();

    console.log("[API /api/me PATCH] Supabase response:", { data: updateData, error: updateError });

    if (updateError) {
      console.error("[API /api/me PATCH] Failed to update profile:", updateError);
      return res.status(500).json({ error: "Failed to update profile", details: updateError.message });
    }

    if (!updateData || updateData.length === 0) {
      console.warn("[API /api/me PATCH] Update succeeded but no rows returned - profile may not exist");
    } else {
      console.log("[API /api/me PATCH] Updated profile:", JSON.stringify(updateData[0]));
    }

    return res.status(200).json({ success: true, updated: updateData?.[0] || null });
  }

  // Handle GET - fetch user profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    console.error("Failed to fetch profile:", profileError);
    // Return basic user data if profile doesn't exist yet
    return res.status(200).json({
      id: authData.user.id,
      email: authData.user.email ?? null,
      username: authData.user.email?.split('@')[0] ?? 'user',
      is_premium: false,
      is_admin: false,
      created_at: authData.user.created_at,
      updated_at: authData.user.updated_at,
    });
  }

  return res.status(200).json({
    id: profile.id,
    email: profile.email,
    username: profile.username,
    is_premium: profile.is_premium ?? false,
    is_admin: profile.is_admin ?? false,
    oauth_provider: profile.oauth_provider ?? null,
    avatar_type: profile.avatar_type ?? 'initial',
    avatar_icon: profile.avatar_icon ?? null,
    current_title: profile.current_title ?? null,
    viewed_badges: profile.viewed_badges ?? [],
    email_notifications: profile.email_notifications ?? true,
    created_at: profile.created_at,
    updated_at: profile.updated_at,
  });
}