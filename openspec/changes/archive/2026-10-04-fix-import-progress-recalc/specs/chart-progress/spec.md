## MODIFIED Requirements

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

## ADDED Requirements

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
