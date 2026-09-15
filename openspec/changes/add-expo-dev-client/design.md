## Context

- Primary dev machine: MacBookPro14,2, macOS 13.7.8, Xcode 13.1. Cannot build iOS for Expo SDK 54 (`expo@54.0.33`, `react-native@0.81.5`).
- Node on this machine: default `node` on PATH is v14.16.0; nvm has v20.20.0 with `default` alias `20`. `react-native` declares `"node": ">= 20.19.4"`.
- `eas.json` profiles: `development` (`developmentClient: true`, `distribution: internal`), `preview`, `staging` (`EXPO_PUBLIC_USE_TEST_ADS=true`), `production`. EAS CLI is logged in as `mhsu` (matches `app.json` `owner`); `eas-cli` is not installed on PATH.
- `/ios` and `/android` are gitignored, so EAS runs prebuild (CNG) on its servers.
- Dev-mode behaviour already in code: `src/constants/adUnits.ts` uses Google test ad IDs when `__DEV__`; `showRewardedAd` in `src/services/adsService.ts` skips the ad and grants the reward when `__DEV__`; `app/settings.tsx` shows a "DEV Tools" section (toggle premium, etc.) when `__DEV__`.
- `.env` is gitignored; only `.env.example` is committed (GA measurement ID / API secret are `EXPO_PUBLIC_*` vars).
- EAS free plan: 15 iOS builds/month, low-priority queue, 45-minute timeout. Ad hoc provisioning: 100 iPhones per Apple Developer account per year; only devices registered at build time can install.

## Goals / Non-Goals

**Goals:**

- Test JS changes on a physical iPhone/iPad from this machine with no local Xcode.
- A written, repeatable setup and daily workflow.
- Keep release builds identical in behaviour to today.

**Non-Goals:**

- Upgrading macOS or Xcode on this machine.
- Android development builds.
- iOS Simulator builds (cannot run on Xcode 13.1 for this SDK).
- CI automation of development builds.
- Changing ad, IAP, ATT, or analytics behaviour.
- Removing the second-computer `npx expo run:ios` workflow.

## Decisions

### Install expo-dev-client via expo install

Use `npx expo install expo-dev-client` (under Node 20) so the version is resolved against SDK 54 and any config plugin entry is added automatically. No `launchMode` or `defaultLaunchURL` customization; defaults show the dev launcher, which lists Metro servers on the local network.

Alternative: `npm install expo-dev-client@latest` — rejected, may pick a version for a newer SDK.

### Release builds exclude dev launcher

Before relying on the dependency, inspect `node_modules/expo-dev-launcher/expo-module.config.json` and `node_modules/expo-dev-menu/expo-module.config.json` (and their podspecs) for debug-only configuration. The Expo docs describe dev-client builds as debug builds but do not explicitly state release exclusion. If the modules are not debug-only, pause the change and decide whether production builds need a separate profile setting.

### Pin Node with .nvmrc

Add `.nvmrc` containing `20`. On this machine `nvm use` then selects v20.20.0, satisfying `>= 20.19.4`. Using the major version rather than an exact patch keeps the second computer compatible if it has a different Node 20 patch.

### Register devices before building

Register every test device with `eas device:create` (URL/QR flow on the device) before running `eas build --profile development --platform ios`, because the ad hoc provisioning profile only allow-lists devices registered at build time. Adding a device later requires `eas build:resign` or a new build. After installing, enable iOS Developer Mode (Settings → Privacy & Security → Developer Mode, then restart).

### Daily loop with Metro on this Mac

Daily work: `nvm use` → `npx expo start` on this machine → open the Stitchie development build on the device (same Wi-Fi) and pick the server; `npx expo start --tunnel` when the phone cannot reach the Mac on the LAN. JS and asset changes reload without rebuilding.

A new development build is required when: adding/updating a package with native code (e.g. `react-native-cloud-storage` for `icloud-backup-restore`), changing `app.json` plugins/native config, upgrading the Expo SDK, or registering a new device.

### Setup guide in docs/dev-client.md

`docs/dev-client.md` (Traditional Chinese, matching `CLAUDE.md`) is the single human-readable reference with these sections:

1. 前置條件 — paid Apple Developer account, EAS account `mhsu`, Node 20 via nvm.
2. 一次性設定 — `npm install --global eas-cli` (under Node 20), `eas login`, `eas device:create` for each iPhone/iPad, `eas build --profile development --platform ios`, install via QR/URL, enable Developer Mode.
3. 日常開發 — the Metro loop and `--tunnel` fallback.
4. 什麼時候要重新 build — the four triggers above.
5. 測試注意事項 — test ads automatic in dev; rewarded ads skipped with reward granted directly (verify real rewarded flow only on staging/TestFlight); DEV Tools in Settings; ATT prompt appears once per install (reinstall to see it again); IAP uses the StoreKit sandbox — create a Sandbox Apple Account in App Store Connect → Users and Access → Sandbox, sign in on device (iOS 18+: Settings → Developer → Sandbox Apple Account; earlier: Settings → App Store → Sandbox Account); analytics env vars come from `.env` copied from `.env.example`, with the observed behaviour of `analyticsService` when they are missing.
6. 額度 — 15 iOS builds/month shared with TestFlight builds, low-priority queue, 45-minute timeout, 100 devices/year.

### Keep other-machine workflow as fallback

`CLAUDE.md` changes:

- "開發注意事項": keep the statement that this machine cannot run `npx expo run:ios`; add that it can run `npx expo start` against the EAS development build; list rebuild triggers; link `docs/dev-client.md`.
- "測試流程": JS-only changes → development build + Metro on this machine; native changes → new EAS development build (or second computer `npx expo run:ios`); release → EAS Build + TestFlight. The branch/verification/merge rules stay unchanged.

## Risks / Trade-offs

- [Dev launcher included in release builds] → verified: `expo-dev-launcher` and `expo-dev-menu` (installed with `expo-dev-client@~6.0.21`) both declare `"apple": { "debugOnly": true }` in `expo-module.config.json`, which `expo-modules-autolinking` (`appleDebugOnly()`) uses to link them into the Debug configuration only; `expo-dev-launcher.podspec` also scopes its flags to `[config=*Debug*]`. Production and staging (Release) builds exclude them.
- [Pre-existing outdated dependencies] → `npx expo install --check` reports 8 packages behind SDK 54's expected versions (`expo-constants`, `expo-crypto`, `expo-file-system`, `expo-image-picker`, `expo-linking`, `expo-localization`, `expo-router`, `react-native-worklets` 0.7.4 vs 0.5.1). None involve `expo-dev-client`; they predate this change and are out of scope.
- [Free-plan queue delays] → development builds are rare (native changes only); upgrade to Starter ($19/month) only if waiting becomes a blocker.
- [Build quota shared with TestFlight] → documented; one development build per native change.
- [Phone cannot reach Metro on restrictive Wi-Fi] → `--tunnel` fallback documented.
- [JS from a branch whose native deps differ from the installed build crashes] → documented rule: rebuild whenever native dependencies differ from the installed development build.
- [Local runs without `.env` misreport analytics] → documented in testing notes.
