#!/usr/bin/env node

/**
 * Badge Share Image Generator
 *
 * Generates 1200×630 SVG images for all 43 badges.
 * Output: public/badges/share/{badge_type}.svg
 *
 * Usage: node scripts/generate-badge-images.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output directory
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'badges', 'share');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Badge definitions with all metadata
const BADGES = {
  // Membership badges
  creative_spark: {
    name: 'Creative Spark',
    description: 'Joined the Daily Doodle community',
    gradient: ['#a78bfa', '#8b5cf6'], // violet to purple
    icon: 'sparkles',
    category: 'Membership',
  },
  premium_patron: {
    name: 'Premium Patron',
    description: 'Unlocked lifetime premium access',
    gradient: ['#fbbf24', '#f59e0b'], // yellow to amber
    icon: 'crown',
    category: 'Membership',
  },

  // Streak badges
  creative_ember: {
    name: 'Creative Ember',
    description: '3 days in a row',
    gradient: ['#fbbf24', '#f97316'], // yellow to orange
    icon: 'sparkles',
    category: 'Streak',
  },
  creative_fire: {
    name: 'Creative Fire',
    description: '7 days in a row',
    gradient: ['#f97316', '#ef4444'], // orange to red
    icon: 'flame-kindling',
    category: 'Streak',
  },
  creative_blaze: {
    name: 'Creative Blaze',
    description: '14 days in a row',
    gradient: ['#ef4444', '#dc2626'], // red shades
    icon: 'flame',
    category: 'Streak',
  },
  creative_rocket: {
    name: 'Creative Rocket',
    description: '30 days in a row',
    gradient: ['#f97316', '#ea580c'], // orange shades
    icon: 'rocket',
    category: 'Streak',
  },
  creative_supernova: {
    name: 'Creative Supernova',
    description: '100 days in a row',
    gradient: ['#a855f7', '#7c3aed'], // purple to violet
    icon: 'orbit',
    category: 'Streak',
  },

  // Collection badges
  new_collector: {
    name: 'New Collector',
    description: 'Saved your first prompt',
    gradient: ['#60a5fa', '#3b82f6'], // blue shades
    icon: 'bookmark',
    category: 'Collection',
  },
  pack_rat: {
    name: 'Pack Rat',
    description: 'Saved 10 prompts',
    gradient: ['#3b82f6', '#2563eb'], // blue shades
    icon: 'book-open',
    category: 'Collection',
  },
  cue_curator: {
    name: 'Cue Curator',
    description: 'Saved 25 prompts',
    gradient: ['#2563eb', '#1d4ed8'], // blue shades
    icon: 'library',
    category: 'Collection',
  },
  grand_gatherer: {
    name: 'Grand Gatherer',
    description: 'Saved 50 prompts',
    gradient: ['#6366f1', '#4f46e5'], // indigo shades
    icon: 'gem',
    category: 'Collection',
  },

  // Sharing badges
  planter_of_seeds: {
    name: 'Planter of Seeds',
    description: 'Shared your first prompt',
    gradient: ['#4ade80', '#22c55e'], // green shades
    icon: 'sprout',
    category: 'Sharing',
  },
  gardener_of_growth: {
    name: 'Gardener of Growth',
    description: 'Shared 10 prompts',
    gradient: ['#22c55e', '#16a34a'], // green shades
    icon: 'shrub',
    category: 'Sharing',
  },
  cultivator_of_influence: {
    name: 'Cultivator of Influence',
    description: 'Shared 25 prompts',
    gradient: ['#16a34a', '#15803d'], // green shades
    icon: 'trees',
    category: 'Sharing',
  },
  harvester_of_inspiration: {
    name: 'Harvester of Inspiration',
    description: 'Shared 50 prompts',
    gradient: ['#10b981', '#059669'], // emerald shades
    icon: 'flower',
    category: 'Sharing',
  },

  // Doodle upload badges
  first_doodle: {
    name: 'First Doodle',
    description: 'Uploaded your first artwork',
    gradient: ['#f472b6', '#ec4899'], // pink shades
    icon: 'pencil',
    category: 'Creative',
  },
  doodle_diary: {
    name: 'Doodle Diary',
    description: 'Uploaded 10 doodles',
    gradient: ['#ec4899', '#db2777'], // pink shades
    icon: 'book-open',
    category: 'Creative',
  },
  doodle_digest: {
    name: 'Doodle Digest',
    description: 'Uploaded 25 doodles',
    gradient: ['#db2777', '#be185d'], // pink shades
    icon: 'palette',
    category: 'Creative',
  },
  doodle_library: {
    name: 'Doodle Library',
    description: 'Uploaded 50 doodles',
    gradient: ['#a855f7', '#9333ea'], // purple shades
    icon: 'images',
    category: 'Creative',
  },
  daily_doodler: {
    name: 'Daily Doodler',
    description: 'Uploaded 7 days in a row',
    gradient: ['#8b5cf6', '#7c3aed'], // violet shades
    icon: 'calendar-check',
    category: 'Creative',
  },

  // Social badges
  warm_fuzzies: {
    name: 'Warm Fuzzies',
    description: 'Gave your first like',
    gradient: ['#fb7185', '#f43f5e'], // rose shades
    icon: 'heart',
    category: 'Social',
  },
  somebody_likes_me: {
    name: 'Somebody Likes Me',
    description: 'Received your first like',
    gradient: ['#f43f5e', '#e11d48'], // rose shades
    icon: 'heart-handshake',
    category: 'Social',
  },
  idea_fairy: {
    name: 'Idea Fairy',
    description: 'Submitted a prompt idea',
    gradient: ['#fbbf24', '#f59e0b'], // yellow to amber
    icon: 'lightbulb',
    category: 'Social',
  },

  // Holiday badges 2026 (Legendary)
  valentines_2026: {
    name: "Valentine's Artist '26",
    description: "Uploaded on Valentine's Day 2026",
    gradient: ['#fb7185', '#e11d48'], // rose/red
    icon: 'rose',
    category: 'Holiday',
    rarity: 'legendary',
  },
  lucky_creator_2026: {
    name: "Lucky Creator '26",
    description: "Uploaded on St. Patrick's Day 2026",
    gradient: ['#4ade80', '#16a34a'], // green
    icon: 'clover',
    category: 'Holiday',
    rarity: 'legendary',
  },
  earth_day_2026: {
    name: "Earth Day Artist '26",
    description: 'Uploaded on Earth Day 2026',
    gradient: ['#22d3ee', '#0891b2'], // cyan to teal
    icon: 'globe',
    category: 'Holiday',
    rarity: 'legendary',
  },
  independence_2026: {
    name: "Independence Artist '26",
    description: 'Uploaded on July 4th 2026',
    gradient: ['#3b82f6', '#dc2626'], // blue to red
    icon: 'star',
    category: 'Holiday',
    rarity: 'legendary',
  },
  spooky_season_2026: {
    name: "Spooky Season '26",
    description: 'Uploaded on Halloween 2026',
    gradient: ['#f97316', '#9333ea'], // orange to purple
    icon: 'ghost',
    category: 'Holiday',
    rarity: 'legendary',
  },
  thanksgiving_2026: {
    name: "Thankful Artist '26",
    description: 'Uploaded on Thanksgiving 2026',
    gradient: ['#f59e0b', '#ea580c'], // amber to orange
    icon: 'drumstick',
    category: 'Holiday',
    rarity: 'legendary',
  },
  holiday_spirit_2026: {
    name: "Holiday Spirit '26",
    description: 'Uploaded on Christmas 2026',
    gradient: ['#ef4444', '#16a34a'], // red to green
    icon: 'gift',
    category: 'Holiday',
    rarity: 'legendary',
  },
  new_year_spark_2027: {
    name: "New Year Spark '27",
    description: "Uploaded on New Year's Day 2027",
    gradient: ['#fbbf24', '#f59e0b'], // yellow to amber
    icon: 'party-popper',
    category: 'Holiday',
    rarity: 'legendary',
  },

  // Monthly Challenge badges 2026 (Epic) - All "Dedicated Doodler"
  january_champion_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'January',
    displayYear: '2026',
    description: 'Completed 15 doodles in January 2026',
    gradient: ['#2dd4bf', '#06b6d4'], // teal to cyan
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  february_faithful_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'February',
    displayYear: '2026',
    description: 'Completed 15 doodles in February 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  march_maestro_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'March',
    displayYear: '2026',
    description: 'Completed 15 doodles in March 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  april_artist_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'April',
    displayYear: '2026',
    description: 'Completed 15 doodles in April 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  may_maven_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'May',
    displayYear: '2026',
    description: 'Completed 15 doodles in May 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  june_genius_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'June',
    displayYear: '2026',
    description: 'Completed 15 doodles in June 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  july_journeyer_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'July',
    displayYear: '2026',
    description: 'Completed 15 doodles in July 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  august_ace_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'August',
    displayYear: '2026',
    description: 'Completed 15 doodles in August 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  september_star_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'September',
    displayYear: '2026',
    description: 'Completed 15 doodles in September 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  october_original_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'October',
    displayYear: '2026',
    description: 'Completed 15 doodles in October 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  november_notable_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'November',
    displayYear: '2026',
    description: 'Completed 15 doodles in November 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
  december_dedicator_2026: {
    name: 'Dedicated Doodler',
    displayMonth: 'December',
    displayYear: '2026',
    description: 'Completed 15 doodles in December 2026',
    gradient: ['#2dd4bf', '#06b6d4'],
    icon: 'calendar-check',
    category: 'Monthly',
    rarity: 'epic',
  },
};

// Lucide icon SVG paths (simplified versions at 24x24 viewBox)
const ICON_PATHS = {
  'sparkles': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  'crown': '<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>',
  'flame-kindling': '<path d="M12 2c1 3 2.5 3.5 3.5 4.5A5 5 0 0 1 17 10a5 5 0 1 1-10 0c0-.3 0-.6.1-.9a3.5 3.5 0 0 0 4.9-4.1"/><path d="M5 22v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>',
  'flame': '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  'rocket': '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  'orbit': '<circle cx="12" cy="12" r="3"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="12" cy="5" r="2"/><path d="m12 5 0 3"/><path d="m12 16 0 3"/><path d="m5 12 3 0"/><path d="m16 12 3 0"/>',
  'bookmark': '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  'library': '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  'gem': '<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>',
  'sprout': '<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>',
  'shrub': '<path d="M12 21v-6"/><path d="M9.5 7.5a3.5 3.5 0 1 0 5 0"/><path d="M12 15a4.5 4.5 0 1 0-4.5-4.5"/><path d="M12 15a4.5 4.5 0 1 1 4.5-4.5"/>',
  'trees': '<path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M10.2 18H19a3 3 0 0 0 .1-5.8A3 3 0 0 0 13 10a3 3 0 0 0-3 3 3 3 0 0 0 .2 1"/>',
  'flower': '<circle cx="12" cy="12" r="3"/><path d="M12 16.5A4.5 4.5 0 1 1 7.5 12 4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 1 1 4.5 4.5 4.5 4.5 0 1 1-4.5 4.5"/><path d="M12 7.5V9"/><path d="M7.5 12H9"/><path d="M16.5 12H15"/><path d="M12 16.5V15"/><path d="m8 8 1.88 1.88"/><path d="M14.12 9.88 16 8"/><path d="m8 16 1.88-1.88"/><path d="M14.12 14.12 16 16"/>',
  'pencil': '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  'palette': '<circle cx="13.5" cy="6.5" r="2"/><circle cx="17.5" cy="10.5" r="2"/><circle cx="8.5" cy="7.5" r="2"/><circle cx="6.5" cy="12.5" r="2"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z"/>',
  'images': '<path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><circle cx="12" cy="8" r="2"/><rect width="16" height="16" x="6" y="2" rx="2"/>',
  'calendar-check': '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
  'heart': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  'heart-handshake': '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5 9.04 7.96a2.17 2.17 0 0 0 0 3.08c.82.82 2.13.85 3 .07l2.07-1.9a2.82 2.82 0 0 1 3.79 0l2.96 2.66"/><path d="m18 15-2-2"/><path d="m15 18-2-2"/>',
  'lightbulb': '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  'rose': '<path d="M12 20.94c1.5 0 2.75 1.06 4-1.94 0 0-2.5 1-4-2s-4 2-4 2c1.25 3 2.5 1.94 4 1.94Z"/><path d="M11.18 15.46A4.26 4.26 0 0 0 8 13c0-1.95.95-3.11 2-4 .67-.57 1.27-1.78 1-3 0 0 2 .5 3 2 .67 1 1 2.05 1 3 0 1.5-.58 2.73-1.5 3.73"/><path d="M12 8c4-4 6-2 6 1a4 4 0 0 1-4 4"/><path d="M12 8c-4-4-6-2-6 1a4 4 0 0 0 4 4"/>',
  'clover': '<path d="M16.17 7.83 2 22"/><path d="M4.02 12a2.827 2.827 0 1 1 3.81-4.17A2.827 2.827 0 1 1 12 4.02a2.827 2.827 0 1 1 4.17 3.81A2.827 2.827 0 1 1 19.98 12a2.827 2.827 0 1 1-3.81 4.17A2.827 2.827 0 1 1 12 19.98a2.827 2.827 0 1 1-4.17-3.81A2.827 2.827 0 1 1 4.02 12Z"/>',
  'globe': '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  'star': '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
  'ghost': '<path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/>',
  'drumstick': '<path d="M15.45 15.4c-2.13.65-4.3.32-5.7-1.1-2.29-2.27-1.76-6.59 1.21-9.58 2.98-2.98 7.3-3.5 9.58-1.22 1.42 1.42 1.75 3.57 1.1 5.71"/><path d="m11.25 15.6-2.16 2.16a2.5 2.5 0 1 1-4.56 1.73 2.49 2.49 0 0 1-1.41-4.24 2.5 2.5 0 0 1 3.14-.32l2.16-2.16"/>',
  'gift': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>',
  'party-popper': '<path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/>',
};

/**
 * Generate SVG for a badge
 */
function generateBadgeSVG(badgeType, badge) {
  const [color1, color2] = badge.gradient;
  const iconPath = ICON_PATHS[badge.icon] || ICON_PATHS['sparkles'];

  // For monthly badges, show month/year
  const displayTitle = badge.displayMonth
    ? `${badge.name} - ${badge.displayMonth} ${badge.displayYear}`
    : badge.name;

  // Rarity indicator
  const rarityLabel = badge.rarity === 'legendary'
    ? 'LEGENDARY'
    : badge.rarity === 'epic'
    ? 'EPIC'
    : '';

  const rarityColor = badge.rarity === 'legendary'
    ? '#fbbf24'
    : badge.rarity === 'epic'
    ? '#2dd4bf'
    : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <!-- Badge gradient -->
    <linearGradient id="badge-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>

    <!-- Glow effect -->
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>

    <!-- Ring glow -->
    <filter id="ring-glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg-gradient)"/>

  <!-- Decorative pattern -->
  <g opacity="0.1">
    <circle cx="100" cy="100" r="200" fill="${color1}" filter="url(#glow)"/>
    <circle cx="1100" cy="530" r="250" fill="${color2}" filter="url(#glow)"/>
  </g>

  <!-- Badge circle with ring -->
  <g transform="translate(600, 260)">
    <!-- Outer ring glow -->
    <circle r="140" fill="none" stroke="${color1}" stroke-width="8" opacity="0.5" filter="url(#ring-glow)"/>

    <!-- Badge background -->
    <circle r="120" fill="url(#badge-gradient)" filter="url(#glow)"/>

    <!-- Inner ring -->
    <circle r="110" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>

    <!-- Icon (scaled up from 24x24 to 100x100) -->
    <g transform="translate(-50, -50) scale(4.17)" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${iconPath}
    </g>
  </g>

  <!-- Badge name -->
  <text x="600" y="450" font-family="system-ui, -apple-system, sans-serif" font-size="48" font-weight="700" fill="white" text-anchor="middle">
    ${escapeXml(displayTitle)}
  </text>

  <!-- Description -->
  <text x="600" y="500" font-family="system-ui, -apple-system, sans-serif" font-size="24" fill="rgba(255,255,255,0.7)" text-anchor="middle">
    ${escapeXml(badge.description)}
  </text>

  <!-- Rarity label -->
  ${rarityLabel ? `
  <g transform="translate(600, 540)">
    <rect x="-60" y="-18" width="120" height="36" rx="18" fill="${rarityColor}" opacity="0.2"/>
    <text x="0" y="8" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="${rarityColor}" text-anchor="middle">
      ${rarityLabel}
    </text>
  </g>
  ` : ''}

  <!-- Category label -->
  <text x="600" y="580" font-family="system-ui, -apple-system, sans-serif" font-size="18" fill="rgba(255,255,255,0.4)" text-anchor="middle">
    ${badge.category} Badge
  </text>

  <!-- App branding -->
  <text x="60" y="590" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="600" fill="rgba(255,255,255,0.6)">
    Daily Doodle Prompt
  </text>

  <!-- URL -->
  <text x="1140" y="590" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="rgba(255,255,255,0.4)" text-anchor="end">
    dailydoodleprompt.com
  </text>
</svg>`;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Main function
 */
function main() {
  console.log('🎨 Badge Share Image Generator\n');
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  let count = 0;
  const errors = [];

  for (const [badgeType, badge] of Object.entries(BADGES)) {
    try {
      const svg = generateBadgeSVG(badgeType, badge);
      const filePath = path.join(OUTPUT_DIR, `${badgeType}.svg`);
      fs.writeFileSync(filePath, svg, 'utf8');
      count++;
      console.log(`✅ Generated: ${badgeType}.svg`);
    } catch (error) {
      errors.push({ badgeType, error: error.message });
      console.error(`❌ Failed: ${badgeType} - ${error.message}`);
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   Generated: ${count} files`);
  console.log(`   Errors: ${errors.length}`);
  console.log(`   Total badges: ${Object.keys(BADGES).length}`);

  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(({ badgeType, error }) => {
      console.log(`   - ${badgeType}: ${error}`);
    });
    process.exit(1);
  }

  console.log('\n✨ All badge images generated successfully!');
}

main();
