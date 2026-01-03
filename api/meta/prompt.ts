export const config = {
  runtime: 'edge',
};

// Google Sheets CSV export for prompts
const SPREADSHEET_ID = '1tWJQOUhUfENl-xBd-TOQEv0BmaRb5USG';
const SHEET_GID = '1177623891';

interface Prompt {
  id: string;
  title: string;
  description: string;
  category: string;
}

async function fetchPromptByDate(date: string): Promise<Prompt | null> {
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const csvText = await response.text();
    const lines = csvText.trim().split('\n');

    if (lines.length < 2) return null;

    // Parse CSV rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVRow(lines[i]);
      if (row.length >= 4 && row[0] === date) {
        return {
          id: row[0],
          title: row[1] || 'Untitled',
          description: row[2] || '',
          category: row[3] || '',
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return new Response('Missing date parameter', { status: 400 });
    }

    const prompt = await fetchPromptByDate(date);

    if (!prompt) {
      return new Response('Prompt not found', { status: 404 });
    }

    const baseUrl = new URL(request.url).origin;
    const pageUrl = `${baseUrl}/prompt/${date}`;
    const ogImageUrl = `${baseUrl}/api/og/prompt?title=${encodeURIComponent(prompt.title)}&category=${encodeURIComponent(prompt.category)}&date=${date}`;

    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const title = `"${prompt.title}" - Daily Doodle Prompt`;
    const description = prompt.description || `Today's drawing prompt for ${formattedDate}: "${prompt.title}". Join the creative challenge!`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>

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
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(prompt.title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Meta prompt error:', error);
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
