# Implementation Plan: Free Plan + Rewarded Ads + One-Time IAP

## Overview

依序建立：先基礎設施（store、常數、services），再 UI 元件（UpgradePromptModal），最後整合到各 gating call sites 和 Settings。

## Steering Document Compliance

- 所有樣式用 `StyleSheet.create`，不用 NativeWind className
- 主色 `#D97398`，背景 `#faf5f0`，深主色 `#C4527F`
- 沿用 Zustand + MMKV persist 模式
- 沿用 `useTranslation` 多語言
- 需要 `npx expo prebuild --platform ios --clean` 後才能測試 IAP

## Tasks

- [ ] 1. 安裝 react-native-iap 並設定 app.json
  - File: `package.json`, `app.json`
  - 執行 `npx expo install react-native-iap`
  - 確認 `app.json` 是否需要加入 plugin（react-native-iap v12+ 使用 expo config plugin）
  - **注意**：完成後需 `npx expo prebuild --platform ios --clean` 才能在裝置上測試 IAP
  - _Requirements: FR-9_

- [ ] 2. 新增 MMKV storage key（ENTITLEMENTS）
  - File: `src/stores/mmkvStorage.ts`
  - 在 `STORAGE_KEYS` 新增 `ENTITLEMENTS: 'entitlements'`
  - _Leverage: 現有 `STORAGE_KEYS` 模式_
  - _Requirements: FR-1_

- [ ] 3. 新增 stitch category lock key 常數
  - File: `src/constants/stitches.ts`
  - 新增 `export type StitchCategoryLockKey = 'basic' | 'inc' | 'dec' | 'special'`
  - 新增 `export const STITCH_CATEGORY_LOCK_KEY: Record<string, StitchCategoryLockKey>` 對照所有 9 個 category label
  - _Leverage: 現有 `CROCHET_STITCH_CATEGORIES` / `KNITTING_STITCH_CATEGORIES` 的 label 字串_
  - _Requirements: FR-2_

- [ ] 4. 新增 rewarded ad unit ID 並加入 adsService
  - Files: `src/constants/adUnits.ts`, `src/services/adsService.ts`
  - 在 `AD_UNIT_IDS` 新增 `REWARDED: 'ca-app-pub-3940256099942544/1712485313'`（iOS test ID）
  - 在 `adsService.ts` 新增 `loadRewardedAd(): Promise<RewardedAd | null>` 和 `showRewardedAd(ad, onRewarded, onClose)`
  - import `RewardedAd`, `RewardedAdEventType` from `react-native-google-mobile-ads`
  - 模式與現有 `loadInterstitialAd` / `showInterstitialAd` 相同
  - Export 新函數到 `src/services/index.ts`
  - _Leverage: 現有 `adsService.ts` 的 InterstitialAd 實作模式_
  - _Requirements: FR-8_

- [ ] 5. 建立 voucherHashes.ts 常數檔
  - File: `src/constants/voucherHashes.ts`
  - 建立 `export const VALID_VOUCHER_HASHES: Set<string> = new Set([])` （初始為空，開發者日後填入）
  - 加上說明注釋：hash 格式為 SHA-256 of `code.trim().toUpperCase()`，hex string
  - _Requirements: FR-10_

- [ ] 6. 建立 useEntitlementStore
  - File: `src/stores/useEntitlementStore.ts`
  - State: `isPremium`, `voucherCode`, `adUnlockedProjectCount`（0-2）, `adUnlockedPhotoCount`（0-2）, `adUnlockedStitchCategories`
  - Actions: `setPremium(source, voucherCode?)`, `incrementAdUnlockedProjects()`, `incrementAdUnlockedPhotos()`, `unlockStitchCategory(key)`
  - Computed getters（用 `get()` 實作）: `maxProjects()`, `maxPhotosPerProject()`, `canUseCustomStitches()`, `canExport()`, `isStitchCategoryUnlocked(key)`
  - `persist` + `createJSONStorage(() => mmkvStorage)`，name = `STORAGE_KEYS.ENTITLEMENTS`
  - Export 到 `src/stores/index.ts`
  - _Leverage: `src/stores/useOnboardingStore.ts` 的 persist 模式_
  - _Requirements: FR-1_

- [ ] 7. 建立 iapService.ts
  - File: `src/services/iapService.ts`
  - `initializeIAP()`: 呼叫 `initConnection()`，設定 `purchaseUpdatedListener` 處理購買成功回呼
  - `purchasePremium()`: 呼叫 `requestPurchase({ sku: 'com.stitchie.premium' })`，成功時呼叫 `setPremium('iap')` 和 `logIAPPurchaseCompleted()`，回傳 `'purchased' | 'cancelled' | 'error'`
  - `restorePurchases()`: 呼叫 `getAvailablePurchases()`，找到 premium product 則呼叫 `setPremium('iap')`，回傳 boolean
  - `cleanupIAP()`: 呼叫 `endConnection()`
  - Export 到 `src/services/index.ts`
  - _Requirements: FR-9_

- [ ] 8. 建立 voucherService.ts
  - File: `src/services/voucherService.ts`
  - `redeemVoucher(code: string): Promise<boolean>`
  - 計算 SHA-256：`Crypto.digestStringAsync(Crypto.CryptographicAlgorithm.SHA256, code.trim().toUpperCase())`
  - 對比 `VALID_VOUCHER_HASHES`，符合則呼叫 `setPremium('voucher', code)`，回傳 true
  - import `expo-crypto`（Expo SDK 內建，不需額外安裝）
  - Export 到 `src/services/index.ts`
  - _Requirements: FR-10_

- [ ] 9. 新增翻譯 key（zh-TW）
  - File: `src/i18n/locales/zh-TW.ts`
  - 新增 `upgrade` namespace，包含：
    - `projectLimit.title`, `projectLimit.desc`
    - `photoLimit.title`, `photoLimit.desc`
    - `stitchCategory.title`, `stitchCategory.desc`（帶 `{{category}}` 參數）
    - `customStitch.title`, `customStitch.desc`
    - `export.title`, `export.desc`
    - 通用按鈕：`watchAd`, `buyPremium`（含 `{{price}}` 參數）, `maybeLater`
    - Settings 用：`premiumSection`, `getPremium`, `premiumActive`, `premiumActiveVoucher`, `restorePurchase`, `enterPromoCode`, `redeemCode`, `invalidCode`, `codeRedeemed`
  - _Requirements: FR-11, FR-13_

- [ ] 10. 新增翻譯 key（en, ja）
  - Files: `src/i18n/locales/en.ts`, `src/i18n/locales/ja.ts`
  - 新增與 zh-TW 相同結構的 `upgrade` namespace（英文、日文翻譯）
  - _Leverage: task 9 結果_
  - _Requirements: FR-11, FR-13_

- [ ] 11. 建立 UpgradePromptModal 元件
  - File: `src/components/UpgradePromptModal.tsx`
  - Props: `visible`, `onClose`, `title`, `description`, `hasAdOption`, `rewardType?`, `onAdRewarded`
  - 內部狀態：`adLoading`, `ad`（RewardedAd | null）
  - 當 `visible && hasAdOption` 時：呼叫 `loadRewardedAd()` 放入 state
  - [Watch Ad] 按鈕（`hasAdOption` 時顯示）：disabled 直到 ad 載入完成
  - [Watch Ad] 點擊：`showRewardedAd(ad, onRewarded, onClose)`；onRewarded 呼叫 `logRewardedAdWatched(rewardType)` + `onAdRewarded()` + 關閉 modal
  - [Buy Premium] 點擊：呼叫 `purchasePremium()`；purchased 時關閉 modal
  - [Maybe Later] 點擊：如果 `hasAdOption` 則 `logRewardedAdDeclined(rewardType)`；呼叫 `onClose()`
  - 樣式：主色 `#D97398`，圓角 modal，符合現有 CompletionModal 風格
  - _Leverage: `src/components/CompletionModal.tsx` 的 Modal + StyleSheet 模式_
  - _Requirements: FR-11_

- [ ] 12. 更新 AdBanner — premium 隱藏
  - File: `src/components/AdBanner.tsx`
  - 在元件頂層讀取 `isPremium = useEntitlementStore(s => s.isPremium)`
  - `if (isPremium) return null`
  - _Requirements: FR-12_

- [ ] 13. 更新 CompletionModal — premium 略過廣告 + 記錄事件
  - File: `src/components/CompletionModal.tsx`
  - 讀取 `isPremium = useEntitlementStore(s => s.isPremium)`
  - 在計時器 callback 中：`if (!interstitialShown && !isPremium)` 才顯示廣告；否則直接 `onClose()`
  - 廣告顯示後呼叫 `logInterstitialShown()`（從 analytics spec 新增的函數）
  - _Requirements: FR-12_

- [ ] 14. 更新 app/_layout.tsx — 初始化 IAP
  - File: `app/_layout.tsx`
  - 在 `useEffect` 中呼叫 `initializeIAP()`（fire-and-forget）
  - return cleanup：`() => { cleanupIAP() }`
  - _Requirements: FR-9_

- [ ] 15. 加入 project 數量限制（app/index.tsx）
  - File: `app/index.tsx`
  - 讀取 `maxProjects`, `adUnlockedProjectCount`, `incrementAdUnlockedProjects` from entitlement store
  - 讀取 `projects` from project store
  - 在 "建立專案" 觸發點前加 limit check：`if (projects.length >= maxProjects())`
  - 顯示 `UpgradePromptModal`，`hasAdOption = adUnlockedProjectCount < 2`，`rewardType = REWARD_TYPES.PROJECT_SLOT`
  - `onAdRewarded`：`incrementAdUnlockedProjects()` + 關閉 modal + 開啟建立專案 modal
  - _Leverage: 現有 `app/index.tsx` 的 CreateProjectModal 觸發邏輯_
  - _Requirements: FR-3_

- [ ] 16. 加入照片數量限制（app/project/[id]/index.tsx）
  - File: `app/project/[id]/index.tsx`
  - 讀取 `maxPhotosPerProject`, `adUnlockedPhotoCount`, `incrementAdUnlockedPhotos` from entitlement store
  - 在 "新增照片" 觸發點前加 limit check：`if (project.photos.length >= maxPhotosPerProject())`
  - 顯示 `UpgradePromptModal`，`hasAdOption = adUnlockedPhotoCount < 2`，`rewardType = REWARD_TYPES.PHOTO_SLOT`
  - `onAdRewarded`：`incrementAdUnlockedPhotos()` + 關閉 modal + 觸發照片選取
  - _Leverage: 現有 `app/project/[id]/index.tsx` 的照片新增邏輯_
  - _Requirements: FR-4_

- [ ] 17. 加入 stitch category 鎖定（StitchPicker.tsx）
  - File: `src/components/StitchPicker.tsx`
  - import `STITCH_CATEGORY_LOCK_KEY` from constants、`useEntitlementStore`、`REWARD_TYPES` from analytics constants
  - 在 `sections` memo 中，每個 category 計算 `lockKey` 與 `isLocked`
  - Section header：`isLocked` 時顯示鎖頭圖示（`Feather "lock"` icon）
  - 點擊 locked section header 或 locked section 內的針法 → 顯示 `UpgradePromptModal`（state 管理在 StitchPicker 內部）
  - `onAdRewarded`：`unlockStitchCategory(lockKey)` + 關閉 modal
  - _Leverage: 現有 `StitchPicker.tsx` 的 `SectionList` + `useMemo` 結構_
  - _Requirements: FR-5_

- [ ] 18. 加入自訂針法鎖定（pattern-elements.tsx）
  - File: `app/pattern-elements.tsx`
  - 讀取 `canUseCustomStitches` from entitlement store
  - 在 "新增自訂針法" 按鈕 handler 前加 check：`if (!canUseCustomStitches())`
  - 顯示 `UpgradePromptModal`，`hasAdOption = false`（hard paywall），`onAdRewarded = () => {}`
  - _Leverage: 現有 add button 邏輯_
  - _Requirements: FR-6_

- [ ] 19. 加入匯出鎖定（import-export.tsx）
  - File: `app/project/[id]/import-export.tsx`
  - 讀取 `canExport` from entitlement store
  - 在匯出按鈕 handler 前加 check：`if (!canExport())`
  - 顯示 `UpgradePromptModal`，`hasAdOption = false`（hard paywall），`onAdRewarded = () => {}`
  - _Leverage: 現有匯出按鈕邏輯_
  - _Requirements: FR-7_

- [ ] 20. 更新 Settings — Premium 區塊、Voucher、Restore
  - File: `app/settings.tsx`
  - 讀取 `isPremium`, `voucherCode` from entitlement store
  - 在設定頁最上方新增 "PREMIUM" section：
    - Not premium：顯示 "Get Premium · $4.99" 按鈕（呼叫 `purchasePremium()`）+ Promo code 輸入欄（呼叫 `redeemVoucher()`，顯示成功/失敗訊息）
    - Premium via IAP：顯示 "✓ Premium Active" + "Restore Purchase" 按鈕（呼叫 `restorePurchases()`）
    - Premium via voucher：顯示 "✓ Premium Active (Promo Code)"
  - 使用現有 `optionRow` / `optionGroup` / `sectionHeader` 樣式
  - _Leverage: 現有 `app/settings.tsx` 的 section/option 樣式模式_
  - _Requirements: FR-13_

- [ ] 21. 整合驗證
  - 確認 free 用戶建立第 4 個專案時看到 UpgradePromptModal
  - 確認看完廣告後 `adUnlockedProjectCount` 增加，可建立第 4 個專案
  - 確認 5 個專案後廣告選項消失，只剩 buy 選項
  - 確認 free 用戶加第 2 張照片時看到 UpgradePromptModal（base = 1）
  - 確認 locked stitch category 顯示鎖頭，點擊後看到 modal
  - 確認 Premium 用戶：無廣告、無限制、所有功能開放
  - 確認 Voucher 兌換成功後同 Premium
  - _Requirements: FR-1 ~ FR-13_
