# Vercel Deployment - Quick Setup Guide

Complete step-by-step instructions for deploying Daily Doodle Prompt to Vercel.

---

## 🚀 One-Click Deployment

### Option A: Deploy Button (Coming Soon)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/daily-doodle-prompt)

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ GitHub account with repository created
- ✅ Vercel account ([Sign up free](https://vercel.com/signup))
- ✅ All environment variables documented (see `ENV_VARS.md`)
- ✅ OAuth credentials from Google and Apple
- ✅ Creao Platform API access

---

## 🔧 Step-by-Step Deployment

### Step 1: Connect Vercel to GitHub

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. If first time:
   - Click **"Continue with GitHub"**
   - Authorize Vercel to access your GitHub account
5. Select your repository: `YOUR_USERNAME/daily-doodle-prompt`

---

### Step 2: Configure Project Settings

**Framework Preset:**
- Auto-detected: **Vite**
- ✅ Leave as-is

**Root Directory:**
- ✅ Leave empty (uses repository root)

**Build Settings:**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

**Node.js Version:**
- ✅ 18.x (recommended)

---

### Step 3: Add Environment Variables

Click **"Environment Variables"** section and add the following:

#### Required Variables

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_API_BASE_PATH` | `https://api.creao.com/v1` | Production, Preview, Development |
| `VITE_MCP_API_BASE_PATH` | `https://mcp.creao.com/v1` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID | Production, Preview, Development |
| `VITE_APPLE_CLIENT_ID` | Your Apple Service ID | Production, Preview, Development |
| `VITE_APPLE_TEAM_ID` | Your Apple Team ID | Production |
| `VITE_APPLE_KEY_ID` | Your Apple Key ID | Production |
| `VITE_APPLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----...` | Production |
| `VITE_FILE_UPLOAD_ENDPOINT` | `https://files.creao.com/upload` | Production, Preview, Development |
| `VITE_PRODUCTION_DOMAIN` | `https://your-app.vercel.app` | Production |
| `VITE_OAUTH_REDIRECT_URI` | `https://your-app.vercel.app/auth/callback` | Production |
| `NODE_ENV` | `production` | Production |

**Important:**
- For `VITE_PRODUCTION_DOMAIN` and `VITE_OAUTH_REDIRECT_URI`, use your actual Vercel domain
- You'll get this domain after first deployment
- You can update these variables later

#### Optional Variables

| Name | Value | Description |
|------|-------|-------------|
| `VITE_APP_TIMEZONE` | `America/New_York` | Timezone for prompt rollover |
| `VITE_SESSION_EXPIRY_HOURS` | `24` | Session expiry time |
| `VITE_ENABLE_PREMIUM_FEATURES` | `true` | Enable premium features |
| `VITE_ENABLE_SOCIAL_FEATURES` | `true` | Enable likes/follows/shares |
| `VITE_ENABLE_BADGES` | `true` | Enable badge system |
| `VITE_ENABLE_STREAKS` | `true` | Enable streak tracking |
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics ID |
| `VITE_SENTRY_DSN` | `https://...@sentry.io/...` | Sentry error tracking |

---

### Step 4: Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. 🎉 Your app is live!

**Deployment URL:**
```
https://your-app.vercel.app
```

---

### Step 5: Update OAuth Redirect URIs

Now that you have your Vercel domain, update OAuth providers:

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs:**
   ```
   https://your-app.vercel.app/auth/callback
   ```
4. Click **Save**

#### Apple Sign In

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/serviceId)
2. Select your Services ID
3. Edit **Sign in with Apple** configuration
4. Add to **Redirect URIs:**
   ```
   https://your-app.vercel.app/auth/callback
   ```
5. Click **Save**

---

### Step 6: Update Environment Variables (Round 2)

Return to Vercel Dashboard:

1. Go to **Settings** → **Environment Variables**
2. Update these variables with your actual domain:
   - `VITE_PRODUCTION_DOMAIN` → `https://your-app.vercel.app`
   - `VITE_OAUTH_REDIRECT_URI` → `https://your-app.vercel.app/auth/callback`
3. Click **Save**
4. Go to **Deployments** tab
5. Click **"Redeploy"** on the latest deployment
6. Check **"Use existing Build Cache"**
7. Click **"Redeploy"**

---

### Step 7: Verify Deployment

Visit your production URL and test:

**Authentication:**
- [ ] Click "Sign in with Google" → Should redirect to Google
- [ ] Complete Google login → Should redirect back to your app
- [ ] Click "Sign in with Apple" → Should work similarly
- [ ] Try email/password signup and login

**Core Features:**
- [ ] Today's prompt displays correctly
- [ ] Date shows correct EST time
- [ ] Upload doodle works
- [ ] Uploaded image displays
- [ ] Like/favorite buttons work
- [ ] Profile displays user info

**If any issues:**
- Check browser console for errors
- Check Vercel deployment logs
- Verify environment variables are set correctly
- Ensure OAuth redirect URIs match exactly

---

## 🔄 Continuous Deployment

### Automatic Deployments

Every push to `main` branch triggers a new deployment:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will:
1. Detect the push
2. Run `npm install`
3. Run `npm run build`
4. Deploy to production
5. Send you a notification

---

### Preview Deployments

Every pull request gets a preview URL:

```bash
git checkout -b feature/new-feature
# Make changes
git push origin feature/new-feature
```

Create a pull request on GitHub, and Vercel will:
- Create a unique preview URL
- Comment on the PR with the URL
- Update the preview on every push

**Preview URL format:**
```
https://daily-doodle-prompt-abc123.vercel.app
```

---

### Deploy from CLI

Install Vercel CLI:

```bash
npm install -g vercel
```

Deploy:

```bash
vercel
```

Deploy to production:

```bash
vercel --prod
```

---

## 🎛️ Advanced Configuration

### Custom Domain

1. Go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain: `dailydoodle.com`
4. Follow DNS configuration instructions
5. Update OAuth redirect URIs with new domain
6. Update environment variables:
   - `VITE_PRODUCTION_DOMAIN` → `https://dailydoodle.com`
   - `VITE_OAUTH_REDIRECT_URI` → `https://dailydoodle.com/auth/callback`

---

### Performance Optimization

**Enable Speed Insights:**
1. Go to **Analytics** → **Speed Insights**
2. Click **"Enable"**
3. Monitor Core Web Vitals

**Enable Web Analytics:**
1. Go to **Analytics** → **Web Analytics**
2. Click **"Enable"**
3. View visitor analytics

---

### Environment-Specific Variables

**Production only:**
```
VITE_SENTRY_DSN (error tracking)
VITE_GA_MEASUREMENT_ID (analytics)
```

**Preview only:**
```
VITE_DEBUG=true (verbose logging)
```

**Development only:**
```
VITE_MOCK_API=true (mock responses)
```

To set environment-specific variables:
1. Click **"Add New"** variable
2. Enter name and value
3. Select environments: Production / Preview / Development
4. Click **"Save"**

---

### Build & Deployment Settings

**Build Command Override:**

If you want to skip type checking for faster builds:

```bash
npm run build:nocheck
```

**Install Command Override:**

For faster installs with pnpm:

```bash
pnpm install
```

**Root Directory:**

If your app is in a subdirectory:

```
packages/frontend
```

---

## 🐛 Troubleshooting

### Build Fails

**Check Logs:**
1. Go to **Deployments** tab
2. Click on failed deployment
3. Click **"View Build Logs"**

**Common Issues:**

**TypeScript errors:**
```bash
npm run type-check
```

Fix locally and push again.

**Missing dependencies:**
```bash
npm install
```

Ensure `package.json` includes all dependencies.

**Build timeout:**
- Increase timeout in **Settings** → **General** → **Build & Development Settings**
- Or use `npm run build:nocheck` for faster builds

---

### OAuth Login Fails

**Check:**
1. Environment variables are set correctly
2. Redirect URIs match exactly (no trailing slashes)
3. OAuth credentials are valid
4. Browser console for error messages

**Test OAuth Flow:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Click "Sign in with Google"
4. Check redirect URLs
5. Ensure callback URL matches `VITE_OAUTH_REDIRECT_URI`

---

### Environment Variables Not Working

**Common mistakes:**
- Variable name typo
- Value has extra spaces
- Not saved properly
- Need to redeploy after changes

**Solution:**
1. Go to **Settings** → **Environment Variables**
2. Click **"Edit"** on the variable
3. Verify name and value
4. Click **"Save"**
5. Go to **Deployments** → **Redeploy**

---

### Images Not Loading

**Check:**
1. `VITE_FILE_UPLOAD_ENDPOINT` is set
2. File upload service allows CORS from your domain
3. Images are being uploaded successfully
4. Browser console for errors

**Test Upload:**
```javascript
fetch(import.meta.env.VITE_FILE_UPLOAD_ENDPOINT, {
  method: 'POST',
  body: formData,
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

---

### Prompt Not Updating at Midnight

**Check:**
1. `VITE_APP_TIMEZONE=America/New_York`
2. Google Sheets CSV is accessible
3. Browser cache (try hard reload: Ctrl+Shift+R)
4. Query is refetching at midnight (check Network tab)

---

## 📊 Monitoring & Analytics

### Vercel Analytics

**Real User Monitoring:**
- Page views
- Unique visitors
- Top pages
- Referrers

**Speed Insights:**
- Core Web Vitals
- Lighthouse scores
- Performance over time

**Access:**
1. Go to **Analytics** tab
2. View metrics and charts

---

### Deployment Notifications

**Configure alerts:**
1. Go to **Settings** → **Notifications**
2. Enable:
   - Deployment success
   - Deployment failure
   - Build errors
3. Choose notification method:
   - Email
   - Slack
   - Discord
   - Webhook

---

## 🔐 Security Best Practices

### Environment Variables

- ✅ Use Vercel environment variables for secrets
- ✅ Never commit `.env.local` to Git
- ✅ Rotate OAuth secrets regularly
- ✅ Use different credentials for production vs. preview

---

### HTTPS & Security Headers

Vercel automatically:
- ✅ Serves over HTTPS
- ✅ Renews SSL certificates
- ✅ Adds security headers (configured in `vercel.json`)

**Custom headers:**
Edit `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

### Access Control

**Protect deployments:**
1. Go to **Settings** → **Deployment Protection**
2. Enable **"Vercel Authentication"**
3. Require login to access preview deployments

---

## 📚 Additional Resources

### Vercel Documentation
- [Getting Started](https://vercel.com/docs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)
- [Build Configuration](https://vercel.com/docs/build-step)

### Daily Doodle Prompt Docs
- `DEPLOYMENT.md` - Complete deployment guide
- `ENV_VARS.md` - Environment variables reference
- `README.md` - Project overview

---

## ✅ Post-Deployment Checklist

- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] Google login works
- [ ] Apple login works
- [ ] Email/password login works
- [ ] File uploads work
- [ ] Today's prompt displays correctly
- [ ] Badges persist after logout/login
- [ ] OAuth redirect URIs updated
- [ ] Environment variables verified
- [ ] Custom domain configured (optional)
- [ ] Analytics enabled (optional)
- [ ] Error tracking enabled (optional)

---

## 🎉 You're Live!

Your Daily Doodle Prompt app is now deployed to Vercel!

**Next Steps:**
1. Share the URL with users
2. Monitor analytics and errors
3. Collect feedback
4. Iterate and improve

**Support:**
- [Vercel Support](https://vercel.com/support)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

Happy deploying! 🚀
