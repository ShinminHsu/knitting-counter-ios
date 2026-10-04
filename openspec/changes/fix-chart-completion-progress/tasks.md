## 1. Setup

- [x] 1.1 Create branch `fix/chart-completion-progress` from `dev`

## 2. Fix

- [x] 2.1 Completed charts park on the last stitch of the last round — Completed chart stores a finished position: in `src/stores/useProgressStore.ts`, change the last-round branches of `advanceStitch` (lines 147–149) and `completeRound` (lines 197–199) to call `useProjectStore.getState().updateChart(projectId, chartId, { currentStitch: totalStitchesInRound(rounds[rounds.length - 1]) })` before `markChartComplete`, keeping `currentRound` unchanged
- [x] 2.2 One progress formula for every card — Chart progress reflects completion and stitch position: in `app/project/[id]/index.tsx`, replace the `chart.currentRound / totalRounds` formula in `ChartCard` (lines 78–81) with `calculateProgressPercentage(chart)` imported from `src/utils/progressUtils`, keeping the existing `totalRounds` display text unchanged

- [x] 2.3 Completion is derived from stored progress — Completion is recomputed when the chart changes: add `isChartCompleteByProgress(chart)` to `src/utils/progressUtils.ts` (the flag-independent half of `isChartComplete`, which then delegates to it), and in `useProjectStore.updateChart` recompute when `updates.rounds`, `updates.currentRound`, or `updates.currentStitch` is present — clamp `currentRound` into `[0, rounds.length - 1]` and `currentStitch` into `[0, calcRoundTotalStitches(current round)]`, set the chart's `isCompleted` from `isChartCompleteByProgress`, and set the project's `isCompleted` to whether every chart is complete

- [x] 2.4 One progress formula for every card — round counter: in `ChartCard`, pass `isChartComplete(chart) ? totalRounds : chart.currentRound` as the `current` value of `projectDetail.chartProgress` (and in the no-rounds fallback text), because `currentRound` is a 0-based index that stops at the last round when the chart completes

## 3. Verification

- [x] 3.1 Run `tsc --noEmit` under Node 20 and confirm no type errors
- [x] 3.2 Verify the progress rules with a Node harness against the compiled `useProgressStore`, `useProjectStore` and `calculateProgressPercentage`, using in-memory mocks: counting the final stitch marks completion and stores the last round's total; completing the last round does the same; completing an earlier round advances to stitch 0 of the next round without completing; a half-counted first round of two equal rounds reports about 25%; a chart with no rounds reports 0%; adding a round to a completed chart clears the chart and project flags and drops below 100%; finishing that added round completes it again; resetting a round on a completed chart clears completion; deleting rounds clamps the stored position; renaming a chart leaves completion untouched
- [ ] 3.3 [手動驗證] With the development build and `npx expo start --tunnel`: count a short chart to the end, confirm the completion animation, then check the project screen shows 100% with the completed badge; repeat using the complete-round button on the last round; reopen tracking for the completed chart and confirm it renders with every stitch counted (Completed chart remains viewable); then add a round to that completed chart and confirm the chart card and the home screen project card both drop below 100% and the completed badge disappears
- [ ] 3.4 Commit on `fix/chart-completion-progress` and ask the user before pushing to GitHub
