## Why

Stitchie ships in Traditional Chinese, English and Japanese, but a number of user-facing strings were never routed through i18n and are hardcoded in Traditional Chinese. An English or Japanese user who duplicates a chart gets `My Chart (副本)`, sees `取消` on every confirmation dialog, and reads Chinese error text when an import fails. The duplicate-suffix case was reported by a user on 1.1.0.

## Problem

Hardcoded Traditional Chinese leaks into the UI regardless of the selected language:

| Location | Leak |
| --- | --- |
| `src/stores/useProjectStore.ts:150` (`duplicateProject`), `:262` (`duplicateChart`) | Duplicated project/chart is named `<name> (副本)` |
| `src/components/ConfirmDialog.tsx:25,30` | Default `confirmLabel = '確定'`; cancel button is always `'取消'` — all 6 call sites rely on the default cancel label |
| `src/services/importExportService.ts:63` | Share sheet `dialogTitle: '匯出專案'` |
| `src/services/importExportService.ts:102,109,124` | Thrown `Error` messages, surfaced verbatim by `app/project/[id]/import-export.tsx:135` via `Alert.alert(..., err.message)` |
| `src/utils/importExportHelpers.ts:45,51,52,53,55` | `validateProjectShape` error strings, re-thrown by `importExportService.validateImportData:131` and shown in the same alert |
| `src/components/PhotoViewer.tsx:213,218` | Photo type badges `參考圖` / `進度記錄` |
| `app/+not-found.tsx:7,9,11` | Screen title `找不到頁面`, body `找不到此頁面`, link `返回首頁` |
| `app/pattern-elements.tsx:230` | Fallback abbreviation `'自訂'` for a custom stitch with no `customAbbr`/`customName` |
| `src/utils/helpers.ts:16-23` | `formatDate` hardcodes the `zh-Hant-TW` Intl locale, so the project detail "Created" date renders as `2024年1月15日` in every language |

Dead code also carries Chinese strings and should be deleted rather than translated:

- `src/utils/helpers.ts:26-44` `formatRelativeDate` — 0 call sites, 6 Chinese strings.
- `src/utils/importExportHelpers.ts` — `EXPORT_VERSION`, `buildExportData`, `serializeExportData`, `validateImportData`, `parseAndValidateImport`, `importSuccess`, `importFailure`, `importModeLabel` all have 0 call sites outside the file itself. `validateProjectShape` is the only export still used (by `importExportService.ts:6` and `icloudBackupService.ts:19`).

## Root Cause

These strings sit outside React components (a Zustand store, two services, two util modules) where the `useTranslation` hook is unavailable, plus two components that predate the i18n rollout. They were skipped when the rest of the app was localized, and nothing guards against new occurrences.

## Proposed Solution

1. Add the missing keys to all three locale files (`src/i18n/locales/en.ts`, `src/i18n/locales/zh-TW.ts`, `src/i18n/locales/ja.ts`).
2. In non-component modules, import the configured `i18n` instance directly and call `i18n.t(...)` at call time, matching the existing precedent in `src/services/analyticsService.ts`. Resolving at call time (not module load) keeps the text correct after a language switch.
3. In components, use `useTranslation` — including `app/+not-found.tsx`, which is additionally converted from NativeWind `className` to `StyleSheet.create` per the project style rule.
4. Make `formatDate` format with the active i18n language instead of a hardcoded `zh-Hant-TW`.
5. Delete the dead code listed above instead of translating it.
6. Add `scripts/check-hardcoded-cjk.mjs` plus an npm script so a regression is caught mechanically rather than by eye.

## Non-Goals

- Reviewing or improving the quality of existing translations in the locale files.
- Typing i18n keys (`CustomTypeOptions` / `resources` typing) — the project uses untyped `t()` today and that stays.
- Localizing `__DEV__`-only `console.warn` text in `src/services/analyticsService.ts` and source-code comments; neither reaches users.
- Wiring the guard script into CI or a git hook — it is runnable on demand only.
- Changing any behavior other than the displayed text (duplicate semantics, import validation rules, photo badges and date values are unchanged).

## Capabilities

### New Capabilities

- `ui-localization`: Every user-visible string resolves through i18n in the active language, including strings produced outside React components, with a guard against new hardcoded CJK literals.

### Modified Capabilities

(none)

## Impact

- Affected specs: `ui-localization` (new)
- Affected code:
  - `src/i18n/locales/en.ts`, `src/i18n/locales/zh-TW.ts`, `src/i18n/locales/ja.ts`
  - `src/stores/useProjectStore.ts`
  - `src/components/ConfirmDialog.tsx`, `src/components/PhotoViewer.tsx`
  - `src/services/importExportService.ts`
  - `src/utils/importExportHelpers.ts`, `src/utils/helpers.ts`
  - `app/+not-found.tsx`, `app/pattern-elements.tsx`
  - `scripts/check-hardcoded-cjk.mjs` (new), `package.json`
- No native changes, so no `prebuild` is required; shipping this to users does require a new EAS build.
