## Context

- `ProjectPhoto.uri` holds an absolute `file://…/Application/<UUID>/Documents/photos/<projectId>/<photoId>.jpg` path written by `savePhoto` (`src/services/photoService.ts`).
- iOS may change the container UUID on reinstall, TestFlight ↔ App Store switches, and device rebuilds. Documents contents move with the container, but stored absolute paths go stale.
- Photos are persisted inside the `projects` MMKV key via Zustand `persist` in `src/stores/useProjectStore.ts`, which declares no `version` (implicitly 0).
- Stores import from `src/utils`, not `src/services`; `photoService.ts` imports `expo-file-system/legacy`.
- Exported project JSON with `includePhotos` carries photo metadata only (no binaries).

## Goals / Non-Goals

**Goals:**

- Photos keep displaying across container path changes.
- Existing installs recover photos whose metadata still exists.
- Orphan cleanup only removes metadata for truly missing files.

**Non-Goals:**

- Recovering metadata already deleted by the old cleanup (files may remain on disk, but type/cover/createdAt are gone).
- Deleting photo files when a project is deleted (`deleteProjectPhotos` is currently unused; separate issue).
- Exporting or importing photo binaries.
- `Chart.referenceImageUri` (no UI writes it).
- Renaming the `uri` field.

## Decisions

### Relative photo path format

`ProjectPhoto.uri` stores `photos/<projectId>/<photoId>.jpg`: no scheme, no leading slash, relative to `FileSystem.documentDirectory`. The field name stays `uri` to avoid touching types, export format, and every call site; the doc comment in `src/types/index.ts` is updated to say it is relative.

New pure module `src/utils/photoPathUtils.ts` (no Expo imports, so the store migration can use it):

- `PHOTO_DIR = 'photos/'`
- `isRelativePhotoPath(uri: string): boolean` — true when `uri` starts with `photos/`.
- `toRelativePhotoPath(uri: string): string | null` — returns `uri` if already relative; otherwise matches `/\/Documents\/(photos\/.+)$/` against the absolute path and returns the capture group; returns `null` when neither applies.

Alternative: keep absolute paths and rewrite them on every launch by swapping the container prefix. Rejected: still stores a volatile value, and the iCloud backup would carry device-specific paths.

### resolvePhotoUri helper

`resolvePhotoUri(uri: string): string` in `src/services/photoService.ts`:

- `toRelativePhotoPath(uri)` non-null → `${FileSystem.documentDirectory}${relative}`.
- `null` → return `uri` unchanged (unknown format; let the `Image` or file check fail naturally).

Used by `PhotoGallery.tsx`, `PhotoViewer.tsx`, `ProjectCard` in `app/index.tsx`, `photoFileExists`, and `deletePhoto`. Resolving legacy absolute paths here also covers the window before migration runs and any imported metadata.

`savePhoto` writes to `${documentDirectory}photos/<projectId>/<photoId>.jpg` as today but returns `uri: 'photos/<projectId>/<photoId>.jpg'`. The size check keeps using the absolute path.

### Persist migration to version 1

`useProjectStore` persist options gain `version: 1` and:

```
migrate: (persisted, version) => version < 1 ? migrateProjectsToV1(persisted) : persisted
```

`migrateProjectsToV1` (in `src/utils/photoPathUtils.ts`) maps every project's `photos`, replacing `uri` with `toRelativePhotoPath(uri) ?? uri`. It tolerates a missing `projects` array or missing `photos` arrays by returning them unchanged. Zustand runs `migrate` once when the stored version (0) differs, then persists version 1.

### Orphan cleanup uses resolved path

The cleanup effect in `app/project/[id]/index.tsx` is kept: `photoFileExists` now checks `resolvePhotoUri(photo.uri)`, so metadata is removed only when the file is absent at the current container path. The misleading "files deleted after app rebuild" comment is replaced with one describing the actual condition.

## Risks / Trade-offs

- [Migration throws on unexpected persisted shape] → migration is defensive (optional chaining, unchanged passthrough), and `resolvePhotoUri` still handles absolute paths if migration is skipped.
- [Photos stored outside `Documents/photos/`] → none are written by the app; `toRelativePhotoPath` returns `null` and the value is kept as-is.
- [Cannot run iOS on this machine] → `npx tsc --noEmit` here; behavioural verification on the other machine by installing this build over the current `dev` build.
