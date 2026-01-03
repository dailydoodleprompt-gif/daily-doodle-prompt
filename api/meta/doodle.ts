import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doodleId = searchParams.get('id');

    if (!doodleId) {
      return new Response('Missing doodle id', { status: 400 });
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

    const { data: doodle, error } = await supabase
      .from('doodles')
      .select('*')
      .eq('id', doodleId)
      .eq('is_public', true)
      .single();

    if (error || !doodle) {
      return new Response('Doodle not found', { status: 404 });
    }

    const baseUrl = new URL(request.url).origin;
    const pageUrl = `${baseUrl}/doodle/${doodleId}`;
    const ogImageUrl = `${baseUrl}/api/og/doodle?id=${doodleId}`;
    const artistName = doodle.user_username || 'an artist';
    const title = `"${doodle.prompt_title}" by ${artistName}`;
    const description = doodle.caption || `Check out this doodle for "${doodle.prompt_title}" on Daily Doodle Prompt!`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} - Daily Doodle Prompt</title>

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="Daily Doodle Prompt">

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
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Meta doodle error:', error);
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
