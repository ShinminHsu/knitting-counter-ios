## Summary

Add `expo-dev-client` and a documented EAS development build workflow so the primary dev machine can test on physical iPhone/iPad without running Xcode locally.

## Motivation

- The primary dev machine (MacBookPro14,2, macOS 13.7.8, Xcode 13.1) cannot run `npx expo run:ios`: Expo SDK 54 / React Native 0.81 need Xcode 16, which needs macOS 14, and this hardware tops out at macOS 13.
- Every device test today means pushing a branch and building on a second computer, which slows down small JS-only changes such as `fix-photo-relative-uri`.
- `eas.json` already defines a `development` profile (`developmentClient: true`, `distribution: internal`), but `expo-dev-client` is not installed, so the profile cannot be used.
- The EAS free plan (15 iOS builds/month) covers a development build that only needs rebuilding when native code changes; JS changes load from Metro running on this machine, which only needs Node.

## Proposed Solution

- Install `expo-dev-client` with `npx expo install` so its version matches Expo SDK 54.
- Add `.nvmrc` pinning Node 20, because this machine's default `node` is v14 while React Native 0.81 requires Node ≥ 20.19.4.
- Write `docs/dev-client.md`: one-time setup (EAS CLI, device registration, development build, install, iOS Developer Mode), the daily loop (`npx expo start`), when a rebuild is required, testing notes for ads / ATT / IAP sandbox / DEV Tools / analytics env vars, and build quota limits.
- Update `CLAUDE.md` "開發注意事項" and "測試流程" so future work uses the development build for JS changes and keeps the second computer as a fallback.
- Confirm `expo-dev-client` does not ship its launcher in release builds before relying on it.

## Non-Goals (optional)

(covered in design.md)

## Alternatives Considered (optional)

- **Expo Go**: cannot load this app — it uses native modules not bundled in Expo Go (`react-native-mmkv` via Nitro, `react-native-google-mobile-ads`, `react-native-iap`).
- **TestFlight for every test**: works without a second computer but costs a cloud build plus App Store processing per change and burns the monthly build quota.
- **Upgrading this Mac to macOS 14 via OpenCore Legacy Patcher**: unsupported by Apple, risky for a primary machine.

## Impact

- Affected specs: `dev-build-workflow` (new)
- Affected code:
  - `package.json`, `package-lock.json` (new dependency `expo-dev-client`)
  - `app.json` (only if `npx expo install` adds the `expo-dev-client` plugin entry)
  - `.nvmrc` (new)
  - `docs/dev-client.md` (new)
  - `CLAUDE.md`
- Native change: requires one EAS development build (`eas build --profile development --platform ios`). Production and staging profiles are unchanged.
