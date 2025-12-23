# Auth Migration Testing Checklist

## After Deployment

### 1. Fresh User Flow (Logged Out)
- [ ] Visit homepage - should show "Log In" button
- [ ] Click "Log In" - AuthDialog should open
- [ ] Sign up with new email/password
- [ ] Verify email confirmation works
- [ ] Sign in with confirmed credentials
- [ ] Header should show your avatar/email
- [ ] Refresh page - should stay logged in
- [ ] Navigate to different pages - should stay logged in

### 2. Existing User Flow (Already Logged In)
- [ ] If you're currently logged in with test account, refresh the page
- [ ] Check browser console - should see migration logs
- [ ] Old session keys should be cleaned up
- [ ] You'll be logged out (expected - old sessions incompatible)
- [ ] Sign in again with your test credentials
- [ ] Should work normally after re-login

### 3. Google OAuth Flow
- [ ] Click "Log In" → "Continue with Google"
- [ ] Google sign-in popup should appear
- [ ] Sign in with Google account
- [ ] Should redirect back logged in
- [ ] Header should show Google email
- [ ] Refresh - should stay logged in

### 4. Feature Verification
- [ ] Badges persist across logout/login
- [ ] Bookmarks work (premium feature)
- [ ] Streak tracking works
- [ ] Profile page loads correctly
- [ ] Settings page works
- [ ] Logout works cleanly

### 5. Console Checks
Open browser console and verify:
- [ ] No errors about "useCreaoAuth"
- [ ] No "Unexpected token '<'" errors
- [ ] See "[Auth Migration] Starting cleanup..." on first load
- [ ] See "[SimpleHeader] User loaded: your@email.com" when logged in

### 6. Known Issues to Ignore
- ⚠️ Apple Sign-In won't work yet (we'll set it up next)
- ⚠️ Any existing users will need to log in again (one-time)
- ⚠️ Admin stats return 0 (expected - moved to backend)

## Troubleshooting

### If you see "Log In" but you're actually logged in:
1. Open console
2. Run: `localStorage.clear(); location.reload();`
3. Sign in again

### If Google OAuth doesn't work:
1. Check Supabase → Authentication → Providers → Google
2. Verify Client ID and Secret are saved
3. Check Google Cloud Console credentials

### If nothing works:
1. Open console and screenshot any errors
2. Send screenshot to Claude
3. We'll debug together