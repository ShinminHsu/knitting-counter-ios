# iCloud 設定（Apple Developer + EAS）

`app.json` 的 `react-native-cloud-storage` plugin 會在 prebuild 時加入以下 entitlements：

- iCloud container：`iCloud.com.stitchie.app`（由 bundle ID 推導）
- iCloud Documents（`CloudDocuments` 服務）
- iCloud Key-Value Storage（`enableKeyValueStorage: true`）
- Container 環境：`Production`

## 1. 讓 App ID 具備 iCloud 能力

EAS Build 預設會依 entitlements 自動同步 App ID 的 capabilities。第一次執行
`eas build --profile development --platform ios` 時，若詢問是否登入 Apple 帳號或更新 provisioning profile，選 yes。

如果 build 失敗並提到 iCloud / container / entitlement，改成手動設定：

1. 登入 developer.apple.com → Certificates, Identifiers & Profiles → Identifiers
2. 右上「+」→ 選「iCloud Containers」→ Description 填 `Stitchie`，Identifier 填 `iCloud.com.stitchie.app` → Register
3. 回到 Identifiers → 點 App ID `com.stitchie.app` → 勾選「iCloud」→ 按「Configure」勾選 `iCloud.com.stitchie.app` → Save
4. 重新執行 `eas build --profile development --platform ios`，EAS 會重新產生 provisioning profile

## 2. 測試裝置

- 裝置需登入 iCloud，且「設定 → 你的名字 → iCloud → iCloud 雲碟」為開啟
- 備份檔在 AppData scope，不會出現在「檔案」App；可在「設定 → 你的名字 → iCloud → 管理帳號儲存空間」看到 Stitchie 佔用的空間
