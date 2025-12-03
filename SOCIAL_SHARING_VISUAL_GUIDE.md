# 🎨 Social Sharing - Visual Component Guide

## Component Locations & Layouts

---

## 📍 1. Today's Prompt Page - Inline Layout

**Location**: `src/views/PromptView.tsx` (line 154-161)

```
┌─────────────────────────────────────────────────────┐
│  TODAY'S PROMPT                                      │
│  Monday, December 3, 2024                    [Upload]│
├─────────────────────────────────────────────────────┤
│                                                      │
│  🎨 A gentle robot tending a moonlit garden         │
│                                                      │
│  Imagine a world where AI and nature coexist...     │
│                                                      │
│  #Robot #Nature #SciFi                              │
│                                                      │
│  Published: December 3, 2024                        │
├─────────────────────────────────────────────────────┤
│  Share:  [📱] [f] [𝕏] [🔴] [📌] [📷] [📋]            │
│          Native FB  X  Reddit Pin Insta Copy        │
└─────────────────────────────────────────────────────┘
         ↑
    INLINE LAYOUT - All buttons visible horizontally
```

**Component Usage**:
```tsx
<SocialShareButtons
  prompt={todayPrompt}
  layout="inline"
  variant="outline"
  size="default"
/>
```

---

## 📍 2. Prompt Detail Dialog - Dropdown Layout

**Location**: `src/components/PromptDetailDialog.tsx` (line 164-168)

```
┌─────────────────────────────────────────────────────┐
│  🎨 A gentle robot tending a moonlit garden     [X] │
│  🎨 Nature                                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Imagine a world where AI and nature coexist in     │
│  perfect harmony. Your task is to draw a gentle     │
│  robot carefully watering glowing flowers under     │
│  the light of a full moon...                        │
│                                                      │
│  #Robot #Nature #SciFi #Fantasy #Peaceful           │
│                                                      │
│  📅 Published: December 3, 2024                     │
├─────────────────────────────────────────────────────┤
│  [⭐ Save] [Share ▼] [Upload Doodle]                │
│             │                                        │
│             └─────────────────────┐                 │
│                                   │                 │
│          ┌────────────────────────┘                 │
│          │                                          │
│          │ 📱 Share via device                      │
│          │ ──────────────────                       │
│          │ f  Share on Facebook                     │
│          │ 𝕏  Share on X (Twitter)                  │
│          │ 🔴 Share on Reddit                       │
│          │ 📌 Share on Pinterest                    │
│          │ 📷 Share on Instagram                    │
│          │ ──────────────────                       │
│          │ 📋 Copy link                             │
│          └──────────────────────                    │
│                                                      │
│  💫 Community Doodles (12)                          │
│  [gallery of user uploads]                          │
└─────────────────────────────────────────────────────┘
           ↑
      DROPDOWN LAYOUT - Compact menu
```

**Component Usage**:
```tsx
<SocialShareButtons
  prompt={prompt}
  variant="outline"
  size="sm"
/>
```

---

## 📍 3. Archive View - Compact Cards

**Location**: `src/views/ArchiveView.tsx` (line 296-305)

```
PROMPT ARCHIVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ 🎨 Prompt 1   │ │ 🎨 Prompt 2   │ │ 🎨 Prompt 3   │
│ Nature        │ │ Abstract      │ │ Portrait      │
│               │ │               │ │               │
│ A peaceful... │ │ Geometric...  │ │ Character...  │
│               │ │               │ │               │
│ #Tag1 #Tag2   │ │ #Tag3 +2      │ │ #Tag4 #Tag5   │
│ ────────────  │ │ ────────────  │ │ ────────────  │
│        [🔗][↗]│ │        [🔗][↗]│ │        [🔗][↗]│
└───────────────┘ └───────────────┘ └───────────────┘
         ↑                                    ↑
    Share icon                          View full icon
    (dropdown)                          (maximizes)
```

**Component Usage**:
```tsx
<PromptCard
  prompt={prompt}
  variant="compact"
  showShare={true}
  onClick={handlePromptClick}
/>
```

---

## 🎨 Color Palette - Platform Icons

### Light Mode
```
Facebook:    #2563eb (blue-600)     ███
Twitter/X:   #0ea5e9 (sky-500)      ███
Reddit:      #ea580c (orange-600)   ███
Pinterest:   #dc2626 (red-600)      ███
Instagram:   #db2777 (pink-600)     ███
Copy:        #64748b (slate-500)    ███
```

### Dark Mode
```
Facebook:    #60a5fa (blue-400)     ███
Twitter/X:   #38bdf8 (sky-400)      ███
Reddit:      #fb923c (orange-400)   ███
Pinterest:   #f87171 (red-400)      ███
Instagram:   #f472b6 (pink-400)     ███
Copy:        #94a3b8 (slate-400)    ███
```

### Hover Backgrounds
```
Light:  bg-[color]-50   (very subtle)
Dark:   bg-[color]-950  (very subtle)
```

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
```
┌─────────────────┐
│ TODAY'S PROMPT  │
│ ─────────────── │
│                 │
│ Prompt content  │
│                 │
│ Share:          │
│ [📱] [f] [𝕏]    │
│ [🔴] [📌] [📷]  │
│ [📋]            │
└─────────────────┘
    ↑
  Wraps to
  multiple rows
```

### Tablet (640px - 1024px)
```
┌──────────────────────────────┐
│ TODAY'S PROMPT               │
│ ──────────────────────────── │
│                              │
│ Prompt content               │
│                              │
│ Share: [📱][f][𝕏][🔴][📌][📷][📋]│
└──────────────────────────────┘
    ↑
  Single row
  (may scroll)
```

### Desktop (> 1024px)
```
┌────────────────────────────────────────┐
│ TODAY'S PROMPT                         │
│ ────────────────────────────────────── │
│                                        │
│ Prompt content                         │
│                                        │
│ Share: [📱][f][𝕏][🔴][📌][📷][📋]      │
└────────────────────────────────────────┘
    ↑
  Single row
  Plenty of space
```

---

## 🎭 State Variations

### Default State
```
[Share ▼]  ← Dropdown trigger
```

### Opened Dropdown
```
[Share ▲]
  ┌──────────────────────┐
  │ 📱 Share via device   │
  │ f  Share on Facebook  │
  │ 𝕏  Share on X         │
  │ ... etc               │
  └──────────────────────┘
```

### Copy Link - Before Click
```
[📋 Copy link]
```

### Copy Link - After Click (2 seconds)
```
[✓ Copied!]  ← Green checkmark
```

### Hover State (Desktop)
```
[Share ▼]  →  [Share ▼]
              ──────────
              (subtle highlight)
```

---

## 🏆 Badge Progress Flow

### Visual Feedback Timeline

```
User clicks share button
         ↓
Platform window opens / Copy happens
         ↓
Toast appears:
┌────────────────────────────────┐
│ ✓ Shared to Facebook!          │
└────────────────────────────────┘
         ↓
Badge check happens (background)
         ↓
If threshold reached:
┌────────────────────────────────┐
│ 🏆 Badge Unlocked!             │
│ Planter of Seeds               │
│ Share 1 prompt                 │
└────────────────────────────────┘
         ↓
Badge appears in profile
         ↓
Progress persists to localStorage
```

---

## 📊 Component Hierarchy

```
App Root
  └── PromptView (Today's Prompt)
      ├── PromptCard
      │   └── SocialShareButtons (inline)
      │
      └── PromptDetailDialog
          └── SocialShareButtons (dropdown)

App Root
  └── ArchiveView (Vault)
      ├── PromptCard (compact) × N
      │   └── SocialShareButtons (dropdown)
      │
      └── PromptDetailDialog
          └── SocialShareButtons (dropdown)
```

---

## 🔄 User Journey Map

### Share from Today's Prompt
```
User lands on home
       ↓
Sees today's prompt
       ↓
Scrolls to share section
       ↓
Clicks Facebook icon
       ↓
Facebook dialog opens
       ↓
User shares on Facebook
       ↓
Returns to app
       ↓
Sees "Shared to Facebook!" toast
       ↓
(Background) Share count +1
       ↓
(Background) Badge check
       ↓
Badge popup if threshold met
```

### Share from Archive
```
User goes to Archive
       ↓
Browses prompt cards
       ↓
Clicks share icon on card
       ↓
Dropdown menu appears
       ↓
User selects "Copy link"
       ↓
Text copied to clipboard
       ↓
Sees "Link copied!" toast
       ↓
Pastes in message app
       ↓
(Background) Share tracked
```

---

## 🎨 Design Tokens

### Spacing
```
Inline layout:
- Gap between buttons: 0.5rem (2)
- Padding around section: 1rem (4)
- Bottom border: 1px

Dropdown:
- Menu padding: 0.5rem
- Item padding: 0.5rem 1rem
- Icon margin-right: 0.5rem
```

### Typography
```
Inline label "Share:":
- Font size: 0.875rem (text-sm)
- Color: text-muted-foreground
- Margin right: 0.25rem

Dropdown items:
- Font size: 0.875rem (text-sm)
- Font weight: 400 (normal)
```

### Icons
```
Size: 1rem (w-4 h-4)
Colors: Platform-specific (see palette above)
```

---

## ✨ Animation & Transitions

### Button Hover
```css
transition: background-color 150ms ease
```

### Copy Success Feedback
```typescript
// Icon swaps after click
Copy icon → Check icon (green)
// Auto-reverts after 2000ms
```

### Dropdown Open/Close
```css
/* Built into shadcn/ui DropdownMenu */
animation: slideDownAndFade 150ms ease-out
```

---

## 🎯 Accessibility Features

### Keyboard Navigation
- Tab through all share buttons
- Enter/Space to activate
- Escape to close dropdown
- Arrow keys in dropdown menu

### Screen Readers
```html
<!-- Icon buttons have titles -->
<Button title="Share on Facebook">
  <Facebook />
</Button>

<!-- Dropdowns have ARIA labels -->
<DropdownMenu>
  <DropdownMenuTrigger aria-label="Share prompt">
```

### Touch Targets
- Minimum 44px × 44px on mobile
- Adequate spacing between buttons
- No overlapping hit areas

---

**Complete Visual Reference for Social Sharing Feature** 🎨
