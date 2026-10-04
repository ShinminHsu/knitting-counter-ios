## ADDED Requirements

### Requirement: Duplicated item names SHALL be localized

When a project or a chart is duplicated, the copy's name SHALL be produced from a single interpolated translation key resolved in the active language. Each locale SHALL position the copy marker according to its own convention.

#### Scenario: Duplicating a chart in English

- **WHEN** the app language is `en` and the user duplicates a chart named `Sleeve`
- **THEN** the new chart is named `Sleeve (Copy)`

#### Scenario: Duplicating a project in Japanese

- **WHEN** the app language is `ja` and the user duplicates a project named `ソックス`
- **THEN** the new project's name contains no Traditional-Chinese-only text and uses the Japanese copy marker defined in `ja.ts`

#### Scenario: Duplicating in Traditional Chinese

- **WHEN** the app language is `zh-TW` and the user duplicates a chart named `袖子`
- **THEN** the new chart is named `袖子 (副本)`, unchanged from previous releases

#### Scenario: Existing duplicates are not renamed

- **WHEN** a project named `Socks (副本)` was created by an earlier app version and the user opens the app in English
- **THEN** the stored project name is left untouched

### Requirement: Confirmation dialog buttons SHALL be localized by default

`showConfirmDialog` SHALL resolve its default confirm label and its cancel label through i18n at call time, so that a caller passing neither label still gets buttons in the active language.

#### Scenario: Caller passes no labels

- **WHEN** the app language is `en` and a caller invokes `showConfirmDialog` with only `title`, `message` and `onConfirm`
- **THEN** the alert shows `Cancel` and `OK` as its two buttons

#### Scenario: Caller overrides the confirm label

- **WHEN** a caller passes an explicit `confirmLabel`
- **THEN** that label is used verbatim and the cancel button is still localized

#### Scenario: Language switched during the session

- **WHEN** the user switches the language from `zh-TW` to `ja` in settings and then triggers a confirmation dialog
- **THEN** both buttons render in Japanese without an app restart

### Requirement: Import and export messages SHALL be localized

The share-sheet dialog title and every error message that can reach the user through `Alert.alert(..., err.message)` on the import/export screen SHALL be resolved through i18n at the time the message is produced.

#### Scenario: Export share sheet title

- **WHEN** the app language is `ja` and the user exports a project
- **THEN** the iOS share sheet title is the Japanese export title from `ja.ts`

#### Scenario: Unreadable import file

- **WHEN** the app language is `en` and the selected import file cannot be read
- **THEN** the alert body is the English "cannot read file" message

#### Scenario: Malformed JSON

- **WHEN** the app language is `en` and the selected file is not valid JSON
- **THEN** the alert body is the English "invalid JSON" message

#### Scenario: Missing required project field

- **WHEN** the app language is `en` and the imported file's `project` object has no `name`
- **THEN** the alert body is the English message naming the missing `project.name` field

#### Scenario: Invalid craft type

- **WHEN** the app language is `en` and the imported `project.craftType` is neither `crochet` nor `knitting`
- **THEN** the alert body is the English invalid-craft-type message

#### Scenario: Validation reused by iCloud restore

- **WHEN** `icloudBackupService` validates a restored project file
- **THEN** it continues to treat a non-empty error array as a failed file, independent of the active language

### Requirement: Photo viewer type badges SHALL be localized

The full-screen photo viewer SHALL render its reference-photo and progress-photo badges through i18n.

#### Scenario: Reference photo badge in English

- **WHEN** the app language is `en` and the user opens a photo whose `type` is `reference`
- **THEN** the badge reads the English reference label

#### Scenario: Progress photo badge in Japanese

- **WHEN** the app language is `ja` and the user opens a photo whose `type` is `progress`
- **THEN** the badge reads the Japanese progress label

### Requirement: The not-found screen SHALL be localized and use StyleSheet

The `+not-found` route SHALL resolve its navigation title, body text and home link through i18n, and SHALL be styled with `StyleSheet.create` rather than NativeWind `className`, per the project style rule.

#### Scenario: Unknown route in English

- **WHEN** the app language is `en` and the user navigates to a route that does not exist
- **THEN** the screen title, body text and link all render in English

#### Scenario: No NativeWind class names remain

- **WHEN** `app/+not-found.tsx` is inspected
- **THEN** it contains no `className` prop and all styling comes from a `StyleSheet.create` object

### Requirement: Custom stitch fallback abbreviation SHALL be localized

When a custom stitch in a template preview has neither `customAbbr` nor `customName`, the stitch library SHALL render a fallback label resolved through i18n.

#### Scenario: Custom stitch with no abbreviation in English

- **WHEN** the app language is `en` and a saved template contains a custom stitch with no `customAbbr` and no `customName`
- **THEN** the preview shows the English fallback label instead of `自訂`

### Requirement: Long-form dates SHALL use the active language

`formatDate` SHALL format with the active i18n language instead of a hardcoded `zh-Hant-TW` locale, reading the language at call time.

#### Scenario: Project creation date in English

- **WHEN** the app language is `en` and the user opens a project detail screen
- **THEN** the "Created" date renders in English long form, for example `January 15, 2024`

#### Scenario: Project creation date in Traditional Chinese

- **WHEN** the app language is `zh-TW` and the user opens a project detail screen
- **THEN** the "Created" date renders as `2024年1月15日`, unchanged from previous releases

### Requirement: Stitch summary separators SHALL be localized

Lists of stitch summaries SHALL be joined with the `common.stitchListSep` separator resolved through i18n, so that English renders `, ` instead of the ideographic comma.

#### Scenario: Round summary list in English

- **WHEN** the app language is `en` and the pattern editor shows a round containing more than one pattern item
- **THEN** the summaries are joined with `, ` and no `、` appears

#### Scenario: Round summary list in Japanese

- **WHEN** the app language is `ja` and the pattern editor shows the same round
- **THEN** the summaries are joined with `、`

### Requirement: Unreachable localized code SHALL be removed

Helper functions that contain hardcoded display strings and have no call sites SHALL be deleted rather than translated.

#### Scenario: Dead helpers are gone

- **WHEN** the repository is searched for `formatRelativeDate` and `importModeLabel`
- **THEN** no definition or call site exists in `src/` or `app/`

#### Scenario: Still-used validation is preserved

- **WHEN** `src/utils/importExportHelpers.ts` is inspected after the cleanup
- **THEN** `validateProjectShape` is still exported and both `importExportService.ts` and `icloudBackupService.ts` still import it successfully

### Requirement: A guard SHALL detect new hardcoded CJK literals

The repository SHALL provide a runnable script that scans `src/` and `app/` for CJK characters in source text, excluding `src/i18n/locales/`, comments, and development-only logging, and SHALL exit with a non-zero status when a match is found.

#### Scenario: Clean tree passes

- **WHEN** the guard script is run against the tree after this change is implemented
- **THEN** it reports no findings and exits with status 0

#### Scenario: A regression is introduced

- **WHEN** a new Traditional Chinese string literal is added to a file under `src/` outside the locale directory and the script is run
- **THEN** the script prints the file and line and exits with a non-zero status

#### Scenario: Comments are not flagged

- **WHEN** a file under `src/` contains Chinese only inside `//`, `/* */` or JSDoc comments
- **THEN** the script does not report that file
