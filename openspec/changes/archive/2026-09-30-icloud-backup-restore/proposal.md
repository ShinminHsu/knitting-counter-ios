## Why

All Stitchie data (projects, charts, progress, custom stitches, templates) lives only in local MMKV and photos live only in the app's Documents directory. Deleting the app — a common way users "free up space" or troubleshoot — permanently destroys every project, and voucher / ad-unlock entitlements are lost too. Users expect Apple apps to survive reinstall via iCloud, and data loss is the fastest path to one-star reviews.

## What Changes

- Automatically back up projects, photos, custom stitches, and templates to the app's private iCloud container (hidden from the Files app), one file per project.
- Delete backed-up photo files when a photo or project is removed, so the backup does not accumulate orphaned images in the user's iCloud storage.
- Upload changes on a debounce (idle for 5 seconds, app backgrounded, leaving the tracking screen) instead of on every stitch tap.
- After a reinstall with no local projects, detect an existing iCloud backup and prompt the user to restore it; restored projects ignore the free-tier project limit.
- Mirror voucher code and ad-unlock entitlements to the iCloud key-value store so they survive reinstall (IAP premium continues to use `restorePurchases()`).
- Add an "iCloud Backup" section to Settings: on/off toggle, last backup time, "Back Up Now", "Restore from iCloud", "Delete iCloud Backup" (lets users reclaim iCloud storage without digging into iOS Settings), and an iCloud-unavailable state.
- Record deleted-project tombstones and add persist `version` to data stores, so deletions propagate to the backup and a future cross-device sync phase can build on the same format.
- The feature is free for all users. Cross-device live sync is a later phase (planned as premium) and is not part of this change.

**Prerequisite (done)**: `fix-photo-relative-uri` (merged into `dev`) stores `ProjectPhoto.uri` relative to the Documents directory, so restored photos resolve correctly in a new app container.

## Non-Goals (optional)

(covered in design.md)

## Capabilities

### New Capabilities

- `icloud-backup`: Automatic backup of user data to the app's private iCloud container, restore after reinstall, entitlement backup via iCloud key-value store, and the Settings UI controlling it.

### Modified Capabilities

(none)

## Impact

- Affected specs: `icloud-backup` (new)
- New dependency: `react-native-cloud-storage@^3` (Expo config plugin; requires New Architecture, already enabled). Requires `npx expo prebuild --platform ios --clean` and an iCloud container `iCloud.com.stitchie.app` configured in Apple Developer.
- Affected code:
  - `app.json` (plugin + entitlements)
  - `src/services/icloudBackupService.ts` (new), `src/services/index.ts`
  - `src/types/index.ts` (backup manifest / file types)
  - `src/stores/useProjectStore.ts` (tombstones, persist version)
  - `src/stores/useCustomStitchStore.ts`, `src/stores/useTemplateStore.ts` (persist version)
  - `src/stores/useSettingsStore.ts` (backup toggle)
  - `src/stores/useEntitlementStore.ts` (key-value mirror)
  - `src/stores/mmkvStorage.ts` (new storage keys)
  - `src/utils/importExportHelpers.ts` (extract shared project shape validation)
  - `app/index.tsx` (restore prompt), `app/settings.tsx` (backup section), `app/_layout.tsx` (AppState trigger), `app/project/[id]/tracking.tsx` (flush on leave)
  - `src/i18n/locales/en.ts`, `ja.ts`, `zh-TW.ts`
