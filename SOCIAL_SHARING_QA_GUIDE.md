# 🧪 Social Sharing - QA Testing Guide

## Quick Test Scenarios

### 1️⃣ Today's Prompt Page Share Test
**Location**: Main prompt view (Today's Prompt)

**Test Steps**:
1. Navigate to the home page
2. Scroll to the social share section (below the main prompt card)
3. Verify you see a horizontal row of social buttons:
   - Native Share (if on mobile)
   - Facebook (blue icon)
   - Twitter/X (sky blue icon)
   - Reddit (orange icon)
   - Pinterest (red icon)
   - Instagram (pink icon)
   - Copy Link (copy icon)

**Expected Results**:
- All buttons visible inline
- Icons properly colored
- Hover states work (subtle background color change)
- Label says "Share:"

**Test Each Button**:
- Click Facebook → Opens Facebook share dialog
- Click Twitter → Opens Twitter intent with hashtags
- Click Reddit → Opens Reddit submit page
- Click Pinterest → Opens Pinterest share
- Click Instagram → Copies text + shows toast
- Click Copy → Copies link + shows "Copied!" toast
- Click Native Share (mobile) → Opens device share sheet

---

### 2️⃣ Prompt Dialog Share Test
**Location**: Prompt detail popup

**Test Steps**:
1. Go to Archive or Today's Prompt
2. Click "View full" on any prompt card
3. Look for share button in the actions section (below bookmark button)
4. Click the "Share" button

**Expected Results**:
- Dropdown menu opens
- All platforms listed vertically
- Each has appropriate icon and color
- Native share option appears if available

**Test Dropdown**:
- Click any platform → Executes share action
- Click Copy Link → Shows "Copied!" feedback
- Instagram → Shows instruction toast

---

### 3️⃣ Archive Cards Share Test
**Location**: Prompt Archive view

**Test Steps**:
1. Navigate to Prompt Archive (Doodle Vault)
2. Find any unlocked prompt card (not grayed out)
3. Look in the card footer for share icon button
4. Click the share button

**Expected Results**:
- Share dropdown appears
- All platforms accessible
- Works on all unlocked cards
- Locked cards do NOT show share button

---

### 4️⃣ Badge Progression Test
**Location**: Any prompt with share buttons

**Test Steps**:
1. **Sign in** (required for badge tracking)
2. Share a prompt for the first time (any platform)
3. Check notifications/badges
4. Share 9 more prompts (total 10)
5. Check badges again
6. Continue to 25 and 50 shares

**Expected Results**:
- **Share #1**: "Planter of Seeds" badge awarded
- **Share #10**: "Gardener of Growth" badge awarded
- **Share #25**: "Cultivator of Influence" badge awarded
- **Share #50**: "Harvester of Inspiration" badge awarded

**Verify**:
- Toast notification on each share: "Shared to [platform]!"
- Badge popup animation on unlock
- Badge appears in profile/badges section
- Progress persists after page refresh

---

### 5️⃣ Guest User Test
**Location**: Any share button

**Test Steps**:
1. Log out (or use incognito mode)
2. Click any share button
3. Choose a platform

**Expected Results**:
- Share action works (window opens or copy happens)
- Toast shows: "Sign in to track your shares and earn badges!"
- No badge progress recorded
- Share still functional for viral spread

---

### 6️⃣ Dark Mode Test
**Location**: All share button locations

**Test Steps**:
1. Enable dark mode (toggle in settings)
2. Visit Today's Prompt page
3. Check share button colors
4. Hover over buttons
5. Open dialog and check dropdown

**Expected Results**:
- Icons use dark-mode-friendly colors:
  - Facebook: `text-blue-400`
  - Twitter: `text-sky-400`
  - Reddit: `text-orange-400`
  - Pinterest: `text-red-400`
  - Instagram: `text-pink-400`
- Hover backgrounds: `dark:bg-[color]-950`
- High contrast maintained
- No harsh white or black colors

---

### 7️⃣ Mobile Responsive Test
**Location**: All views on mobile device

**Test Steps**:
1. Open site on mobile device (or use DevTools mobile view)
2. Check Today's Prompt inline buttons
3. Verify buttons don't overflow
4. Test touch targets (at least 44px)
5. Try native share button

**Expected Results**:
- Buttons wrap to new line if needed
- Icons remain visible and tappable
- No horizontal scroll
- Native share works on iOS/Android
- Dropdown menus remain accessible

---

### 8️⃣ Share Content Verification
**Location**: Any share action

**Test Steps**:
1. Click "Copy Link" on any prompt
2. Paste into text editor
3. Verify content includes:
   - Prompt title
   - Prompt description
   - "Try it on Daily Doodle Prompt!"
   - URL with UTM parameters

**Expected Format**:
```
Daily Doodle Prompt: [Title]

[Description]

Try it on Daily Doodle Prompt!
https://yourapp.com/prompt/123?utm_source=social&utm_medium=share&utm_campaign=prompt_share
```

---

### 9️⃣ Performance Test
**Location**: Archive with many prompts

**Test Steps**:
1. Navigate to Archive with 50+ prompts
2. Scroll through all cards
3. Click share on multiple cards rapidly
4. Check for lag or slowdown

**Expected Results**:
- No noticeable lag
- Share tracking instant
- Toast notifications don't pile up excessively
- Page remains responsive

---

### 🔟 Edge Cases Test

#### Test: Same Prompt Multiple Shares
1. Share same prompt to Facebook
2. Share same prompt to Twitter
3. Share same prompt via Copy Link

**Expected**: All 3 shares count toward badge progress

#### Test: Rapid Clicking
1. Click share button 5 times rapidly

**Expected**:
- Only 1 dropdown opens
- No duplicate shares recorded
- UI remains stable

#### Test: Browser Clipboard Permissions
1. Block clipboard permissions
2. Try "Copy Link"

**Expected**:
- Toast shows error: "Failed to copy link"
- No crash or freeze

#### Test: Popup Blocker
1. Enable strict popup blocking
2. Try Facebook/Twitter share

**Expected**:
- Browser shows "popup blocked" notification
- App doesn't crash
- User can manually allow popup

---

## ✅ Final Acceptance Checklist

### Functionality
- [ ] All 7+ platforms work correctly
- [ ] Share content includes title, description, link
- [ ] UTM parameters present in URLs
- [ ] Toast notifications appear appropriately
- [ ] Native share works on mobile
- [ ] Instagram copy-based flow works
- [ ] Copy link copies full content

### Badge Tracking
- [ ] Share #1 awards "Planter of Seeds"
- [ ] Share #10 awards "Gardener of Growth"
- [ ] Share #25 awards "Cultivator of Influence"
- [ ] Share #50 awards "Harvester of Inspiration"
- [ ] Progress persists after refresh
- [ ] No duplicate badge awards
- [ ] Guest users can share (no tracking)

### UI/UX
- [ ] Light mode looks professional
- [ ] Dark mode has proper contrast
- [ ] Icons have correct platform colors
- [ ] Hover states work smoothly
- [ ] Tooltips show on icon buttons
- [ ] Mobile responsive layout works
- [ ] No content overflow
- [ ] Touch targets adequate (mobile)

### Integration
- [ ] Today's Prompt page has inline share
- [ ] Prompt Dialog has dropdown share
- [ ] Archive cards have share buttons
- [ ] Full prompt cards have share
- [ ] Compact cards have share
- [ ] Locked prompts hide share button

### Performance
- [ ] No lag with many cards
- [ ] Share tracking is instant
- [ ] No memory leaks
- [ ] Toast notifications clean up properly

### Cross-Browser
- [ ] Chrome/Edge works
- [ ] Firefox works
- [ ] Safari works
- [ ] Mobile Safari works
- [ ] Mobile Chrome works

---

## 🐛 Troubleshooting

### Issue: Share button not appearing
**Check**:
- Is user on unlocked prompt?
- Is `showShare` prop set to true?
- Check console for component errors

### Issue: Badge not awarded
**Check**:
- Is user authenticated/logged in?
- Check localStorage for shares array
- Verify share count in user stats
- Check badge logic thresholds

### Issue: Copy doesn't work
**Check**:
- Browser clipboard permissions
- HTTPS required for clipboard API
- Check console for clipboard errors

### Issue: Platform share doesn't open
**Check**:
- Popup blocker settings
- Browser permissions
- Console for errors
- Network connectivity

---

## 📊 Success Metrics

After deploying, monitor:
- Total shares per day
- Most used platform
- Badge unlock rate
- Guest vs authenticated shares
- Mobile vs desktop share rates
- Share-to-view conversion

---

**Ready for Production! 🚀**
