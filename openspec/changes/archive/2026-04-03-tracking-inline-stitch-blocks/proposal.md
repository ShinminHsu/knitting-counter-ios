## Why

The progress tracking screen currently forces groups and multi-count stitches onto separate lines via full-width header blocks, creating visual misalignment when mixed with single stitches — subsequent items align with the symbol row instead of the label row. Switching to inline-block layout makes the stitch stream continuous and visually consistent.

## What Changes

- Groups and multi-count stitches are rendered as single inline-block units (label on top, symbols below) instead of two separate full-width/inline blocks
- All blocks — single stitches, multi-count stitches, and group repetitions — participate in the same `flexWrap: 'row'` container and flow continuously
- Tapping a label (e.g., `sc × 70` or `群組 - 1`) still completes the entire item at once
- Individual symbols within multi-count stitches remain individually tappable for single-stitch progress advancement
- Individual symbols within groups also become individually tappable (advances to that symbol's `physicalEnd`)

## Non-Goals (optional)

<!-- omitted — design.md will be created -->

## Capabilities

### New Capabilities

- `inline-stitch-block`: Visual layout unit that renders a stitch item (single, multi-count, or group) as a self-contained inline block with a tappable label row above a tappable symbol row, participating in a flex-wrap stream

### Modified Capabilities

(none — no existing Spectra specs to update)

## Impact

- Affected code:
  - `app/project/[id]/tracking.tsx` — `expandToBlocks`, `StitchBlock` interface, `StitchBlockRow` component, `blockStyles`, `styles.headerBlockWrapper`
