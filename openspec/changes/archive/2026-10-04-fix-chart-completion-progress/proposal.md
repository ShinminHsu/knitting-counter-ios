## Problem

Chart completion and progress disagree with what the user sees.

1. Finishing a chart leaves its progress below 100%. Tapping "complete round" on the last round — or counting the final stitch — plays the completion animation and marks the chart completed, but the chart card in the project screen still shows a partial percentage (a 3-round chart shows 67%).
2. A completed chart stays at 100% forever. Adding rounds or editing the pattern afterwards does not clear the completed flag, so both the chart card and the project card keep reporting 100% even though there is new work to do.

## Root Cause

1. `src/stores/useProgressStore.ts` only flags completion. `completeRound` and `advanceStitch` call `markChartComplete` on the last round without touching `currentRound` / `currentStitch`, so the stored position still points at a stitch in the middle of the last round.
2. `ChartCard` in `app/project/[id]/index.tsx` computed progress as `chart.currentRound / rounds.length`, ignoring both `isCompleted` and the position within the round, while the home screen used the shared `calculateProgressPercentage`.
3. `isCompleted` is written once and never revisited. `markChartComplete` sets it on the chart and sets the project's `isCompleted` when every chart is complete; nothing clears either flag when rounds are added, edited, or deleted. `calculateProgressPercentage` and `projectHelpers` short-circuit to 100 on those flags, so the stale value wins. Deleting rounds can also leave `currentRound` pointing past the end of the shortened round list.

## Proposed Solution

1. When the last round completes (both entry points), set `currentStitch` to that round's total stitch count alongside `markChartComplete`, keeping `currentRound` at the last round's index.
2. Make `ChartCard` use `calculateProgressPercentage(chart)` instead of its own round-index formula.
3. Derive completion instead of trusting a one-way flag: whenever `updateChart` receives `rounds`, `currentRound`, or `currentStitch`, clamp the position into the current round list and recompute the chart's `isCompleted` from that position, then recompute the project's `isCompleted` from its charts.

## Non-Goals (optional)

(covered in design.md)

## Success Criteria

- Counting the final stitch of the last round shows 100% on the project screen's chart card, and the completed badge appears.
- Tapping "complete round" on the last round gives the same result.
- Adding a round to a completed chart drops it below 100% and removes the completed badge; the project card stops reporting 100% too.
- Resetting the current round of a completed chart also clears completion.
- Deleting rounds never leaves the stored position past the end of the chart.
- A chart in progress still shows a percentage that grows as stitches are counted within a round, not only when the round changes.
- Reopening the tracking screen for a completed chart does not crash and shows every stitch as counted.
- `tsc --noEmit` passes.

## Impact

- Affected specs: `chart-progress` (new)
- Affected code: `src/stores/useProgressStore.ts`, `src/stores/useProjectStore.ts`, `src/utils/progressUtils.ts`, `app/project/[id]/index.tsx`
