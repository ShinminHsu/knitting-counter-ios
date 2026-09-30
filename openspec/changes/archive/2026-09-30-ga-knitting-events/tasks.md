## 1. Setup

- [x] 1.1 Create branch `feat/ga-knitting-events` from `dev`

## 2. Delivery and shared parameters

- [x] 2.1 Analytics configuration check + Delivery failure visibility + Debug mode in development — Fail loudly in development, while Keep Measurement Protocol with the web stream means the endpoint and payload shape stay as they are: in `src/services/analyticsService.ts` `sendEvent`, warn once via `console.warn` in `__DEV__` naming the empty variable before returning; check `res.ok` and log status plus event name in `__DEV__`; log caught network errors in `__DEV__`; add `debug_mode: '1'` to params when `__DEV__`
- [x] 2.2 Shared event parameters: in `sendEvent`, merge `app_version` (`Constants.expoConfig?.version ?? 'unknown'` from `expo-constants`), `app_language` (`i18n.language`), and `is_premium` (`String(useEntitlementStore.getState().isPremium)`) into every event's params; import the store directly (not a hook) to keep `sendEvent` callable outside components
- [x] 2.3 Event naming avoids GA4 reserved names: add the new event names to `ANALYTICS_EVENTS` in `src/constants/analytics.ts` (`app_launch`, `chart_created`, `photo_added`, `custom_stitch_created`, `template_created`, `round_edited`, `tracking_session_end`) and export typed log functions from `analyticsService.ts`: `logAppLaunch()`, `logChartCreated(craftType)`, `logPhotoAdded(source)`, `logCustomStitchCreated(craftType)`, `logTemplateCreated(source, stitchCount)`, `logRoundEdited({ itemsCount, itemsAdded, durationSec })`, `logTrackingSessionEnd({ durationSec, advanceActions, roundsCompleted, chartCompleted, craftType })`

## 3. Event call sites

- [x] 3.1 App launch event: call `logAppLaunch()` once in the existing mount effect in `app/_layout.tsx`
- [x] 3.2 Creation events in `app/project/[id]/index.tsx`, following the design.md table Where each event fires: `logChartCreated(project.craftType)` after `addChart` at line 456 returns non-null, and `logPhotoAdded('camera')` / `logPhotoAdded('library')` after the two `addPhoto` calls (lines 215, 225)
- [x] 3.3 Creation events for library items: `logCustomStitchCreated(craftType)` after `addCustomStitch` in `src/components/CustomStitchModal.tsx:98`; `logTemplateCreated('library', stitches.length)` after `addTemplate` in `app/pattern-elements.tsx:176` and `logTemplateCreated('round_editor', stitches.length)` after `addTemplate` in `app/project/[id]/round.tsx:563`
- [x] 3.4 Round edit summary in `app/project/[id]/round.tsx` — first of the two Session summary events instead of per-stitch events: capture the round's pattern item count and `Date.now()` in refs on mount, and in an unmount effect send `logRoundEdited` with final count, `Math.max(0, final - initial)`, and elapsed seconds; skip when nothing was added and elapsed is under 2 seconds
- [x] 3.5 Tracking session summary in `app/project/[id]/tracking.tsx`: add refs for start time, advance actions, and rounds completed; increment the action ref in `handleNextStitch` and in the label and symbol tap handlers (lines 539, 550); increment the rounds ref when the round index increases; record chart completion where `setShowCompletion(true)` runs (line 479); send `logTrackingSessionEnd` in an unmount effect, skipping when there were no actions and elapsed is under 2 seconds

## 4. Verification

- [x] 4.1 Run `tsc --noEmit` under Node 20 and confirm no type errors
- [x] 4.2 [手動驗證] With the existing development build and `npx expo start --tunnel`: open the app, create a chart, add a photo, create a custom stitch and a template, edit a round, count stitches on the tracking screen, then check GA4 DebugView shows `app_launch`, `chart_created`, `photo_added`, `custom_stitch_created`, `template_created`, `round_edited`, and `tracking_session_end`, each carrying `app_version`, `app_language`, and `is_premium`; confirm the summary events report plausible counts and durations
- [x] 4.3 Commit on `feat/ga-knitting-events` and ask the user before pushing to GitHub
