export const config = {
  runtime: 'edge',
};

import { createClient } from '@supabase/supabase-js';

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const userId = searchParams.get('id');

    if (!username && !userId) {
      return new Response('Missing username or id', { status: 400 });
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response('Supabase not configured', { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase.from('profiles').select('*');
    if (userId) {
      query = query.eq('id', userId);
    } else if (username) {
      query = query.eq('username', username);
    }

    const { data: profile, error } = await query.single();

    if (error || !profile) {
      return new Response('Profile not found', { status: 404 });
    }

    // Get stats
    const [doodlesResult, streakResult, badgesResult] = await Promise.all([
      supabase
        .from('doodles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id),
      supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', profile.id)
        .single(),
      supabase
        .from('badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id),
    ]);

    const doodleCount = doodlesResult.count || 0;
    const streak = streakResult.data?.current_streak || 0;
    const badgeCount = badgesResult.count || 0;

    const baseUrl = new URL(request.url).origin;
    const pageUrl = `${baseUrl}/profile/${profile.username || profile.id}`;

    // Pass all data via query params to OG route
    const ogImageUrl = `${baseUrl}/api/og/profile?username=${encodeURIComponent(profile.username || 'Artist')}&doodles=${doodleCount}&streak=${streak}&badges=${badgeCount}&title=${encodeURIComponent(profile.current_title || '')}&premium=${profile.is_premium ? 'true' : 'false'}`;

    const title = `${profile.username}'s Profile - Daily Doodle Prompt`;
    const description = profile.current_title
      ? `${profile.username} - "${profile.current_title}" | ${doodleCount} doodles, ${streak} day streak, ${badgeCount} badges`
      : `Check out ${profile.username}'s creative journey on Daily Doodle Prompt! ${doodleCount} doodles, ${streak} day streak, ${badgeCount} badges`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>

  <!-- Open Graph -->
  <meta property="og:type" content="profile">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="Daily Doodle Prompt">
  <meta property="profile:username" content="${escapeHtml(profile.username)}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Redirect for browsers -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(profile.username)}'s profile</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Meta profile error:', error);
    return new Response('Error generating meta page', { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
