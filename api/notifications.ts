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

function getSupabaseClient(token: string) {
  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase not configured");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Missing bearer token" });
  }

  let supabase;
  try {
    supabase = getSupabaseClient(token);
  } catch (err) {
    console.error("Supabase config error:", err);
    return res.status(500).json({ error: "Supabase not configured" });
  }

  // Verify user
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const userId = authData.user.id;

  // GET - Fetch user's notifications
  if (req.method === "GET") {
    const unreadOnly = req.query.unread === "true";
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    let query = supabase
      .from("notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (unreadOnly) {
      query = query.is("read_at", null);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[API /api/notifications GET] Error:", error);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    return res.status(200).json({
      notifications: data || [],
      total: count || 0,
      unreadCount: unreadOnly ? count : undefined,
    });
  }

  // POST - Create notification (for admin/system use)
  if (req.method === "POST") {
    // Check if user is admin for creating notifications for others
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    const { target_user_id, type, title, body, link, metadata } = req.body;

    // Non-admins can only create notifications for themselves (limited types)
    const targetUserId = profile?.is_admin ? (target_user_id || userId) : userId;

    // Validate required fields
    if (!type || !title || !body) {
      return res.status(400).json({ error: "Missing required fields: type, title, body" });
    }

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: targetUserId,
        type,
        title,
        body,
        link: link || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("[API /api/notifications POST] Error:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }

    return res.status(201).json({ notification: data });
  }

  // PATCH - Mark notification(s) as read
  if (req.method === "PATCH") {
    const { notification_id, mark_all } = req.body;

    if (mark_all) {
      // Mark all unread notifications as read
      const { data, error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .is("read_at", null)
        .select();

      if (error) {
        console.error("[API /api/notifications PATCH] Error:", error);
        return res.status(500).json({ error: "Failed to mark notifications as read" });
      }

      return res.status(200).json({ updated: data?.length || 0 });
    }

    if (!notification_id) {
      return res.status(400).json({ error: "Missing notification_id or mark_all" });
    }

    // Mark single notification as read
    const { data, error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notification_id)
      .eq("user_id", userId) // Ensure user owns this notification
      .select()
      .single();

    if (error) {
      console.error("[API /api/notifications PATCH] Error:", error);
      return res.status(500).json({ error: "Failed to mark notification as read" });
    }

    return res.status(200).json({ notification: data });
  }

  // DELETE - Delete notification(s)
  if (req.method === "DELETE") {
    const { notification_id, delete_all_read } = req.body;

    if (delete_all_read) {
      // Delete all read notifications
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId)
        .not("read_at", "is", null);

      if (error) {
        console.error("[API /api/notifications DELETE] Error:", error);
        return res.status(500).json({ error: "Failed to delete notifications" });
      }

      return res.status(200).json({ success: true });
    }

    if (!notification_id) {
      return res.status(400).json({ error: "Missing notification_id or delete_all_read" });
    }

    // Delete single notification
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notification_id)
      .eq("user_id", userId);

    if (error) {
      console.error("[API /api/notifications DELETE] Error:", error);
      return res.status(500).json({ error: "Failed to delete notification" });
    }

    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
