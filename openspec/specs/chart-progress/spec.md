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

When a chart update changes its rounds or its stored position, the system SHALL clamp the position into the current round list and recompute the chart's completed state from that position, and SHALL recompute the project's completed state from its charts. Updates that change neither rounds nor position MUST leave the completed state untouched.

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