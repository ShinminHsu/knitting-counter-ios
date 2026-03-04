import { create } from 'zustand'
import { PatternItemType, Round, StitchGroup, StitchInfo, StitchTypeInfo } from '../types'
import { useProjectStore } from './useProjectStore'

// ─── 內部工具 ─────────────────────────────────────────────────────────────────

/** 單一 StitchInfo 的實際針數（加針類計 2，特殊針法依 stitchCount）*/
function physicalCount(stitch: StitchInfo): number {
  return stitch.count * (StitchTypeInfo[stitch.type]?.stitchCount ?? 1)
}

/**
 * 給定一圈的 position，回傳該 position 所在邏輯針法的 [start, end)。
 * 用於 advanceStitch（一次跳完整個邏輯針法）與 goBackStitch（退回上一針起點）。
 */
function getStitchBoundsAt(round: Round, position: number): { start: number; end: number } {
  let pos = 0
  for (const item of round.patternItems) {
    if (item.type === PatternItemType.STITCH) {
      const stitch = item.data as StitchInfo
      const sc = StitchTypeInfo[stitch.type]?.stitchCount ?? 1
      for (let i = 0; i < stitch.count; i++) {
        const end = pos + sc
        if (position >= pos && position < end) return { start: pos, end }
        pos = end
      }
    } else {
      const group = item.data as StitchGroup
      for (let r = 0; r < group.repeatCount; r++) {
        for (const s of group.stitches) {
          const sc = StitchTypeInfo[s.type]?.stitchCount ?? 1
          for (let i = 0; i < s.count; i++) {
            const end = pos + sc
            if (position >= pos && position < end) return { start: pos, end }
            pos = end
          }
        }
      }
    }
  }
  return { start: position, end: position + 1 }
}

/** 單一 PatternItem 的實際針數（含 group 展開）*/
function itemPhysicalCount(item: { type: PatternItemType; data: StitchInfo | StitchGroup }): number {
  if (item.type === PatternItemType.STITCH) {
    return physicalCount(item.data as StitchInfo)
  }
  const group = item.data as StitchGroup
  const perRepeat = group.stitches.reduce((sum, s) => sum + physicalCount(s), 0)
  return perRepeat * group.repeatCount
}

/** 一整圈的實際總針數 */
export function totalStitchesInRound(round: Round): number {
  return round.patternItems.reduce((sum, item) => sum + itemPhysicalCount(item), 0)
}

// ─── 內部 Helper：取得 Chart ──────────────────────────────────────────────────

function getChart(projectId: string, chartId: string) {
  const project = useProjectStore.getState().getProjectById(projectId)
  if (!project) return null
  return project.charts.find((c) => c.id === chartId) ?? null
}

// ─── State & Actions Interface ─────────────────────────────────────────────────

type AdvanceResult = 'stitch' | 'round' | 'chart'

interface ProgressState {
  /**
   * 向前一針（Req 4.2）
   * 回傳值：
   *   'stitch' — 普通推進
   *   'round'  — 完成一圈，進入下一圈
   *   'chart'  — 完成最後一圈，整張圖表完成
   */
  advanceStitch: (projectId: string, chartId: string) => AdvanceResult

  /** 向後一針（Req 4.3）*/
  goBackStitch: (projectId: string, chartId: string) => void

  /**
   * 完成此圈並立即進入下一圈（Req 4.11，跳過剩餘針數）
   * 若為最後一圈則觸發完成流程。
   */
  completeRound: (projectId: string, chartId: string) => AdvanceResult

  /** 重新開始此圈：重置針目計數器至 0（Req 4.10）*/
  resetRound: (projectId: string, chartId: string) => void

  /**
   * 跳到指定針目位置（Req 4.13，點擊 stitch block / group repeat label）
   * stitchPosition 為該 round 內的絕對位置（0-based）。
   * 若 position <= currentStitch，不做任何事（已完成的 block 無效，Req 4.14）。
   */
  jumpToStitchPosition: (
    projectId: string,
    chartId: string,
    stitchPosition: number
  ) => void

  /** 直接設定進度（Req 4.7，重新進入追蹤模式時還原位置）*/
  setProgress: (
    projectId: string,
    chartId: string,
    roundIndex: number,
    stitchPosition: number
  ) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProgressStore = create<ProgressState>()(() => ({
  advanceStitch: (projectId, chartId) => {
    const chart = getChart(projectId, chartId)
    if (!chart || chart.rounds.length === 0) return 'stitch'

    const { currentRound, currentStitch, rounds } = chart
    const round = rounds[currentRound]
    if (!round) return 'stitch'

    const total = totalStitchesInRound(round)

    // 找到當前邏輯針法的結束位置，一次跳完整個針法（含 stitchCount > 1 的針法）
    const { end: nextStitch } = getStitchBoundsAt(round, currentStitch)

    if (nextStitch < total) {
      useProjectStore.getState().updateChart(projectId, chartId, {
        currentStitch: nextStitch,
      })
      return 'stitch'
    }

    // 此圈結束
    const nextRoundIndex = currentRound + 1
    if (nextRoundIndex < rounds.length) {
      // 進入下一圈
      useProjectStore.getState().updateChart(projectId, chartId, {
        currentRound: nextRoundIndex,
        currentStitch: 0,
      })
      return 'round'
    }

    // 所有圈完成 → 標記圖表完成
    useProjectStore.getState().markChartComplete(projectId, chartId)
    return 'chart'
  },

  goBackStitch: (projectId, chartId) => {
    const chart = getChart(projectId, chartId)
    if (!chart || chart.rounds.length === 0) return

    const { currentRound, currentStitch, rounds } = chart

    const round = rounds[currentRound]

    if (currentStitch > 0 && round) {
      // 退回到上一個邏輯針法的起始位置
      const { start } = getStitchBoundsAt(round, currentStitch - 1)
      useProjectStore.getState().updateChart(projectId, chartId, {
        currentStitch: start,
      })
      return
    }

    if (currentRound > 0) {
      const prevRound = rounds[currentRound - 1]
      const prevTotal = totalStitchesInRound(prevRound)
      // 退到上一圈最後一個邏輯針法的起始位置
      const { start } = getStitchBoundsAt(prevRound, Math.max(0, prevTotal - 1))
      useProjectStore.getState().updateChart(projectId, chartId, {
        currentRound: currentRound - 1,
        currentStitch: start,
      })
    }
    // 若已在最開頭，不做任何事
  },

  completeRound: (projectId, chartId) => {
    const chart = getChart(projectId, chartId)
    if (!chart || chart.rounds.length === 0) return 'stitch'

    const { currentRound, rounds } = chart
    const nextRoundIndex = currentRound + 1

    if (nextRoundIndex < rounds.length) {
      useProjectStore.getState().updateChart(projectId, chartId, {
        currentRound: nextRoundIndex,
        currentStitch: 0,
      })
      return 'round'
    }

    // 最後一圈 → 圖表完成（Req 4.12）
    useProjectStore.getState().markChartComplete(projectId, chartId)
    return 'chart'
  },

  resetRound: (projectId, chartId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    useProjectStore.getState().updateChart(projectId, chartId, {
      currentStitch: 0,
    })
  },

  jumpToStitchPosition: (projectId, chartId, stitchPosition) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const { currentStitch, currentRound, rounds } = chart
    const round = rounds[currentRound]
    if (!round) return

    const total = totalStitchesInRound(round)

    // 已完成的 block 無效（Req 4.14）；不能超過本圈範圍
    if (stitchPosition <= currentStitch || stitchPosition >= total) return

    useProjectStore.getState().updateChart(projectId, chartId, {
      currentStitch: stitchPosition,
    })
  },

  setProgress: (projectId, chartId, roundIndex, stitchPosition) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const clampedRound = Math.max(0, Math.min(roundIndex, chart.rounds.length - 1))
    const round = chart.rounds[clampedRound]
    const total = round ? totalStitchesInRound(round) : 0
    const clampedStitch = Math.max(0, total > 0 ? Math.min(stitchPosition, total - 1) : 0)

    useProjectStore.getState().updateChart(projectId, chartId, {
      currentRound: clampedRound,
      currentStitch: clampedStitch,
    })
  },
}))
