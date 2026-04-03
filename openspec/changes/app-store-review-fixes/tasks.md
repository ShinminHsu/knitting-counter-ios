## 1. Purpose Strings

- [x] 1.1 Purpose strings are specific and descriptive — 在 `app.json` 的 `infoPlist` 加入 `NSCameraUsageDescription`：`"Stitchie uses your camera to take photos of your knitting projects and add them to your project's photo gallery."`
- [x] 1.2 在 `app.json` 的 `infoPlist` 加入 `NSPhotoLibraryUsageDescription`：`"Stitchie accesses your photo library so you can add photos of your knitting projects to your project's photo gallery."`

## 2. ATT Timing

- [x] 2.1 修改 `app/_layout.tsx` 的 `setupAds`：將 `requestATTIfNeeded()` 移到 `initializeAdMob()` 之前並 await，確保 ATT prompt appears before AdMob initialization
- [x] 2.2 修改 `app/_layout.tsx`：移除 `if (count >= 2)` 的 guard，讓 ATT 從第一次啟動就可以顯示（"only once" 的保護由 MMKV flag 負責）

## 3. ATT Error Handling

- [x] 3.1 修改 `src/services/adsService.ts` 的 `requestATTIfNeeded`：catch block 中不要設 `ATT_REQUESTED = true`，讓下次啟動可以重試；只有成功呼叫 `requestTrackingPermissionsAsync()` 後才設 flag（ATT error does not permanently suppress future prompts）

## 4. Verification

- [ ] 4.1 [手動驗證] 在另一台電腦 build + 安裝到實體裝置，確認：
  - [ ] 4.1.1 [手動] 全新安裝後第一次啟動，ATT prompt 出現在任何廣告顯示之前
  - [ ] 4.1.2 [手動] 第二次啟動，ATT prompt 不再出現
  - [ ] 4.1.3 [手動] 錄製螢幕（供 App Store Connect 附件用）：從全新安裝啟動 → ATT prompt 出現 → 用戶選擇 → 正常進入 app
