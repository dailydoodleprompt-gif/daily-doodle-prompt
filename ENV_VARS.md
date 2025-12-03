# Environment Variables Reference

Complete guide to all environment variables used in Daily Doodle Prompt.

---

## 📝 Quick Reference

### Critical Production Variables

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| `VITE_API_BASE_PATH` | URL | ✅ | `https://api.creao.com/v1` |
| `VITE_MCP_API_BASE_PATH` | URL | ✅ | `https://mcp.creao.com/v1` |
| `VITE_GOOGLE_CLIENT_ID` | String | ✅ | `123456789.apps.googleusercontent.com` |
| `VITE_APPLE_CLIENT_ID` | String | ✅ | `com.yourapp.signin` |
| `VITE_FILE_UPLOAD_ENDPOINT` | URL | ✅ | `https://files.creao.com/upload` |
| `VITE_PRODUCTION_DOMAIN` | URL | ✅ | `https://dailydoodle.vercel.app` |
| `VITE_OAUTH_REDIRECT_URI` | URL | ✅ | `https://dailydoodle.vercel.app/auth/callback` |

---

## 🔧 API Configuration

### VITE_API_BASE_PATH
- **Type:** URL
- **Required:** ✅ Yes
- **Environment:** Production, Development
- **Description:** Base URL for Creao Platform API
- **Used For:**
  - User authentication
  - User profile management
  - Token validation
- **Example:** `https://api.creao.com/v1`
- **Location in Code:** `src/sdk/core/auth.ts:49`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_PATH;
```

---

### VITE_MCP_API_BASE_PATH
- **Type:** URL
- **Required:** ✅ Yes
- **Environment:** Production, Development
- **Description:** Base URL for Model Context Protocol API
- **Used For:**
  - AI/ML integrations
  - Advanced features
  - MCP client connections
- **Example:** `https://mcp.creao.com/v1`
- **Location in Code:**
  - `src/sdk/core/request.ts:4`
  - `src/sdk/core/mcp-client.ts:16`

```typescript
const API_BASE_PATH = import.meta.env.VITE_MCP_API_BASE_PATH;
```

---

### TENANT_ID
- **Type:** String
- **Required:** ⚠️ Optional (multi-tenant only)
- **Environment:** Production, Development
- **Description:** Unique identifier for multi-tenant deployments
- **Used For:**
  - URL path prefixing
  - Tenant isolation
- **Example:** `tenant123`
- **Location in Code:** `src/main.tsx:36`, `vite.config.js:12`
- **Default:** Empty string (single-tenant)

```typescript
basepath: import.meta.env.TENANT_ID ? `/${import.meta.env.TENANT_ID}` : "/",
```

---

## 🔐 Authentication & OAuth

### VITE_GOOGLE_CLIENT_ID
- **Type:** String
- **Required:** ✅ Yes (for Google login)
- **Environment:** Production, Development
- **Description:** Google OAuth 2.0 Client ID
- **Used For:** Google Sign-In authentication
- **How to Get:**
  1. Go to [Google Cloud Console](https://console.cloud.google.com/)
  2. Create OAuth 2.0 Client ID
  3. Copy Client ID
- **Example:** `123456789-abc123def456.apps.googleusercontent.com`
- **Location in Code:** `src/store/app-store.ts` (OAuth login flow)

---

### VITE_GOOGLE_CLIENT_SECRET
- **Type:** String
- **Required:** ⚠️ Backend Only
- **Environment:** Production
- **Description:** Google OAuth 2.0 Client Secret
- **Security:** ⚠️ Never expose in frontend code
- **Used For:** Server-side OAuth token exchange
- **How to Get:** Google Cloud Console → Credentials

---

### VITE_APPLE_CLIENT_ID
- **Type:** String
- **Required:** ✅ Yes (for Apple login)
- **Environment:** Production, Development
- **Description:** Apple Sign In Service ID
- **Used For:** Apple Sign-In authentication
- **How to Get:**
  1. Go to [Apple Developer Portal](https://developer.apple.com/)
  2. Create Services ID
  3. Enable Sign in with Apple
- **Example:** `com.yourapp.signin`
- **Location in Code:** `src/store/app-store.ts` (OAuth login flow)

---

### VITE_APPLE_TEAM_ID
- **Type:** String
- **Required:** ✅ Yes (for Apple login)
- **Environment:** Production
- **Description:** Apple Developer Team ID
- **How to Get:** Apple Developer Account → Membership

---

### VITE_APPLE_KEY_ID
- **Type:** String
- **Required:** ✅ Yes (for Apple login)
- **Environment:** Production
- **Description:** Apple Sign In Key ID
- **How to Get:** Apple Developer Portal → Keys

---

### VITE_APPLE_PRIVATE_KEY
- **Type:** String (PEM format)
- **Required:** ✅ Yes (for Apple login)
- **Environment:** Production
- **Description:** Apple Sign In Private Key (.p8 file)
- **Security:** ⚠️ Store securely in Vercel environment variables
- **Format:**
```
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----
```

---

### VITE_OAUTH_REDIRECT_URI
- **Type:** URL
- **Required:** ✅ Yes
- **Environment:** Production, Development
- **Description:** OAuth callback URL after authentication
- **Production:** `https://your-domain.vercel.app/auth/callback`
- **Development:** `http://localhost:3000/auth/callback`
- **Important:** Must match exactly in OAuth provider dashboards

---

## 📁 File Upload & Storage

### VITE_FILE_UPLOAD_ENDPOINT
- **Type:** URL
- **Required:** ✅ Yes
- **Environment:** Production, Development
- **Description:** Endpoint for uploading user doodle images
- **Used For:**
  - Doodle image uploads
  - Avatar image uploads
- **Example:** `https://files.creao.com/upload`
- **Expected Response:** JSON with `url` field

---

### VITE_MAX_FILE_SIZE
- **Type:** Number (bytes)
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Maximum file size for uploads
- **Default:** `5242880` (5MB)
- **Example:** `10485760` (10MB)

---

### VITE_ALLOWED_FILE_TYPES
- **Type:** String (comma-separated)
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Allowed MIME types for file uploads
- **Default:** `image/jpeg,image/png,image/gif,image/webp`
- **Example:** `image/jpeg,image/png,image/heic`

---

## 🎛️ Feature Flags

### VITE_ENABLE_PREMIUM_FEATURES
- **Type:** Boolean
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Enable/disable premium features
- **Default:** `true`
- **Values:** `true`, `false`
- **Affects:**
  - Premium badge
  - Premium-only content
  - Paywall UI

---

### VITE_ENABLE_SOCIAL_FEATURES
- **Type:** Boolean
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Enable/disable social features
- **Default:** `true`
- **Affects:**
  - Likes
  - Follows
  - Shares
  - Public profiles

---

### VITE_ENABLE_ADMIN_PANEL
- **Type:** Boolean
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Enable/disable admin panel
- **Default:** `false`
- **Production:** Set to `true` only for admin deployments

---

### VITE_ENABLE_BADGES
- **Type:** Boolean
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Enable/disable badge system
- **Default:** `true`
- **Affects:**
  - Badge awards
  - Badge display
  - Achievement tracking

---

### VITE_ENABLE_STREAKS
- **Type:** Boolean
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Enable/disable streak tracking
- **Default:** `true`
- **Affects:**
  - Upload streaks
  - Streak counter
  - Streak badges

---

## 🌍 Timezone & Localization

### VITE_APP_TIMEZONE
- **Type:** String (IANA timezone)
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Application timezone for daily prompt rollovers
- **Default:** `America/New_York` (EST/EDT)
- **Examples:**
  - `America/New_York` (EST)
  - `America/Los_Angeles` (PST)
  - `Europe/London` (GMT)
  - `Asia/Tokyo` (JST)
- **Used For:**
  - Daily prompt rollover at midnight
  - Streak reset logic
  - Date display

---

## 🔒 Security & Session

### VITE_JWT_SECRET
- **Type:** String
- **Required:** ⚠️ Backend Only
- **Environment:** Production
- **Description:** Secret key for JWT signing
- **Security:** ⚠️ Never expose in frontend
- **Generate:**
```bash
openssl rand -base64 32
```

---

### VITE_SESSION_EXPIRY_HOURS
- **Type:** Number
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Session expiry time in hours
- **Default:** `24`
- **Example:** `168` (1 week)
- **Location in Code:** `src/store/app-store.ts` (session persistence)

---

### VITE_CORS_ORIGINS
- **Type:** String (comma-separated URLs)
- **Required:** ❌ Optional
- **Environment:** Production
- **Description:** Allowed CORS origins
- **Example:** `https://dailydoodle.com,https://www.dailydoodle.com`
- **Used For:** API CORS configuration

---

## 📊 Analytics & Monitoring

### VITE_GA_MEASUREMENT_ID
- **Type:** String
- **Required:** ❌ Optional
- **Environment:** Production
- **Description:** Google Analytics 4 Measurement ID
- **Example:** `G-XXXXXXXXXX`
- **How to Get:**
  1. Go to [Google Analytics](https://analytics.google.com/)
  2. Create GA4 property
  3. Copy Measurement ID

---

### VITE_SENTRY_DSN
- **Type:** URL
- **Required:** ❌ Optional
- **Environment:** Production
- **Description:** Sentry Data Source Name for error tracking
- **Example:** `https://abc123@o123456.ingest.sentry.io/7890123`
- **How to Get:**
  1. Go to [Sentry](https://sentry.io/)
  2. Create project
  3. Copy DSN

---

### VITE_ENV
- **Type:** String
- **Required:** ❌ Optional
- **Environment:** All
- **Description:** Environment name for monitoring
- **Values:** `development`, `staging`, `production`
- **Default:** `production`

---

## 🚀 Production Deployment

### VITE_PRODUCTION_DOMAIN
- **Type:** URL
- **Required:** ✅ Yes (production)
- **Environment:** Production
- **Description:** Your production domain
- **Example:** `https://dailydoodle.vercel.app`
- **Used For:**
  - Canonical URLs
  - OAuth callbacks
  - Social sharing

---

### VITE_CDN_URL
- **Type:** URL
- **Required:** ❌ Optional
- **Environment:** Production
- **Description:** CDN URL for static assets
- **Example:** `https://cdn.dailydoodle.com`
- **Used For:** Asset optimization

---

## 🛠️ Development Only

### VITE_DEBUG
- **Type:** Boolean
- **Required:** ❌ Optional
- **Environment:** Development
- **Description:** Enable verbose logging
- **Default:** `false`
- **Values:** `true`, `false`

---

### VITE_MOCK_API
- **Type:** Boolean
- **Required:** ❌ Optional
- **Environment:** Development
- **Description:** Use mock API responses
- **Default:** `false`
- **Used For:** Development without backend

---

### VITE_DISABLE_AUTH
- **Type:** Boolean
- **Required:** ❌ Optional
- **Environment:** Development
- **Description:** Bypass authentication
- **Default:** `false`
- **Used For:** UI development

---

## 🗂️ Google Sheets Integration

### Hardcoded in Code

The following values are **hardcoded** in `src/hooks/use-opensheet-prompts.ts`:

```typescript
const SPREADSHEET_ID = '1tWJQOUhUfENl-xBd-TOQEv0BmaRb5USG';
const SHEET_GID = '1177623891';
```

To change:
1. Edit `src/hooks/use-opensheet-prompts.ts:105-106`
2. Update `SPREADSHEET_ID` and `SHEET_GID`
3. Ensure Google Sheet is publicly accessible

**CSV Export URL:**
```
https://docs.google.com/spreadsheets/d/1tWJQOUhUfENl-xBd-TOQEv0BmaRb5USG/export?format=csv&gid=1177623891
```

---

## 📋 Environment Variable Checklist

### Before Deploying to Vercel

- [ ] Copy `.env.example` to `.env.local`
- [ ] Set all required variables
- [ ] Verify OAuth credentials
- [ ] Test locally with production-like config
- [ ] Add variables to Vercel dashboard
- [ ] Never commit `.env.local`

### Vercel Environment Variables

Add these in **Vercel Dashboard → Settings → Environment Variables**:

**Production Environment:**
```
VITE_API_BASE_PATH
VITE_MCP_API_BASE_PATH
VITE_GOOGLE_CLIENT_ID
VITE_APPLE_CLIENT_ID
VITE_APPLE_TEAM_ID
VITE_APPLE_KEY_ID
VITE_APPLE_PRIVATE_KEY
VITE_FILE_UPLOAD_ENDPOINT
VITE_PRODUCTION_DOMAIN
VITE_OAUTH_REDIRECT_URI
VITE_APP_TIMEZONE
VITE_SESSION_EXPIRY_HOURS
NODE_ENV=production
```

**Optional:**
```
VITE_GA_MEASUREMENT_ID
VITE_SENTRY_DSN
VITE_ENABLE_PREMIUM_FEATURES
VITE_ENABLE_SOCIAL_FEATURES
VITE_ENABLE_ADMIN_PANEL
```

---

## 🔍 Debugging

### Check Environment Variables

**In Browser Console:**
```javascript
console.log(import.meta.env);
```

**In Build Logs:**
```bash
npm run build
# Check for warnings about missing variables
```

### Common Issues

**❌ "VITE_API_BASE_PATH is not defined"**
- Ensure variable is set in Vercel
- Restart Vercel deployment

**❌ OAuth redirect URI mismatch**
- Verify `VITE_OAUTH_REDIRECT_URI` matches provider config
- Check for trailing slashes

**❌ File upload fails**
- Verify `VITE_FILE_UPLOAD_ENDPOINT` is accessible
- Check CORS settings

---

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Setup](https://developer.apple.com/documentation/sign_in_with_apple)

---

## ✅ Final Checklist

Before going live:

- [ ] All required variables set in Vercel
- [ ] OAuth providers configured correctly
- [ ] Redirect URIs match production domain
- [ ] Test authentication in production
- [ ] Verify file uploads work
- [ ] Check daily prompt loads correctly
- [ ] Monitor error tracking (Sentry)
- [ ] Review analytics (Google Analytics)

---

**Last Updated:** December 2025
**Version:** 1.0.0
