## Problem

Importing a project JSON that was exported by an older build of this app shows the chart card and the project at 100% even though the imported position is only part-way through the pattern. The user reported this after importing a mid-progress project: both the chart progress and the project progress read 100%.

The same hole exists on the iCloud restore path (`src/services/icloudBackupService.ts:683`), which writes a restored project through the same store action.

## Root Cause

Two things combine.

1. **Stale flags in the file.** Older builds had the defect fixed by `fix-chart-completion-progress`: a chart marked completed stayed `isCompleted: true` even after rounds were added. That wrong value was persisted into user data, and `exportProject` copies `chart.isCompleted` and `project.isCompleted` straight into the export file. Those files are already out in the wild and cannot be corrected retroactively.

2. **The import path trusts the file.** `useProjectStore.importProject` and `useProjectStore.overwriteProject` write the incoming `Project` into the store verbatim — no clamping, no recomputation:

   ```ts
   importProject: (project) => set((state) => ({ projects: [...state.projects, project] }))
   ```

   `updateChart` already clamps the position and re-derives `isCompleted` via `isChartCompleteByProgress` whenever rounds or position change, but import does not go through `updateChart`, so that logic never runs. Display then short-circuits on the stale flag: `calculateProgressPercentage` starts with `if (chart.isCompleted) return 100`, and `isProjectComplete` starts with `if (project.isCompleted) return true`.

Merging charts into an existing project (`ImportMode.MERGE_PATTERN`) has a third variant of the same problem: `mergeProjectCharts` appends charts and the project-level `isCompleted` is never revisited, so a completed project stays completed after incomplete charts are added to it.

## Proposed Solution

Extract the derivation that `updateChart` performs today into one pure function in `src/utils/progressUtils.ts`:

```ts
withDerivedCompletion(project: Project): Project
```

For each chart it clamps `currentRound` into `[0, rounds.length - 1]`, clamps `currentStitch` into `[0, calcRoundTotalStitches(round)]`, and overwrites `isCompleted` with `isChartCompleteByProgress(chart)`. It then overwrites the project's `isCompleted` with `charts.length > 0 && charts.every((c) => c.isCompleted)`.

Apply it at every point where a whole project enters the store — `importProject` and `overwriteProject` — and rewrite `updateChart` to call the same function, so the two code paths cannot drift apart. Because `overwriteProject` is also what iCloud restore calls, the restore path is covered by the same change.

The imported position is treated as the source of truth and the stored flag is never honoured directly, which is what makes a poisoned old file heal on the way in.

One narrow exception applies on the import and restore path only, behind an explicit `trustCompletedInLastRound` option. Older builds also had the defect where finishing the last round left `currentStitch` short of that round's total, so a genuinely finished chart in an old file carries `isCompleted: true` with a position a few stitches from the end. When the flag says completed *and* the position already sits in the last round, the position is snapped to that round's total and the chart stays completed. The poisoned case this change exists to fix is unaffected, because adding a round moves the stored position out of the last round.

`updateChart` must not enable that option: resetting the current round of a completed chart would otherwise be undone by the stale flag, breaking the existing `chart-progress` behavior.

A stored round index that points past the end of the rounds is also snapped to the end of the last round, matching the existing spec wording for rounds deleted past the stored position.

## Non-Goals

- Changing the export file format or its `version` field; old files must keep importing.
- A persistence migration for already-stored projects. Data on the device is corrected by `updateChart` the next time the chart is touched, and `migrate` in the persist config stays as it is.
- Changing the iCloud backup merge strategy (which copy wins on conflict) — only the completion derivation applied to the restored project.
- Changes to the import preview UI.
- Localization or any other display-layer change.

## Success Criteria

- A project whose file says `isCompleted: true` but whose position is part-way through imports as not completed, and the chart card shows the percentage implied by the position.
- `ImportMode.MERGE_PATTERN` into a completed project leaves the project not completed once an incomplete chart is added.
- A genuinely finished project (position at the end of the last round) still imports as 100%.
- A chart whose stored `currentRound` points past the end of `rounds` is clamped to the last round with its position snapped to that round's total.
- A chart that an older build finished, whose flag says completed and whose position sits in the last round, still imports as 100%.
- Resetting the current round of a completed chart still un-completes it, i.e. the trust rule does not leak into `updateChart`.
- iCloud restore produces the same derived state as import for the same project payload.
- `updateChart` behavior is unchanged: the scenarios in the `chart-progress` spec still hold.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `chart-progress`: the requirement "Completion is recomputed when the chart changes" extends beyond chart edits to cover every path that writes a whole project into the store — import (create / overwrite / merge) and iCloud restore.

## Impact

- Affected specs: `chart-progress` (modified)
- Affected code:
  - `src/utils/progressUtils.ts` (new `withDerivedCompletion`)
  - `src/stores/useProjectStore.ts` (`importProject`, `overwriteProject`, `updateChart`)
- Covered without edits, because they call `overwriteProject`: `src/services/icloudBackupService.ts`, `app/project/[id]/import-export.tsx`
- No native changes; reaching users requires a new build.
