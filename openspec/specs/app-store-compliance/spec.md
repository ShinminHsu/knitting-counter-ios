# app-store-compliance Specification

## Purpose

TBD - created by archiving change 'app-store-review-fixes'. Update Purpose after archive.

## Requirements

### Requirement: Purpose strings are specific and descriptive

`NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` in `app.json` `infoPlist` SHALL contain descriptions that explicitly state the feature (project photo gallery) and provide a concrete example of use.

#### Scenario: Camera purpose string is accepted by App Store review

- **WHEN** Apple reviews the app's camera usage description
- **THEN** the string SHALL describe that the camera is used to take photos for a project's photo gallery, e.g. "Stitchie uses your camera to take photos of your knitting projects and add them to your project's photo gallery."

#### Scenario: Photo library purpose string is accepted by App Store review

- **WHEN** Apple reviews the app's photo library usage description
- **THEN** the string SHALL describe that the photo library is used to select photos for a project's photo gallery, e.g. "Stitchie accesses your photo library so you can add photos of your knitting projects to your project's photo gallery."


<!-- @trace
source: app-store-review-fixes
updated: 2026-09-30
code:
  - screenshots/composite.py
  - screenshots/en/04-crochet-library/final.png
  - src/stores/useSettingsStore.ts
  - app/_layout.tsx
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - src/services/icloudBackupService.ts
  - src/components/CustomStitchModal.tsx
  - src/components/PhotoViewer.tsx
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - src/services/photoService.ts
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/final.png
  - docs/dev-client.md
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/ja/03-knitting-library/final.png
  - src/components/BackupRestoreFeedback.tsx
  - src/constants/analytics.ts
  - screenshots/ja/04-crochet-library/scaffold.png
  - src/services/importExportService.ts
  - src/utils/index.ts
  - app/project/[id]/tracking.tsx
  - src/types/index.ts
  - src/utils/importExportHelpers.ts
  - app/project/[id]/round.tsx
  - screenshots/en/03-knitting-library/dec.png
  - app/settings.tsx
  - package.json
  - src/i18n/locales/en.ts
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/zh-TW/01-never-lose-place/final.png
  - app/index.tsx
  - src/stores/useCustomStitchStore.ts
  - src/services/iapService.ts
  - screenshots/en/01-never-lose-place/dec.png
  - src/stores/useTemplateStore.ts
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/05.PNG
  - src/i18n/locales/zh-TW.ts
  - .nvmrc
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - assets/screenshot/en/02.PNG
  - screenshots/build_cream_base.py
  - screenshots/en/02-build-pattern/scaffold.png
  - app/pattern-elements.tsx
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/zh-TW/05-group-repeat/final.png
  - src/stores/useProjectStore.ts
  - src/utils/photoPathUtils.ts
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/en/04-crochet-library/dec.png
  - assets/screenshot/en/04.PNG
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/02-build-pattern/final.png
  - app/project/[id]/index.tsx
  - src/services/analyticsService.ts
  - src/services/index.ts
  - src/i18n/locales/ja.ts
  - marketing/marketing-strategy.md
  - screenshots/ja/03-knitting-library/scaffold.png
  - src/components/PhotoGallery.tsx
  - src/stores/useEntitlementStore.ts
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/final.png
  - src/stores/mmkvStorage.ts
  - app.json
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - CLAUDE.md
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
-->

---
### Requirement: ATT prompt appears before AdMob initialization

On a fresh install or after resetting tracking permissions, the App Tracking Transparency permission request SHALL appear before `MobileAds().initialize()` is called.

#### Scenario: First launch shows ATT before ads initialize

- **WHEN** the app is launched for the first time
- **THEN** `requestATTIfNeeded()` SHALL be awaited before `initializeAdMob()` is called

#### Scenario: ATT appears only once

- **WHEN** the user has already responded to the ATT prompt in a previous session
- **THEN** `requestATTIfNeeded()` SHALL return immediately without showing the prompt again


<!-- @trace
source: app-store-review-fixes
updated: 2026-09-30
code:
  - screenshots/composite.py
  - screenshots/en/04-crochet-library/final.png
  - src/stores/useSettingsStore.ts
  - app/_layout.tsx
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - src/services/icloudBackupService.ts
  - src/components/CustomStitchModal.tsx
  - src/components/PhotoViewer.tsx
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - src/services/photoService.ts
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/final.png
  - docs/dev-client.md
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/ja/03-knitting-library/final.png
  - src/components/BackupRestoreFeedback.tsx
  - src/constants/analytics.ts
  - screenshots/ja/04-crochet-library/scaffold.png
  - src/services/importExportService.ts
  - src/utils/index.ts
  - app/project/[id]/tracking.tsx
  - src/types/index.ts
  - src/utils/importExportHelpers.ts
  - app/project/[id]/round.tsx
  - screenshots/en/03-knitting-library/dec.png
  - app/settings.tsx
  - package.json
  - src/i18n/locales/en.ts
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/zh-TW/01-never-lose-place/final.png
  - app/index.tsx
  - src/stores/useCustomStitchStore.ts
  - src/services/iapService.ts
  - screenshots/en/01-never-lose-place/dec.png
  - src/stores/useTemplateStore.ts
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/05.PNG
  - src/i18n/locales/zh-TW.ts
  - .nvmrc
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - assets/screenshot/en/02.PNG
  - screenshots/build_cream_base.py
  - screenshots/en/02-build-pattern/scaffold.png
  - app/pattern-elements.tsx
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/zh-TW/05-group-repeat/final.png
  - src/stores/useProjectStore.ts
  - src/utils/photoPathUtils.ts
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/en/04-crochet-library/dec.png
  - assets/screenshot/en/04.PNG
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/02-build-pattern/final.png
  - app/project/[id]/index.tsx
  - src/services/analyticsService.ts
  - src/services/index.ts
  - src/i18n/locales/ja.ts
  - marketing/marketing-strategy.md
  - screenshots/ja/03-knitting-library/scaffold.png
  - src/components/PhotoGallery.tsx
  - src/stores/useEntitlementStore.ts
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/final.png
  - src/stores/mmkvStorage.ts
  - app.json
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - CLAUDE.md
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
-->

---
### Requirement: ATT error does not permanently suppress future prompts

If `requestTrackingPermissionsAsync()` throws an error, the `ATT_REQUESTED` MMKV flag SHALL NOT be set to true, so the prompt can be attempted again on the next launch.

#### Scenario: ATT throws on current session but succeeds next launch

- **WHEN** `requestTrackingPermissionsAsync()` throws an error
- **THEN** `ATT_REQUESTED` SHALL remain false so the prompt is retried on the next launch

<!-- @trace
source: app-store-review-fixes
updated: 2026-09-30
code:
  - screenshots/composite.py
  - screenshots/en/04-crochet-library/final.png
  - src/stores/useSettingsStore.ts
  - app/_layout.tsx
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - src/services/icloudBackupService.ts
  - src/components/CustomStitchModal.tsx
  - src/components/PhotoViewer.tsx
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - src/services/photoService.ts
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/final.png
  - docs/dev-client.md
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/ja/03-knitting-library/final.png
  - src/components/BackupRestoreFeedback.tsx
  - src/constants/analytics.ts
  - screenshots/ja/04-crochet-library/scaffold.png
  - src/services/importExportService.ts
  - src/utils/index.ts
  - app/project/[id]/tracking.tsx
  - src/types/index.ts
  - src/utils/importExportHelpers.ts
  - app/project/[id]/round.tsx
  - screenshots/en/03-knitting-library/dec.png
  - app/settings.tsx
  - package.json
  - src/i18n/locales/en.ts
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/swap_screen.py
  - screenshots/zh-TW/01-never-lose-place/final.png
  - app/index.tsx
  - src/stores/useCustomStitchStore.ts
  - src/services/iapService.ts
  - screenshots/en/01-never-lose-place/dec.png
  - src/stores/useTemplateStore.ts
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/05.PNG
  - src/i18n/locales/zh-TW.ts
  - .nvmrc
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - assets/screenshot/en/02.PNG
  - screenshots/build_cream_base.py
  - screenshots/en/02-build-pattern/scaffold.png
  - app/pattern-elements.tsx
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - marketing/reddit-posts.md
  - screenshots/zh-TW/05-group-repeat/final.png
  - src/stores/useProjectStore.ts
  - src/utils/photoPathUtils.ts
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/en/04-crochet-library/dec.png
  - assets/screenshot/en/04.PNG
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/ja/02-build-pattern/final.png
  - marketing/ravelry-posts.md
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/02-build-pattern/final.png
  - app/project/[id]/index.tsx
  - src/services/analyticsService.ts
  - src/services/index.ts
  - src/i18n/locales/ja.ts
  - marketing/marketing-strategy.md
  - screenshots/ja/03-knitting-library/scaffold.png
  - src/components/PhotoGallery.tsx
  - src/stores/useEntitlementStore.ts
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/final.png
  - src/stores/mmkvStorage.ts
  - app.json
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - CLAUDE.md
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
-->