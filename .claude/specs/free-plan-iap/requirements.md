# Requirements: Free Plan + Rewarded Ads + One-Time IAP

## Overview

為 Stitchie App 建立 Free / Premium 雙層存取控制系統。Free 用戶有功能上限，可透過觀看獎勵廣告解鎖部分額外空間，或以 $4.99 一次性購買永久解鎖所有功能、移除全部廣告。支援 Voucher 兌換碼讓開發者可發放完整功能存取權。

## Tier Summary

| 功能 | Free | 獎勵廣告解鎖 | Premium ($4.99 買斷) |
|------|------|------------|-------------------|
| 專案數 | 3 | +1/次，上限 5 | 無限 |
| 照片/專案 | 1 | +1/次，上限 3 | 無限 |
| 自定義針法 | 鎖定 | 不可解鎖 | 解鎖 |
| 匯出 | 鎖定 | 不可解鎖 | 解鎖 |
| 基礎針法 | 開放 | — | 開放 |
| 加針類別 | 鎖定 | 看一次廣告解鎖 | 解鎖 |
| 減針類別 | 鎖定 | 看一次廣告解鎖 | 解鎖 |
| 特殊針法類別 | 鎖定 | 看一次廣告解鎖 | 解鎖 |
| 插頁廣告 | 顯示 | — | 不顯示 |
| Banner 廣告 | 顯示 | — | 不顯示 |

## User Stories

1. **As a free user**, I want to understand what I can and can't do, so I'm not surprised when hitting a limit.
2. **As a free user**, I want to watch a rewarded ad to unlock more project slots, so I can continue without paying.
3. **As a free user**, I want to unlock specific stitch categories by watching an ad, so I can use the stitches I need.
4. **As a user**, I want to make a one-time $4.99 purchase to remove all restrictions and ads permanently.
5. **As a user**, I want to restore my purchase on a new device without paying again.
6. **As a developer**, I want to issue promo/voucher codes to users who get full access.

## Functional Requirements

### FR-1: Entitlement Store

A new `useEntitlementStore` (Zustand + MMKV persist) must track:

```
isPremium: boolean              // true if IAP purchased OR valid voucher redeemed
voucherCode: string | null      // redeemed voucher code (for display)
adUnlockedProjectCount: number  // 0–2 (adds to base 3; capped at giving max 5)
adUnlockedPhotoCount: number    // 0–2 (adds to base 1; capped at giving max 3)
adUnlockedStitchCategories: ('inc' | 'dec' | 'special')[]
```

Computed getters (derived, not stored):
- `maxProjects` → `isPremium ? Infinity : 3 + adUnlockedProjectCount`
- `maxPhotosPerProject` → `isPremium ? Infinity : 1 + adUnlockedPhotoCount`
- `canUseCustomStitches` → `isPremium`
- `canExport` → `isPremium`
- `isStitchCategoryUnlocked(key: 'inc'|'dec'|'special')` → `isPremium || adUnlockedStitchCategories.includes(key)`

### FR-2: Stitch Category Keys

The existing stitch categories in `src/constants/stitches.ts` must each be assigned a lock key:

| Stitch Category Label | Lock Key |
|-----------------------|---------|
| `crochetBasic`, `knitBasic` | `basic` (always unlocked) |
| `crochetIncrease`, `knitIncrease` | `inc` |
| `crochetDecrease`, `knitDecrease2`, `knitDecrease3` | `dec` |
| `crochetSpecial`, `knitCable` | `special` |

- A mapping constant `STITCH_CATEGORY_LOCK_KEY` must be added to `src/constants/stitches.ts`
- `basic` categories are always accessible (no check needed)
- Watching one ad for `dec` unlocks both knitting decrease categories simultaneously

### FR-3: Project Limit Enforcement

- WHEN a free user tries to create a new project AND `projects.length >= maxProjects`, THEN show an `UpgradePromptModal` with rewarded ad option ("Watch ad for +1 slot") and premium buy option.
- WHEN the user watches the rewarded ad successfully, THEN `adUnlockedProjectCount` is incremented (max: 2).
- WHEN `adUnlockedProjectCount >= 2` (i.e., already at 5 projects), THEN the rewarded ad option is no longer shown — only the premium buy option.
- IF the user is premium, THEN no limit check is performed.

### FR-4: Photo Limit Enforcement

- WHEN a free user tries to add a photo AND `project.photos.length >= maxPhotosPerProject`, THEN show an `UpgradePromptModal` with rewarded ad option ("Watch ad for +1 slot") and premium buy option.
- WHEN the user watches the rewarded ad successfully, THEN `adUnlockedPhotoCount` is incremented by 1 (max: 2, giving total 3 photos).
- IF `adUnlockedPhotoCount >= 2` already (i.e., already at 3 photos), THEN rewarded ad option is not shown — only premium buy option.
- IF the user is premium, THEN no limit check is performed.

### FR-5: Stitch Category Gating (in Stitch Picker)

- WHEN a free user views the stitch picker, THEN locked categories (`inc`, `dec`, `special`) must be visually marked (e.g., lock icon).
- WHEN a free user taps a locked category, THEN show `UpgradePromptModal` with rewarded ad option ("Watch ad to unlock [category name]") and premium buy option.
- WHEN the user watches the rewarded ad successfully, THEN that category key is added to `adUnlockedStitchCategories`.
- IF the category is already unlocked, THEN it behaves as normal.

### FR-6: Custom Stitch Gate (Hard Paywall)

- WHEN a free user tries to add a custom stitch (in PatternElements screen), THEN show `UpgradePromptModal` with **only** the premium buy option (no rewarded ad option).
- WHEN a free user tries to use an existing custom stitch in the stitch picker, THEN show the same modal.

### FR-7: Export Gate (Hard Paywall)

- WHEN a free user taps the export button in `import-export.tsx`, THEN show `UpgradePromptModal` with **only** the premium buy option.
- Import functionality is **not** gated (free users can still import).

### FR-8: Rewarded Ad Integration

- A new rewarded ad unit ID must be added to `src/constants/adUnits.ts` (test ID for development).
- A `loadRewardedAd()` and `showRewardedAd(onRewarded, onClose)` function must be added to `src/services/adsService.ts`.
- WHEN a rewarded ad is shown, THEN `logRewardedAdWatched(rewardType)` must be called on completion.
- WHEN the user dismisses the ad prompt without watching, THEN `logRewardedAdDeclined(rewardType)` must be called.
- IF the rewarded ad fails to load, THEN show a brief error message and do not grant the reward.
- Rewarded ads use `react-native-google-mobile-ads` `RewardedAd` (same package already installed).

### FR-9: One-Time IAP ($4.99)

- Package: `react-native-iap` (new dependency, requires prebuild).
- Product ID: `com.stitchie.premium` (Non-Consumable).
- WHEN the user taps "Buy ($4.99)", THEN initiate the StoreKit purchase flow.
- WHEN purchase is successfully completed, THEN set `isPremium = true` in entitlement store and call `logIAPPurchaseCompleted()`.
- WHEN the purchase fails or is cancelled, THEN show no error UI (standard iOS behavior handles it).
- A "Restore Purchase" button must be available in Settings, which re-validates the non-consumable purchase and restores `isPremium` if valid.
- IF the user already owns the IAP (restore flow), THEN `isPremium` is set to true without charging again.

### FR-10: Voucher / Promo Code

- A "Enter Promo Code" field must be accessible from the Settings screen.
- Valid codes are verified by comparing SHA-256 hash of the entered code against a hardcoded list of valid hashes in `src/constants/voucherHashes.ts`.
- WHEN a valid code is entered, THEN `isPremium = true` and `voucherCode` is stored.
- WHEN an invalid code is entered, THEN show an inline error message.
- The developer manages `voucherHashes.ts` to add/remove valid codes.
- No server or network call is required for validation.

### FR-11: UpgradePromptModal

A reusable modal component `src/components/UpgradePromptModal.tsx` must be created with:
- Title and description explaining what's blocked
- **Rewarded Ad button** (conditional — only shown when `hasAdOption = true` prop): "Watch Ad to Unlock"
- **Premium button**: "Remove All Ads — $4.99"
- **Dismiss button**: "Maybe Later"
- Loading state while ad is loading
- The modal must handle the full rewarded ad flow internally (load → show → reward → callback)

### FR-12: Ad Suppression for Premium Users

- WHEN `isPremium = true`, THEN:
  - Interstitial ads must NOT be shown (on project complete)
  - Banner ads (`AdBanner` component) must NOT be rendered
  - Rewarded ad prompts must NOT be shown

### FR-13: Settings Integration

The Settings screen must include a new "Premium" section with:
- IF not premium: "Get Premium — $4.99" button + "Enter Promo Code" input
- IF premium (via IAP): "Premium Active ✓" label + "Restore Purchase" button
- IF premium (via voucher): "Premium Active (Promo Code) ✓" label
- "Restore Purchase" button always visible for IAP users

## Non-Functional Requirements

- **Offline IAP check**: `isPremium` is persisted in MMKV and does not require a network call on each launch.
- **No account required**: IAP uses Apple ID, no app-side account system needed.
- **Prebuild required**: `react-native-iap` requires native modules; `npx expo prebuild --platform ios --clean` must be run.
- **App Store Connect setup**: `com.stitchie.premium` product must be created in App Store Connect before IAP can be tested on device (can use Sandbox).

## Out of Scope

- Android IAP / rewarded ads (iOS only for now).
- Subscription tier (future work).
- Server-side receipt validation (local MMKV is sufficient for this stage).
- Analytics for voucher redemption (can be added later).

## Existing Code to Leverage

- `src/stores/mmkvStorage.ts` — `mmkv` + `STORAGE_KEYS` pattern
- `src/services/adsService.ts` — existing `InterstitialAd` pattern to follow for `RewardedAd`
- `src/constants/adUnits.ts` — add `REWARDED` test ID
- `src/constants/stitches.ts` — existing `StitchCategory` structure for lock key mapping
- `react-native-google-mobile-ads` — already installed, `RewardedAd` available in v16
- `app/project/[id]/index.tsx` — `addPhoto` call site for photo limit check
- `app/index.tsx` — project creation call site for project limit check
- `app/project/[id]/import-export.tsx` — export call site for export gate
- `app/pattern-elements.tsx` — custom stitch add button for custom stitch gate
