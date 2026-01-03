# Daily Doodle Prompt - Codebase Context

> Generated: 2026-01-03
> For use with Claude Project to maintain context across conversations.

---

## 1. Project Overview

**Daily Doodle Prompt** is a creative web app that provides daily drawing prompts to inspire artists. Users can upload their doodles, track streaks, earn badges, follow other artists, and share their work.

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite (rolldown)
- Routing: TanStack Router (file-based)
- State: Zustand
- Styling: Tailwind CSS v4 + Radix UI components
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Payments: Stripe (one-time lifetime unlock)
- Email: Resend
- Hosting: Vercel (Edge Functions for API routes)
- Icons: Lucide React v0.562.0

---

## 2. Package.json - Key Dependencies

### Core Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | React DOM |
| @tanstack/react-router | ^1.114.3 | File-based routing |
| zustand | ^5.0.8 | State management |
| tailwindcss | ^4.0.6 | Styling |
| lucide-react | ^0.562.0 | Icons (includes Rose icon) |
| @supabase/supabase-js | ^2.49.1 | Database & auth |
| stripe | ^20.0.0 | Payments (server) |
| @stripe/stripe-js | ^8.5.3 | Payments (client) |
| resend | ^6.6.0 | Email sending |
| zod | ^3.25.50 | Schema validation |
| date-fns | ^3.6.0 | Date utilities |
| sonner | ^2.0.6 | Toast notifications |

### Radix UI Components
- accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu
- hover-card, label, popover, progress, radio-group, scroll-area
- select, separator, slider, switch, tabs, toggle, tooltip

### Scripts
```bash
npm run dev          # Start dev server on port 3000
npm run build        # Type check + build
npm run build:nocheck # Build without type checking
npm run test         # Run Vitest tests
npm run format       # Format with Biome
npm run type-check   # TypeScript check only
```

---

## 3. Project Structure

```
daily-doodle-prompt/
├── api/                      # Vercel Edge API routes
│   ├── checkout/             # Stripe checkout
│   ├── email/                # Email templates (welcome)
│   ├── lib/                  # Shared utilities (KV)
│   ├── meta/                 # OG meta routes for social sharing
│   │   ├── doodle.ts         # /api/meta/doodle?id=xxx
│   │   ├── profile.ts        # /api/meta/profile?username=xxx
│   │   └── prompt.ts         # /api/meta/prompt?date=xxx
│   ├── stripe/               # Stripe webhooks & verification
│   ├── me.ts                 # Current user endpoint
│   └── send-email.ts         # Generic email sender
├── config/                   # ESLint, hooks, scripts
├── public/                   # Static assets, og-image.png
├── src/
│   ├── assets/               # Images, fonts
│   ├── components/           # React components
│   │   ├── ui/               # shadcn/ui base components
│   │   └── *.tsx             # App components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities (utils, profanity-filter, etc.)
│   ├── routes/               # TanStack Router file-based routes
│   │   ├── __root.tsx        # Root layout
│   │   ├── index.tsx         # Homepage
│   │   ├── doodle/$id.tsx    # Deep link for doodle sharing
│   │   ├── profile/$username.tsx # Deep link for profile sharing
│   │   ├── prompt/$date.tsx  # Deep link for prompt sharing
│   │   └── payment/          # Success/cancel pages
│   ├── sdk/                  # API clients, auth, Supabase
│   ├── store/                # Zustand store (app-store.ts)
│   ├── types/                # TypeScript types (index.ts)
│   └── views/                # Page views (ProfileView, AdminView, etc.)
├── package.json
├── vercel.json               # Vercel config with crawler rewrites
├── vite.config.js
└── tsconfig.json
```

---

## 4. Environment Variables

### Client-side (VITE_*)
| Variable | Description |
|----------|-------------|
| VITE_SUPABASE_URL | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | Supabase anonymous key (public) |
| VITE_SUPPORT_INBOX_EMAIL | Support email address |
| VITE_USE_REAL_AUTH | Enable real auth (vs mock) |
| VITE_API_BASE_PATH | API base path |
| VITE_MCP_API_BASE_PATH | MCP API base path |

### Server-side (Vercel)
| Variable | Description |
|----------|-------------|
| SUPABASE_URL | Supabase project URL |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role (admin) |
| SUPABASE_ANON_KEY | Supabase anonymous key |
| STRIPE_SECRET_KEY | Stripe secret key |
| STRIPE_WEBHOOK_SECRET | Stripe webhook signing secret |
| STRIPE_PRICE_ID | Stripe price ID for lifetime unlock |
| STRIPE_SUCCESS_URL | Redirect after successful payment |
| STRIPE_CANCEL_URL | Redirect after cancelled payment |
| RESEND_API_KEY | Resend API key for emails |
| EMAIL_FROM | Sender email address |
| KV_REST_API_URL | Upstash Redis URL |
| KV_REST_API_TOKEN | Upstash Redis token |

---

## 5. Database Schema (Supabase PostgreSQL)

### Tables Overview

| Table | Purpose |
|-------|---------|
| profiles | User data (extends auth.users) |
| doodles | Uploaded artwork |
| user_badges | Earned badges |
| streaks | Daily activity streaks |
| bookmarks | Saved prompts |
| follows | Social graph |
| likes | Doodle likes |

### profiles
```sql
id              uuid PRIMARY KEY (refs auth.users)
email           text
username        text (3-20 chars)
avatar_type     text ('initial', 'icon', 'upload')
avatar_icon     text
current_title   text (selected badge title)
is_premium      boolean DEFAULT false
is_admin        boolean DEFAULT false
stripe_customer_id text
viewed_badges   text[]
email_notifications boolean DEFAULT true
created_at      timestamptz
updated_at      timestamptz
```

### doodles
```sql
id              uuid PRIMARY KEY
user_id         uuid REFERENCES profiles(id)
user_username   text (cached)
user_avatar_type text (cached)
user_avatar_icon text (cached)
prompt_id       text (YYYY-MM-DD)
prompt_title    text
image_url       text
caption         text
is_public       boolean DEFAULT true
likes_count     integer DEFAULT 0
created_at      timestamptz
```

### user_badges
```sql
user_id         uuid REFERENCES profiles(id)
badge_id        text (badge_type string)
earned_at       timestamptz
PRIMARY KEY (user_id, badge_id)
```

### streaks
```sql
user_id         uuid PRIMARY KEY REFERENCES profiles(id)
current_streak  integer DEFAULT 0
longest_streak  integer DEFAULT 0
last_active     date
```

### bookmarks
```sql
user_id         uuid REFERENCES profiles(id)
prompt_id       text (YYYY-MM-DD)
created_at      timestamptz
PRIMARY KEY (user_id, prompt_id)
```

### follows
```sql
follower_id     uuid REFERENCES profiles(id)
following_id    uuid REFERENCES profiles(id)
created_at      timestamptz
PRIMARY KEY (follower_id, following_id)
CHECK (follower_id != following_id)
```

### likes
```sql
user_id         uuid REFERENCES profiles(id)
doodle_id       uuid REFERENCES doodles(id)
created_at      timestamptz
PRIMARY KEY (user_id, doodle_id)
```

---

## 6. Badge System

### BadgeType (43 total badges)

```typescript
export type BadgeType =
  // Membership (2)
  | 'creative_spark'           // First successful login
  | 'premium_patron'           // Lifetime unlock purchase

  // Streak badges (5)
  | 'creative_ember'           // 3 days in a row
  | 'creative_fire'            // 7 days in a row
  | 'creative_blaze'           // 14 days in a row
  | 'creative_rocket'          // 30 days in a row
  | 'creative_supernova'       // 100 days in a row

  // Collection badges (4)
  | 'new_collector'            // Favorited first prompt
  | 'pack_rat'                 // Favorited 10 prompts
  | 'cue_curator'              // Favorited 25 prompts
  | 'grand_gatherer'           // Favorited 50 prompts

  // Sharing badges (4)
  | 'planter_of_seeds'         // Shared first prompt
  | 'gardener_of_growth'       // Shared 10 prompts
  | 'cultivator_of_influence'  // Shared 25 prompts
  | 'harvester_of_inspiration' // Shared 50 prompts

  // Doodle upload badges (5)
  | 'first_doodle'             // Uploaded first doodle
  | 'doodle_diary'             // Uploaded 10 doodles
  | 'doodle_digest'            // Uploaded 25 doodles
  | 'doodle_library'           // Uploaded 50 doodles
  | 'daily_doodler'            // Uploaded 7 days in a row

  // Social badges (3)
  | 'warm_fuzzies'             // First like given
  | 'somebody_likes_me'        // First like received
  | 'idea_fairy'               // Submitted a prompt idea

  // Holiday badges 2026 (8) - Legendary rarity
  | 'valentines_2026'          // Valentine's Day - Rose icon
  | 'lucky_creator_2026'       // St. Patrick's Day - Clover icon
  | 'earth_day_2026'           // Earth Day - Globe icon
  | 'independence_2026'        // July 4th - Star icon
  | 'spooky_season_2026'       // Halloween - Ghost icon
  | 'thanksgiving_2026'        // Thanksgiving - Drumstick icon
  | 'holiday_spirit_2026'      // Christmas - Gift icon
  | 'new_year_spark_2027'      // New Year's - PartyPopper icon

  // Monthly Challenge badges 2026 (12) - Epic rarity
  | 'january_champion_2026'    // through december_dedicator_2026
  // All use: name="Dedicated Doodler", CalendarCheck icon, teal gradient
  // displayMonth and displayYear fields for display
```

### Badge Rarity & Colors
- **Legendary** (holiday): Gold ring, unique icons per holiday
- **Epic** (monthly): Teal ring, CalendarCheck icon, teal gradient (`from-teal-400 to-cyan-500`)
- **Common**: Standard colors per category

### Admin Preview Mode
Admins can click "Preview All" in BadgeCabinet to see all 43 badges, including hidden seasonal badges.

---

## 7. Routes

### Frontend Routes (TanStack Router)
| Route | View | Description |
|-------|------|-------------|
| / | index.tsx | Homepage with prompt & feed |
| /prompt | PromptView | Today's prompt |
| /prompt/:date | Deep link | Share-friendly prompt URL |
| /profile/:username | Deep link | Share-friendly profile URL |
| /doodle/:id | Deep link | Share-friendly doodle URL |
| /terms | TermsView | Terms of service |
| /privacy | PrivacyView | Privacy policy |
| /support | SupportView | Contact/support |
| /payment/success | PaymentSuccessView | Post-payment success |
| /payment/cancel | PaymentCancelView | Post-payment cancel |

### API Routes (Vercel Edge)
| Route | Method | Description |
|-------|--------|-------------|
| /api/me | GET | Current user data |
| /api/send-email | POST | Send support emails |
| /api/checkout/create-session | POST | Create Stripe checkout |
| /api/stripe/verify-session | GET | Verify Stripe session |
| /api/stripe/webhook | POST | Stripe webhook handler |
| /api/email/welcome | POST | Send welcome email |
| /api/meta/doodle | GET | OG meta for doodle sharing |
| /api/meta/profile | GET | OG meta for profile sharing |
| /api/meta/prompt | GET | OG meta for prompt sharing |

---

## 8. Key Components

| Component | Description |
|-----------|-------------|
| Navigation | Main nav with auth, user menu, mobile menu |
| SimpleHeader | Minimal header for auth pages |
| PromptCard | Displays daily prompt with actions |
| DoodleUpload | Upload form with image preview |
| DoodleGallery | Grid of doodles for a prompt |
| DoodleFeed | Infinite scroll feed of doodles |
| DoodleImage | Optimized image with loading states |
| BadgeCabinet | Badge collection display with admin preview |
| BadgeUnlockPopup | Celebration popup for new badges |
| BadgeDisplay | Single badge icon display |
| ShareButton | Social sharing dropdown |
| LikeButton | Like/unlike doodle |
| FollowButton | Follow/unfollow user |
| UserAvatar | Avatar with icon/initial/image support |
| TitleSelector | Select badge title to display |
| StreakBadge | Streak count display |
| ActivityHeatmap | GitHub-style activity calendar |
| AuthDialog | Login/signup modal |
| OnboardingDialog | New user onboarding flow |
| UsernameSetupDialog | Username selection |
| ReportDoodleDialog | Report inappropriate content |

---

## 9. State Management (Zustand)

The app uses a single Zustand store in `src/store/app-store.ts`:

### Key State
- `user` - Current authenticated user
- `profile` - User profile data
- `doodles` - Cached doodles by user
- `badges` - User's earned badges
- `viewedBadges` - Badges user has seen (for green dot)
- `newlyEarnedBadge` - Latest badge for celebration popup
- `streak` - Current/longest streak data
- `bookmarks` - Saved prompts
- `follows` - Following relationships
- `likes` - Liked doodles

### Key Actions
- `setUser`, `setProfile` - Auth state
- `addBadge`, `markBadgeAsViewed` - Badge management
- `uploadDoodle`, `deleteDoodle` - Doodle CRUD
- `toggleLike`, `toggleFollow` - Social actions
- `updateStreak` - Streak calculation

---

## 10. Known TODOs

```
src/sdk/core/request.ts:35
  // TODO: check response status and throw error if not 200

src/sdk/core/internal/internal-types.ts:33
  [key: string]: unknown; // FIXME: unused - clean existing code later!
```

---

## 11. Git Status

**Branch:** main

**Recent Commits:**
1. `69240322` Update holiday badge icons and lucide-react
2. `edf1f577` Update holiday badge icons and title
3. `048087bb` Standardize monthly badges to Dedicated Doodler + add admin preview
4. `795d264d` Add badge sharing + simplify OG images
5. `400fd359` Fix OG routes with correct Next.js API format

**Uncommitted:** Only .DS_Store files (can be ignored)

---

## 12. Prompts Data Source

Prompts are fetched from a Google Sheets CSV export:
- Spreadsheet ID: `1tWJQOUhUfENl-xBd-TOQEv0BmaRb5USG`
- Sheet GID: `1177623891`
- Columns: date, title, description, category

---

## 13. Social Sharing Architecture

For SPAs, social crawlers need server-rendered meta tags. The solution:

1. **Deep link routes** (`/doodle/:id`, `/profile/:username`, `/prompt/:date`) - React routes
2. **Meta API routes** (`/api/meta/*`) - Return HTML with OG tags + redirect
3. **Vercel rewrites** - Detect crawlers by user-agent and redirect to meta routes

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/doodle/:id",
      "has": [{ "type": "header", "key": "user-agent", "value": ".*bot.*|.*crawler.*" }],
      "destination": "/api/meta/doodle?id=:id"
    }
  ]
}
```

---

## 14. Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server

# Building
npm run build                  # Full build with checks
npm run build:nocheck          # Quick build

# Type checking
npx tsc --noEmit               # Check types

# Testing
npm test                       # Run tests

# Formatting
npm run format                 # Format with Biome

# Git
git status                     # Check changes
git log -5 --oneline           # Recent commits
```

---

*Last updated: 2026-01-03*
