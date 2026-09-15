# 用 EAS 開發版在實體裝置上測試

這台開發機（2017 MacBook Pro、macOS 13、Xcode 13.1）無法執行 `npx expo run:ios`（Expo SDK 54 需要 Xcode 16）。
改用 EAS 在雲端 build「開發版」App 裝到手機，這台只負責跑 Metro 提供 JS。

## 1. 前置條件

- 付費 Apple Developer 帳號
- Expo 帳號 `mhsu`（`app.json` 的 `owner`）
- Node 20：這台預設的 `node` 是 v14。在專案目錄執行 `nvm use`（讀取 `.nvmrc`），確認 `node -v` ≥ v20.19.4

## 2. 一次性設定

1. 安裝 EAS CLI（在 Node 20 下）

   ```bash
   nvm use
   npm install --global eas-cli
   eas whoami   # 顯示 mhsu 表示已登入；否則執行 eas login
   ```

2. 註冊測試裝置 —— **一定要在 build 之前**

   ```bash
   eas device:create
   ```

   選「Website」，用 iPhone 打開產生的網址（或掃 QR code），照指示安裝描述檔完成註冊。iPad 要另外註冊一次。
   只有 build 當下已註冊的裝置才能安裝該 build。

3. Build 開發版

   ```bash
   eas build --profile development --platform ios
   ```

   第一次會要求登入 Apple 帳號，並自動產生簽署憑證與 provisioning profile。免費方案排隊可能要等幾十分鐘。

4. 安裝：build 完成後，用手機掃終端機或 EAS build 頁面上的 QR code，或直接打開安裝連結。

5. 開啟開發者模式（iOS 16 以上必要）：設定 → 隱私權與安全性 → 開發者模式 → 開啟，重新開機後再確認一次。

## 3. 日常開發

```bash
nvm use
npx expo start
```

- 手機和 Mac 連同一個 Wi-Fi，打開手機上的 Stitchie 開發版，在列表中選這台的伺服器（或掃終端機的 QR code）。
- 改 JS / TypeScript / 圖片 / 翻譯檔後存檔，手機會自動重新整理。搖晃手機可開啟開發選單。
- 手機連不到 Mac（例如公共 Wi-Fi 封鎖區網連線）時，改用 `npx expo start --tunnel`。
- 切換 branch 後直接重新整理即可，**前提是該 branch 的原生套件和手機上的開發版一致**（見下一節）。

## 4. 什麼時候要重新 build

以下任一情況，要重新執行 `eas build --profile development --platform ios` 並重裝：

- 新增或更新含原生程式碼的套件（例如 iCloud 備份要加的 `react-native-cloud-storage`）
- 修改 `app.json` 的 plugins 或 iOS 原生設定（權限說明、entitlements 等）
- 升級 Expo SDK
- 註冊了新裝置：重新 build，或用 `eas build:resign` 把現有 build 重新簽署

只改 JS、TypeScript、圖片、翻譯檔 → **不用**重新 build。

## 5. 測試注意事項

- **廣告**：開發模式（`__DEV__`）自動使用 Google 測試廣告 ID（`src/constants/adUnits.ts`），不會產生正式曝光。
- **獎勵廣告**：開發模式下 `showRewardedAd`（`src/services/adsService.ts`）會跳過廣告、直接給獎勵。要測真正的獎勵廣告流程，請用 `staging` profile 或 TestFlight。
- **DEV Tools**：設定頁最下方的「DEV Tools」只在開發模式出現，可直接切換 Premium 等狀態。
- **ATT 追蹤授權**：每次安裝只會詢問一次。要再看到詢問視窗，需刪除 App 重裝（重裝後重新連 Metro 即可，不用重新 build）。
- **內購（IAP）**：開發版走 StoreKit 沙盒環境，不會真的扣款。
  1. App Store Connect → 使用者與存取權限 → 沙盒 → 新增沙盒測試帳號（使用未註冊過 Apple ID 的 email）
  2. 在 iPhone 登入沙盒帳號：iOS 18 以上在「設定 → 開發者 → Sandbox Apple Account」；較舊版本在「設定 → App Store → 沙盒帳號」
  3. 在 App 內購買時，用沙盒帳號確認
- **GA 分析**：`src/services/analyticsService.ts` 在 `EXPO_PUBLIC_GA_MEASUREMENT_ID` 或 `EXPO_PUBLIC_GA_API_SECRET` 為空時不送任何事件。本機沒有 `.env` 時，開發版不會送分析事件。
  要測分析時，把 `.env.example` 複製成 `.env` 填入值，再重新 `npx expo start`；注意事件會送進正式的 GA 資源。

## 6. 額度與限制

- EAS 免費方案：每月 15 次 iOS build（和上 TestFlight 的 production build 共用），低優先度排隊，每次最長 45 分鐘
- Ad hoc 安裝：每個 Apple Developer 帳號每年最多註冊 100 台 iPhone（停用的裝置也算）
- 排隊太久可考慮 Starter 方案（每月 US$19，高優先度排隊）

## 備援：另一台電腦

原本的流程仍可使用：push feature branch 到 GitHub 後，在另一台電腦 pull 並執行 `npx expo run:ios`。
