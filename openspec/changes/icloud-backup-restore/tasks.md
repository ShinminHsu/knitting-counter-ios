## 1. Setup & Spike

- [x] 1.1 Confirm the prerequisite relative photo path fix is merged into `dev`, then create branch `feat/icloud-backup-restore` from `dev`
- [x] 1.2 Use react-native-cloud-storage: install `react-native-cloud-storage@^3`, add `["react-native-cloud-storage", { "iCloudContainerEnvironment": "Production", "enableKeyValueStorage": true }]` to `app.json` plugins, and add an "iCloud setup" note to the change folder listing the Apple Developer steps (enable iCloud capability on `com.stitchie.app`, create container `iCloud.com.stitchie.app`, regenerate profile via EAS)
- [x] 1.3 [手動驗證] Spike on a physical device via a new EAS development build (`eas build --profile development --platform ios`, then `npx expo start --tunnel`; see `docs/dev-client.md`): with a temporary DEV button in `app/settings.tsx`, confirm (a) `writeFile`/`readFile` JSON round-trip in the hidden AppData scope, (b) photos as base64 text files round-trip to a displayable JPEG, (c) `CloudKVStorage.setItem`/`getItem` works, (d) nothing appears in the Files app, (e) whether `iCloudContainerEnvironment: "Production"` works for the development build; record findings in design.md Open Questions and remove the DEV button

## 2. Data Model

- [x] 2.1 Tombstones for deletion: add `deletedProjects: Record<string, string>` to `useProjectStore`; `deleteProject` records `deletedAt`; add `clearTombstones(ids)` action; add persist `version: 1` with identity `migrate` to `useCustomStitchStore` and `useTemplateStore` (schema versioning baseline for Backup schema version); `useProjectStore` already declares `version: 1` from fix-photo-relative-uri — keep it, `deletedProjects` defaults to `{}` through persist's shallow merge
- [x] 2.2 Add `iCloudBackupEnabled: boolean` (default `true`) and setter to `useSettingsStore`; add `BACKUP_STATE` key to `STORAGE_KEYS` in `src/stores/mmkvStorage.ts`; add `BackupManifest`, `BackupProjectFile`, `BackupLibraryFile`, `BackupState` types to `src/types/index.ts` exactly as defined in design.md "Per-project backup files" and "Debounced flush"
- [x] 2.3 Extract `validateProjectShape(project: unknown): string[]` from `src/utils/importExportHelpers.ts` and make the existing import validation call it (import behaviour unchanged)

## 3. Backup Service

- [x] 3.1 Create `src/services/icloudBackupService.ts` implementing Automatic iCloud backup `flushBackup({ force })`: return early if toggle off, `isCloudAvailable()` false, or restore decision pending (Cloud data preservation); write dirty `/projects/<id>.json` (compare `updatedAt` with `BackupState.uploadedProjects`, `force` writes all), upload photos not in `uploadedPhotos[projectId]` as base64 via `expo-file-system`, apply Removed photo cleanup (delete `/photos/<projectId>/<photoId>.b64` for ids in `uploadedPhotos[projectId]` no longer in the project's `photos`, keeping the id tracked if deletion fails), write `/library.json` when changed, apply Deletion tombstones (delete project file + photo folder, move id to `manifest.deleted`, call `clearTombstones`), write `/manifest.json` last with `schemaVersion: 1`, update `BackupState` per item only after success, set `lastBackupAt` or `lastError`; in `__DEV__` `console.log` each written and deleted path
- [x] 3.2 Debounced backup flush triggers: single-flight wrapper with one queued follow-up; subscribe to `useProjectStore`, `useCustomStitchStore`, `useTemplateStore` changes with a 5-second idle timer; register `AppState` `background` listener and `subscribeToCloudAvailability` in `app/_layout.tsx`; call immediate flush in `app/project/[id]/tracking.tsx` unmount effect; export from `src/services/index.ts`
- [x] 3.3 Entitlements in key-value store (Entitlement backup): subscribe to `useEntitlementStore` and write merged `entitlements.v1` (max counts, OR booleans, non-null `voucherCode`, never `isPremium`); on launch when iCloud available read and merge into local store, re-validating `voucherCode` with the SHA-256 check from `voucherService.ts` before `setPremium('voucher', code)`

## 4. Restore & UI

- [x] 4.1 Restore merge by updatedAt: implement `hasRestorableBackup()` (returns project count + manifest `updatedAt`) and `restoreFromBackup()` per design.md steps 1–7 — schemaVersion guard, skip `manifest.deleted`, `triggerSync` + 3 retries × 2 s, `validateProjectShape`, newer-`updatedAt` wins, base64 photos written to `Documents/photos/<projectId>/<photoId>.jpg` (drop unreadable photos), library merge by id, bypass `maxProjects()`, set `restorePromptHandled` and mark restored items uploaded; return `{ restored, failed }`
- [x] 4.2 Restore prompt in `app/index.tsx` (per design.md "Restore prompt and settings UI"): when `hasSeenCarousel`, no local projects, toggle on, iCloud available, `restorePromptHandled` false, and `hasRestorableBackup()` returns ≥ 1 project, show `Alert` with count and date; "Restore" shows a loading overlay then runs restore; "Not Now" sets `restorePromptHandled = true`; add `backup.*` strings to `en.ts`, `ja.ts`, `zh-TW.ts`
- [x] 4.3 Delete iCloud backup: implement `deleteBackup()` in `src/services/icloudBackupService.ts` per design.md steps 1–4 (set toggle off first, await in-flight flush, recursively delete `/projects` and `/photos`, delete `/library.json` and `/manifest.json` ignoring not-found, remove `entitlements.v1`, reset `BackupState` keeping `restorePromptHandled = true`); never modify local project data
- [x] 4.4 Backup settings section in `app/settings.tsx` (using existing section styles, `StyleSheet.create`, ≥ 44pt targets): toggle, last backup time / failed status, "Back Up Now" (`flushBackup({ force: true })`), "Restore from iCloud" with `ConfirmDialog` then result alert; "Delete iCloud Backup" with `ConfirmDialog` calling `deleteBackup()`; iCloud unavailable handling shows sign-in message and disables all three actions, updating live via `subscribeToCloudAvailability`; add strings to all three locales

## 5. Verification

- [ ] 5.1 [手動驗證] Build a new EAS development build from the branch (`eas build --profile development --platform ios`), install it on a device signed into iCloud, run `npx expo start --tunnel`, then confirm:
  - Create 2 projects with photos + 1 custom stitch, wait 5 s → Settings shows a last backup time
  - Tap "Next Stitch" rapidly → backup time changes only after taps stop (Debounced backup flush)
  - Delete one project, wait for flush → after reinstall it is not offered/restored (Deletion tombstones)
  - Delete app, reinstall, finish carousel → Restore prompt shows correct count; Restore brings back projects, progress, photos, custom stitch
  - Reinstall again, tap "Not Now", create a project → Settings "Restore from iCloud" still restores the earlier projects (Cloud data preservation)
  - Redeem a voucher + ad-unlock a slot, reinstall → premium and slot count restored (Entitlement backup)
  - Sign out of iCloud → Settings shows unavailable message, no crashes (iCloud unavailable handling)
  - Files app → no Stitchie backup folder visible
  - Delete one photo from a project, wait 5 s → Metro log shows its `.b64` path deleted (Removed photo cleanup)
  - Settings → Delete iCloud Backup → confirm → toggle is off and projects remain; delete and reinstall the development build → no restore prompt (Delete iCloud backup)
