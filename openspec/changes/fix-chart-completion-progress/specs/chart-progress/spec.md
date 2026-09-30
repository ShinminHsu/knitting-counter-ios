## ADDED Requirements

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

### Requirement: Chart progress reflects completion and stitch position

Every chart progress percentage shown in the app SHALL come from the shared progress calculation: 100 for a completed chart, otherwise the counted stitches across finished rounds plus the position within the current round, divided by the chart's total stitches.

#### Scenario: Completed chart on the project screen

- **WHEN** a chart with 3 rounds is completed and the user views the project screen
- **THEN** that chart's card shows 100% and the completed badge

#### Scenario: Progress within a round

- **WHEN** the user has counted half of the stitches in the first of two equally sized rounds
- **THEN** the chart card shows about 25%, not 0%

#### Scenario: Chart with no rounds

- **WHEN** a chart has no rounds
- **THEN** its card shows 0% and does not error

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

### Requirement: Completed chart remains viewable

Opening the tracking screen for a completed chart SHALL render the last round with every stitch shown as counted, without crashing.

#### Scenario: Reopening a completed chart

- **WHEN** the user opens tracking for a completed chart
- **THEN** the last round is displayed with all stitches marked as counted
