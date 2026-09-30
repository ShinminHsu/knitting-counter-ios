## Why

Stitchie sends no analytics at all. `sendEvent` (`src/services/analyticsService.ts:28`) returns early when `measurement_id` or `api_secret` is empty, `.env` is gitignored so EAS never uploads it, and EAS had no environment variables in any environment — so every store build shipped with empty config. GA4 Realtime confirms zero events. Even once delivery works, the current 13 events are mostly screen views and ads: the only knitting signals are `project_created`, `add_round`, `tracking_started`, and `chart_completed`, which cannot answer how much users actually create, edit, and count.

## What Changes

- Harden `sendEvent`: warn in development when the GA config is missing, check the HTTP response and log failures in development, and add `debug_mode` in development builds so events show in GA DebugView.
- Attach shared parameters to every event: `app_version` (from `expo-constants`), `app_language` (current i18n language), `is_premium`.
- Add knitting behaviour events:
  - `app_launch` on app start
  - `chart_created`, `photo_added`, `custom_stitch_created`, `template_created`
  - `round_edited` — one summary when leaving the round editor (items in the round, items added, seconds spent)
  - `tracking_session_end` — one summary when leaving the tracking screen (seconds, advance actions, rounds completed, whether the chart finished)
- Configuration already done outside this change: `.env` locally and EAS `production` + `preview` variables hold `EXPO_PUBLIC_GA_MEASUREMENT_ID=G-7L1WT29N20` and `EXPO_PUBLIC_GA_API_SECRET` for the GA4 web stream `stitchie.app`; the debug endpoint validated both a `page_view` and a custom event with `validationMessages: []`.

## Non-Goals (optional)

(covered in design.md)

## Capabilities

### New Capabilities

- `analytics-events`: How Stitchie delivers analytics events, the parameters every event carries, and which knitting behaviours are measured.

### Modified Capabilities

(none)

## Impact

- Affected specs: `analytics-events` (new)
- Affected code:
  - `src/services/analyticsService.ts`, `src/constants/analytics.ts`
  - `app/_layout.tsx` (`app_launch`)
  - `app/project/[id]/index.tsx` (`chart_created`, `photo_added`)
  - `src/components/CustomStitchModal.tsx` (`custom_stitch_created`)
  - `app/pattern-elements.tsx`, `app/project/[id]/round.tsx` (`template_created`, `round_edited`)
  - `app/project/[id]/tracking.tsx` (`tracking_session_end`)
- No new dependency (`expo-constants` is already installed) and no native change, so the existing development build can verify it.
