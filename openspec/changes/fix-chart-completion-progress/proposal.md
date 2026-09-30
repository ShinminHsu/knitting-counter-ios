## Problem

Finishing a chart leaves its progress below 100%. On the tracking screen, tapping "complete round" on the last round — or counting the final stitch — plays the completion animation and marks the chart completed, but the chart card in the project screen still shows a partial percentage (a 3-round chart shows 67%).

## Root Cause

Two independent defects:

1. `src/stores/useProgressStore.ts` only flags completion. `completeRound` (lines 197–199) and `advanceStitch` (lines 147–149) call `markChartComplete` on the last round without touching `currentRound` / `currentStitch`, so the stored position still points at a stitch in the middle of the last round.
2. `ChartCard` in `app/project/[id]/index.tsx` (lines 78–81) computes progress as `chart.currentRound / rounds.length`, ignoring both `isCompleted` and the position within the round. The project already has `calculateProgressPercentage` (`src/utils/progressUtils.ts`), which returns 100 when `isCompleted` and otherwise counts stitches; the home screen project card uses it, which is why the wrong number only appears on the project screen.

## Proposed Solution

1. When the last round completes (both entry points), set `currentStitch` to that round's total stitch count alongside `markChartComplete`, keeping `currentRound` at the last round's index so `rounds[currentRound]` stays valid for the tracking screen.
2. Make `ChartCard` use `calculateProgressPercentage(chart)` instead of its own round-index formula.

## Non-Goals (optional)

(covered in design.md)

## Success Criteria

- Counting the final stitch of the last round shows 100% on the project screen's chart card, and the completed badge appears.
- Tapping "complete round" on the last round gives the same result.
- A chart in progress still shows a percentage that grows as stitches are counted within a round, not only when the round changes.
- Reopening the tracking screen for a completed chart does not crash and shows every stitch as counted.
- `tsc --noEmit` passes.

## Impact

- Affected specs: `chart-progress` (new)
- Affected code: `src/stores/useProgressStore.ts`, `app/project/[id]/index.tsx`
