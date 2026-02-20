import { PatternItem, PatternItemType, Round, StitchGroup, StitchInfo } from '../types'
import { generateId, nowISO } from './helpers'
import { calcRoundTotalStitches } from './patternHelpers'

// ─── Round Display ─────────────────────────────────────────────────────────────

/**
 * 將 0-based 的圈索引轉換為顯示用的圈號
 * roundStartNumber 為 0 時：第 0 圈顯示為 0
 * roundStartNumber 為 1 時：第 0 圈顯示為 1
 */
export function getRoundDisplayNumber(
  roundIndex: number,
  roundStartNumber: 0 | 1
): number {
  return roundIndex + roundStartNumber
}

// ─── Stitch Count ──────────────────────────────────────────────────────────────

/**
 * 計算一圈的總針目數
 * 加針類型（stitchCount > 1）以實際倍數計算
 */
export function getTotalStitchesInRound(round: Round): number {
  return calcRoundTotalStitches(round.patternItems)
}

// ─── Round Duplication ─────────────────────────────────────────────────────────

/** 深複製 StitchInfo，賦予新 ID */
function duplicateStitchInfo(stitch: StitchInfo): StitchInfo {
  return { ...stitch, id: generateId() }
}

/** 深複製 StitchGroup，賦予新 ID（group 本身及內部每個 stitch） */
function duplicateStitchGroup(group: StitchGroup): StitchGroup {
  return {
    ...group,
    id: generateId(),
    stitches: group.stitches.map(duplicateStitchInfo),
  }
}

/** 深複製 PatternItem，賦予新 ID（item 本身及內部 data） */
function duplicatePatternItem(item: PatternItem): PatternItem {
  const newData =
    item.type === PatternItemType.STITCH
      ? duplicateStitchInfo(item.data as StitchInfo)
      : duplicateStitchGroup(item.data as StitchGroup)

  return {
    ...item,
    id: generateId(),
    createdAt: nowISO(),
    data: newData,
  }
}

/**
 * 建立一圈的完整複製，所有 ID（圈、PatternItem、StitchInfo、StitchGroup）均重新產生
 */
export function duplicateRound(round: Round): Round {
  return {
    ...round,
    id: generateId(),
    patternItems: round.patternItems.map(duplicatePatternItem),
  }
}

// ─── Round Reordering ──────────────────────────────────────────────────────────

/**
 * 將指定索引的圈往前移動一個位置
 * 若已在第一位則回傳原陣列的淺複製（不改變順序）
 */
export function moveRoundUp(rounds: Round[], index: number): Round[] {
  if (index <= 0 || index >= rounds.length) return [...rounds]
  const result = [...rounds]
  ;[result[index - 1], result[index]] = [result[index], result[index - 1]]
  return result
}

/**
 * 將指定索引的圈往後移動一個位置
 * 若已在最後一位則回傳原陣列的淺複製（不改變順序）
 */
export function moveRoundDown(rounds: Round[], index: number): Round[] {
  if (index < 0 || index >= rounds.length - 1) return [...rounds]
  const result = [...rounds]
  ;[result[index], result[index + 1]] = [result[index + 1], result[index]]
  return result
}
