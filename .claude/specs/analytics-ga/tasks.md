# Implementation Plan: Analytics (Firebase GA)

## Overview

依序完成：先建基礎設施（packages、常數、services），再更新 ATT 時機，最後補齊所有 screen view call sites。

## Steering Document Compliance

- 所有樣式用 `StyleSheet.create`，不用 NativeWind className
- 沿用 `mmkv` 直接讀寫（不需額外 Zustand store）
- 所有 analytics call 為 fire-and-forget（不 await at call sites）
- 需要 `npx expo prebuild --platform ios --clean` 後才能測試

## Tasks

- [ ] 1. 安裝 Firebase packages 並設定 app.json
  - Files: `package.json`, `app.json`
  - 執行 `npx expo install @react-native-firebase/app @react-native-firebase/analytics`
  - 在 `app.json` 的 `plugins` 陣列加入 `"@react-native-firebase/app"` 與 `"@react-native-firebase/analytics"`
  - **注意**：此 task 完成後需執行 `npx expo prebuild --platform ios --clean` 並加入 `GoogleService-Info.plist`，之後的 tasks 才能真正測試
  - _Requirements: FR-1_

- [ ] 2. 新增 MMKV storage keys（APP_LAUNCH_COUNT、ATT_REQUESTED）
  - File: `src/stores/mmkvStorage.ts`
  - 在 `STORAGE_KEYS` 新增：`APP_LAUNCH_COUNT: 'appLaunchCount'`, `ATT_REQUESTED: 'attRequested'`
  - _Leverage: 現有 `STORAGE_KEYS` 模式_
  - _Requirements: FR-2_

- [ ] 3. 擴充 analytics 常數（新事件名 + REWARD_TYPES）
  - File: `src/constants/analytics.ts`
  - 在 `ANALYTICS_EVENTS` 新增：`REWARDED_AD_WATCHED`, `REWARDED_AD_DECLINED`, `INTERSTITIAL_SHOWN`, `IAP_PURCHASE_COMPLETED`
  - 新增 `REWARD_TYPES` 常數物件：`PROJECT_SLOT`, `PHOTO_SLOT`, `STITCH_CATEGORY_INC`, `STITCH_CATEGORY_DEC`, `STITCH_CATEGORY_SPECIAL`
  - 新增 `export type RewardType = typeof REWARD_TYPES[keyof typeof REWARD_TYPES]`
  - _Leverage: 現有 `ANALYTICS_EVENTS` 結構_
  - _Requirements: FR-5, FR-6_

- [ ] 4. 重構 adsService：拆分 initializeAdMob + requestATTIfNeeded
  - File: `src/services/adsService.ts`
  - 將現有 `initializeAds()` 拆為：
    - `initializeAdMob()` — 只做 `MobileAds().initialize()`，不請求 ATT
    - `requestATTIfNeeded()` — 讀 `STORAGE_KEYS.ATT_REQUESTED`；若已請求則直接 return；否則呼叫 `requestTrackingPermissionsAsync()` 再設 `attRequested = true`
  - 移除舊的 `initializeAds()` export
  - _Leverage: 現有 `adsService.ts` 的 try/catch 模式_
  - _Requirements: FR-2, FR-3_

- [ ] 5. 更新 services/index.ts export
  - File: `src/services/index.ts`
  - 確保 `initializeAdMob` 和 `requestATTIfNeeded` 有正確 export（`initializeAds` 移除）
  - _Requirements: FR-3_

- [ ] 6. 實作 analyticsService.ts（核心事件）
  - File: `src/services/analyticsService.ts`
  - import `analytics` from `@react-native-firebase/analytics`
  - 實作現有所有 stub：`logScreenView`, `logProjectCreated`, `logTrackingStarted`, `logChartCompleted`, `logRoundAdded`, `logTemplateUsed`, `logImport`, `logExport`
  - `logStitchAdded` 保留空實作（intentionally no-op）
  - 每個函數都用 `try/catch {}` 包住，fail silently
  - _Leverage: 現有 stub 函數簽名，design.md 的實作範例_
  - _Requirements: FR-7_

- [ ] 7. 新增廣告行為追蹤函數到 analyticsService.ts
  - File: `src/services/analyticsService.ts`
  - 新增：`logRewardedAdWatched(rewardType: RewardType)`, `logRewardedAdDeclined(rewardType: RewardType)`, `logInterstitialShown()`, `logIAPPurchaseCompleted()`
  - import `RewardType` from `../constants/analytics`
  - 同樣 fail silently
  - 在 `src/services/index.ts` export 這四個新函數
  - _Leverage: task 6 的實作模式_
  - _Requirements: FR-6_

- [ ] 8. 更新 _layout.tsx：launch count + ATT on 2nd launch
  - File: `app/_layout.tsx`
  - 在 `useEffect` 中：
    1. 讀取並 +1 `APP_LAUNCH_COUNT`，存回 MMKV
    2. 將 `initializeAds()` 改為 `initializeAdMob()`
    3. `if (count >= 2) requestATTIfNeeded()`（fire-and-forget）
  - import `mmkv`, `STORAGE_KEYS` from `../src/stores/mmkvStorage`
  - import `initializeAdMob`, `requestATTIfNeeded` from `../src/services`
  - _Leverage: 現有 `setupAds()` 結構_
  - _Requirements: FR-2, FR-3_

- [ ] 9. 更新 settings.tsx：ATT trigger on mount
  - File: `app/settings.tsx`
  - 新增 `useEffect(() => { requestATTIfNeeded() }, [])` 於元件頂層
  - import `requestATTIfNeeded` from `../src/services`
  - _Requirements: FR-2_

- [ ] 10. 補齊缺少 logScreenView 的畫面（批次）
  - Files: `app/project/[id]/editor.tsx`, `app/project/[id]/round.tsx`, `app/project/[id]/tracking.tsx`, `app/project/[id]/import-export.tsx`, `app/guide.tsx`, `app/settings.tsx`
  - 每個檔案加入：
    ```typescript
    useEffect(() => {
      logScreenView(SCREEN_NAMES.XXX)
    }, [])
    ```
  - 使用對應的 `SCREEN_NAMES` 常數（`PATTERN_EDITOR`, `ROUND_EDITOR`, `PROGRESS_TRACKING`, `IMPORT_EXPORT`, `GUIDE`, `SETTINGS`）
  - `SCREEN_NAMES` 缺少 `SETTINGS` key → 在 `src/constants/analytics.ts` 補上 `SETTINGS: 'Settings'`
  - _Leverage: 現有 `app/index.tsx` 的 `logScreenView` 使用模式_
  - _Requirements: FR-4_

- [ ] 11. 整合驗證
  - 確認 `initializeAds` 舊 export 不再被任何地方使用（搜尋 codebase）
  - 確認第 1 次啟動不觸發 ATT（MMKV count = 1 時不呼叫 requestATTIfNeeded）
  - 確認第 2 次啟動觸發 ATT（count = 2）
  - 確認進入 settings 頁觸發 ATT（count = 1 時進 settings 也會觸發）
  - 確認所有 9 個畫面都有 `logScreenView` call
  - _Requirements: FR-2, FR-3, FR-4_
