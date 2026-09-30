# analytics-events Specification

## Purpose

TBD - created by archiving change 'ga-knitting-events'. Update Purpose after archive.

## Requirements

### Requirement: Analytics configuration check

When the GA measurement id or API secret is empty, the system SHALL skip sending and SHALL log a development-only warning naming the missing environment variable. It MUST NOT throw or block the calling screen.

#### Scenario: Missing configuration in development

- **WHEN** the app runs in a development build with an empty `EXPO_PUBLIC_GA_API_SECRET` and a screen logs an event
- **THEN** no request is sent and a warning naming the missing variable is logged once

#### Scenario: Missing configuration in production

- **WHEN** the same happens in a production build
- **THEN** no request is sent and nothing is logged or shown to the user


<!-- @trace
source: ga-knitting-events
updated: 2026-09-30
code:
  - marketing/reddit-posts.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/composite.py
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/marketing-strategy.md
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/en/01-never-lose-place/dec.png
-->

---
### Requirement: Delivery failure visibility

The system SHALL check the Measurement Protocol response. A non-2xx status or a network error SHALL be logged in development with the event name, and MUST be ignored silently in production. A failed event MUST NOT be retried and MUST NOT surface to the user.

#### Scenario: Rejected request in development

- **WHEN** the endpoint returns a 4xx status for an event in a development build
- **THEN** a warning with the event name and status is logged and the app continues normally

#### Scenario: Network error in production

- **WHEN** the device is offline and an event is sent in a production build
- **THEN** the failure is ignored, nothing is logged, and no error reaches the UI


<!-- @trace
source: ga-knitting-events
updated: 2026-09-30
code:
  - marketing/reddit-posts.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/composite.py
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/marketing-strategy.md
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/en/01-never-lose-place/dec.png
-->

---
### Requirement: Debug mode in development

Development builds SHALL include `debug_mode` in every event's parameters so events appear in GA DebugView. Production builds MUST NOT include it.

#### Scenario: Development build

- **WHEN** an event is sent from a development build
- **THEN** its parameters include `debug_mode`


<!-- @trace
source: ga-knitting-events
updated: 2026-09-30
code:
  - marketing/reddit-posts.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/composite.py
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/marketing-strategy.md
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/en/01-never-lose-place/dec.png
-->

---
### Requirement: Shared event parameters

Every event SHALL carry `app_version`, `app_language`, and `is_premium` in addition to its own parameters. Parameter names MUST NOT use GA4 reserved prefixes (`ga_`, `google_`, `firebase_`).

#### Scenario: Any event

- **WHEN** any analytics event is sent
- **THEN** its parameters include the app version from the app config, the active language, and whether the user is premium

#### Scenario: Premium state changes

- **WHEN** a user upgrades to premium and then triggers an event
- **THEN** that event reports `is_premium` as true


<!-- @trace
source: ga-knitting-events
updated: 2026-09-30
code:
  - marketing/reddit-posts.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/composite.py
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/marketing-strategy.md
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/en/01-never-lose-place/dec.png
-->

---
### Requirement: App launch event

The system SHALL send an `app_launch` event once per app start.

#### Scenario: Cold start

- **WHEN** the user opens the app
- **THEN** exactly one `app_launch` event is sent


<!-- @trace
source: ga-knitting-events
updated: 2026-09-30
code:
  - marketing/reddit-posts.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/composite.py
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/marketing-strategy.md
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/en/01-never-lose-place/dec.png
-->

---
### Requirement: Creation events

The system SHALL send an event when the user creates a chart, adds a photo, creates a custom stitch, or creates a template: `chart_created` with the craft type, `photo_added` with the source (`camera` or `library`), `custom_stitch_created` with the craft type, and `template_created` with the source (`library` or `round_editor`) and the number of stitches in the template. Each event SHALL be sent only after the underlying create succeeds.

#### Scenario: Chart added

- **WHEN** the user adds a chart to a project
- **THEN** one `chart_created` event carrying the project's craft type is sent

#### Scenario: Chart creation blocked

- **WHEN** adding a chart fails and no chart is created
- **THEN** no `chart_created` event is sent

#### Scenario: Photo from camera

- **WHEN** the user adds a photo taken with the camera
- **THEN** one `photo_added` event with source `camera` is sent

#### Scenario: Template saved from the round editor

- **WHEN** the user saves a stitch group as a template from the round editor
- **THEN** one `template_created` event with source `round_editor` and the stitch count is sent


<!-- @trace
source: ga-knitting-events
updated: 2026-09-30
code:
  - marketing/reddit-posts.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/composite.py
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/marketing-strategy.md
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/en/01-never-lose-place/dec.png
-->

---
### Requirement: Round edit summary

When the round editor closes, the system SHALL send one `round_edited` event with the number of pattern items in the round at exit, how many were added during the visit, and the seconds spent. The event MUST NOT be sent when nothing was added and the visit lasted under 2 seconds.

#### Scenario: Items added

- **WHEN** the user opens a round with 3 items, adds 2, and goes back
- **THEN** one `round_edited` event reports 5 items, 2 added, and the elapsed seconds

#### Scenario: Items removed

- **WHEN** the user deletes items so the round ends with fewer items than at entry
- **THEN** `round_edited` reports the final count with 0 added

#### Scenario: Accidental open

- **WHEN** the user opens a round and goes back within 2 seconds without changing anything
- **THEN** no `round_edited` event is sent


<!-- @trace
source: ga-knitting-events
updated: 2026-09-30
code:
  - marketing/reddit-posts.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/composite.py
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/marketing-strategy.md
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/en/01-never-lose-place/dec.png
-->

---
### Requirement: Tracking session summary

When the tracking screen closes, the system SHALL send one `tracking_session_end` event with the seconds spent, the number of advance actions, the number of rounds completed, whether the chart was completed during the session, and the craft type. The event MUST NOT be sent when there were no advance actions and the visit lasted under 2 seconds. Counting MUST NOT trigger re-renders while the user is tapping.

#### Scenario: Counting session

- **WHEN** the user taps to advance 30 times, finishes 2 rounds, and leaves the screen
- **THEN** one `tracking_session_end` event reports 30 advance actions, 2 rounds completed, and the elapsed seconds

#### Scenario: Chart finished

- **WHEN** the final stitch of the chart is counted and the user closes the screen
- **THEN** `tracking_session_end` reports the chart as completed

#### Scenario: Screen opened and closed immediately

- **WHEN** the user opens tracking and leaves within 2 seconds without advancing
- **THEN** no `tracking_session_end` event is sent

<!-- @trace
source: ga-knitting-events
updated: 2026-09-30
code:
  - marketing/reddit-posts.md
  - assets/screenshot/en/01.PNG
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/ravelry-posts.md
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/composite.py
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/marketing-strategy.md
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/en/02-build-pattern/scaffold.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - marketing/threads-jp-posts.md
  - assets/screenshot/en/03.PNG
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/build_cream_base.py
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/en/01-never-lose-place/dec.png
-->