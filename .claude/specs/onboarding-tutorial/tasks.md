# Implementation Plan

## Task Overview

依序建立 onboarding tutorial 系統的三個子系統：先建基礎設施（store、組件），再整合到各畫面，最後完成 Help Center 和 Settings 入口。

## Steering Document Compliance

- 所有樣式用 `StyleSheet.create`，不用 NativeWind className
- 主色 `#D97398`，背景 `#faf5f0`，深主色 `#C4527F`
- 沿用 Zustand + MMKV persist 模式
- 沿用 `useTranslation` 多語言

## Atomic Task Requirements

- **File Scope**: 每個 task 最多碰 1-3 個相關檔案
- **Time Boxing**: 15-30 分鐘可完成
- **Single Purpose**: 每個 task 一個可測試的結果

## Tasks

- [ ] 1. 新增 ONBOARDING storage key 並建立 useOnboardingStore
  - Files: `src/stores/mmkvStorage.ts`, `src/stores/useOnboardingStore.ts`, `src/stores/index.ts`
  - 在 `mmkvStorage.ts` 的 `STORAGE_KEYS` 新增 `ONBOARDING: 'onboarding'`
  - 建立 `useOnboardingStore.ts`，state: `hasSeenCarousel: boolean`, `seenSpotlights: Record<string, boolean>`
  - Actions: `markCarouselSeen()`, `markSpotlightSeen(screenName: string)`, `resetCarousel()`
  - 使用 `persist` + `createJSONStorage(() => mmkvStorage)`，name = `STORAGE_KEYS.ONBOARDING`
  - 在 `src/stores/index.ts` export `useOnboardingStore`
  - _Leverage: `src/stores/useSettingsStore.ts`, `src/stores/mmkvStorage.ts`_
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. 新增 onboarding 翻譯 key（zh-TW）
  - Files: `src/i18n/locales/zh-TW.ts`
  - 新增 `onboarding` namespace，包含：
    - Carousel: `carouselSkip`, `carouselNext`, `carouselStart`
    - 5 slides 各自的 `slide{N}Title`, `slide{N}Desc`（N=1-5）
    - Spotlight 各畫面各步驟的 `{screen}{Step}Title`, `{screen}{Step}Desc`
    - Spotlight 共用: `spotlightSkip`, `spotlightNext`, `spotlightDone`
  - Slide 內容：(1) 歡迎/概述, (2) 建立專案+左滑刪除, (3) 新增織圖+段落長按多選+拖曳, (4) 計數追蹤操作, (5) 自訂針法+範本+照片+匯入匯出
  - _Requirements: 6.4_

- [ ] 3. 新增 onboarding 翻譯 key（en, ja）
  - Files: `src/i18n/locales/en.ts`, `src/i18n/locales/ja.ts`
  - 新增與 zh-TW 相同結構的 `onboarding` namespace（英文、日文翻譯）
  - _Leverage: `src/i18n/locales/zh-TW.ts` task 2 結果_
  - _Requirements: 6.4_

- [ ] 4. 建立 OnboardingCarousel 組件
  - File: `src/components/OnboardingCarousel.tsx`
  - Props: `visible: boolean`, `onDismiss: () => void`
  - 使用 `Modal` (animationType='fade', transparent=false, backgroundColor='#faf5f0')
  - 5 slides 定義為 `SLIDES` const 陣列（iconName, titleKey, descriptionKey）
  - 使用 `FlatList` horizontal + pagingEnabled + `scrollEnabled={false}`
  - 每個 slide：中央 icon（Ionicons/Feather，size=72，color='#D97398'）+ title + description
  - 底部：頁碼點（active=#D97398，inactive=#e5e7eb）+ 跳過按鈕（左上）+ 下一步/開始使用按鈕
  - "跳過" 按鈕：文字按鈕，`color: '#9ca3af'`
  - "下一步"/"開始使用" 按鈕：實色，`backgroundColor: '#D97398'`
  - _Requirements: 1.1–1.8_

- [ ] 5. 在 _layout.tsx 掛載 OnboardingCarousel
  - File: `app/_layout.tsx`
  - import `useOnboardingStore`、`OnboardingCarousel`
  - 在 Lottie `onAnimationFinish` 時同時檢查 `hasSeenCarousel`
  - 若 `!hasSeenCarousel`：在 `setShowLottie(false)` 後設 `showCarousel = true`
  - 渲染：`{!showLottie && <OnboardingCarousel visible={showCarousel} onDismiss={...} />}`
  - onDismiss：呼叫 `markCarouselSeen()`，設 `showCarousel = false`
  - _Leverage: `app/_layout.tsx` 現有的 showLottie 邏輯_
  - _Requirements: 1.1, 1.8, 1.9_

- [ ] 6. 建立 SpotlightOverlay 組件
  - File: `src/components/SpotlightOverlay.tsx`
  - Props: `steps: SpotlightStep[]`（含 targetRect, title, description, shape?, padding?）, `onDismiss: () => void`
  - 全螢幕絕對定位 View（`position:'absolute', top:0, left:0, right:0, bottom:0, zIndex:9999`）
  - 遮罩以 4 個 View 實作（top/bottom/left/right panels），各自 `backgroundColor: 'rgba(0,0,0,0.72)'`
  - Highlight 區域：空白 View（無背景），可選 `borderRadius: 8`（rect）或圓形
  - Callout bubble：白色圓角卡片，含 title、description、下一步/完成按鈕
  - Callout 定位：優先置於高亮區域下方；若 `targetRect.y + targetRect.height + calloutHeight > screenHeight - 100` 則顯示上方
  - 跳過按鈕：右上角固定位置
  - 入場動畫：`Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true })`
  - 內部 `currentStep` state，點「下一步」遞增，最後一步變「完成」呼叫 onDismiss
  - _Leverage: `src/components/CompletionModal.tsx`（Animated 動畫模式）_
  - _Requirements: 2.1–2.7_

- [ ] 7. 建立 useSpotlight hook
  - File: `src/hooks/useSpotlight.ts`
  - Input: `screenName: string`, `steps: SpotlightStepConfig[]`（ref, titleKey, descriptionKey, shape?, padding?）
  - 讀取 `useOnboardingStore` 的 `seenSpotlights[screenName]`
  - 若已見過：直接回傳 `{ showSpotlight: false, resolvedSteps: [], dismiss: () => {} }`
  - 若未見過：在 `useEffect` 中 `InteractionManager.runAfterInteractions()` 後等待 300ms，依序對每個 ref 呼叫 `measureInWindow`
  - 測量成功（width > 0 && height > 0）的 steps 才加入 resolvedSteps；全部失敗時直接 markSpotlightSeen 而不顯示 overlay
  - 回傳 `{ showSpotlight: boolean, resolvedSteps: SpotlightStep[], dismiss: () => void }`
  - `dismiss()` 呼叫 `markSpotlightSeen(screenName)` 並設 `showSpotlight = false`
  - _Leverage: `src/stores/useOnboardingStore.ts`_
  - _Requirements: 2.6, 6.6_

- [ ] 8. 整合 Spotlight 到 Project List Screen
  - File: `app/index.tsx`
  - 為「新增專案按鈕」和「設定按鈕」各建立 `useRef<View>(null)`
  - 在對應的 `TouchableOpacity` 加上 `ref`
  - 定義 2 個 spotlight steps（含左滑刪除說明在第一步 description）
  - 呼叫 `useSpotlight(SCREEN_NAMES.PROJECT_LIST, steps)`
  - 在 `SafeAreaView` 末尾渲染 `{showSpotlight && <SpotlightOverlay ... />}`
  - _Leverage: `src/hooks/useSpotlight.ts`, `src/components/SpotlightOverlay.tsx`_
  - _Requirements: 3.1_

- [ ] 9. 整合 Spotlight 到 Project Detail Screen
  - File: `app/project/[id]/index.tsx`
  - Refs：新增織圖按鈕、匯入匯出按鈕、編輯專案按鈕
  - 定義 3 個 spotlight steps（第一步 desc 含左滑刪除 chart 的說明，第二步含照片說明）
  - 呼叫 `useSpotlight(SCREEN_NAMES.PROJECT_DETAIL, steps)`
  - 在 `SafeAreaView` 末尾渲染 overlay
  - _Leverage: `src/hooks/useSpotlight.ts`, `src/components/SpotlightOverlay.tsx`_
  - _Requirements: 3.2_

- [ ] 10. 整合 Spotlight 到 Chart Editor Screen
  - File: `app/project/[id]/editor.tsx`
  - Refs：新增段落按鈕（ADD 按鈕）、任一 RoundRow（第一個 round 的 ref，若有）、拖曳把手（dragHandle）
  - 注意：RoundRow 和 dragHandle 的 ref 需在 `RoundRow` 組件上支援 forwardRef 或在父層直接拿第一個 row 的 ref
  - 定義 3 個 steps：新增段落、長按多選說明、拖曳排序說明
  - 呼叫 `useSpotlight(SCREEN_NAMES.PATTERN_EDITOR, steps)`
  - 渲染 overlay
  - _Leverage: `src/hooks/useSpotlight.ts`, `src/components/SpotlightOverlay.tsx`_
  - _Requirements: 3.3_

- [ ] 11. 新增 ROUND_EDITOR screen name 並整合 Spotlight 到 Round Editor Screen
  - Files: `src/constants/analytics.ts`, `app/project/[id]/round.tsx`
  - 在 `SCREEN_NAMES` 新增 `ROUND_EDITOR: 'RoundEditor'`
  - 在 round.tsx：Refs：新增針法按鈕、新增群組按鈕
  - 定義 3 個 steps：新增針法、新增群組（含重複次數說明）、長按多選說明
  - 呼叫 `useSpotlight(SCREEN_NAMES.ROUND_EDITOR, steps)`
  - 渲染 overlay
  - _Leverage: `src/hooks/useSpotlight.ts`, `src/components/SpotlightOverlay.tsx`, `src/constants/analytics.ts`_
  - _Requirements: 3.4_

- [ ] 12. 整合 Spotlight 到 Tracking Screen
  - File: `app/project/[id]/tracking.tsx`
  - Refs：下一針按鈕、上一針按鈕、顯示模式切換按鈕、圈預覽左箭頭（或整個 cardHeader 區域）
  - 定義 4 個 steps
  - 呼叫 `useSpotlight(SCREEN_NAMES.PROGRESS_TRACKING, steps)`
  - 渲染 overlay
  - _Leverage: `src/hooks/useSpotlight.ts`, `src/components/SpotlightOverlay.tsx`_
  - _Requirements: 3.5_

- [ ] 13. 整合 Spotlight 到 Pattern Elements Screen
  - File: `app/pattern-elements.tsx`
  - Refs：自訂針法 tab、新增自訂針法按鈕、範本 tab
  - 定義 3 個 steps（含左滑刪除說明）
  - 呼叫 `useSpotlight(SCREEN_NAMES.PATTERN_ELEMENTS, steps)`
  - 渲染 overlay
  - _Leverage: `src/hooks/useSpotlight.ts`, `src/components/SpotlightOverlay.tsx`_
  - _Requirements: 3.6_

- [ ] 14. 擴充 guide.tsx 為完整 Help Center
  - File: `app/guide.tsx`
  - 在頂部（ScrollView 第一個元素）新增「重新觀看教學」按鈕
    - outline 樣式（borderColor: '#D97398'，color: '#D97398'）
    - onPress：呼叫 `useOnboardingStore.getState().resetCarousel()`，顯示簡短 Alert 提示「下次開啟 App 時將再次顯示教學」
  - 將現有 3 個 sections 擴充為 6 個 sections：
    1. **專案管理**（保留現有內容，補充左滑刪除、照片新增）
    2. **織圖（Charts）**（保留現有，補充左滑刪除、匯入匯出）
    3. **段落編輯**（大幅擴充：長按多選批次操作、拖曳排序、針法群組）
    4. **計數追蹤**（大幅擴充：下一針/上一針、圈預覽、點 block 跳位、icon/文字切換）
    5. **手勢操作摘要**（新 section：左滑刪除、長按多選、拖曳排序，用 tip 格式）
    6. **針法庫**（自訂針法、範本）
  - 新增 `tip` 樣式（帶有 icon 的提示列，`backgroundColor: '#fce7f0'`）
  - 更新 i18n key（新增 guide.* keys）
  - _Leverage: `app/guide.tsx` 現有 styles（section/card/step），`src/stores/useOnboardingStore.ts`_
  - _Requirements: 4.1–4.6_

- [ ] 15. 在 Settings 新增「使用說明」入口
  - File: `app/settings.tsx`
  - 在現有的 Tools section 下方新增新 section，sectionHeader 文字 key: `settings.helpSection`
  - 新增 optionRow：「使用說明」(i18n key: `settings.helpGuide`)，onPress: `router.push('/guide')`
  - 在 i18n 檔（zh-TW, en, ja）新增 `settings.helpSection`, `settings.helpGuide` 翻譯 key
  - _Leverage: `app/settings.tsx` 現有 optionGroup/optionRow styles_
  - _Requirements: 4.1, 4.2_

- [ ] 16. 驗證完整流程並補齊細節
  - Files: `src/components/OnboardingCarousel.tsx`, `src/components/SpotlightOverlay.tsx`
  - 手動測試：首次啟動輪播 → 進入各畫面 spotlight → 設定 → 使用說明 → 重新觀看教學
  - 確認 carousel 的「跳過」和「開始使用」都能正確呼叫 markCarouselSeen
  - 確認所有 spotlight 的 seen flag 在重新進入畫面時不再顯示
  - 確認 callout bubble 定位不超出螢幕邊界（尤其 tracking screen 的底部按鈕 refs）
  - 補齊任何 task 1–15 遺漏的 i18n key
  - _Leverage: 所有前序 tasks_
  - _Requirements: All_
