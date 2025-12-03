# Daily Doodle Prompt - Production Deployment Guide

## 🚀 Quick Start Deployment

This guide covers the complete deployment process from Creao → GitHub → Vercel.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] GitHub account
- [ ] Vercel account (linked to GitHub)
- [ ] Google OAuth credentials (for Google login)
- [ ] Apple OAuth credentials (for Apple login)
- [ ] Creao Platform API access
- [ ] All environment variables documented

---

## 🔧 Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file based on `.env.example`:

```bash
cp .env.example .env.local
```

### Critical Variables for Production

| Variable | Required | Description | Where to Get |
|----------|----------|-------------|--------------|
| `VITE_API_BASE_PATH` | ✅ | Creao Platform API endpoint | Creao Dashboard |
| `VITE_MCP_API_BASE_PATH` | ✅ | MCP API endpoint | Creao Dashboard |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID | Google Cloud Console |
| `VITE_APPLE_CLIENT_ID` | ✅ | Apple OAuth Service ID | Apple Developer Portal |
| `VITE_FILE_UPLOAD_ENDPOINT` | ✅ | File upload service URL | Creao Dashboard |
| `VITE_PRODUCTION_DOMAIN` | ✅ | Your production domain | Your Vercel deployment |
| `VITE_OAUTH_REDIRECT_URI` | ✅ | OAuth callback URL | `https://your-domain.vercel.app/auth/callback` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `TENANT_ID` | (empty) | Multi-tenant identifier |
| `VITE_APP_TIMEZONE` | `America/New_York` | Application timezone |
| `VITE_SESSION_EXPIRY_HOURS` | `24` | Session duration |
| `VITE_ENABLE_PREMIUM_FEATURES` | `true` | Enable premium features |
| `VITE_GA_MEASUREMENT_ID` | (empty) | Google Analytics ID |
| `VITE_SENTRY_DSN` | (empty) | Sentry error tracking |

---

## 📦 Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository (if not already done)

```bash
cd /home/user/vite-template
git init
git add .
git commit -m "Initial commit: Daily Doodle Prompt app"
```

### 1.2 Create GitHub Repository

**Option A: Using GitHub CLI**
```bash
gh repo create daily-doodle-prompt --public --source=. --remote=origin
git push -u origin main
```

**Option B: Using GitHub Web UI**
1. Go to https://github.com/new
2. Repository name: `daily-doodle-prompt`
3. Description: "Daily drawing prompt app with streak tracking and social features"
4. Public or Private (your choice)
5. Do NOT initialize with README (already exists)
6. Click "Create repository"

```bash
git remote add origin https://github.com/YOUR_USERNAME/daily-doodle-prompt.git
git branch -M main
git push -u origin main
```

### 1.3 Verify Repository Contents

Ensure these files are committed:
- ✅ `src/` directory with all components
- ✅ `package.json` with updated metadata
- ✅ `vite.config.js` with production optimizations
- ✅ `vercel.json` for Vercel configuration
- ✅ `.env.example` (template for env vars)
- ✅ `.gitignore` (excludes `.env.local`)
- ✅ `README.md`
- ✅ `DEPLOYMENT.md` (this file)

**Critical:** Never commit `.env.local` or any file containing secrets!

---

## 🌐 Step 2: Configure OAuth Providers

### 2.1 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-domain.vercel.app` (production)
7. Authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://your-domain.vercel.app/auth/callback` (production)
8. Copy **Client ID** and **Client Secret**

### 2.2 Apple OAuth Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Create a new **Services ID**
3. Enable **Sign in with Apple**
4. Configure domains and redirect URIs:
   - Domains: `your-domain.vercel.app`
   - Redirect URIs: `https://your-domain.vercel.app/auth/callback`
5. Create a **Key** for Sign in with Apple
6. Download the `.p8` key file
7. Note your **Team ID**, **Key ID**, and **Service ID**

---

## 🚢 Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 3.2 Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **Import Project**
3. Import your GitHub repository: `YOUR_USERNAME/daily-doodle-prompt`
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.3 Add Environment Variables in Vercel

Go to **Project Settings** → **Environment Variables** and add:

**Production Environment:**
```
VITE_API_BASE_PATH=https://api.creao.com/v1
VITE_MCP_API_BASE_PATH=https://mcp.creao.com/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_APPLE_CLIENT_ID=your_apple_service_id
VITE_APPLE_TEAM_ID=your_apple_team_id
VITE_APPLE_KEY_ID=your_apple_key_id
VITE_APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----
VITE_FILE_UPLOAD_ENDPOINT=https://files.creao.com/upload
VITE_PRODUCTION_DOMAIN=https://your-domain.vercel.app
VITE_OAUTH_REDIRECT_URI=https://your-domain.vercel.app/auth/callback
VITE_APP_TIMEZONE=America/New_York
VITE_SESSION_EXPIRY_HOURS=24
VITE_ENABLE_PREMIUM_FEATURES=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_BADGES=true
VITE_ENABLE_STREAKS=true
NODE_ENV=production
```

**Optional Analytics:**
```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### 3.4 Deploy

Click **Deploy** and wait for the build to complete.

---

## ✅ Step 4: Post-Deployment Validation

### 4.1 Verify Build Success

Check Vercel deployment logs for:
- ✅ No TypeScript errors
- ✅ No ESLint errors
- ✅ Build completed successfully
- ✅ Assets optimized and chunked

### 4.2 Test Production Features

Visit your production URL: `https://your-domain.vercel.app`

**Authentication:**
- [ ] Google login works
- [ ] Apple login works
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] "Stay logged in" checkbox persists session
- [ ] Logout clears session correctly

**Core Features:**
- [ ] Today's prompt loads correctly
- [ ] Prompt displays correct date (EST timezone)
- [ ] Upload doodle works
- [ ] Uploaded images display correctly
- [ ] Like/favorite buttons work
- [ ] Share functionality works
- [ ] Archive view shows past prompts

**User Profile:**
- [ ] Profile displays user info
- [ ] Avatar selection works
- [ ] Username editing works
- [ ] Streak counter displays correctly
- [ ] Badges persist after logout/login

**Premium Features (if enabled):**
- [ ] Premium gating works
- [ ] Premium badge awarded correctly
- [ ] Premium-only features are accessible

**Admin Panel (if enabled):**
- [ ] Admin users can access admin panel
- [ ] Featured prompt selection works
- [ ] User moderation works

### 4.3 Test OAuth Callbacks

**Critical:** Ensure OAuth redirect URIs match exactly:

| Provider | Redirect URI |
|----------|--------------|
| Google | `https://your-domain.vercel.app/auth/callback` |
| Apple | `https://your-domain.vercel.app/auth/callback` |

If login fails, check:
1. Vercel environment variables are set
2. OAuth provider redirect URIs are configured
3. Browser console for errors
4. Vercel deployment logs

---

## 🔄 Step 5: Continuous Deployment

### 5.1 Automatic Deployments

Vercel automatically deploys on every push to `main` branch:

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

### 5.2 Preview Deployments

Create a feature branch for testing:

```bash
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

Vercel creates a preview deployment with a unique URL.

### 5.3 Rollback

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "Promote to Production"

---

## 🐛 Troubleshooting

### Build Fails with TypeScript Errors

```bash
npm run type-check
```

Fix errors in your local environment first.

### OAuth Login Fails

1. Check environment variables in Vercel
2. Verify redirect URIs in OAuth provider dashboards
3. Check browser console for errors
4. Ensure `VITE_OAUTH_REDIRECT_URI` matches your domain

### Images Not Loading

1. Verify `VITE_FILE_UPLOAD_ENDPOINT` is set
2. Check CORS configuration on file upload service
3. Ensure file upload service is accessible from production

### Prompt Not Updating at Midnight EST

1. Verify `VITE_APP_TIMEZONE=America/New_York`
2. Check Google Sheets CSV export URL is accessible
3. Clear browser cache and reload

### Badge Persistence Issues

Badges are stored in `localStorage`. Check:
1. Browser allows `localStorage`
2. User is logged in
3. `localStorage` key: `dailydoodle_user_badges_{userId}`

---

## 📊 Monitoring & Analytics

### Performance Monitoring

Use Vercel Analytics:
1. Go to Vercel Dashboard → Analytics
2. Enable Speed Insights
3. Monitor Core Web Vitals

### Error Tracking

Set up Sentry (optional):

```bash
npm install @sentry/react @sentry/vite-plugin
```

Add to `vite.config.js`:

```javascript
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    sentryVitePlugin({
      org: 'your-org',
      project: 'daily-doodle-prompt',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
});
```

Add `VITE_SENTRY_DSN` to Vercel environment variables.

### Google Analytics

Add to `index.html` (already configured):

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

Set `VITE_GA_MEASUREMENT_ID` in Vercel.

---

## 🔐 Security Best Practices

### Environment Variables

- ✅ Never commit `.env.local` to Git
- ✅ Use Vercel environment variables for secrets
- ✅ Rotate OAuth secrets regularly
- ✅ Use different credentials for dev/prod

### CORS Configuration

Ensure API endpoints allow requests from:
- `https://your-domain.vercel.app`
- `http://localhost:3000` (dev only)

### Content Security Policy

Already configured in `vercel.json`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 📞 Support & Resources

### Documentation
- [Vite Documentation](https://vitejs.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [React 19 Documentation](https://react.dev/)
- [TanStack Router](https://tanstack.com/router)
- [TanStack Query](https://tanstack.com/query)

### OAuth Provider Docs
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In](https://developer.apple.com/sign-in-with-apple/)

### Creao Platform
- Contact Creao support for API issues
- Check Creao dashboard for service status

---

## 🎉 Deployment Complete!

Your Daily Doodle Prompt app is now live at:
**https://your-domain.vercel.app**

Next steps:
1. Share with users
2. Monitor analytics
3. Collect feedback
4. Iterate and improve

Happy doodling! 🎨
