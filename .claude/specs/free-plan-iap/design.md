# Design: Free Plan + Rewarded Ads + One-Time IAP

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  useEntitlementStore (Zustand+MMKV)         │
│  isPremium | adUnlockedProjectCount | adUnlockedPhotoCount  │
│  adUnlockedStitchCategories | voucherCode                   │
│  ─────────────────────────────────────────────────────────  │
│  computed: maxProjects() maxPhotosPerProject()               │
│  computed: canUseCustomStitches() canExport()                │
│  computed: isStitchCategoryUnlocked(key)                    │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
    ┌───────────▼──────────┐   ┌──────────▼──────────────┐
    │  UpgradePromptModal  │   │   Gating call sites:    │
    │  - Watch Ad button   │   │   app/index.tsx          │
    │  - Buy $4.99 button  │   │   project/[id]/index.tsx │
    │  - Maybe Later       │   │   import-export.tsx      │
    │                      │   │   StitchPicker.tsx       │
    │  internally handles: │   │   pattern-elements.tsx   │
    │  loadRewardedAd()    │   └─────────────────────────┘
    │  purchasePremium()   │
    └──────────────────────┘
```

## New Dependencies

```
react-native-iap     ← one-time IAP (Non-Consumable StoreKit)
expo-crypto          ← SHA-256 for voucher validation (already in Expo SDK)
```

`react-native-google-mobile-ads` (already installed) already supports `RewardedAd` — no new ad package needed.

**Requires**: `npx expo prebuild --platform ios --clean` after adding `react-native-iap`.

## Data Model

### `useEntitlementStore` — `src/stores/useEntitlementStore.ts`

```typescript
export type StitchCategoryLockKey = 'basic' | 'inc' | 'dec' | 'special'

interface EntitlementState {
  // ── Persisted ─────────────────────────────────────────────
  isPremium: boolean
  voucherCode: string | null
  adUnlockedProjectCount: number   // 0–2
  adUnlockedPhotoCount: number     // 0–2
  adUnlockedStitchCategories: StitchCategoryLockKey[]

  // ── Actions ───────────────────────────────────────────────
  setPremium: (source: 'iap' | 'voucher', voucherCode?: string) => void
  incrementAdUnlockedProjects: () => void  // capped at 2
  incrementAdUnlockedPhotos: () => void    // capped at 2
  unlockStitchCategory: (key: StitchCategoryLockKey) => void

  // ── Computed getters ──────────────────────────────────────
  maxProjects: () => number                              // isPremium ? Infinity : 3 + count
  maxPhotosPerProject: () => number                      // isPremium ? Infinity : 1 + count
  canUseCustomStitches: () => boolean                    // isPremium
  canExport: () => boolean                               // isPremium
  isStitchCategoryUnlocked: (key: StitchCategoryLockKey) => boolean
}
```

MMKV key: `STORAGE_KEYS.ENTITLEMENTS = 'entitlements'`

---

## Module Design

### 1. `src/constants/stitches.ts` — Stitch Category Lock Keys

Add a mapping from category label → lock key (no interface change needed):

```typescript
export type StitchCategoryLockKey = 'basic' | 'inc' | 'dec' | 'special'

export const STITCH_CATEGORY_LOCK_KEY: Record<string, StitchCategoryLockKey> = {
  'stitch.category.crochetBasic':    'basic',
  'stitch.category.crochetIncrease': 'inc',
  'stitch.category.crochetDecrease': 'dec',
  'stitch.category.crochetSpecial':  'special',
  'stitch.category.knitBasic':       'basic',
  'stitch.category.knitDecrease2':   'dec',
  'stitch.category.knitDecrease3':   'dec',
  'stitch.category.knitIncrease':    'inc',
  'stitch.category.knitCable':       'special',
}
```

### 2. `src/constants/voucherHashes.ts` — Promo Code Hashes (New)

```typescript
/**
 * SHA-256 hashes of valid voucher codes.
 * Developer adds/removes entries here to manage promo codes.
 * Hash format: SHA-256 of UPPERCASE code, hex string.
 */
export const VALID_VOUCHER_HASHES: Set<string> = new Set([
  // Example: SHA-256('STITCHIE2024') = '...'
  // Add real hashes here before shipping
])
```

### 3. `src/constants/adUnits.ts` — Add Rewarded Test ID

```typescript
export const AD_UNIT_IDS = {
  BANNER:      'ca-app-pub-3940256099942544/2934735716',
  INTERSTITIAL:'ca-app-pub-3940256099942544/4411468910',
  REWARDED:    'ca-app-pub-3940256099942544/1712485313',  // iOS test rewarded ID
} as const
```

### 4. `src/services/adsService.ts` — Add Rewarded Ad Functions

```typescript
export async function loadRewardedAd(): Promise<RewardedAd | null>

export function showRewardedAd(
  ad: RewardedAd | null,
  onRewarded: () => void,
  onClose: () => void
): void
```

Pattern mirrors existing `loadInterstitialAd` / `showInterstitialAd`.

### 5. `src/services/iapService.ts` — New File

```typescript
const PREMIUM_PRODUCT_ID = 'com.stitchie.premium'

export async function initializeIAP(): Promise<void>
// Calls react-native-iap initConnection(), sets up purchaseUpdatedListener

export async function purchasePremium(): Promise<'purchased' | 'cancelled' | 'error'>
// Calls requestPurchase({ sku: PREMIUM_PRODUCT_ID })
// On success: calls useEntitlementStore.getState().setPremium('iap')
//             and logIAPPurchaseCompleted()
// Returns result status

export async function restorePurchases(): Promise<boolean>
// Calls getAvailablePurchases(), checks for PREMIUM_PRODUCT_ID
// On found: calls setPremium('iap'), returns true
// Returns false if not found

export async function cleanupIAP(): Promise<void>
// Calls endConnection()
```

### 6. `src/services/voucherService.ts` — New File

```typescript
import * as Crypto from 'expo-crypto'
import { VALID_VOUCHER_HASHES } from '../constants/voucherHashes'

export async function redeemVoucher(code: string): Promise<boolean>
// Hash = SHA-256(code.trim().toUpperCase())
// If hash in VALID_VOUCHER_HASHES:
//   useEntitlementStore.getState().setPremium('voucher', code.trim().toUpperCase())
//   return true
// else return false
```

### 7. `src/components/UpgradePromptModal.tsx` — New Component

```typescript
interface UpgradePromptModalProps {
  visible: boolean
  onClose: () => void
  title: string
  description: string
  hasAdOption: boolean         // show "Watch Ad" button
  rewardType?: RewardType      // for analytics
  onAdRewarded: () => void     // parent handles post-reward action
}
```

**Internal flow:**
```
visible=true + hasAdOption
  → loadRewardedAd() in background
  → show loading indicator on "Watch Ad" button

[Watch Ad] tapped
  → showRewardedAd(ad, onRewarded, onClose)
  → onRewarded: logRewardedAdWatched(rewardType) + onAdRewarded() + close modal

[Buy $4.99] tapped
  → purchasePremium()
  → on 'purchased': close modal (isPremium now true via store)

[Maybe Later] tapped
  → if hasAdOption: logRewardedAdDeclined(rewardType)
  → onClose()
```

Layout (StyleSheet):
```
┌─────────────────────────────┐
│  [title]                    │
│  [description]              │
│                             │
│  [🎬 Watch Ad to Unlock]    │  ← only if hasAdOption
│  [⭐ Remove All Ads · $4.99]│
│  [Maybe Later]              │
└─────────────────────────────┘
```

---

## Gating Integration Points

### Project Limit (`app/index.tsx`)

```typescript
const { maxProjects, adUnlockedProjectCount, incrementAdUnlockedProjects } = useEntitlementStore()
const projects = useProjectStore(s => s.projects)

const handleCreateProject = () => {
  if (projects.length >= maxProjects()) {
    setUpgradeModalConfig({
      title: t('upgrade.projectLimit.title'),
      description: t('upgrade.projectLimit.desc'),
      hasAdOption: adUnlockedProjectCount < 2,
      rewardType: REWARD_TYPES.PROJECT_SLOT,
      onAdRewarded: () => {
        incrementAdUnlockedProjects()
        setShowUpgradeModal(false)
        setShowCreateModal(true)  // auto-proceed
      },
    })
    setShowUpgradeModal(true)
    return
  }
  setShowCreateModal(true)
}
```

### Photo Limit (`app/project/[id]/index.tsx`)

```typescript
const { maxPhotosPerProject, adUnlockedPhotoCount, incrementAdUnlockedPhotos } = useEntitlementStore()
const photos = project.photos

const handleAddPhoto = () => {
  if (photos.length >= maxPhotosPerProject()) {
    setUpgradeModalConfig({
      hasAdOption: adUnlockedPhotoCount < 2,
      rewardType: REWARD_TYPES.PHOTO_SLOT,
      onAdRewarded: () => {
        incrementAdUnlockedPhotos()
        setShowUpgradeModal(false)
        triggerPhotoPicker()  // auto-proceed
      },
    })
    setShowUpgradeModal(true)
    return
  }
  triggerPhotoPicker()
}
```

### Export Gate (`app/project/[id]/import-export.tsx`)

```typescript
const { canExport } = useEntitlementStore()

const handleExport = () => {
  if (!canExport()) {
    setUpgradeModalConfig({
      title: t('upgrade.export.title'),
      hasAdOption: false,  // hard paywall
      onAdRewarded: () => {},
    })
    setShowUpgradeModal(true)
    return
  }
  // existing export logic
}
```

### Stitch Category Lock (`src/components/StitchPicker.tsx`)

In `sections` memo, each section gets a `isLocked` flag:

```typescript
const sections = useMemo<SectionData[]>(() => {
  const categories = STITCH_CATEGORIES_BY_CRAFT[craftType]
  return categories.map((cat) => {
    const lockKey = STITCH_CATEGORY_LOCK_KEY[cat.label] ?? 'basic'
    const isLocked = lockKey !== 'basic' && !isStitchCategoryUnlocked(lockKey)
    return { title: t(cat.label), lockKey, isLocked, data: [...] }
  })
})
```

Section header renders a lock icon (`🔒`) if `isLocked`. Tapping the header (or any stitch in locked section) shows `UpgradePromptModal` with `rewardType = REWARD_TYPES['STITCH_CATEGORY_' + lockKey.toUpperCase()]`.

### Custom Stitch Gate (`app/pattern-elements.tsx`)

```typescript
const { canUseCustomStitches } = useEntitlementStore()

const handleAddCustomStitch = () => {
  if (!canUseCustomStitches()) {
    // show UpgradePromptModal, hasAdOption = false
    return
  }
  setModalVisible(true)
}
```

---

## Ad Suppression for Premium

### `src/components/AdBanner.tsx`

```typescript
const isPremium = useEntitlementStore(s => s.isPremium)
if (isPremium) return null
// existing code below
```

### `src/components/CompletionModal.tsx`

```typescript
const isPremium = useEntitlementStore(s => s.isPremium)

// In useEffect (existing ad logic):
if (!interstitialShown && !isPremium) {
  const ad = await loadInterstitialAd()
  showInterstitialAd(ad, onClose)
  logInterstitialShown()
} else {
  onClose()
}
```

---

## Settings Screen — Premium Section

New section at top of Settings:

```
IF not premium:
┌────────────────────────────────┐
│ PREMIUM                        │
│ [Remove All Ads · $4.99  →]    │
│ ─────────────────────────────  │
│ [Enter promo code...] [Redeem] │
└────────────────────────────────┘

IF premium (IAP):
┌────────────────────────────────┐
│ PREMIUM                        │
│ ✓ Premium Active               │
│ [Restore Purchase]             │
└────────────────────────────────┘

IF premium (voucher):
┌────────────────────────────────┐
│ PREMIUM                        │
│ ✓ Premium Active (Promo Code)  │
└────────────────────────────────┘
```

---

## App Initialization (`app/_layout.tsx`)

```typescript
useEffect(() => {
  // existing: SplashScreen, AdMob, ATT
  initializeIAP()  // new: setup IAP connection

  return () => { cleanupIAP() }  // cleanup on unmount
}, [])
```

---

## Files Summary

| File | Action |
|------|--------|
| `package.json` | add `react-native-iap` |
| `app.json` | add `react-native-iap` plugin if needed |
| `src/stores/mmkvStorage.ts` | add `ENTITLEMENTS` key |
| `src/stores/useEntitlementStore.ts` | **new** — central entitlement state |
| `src/stores/index.ts` | export new store |
| `src/constants/adUnits.ts` | add `REWARDED` test ID |
| `src/constants/stitches.ts` | add `STITCH_CATEGORY_LOCK_KEY` + `StitchCategoryLockKey` |
| `src/constants/voucherHashes.ts` | **new** — promo code hashes |
| `src/services/adsService.ts` | add `loadRewardedAd`, `showRewardedAd` |
| `src/services/iapService.ts` | **new** — IAP purchase/restore |
| `src/services/voucherService.ts` | **new** — voucher hash validation |
| `src/services/index.ts` | export new service functions |
| `src/components/UpgradePromptModal.tsx` | **new** — reusable upgrade modal |
| `src/components/AdBanner.tsx` | add premium suppression |
| `src/components/CompletionModal.tsx` | add premium suppression + logInterstitialShown |
| `src/components/StitchPicker.tsx` | add lock key check + lock UI + upgrade modal |
| `app/_layout.tsx` | add `initializeIAP` / `cleanupIAP` |
| `app/index.tsx` | project limit check |
| `app/project/[id]/index.tsx` | photo limit check |
| `app/project/[id]/import-export.tsx` | export gate |
| `app/pattern-elements.tsx` | custom stitch gate |
| `app/settings.tsx` | premium section + voucher input + restore button |
| `src/i18n/locales/zh-TW.ts` | upgrade prompt translations |
| `src/i18n/locales/en.ts` | upgrade prompt translations |
| `src/i18n/locales/ja.ts` | upgrade prompt translations |
