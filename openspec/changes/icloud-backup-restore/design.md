## Context

- All projects are persisted as one JSON array under MMKV key `projects` via Zustand `persist` (`src/stores/useProjectStore.ts`). Custom stitches and templates use their own keys. No store declares a persist `version`.
- Every stitch tap calls `useProjectStore.getState().updateChart(...)` (`src/stores/useProgressStore.ts`), rewriting the whole array. Every mutation already bumps `Project.updatedAt` and `Chart.updatedAt`.
- Photos are compressed JPEGs (≤ 1 MB) under `Documents/photos/<projectId>/<photoId>.jpg` (`src/services/photoService.ts`).
- `deleteProject` filters the project out with no record of the deletion.
- Entitlements (`src/stores/useEntitlementStore.ts`): IAP premium is recoverable via `restorePurchases()`; voucher premium, ad-unlocked project/photo slots, template unlock, and stitch category unlocks exist only locally. Vouchers are validated by SHA-256 against `VALID_VOUCHER_HASHES` (`src/services/voucherService.ts`).
- Export is premium-gated (`canExport`). Backup files must not become a way to obtain shareable JSON.
- This dev machine cannot run `npx expo run:ios`; native verification uses an EAS development build (`docs/dev-client.md`) on physical devices signed into iCloud, with JS served via `npx expo start --tunnel`. Adding `react-native-cloud-storage` requires a new development build.
- Prerequisite: photo URIs are stored relative to the Documents directory (separate fix change).

## Goals / Non-Goals

**Goals:**

- Survive app deletion + reinstall on the same Apple ID with projects, photos, custom stitches, templates, voucher premium, and ad unlocks intact.
- Zero perceptible cost on the stitch-tap hot path.
- File layout and deletion semantics that a future cross-device sync phase can reuse without migrating the cloud format.

**Non-Goals:**

- Live cross-device sync or change listeners on the iCloud container (future premium phase).
- Field-level merge or CloudKit. Conflict unit is the whole project.
- Backing up `Chart.referenceImageUri` files — no UI currently writes this field.
- Backing up settings, language, onboarding state, analytics IDs, or ATT state.
- Android / Google Drive backup.
- Encrypting backup files beyond what iCloud provides.

## Decisions

### Use react-native-cloud-storage

Use `react-native-cloud-storage@^3` for both iCloud Documents file access (`CloudStorage`) and the iCloud key-value store (`CloudKVStorage`). Configure its Expo plugin in `app.json` with `enableKeyValueStorage: true`; container id defaults to `iCloud.com.stitchie.app`.

Alternatives: `react-native-cloud-store` (last published 2024-04, unmaintained); `expo-icloud-storage` (key-value only, 3 commits); CloudKit modules `expo-cloudkit` / `react-native-icloud-kit` (young, and CloudKit record modelling is unnecessary for a backup). One maintained library (3.1.0, 2026-08) covering both needs keeps native surface minimal.

### Hidden AppData scope

All backup files use `CloudStorageScope.AppData`, which is not visible in the Files app. This keeps backup JSON out of the user's reach so it cannot bypass the premium-gated export, and avoids users accidentally deleting or editing backup files.

### Per-project backup files

Layout inside the AppData scope:

```
/manifest.json                      BackupManifest
/projects/<projectId>.json          BackupProjectFile
/photos/<projectId>/<photoId>.b64   base64 JPEG
/library.json                       BackupLibraryFile
```

- `BackupManifest`: `{ schemaVersion: 1, updatedAt: ISO, projects: Record<projectId, updatedAt>, deleted: Record<projectId, deletedAt> }`
- `BackupProjectFile`: `{ schemaVersion: 1, savedAt: ISO, project: Project }` (full `Project`, including `sessions` and `photos` metadata)
- `BackupLibraryFile`: `{ schemaVersion: 1, savedAt: ISO, customStitches: CustomStitchPattern[], templates: StitchGroupTemplate[] }`

The manifest is written last in each flush so a partially failed flush never advertises a project file that was not written. Project shape validation is extracted from `src/utils/importExportHelpers.ts` into a shared `validateProjectShape` used by both import and restore.

Alternative: one snapshot file containing everything. Rejected because every flush would rewrite all projects, and phase 2 sync would need a format migration.

### Photos as base64 text files

`CloudStorage.readFile` / `writeFile` operate on strings. Photos are read locally as base64 (`expo-file-system`) and written with `writeFile`; restore reads the string and writes it back to `Documents/photos/<projectId>/<photoId>.jpg` with base64 encoding. Photo files are immutable (id-addressed), so each photo is uploaded once; uploaded photo ids are tracked locally.

Alternative: `uploadFile` for binary upload plus `downloadFile` for restore. Rejected because `downloadFile` is deprecated in v3 and does not guarantee a local copy at a chosen path. Cost: ~33% size overhead on ≤ 1 MB images, acceptable.

### Debounced flush

`icloudBackupService` subscribes to `useProjectStore`, `useCustomStitchStore`, and `useTemplateStore`. Any change schedules a flush 5 seconds after the last change. A flush also runs immediately when `AppState` becomes `background` (registered in `app/_layout.tsx`) and when the tracking screen unmounts (`app/project/[id]/tracking.tsx`).

Flush is single-flight: if a flush is running, one follow-up flush is queued. Dirty detection compares each project's `updatedAt` with the last uploaded value stored in MMKV key `backupState` (`{ uploadedProjects: Record<id, updatedAt>, uploadedPhotos: Record<projectId, photoId[]>, libraryHash: string | null, lastBackupAt: string | null, lastError: string | null, restorePromptHandled: boolean }`). Only dirty projects, new photos, and a changed library are written. Custom stitches and templates have no `updatedAt`, so the library counts as changed when the SHA-256 (`js-sha256`) of `JSON.stringify({ customStitches, templates })` differs from `libraryHash`. For each dirty project, photo ids in `uploadedPhotos[projectId]` that are no longer in the project's `photos` array have their `/photos/<projectId>/<photoId>.b64` file deleted and are removed from `uploadedPhotos` (removed photo cleanup), so deleting a single photo does not leave orphaned files in the user's iCloud storage. A project or photo is marked uploaded only after its write succeeds, so an interrupted background flush retries next time.

Flush is a no-op when the backup toggle is off, iCloud is unavailable, or the restore decision is pending (see Cloud data preservation below).

### Tombstones for deletion

`useProjectStore` gains `deletedProjects: Record<projectId, deletedAt>`. `deleteProject` adds an entry. A flush deletes `/projects/<id>.json` and `/photos/<id>/` for each tombstone, moves the id from `manifest.projects` to `manifest.deleted`, and then clears the local tombstone. Restore skips any project id present in `manifest.deleted`.

**Cloud data preservation rule**: a flush only removes cloud files for ids with a local tombstone. A project missing locally but present in the manifest is never deleted from the cloud. This is what makes a fresh install with empty local data safe.

Every flush reads the cloud manifest and merges into it (it never rebuilds the manifest from local data alone), and it re-writes entries for every locally uploaded project, so a previously failed manifest write heals itself.

Restore decision gate: the decision is **pending** while `restorePromptHandled` is false and the cloud manifest lists at least one non-deleted project id that is not in `BackupState.uploadedProjects`. When no such project exists, the flush sets `restorePromptHandled = true` and proceeds — this is what lets existing users (no cloud backup yet) keep backing up after their first flush. While pending:

- no local projects → the flush is skipped entirely (waiting for the restore prompt);
- local projects exist (the user created projects before the prompt could appear) → projects are backed up as usual, but `/library.json` is not written, so an empty or partial local library cannot overwrite the cloud copy. Library backup resumes once the decision is made (prompt, Settings restore, or Delete iCloud backup).

Skipping every flush in the second case was rejected: the prompt only appears when there are no local projects, so the decision would never be made and backups would stop permanently.

### Entitlements in key-value store

Key `entitlements.v1` in `CloudKVStorage` holds `{ voucherCode: string | null, adUnlockedProjectCount, adUnlockedPhotoCount, templateUnlocked, unlockedStitchCategories }`. `isPremium` and `premiumSource: 'iap'` are never written — IAP is restored through `restorePurchases()`.

- Write: whenever these fields change locally (store subscription), merged with the current cloud value.
- Merge (both directions): counts take `max`, booleans take logical OR, `voucherCode` takes the non-null value.
- Read: on app launch when iCloud is available. A cloud `voucherCode` is re-validated through the same SHA-256 check as `redeemVoucher` before calling `setPremium('voucher', code)`; invalid codes are ignored.
- `resetPremium` (DEV tools) does not propagate to the cloud.

### Restore merge by updatedAt

`restoreFromBackup()`:

1. Read and validate `manifest.json`. If `schemaVersion` is greater than the app supports, abort with an "update the app" message and do not write anything.
2. For each id in `manifest.projects` not in `manifest.deleted`: read and validate the project file (`triggerSync` then `readFile`, retrying up to 3 times with 2-second waits if the file is not yet downloaded). Skip invalid files and count them as failures.
3. If the id does not exist locally, add it. If it exists, keep whichever copy has the newer `updatedAt`.
4. Write each restored project's photos from `.b64` to local paths. A photo whose file fails to download is dropped from the restored project's `photos` array.
5. Merge `library.json` by id: add missing items; for ids present in both, keep the one with the newer `updatedAt` when both have it, otherwise keep local.
6. Restored projects are inserted directly through the store and do not check `maxProjects()`.
7. Set `restorePromptHandled = true` and mark restored projects and photos as uploaded in `backupState`.

The result reports restored count and failure count for the UI.

### Delete iCloud backup

Settings offers "Delete iCloud Backup" so users can reclaim iCloud storage without going to iOS Settings → [name] → iCloud → Manage Account Storage (which also works). After a `ConfirmDialog` warning that a reinstall will no longer be able to restore, `deleteBackup()`:

1. Sets `iCloudBackupEnabled` to `false` first so any queued flush becomes a no-op, then awaits the in-flight flush if one is running.
2. Deletes `/projects` and `/photos` (recursive `rmdir`), `/library.json`, and `/manifest.json` in the AppData scope, ignoring not-found errors.
3. Removes `entitlements.v1` from `CloudKVStorage`.
4. Resets `BackupState` (`uploadedProjects = {}`, `uploadedPhotos = {}`, `libraryHash = null`, `lastBackupAt = null`, `lastError = null`) and keeps `restorePromptHandled = true` so no restore prompt appears.

Local data is never touched. Turning the toggle back on performs a full upload on the next flush because `BackupState` is empty. The action is disabled when iCloud is unavailable; a deletion error leaves the toggle off and shows a failure message.

### Schema versioning

All backup files carry `schemaVersion: 1`. `useCustomStitchStore` and `useTemplateStore` persist configs get `version: 1` with an identity `migrate`, establishing a baseline for future migrations. `useProjectStore` is already at `version: 1` (photo path migration from fix-photo-relative-uri); the new `deletedProjects` field needs no version bump because persist shallow-merges it with the `{}` default.

### Restore prompt and settings UI

- Home screen (`app/index.tsx`): when `hasSeenCarousel` is true, local `projects.length === 0`, backup toggle on, iCloud available, `restorePromptHandled` is false, and the manifest lists ≥ 1 non-deleted project, show an `Alert` with the project count and manifest `updatedAt`: "Restore" runs restore with a loading state; "Not Now" sets `restorePromptHandled = true`.
- Settings (`app/settings.tsx`): new "iCloud Backup" section using the existing section styles — toggle (`useSettingsStore.iCloudBackupEnabled`, default true), last backup time, "Back Up Now" (forces a full flush), "Restore from iCloud" (confirmation dialog, then merge restore), "Delete iCloud Backup" (see Delete iCloud backup), and an unavailable message when `isCloudAvailable()` is false. Availability updates via `subscribeToCloudAvailability`.
- All strings in `en.ts`, `ja.ts`, `zh-TW.ts` under a new `backup` namespace. Styles use `StyleSheet.create`, primary `#D97398`, touch targets ≥ 44pt.

## Risks / Trade-offs

- [Files not yet downloaded on a fresh install] → `triggerSync` + bounded retry during restore; the prompt is also reachable later from Settings. Validate behaviour in the device spike.
- [iOS background time (~5 s) interrupts photo uploads] → per-item "uploaded" marking; remaining items retry on the next flush.
- [User not signed into iCloud or iCloud Drive disabled for Stitchie] → feature degrades to a visible "unavailable" state; no errors on the hot path.
- [Backup consumes user's iCloud quota] → photos are already ≤ 1 MB; free tier limits photo count. Surface write errors (quota exceeded) as a Settings status message, not an alert on every flush.
- [Orphaned photo files grow iCloud usage over time] → removed photo cleanup on every flush; users can wipe everything with Delete iCloud backup or from iOS Settings → iCloud → Manage Account Storage.
- [Empty local state overwrites cloud backup] → cloud data preservation rule plus the restore decision gate (skip flush with no local projects; skip library writes while pending).
- [User declines restore, then edits custom stitches or templates] → the next flush writes the local library over the cloud copy; the declined backup's projects remain restorable from Settings, but its library does not. Accepted: declining the restore is an explicit choice.
- [Whole-project last-writer-wins can drop edits if two devices edit the same project] → acceptable in phase 1 (single-device usage); phase 2 revisits.
- [Container entitlement misconfiguration only surfaces on device builds] → spike task before implementation; `iCloudContainerEnvironment` confirmed there.
- [Voucher code in iCloud KV readable on jailbroken devices] → same exposure as the local MMKV value today; codes are re-validated by hash.

## Migration Plan

1. Merge the prerequisite relative photo path fix to `dev`.
2. Enable the iCloud capability on App ID `com.stitchie.app` and create container `iCloud.com.stitchie.app` in Apple Developer; let EAS regenerate the provisioning profile.
3. Ship behind the Settings toggle (default on). Existing users' first flush uploads all projects.
4. Rollback: removing the plugin and service leaves local data untouched; cloud files remain inert in the hidden container.

## Open Questions

- Whether `iCloudContainerEnvironment: "Production"` works for development-signed builds or needs per-profile configuration — resolved by the device spike task.
