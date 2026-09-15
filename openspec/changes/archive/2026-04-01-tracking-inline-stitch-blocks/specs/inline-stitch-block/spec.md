## ADDED Requirements

### Requirement: Inline block unit

Each stitch item (single stitch, multi-count stitch, or group repetition) SHALL be rendered as a single flex item in the outer wrap container, with the label displayed above the symbols row.

#### Scenario: Single stitch renders as one inline item

- **WHEN** a pattern item is a single stitch (count = 1)
- **THEN** it SHALL render as one flex item showing only the stitch symbol (no separate label row)

#### Scenario: Multi-count stitch renders as one inline item

- **WHEN** a pattern item is a multi-count stitch (count > 1)
- **THEN** it SHALL render as one flex item with the label (e.g., `sc × 5`) above a row of individual symbols

#### Scenario: Group repetition renders as one inline item

- **WHEN** a pattern item is a group repetition
- **THEN** it SHALL render as one flex item with the group label (e.g., `群組 - 1`) above a row of symbols

#### Scenario: Mixed items flow continuously

- **WHEN** a round contains groups, multi-count stitches, and single stitches in sequence
- **THEN** all items SHALL flow in the same flex-wrap row, with no forced full-width breaks between them

### Requirement: Label tap completes entire item

The label area of a multi-count stitch or group block SHALL be a distinct tap target that advances progress to the end of that entire item.

#### Scenario: Tap label of multi-count stitch

- **WHEN** user taps the label of a multi-count stitch block (e.g., `sc × 5`)
- **THEN** progress SHALL advance to the physical end position of that stitch item

#### Scenario: Tap label of group repetition

- **WHEN** user taps the label of a group repetition block (e.g., `群組 - 1`)
- **THEN** progress SHALL advance to the physical end position of that group repetition

### Requirement: Individual symbol tap advances one stitch

Each symbol within a multi-count stitch or group block SHALL be a distinct tap target that advances progress to the end of that individual symbol.

#### Scenario: Tap individual symbol in multi-count stitch

- **WHEN** user taps a single symbol in a multi-count stitch block
- **THEN** progress SHALL advance to the `physicalEnd` of that symbol

#### Scenario: Tap individual symbol in group repetition

- **WHEN** user taps a single symbol in a group repetition block
- **THEN** progress SHALL advance to the `physicalEnd` of that symbol

### Requirement: Symbol status coloring is preserved

Each symbol SHALL reflect its completion status through color: completed (faded), current (primary color), upcoming (dark).

#### Scenario: Current symbol highlighted

- **WHEN** a symbol's `physicalStart` ≤ `currentStitch` < `physicalEnd`
- **THEN** that symbol SHALL be rendered in the primary color (#D97398)

#### Scenario: Completed symbol faded

- **WHEN** a symbol's `physicalEnd` ≤ `currentStitch`
- **THEN** that symbol SHALL be rendered with reduced opacity (0.2)
