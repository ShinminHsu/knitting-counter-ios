import { Chart, Project, StitchInfo, StitchGroup, PatternItemType } from '../types'
import { calcRoundTotalStitches } from './patternHelpers'

// ─── Chart Progress ─────────────────────────────────────────────────────────────

/**
 * 計算單一 Chart 的進度百分比（0–100）
 *
 * - 已標記完成（isCompleted）→ 直接回傳 100
 * - 無段落 → 回傳 0
 * - 其餘：（已完成圈的針目數 + 當前圈已走針目數）/ 總針目數 × 100
 */
export function calculateProgressPercentage(chart: Chart): number {
  if (chart.isCompleted) return 100
  if (chart.rounds.length === 0) return 0

  const totalStitches = chart.rounds.reduce(
    (sum, r) => sum + calcRoundTotalStitches(r.patternItems),
    0
  )
  if (totalStitches === 0) return 0

  // 已完成圈（currentRound 之前的所有圈）的針目數加總
  const completedRoundStitches = chart.rounds
    .slice(0, chart.currentRound)
    .reduce((sum, r) => sum + calcRoundTotalStitches(r.patternItems), 0)

  const completed = completedRoundStitches + chart.currentStitch
  return Math.min(100, Math.round((completed / totalStitches) * 100))
}

// ─── Completion Checks ──────────────────────────────────────────────────────────

/**
 * 判斷單一 Chart 是否已完成
 *
 * - 已設定 isCompleted 旗標 → true
 * - 無段落 → false
 * - currentRound 超出段落陣列範圍 → true（進度已超過最後一圈）
 * - currentRound 在最後一圈且 currentStitch 達到該圈總針數 → true
 */
export function isChartComplete(chart: Chart): boolean {
  if (chart.isCompleted) return true
  if (chart.rounds.length === 0) return false

  const lastIndex = chart.rounds.length - 1

  // 進度超出最後一圈
  if (chart.currentRound > lastIndex) return true

  // 在最後一圈且已完成所有針目
  if (chart.currentRound === lastIndex) {
    const lastRound = chart.rounds[lastIndex]
    const totalInLastRound = calcRoundTotalStitches(lastRound.patternItems)
    return chart.currentStitch >= totalInLastRound
  }

  return false
}

/**
 * 判斷整個 Project 是否已完成
 *
 * - 已設定 isCompleted 旗標 → true
 * - 無圖表 → false
 * - 所有圖表均完成 → true；否則 → false
 */
export function isProjectComplete(project: Project): boolean {
  if (project.isCompleted) return true
  if (project.charts.length === 0) return false
  return project.charts.every(isChartComplete)
}

// ─── Current Stitch Info ────────────────────────────────────────────────────────

/** 當前針法資訊，用於進度追蹤畫面顯示 */
export interface CurrentStitchInfo {
  /** 目前所在圈的 0-based 索引 */
  roundIndex: number
  /** 目前圈內的 0-based 針目位置 */
  stitchIndex: number
  /** 目前圈的總針目數 */
  roundTotalStitches: number
  /** 目前針目所屬的 PatternItem 類型（'stitch' | 'group'）*/
  itemType: PatternItemType
  /** 目前針目的 StitchInfo 資料（type 為 STITCH 時）*/
  stitchInfo?: StitchInfo
  /** 目前針目所在的 StitchGroup 資料（type 為 GROUP 時）*/
  groupInfo?: StitchGroup
  /** 針目在群組內的位置資訊（type 為 GROUP 時）*/
  groupPosition?: {
    /** 正在進行第幾次重複（0-based）*/
    repeatIndex: number
    /** 此重複中的哪個針法（0-based）*/
    stitchInRepeatIndex: number
    /** 對應的 StitchInfo */
    stitchInfo: StitchInfo
  }
}

/**
 * 取得 Chart 當前針目的完整資訊
 *
 * - Chart 已完成 → undefined
 * - 無段落或 currentRound 超出範圍 → undefined
 * - 其餘：解析 currentStitch 位置，找出對應的 PatternItem 及 StitchInfo
 */
export function getCurrentStitchInfo(chart: Chart): CurrentStitchInfo | undefined {
  if (chart.isCompleted) return undefined
  if (chart.rounds.length === 0) return undefined

  const roundIndex = chart.currentRound
  if (roundIndex < 0 || roundIndex >= chart.rounds.length) return undefined

  const round = chart.rounds[roundIndex]
  const stitchIndex = chart.currentStitch
  const roundTotalStitches = calcRoundTotalStitches(round.patternItems)

  // stitchIndex 超出本圈範圍（圈末尾等待前進）
  if (stitchIndex >= roundTotalStitches && roundTotalStitches > 0) return undefined

  // 逐一走訪 PatternItem 定位出 stitchIndex 對應的位置
  let cursor = 0

  for (const item of round.patternItems) {
    if (item.type === PatternItemType.STITCH) {
      const stitch = item.data as StitchInfo
      const itemCount = stitch.count
      if (stitchIndex < cursor + itemCount) {
        return {
          roundIndex,
          stitchIndex,
          roundTotalStitches,
          itemType: PatternItemType.STITCH,
          stitchInfo: stitch,
        }
      }
      cursor += itemCount
    } else {
      // GROUP：展開所有重複
      const group = item.data as StitchGroup
      const stitchesPerRepeat = group.stitches.reduce((sum, s) => sum + s.count, 0)
      const groupTotal = stitchesPerRepeat * group.repeatCount

      if (stitchIndex < cursor + groupTotal) {
        const posInGroup = stitchIndex - cursor
        const repeatIndex = Math.floor(posInGroup / stitchesPerRepeat)
        const posInRepeat = posInGroup % stitchesPerRepeat

        // 定位出群組內第幾個 StitchInfo
        let stitchCursor = 0
        let foundStitch: StitchInfo | undefined
        let stitchInRepeatIndex = 0
        for (let i = 0; i < group.stitches.length; i++) {
          const s = group.stitches[i]
          if (posInRepeat < stitchCursor + s.count) {
            foundStitch = s
            stitchInRepeatIndex = i
            break
          }
          stitchCursor += s.count
        }

        return {
          roundIndex,
          stitchIndex,
          roundTotalStitches,
          itemType: PatternItemType.GROUP,
          groupInfo: group,
          groupPosition: foundStitch
            ? {
                repeatIndex,
                stitchInRepeatIndex,
                stitchInfo: foundStitch,
              }
            : undefined,
        }
      }
      cursor += groupTotal
    }
  }

  return undefined
}
