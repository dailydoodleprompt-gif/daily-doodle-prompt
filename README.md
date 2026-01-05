# Daily Doodle Prompt

Daily drawing inspiration and creative challenges for artists of all skill levels.

Get a fresh creative prompt every day, upload your artwork, earn badges, and join a community of artists improving their skills together.

**Live Site:** https://dailydoodleprompt.com

---

## Features

### Core Features
- **365 Daily Prompts** - A unique creative prompt for every day of the year
- **Doodle Upload** - Share your artwork with the community (Premium)
- **Social Features** - Like, follow, and interact with other artists
- **Notifications** - Get notified when someone likes your doodle or follows you
- **Badge Alerts** - Get reminded about time-limited holiday and monthly badges
- **Gamification** - Earn 43+ unique badges and build streaks
- **Archive** - Browse and filter all prompts by category
- **Bookmarks** - Save your favorite prompts for later
- **Personal Feed** - See doodles from artists you follow
- **Badge Sharing** - Share your earned badges with OG meta tags

### Premium Features ($4.99 lifetime)
- Unlimited doodle uploads
- Unlock all badges
- Submit prompt ideas for consideration
- Ad-free experience
- Support indie development
- Lifetime access - pay once, use forever

---

## Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TanStack Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library

### Backend & Services
- **Supabase** - PostgreSQL database, authentication, storage
- **Stripe** - Payment processing
- **Vercel** - Hosting and deployment

### Image Processing
- **Canvas API** - Client-side image compression
- Automatic resize to 1200x800px
- JPEG compression at 85% quality
- ~300KB average file size

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dailydoodleprompt-gif/daily-doodle-prompt.git
   cd daily-doodle-prompt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Supabase
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Stripe (Frontend)
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

   # Stripe (Backend - set in Vercel)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID=price_...

   # Cron Jobs (Backend - set in Vercel)
   CRON_SECRET=your_random_secret_for_cron_auth
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open http://localhost:5173

---

## Build & Deployment

### Build for Production
```bash
npm run build
```

Output directory: `dist/`

### Deploy to Vercel

**Automatic Deployment:**
- Connected to GitHub
- Auto-deploys on push to `main` branch
- Preview deployments for pull requests

**Environment Variables (set in Vercel Dashboard):**
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID
SUPABASE_URL
SUPABASE_ANON_KEY
SUPPORT_INBOX_EMAIL
RESEND_API_KEY
```

**Build Settings:**
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist
- Install Command: npm install

---

## Project Structure

```
daily-doodle-prompt/
├── public/               # Static assets
│   ├── og-image.png     # Social sharing image
│   ├── manifest.json    # PWA manifest
│   └── robots.txt       # SEO robots file
├── src/
│   ├── components/      # React components
│   │   ├── ui/         # shadcn/ui components
│   │   └── ...         # Feature components
│   ├── lib/            # Utilities and helpers
│   │   ├── profanity-filter.ts
│   │   ├── timezone.ts
│   │   └── utils.ts
│   ├── routes/         # TanStack Router pages
│   ├── store/          # Zustand state management
│   │   └── app-store.ts
│   ├── sdk/            # SDK and auth
│   │   └── core/
│   │       ├── auth.ts
│   │       └── supabase.ts
│   ├── views/          # Page view components
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript types
│   └── main.tsx        # App entry point
├── api/                # Vercel serverless API routes
│   ├── stripe/
│   │   ├── webhook.ts
│   │   └── verify-session.ts
│   ├── checkout/
│   │   └── create-session.ts
│   ├── me.ts
│   └── send-email.ts
└── index.html          # HTML entry point
```

---

## Documentation

- [API_ROUTES.md](./API_ROUTES.md) - Complete API documentation
- [DATABASE.md](./DATABASE.md) - Database schema documentation

---

## Key Tables

- **profiles** - User accounts and settings
- **doodles** - User-uploaded artwork
- **user_badges** - Badge achievements
- **streaks** - Daily activity tracking
- **bookmarks** - Saved prompts
- **follows** - User relationships
- **likes** - Doodle interactions
- **prompt_ideas** - Premium user prompt submissions for admin review
- **notifications** - User notifications for likes, follows, and system events

---

## Badges (43 Total)

### Achievement Badges
- **Creative Spark** - First login
- **Early Bird** - Upload by 6 AM
- **Night Owl** - Upload after 10 PM
- **Streak Master** - 7-day streak
- **Dedicated Artist** - 30-day streak
- **Premium Patron** - Lifetime premium
- **Somebody Likes Me** - First like received
- **Idea Fairy** - Submit first prompt idea (Premium)
- And 35+ more including holiday badges!

---

## Prompt Categories

- Abstract & Patterns
- Animals & Wildlife
- Characters & People
- Fantasy & Sci-Fi
- Food & Drink
- Nature & Landscapes
- Objects & Still Life
- Urban & Architecture
- Vehicles & Machines
- Conceptual & Emotions

---

## Testing

### Run Type Check
```bash
npx tsc --noEmit
```

### Build Check
```bash
npm run build
```

### Manual Testing Checklist
- [ ] Sign up new account
- [ ] Upload doodle (premium)
- [ ] Like/follow features
- [ ] Bookmark prompts
- [ ] Purchase premium
- [ ] Badge unlocks
- [ ] Mobile responsive

---

## Security

- **Authentication:** Supabase Auth with JWT
- **RLS Policies:** Row-level security on all tables
- **Input Validation:** Profanity filter on usernames
- **Image Upload:** Type and size restrictions
- **Payment Security:** Stripe with webhook verification
- **API Security:** Protected endpoints with auth checks
- **Environment Variables:** Secrets in Vercel only

---

## Performance

- **Bundle Size:** ~323KB gzipped
- **Image Optimization:** Automatic compression to ~300KB
- **Lazy Loading:** Images load on scroll
- **CDN:** Vercel Edge Network
- **Database:** Indexed queries, efficient RLS

---

## Contributing

This is currently a solo project, but feedback and bug reports are welcome!

Please report issues via GitHub Issues.

---

## License

MIT License

---

## Acknowledgments

Built with:
- [Supabase](https://supabase.com)
- [Stripe](https://stripe.com)
- [Vercel](https://vercel.com)
- [shadcn/ui](https://ui.shadcn.com)
- [TanStack Router](https://tanstack.com/router)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

## Contact

- **Website:** https://dailydoodleprompt.com

---

Made with love for artists everywhere
