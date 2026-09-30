## 1. Setup

- [x] 1.1 Create branch `fix/chart-completion-progress` from `dev`

## 2. Fix

- [x] 2.1 Completed charts park on the last stitch of the last round — Completed chart stores a finished position: in `src/stores/useProgressStore.ts`, change the last-round branches of `advanceStitch` (lines 147–149) and `completeRound` (lines 197–199) to call `useProjectStore.getState().updateChart(projectId, chartId, { currentStitch: totalStitchesInRound(rounds[rounds.length - 1]) })` before `markChartComplete`, keeping `currentRound` unchanged
- [x] 2.2 One progress formula for every card — Chart progress reflects completion and stitch position: in `app/project/[id]/index.tsx`, replace the `chart.currentRound / totalRounds` formula in `ChartCard` (lines 78–81) with `calculateProgressPercentage(chart)` imported from `src/utils/progressUtils`, keeping the existing `totalRounds` display text unchanged

## 3. Verification

- [x] 3.1 Run `tsc --noEmit` under Node 20 and confirm no type errors
- [x] 3.2 Verify the progress rules with a Node harness against the compiled `useProgressStore` and `calculateProgressPercentage`, using in-memory mocks: counting the final stitch marks completion and stores the last round's total; completing the last round does the same; completing an earlier round advances to stitch 0 of the next round without completing; a half-counted first round of two equal rounds reports about 25%; a chart with no rounds reports 0%
- [ ] 3.3 [手動驗證] With the development build and `npx expo start --tunnel`: count a short chart to the end, confirm the completion animation, then check the project screen shows 100% with the completed badge; repeat using the complete-round button on the last round; reopen tracking for the completed chart and confirm it renders with every stitch counted (Completed chart remains viewable)
- [ ] 3.4 Commit on `fix/chart-completion-progress` and ask the user before pushing to GitHub
