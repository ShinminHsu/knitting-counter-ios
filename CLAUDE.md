<!-- SPECTRA:START v1.0.1 -->

# Spectra Instructions

This project uses Spectra for Spec-Driven Development(SDD). Specs live in `openspec/specs/`, change proposals in `openspec/changes/`.

## Use `/spectra:*` skills when:

- A discussion needs structure before coding → `/spectra:discuss`
- User wants to plan, propose, or design a change → `/spectra:propose`
- Tasks are ready to implement → `/spectra:apply`
- There's an in-progress change to continue → `/spectra:ingest`
- User asks about specs or how something works → `/spectra:ask`
- Implementation is done → `/spectra:archive`

## Workflow

discuss? → propose → apply ⇄ ingest → archive

- `discuss` is optional — skip if requirements are clear
- Requirements change mid-work? Plan mode → `ingest` → resume `apply`

## Parked Changes

Changes can be parked（暫存）— temporarily moved out of `openspec/changes/`. Parked changes won't appear in `spectra list` but can be found with `spectra list --parked`. To restore: `spectra unpark <name>`. The `/spectra:apply` and `/spectra:ingest` skills handle parked changes automatically.

<!-- SPECTRA:END -->

# Stitchie iOS App

## 專案概述
React Native + Expo Router 的 iOS 編織計數器 App。

## 技術棧
- React Native + Expo Router (file-based routing)
- TypeScript
- Zustand + MMKV (狀態管理與持久化)
- NativeWind v4 (樣式，但實際使用 StyleSheet.create，不用 className)
- react-native-google-mobile-ads (廣告)
- expo-tracking-transparency (ATT)

## 樣式規範
- **主色**：`#D97398`（粉紅）
- **深主色**（文字用）：`#C4527F`
- **背景色**：`#faf5f0`
- **絕對不用 NativeWind className**，一律用 `StyleSheet.create`
- 最小觸控面積：44x44pt

## Git 工作流程
- **開發新功能時**，每個 task 都要從 `dev` 開一個新的 feature branch
  - 命名格式：`feat/task-名稱`
- 功能完成後，**等用戶驗證**，驗證成功才可以 merge 到 `dev`
- 用戶確認 `dev` 上都沒問題，才可以 merge 到 `main`
- Branch 結構：`main` ← `dev` ← `feat/xxx`

## Commit 規範
- 使用英文
- 使用 conventional commit 格式（feat:, fix:, refactor: 等）
- 不包含 "Co-Authored-By: Claude" 等 AI 相關字詞

## 開發注意事項
- App 是 debug build，執行前需先啟動 Metro：`npx expo start`
- 修改 native 設定（app.json plugins、新增 native 套件）後需重新 `npx expo prebuild --platform ios --clean` 並 rebuild
- `ios/` 目錄由 prebuild 產生，不需 commit

## 功能說明
- 「從 0 還是 1 開始」是在**建立織圖時**詢問，不是建立專案時
