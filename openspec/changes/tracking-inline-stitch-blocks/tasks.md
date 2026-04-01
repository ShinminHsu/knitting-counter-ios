## 1. Data Model

- [x] 1.1 Update `StitchBlock` interface in `tracking.tsx` to remove isHeader flag and merge label+symbols into one block: add `labelTapsToEnd?: boolean` (true when tapping the label should jump to `tapEndPos`), ensure `symbols` array is always present
- [x] 1.2 Update `expandToBlocks` for multi-count stitches: replace the separate header block + individual symbol blocks with one merged block — set `label` to `${abbr} × ${count}`, `labelTapsToEnd: true`, `tapEndPos` to the item end, and populate `symbols` with all individual `SymbolEntry` objects (each with their own `physicalStart`/`physicalEnd`) to support inline stitch block unit and individual symbol tap advances one stitch
- [x] 1.3 Update `expandToBlocks` for group repetitions: individual symbols in groups become tappable — replace the separate header block + monolithic symbols block with one merged block, set `label` to `${group.name} - ${r + 1}`, `labelTapsToEnd: true`, `tapEndPos` to the repeat end, and populate `symbols` with individual `SymbolEntry` objects per stitch to support inline stitch block unit

## 2. Component — StitchBlockRow

- [x] 2.1 Remove the `if (block.isHeader)` branch from `StitchBlockRow`; the component now always renders label + symbols in a vertical stack
- [x] 2.2 StitchBlockRow renders label as a separate TouchableOpacity above the symbols row: implement label `TouchableOpacity` (calls `onLabelPress`) above the symbols row, render only when `block.label` is non-empty, apply existing active/completed styles — implements label tap completes entire item
- [x] 2.3 Implement each symbol in the symbols row as an individual `TouchableOpacity` (calls `onSymbolPress(symbol)`) instead of a plain `View` or `Text` — this implements individual symbol tap advances one stitch
- [x] 2.4 Update component props: replace single `onPress: () => void` with `onLabelPress: () => void` and `onSymbolPress: (symbol: SymbolEntry) => void`
- [x] 2.5 alignSelf: 'flex-start' on the outer block View — wrap the whole block in a plain `View` with `alignSelf: 'flex-start'` so it participates correctly in the outer flex-wrap stream (inline block unit, mixed items flow continuously)

## 3. Styles

- [x] 3.1 Remove `headerRow` and `headerLabel` styles from `blockStyles` (no longer used)
- [x] 3.2 Add `blockWrapper` style: `alignSelf: 'flex-start'`, `marginRight: 16`, `marginBottom: 14` (replaces per-block `marginRight` on `row`)
- [x] 3.3 Update `symbolsRow` style: remove `flexWrap: 'wrap'` (symbols within a block do not wrap per design decision); keep `flexDirection: 'row'`, `gap: 6`, `alignItems: 'center'`

## 4. Render Loop & Event Handlers

- [x] 4.1 In `blocks.map(...)`, remove the `block.isHeader ? styles.headerBlockWrapper : undefined` conditional wrapper style; the wrapper `View` is now always unstyled (layout handled by `blockWrapper` inside `StitchBlockRow`)
- [x] 4.2 Update `handleBlockTap` call sites: replace `onPress={() => handleBlockTap(block)}` with separate `onLabelPress` and `onSymbolPress` handlers; for `onLabelPress` use existing `handleBlockTap(block)` logic (advance to `tapEndPos`); for `onSymbolPress(symbol)` advance `currentStitch` to `symbol.physicalEnd`
- [x] 4.3 Verify `blockYPositions` tracking: ensure `onLayout` is attached to the outermost block wrapper so scroll-to-active still works after the header blocks are removed

## 5. Cleanup

- [x] 5.1 Delete `styles.headerBlockWrapper` from the main `styles` object
- [ ] 5.2 [手動驗證] 建立含群組 × 2 + 單針 + 多針法的圈，在 app 中確認：
  - [ ] 5.2.1 [手動] 所有 block 流式排列，群組 label 與後續元素同行
  - [ ] 5.2.2 [手動] 點群組 label → 整個重複完成
  - [ ] 5.2.3 [手動] 點群組內單個符號 → 只推進一針
  - [ ] 5.2.4 [手動] 點多針法 label（e.g. `hdc × 5`）→ 全部完成
  - [ ] 5.2.5 [手動] 點多針法內單個符號 → 只推進一針
  - [ ] 5.2.6 [手動] 符號顏色正確：已完成淺灰、當前粉紅、未完成深灰
  - [ ] 5.2.7 [手動] icon / text 模式切換後仍正常；預覽模式點擊無效
