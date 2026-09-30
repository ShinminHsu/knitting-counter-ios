## Context

- `src/services/analyticsService.ts` posts to the GA4 Measurement Protocol (`https://www.google-analytics.com/mp/collect`) with `measurement_id` + `api_secret` from `src/constants/firebase.ts`, a persisted random `client_id` (MMKV `gaClientId`), and a per-launch `SESSION_ID`. `sendEvent` returns early when either config value is empty, ignores the `fetch` response, and swallows errors.
- Git history shows `@react-native-firebase` was replaced by this HTTP approach (`22e48f8`), followed by debugging commits about missing events.
- GA4 has two data streams: web `stitchie.app` (`G-7L1WT29N20`, Measurement Protocol key created) and an iOS app stream (Firebase App ID). The code's payload shape matches the web stream.
- Existing events: `page_view` on 10 screens, `project_created`, `add_round`, `tracking_started`, `chart_completed`, `use_template`, `import_project`, `export_project`, three ad events, `iap_purchase_completed`. `ADD_STITCH` is declared but `logStitchAdded` is intentionally empty.
- Screens involved: chart editor `app/project/[id]/editor.tsx` (adds rounds), round editor `app/project/[id]/round.tsx` (adds stitches and groups, 1166 lines), tracking `app/project/[id]/tracking.tsx` (`handleNextStitch`, label/symbol taps calling `jumpToStitchPosition`, completion at line 479).
- `markChartComplete` is called from `useProgressStore` (lines 148, 198); `markProjectComplete` has no call site anywhere.
- `expo-constants` is a dependency but unused; `i18n.language` gives the active language; `useEntitlementStore.getState().isPremium` gives premium state without a hook.

## Goals / Non-Goals

**Goals:**

- Events actually reach GA, and a failure is visible during development instead of silent.
- Answer: do users create charts and rounds, do they edit patterns, do they actually count stitches, and for how long.
- No measurable cost on the stitch-tap hot path.

**Non-Goals:**

- Switching to the Firebase SDK or the iOS app stream (the SDK was deliberately removed; a native dependency right before a release is unnecessary risk).
- Per-stitch events — one event per tap is noise; session summaries answer the same question.
- Premium funnel, import/export, and iCloud backup events (a later round).
- A `project_completed` event: `markProjectComplete` is never called, so project completion never happens. Adding that flow is a product change, not instrumentation.
- GA4 dashboards, audiences, or conversion configuration in the console.
- Backfilling history — data starts from the first build that ships this change.

## Decisions

### Keep Measurement Protocol with the web stream

Continue posting to the web stream `G-7L1WT29N20` with `measurement_id` + `client_id`. The payload shape already matches, the debug endpoint validated it, and no native dependency is involved. Trade-off: GA reports the platform as web, which is why `app_version` travels as an explicit parameter.

Alternative: the iOS app stream with `firebase_app_id` + `app_instance_id`. Rejected because a trustworthy `app_instance_id` comes from the Firebase SDK, which this project removed.

### Fail loudly in development

`sendEvent` keeps never throwing and never blocking the UI, but:

- When `measurement_id` or `api_secret` is empty, log a one-time `console.warn` in `__DEV__` naming the missing variable, then return.
- Check the response: a non-2xx status logs `console.warn` in `__DEV__` with the status and event name.
- Network errors log in `__DEV__` instead of being silently swallowed.
- In `__DEV__`, add `debug_mode: '1'` to every event's params so events appear in GA DebugView.

Production stays silent: no user-visible errors, no retries.

### Shared event parameters

`sendEvent` merges these into every event's params: `app_version` (`Constants.expoConfig?.version ?? 'unknown'`), `app_language` (`i18n.language`), `is_premium` (`'true'`/`'false'` from `useEntitlementStore.getState().isPremium`). GA4 automatically collects a `language` dimension for web streams, so the custom parameter is named `app_language` to avoid colliding with it.

### Session summary events instead of per-stitch events

Two summary events replace what per-action events would produce:

- `round_edited`, sent when the round editor unmounts: `items_count` (pattern items in the round at exit), `items_added` (count at exit minus count at entry, clamped at 0), `duration_sec`. Skipped when nothing changed and the user spent under 2 seconds (accidental taps).
- `tracking_session_end`, sent when the tracking screen unmounts: `duration_sec`, `advance_actions` (counted in a ref incremented by `handleNextStitch`, label taps, symbol taps, and round completion), `rounds_completed` (ref incremented when the round index increases), `chart_completed` (`'true'`/`'false'`). Skipped when `advance_actions` is 0 and duration is under 2 seconds.

Both use refs, so counting adds no re-render on the hot path.

### Event naming avoids GA4 reserved names

`app_launch` rather than `app_open`, which GA4 collects automatically for app streams. Parameter names avoid the `ga_`, `google_`, and `firebase_` prefixes. Event names stay snake_case and under 40 characters, and each event stays well under GA4's 25-parameter limit.

### Where each event fires

| Event | Location | Parameters beyond the shared set |
| --- | --- | --- |
| `app_launch` | `app/_layout.tsx` mount effect | none |
| `chart_created` | `app/project/[id]/index.tsx:456` after `addChart` returns non-null | `craft_type` |
| `photo_added` | `app/project/[id]/index.tsx:215` and `:225` after `addPhoto` | `source`: `camera` or `library` |
| `custom_stitch_created` | `src/components/CustomStitchModal.tsx:98` after `addCustomStitch` | `craft_type` |
| `template_created` | `app/pattern-elements.tsx:176` and `app/project/[id]/round.tsx:563` after `addTemplate` | `source`: `library` or `round_editor`, `stitch_count` |
| `round_edited` | `app/project/[id]/round.tsx` unmount effect | `items_count`, `items_added`, `duration_sec` |
| `tracking_session_end` | `app/project/[id]/tracking.tsx` unmount effect | `duration_sec`, `advance_actions`, `rounds_completed`, `chart_completed`, `craft_type` |

Existing events keep their current names and call sites; they simply gain the shared parameters.

## Risks / Trade-offs

- [The API secret ships inside the JS bundle] → `EXPO_PUBLIC_*` values are inlined, so anyone can extract it and post fake events. Accepted for Measurement Protocol on a client; the key can be rotated in GA if abused.
- [Web-stream data for an app] → platform reports read as web and app-specific automatic metrics are unavailable; `app_version` compensates for the one that matters.
- [Unmount summaries lost on hard crash or force quit] → acceptable; the next session still reports.
- [Events arrive but GA shows nothing for ~24h outside Realtime] → verification uses Realtime and DebugView, not standard reports.
- [Screen `page_view` events remain web-style] → left alone to avoid breaking the little historical continuity that exists once data starts flowing.
