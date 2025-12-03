# Stripe Payment Integration Setup Guide

This guide covers the complete setup process for integrating Stripe one-time payments ($4.99 Lifetime Premium Access) into the Daily Doodle Prompt application.

---

## Table of Contents

1. [Overview](#overview)
2. [Stripe Dashboard Setup](#stripe-dashboard-setup)
3. [Environment Variables](#environment-variables)
4. [Vercel Deployment Setup](#vercel-deployment-setup)
5. [Testing in Development](#testing-in-development)
6. [Testing in Production](#testing-in-production)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### Architecture

- **Frontend**: React + TypeScript (Vite)
- **Payment Backend**: Vercel Serverless Functions
- **Payment Provider**: Stripe Checkout (one-time payment)
- **User Data**: localStorage with Stripe metadata sync

### Payment Flow

1. User clicks "Unlock Premium – $4.99" on pricing page
2. Frontend calls `/api/checkout/create-session` serverless function
3. User redirected to Stripe Checkout
4. After payment:
   - Stripe sends webhook to `/api/stripe/webhook`
   - Webhook verifies signature and processes payment
   - User redirected to success page with `session_id`
5. Success page calls `/api/stripe/verify-session` to confirm payment
6. User premium status updated in localStorage with Stripe metadata

---

## Stripe Dashboard Setup

### Step 1: Create Stripe Account

1. Go to https://stripe.com/
2. Sign up for a new account (or log in)
3. Verify your email address

### Step 2: Create Product & Price

1. Navigate to **Products** in the Stripe Dashboard
2. Click **Add Product**
3. Fill in product details:
   - **Name**: Daily Doodle Prompt - Lifetime Premium
   - **Description**: One-time payment for lifetime access to all premium features
   - **Image**: Upload app logo (optional)
4. Under **Pricing**, create a price:
   - **Pricing model**: Standard pricing
   - **Price**: $4.99 USD
   - **Billing period**: One time
5. Click **Save product**
6. **Copy the Price ID** (starts with `price_`) - you'll need this!

### Step 3: Get API Keys

1. Navigate to **Developers > API Keys**
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_` in test mode)
   - **Secret key** (starts with `sk_test_` in test mode)
3. **Copy both keys** - you'll need them for environment variables

### Step 4: Set Up Webhook Endpoint

#### For Development (Testing Locally)

1. Install Stripe CLI:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Windows
   scoop install stripe

   # Linux
   # Download from: https://github.com/stripe/stripe-cli/releases
   ```

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Forward webhooks to local development:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. The CLI will output a webhook signing secret (starts with `whsec_`) - copy this!

#### For Production (Vercel Deployment)

1. Navigate to **Developers > Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your endpoint URL:
   ```
   https://your-domain.vercel.app/api/stripe/webhook
   ```
4. Select events to listen for:
   - `checkout.session.completed` ✅ (Required)
   - `payment_intent.succeeded` (Optional - for logging)
   - `payment_intent.payment_failed` (Optional - for logging)
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_`) from the endpoint details page

---

## Environment Variables

### Local Development (`.env.local`)

Create `.env.local` file in project root:

```bash
# Stripe Publishable Key (client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY

# Stripe Secret Key (server-side - for local API routes only)
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Stripe Webhook Secret (from Stripe CLI)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# Stripe Price ID
STRIPE_PRICE_ID=price_YOUR_PRICE_ID

# Success/Cancel URLs (local)
STRIPE_SUCCESS_URL=http://localhost:3000?session_id={CHECKOUT_SESSION_ID}
STRIPE_CANCEL_URL=http://localhost:3000?canceled=true
```

### Vercel Production Environment Variables

Add these to your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_YOUR_LIVE_KEY` | Production, Preview, Development |
| `STRIPE_SECRET_KEY` | `sk_live_YOUR_LIVE_SECRET` | Production |
| `STRIPE_SECRET_KEY` | `sk_test_YOUR_TEST_SECRET` | Preview, Development |
| `STRIPE_WEBHOOK_SECRET` | `whsec_YOUR_PRODUCTION_SECRET` | Production |
| `STRIPE_WEBHOOK_SECRET` | `whsec_YOUR_TEST_SECRET` | Preview, Development |
| `STRIPE_PRICE_ID` | `price_YOUR_LIVE_PRICE_ID` | Production |
| `STRIPE_PRICE_ID` | `price_YOUR_TEST_PRICE_ID` | Preview, Development |
| `STRIPE_SUCCESS_URL` | `https://your-domain.vercel.app` | Production |
| `STRIPE_CANCEL_URL` | `https://your-domain.vercel.app?canceled=true` | Production |

**Important Notes:**
- Use **test keys** (`pk_test_`, `sk_test_`) for development/preview
- Use **live keys** (`pk_live_`, `sk_live_`) for production only
- Never commit API keys to version control
- Stripe webhooks require HTTPS (Vercel provides this automatically)

---

## Vercel Deployment Setup

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repository in Vercel Dashboard for automatic deployments.

### Step 2: Configure Vercel Environment Variables

1. In Vercel Dashboard, go to your project
2. **Settings > Environment Variables**
3. Add all variables from the table above
4. **Redeploy** to apply environment variables

### Step 3: Update Stripe Webhook URL

1. Go to Stripe Dashboard > **Developers > Webhooks**
2. Find your production webhook endpoint
3. Update URL to: `https://your-actual-domain.vercel.app/api/stripe/webhook`
4. Save changes

---

## Testing in Development

### Prerequisites

- Stripe CLI installed and logged in
- `.env.local` configured with test keys
- Development server running

### Testing Steps

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Start Stripe webhook forwarding** (in separate terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Test payment flow**:
   - Navigate to http://localhost:3000
   - Create an account (or login)
   - Go to Pricing page
   - Click "Unlock Premium – $4.99"
   - You'll be redirected to Stripe Checkout

4. **Use test card**:
   - Card number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

5. **Verify success**:
   - After payment, you should be redirected to success page
   - Check Stripe CLI terminal for webhook events
   - Verify premium features are unlocked in app
   - Check browser console for any errors

### Test Webhooks Manually

Trigger test webhook events:

```bash
# Successful checkout
stripe trigger checkout.session.completed

# Failed payment
stripe trigger payment_intent.payment_failed
```

---

## Testing in Production

### Before Going Live

**Checklist:**

- [ ] All environment variables set in Vercel (production values)
- [ ] Stripe webhook URL configured correctly
- [ ] Using live Stripe keys (`pk_live_`, `sk_live_`)
- [ ] Using live Price ID
- [ ] Success/Cancel URLs point to production domain
- [ ] SSL/HTTPS enabled (automatic with Vercel)

### Test Production Payment

1. **Create test account** in production app
2. **Use real test card** (Stripe won't charge test cards even in live mode):
   - Card: `4242 4242 4242 4242`
   - Or use a small real payment to verify everything works
3. **Monitor Stripe Dashboard**:
   - Payments > All payments
   - Developers > Webhooks (check for successful events)
4. **Verify premium unlock** in production app

---

## Troubleshooting

### Issue: Checkout session creation fails

**Symptoms**: Error when clicking "Unlock Premium" button

**Solutions**:
1. Check Vercel logs for API route errors
2. Verify `STRIPE_SECRET_KEY` is set correctly
3. Verify `STRIPE_PRICE_ID` exists and is correct
4. Check browser console for network errors

### Issue: Webhook not receiving events

**Symptoms**: Payment succeeds but premium not unlocked

**Solutions**:
1. **Development**: Ensure Stripe CLI is running (`stripe listen`)
2. **Production**: Check Stripe Dashboard > Webhooks > your endpoint
   - Verify URL is correct
   - Check "Recent events" for delivery status
3. Check Vercel function logs for webhook handler errors
4. Verify `STRIPE_WEBHOOK_SECRET` is set correctly

### Issue: Signature verification failed

**Symptoms**: Webhook returns 400 error, "Invalid signature"

**Solutions**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches your webhook endpoint secret
2. Check that you're using the correct secret (test vs. live)
3. Ensure webhook secret is copied correctly (no extra spaces)

### Issue: Premium not unlocking after payment

**Symptoms**: Payment successful, but user still appears as free tier

**Solutions**:
1. Check `/api/stripe/verify-session` endpoint is working
2. Verify user ID is passed correctly in checkout metadata
3. Check browser localStorage for updated user data
4. Try refreshing the page or logging out/in

### Issue: Payment works in dev but not production

**Symptoms**: Everything works locally but fails on Vercel

**Solutions**:
1. Verify **live mode** keys are used in production environment
2. Check Vercel environment variables are set for "Production" environment
3. Ensure webhook URL points to production domain (not localhost)
4. Check Vercel function logs for errors
5. Verify Price ID is for a live mode product (not test mode)

---

## Security Checklist

- [ ] Never commit `.env.local` to version control
- [ ] Use environment variables for all secrets
- [ ] Verify webhook signatures on all webhook endpoints
- [ ] Use HTTPS in production (automatic with Vercel)
- [ ] Stripe Secret Key is only in server-side environment variables
- [ ] Rate limit API endpoints (if needed)
- [ ] Monitor Stripe Dashboard for suspicious activity

---

## Additional Resources

- **Stripe Documentation**: https://stripe.com/docs
- **Stripe Testing Cards**: https://stripe.com/docs/testing
- **Stripe Webhooks Guide**: https://stripe.com/docs/webhooks
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Vercel Serverless Functions**: https://vercel.com/docs/functions

---

## Support

If you encounter issues:

1. Check Stripe Dashboard > Developers > Logs
2. Check Vercel function logs
3. Review browser console errors
4. Contact Stripe support (https://support.stripe.com/)

---

**Last Updated**: 2025-12-03
