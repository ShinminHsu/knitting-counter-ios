import { PatternItem, PatternItemType, Round, StitchGroup, StitchInfo, StitchType } from '../types'
import { INCREASE_STITCH_TYPES } from '../constants/stitches'

// ─── Stitch Display Count Utilities (Req 4.15) ────────────────────────────────
//
// 加針類型在顯示針目數時計為 2 針（而非 1 針），與 web 版 singleStitchNavigation.ts 邏輯一致。

/**
 * 計算單一針法類型的顯示針目數
 *
 * 加針類型（如短針加針、長針加針、棒針左/右加針等）計為 count * 2；
 * 其餘針法計為 count * 1。
 *
 * @param stitchType - 針法類型
 * @param count - 針法重複次數
 * @returns 顯示用針目數
 */
export function getStitchDisplayCount(stitchType: StitchType, count: number): number {
  if (INCREASE_STITCH_TYPES.includes(stitchType)) {
    return count * 2
  }
  return count
}

/**
 * 計算單一 StitchInfo 的顯示針目數
 *
 * @param stitchInfo - 針法資訊物件
 * @returns 顯示用針目數
 */
export function getStitchInfoDisplayCount(stitchInfo: StitchInfo): number {
  return getStitchDisplayCount(stitchInfo.type, stitchInfo.count)
}

/**
 * 計算 StitchGroup 單次重複的顯示針目數（不含 repeatCount 倍數）
 *
 * @param group - 針法群組
 * @returns 單次重複的顯示針目數
 */
export function getGroupDisplayCount(group: StitchGroup): number {
  return group.stitches.reduce((sum, stitch) => sum + getStitchInfoDisplayCount(stitch), 0)
}

/**
 * 計算 StitchGroup 含所有重複次數的總顯示針目數
 *
 * @param group - 針法群組
 * @returns 所有重複的顯示針目數總計
 */
export function getGroupTotalDisplayCount(group: StitchGroup): number {
  return getGroupDisplayCount(group) * group.repeatCount
}

/**
 * 計算單一 PatternItem 的顯示針目數
 *
 * - type 為 STITCH：使用 getStitchInfoDisplayCount
 * - type 為 GROUP：使用 getGroupTotalDisplayCount（含所有重複）
 *
 * @param item - PatternItem（stitch 或 group）
 * @returns 顯示用針目數
 */
export function getPatternItemDisplayCount(item: PatternItem): number {
  if (item.type === PatternItemType.STITCH) {
    return getStitchInfoDisplayCount(item.data as StitchInfo)
  } else {
    return getGroupTotalDisplayCount(item.data as StitchGroup)
  }
}

/**
 * 計算一整圈（Round）的總顯示針目數
 *
 * 遍歷所有 patternItems，加總每個 item 的顯示針目數。
 *
 * @param round - 圈（段落）
 * @returns 該圈的總顯示針目數
 */
export function getRoundTotalDisplayCount(round: Round): number {
  return round.patternItems.reduce((sum, item) => sum + getPatternItemDisplayCount(item), 0)
}
