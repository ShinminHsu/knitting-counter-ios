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

### Requirement: Completed chart remains viewable

Opening the tracking screen for a completed chart SHALL render the last round with every stitch shown as counted, without crashing.

#### Scenario: Reopening a completed chart

- **WHEN** the user opens tracking for a completed chart
- **THEN** the last round is displayed with all stitches marked as counted
