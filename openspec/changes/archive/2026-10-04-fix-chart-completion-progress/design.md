## Context

- `Chart` stores progress as `currentRound` (index) plus `currentStitch` (position inside that round) and an `isCompleted` flag set by `useProjectStore.markChartComplete`.
- `useProgressStore.advanceStitch` moves to the next logical stitch, rolls into the next round, and on the last round calls `markChartComplete` only. `completeRound` skips the rest of the round and behaves the same way on the last round.
- `src/utils/progressUtils.ts` already has `calculateProgressPercentage` (100 when `isCompleted`, otherwise completed-round stitches plus `currentStitch` over total) and `isChartComplete` (true when `currentRound` is past the last index, or the last round's stitches are all counted).
- The home screen project card uses `calculateProgressPercentage`; the project screen's `ChartCard` has its own `currentRound / rounds.length` formula.
- The tracking screen reads `rounds[currentRound]` directly and derives block state from `currentStitch`.

## Goals / Non-Goals

**Goals:**

- A completed chart reads as 100% everywhere.
- In-progress percentages reflect stitches counted inside the current round.
- Stored progress and the `isCompleted` flag agree with each other.

**Non-Goals:**

- The unused `markProjectComplete` action: `markChartComplete` already maintains the project flag, and no screen calls `markProjectComplete`.
- Re-showing the completion animation when a chart becomes complete again after an edit.
- Changing the completion animation, the interstitial ad timing, or anything else in the tracking screen's completion flow.
- Reworking how progress is stored (for example moving to an absolute stitch counter).

## Decisions

### Completed charts park on the last stitch of the last round

When the last round completes, write `currentStitch = totalStitchesInRound(lastRound)` together with `markChartComplete`, leaving `currentRound` at the last index.

`calculateProgressPercentage` then reaches 100 from the stored position alone, and `isChartComplete` agrees, so the flag and the position no longer contradict each other.

Alternative: set `currentRound = rounds.length` (one past the end), which `isChartComplete` also treats as complete. Rejected because the tracking screen indexes `rounds[currentRound]` and renders from it; an out-of-range index would break that screen for completed charts.

### Completion is derived from stored progress

`isCompleted` is currently one-way: `markChartComplete` sets it on the chart and sets the project's flag when every chart is complete, and nothing ever clears either. Both `calculateProgressPercentage` and `projectHelpers` short-circuit to 100 on those flags, so a completed chart that gains a new round keeps reporting 100%.

`useProjectStore.updateChart` becomes the single place that maintains the flags. When the update touches `rounds`, `currentRound`, or `currentStitch`:

1. Clamp the position into the new round list — `currentRound` into `[0, rounds.length - 1]`, then `currentStitch` into `[0, total stitches of that round]` — so deleting rounds cannot leave the position past the end.
2. Set the chart's `isCompleted` from the clamped position using a new flag-independent helper `isChartCompleteByProgress` in `src/utils/progressUtils.ts`; `isChartComplete` keeps its flag check and delegates to it.
3. Set the project's `isCompleted` to whether every chart is now complete.

Adding a round to a completed chart therefore clears both flags, and finishing that new round sets them again. Resetting a round clears them for the same reason. Updates that only change a chart's name or notes leave the flags untouched.

Alternative: clear `isCompleted` only in the round-editing actions of `useChartStore`. Rejected because those are ten separate call sites, all of which already funnel through `updateChart`, and each new editing action would have to remember the rule.

Alternative: drop the stored flags and derive completion at read time. Rejected as a larger change — the flags are persisted, exported, and read in several screens.

### One progress formula for every card

`ChartCard` switches to `calculateProgressPercentage(chart)`. Beyond the completion bug, the old formula ignored progress within a round, so a chart sat at the same percentage until a whole round finished.

## Risks / Trade-offs

- [`currentStitch` equal to the round total is out of range for a stitch index] → `getCurrentStitchInfo` already returns `undefined` at that position, and the tracking screen's block state treats every block as counted; this is the same state the screen already reaches at the end of a round before rolling over.
- [Advancing again on a completed chart] → `advanceStitch` re-marks completion and returns `'chart'`, replaying the completion animation. Unchanged from today's behaviour.
- [Charts completed before this fix keep their stale position] → they already have `isCompleted: true`, and `calculateProgressPercentage` returns 100 from the flag, so the card is correct for them too once `ChartCard` uses it. The first edit to such a chart recomputes the flag from its position, which is the intended behaviour.
- [Recomputing on every stitch tap] → the check only measures the current round's stitches, and only when the position reaches the last round; the tracking hot path already rewrites the whole project on each tap.
- [A chart completed by an edit rather than by counting] → for example deleting the unfinished tail rounds marks the chart complete without the animation. Acceptable: the progress shown then matches the pattern.
