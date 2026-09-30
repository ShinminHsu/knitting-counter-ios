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

- Clearing `isCompleted` when the user resets a round or edits the chart afterwards (existing behaviour, separate decision).
- Project-level completion: `markProjectComplete` has no call site anywhere, so project completion never happens.
- Changing the completion animation, the interstitial ad timing, or anything else in the tracking screen's completion flow.
- Reworking how progress is stored (for example moving to an absolute stitch counter).

## Decisions

### Completed charts park on the last stitch of the last round

When the last round completes, write `currentStitch = totalStitchesInRound(lastRound)` together with `markChartComplete`, leaving `currentRound` at the last index.

`calculateProgressPercentage` then reaches 100 from the stored position alone, and `isChartComplete` agrees, so the flag and the position no longer contradict each other.

Alternative: set `currentRound = rounds.length` (one past the end), which `isChartComplete` also treats as complete. Rejected because the tracking screen indexes `rounds[currentRound]` and renders from it; an out-of-range index would break that screen for completed charts.

### One progress formula for every card

`ChartCard` switches to `calculateProgressPercentage(chart)`. Beyond the completion bug, the old formula ignored progress within a round, so a chart sat at the same percentage until a whole round finished.

## Risks / Trade-offs

- [`currentStitch` equal to the round total is out of range for a stitch index] → `getCurrentStitchInfo` already returns `undefined` at that position, and the tracking screen's block state treats every block as counted; this is the same state the screen already reaches at the end of a round before rolling over.
- [Advancing again on a completed chart] → `advanceStitch` re-marks completion and returns `'chart'`, replaying the completion animation. Unchanged from today's behaviour.
- [Charts completed before this fix keep their stale position] → they already have `isCompleted: true`, and `calculateProgressPercentage` returns 100 from the flag, so the card is correct for them too once `ChartCard` uses it.
