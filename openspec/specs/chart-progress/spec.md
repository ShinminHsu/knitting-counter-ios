# chart-progress Specification

## Purpose

TBD - created by archiving change 'fix-chart-completion-progress'. Update Purpose after archive.

## Requirements

### Requirement: Completed chart stores a finished position

When the last round of a chart is completed — by counting its final stitch or by completing the round — the system SHALL mark the chart completed and SHALL store `currentStitch` equal to that round's total stitch count, keeping `currentRound` at the last round's index.

#### Scenario: Final stitch counted

- **WHEN** the user counts the last stitch of the last round
- **THEN** the chart is marked completed and its stored position is the last round with all of that round's stitches counted

#### Scenario: Last round completed with the round button

- **WHEN** the user taps complete round while on the last round
- **THEN** the chart is marked completed and its stored position is the last round with all of that round's stitches counted

#### Scenario: Earlier round completed

- **WHEN** the user completes a round that is not the last one
- **THEN** the chart moves to the next round at stitch position 0 and is not marked completed


<!-- @trace
source: fix-chart-completion-progress
updated: 2026-10-04
code:
  - marketing/reddit-posts.md
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/threads-jp-posts.md
  - screenshots/ja/02-build-pattern/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/05-group-repeat/dec.png
  - assets/screenshot/en/03.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - marketing/ravelry-posts.md
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/composite.py
  - screenshots/zh-TW/04-crochet-library/final.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - marketing/marketing-strategy.md
  - assets/screenshot/en/02.PNG
  - screenshots/en/03-knitting-library/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/en/02-build-pattern/dec.png
-->

---
### Requirement: Chart progress reflects completion and stitch position

Every chart progress percentage shown in the app SHALL come from the shared progress calculation: 100 for a completed chart, otherwise the counted stitches across finished rounds plus the position within the current round, divided by the chart's total stitches.

#### Scenario: Completed chart on the project screen

- **WHEN** a chart with 3 rounds is completed and the user views the project screen
- **THEN** that chart's card shows 100% and the completed badge

#### Scenario: Progress within a round

- **WHEN** the user has counted half of the stitches in the first of two equally sized rounds
- **THEN** the chart card shows about 25%, not 0%

#### Scenario: Round counter on a completed chart

- **WHEN** a chart with 6 rounds is completed
- **THEN** its card reads 6 of 6 rounds, not 5 of 6

#### Scenario: Round counter in progress

- **WHEN** the user has finished 5 of 6 rounds and is partway through the sixth
- **THEN** its card reads 5 of 6 rounds

#### Scenario: Chart with no rounds

- **WHEN** a chart has no rounds
- **THEN** its card shows 0% and does not error


<!-- @trace
source: fix-chart-completion-progress
updated: 2026-10-04
code:
  - marketing/reddit-posts.md
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/threads-jp-posts.md
  - screenshots/ja/02-build-pattern/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/05-group-repeat/dec.png
  - assets/screenshot/en/03.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - marketing/ravelry-posts.md
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/composite.py
  - screenshots/zh-TW/04-crochet-library/final.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - marketing/marketing-strategy.md
  - assets/screenshot/en/02.PNG
  - screenshots/en/03-knitting-library/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/en/02-build-pattern/dec.png
-->

---
### Requirement: Completion is recomputed when the chart changes

When a chart update changes its rounds or its stored position, the system SHALL clamp the position into the current round list and recompute the chart's completed state from that position, and SHALL recompute the project's completed state from its charts. Updates that change neither rounds nor position MUST leave the completed state untouched. This derivation SHALL be a single shared routine, so that chart edits and whole-project writes cannot diverge.

#### Scenario: Round added to a completed chart

- **WHEN** a round is added to a completed chart
- **THEN** the chart is no longer completed, its card shows less than 100%, and the project is no longer completed

#### Scenario: Round reset on a completed chart

- **WHEN** the user resets the current round of a completed chart
- **THEN** the chart is no longer completed

#### Scenario: Finishing the newly added round

- **WHEN** the user counts every stitch of the round that was added to a previously completed chart
- **THEN** the chart is completed again and shows 100%

#### Scenario: Rounds deleted past the stored position

- **WHEN** rounds are deleted so that the stored round index would point past the end
- **THEN** the position is clamped to the last remaining round and its stitch count

#### Scenario: Renaming a chart

- **WHEN** only a chart's name or notes are updated
- **THEN** its completed state is unchanged


<!-- @trace
source: fix-import-progress-recalc
updated: 2026-10-04
code:
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/reddit-posts.md
  - screenshots/composite.py
  - screenshots/en/04-crochet-library/final.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/build_cream_base.py
  - marketing/ravelry-posts.md
  - assets/screenshot/en/04.PNG
  - assets/screenshot/en/03.PNG
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - marketing/marketing-strategy.md
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/swap_screen.py
  - screenshots/en/02-build-pattern/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - assets/screenshot/en/05.PNG
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - marketing/threads-jp-posts.md
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
-->

---
### Requirement: Completed chart remains viewable

Opening the tracking screen for a completed chart SHALL render the last round with every stitch shown as counted, without crashing.

#### Scenario: Reopening a completed chart

- **WHEN** the user opens tracking for a completed chart
- **THEN** the last round is displayed with all stitches marked as counted

<!-- @trace
source: fix-chart-completion-progress
updated: 2026-10-04
code:
  - marketing/reddit-posts.md
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/swap_screen.py
  - marketing/threads-jp-posts.md
  - screenshots/ja/02-build-pattern/final.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/01-never-lose-place/final.png
  - screenshots/en/05-group-repeat/dec.png
  - assets/screenshot/en/03.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - screenshots/build_cream_base.py
  - assets/screenshot/en/05.PNG
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
  - marketing/ravelry-posts.md
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/composite.py
  - screenshots/zh-TW/04-crochet-library/final.png
  - assets/screenshot/en/04.PNG
  - screenshots/en/04-crochet-library/final.png
  - marketing/marketing-strategy.md
  - assets/screenshot/en/02.PNG
  - screenshots/en/03-knitting-library/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/en/02-build-pattern/final.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/en/02-build-pattern/dec.png
-->

---
### Requirement: Completion is recomputed when a project is written whole

Every path that writes a complete project into the store — importing as a new project, importing over an existing project, merging imported charts into an existing project, and restoring from iCloud — SHALL derive each chart's completed state from the incoming position rather than from the incoming `isCompleted` value, and SHALL derive the project's completed state from its charts. A stored completed flag whose position lies outside the last round MUST NOT be honoured.

Because an older build could leave a finished chart's position a few stitches short of its last round's total, a whole-project write SHALL treat an incoming completed flag as evidence of that defect when the incoming position already sits in the last round: the position is snapped to that round's total and the chart stays completed. This allowance SHALL apply only to whole-project writes, never to chart edits.

#### Scenario: Importing a file whose completed flag is stale

- **WHEN** the user imports a project file whose chart carries `isCompleted: true` while its stored position sits in a round before the last one
- **THEN** the imported chart is not completed, its card shows the percentage implied by the stored position, and the project is not completed

#### Scenario: Importing a chart finished by an older build

- **WHEN** the user imports a chart carrying `isCompleted: true` whose position sits in the last round but short of that round's total
- **THEN** the position is snapped to that round's total and the chart imports as completed at 100%

#### Scenario: Resetting a round after importing a completed chart

- **WHEN** the user resets the current round of a chart that imported as completed
- **THEN** the chart is no longer completed and its position is 0, because the allowance for older builds does not apply to chart edits

#### Scenario: Importing a genuinely finished project

- **WHEN** the user imports a project whose chart position sits at the end of its last round
- **THEN** the imported chart is completed and shows 100%

#### Scenario: Importing a position past the end of the rounds

- **WHEN** the imported chart's stored round index points past the last round
- **THEN** the position is clamped to the last round and its stitch count, and the chart is completed

#### Scenario: Importing a stitch position beyond the round total

- **WHEN** the imported chart's stored stitch position exceeds the total stitches of its current round
- **THEN** the position is clamped to that round's total

#### Scenario: Merging charts into a completed project

- **WHEN** the user merges imported charts into a project that is currently completed, and at least one incoming chart is unfinished
- **THEN** the project is no longer completed

#### Scenario: Importing a project with no charts

- **WHEN** the imported project contains an empty chart list
- **THEN** the project is not completed

#### Scenario: Restoring from iCloud

- **WHEN** a project is restored from an iCloud backup whose payload carries a stale completed flag
- **THEN** the restored project's completed state matches what importing the same payload would produce

<!-- @trace
source: fix-import-progress-recalc
updated: 2026-10-04
code:
  - screenshots/en/01-never-lose-place/scaffold.png
  - screenshots/en/02-build-pattern/scaffold.png
  - screenshots/zh-TW/03-knitting-library/scaffold.png
  - screenshots/en/05-group-repeat/final.png
  - screenshots/en/01-never-lose-place/final.png
  - marketing/reddit-posts.md
  - screenshots/composite.py
  - screenshots/en/04-crochet-library/final.png
  - screenshots/en/03-knitting-library/final.png
  - screenshots/en/05-group-repeat/scaffold.png
  - screenshots/ja/03-knitting-library/final.png
  - screenshots/ja/05-group-repeat/final.png
  - screenshots/ja/02-build-pattern/final.png
  - screenshots/build_cream_base.py
  - marketing/ravelry-posts.md
  - assets/screenshot/en/04.PNG
  - assets/screenshot/en/03.PNG
  - screenshots/zh-TW/04-crochet-library/scaffold.png
  - marketing/marketing-strategy.md
  - screenshots/zh-TW/02-build-pattern/final.png
  - screenshots/zh-TW/04-crochet-library/final.png
  - screenshots/ja/05-group-repeat/scaffold.png
  - screenshots/en/04-crochet-library/dec.png
  - screenshots/en/03-knitting-library/dec.png
  - screenshots/swap_screen.py
  - screenshots/en/02-build-pattern/final.png
  - assets/screenshot/en/02.PNG
  - screenshots/ja/01-never-lose-place/final.png
  - screenshots/ja/02-build-pattern/scaffold.png
  - screenshots/ja/03-knitting-library/scaffold.png
  - screenshots/recolor_cream.py
  - screenshots/zh-TW/01-never-lose-place/final.png
  - screenshots/zh-TW/03-knitting-library/final.png
  - assets/screenshot/en/05.PNG
  - screenshots/en/03-knitting-library/scaffold.png
  - screenshots/en/01-never-lose-place/dec.png
  - screenshots/ja/01-never-lose-place/scaffold.png
  - assets/screenshot/en/01.PNG
  - screenshots/en/05-group-repeat/dec.png
  - screenshots/zh-TW/01-never-lose-place/scaffold.png
  - screenshots/ja/04-crochet-library/final.png
  - screenshots/en/04-crochet-library/scaffold.png
  - screenshots/zh-TW/02-build-pattern/scaffold.png
  - screenshots/zh-TW/05-group-repeat/final.png
  - marketing/threads-jp-posts.md
  - screenshots/en/02-build-pattern/dec.png
  - screenshots/ja/04-crochet-library/scaffold.png
  - screenshots/zh-TW/05-group-repeat/scaffold.png
-->