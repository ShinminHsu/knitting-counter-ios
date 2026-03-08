# Design: Analytics (Firebase GA)

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   app/_layout.tsx                    │
│  on mount:                                           │
│  1. increment APP_LAUNCH_COUNT in MMKV               │
│  2. initializeAdMob()   ← immediate, no ATT          │
│  3. loadInterstitialAd()                             │
│  4. if launchCount >= 2 → requestATTIfNeeded()       │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│                  app/settings.tsx                    │
│  on mount:                                           │
│  → requestATTIfNeeded()  ← also triggers here        │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│              src/services/adsService.ts              │
│  initializeAdMob()    ← MobileAds().initialize()     │
│  requestATTIfNeeded() ← checks MMKV flags, runs ATT  │
└─────────────────────────────────────────────────────┘
                          │
┌─────────────────────────────────────────────────────┐
│           src/services/analyticsService.ts           │
│  Calls @react-native-firebase/analytics methods      │
│  All functions: async, fail silently (try/catch)     │
└─────────────────────────────────────────────────────┘
```

## Package Setup

### New Dependencies
```
@react-native-firebase/app
@react-native-firebase/analytics
```

### app.json plugins
```json
{
  "plugins": [
    "@react-native-firebase/app",
    "@react-native-firebase/analytics"
  ]
}
```

**Note**: `GoogleService-Info.plist` must be added to `/ios/` after prebuild.
After adding packages: `npx expo prebuild --platform ios --clean`

## Component / Module Design

### 1. `src/stores/mmkvStorage.ts` — New STORAGE_KEYS

```typescript
export const STORAGE_KEYS = {
  // ... existing keys ...
  APP_LAUNCH_COUNT: 'appLaunchCount',
  ATT_REQUESTED:    'attRequested',
} as const
```

### 2. `src/services/adsService.ts` — Refactored

Split the existing `initializeAds()` into two separate functions:

```typescript
/** Initializes AdMob immediately on app start (no ATT dependency) */
export async function initializeAdMob(): Promise<void>

/**
 * Requests ATT permission if not already requested.
 * Safe to call multiple times — checks MMKV flag first.
 */
export async function requestATTIfNeeded(): Promise<void>
```

- `initializeAds()` (old export) is removed — call sites updated to `initializeAdMob()`
- `requestATTIfNeeded()` reads `ATT_REQUESTED` from MMKV; if already true, returns immediately
- After requesting, sets `ATT_REQUESTED = true` in MMKV

### 3. `src/constants/analytics.ts` — New REWARD_TYPES

```typescript
export const REWARD_TYPES = {
  PROJECT_SLOT:           'project_slot',
  PHOTO_SLOT:             'photo_slot',
  STITCH_CATEGORY_INC:    'stitch_category_inc',
  STITCH_CATEGORY_DEC:    'stitch_category_dec',
  STITCH_CATEGORY_SPECIAL:'stitch_category_special',
} as const

export type RewardType = typeof REWARD_TYPES[keyof typeof REWARD_TYPES]
```

### 4. `src/services/analyticsService.ts` — Implementation

All functions call `@react-native-firebase/analytics` and fail silently:

```typescript
import analytics from '@react-native-firebase/analytics'
import { ANALYTICS_EVENTS, RewardType } from '../constants/analytics'
import { CraftType } from '../types'

export async function logScreenView(screenName: string): Promise<void> {
  try {
    await analytics().logScreenView({
      screen_name: screenName,
      screen_class: screenName,
    })
  } catch {}
}

export async function logProjectCreated(craftType: CraftType): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.PROJECT_CREATED, { craft_type: craftType })
  } catch {}
}

export async function logTrackingStarted(): Promise<void> {
  try { await analytics().logEvent(ANALYTICS_EVENTS.TRACKING_STARTED) } catch {}
}

export async function logChartCompleted(): Promise<void> {
  try { await analytics().logEvent(ANALYTICS_EVENTS.CHART_COMPLETED) } catch {}
}

export async function logRoundAdded(): Promise<void> {
  try { await analytics().logEvent(ANALYTICS_EVENTS.ADD_ROUND) } catch {}
}

export async function logStitchAdded(): Promise<void> {} // intentionally not implemented

export async function logTemplateUsed(): Promise<void> {
  try { await analytics().logEvent(ANALYTICS_EVENTS.USE_TEMPLATE) } catch {}
}

export async function logImport(): Promise<void> {
  try { await analytics().logEvent(ANALYTICS_EVENTS.IMPORT_PROJECT) } catch {}
}

export async function logExport(): Promise<void> {
  try { await analytics().logEvent(ANALYTICS_EVENTS.EXPORT_PROJECT) } catch {}
}

// ── Ad behavior (new) ──────────────────────────────────────────────────────

export async function logRewardedAdWatched(rewardType: RewardType): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.REWARDED_AD_WATCHED, { reward_type: rewardType })
  } catch {}
}

export async function logRewardedAdDeclined(rewardType: RewardType): Promise<void> {
  try {
    await analytics().logEvent(ANALYTICS_EVENTS.REWARDED_AD_DECLINED, { reward_type: rewardType })
  } catch {}
}

export async function logInterstitialShown(): Promise<void> {
  try { await analytics().logEvent(ANALYTICS_EVENTS.INTERSTITIAL_SHOWN) } catch {}
}

export async function logIAPPurchaseCompleted(): Promise<void> {
  try { await analytics().logEvent(ANALYTICS_EVENTS.IAP_PURCHASE_COMPLETED) } catch {}
}
```

Also add to `ANALYTICS_EVENTS` in `analytics.ts`:
```typescript
REWARDED_AD_WATCHED:    'rewarded_ad_watched',
REWARDED_AD_DECLINED:   'rewarded_ad_declined',
INTERSTITIAL_SHOWN:     'interstitial_shown',
IAP_PURCHASE_COMPLETED: 'iap_purchase_completed',
```

### 5. `app/_layout.tsx` — Launch Count + ATT Timing

```typescript
useEffect(() => {
  SplashScreen.hideAsync()

  // Increment launch count
  const count = (mmkv.getNumber(STORAGE_KEYS.APP_LAUNCH_COUNT) ?? 0) + 1
  mmkv.set(STORAGE_KEYS.APP_LAUNCH_COUNT, count)

  const setupAds = async () => {
    await initializeAdMob()          // immediate, no ATT wait
    loadInterstitialAd()             // non-blocking preload
    if (count >= 2) {
      requestATTIfNeeded()           // fire-and-forget
    }
  }

  setupAds()
}, [])
```

### 6. `app/settings.tsx` — ATT Trigger on Settings Visit

```typescript
useEffect(() => {
  requestATTIfNeeded()  // fire-and-forget; no-op if already requested
}, [])
```

### 7. Screen View Calls Audit

Screens already calling `logScreenView`:
- `app/index.tsx` ✓
- `app/project/[id]/index.tsx` ✓
- `app/pattern-elements.tsx` ✓

Screens needing `logScreenView` added:
- `app/project/[id]/editor.tsx`
- `app/project/[id]/round.tsx`
- `app/project/[id]/tracking.tsx`
- `app/project/[id]/import-export.tsx`
- `app/guide.tsx`
- `app/settings.tsx`

Pattern (copy from existing screens):
```typescript
useEffect(() => {
  logScreenView(SCREEN_NAMES.XXX)
}, [])
```

## Data Flow Diagram

```
Cold Start (1st launch)
  └─ increment count = 1
  └─ initializeAdMob()
  └─ count < 2 → skip ATT

Cold Start (2nd+ launch)
  └─ increment count = 2
  └─ initializeAdMob()
  └─ count >= 2 → requestATTIfNeeded()
       └─ ATT_REQUESTED? no → show dialog → set ATT_REQUESTED=true
       └─ ATT_REQUESTED? yes → skip

Visit Settings (any launch)
  └─ requestATTIfNeeded()
       └─ ATT_REQUESTED? no → show dialog → set ATT_REQUESTED=true
       └─ ATT_REQUESTED? yes → skip
```

## Files Modified

| File | Change |
|------|--------|
| `package.json` | add `@react-native-firebase/app`, `@react-native-firebase/analytics` |
| `app.json` | add firebase plugins |
| `src/stores/mmkvStorage.ts` | add `APP_LAUNCH_COUNT`, `ATT_REQUESTED` keys |
| `src/constants/analytics.ts` | add new event names, add `REWARD_TYPES` |
| `src/services/analyticsService.ts` | implement all stubs + 4 new ad functions |
| `src/services/adsService.ts` | split into `initializeAdMob` + `requestATTIfNeeded` |
| `src/services/index.ts` | export new functions |
| `app/_layout.tsx` | launch count logic + ATT on 2nd launch |
| `app/settings.tsx` | ATT trigger on mount |
| `app/project/[id]/editor.tsx` | add `logScreenView` |
| `app/project/[id]/round.tsx` | add `logScreenView` |
| `app/project/[id]/tracking.tsx` | add `logScreenView` |
| `app/project/[id]/import-export.tsx` | add `logScreenView` |
| `app/guide.tsx` | add `logScreenView` |
