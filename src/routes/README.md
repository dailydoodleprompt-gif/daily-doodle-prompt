# Routing Contract (DO NOT BREAK)

This app uses TWO routing systems intentionally:

1. TanStack file-based routes
2. Internal view-based routing via `currentView`

## Why this exists
- Stripe requires static URLs (/privacy, /terms, /support)
- The app experience is driven by `currentView`
- These systems are bridged, not unified

## Utility Pages (Legal / Support)
The following pages MUST have:
- A route file in `src/routes`
- A corresponding view in `src/views`
- An `onBack` handler passed to `UtilityHeader`

### Utility Routes
- /privacy
- /terms
- /support

### How they work
1. TanStack route ensures static URL exists
2. index.tsx checks `window.location.pathname`
3. `currentView` is set manually
4. View renders with `UtilityHeader`
5. Back button uses `window.history.back()`

⚠️ DO NOT:
- Change route paths casually
- Remove pathname checks in index.tsx
- Assume TanStack routes alone handle rendering