## 1. Locale keys

- [x] 1.1 Add the new keys to `src/i18n/locales/en.ts`, `zh-TW.ts` and `ja.ts`, keeping each file's existing section order and the `zh-TW` values identical to the strings being replaced so Chinese output is unchanged:
  - `common.duplicatedName` — en `'{{name}} (Copy)'`, zh-TW `'{{name}} (副本)'`, ja `'{{name}}のコピー'`
  - `importExport.shareDialogTitle` — en `'Export Project'`, zh-TW `'匯出專案'`, ja `'プロジェクトを書き出す'`
  - `importExport.errorReadFile` — en `'Cannot read the file. Make sure it exists and is readable.'`, zh-TW `'無法讀取檔案，請確認檔案是否存在且可讀取'`, ja `'ファイルを読み込めません。ファイルが存在し、読み取り可能か確認してください'`
  - `importExport.errorInvalidJson` — en `'Invalid file format: the JSON content could not be parsed.'`, zh-TW `'檔案格式錯誤：無法解析 JSON 內容'`, ja `'ファイル形式エラー：JSON を解析できません'`
  - `importExport.errorRootNotObject` — en `'Invalid file format: the root data must be an object.'`, zh-TW `'無效的檔案格式：根資料必須是物件'`, ja `'無効なファイル形式：ルートデータはオブジェクトである必要があります'`
  - `importExport.errorMissingField` — en `'Missing required field: {{field}}'`, zh-TW `'缺少必要欄位：{{field}}'`, ja `'必須項目がありません：{{field}}'`
  - `importExport.errorInvalidCraftType` — en `'Invalid craftType value: must be "crochet" or "knitting".'`, zh-TW `'無效的 craftType 值：必須是 "crochet" 或 "knitting"'`, ja `'無効な craftType 値：「crochet」または「knitting」である必要があります'`
  - `photoGallery.typeReference` — en `'Reference'`, zh-TW `'參考圖'`, ja `'参考図'`
  - `photoGallery.typeProgress` — en `'Progress'`, zh-TW `'進度記錄'`, ja `'進捗記録'`
  - `patternElements.customAbbrFallback` — en `'Custom'`, zh-TW `'自訂'`, ja `'カスタム'`
  - new `notFound` section with `title` / `message` / `goHome` — en `'Page Not Found'` / `'This page could not be found.'` / `'Go to Home'`, zh-TW `'找不到頁面'` / `'找不到此頁面'` / `'返回首頁'`, ja `'ページが見つかりません'` / `'このページは見つかりませんでした'` / `'ホームに戻る'`
- [x] 1.2 Verify the three locale files expose an identical key set (compare the flattened key lists of `en`, `zh-TW` and `ja`; a missing key silently falls back to `zh-TW` and would reintroduce this bug)

## 2. Non-component call sites

Apply the design decision "Resolve translations at call time via the i18n singleton": `import i18n from '<relative>/i18n'` and call `i18n.t(...)` inside the function body, never at module scope.

- [x] 2.1 Duplicated item names SHALL be localized — in `src/stores/useProjectStore.ts`, replace `` `${project.name} (副本)` `` at line 150 and `` `${chart.name} (副本)` `` at line 262 with `i18n.t('common.duplicatedName', { name: ... })`, following the design decision "Duplicate naming goes through one interpolated key"
- [x] 2.2 Confirmation dialog buttons SHALL be localized by default — in `src/components/ConfirmDialog.tsx`, drop the `confirmLabel = '確定'` default-parameter value and resolve inside the body as `confirmLabel ?? i18n.t('common.confirm')`, and set the cancel button text to `i18n.t('common.cancel')`; leave the `ConfirmDialogOptions` signature otherwise unchanged so the 6 existing call sites still compile
- [x] 2.3 Import and export messages SHALL be localized (service) — in `src/services/importExportService.ts`, replace `dialogTitle: '匯出專案'` (line 63) with `i18n.t('importExport.shareDialogTitle')` and the three thrown `Error` messages (lines 102, 109, 124) with `i18n.t('importExport.errorReadFile')`, `errorInvalidJson` and `errorRootNotObject`
- [x] 2.4 Import and export messages SHALL be localized (validation) — in `src/utils/importExportHelpers.ts`, make `validateProjectShape` build its messages with `i18n.t('importExport.errorMissingField', { field: 'project' | 'project.id' | 'project.name' | 'project.charts' })` and `i18n.t('importExport.errorInvalidCraftType')`, keeping the return type `string[]`, the same check order, and the same emptiness semantics relied on by `src/services/icloudBackupService.ts:651`
- [x] 2.5 Long-form dates SHALL use the active language — in `src/utils/helpers.ts`, change `formatDate` to `new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })` per the design decision "`formatDate` formats with the active i18n language", reading `i18n.language` inside the function; leave the separate local `formatDate` in `app/index.tsx:39` (`M/D`, language-neutral) untouched

## 3. Component call sites

- [x] 3.1 Photo viewer type badges SHALL be localized — in `src/components/PhotoViewer.tsx`, replace the `參考圖` and `進度記錄` badge text (lines 213 and 218) with `t('photoGallery.typeReference')` and `t('photoGallery.typeProgress')` via `useTranslation`
- [x] 3.2 The not-found screen SHALL be localized and use StyleSheet — rewrite `app/+not-found.tsx` to read its title, body and link text from `t('notFound.title' | 'notFound.message' | 'notFound.goHome')` via `useTranslation`, and replace every `className` with a `StyleSheet.create` block using the project palette (background `#faf5f0`, link/accent `#D97398`, heading text `#C4527F`)
- [x] 3.3 Custom stitch fallback abbreviation SHALL be localized — in `app/pattern-elements.tsx:230`, replace the `'自訂'` fallback inside `buildStitchPreview` with `t('patternElements.customAbbrFallback')` (the `t` from the screen's existing `useTranslation` call)
- [x] 3.4 Stitch summary separators SHALL be localized — in `app/project/[id]/editor.tsx:166`, replace the literal `itemSummaries.join('、')` with the existing `common.stitchListSep` key (the same key already used at `editor.tsx:47`, `round.tsx:196` and `tracking.tsx:177,182`); found by the guard script, not by the original scan

## 4. Dead code removal

- [x] 4.1 Unreachable localized code SHALL be removed (helpers) — delete `formatRelativeDate` from `src/utils/helpers.ts` (0 call sites), keeping `generateId`, `nowISO` and `formatDate`
- [x] 4.2 Unreachable localized code SHALL be removed (import/export helpers) — delete `EXPORT_VERSION`, `buildExportData`, `serializeExportData`, `validateImportData`, `parseAndValidateImport`, `importSuccess`, `importFailure` and `importModeLabel` from `src/utils/importExportHelpers.ts` per the design decision "Delete dead code instead of translating it", keeping only `validateProjectShape` and trimming the now-unused imports from `../types`; `src/utils/index.ts` re-exports with `export *` so the barrel needs no edit

## 5. Regression guard

- [x] 5.1 A guard SHALL detect new hardcoded CJK literals — add `scripts/check-hardcoded-cjk.mjs` per the design decision "Guard script scans for CJK literals rather than lint rules": walk `src/` and `app/` for `.ts`/`.tsx`, skip `src/i18n/locales/`, strip `//`, `/* */` and JSDoc comment text, allowlist `src/services/analyticsService.ts` (DEV-only `console.warn`), print `file:line` for every remaining CJK match and `process.exit(1)` when any is found; wire it up as an npm script `"check:i18n": "node scripts/check-hardcoded-cjk.mjs"` in `package.json`

## 6. Verification

- [x] 6.1 Run `npx tsc --noEmit` and confirm it passes with no new errors (this also proves no importer of the symbols deleted in group 4 was missed)
- [x] 6.2 Run the guard script and confirm it exits 0 on the final tree
- [x] 6.3 Hand the user a manual check list for the device build: duplicate a chart and a project in English and in Japanese, open any delete confirmation and check the Cancel button, import a deliberately malformed JSON file, open a reference photo and a progress photo full screen, open a project detail screen and check the Created date, and confirm Traditional Chinese output is unchanged throughout
