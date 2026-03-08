# Requirements: Analytics (Firebase GA)

## Overview

在 Stitchie App 中整合 Firebase Analytics，記錄關鍵使用行為，以了解用戶使用習慣。ATT 權限不在第一次啟動時詢問，改為在第二次啟動或進入設定頁時才觸發。

## User Stories

1. **As a developer**, I want to track which screens users visit so I can understand navigation patterns.
2. **As a developer**, I want to track key actions (project created, tracking started, etc.) so I can understand feature usage.
3. **As a user**, I don't want to be interrupted with a permission dialog on my very first launch before I've experienced the app.
4. **As a user**, I want the permission dialog to appear at a natural moment (2nd launch or settings page), not interrupting my first session.

## Functional Requirements

### FR-1: Firebase Analytics Setup
- WHEN the app is built, THEN `@react-native-firebase/app` and `@react-native-firebase/analytics` must be installed and configured.
- WHEN the app initializes, THEN Firebase Analytics must be initialized automatically via the native SDK.
- The `GoogleService-Info.plist` must be added to the iOS project.

### FR-2: ATT Permission Timing
- WHEN it is the user's **first app launch**, THEN the ATT dialog must NOT appear.
- WHEN it is the **second or later app launch**, THEN the ATT dialog must appear once (and only once).
- WHEN the user **navigates to the Settings screen** on any launch, THEN the ATT dialog must appear if it hasn't been shown yet.
- WHEN the ATT dialog has already been shown (regardless of outcome), THEN it must never be shown again.
- The app launch count must be persisted in MMKV across sessions.
- The "ATT has been requested" flag must be persisted in MMKV.

### FR-3: AdMob Initialization (Modified)
- WHEN the app starts, THEN AdMob must initialize **without waiting for ATT**.
- AdMob initialization must happen immediately on every launch (not delayed).
- ATT is requested separately, decoupled from AdMob init.

### FR-4: Screen View Tracking
- WHEN a user lands on any of the following screens, THEN a `screen_view` event must be logged:
  - `ProjectList` (`app/index.tsx`)
  - `ProjectDetail` (`app/project/[id]/index.tsx`)
  - `PatternEditor` (`app/project/[id]/editor.tsx`)
  - `RoundEditor` (`app/project/[id]/round.tsx`)
  - `ProgressTracking` (`app/project/[id]/tracking.tsx`)
  - `ImportExport` (`app/project/[id]/import-export.tsx`)
  - `PatternElements` (`app/pattern-elements.tsx`)
  - `Guide` (`app/guide.tsx`)
  - `Settings` (`app/settings.tsx`)
- Screen view calls must use the existing `logScreenView(screenName)` function and `SCREEN_NAMES` constants.

### FR-5: Event Tracking
The following events must be implemented and logged at the appropriate call sites:

| Event | Trigger | Existing stub |
|-------|---------|--------------|
| `project_created` | User successfully creates a new project | `logProjectCreated(craftType)` |
| `tracking_started` | User enters the tracking screen | `logTrackingStarted()` |
| `chart_completed` | A chart is marked as completed | `logChartCompleted()` |
| `add_round` | User adds a new round to a chart | `logRoundAdded()` |
| `use_template` | User applies a stitch group template | `logTemplateUsed()` |
| `import_project` | User successfully imports a project | `logImport()` |
| `export_project` | User successfully exports a project | `logExport()` |

- `logStitchAdded()` stub exists but is intentionally **not** wired up (too noisy — called on every stitch tap).

### FR-6: Ad Behavior Tracking
The following ad-related events must also be tracked:

| Event | Trigger | Parameters |
|-------|---------|-----------|
| `rewarded_ad_watched` | User completes watching a rewarded ad | `reward_type: string` (e.g. `'project_slot'`, `'photo_slot'`, `'stitch_category_inc'`) |
| `rewarded_ad_declined` | User sees the rewarded ad prompt but taps "No thanks" | `reward_type: string` |
| `interstitial_shown` | Interstitial ad is displayed (project complete) | — |
| `iap_purchase_completed` | User successfully completes the $4.99 one-time purchase | — |

- These functions must be added to `analyticsService.ts` (new stubs + implementations).
- `reward_type` values must be defined as constants in `src/constants/analytics.ts`.

### FR-7: Analytics Service Implementation
- WHEN any `log*` function in `analyticsService.ts` is called, THEN it must call the corresponding Firebase Analytics method.
- IF Firebase Analytics is unavailable (e.g., simulator without Google Services), THEN the function must fail silently.
- All analytics calls must be fire-and-forget (no `await` at call sites).

## Non-Functional Requirements

- **No user-facing UI changes** from this feature (except the ATT dialog timing).
- **No blocking operations**: analytics calls must never block the UI thread.
- **Privacy**: no PII (personally identifiable information) must be logged in any event parameter.
- **Prebuild required**: adding `@react-native-firebase` requires running `expo prebuild --platform ios --clean`.

## Out of Scope

- Android analytics setup (iOS only for now).
- Custom dashboards or BigQuery export.
- Crash reporting (Firebase Crashlytics).
- `logStitchAdded` wiring (intentionally excluded).

## Existing Code to Leverage

- `src/services/analyticsService.ts` — stub functions already defined, only implementation needed
- `src/constants/analytics.ts` — `ANALYTICS_EVENTS` and `SCREEN_NAMES` already defined
- `src/stores/mmkvStorage.ts` — `mmkv` instance and `STORAGE_KEYS` pattern for persisting ATT state
- `src/services/adsService.ts` — `initializeAds()` needs modification to decouple ATT from AdMob init
- `app/_layout.tsx` — entry point for ATT trigger logic
- `app/settings.tsx` — secondary ATT trigger point
