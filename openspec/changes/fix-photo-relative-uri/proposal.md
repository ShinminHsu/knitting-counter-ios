## Problem

Project photos disappear after the app's container path changes. This happens on reinstall, when switching between TestFlight and App Store builds ([expo/expo#4261](https://github.com/expo/expo/issues/4261)), on each install ([expo/expo#32788](https://github.com/expo/expo/issues/32788)), and after `npx expo run:ios` rebuilds on a device. The photo files are still on disk, but the app cannot find them, and the project detail screen then permanently deletes their metadata.

## Root Cause

- `savePhoto` (`src/services/photoService.ts:26`) stores `ProjectPhoto.uri` as an absolute path: `${FileSystem.documentDirectory}photos/<projectId>/<photoId>.jpg`. `documentDirectory` contains the container UUID, which iOS may change.
- Every consumer uses the stored absolute path directly: `src/components/PhotoGallery.tsx:73`, `src/components/PhotoViewer.tsx:69`, `app/index.tsx:68`, `photoFileExists`, `deletePhoto`.
- The orphan cleanup in `app/project/[id]/index.tsx:295-306` (commit `d2bc758`) treats "file not found at stored path" as "file deleted" and removes the metadata, turning a path mismatch into permanent data loss.

This is also a prerequisite for `icloud-backup-restore`: restored photos land in a new container and would be wiped by the same cleanup.

## Proposed Solution

- Store `ProjectPhoto.uri` as a path relative to the Documents directory: `photos/<projectId>/<photoId>.jpg`.
- Add `resolvePhotoUri(uri)` that builds the absolute path from the current `documentDirectory`; it also resolves legacy absolute paths by extracting the `photos/...` suffix.
- Use `resolvePhotoUri` everywhere a photo path is read, checked, or deleted.
- Add persist `version: 1` with a `migrate` to `useProjectStore` that converts existing absolute photo paths to relative paths.
- The orphan cleanup keeps running but checks the resolved path, so metadata is only removed when the file is truly missing.

## Non-Goals (optional)

(covered in design.md)

## Success Criteria

- A photo added on the current `dev` build still displays after installing this branch's build over it and after a second rebuild.
- Newly saved photos persist `uri` values that start with `photos/` and contain no `file://` or container path.
- Deleting a photo removes its file from `Documents/photos/<projectId>/`.
- A photo whose file genuinely does not exist is still removed from the gallery on project detail mount.
- `npx tsc --noEmit` passes.

## Impact

- Affected specs: `photo-storage` (new)
- Affected code:
  - `src/utils/photoPathUtils.ts` (new), `src/utils/index.ts`
  - `src/services/photoService.ts`
  - `src/stores/useProjectStore.ts`
  - `src/types/index.ts` (doc comment on `ProjectPhoto.uri`)
  - `src/components/PhotoGallery.tsx`
  - `src/components/PhotoViewer.tsx`
  - `app/index.tsx`
  - `app/project/[id]/index.tsx`
