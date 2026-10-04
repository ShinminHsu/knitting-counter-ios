## Context

The app initializes i18next in `src/i18n/index.ts` with three bundled resources (`zh-TW`, `en`, `ja`), picking the initial language from MMKV (`STORAGE_KEYS.LANGUAGE`) or the device locale, with `fallbackLng: 'zh-TW'`. React screens consume it through `useTranslation`.

The strings this change fixes are produced in five places where that hook is not available or was never applied:

- a Zustand store action (`useProjectStore.duplicateProject` / `duplicateChart`)
- an imperative helper that calls `Alert.alert` (`showConfirmDialog`)
- two service/util modules that build `Error` messages later shown by an `Alert` (`importExportService`, `importExportHelpers.validateProjectShape`)
- a date formatter pinned to the `zh-Hant-TW` Intl locale (`helpers.formatDate`)
- two components written before the i18n rollout (`PhotoViewer`, `+not-found`)

`src/services/analyticsService.ts` already imports the i18n singleton directly (`i18n.language`), so a non-hook consumer is established precedent in this codebase.

Constraint: the user can switch language at runtime from the settings screen, so any text captured at module-load time would go stale.

## Goals / Non-Goals

**Goals**

- Every user-visible string listed in the proposal renders in the active language.
- Text stays correct after a runtime language switch.
- A mechanical check exists so a new hardcoded CJK literal is caught rather than noticed by a user.

**Non-Goals**

- Re-reviewing existing translation wording.
- Typed i18n keys (`CustomTypeOptions`).
- Localizing `__DEV__` console output or source comments.
- CI / git-hook integration for the guard script.
- Any behavior change beyond displayed text.

## Decisions

### Resolve translations at call time via the i18n singleton

Non-component modules `import i18n from '../i18n'` and call `i18n.t(key)` inside the function body, never at module scope.

- *Why*: matches `analyticsService`, needs no signature changes at the 6 `showConfirmDialog` call sites or the 2 `validateProjectShape` call sites, and re-evaluates on every call so a language switch is picked up.
- *Alternative — thread strings in from the calling component*: every call site would have to pass `confirmLabel`/`cancelLabel` and the store would need the duplicate suffix passed in; more churn, and easy to forget at a new call site, which is the exact failure being fixed.
- *Alternative — return error codes and translate in the UI layer*: cleaner in principle for `validateProjectShape`, but its second consumer (`icloudBackupService.ts:651`) only checks `length > 0`, and the sole display path (`import-export.tsx:135`) just renders `err.message`. Introducing a code enum and a mapping table is more machinery than this bug warrants.

Import-cycle note: `src/i18n/index.ts` imports `mmkv` from `src/stores/mmkvStorage.ts`, not from `useProjectStore`, so importing i18n into `useProjectStore` introduces no cycle.

### Duplicate naming goes through one interpolated key

A single `common.duplicatedName: '{{name}} (Copy)'` key, used by both `duplicateProject` and `duplicateChart`.

- *Why*: Japanese places the marker differently (`{{name}}のコピー`), so a standalone suffix string that callers concatenate would force Japanese into an unnatural `名前 (コピー)`. Interpolating the whole name lets each locale position it.

### `formatDate` formats with the active i18n language

`new Intl.DateTimeFormat(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })`, reading `i18n.language` at call time.

- *Why*: the app's language values (`zh-TW`, `en`, `ja`) are valid BCP 47 tags that `Intl` accepts directly, so no mapping table is needed. `zh-TW` yields `2024年1月15日`, identical to today's output for Chinese users — no visible change for them.
- Note: `app/index.tsx:39` has its own local `formatDate` producing `M/D`, which is language-neutral and stays as is.

### Delete dead code instead of translating it

`helpers.formatRelativeDate` and everything in `importExportHelpers` except `validateProjectShape` have zero call sites (verified by grep across `src/` and `app/`).

- *Why*: translating unreachable code adds three locale entries per string for text no user can reach, and leaves future readers unsure whether it is live. `validateProjectShape` is kept because `importExportService.ts:6` and `icloudBackupService.ts:19` both import it.
- *Trade-off*: `buildExportData` / `serializeExportData` look like a reusable export path, but `importExportService.exportProject` builds its export object inline and never calls them. They can be restored from git history if ever needed.

### Guard script scans for CJK literals rather than lint rules

A standalone `scripts/check-hardcoded-cjk.mjs` walks `src/` and `app/`, skips `src/i18n/locales/`, strips comments, and reports any remaining CJK code point in source text; exits non-zero on a hit.

- *Why*: the project has no ESLint i18n plugin configured, and a ~60-line script with zero new dependencies covers the one pattern that actually regressed here.
- *Alternative — `eslint-plugin-i18next`*: a new dev dependency and config surface for a check this narrow.

## Risks / Trade-offs

- **The guard script flags Chinese in comments or `__DEV__` logs and becomes noise** → strip `//`, `/* */` and JSDoc blocks before scanning, and allowlist `src/services/analyticsService.ts`; the script must exit 0 on the final tree.
- **Removing exports breaks an importer that grep missed** → `npx tsc --noEmit` after deletion catches any unresolved import.
- **A new locale key is added to `en.ts` but forgotten in `ja.ts` or `zh-TW.ts`** → i18next silently falls back to `zh-TW`, reintroducing the bug for English users. The verification task diffs the key sets of the three files.
- **No native changes, but users still need a new binary** → the fix only reaches users through a new EAS build; this is a release decision, not a technical one.

## Migration Plan

No data migration: no persisted value changes shape. Existing projects already named `... (副本)` keep that name — the key is applied at duplication time only, and renaming stored user data would be wrong.

Rollback is a plain revert of the change's commits.

## Open Questions

None.
