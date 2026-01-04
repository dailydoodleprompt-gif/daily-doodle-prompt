export const config = {
  runtime: 'edge',
};

// Badge info for OG meta tags
// Maps badge ID to display name and OG image filename
const BADGE_META: Record<string, { name: string; description: string; ogImage?: string }> = {
  // Membership badges
  creative_spark: { name: 'Creative Spark', description: 'Joined the creative community' },
  premium_patron: { name: 'Premium Patron', description: 'Unlocked lifetime access to all premium features' },

  // Streak badges
  creative_ember: { name: 'Creative Ember', description: 'Visited 3 days in a row' },
  creative_fire: { name: 'Creative Fire', description: 'Visited 7 days in a row' },
  creative_blaze: { name: 'Creative Blaze', description: 'Visited 14 days in a row' },
  creative_rocket: { name: 'Creative Rocket', description: 'Visited 30 days in a row' },
  creative_supernova: { name: 'Creative Supernova', description: 'Visited 100 days in a row' },

  // Collection badges
  new_collector: { name: 'New Collector', description: 'Saved your first favorite prompt' },
  pack_rat: { name: 'Pack Rat', description: 'Saved 10 favorite prompts' },
  cue_curator: { name: 'Cue Curator', description: 'Saved 25 favorite prompts' },
  grand_gatherer: { name: 'Grand Gatherer', description: 'Saved 50 favorite prompts' },

  // Sharing badges
  planter_of_seeds: { name: 'Planter of Seeds', description: 'Shared your first prompt' },
  gardener_of_growth: { name: 'Gardener of Growth', description: 'Shared 10 prompts' },
  cultivator_of_influence: { name: 'Cultivator of Influence', description: 'Shared 25 prompts' },
  harvester_of_inspiration: { name: 'Harvester of Inspiration', description: 'Shared 50 prompts' },

  // Creative/Doodle badges
  first_doodle: { name: 'First Doodle', description: 'Uploaded your first doodle' },
  doodle_diary: { name: 'Doodle Diary', description: 'Uploaded 10 doodles' },
  doodle_digest: { name: 'Doodle Digest', description: 'Uploaded 25 doodles' },
  doodle_library: { name: 'Doodle Library', description: 'Uploaded 50 doodles' },
  daily_doodler: { name: 'Daily Doodler', description: 'Uploaded doodles 7 days in a row' },

  // Social badges
  warm_fuzzies: { name: 'Warm Fuzzies', description: 'Gave your first like to another artist' },
  somebody_likes_me: { name: 'Somebody Likes Me!', description: 'Received your first like from another artist' },
  idea_fairy: { name: 'Idea Fairy', description: 'Submitted a creative prompt idea' },

  // Holiday Badges (2026)
  valentines_2026: { name: "Valentine's Artist '26", description: "Uploaded a doodle on Valentine's Day 2026" },
  lucky_creator_2026: { name: "Lucky Creator '26", description: "Uploaded a doodle on St. Patrick's Day 2026" },
  earth_day_2026: { name: "Earth Artist '26", description: 'Uploaded a doodle on Earth Day 2026' },
  independence_2026: { name: "Independent Artist '26", description: 'Uploaded a doodle on Independence Day 2026' },
  spooky_season_2026: { name: "Spooky Season '26", description: 'Uploaded a doodle on Halloween 2026' },
  thanksgiving_2026: { name: "Thankful Artist '26", description: 'Uploaded a doodle on Thanksgiving 2026' },
  holiday_spirit_2026: { name: "Holiday Spirit '26", description: 'Uploaded a doodle on Christmas 2026' },
  new_year_spark_2027: { name: "New Year New Doodle '27", description: "Uploaded a doodle on New Year's Day 2027", ogImage: 'new_year_new_doodle_2027' },

  // Monthly Challenge Badges (2026)
  january_champion_2026: { name: 'Dedicated Doodler - January 2026', description: 'Completed 15 doodles in January 2026', ogImage: 'january_artist_2026' },
  february_faithful_2026: { name: 'Dedicated Doodler - February 2026', description: 'Completed 15 doodles in February 2026', ogImage: 'february_artist_2026' },
  march_maestro_2026: { name: 'Dedicated Doodler - March 2026', description: 'Completed 15 doodles in March 2026', ogImage: 'march_artist_2026' },
  april_artist_2026: { name: 'Dedicated Doodler - April 2026', description: 'Completed 15 doodles in April 2026', ogImage: 'april_artist_2026' },
  may_maven_2026: { name: 'Dedicated Doodler - May 2026', description: 'Completed 15 doodles in May 2026', ogImage: 'may_artist_2026' },
  june_genius_2026: { name: 'Dedicated Doodler - June 2026', description: 'Completed 15 doodles in June 2026', ogImage: 'june_artist_2026' },
  july_journeyer_2026: { name: 'Dedicated Doodler - July 2026', description: 'Completed 15 doodles in July 2026', ogImage: 'july_artist_2026' },
  august_ace_2026: { name: 'Dedicated Doodler - August 2026', description: 'Completed 15 doodles in August 2026', ogImage: 'august_artist_2026' },
  september_star_2026: { name: 'Dedicated Doodler - September 2026', description: 'Completed 15 doodles in September 2026', ogImage: 'september_artist_2026' },
  october_original_2026: { name: 'Dedicated Doodler - October 2026', description: 'Completed 15 doodles in October 2026', ogImage: 'october_artist_2026' },
  november_notable_2026: { name: 'Dedicated Doodler - November 2026', description: 'Completed 15 doodles in November 2026', ogImage: 'november_artist_2026' },
  december_dedicator_2026: { name: 'Dedicated Doodler - December 2026', description: 'Completed 15 doodles in December 2026', ogImage: 'december_artist_2026' },
};

export default async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const badgeId = searchParams.get('id');

    if (!badgeId) {
      return new Response('Missing badge id', { status: 400 });
    }

    const badge = BADGE_META[badgeId];
    if (!badge) {
      return new Response('Badge not found', { status: 404 });
    }

    const baseUrl = new URL(request.url).origin;
    const pageUrl = `${baseUrl}/badge/${badgeId}`;

    // Use ogImage if specified, otherwise use badge ID
    const ogImageFilename = badge.ogImage || badgeId;
    const ogImageUrl = `${baseUrl}/badges/share/${ogImageFilename}.png`;

    const title = `${badge.name} - Daily Doodle Prompt Badge`;
    const description = badge.description;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(badge.name)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${ogImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="Daily Doodle Prompt">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(badge.name)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${ogImageUrl}">

  <!-- Redirect for browsers -->
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
  <link rel="canonical" href="${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(badge.name)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      },
    });
  } catch (error) {
    console.error('Meta badge error:', error);
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
