## Context

`app/project/[id]/tracking.tsx` renders a progress-tracking screen for knitting charts. The screen displays a stream of "stitch blocks" in a `flexDirection: 'row', flexWrap: 'wrap'` container.

Currently each group repetition and multi-count stitch is split into **two** flex items:
1. A **header block** (`isHeader: true`, `width: '100%'`) — label only, forces a full-width row
2. A **symbols block** — the actual stitch icons/abbreviations, flows inline

This means the item after a group ends up on the **same row as the symbols**, not next to the label, causing misalignment.

Single stitches (`count === 1`) are already a single inline item (label = abbr, one symbol).

Key types involved:
- `StitchBlock` — data model for one renderable unit
- `SymbolEntry` — a single stitch symbol with its physical position range
- `StitchBlockRow` — React component that renders one `StitchBlock`
- `expandToBlocks(round)` — converts a `Round`'s `patternItems` into a flat `StitchBlock[]`

## Goals / Non-Goals

**Goals:**
- Groups and multi-count stitches render as a single inline-block unit (label above, symbols below)
- All block types participate in the same outer flex-wrap stream
- Label tap → complete the whole item (existing behavior, preserved)
- Individual symbol tap → advance progress to that symbol's end (existing for multi-count; extended to groups)

**Non-Goals:**
- Changing the progress store or `currentStitch` model
- Changing any other screen (editor, round editor, etc.)
- Adding animations or transition effects
- Changing the display-mode toggle (icon vs. text abbreviation)

## Decisions

### Remove isHeader flag and merge label+symbols into one block

**Decision**: Eliminate `isHeader: true` blocks entirely. Each `StitchBlock` always contains both a `label` (possibly empty for single stitches with `count === 1` where the abbr is the label) and its `symbols`. A new optional flag `labelTapsToEnd: boolean` indicates that tapping the label should jump to `tapEndPos` (complete-all), while tapping individual symbols advances one symbol at a time.

**Alternatives considered**:
- Keep header as a separate block but make it not full-width → header and symbols are still separate flex items; items after the group still align to the symbol row, not the label row.
- Nest header+symbols in a wrapper View inside the flat list → requires adding wrapper logic in the render loop while keeping two `StitchBlock` entries.

**Rationale**: A single data entry per visual unit is simpler and solves the alignment issue at the data level.

### StitchBlockRow renders label as a separate TouchableOpacity above the symbols row

**Decision**: When `block.label` is non-empty, render a `TouchableOpacity` for the label (calls `onLabelPress`) above a `View` containing individual symbol `TouchableOpacity` elements (each calls `onSymbolPress(symbol)`). The outer wrapper is a plain `View` with `alignSelf: 'flex-start'`.

**Alternatives considered**:
- One `TouchableOpacity` wrapping the whole block → can't distinguish label tap from symbol tap.
- `onPress` prop polymorphism (pass function that receives tap zone) → more complex, less explicit.

**Rationale**: Two explicit handlers are clear and match the two distinct interactions.

### Individual symbols in groups become tappable

**Decision**: Group repetition symbols (previously one monolithic block tapped as a whole) are each given their own `physicalEnd`, allowing `onSymbolPress` to advance to that symbol's end position. Tapping the group label still advances to the full group's `tapEndPos`.

**Rationale**: Consistency with multi-count stitch behavior; allows finer progress control inside groups.

### alignSelf: 'flex-start' on the outer block View

**Decision**: Each non-single-stitch block View uses `alignSelf: 'flex-start'` so it shrinks to its content width and does not stretch to fill the row.

**Rationale**: Without this, Views in a `flexWrap: 'row'` container stretch to the cross-axis (full container height), breaking the inline flow.

### symbols within a block do not wrap

**Decision**: The symbols `View` inside a block uses `flexDirection: 'row'` without `flexWrap`. If a group or multi-count stitch has many symbols, the block takes its natural (possibly wide) width and the outer `flexWrap` will place it on a new row when it doesn't fit.

**Alternatives considered**:
- Allow symbols to wrap within a block → the block View needs a bounded width; `alignSelf: 'flex-start'` would collapse width to the minimum (one symbol wide), stacking symbols vertically.
- Give the block a percentage max-width → arbitrary and breaks alignment for small groups.

**Rationale**: Groups in knitting patterns are typically short (2–8 symbols). Multi-count stitches like `sc × 70` are wide and naturally land on their own row, which is acceptable.

## Risks / Trade-offs

- [Wide multi-count blocks] `sc × 70` will be ~2000px wide and always occupy its own row → acceptable; this matches how the header+symbols approach already behaved (header forced a new line anyway).
- [blockYPositions tracking] The `onLayout` callback currently records `y` for every block key. After the merge, header keys no longer exist; ensure `onLayout` is attached to the single merged block wrapper so scroll-to-active still works.
- [handleBlockTap logic] Any logic branching on `block.isHeader` must be updated to use `block.labelTapsToEnd` or equivalent.
