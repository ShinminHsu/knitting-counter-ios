## 1. Setup

- [x] 1.1 Create branch `feat/fix-photo-relative-uri` from `dev`

## 2. Path Utilities

- [x] 2.1 Relative photo path format: create `src/utils/photoPathUtils.ts` with `PHOTO_DIR`, `isRelativePhotoPath(uri)`, `toRelativePhotoPath(uri)` (regex `/\/Documents\/(photos\/.+)$/`), and `migrateProjectsToV1(persisted)`; export from `src/utils/index.ts`; update the `ProjectPhoto.uri` doc comment in `src/types/index.ts` to "relative to Documents directory"
- [x] 2.2 Add resolvePhotoUri helper to `src/services/photoService.ts` (Photo path resolution); make `photoFileExists` and `deletePhoto` use it; change `savePhoto` to return the Relative photo path `photos/<projectId>/<photoId>.jpg` while still writing and size-checking the absolute path; export `resolvePhotoUri` from `src/services/index.ts`

## 3. Consumers & Migration

- [x] 3.1 Replace `photo.uri` / `item.uri` / `coverPhoto.uri` in `<Image source>` with `resolvePhotoUri(...)` in `src/components/PhotoGallery.tsx`, `src/components/PhotoViewer.tsx`, and `ProjectCard` in `app/index.tsx`
- [x] 3.2 Persist migration to version 1 (Legacy photo path migration): add `version: 1` and `migrate: (persisted, version) => version < 1 ? migrateProjectsToV1(persisted) : persisted` to the `persist` options in `src/stores/useProjectStore.ts`
- [x] 3.3 Orphan cleanup uses resolved path (Orphaned photo cleanup): in `app/project/[id]/index.tsx` keep the cleanup effect (it calls `photoFileExists`, now resolved) and replace the "files deleted after app rebuild" comment with "remove metadata only when the file is missing at the resolved path"

## 4. Verification

- [x] 4.1 Run `npx tsc --noEmit` and confirm no new type errors in the touched files
- [ ] 4.2 [手動驗證] Push the branch to GitHub; on the other machine: (a) check out current `dev`, `npx expo run:ios`, add 2 photos to a project and set one as cover; (b) check out `feat/fix-photo-relative-uri`, `npx expo run:ios` over the same install → both photos show on the home card, gallery, and viewer; (c) rebuild once more → photos still show; (d) add a new photo and delete an old one → gallery updates correctly
