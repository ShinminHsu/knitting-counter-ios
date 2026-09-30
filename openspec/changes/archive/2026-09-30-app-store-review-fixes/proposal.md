## Problem

App Store review rejected the app with two violations:

1. **Guideline 5.1.1(ii)** — Camera and photo library purpose strings are too generic; Apple requires specific descriptions with examples of how the data will be used.

2. **Guideline 2.1** — The ATT (App Tracking Transparency) permission request did not appear during review on iOS 26.4. Root cause: `initializeAdMob()` is called before ATT on the first launch, and ATT is deferred to the second launch (`count >= 2`). This means AdMob may collect tracking data before the user is ever asked for permission, violating Apple's requirement that ATT must appear before any tracking data is collected.

## Root Cause

**Purpose strings**: `app.json` `infoPlist` only contains `ITSAppUsesNonExemptEncryption`. The camera and photo library usage descriptions are either absent or generated as generic defaults by the Expo plugin, which Apple rejects.

**ATT timing**: `_layout.tsx` calls `initializeAdMob()` unconditionally on every launch, then only calls `requestATTIfNeeded()` when `count >= 2`. On launch 1, AdMob initializes without ATT permission. On launch 2, ATT is shown but AdMob has already run. Additionally, if `requestTrackingPermissionsAsync()` throws (e.g., on a new OS version), the catch block silently marks `ATT_REQUESTED = true`, permanently suppressing future prompts.

## Proposed Solution

1. Add explicit `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription` to `app.json` `infoPlist` with specific descriptions explaining the photo gallery feature.

2. In `_layout.tsx`, await `requestATTIfNeeded()` before calling `initializeAdMob()`, and show ATT starting from the first launch (remove the `count >= 2` guard). Keep the "only once" MMKV flag so it never repeats.

## Non-Goals

- Changing the ad logic, IAP, or any other initialization behavior
- Changing ATT behavior on Android (not applicable)

## Success Criteria

- App Store review accepts the purpose strings as sufficiently descriptive
- On a fresh install (or after resetting tracking permissions), ATT prompt appears before any AdMob initialization
- ATT prompt appears only once per install (MMKV flag still prevents repetition)
- If ATT throws an error, the flag is NOT silently set to true (error should be logged, not suppressed into permanent skip)

## Impact

- Affected code:
  - `app.json` — add `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription` to `infoPlist`
  - `app/_layout.tsx` — await ATT before AdMob init, remove `count >= 2` guard
  - `src/services/adsService.ts` — fix error handling in `requestATTIfNeeded` to not permanently suppress on error
