## 1. Setup

- [x] 1.1 Create branch `feat/add-expo-dev-client` from `dev`
- [x] 1.2 Install expo-dev-client via expo install (Development client dependency): run `nvm use 20 && npx expo install expo-dev-client`; confirm `package.json` and `package-lock.json` list the SDK 54-compatible version, note whether `app.json` plugins changed, and run `npx expo install --check` with no mismatch reported
- [x] 1.3 Release builds exclude dev launcher: inspect `expo-module.config.json` and podspec of `node_modules/expo-dev-launcher` and `node_modules/expo-dev-menu` for debug-only linking; record the result under Risks in design.md; if either is not debug-only, pause and report
- [x] 1.4 Pin Node with .nvmrc (Node version file): add `.nvmrc` containing `20` and confirm `nvm use` selects v20.20.0

## 2. Documentation

- [x] 2.1 Setup guide in docs/dev-client.md (Development build guide): read `src/services/analyticsService.ts` to see what happens when `EXPO_PUBLIC_GA_MEASUREMENT_ID` is empty, then write the six sections defined in design.md — 前置條件, 一次性設定 (Register devices before building, Developer Mode), 日常開發 (Daily loop with Metro on this Mac, `--tunnel`), 什麼時候要重新 build, 測試注意事項 (test ads, rewarded ads skipped in `__DEV__`, DEV Tools, ATT, IAP Sandbox Apple Account paths, `.env` analytics behaviour), 額度 (15 iOS builds/month, 45-minute timeout, 100 devices/year)
- [x] 2.2 Keep other-machine workflow as fallback — Project instructions update: edit only the "開發注意事項" and "測試流程" sections of `CLAUDE.md` as described in design.md, linking `docs/dev-client.md`; leave "Git 工作流程" and "Commit 規範" untouched

## 3. Verification

- [x] 3.1 Commit on `feat/add-expo-dev-client` and ask the user before pushing to GitHub
- [ ] 3.2 [手動驗證] Following `docs/dev-client.md`: `eas device:create` for the iPhone (and iPad), `eas build --profile development --platform ios`, install via QR/URL, enable Developer Mode; on this Mac `nvm use && npx expo start`; confirm (a) the app loads from Metro, (b) editing a visible string reloads on device, (c) the banner shows a Google test ad, (d) Settings shows DEV Tools, (e) launch and ATT prompt do not crash
