# Requirements Document

## Introduction

為 Stitchie App 新增一套完整的新手引導教學系統，讓初次使用的用戶能快速了解各個畫面的功能。系統包含三個層次：

1. **首次啟動輪播（Onboarding Carousel）**：App 第一次開啟後，顯示可左右滑動的功能介紹卡片。
2. **情境式 Spotlight 提示（Contextual Spotlight）**：用戶第一次進入特定畫面時，以半透明遮罩搭配高亮圈，說明畫面的重要操作。
3. **設定頁使用說明（Help Center）**：在設定頁新增「使用說明」入口，連結到一個靜態的全功能列表頁面，讓用戶隨時查閱。

## Alignment with Product Vision

降低新用戶學習門檻，幫助用戶快速上手 Stitchie 的所有核心功能，提升留存率與使用深度。

---

## Requirements

### Requirement 1 — 首次啟動輪播（Onboarding Carousel）

**User Story:** As a new user, I want to see a visual introduction when I first open the app, so that I can quickly understand what features are available.

#### Acceptance Criteria

1. WHEN the user opens the app for the very first time THEN the system SHALL display a full-screen modal carousel after the Lottie splash animation finishes.
2. WHEN the carousel is displayed THEN it SHALL contain 5 slides covering: (1) App 概述與歡迎, (2) 建立專案 + 左滑刪除, (3) 新增織圖 + 編輯段落（長按多選、拖曳排序）, (4) 計數追蹤（下一針、圈預覽、針法 icon/文字切換）, (5) 更多功能（自訂針法、範本、照片、匯入匯出）.
3. WHEN displaying each slide THEN the system SHALL show an icon/illustration, a title, and a description in the user's current language (zh-TW / en / ja).
4. WHEN the user swipes left or right THEN the system SHALL navigate between slides with a smooth animation.
5. WHEN on any slide except the last THEN a "下一步" / "Next" button SHALL be shown.
6. WHEN on the last slide THEN the button SHALL read "開始使用" / "Get Started" and tapping it SHALL dismiss the carousel.
7. WHEN the user taps "跳過" / "Skip" on any slide THEN the carousel SHALL be immediately dismissed.
8. WHEN the carousel is dismissed THEN the system SHALL persist a flag so it NEVER shows again on subsequent launches.
9. IF the user has already seen the carousel THEN it SHALL NOT be shown on subsequent launches.

### Requirement 2 — 情境式 Spotlight 提示（Contextual Spotlight）

**User Story:** As a new user, I want contextual highlights the first time I enter a complex screen, so that I learn what each key control does without being overwhelmed.

#### Acceptance Criteria

1. WHEN the user first visits a screen that has spotlight steps THEN the system SHALL display a semi-transparent dark overlay with one circular/rounded-rect highlight cutout revealing the target element.
2. WHEN a spotlight step is displayed THEN the system SHALL show a callout bubble with a step title and description, positioned to avoid obscuring the highlight.
3. WHEN the user taps "下一步" / "Next" THEN the system SHALL advance to the next spotlight step.
4. WHEN the user is on the last step THEN the button SHALL read "完成" / "Done" and tapping it SHALL dismiss the spotlight.
5. WHEN the user taps "跳過" / "Skip" THEN the system SHALL immediately dismiss the spotlight for that screen.
6. WHEN the spotlight for a screen is dismissed THEN the system SHALL persist a per-screen seen flag so it NEVER shows again on re-entry.
7. WHEN the spotlight overlay is shown THEN tapping the dark overlay area SHALL NOT dismiss it (prevent accidental dismissal).

### Requirement 3 — Spotlight 覆蓋的畫面與提示內容

**User Story:** As a new user, I want to be guided through every key screen I will use regularly, so that I can complete my first project confidently.

#### Acceptance Criteria

**3.1 — Project List Screen (`/`)**
1. WHEN the user first opens the project list THEN the spotlight SHALL highlight in sequence: (a) 新增專案按鈕（+），(b) 設定按鈕.
2. The callout for (a) SHALL mention that left-swiping a project card reveals a delete button.

**3.2 — Project Detail Screen (`/project/[id]`)**
1. WHEN the user first visits a project detail THEN the spotlight SHALL highlight: (a) 新增織圖按鈕, (b) 匯入/匯出按鈕（share icon）, (c) 編輯專案按鈕（pencil icon）.
2. The callout for (a) SHALL mention that left-swiping a chart card reveals a delete button.
3. The callout for (b) SHALL mention the photo gallery section exists for attaching reference/progress photos.

**3.3 — Chart Editor Screen (`/project/[id]/editor`)**
1. WHEN the user first visits the chart editor THEN the spotlight SHALL highlight: (a) 新增段落按鈕, (b) 任一段落列（示意長按 = 進入多選模式）, (c) 拖曳把手（drag handle，=示意可拖曳排序）.
2. The callout for (b) SHALL explain: 長按段落可進入多選模式，可批次複製或刪除多個段落.
3. The callout for (c) SHALL explain: 長按左側把手可拖曳段落以重新排序.

**3.4 — Round Editor Screen (`/project/[id]/round`)**
1. WHEN the user first visits the round editor THEN the spotlight SHALL highlight: (a) 新增針法按鈕, (b) 新增群組按鈕（新增重複群組）, (c) 任一針法列（示意長按多選）.
2. The callout for (b) SHALL explain: 群組可設定重複次數，適合連續重複的花樣.
3. The callout for (c) SHALL explain: 長按針法可進入多選模式，可批次刪除或拖曳排序.

**3.5 — Tracking Screen (`/project/[id]/tracking`)**
1. WHEN the user first visits the tracking screen THEN the spotlight SHALL highlight: (a) 下一針按鈕（大粉紅按鈕）, (b) 上一針按鈕, (c) 顯示模式切換按鈕（icon/文字切換，位於花樣卡右上角）, (d) 圈預覽箭頭（花樣卡標題左右的 < >）.
2. The callout for (a) SHALL explain: 點擊計數下一針；完成全圈後自動進入下一圈.
3. The callout for (b) SHALL explain: 點擊退回一針；支援跨圈退回.
4. The callout for (c) SHALL explain: 切換針法顯示為縮寫文字或針法圖示符號.
5. The callout for (d) SHALL explain: 點擊左右箭頭可預覽其他圈的花樣，不影響計數進度.
6. IF the tracking screen has a pattern description THEN the spotlight SHOULD also highlight the可折疊說明列（pattern desc toggle）.

**3.6 — Pattern Elements Screen (`/pattern-elements`)**
1. WHEN the user first visits the pattern elements screen THEN the spotlight SHALL highlight: (a) 自訂針法 tab, (b) 新增自訂針法按鈕, (c) 範本 tab.
2. The callout for (b) SHALL explain: 可定義自訂縮寫與針數，在織圖中當成普通針法使用.
3. The callout for (c) SHALL explain: 範本是預設好的針法群組，建立織圖時可快速套用.
4. The callout SHALL mention: 左滑任一項目可刪除.

### Requirement 4 — 設定頁使用說明（Help Center）

**User Story:** As a user, I want to access a complete feature guide from the settings page at any time, so that I can review functionality I may have missed or forgotten.

#### Acceptance Criteria

1. WHEN the user opens the settings page THEN the system SHALL display a "使用說明" / "Help" row under a "說明" section.
2. WHEN the user taps "使用說明" THEN the system SHALL navigate to a new Help Center screen (`/guide`).
3. WHEN the Help Center screen is displayed THEN it SHALL show a scrollable list of feature sections, each containing a title, icon, and description.
4. The Help Center SHALL cover the following feature categories:
   - **專案管理**：建立、編輯、刪除專案；左滑刪除；新增參考照片
   - **織圖 (Charts)**：每個專案可有多張織圖；左滑刪除織圖；匯入/匯出
   - **段落編輯**：新增段落；長按多選批次複製/刪除；拖曳排序；新增針法群組
   - **計數追蹤**：下一針/上一針；完成整圈；重置當圈；點擊針法 block 跳位；圈預覽模式；切換 icon/文字顯示
   - **針法庫**：自訂針法（自定義縮寫與針數）；範本（預設針法群組）；左滑刪除
   - **手勢操作摘要**：左滑刪除；長按多選；拖曳排序
5. WHEN the Help Center is displayed THEN the existing `guide.tsx` route SHALL be used or created as the Help Center screen.
6. WHEN the user is on the Help Center screen THEN a "重新觀看教學" / "Replay Tutorial" button SHALL allow them to reset the onboarding carousel seen flag and trigger it again on next app launch.

### Requirement 5 — 狀態持久化

**User Story:** As a user, I want the app to remember which tutorials I've already seen, so that I am never shown the same guide twice.

#### Acceptance Criteria

1. WHEN tutorial state is persisted THEN it SHALL use a dedicated `useOnboardingStore` Zustand store backed by MMKV.
2. The store SHALL track: `hasSeenCarousel: boolean` and `seenSpotlights: Record<string, boolean>` keyed by screen name.
3. WHEN a new storage key is added THEN `ONBOARDING` SHALL be added to `STORAGE_KEYS` in `mmkvStorage.ts`.
4. WHEN the "重新觀看教學" button is tapped THEN the store SHALL reset `hasSeenCarousel` to `false` (spotlights remain seen).
5. IF the user clears app data THEN all tutorial flags SHALL reset and tutorials SHALL show again from the beginning.

### Requirement 6 — 視覺設計與可訪問性

**User Story:** As a user, I want the tutorial to look consistent with the rest of the app, so that it feels like a natural part of the experience.

#### Acceptance Criteria

1. WHEN any tutorial UI is rendered THEN colors SHALL use: primary `#D97398`, background `#faf5f0`, deep primary `#C4527F`.
2. WHEN the spotlight overlay is rendered THEN the dark overlay SHALL be `rgba(0,0,0,0.72)`.
3. WHEN any tutorial UI is rendered THEN all touch targets SHALL be at least 44×44pt.
4. WHEN tutorial text is rendered THEN it SHALL use `useTranslation` and support zh-TW, en, and ja.
5. WHEN carousel or spotlight transitions animate THEN they SHALL complete within 300ms.
6. WHEN spotlight highlight dimensions are calculated THEN the system SHALL use `onLayout` or `ref.measureInWindow` to get real positions — no hardcoded coordinates.

---

## Non-Functional Requirements

### Performance
- Carousel and spotlight components SHALL be lazily mounted (only when needed) to avoid impacting app startup time.
- Spotlight layout measurements SHALL be taken after the screen has fully rendered.

### Security
- No network requests required for this feature.

### Reliability
- If a spotlight target ref cannot be measured (layout not ready), the system SHALL skip that step gracefully without crashing.
- Spotlight SHALL wait for the screen to settle (via `InteractionManager.runAfterInteractions` or a short delay) before measuring target positions.

### Usability
- All tutorial flows SHALL be skippable at any point.
- Spotlight steps per screen SHALL be limited to 3–5 steps.
- Carousel SHALL be limited to 5 slides.
- The Help Center SHALL be always accessible from settings regardless of tutorial seen state.
