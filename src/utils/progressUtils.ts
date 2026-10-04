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
  return isChartCompleteByProgress(chart)
}

/**
 * 只看儲存的進度判斷是否完成，不看 isCompleted 旗標
 *
 * 供 useProjectStore.updateChart 在圈數或進度變動時重新推導完成狀態使用；
 * 若沿用 isChartComplete 會因旗標短路而永遠回傳 true。
 */
export function isChartCompleteByProgress(chart: Chart): boolean {
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
 * 位置欄位正規化：舊版匯出的檔案可能缺欄位或存成非整數，一律當成 0 起算
 */
function toPosition(value: number): number {
  return Number.isFinite(value) ? Math.max(Math.floor(value), 0) : 0
}

export interface DeriveCompletionOptions {
  /**
   * 匯入／還原專用：旗標說完成、且位置已經在最後一圈時，把位置補到該圈結尾。
   *
   * 舊版有「織完最後一圈但 currentStitch 沒補到總針數」的 bug，那些檔案裡
   * 真正織完的織圖會差最後幾針；位置若已在最後一圈就視為少記，補完維持完成。
   * 反之「完成後又加圈」的髒資料位置會落在非最後一圈，不受此規則保護。
   *
   * updateChart 不可開啟：否則使用者重設最後一圈時會被舊旗標救回完成狀態。
   */
  trustCompletedInLastRound?: boolean
}

/**
 * 依儲存的進度重新推導整個專案的完成狀態（唯一一份推導邏輯）
 *
 * 每張 chart 的位置會被夾進合法範圍，isCompleted 一律由位置推導而來，
 * 不直接沿用傳入的旗標；專案的 isCompleted 再由所有 chart 推導。
 *
 * 供兩種情境共用：
 *   1. updateChart —— 圈數或進度變動後重算（嚴格模式）
 *   2. importProject / overwriteProject —— 整包專案寫入（匯入、合併、iCloud 還原）
 *      舊版曾把錯的 isCompleted: true 寫進資料並一路帶到匯出檔，
 *      在入口重算才能把這些髒旗標洗掉。
 */
export function withDerivedCompletion(
  project: Project,
  options: DeriveCompletionOptions = {}
): Project {
  const charts = project.charts.map((chart) => {
    const lastIndex = chart.rounds.length - 1
    if (lastIndex < 0) {
      return { ...chart, currentRound: 0, currentStitch: 0, isCompleted: false }
    }

    const rawRound = toPosition(chart.currentRound)
    const currentRound = Math.min(rawRound, lastIndex)
    const roundTotal = calcRoundTotalStitches(chart.rounds[currentRound].patternItems)

    // 位置超出最後一圈代表進度已經走完，補到結尾而不是停在半途
    const snapToEnd =
      rawRound > lastIndex ||
      (options.trustCompletedInLastRound === true &&
        chart.isCompleted === true &&
        currentRound === lastIndex)

    const currentStitch = snapToEnd
      ? roundTotal
      : Math.min(toPosition(chart.currentStitch), roundTotal)
    const clamped = { ...chart, currentRound, currentStitch }

    return { ...clamped, isCompleted: isChartCompleteByProgress(clamped) }
  })

  return {
    ...project,
    charts,
    isCompleted: charts.length > 0 && charts.every((c) => c.isCompleted === true),
  }
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
