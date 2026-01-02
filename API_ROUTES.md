# API Routes Documentation

All API routes for Daily Doodle Prompt.

---

## Authentication

All authentication is handled by Supabase Auth. No custom auth endpoints.

**Authentication Methods:**
- Email/Password
- Magic Link (email)
- OAuth providers (Google, GitHub - optional)

**Auth Headers:**
```
Authorization: Bearer {jwt_token}
```

---

## Custom API Endpoints

### Stripe Integration

#### POST /api/checkout/create-session

Create a Stripe checkout session for premium purchase.

**Authentication:** Required

**Request Body:**
```json
{
  "userId": "uuid-string",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Errors:**
- `400` - Missing userId or userEmail
- `500` - Stripe API error

**Example:**
```javascript
const response = await fetch('/api/checkout/create-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: user.id,
    userEmail: user.email
  })
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe
```

---

#### POST /api/stripe/webhook

Handle Stripe webhook events (internal use only).

**Authentication:** Stripe signature verification

**Events Handled:**
- `checkout.session.completed` - Premium purchase successful

**Webhook Actions:**
1. Verify Stripe signature
2. Extract user ID from session metadata
3. Update profiles.is_premium = true in Supabase
4. Award premium_patron badge
5. Return 200 OK to Stripe (or 500 if DB update fails)

**Configuration:**
- Endpoint URL: `https://dailydoodleprompt.com/api/stripe/webhook`
- Signing Secret: Set in `STRIPE_WEBHOOK_SECRET` env var

---

#### GET /api/stripe/verify-session

Verify a completed Stripe session (for payment success page).

**Authentication:** Required

**Query Parameters:**
- `session_id` - Stripe checkout session ID

**Response:**
```json
{
  "success": true,
  "isPremium": true,
  "customerId": "cus_..."
}
```

---

### User Profile

#### GET /api/me

Get current user's profile data.

**Authentication:** Required

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "artist_name",
  "avatar_type": "icon",
  "avatar_icon": "smile",
  "current_title": "doodle_doer",
  "is_premium": false,
  "is_admin": false,
  "viewed_badges": ["creative_spark", "early_bird"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Errors:**
- `401` - Not authenticated / Invalid token
- `500` - Database error

---

#### PATCH /api/me

Update current user's profile.

**Authentication:** Required

**Request Body (partial update):**
```json
{
  "username": "new_username",
  "avatar_type": "icon",
  "avatar_icon": "star",
  "current_title": "streak_master",
  "viewed_badges": ["creative_spark", "early_bird", "night_owl"]
}
```

**Allowed Fields:**
- `username` - Display name (3-20 chars, alphanumeric + underscore)
- `avatar_type` - Must be "initial", "icon", or "upload"
- `avatar_icon` - Icon name if avatar_type is "icon"
- `current_title` - Badge ID from user's earned badges
- `viewed_badges` - Array of viewed badge IDs

**Protected Fields (CANNOT be set by users):**
- `is_premium` - Set by Stripe webhook only
- `is_admin` - Set by database admin only
- `stripe_customer_id` - Set by Stripe webhook only
- `stripe_session_id` - Set by Stripe webhook only

**Response:**
```json
{
  "success": true,
  "updated": { /* updated profile */ }
}
```

**Errors:**
- `400` - Invalid data (profanity in username, no fields to update)
- `401` - Not authenticated
- `500` - Database error

**Validation:**
- Username: 3-20 characters, alphanumeric + underscore only, no profanity
- Avatar type: Must be "initial", "icon", or "upload"
- Current title: Must be a valid badge_id from user's earned badges

---

### Email

#### POST /api/send-email

Send email notification (internal use, for support tickets).

**Authentication:** Required (Bearer token)

**Security Restrictions:**
- User must be authenticated
- Recipient must match `SUPPORT_INBOX_EMAIL` environment variable
- Cannot send to arbitrary email addresses

**Request Body:**
```json
{
  "to": "admin@example.com",
  "subject": "Support Ticket",
  "text": "Plain text content",
  "html": "<p>HTML content</p>"
}
```

**Response:**
```json
{
  "ok": true
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Recipient not allowed
- `400` - Missing required fields
- `500` - Email service error

---

## Supabase Direct Queries

Most data access happens directly from the frontend to Supabase using the Supabase client.

**Tables accessed directly:**
- `doodles` - Read public doodles, create/update/delete own doodles
- `user_badges` - Read own badges
- `streaks` - Read/update own streak
- `bookmarks` - CRUD own bookmarks
- `follows` - CRUD own follows
- `likes` - CRUD own likes

**Security:** All tables protected by Row Level Security (RLS) policies.

---

## Rate Limiting

**Current Status:** No explicit rate limiting implemented on custom endpoints.

**Supabase Rate Limiting:**
- Built-in rate limiting on Supabase endpoints
- Configurable in Supabase dashboard

**Recommendations for Future:**
- Add rate limiting to custom API routes
- Especially for: uploads, social actions (like/follow)

---

## Error Responses

All API routes return consistent error format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not allowed)
- `404` - Not Found
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## CORS Configuration

**Allowed Origins:**
- `https://dailydoodleprompt.com`
- `https://www.dailydoodleprompt.com`
- `http://localhost:5173` (development only)

**Allowed Methods:**
- `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`

**Allowed Headers:**
- `Content-Type`, `Authorization`

---

## Webhook Configuration

### Stripe Webhooks

**Production Endpoint:**
```
https://dailydoodleprompt.com/api/stripe/webhook
```

**Events to Subscribe:**
- `checkout.session.completed`

**Testing Webhooks Locally:**
```bash
stripe listen --forward-to localhost:5173/api/stripe/webhook
```

---

## Environment Variables

**Required for API Routes:**

| Variable | Description | Used In |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | All authenticated routes |
| `SUPABASE_ANON_KEY` | Supabase anon key | All authenticated routes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Checkout, webhook |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Webhook |
| `STRIPE_PRICE_ID` | Stripe price ID for premium | Checkout |
| `RESEND_API_KEY` | Resend email API key | Send email |
| `SUPPORT_INBOX_EMAIL` | Admin email for notifications | Send email |

---

## Future API Endpoints (Planned)

These may be added in future versions:

- `POST /api/doodles/{id}/report` - Report inappropriate content
- `GET /api/stats/global` - Global app statistics
- `POST /api/feedback` - Submit user feedback
- `GET /api/leaderboard` - Top artists by likes/badges

---

Last Updated: January 2026
