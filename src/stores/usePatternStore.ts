import { create } from 'zustand'
import { PatternItemType, StitchGroup, StitchInfo, StitchType } from '../types'
import { useChartStore } from './useChartStore'
import { useProjectStore } from './useProjectStore'

// ─── 內部工具 ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── 內部 Helper ──────────────────────────────────────────────────────────────

function getPatternItem(projectId: string, chartId: string, roundId: string, itemId: string) {
  const project = useProjectStore.getState().getProjectById(projectId)
  if (!project) return null
  const chart = project.charts.find((c) => c.id === chartId)
  if (!chart) return null
  const round = chart.rounds.find((r) => r.id === roundId)
  if (!round) return null
  return round.patternItems.find((i) => i.id === itemId) ?? null
}

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface PatternState {
  // ── 針法操作（typed wrappers，Req 3.3）──────────────────────────────────────
  /** 新增單一針法到段落 */
  addStitchToRound: (
    projectId: string,
    chartId: string,
    roundId: string,
    stitchType: StitchType,
    count: number,
    customName?: string,
    customAbbr?: string
  ) => void

  /** 更新段落內的針法資料 */
  updateStitch: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string,
    updates: Partial<Pick<StitchInfo, 'type' | 'count' | 'customName' | 'customAbbr'>>
  ) => void

  /** 刪除段落內的針法 */
  deleteStitch: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string
  ) => void

  // ── 群組操作（Req 3.4）──────────────────────────────────────────────────────
  /** 新增針法群組到段落 */
  addGroup: (
    projectId: string,
    chartId: string,
    roundId: string,
    name: string,
    stitches: StitchInfo[],
    repeatCount: number
  ) => void

  /** 更新段落內的群組資料 */
  updateGroup: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string,
    updates: Partial<Pick<StitchGroup, 'name' | 'stitches' | 'repeatCount'>>
  ) => void

  /** 刪除段落內的群組 */
  deleteGroup: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string
  ) => void

  // ── 排序操作（Req 3.5）──────────────────────────────────────────────────────
  /** 針法/群組項目上移一格 */
  movePatternItemUp: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string
  ) => void

  /** 針法/群組項目下移一格 */
  movePatternItemDown: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string
  ) => void

  /** 複製針法/群組項目並插入其後 */
  duplicatePatternItem: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string
  ) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePatternStore = create<PatternState>()(() => ({
  // ── 針法操作 ──────────────────────────────────────────────────────────────

  addStitchToRound: (projectId, chartId, roundId, stitchType, count, customName, customAbbr) => {
    const stitch: StitchInfo = {
      id: generateId(),
      type: stitchType,
      count,
      ...(customName !== undefined && { customName }),
      ...(customAbbr !== undefined && { customAbbr }),
    }
    useChartStore.getState().addPatternItem(projectId, chartId, roundId, stitch, PatternItemType.STITCH)
  },

  updateStitch: (projectId, chartId, roundId, itemId, updates) => {
    const item = getPatternItem(projectId, chartId, roundId, itemId)
    if (!item || item.type !== PatternItemType.STITCH) return

    const updatedStitch: StitchInfo = { ...(item.data as StitchInfo), ...updates }
    useChartStore.getState().updatePatternItem(projectId, chartId, roundId, itemId, updatedStitch)
  },

  deleteStitch: (projectId, chartId, roundId, itemId) => {
    useChartStore.getState().deletePatternItem(projectId, chartId, roundId, itemId)
  },

  // ── 群組操作 ──────────────────────────────────────────────────────────────

  addGroup: (projectId, chartId, roundId, name, stitches, repeatCount) => {
    const group: StitchGroup = {
      id: generateId(),
      name,
      stitches,
      repeatCount,
    }
    useChartStore.getState().addPatternItem(projectId, chartId, roundId, group, PatternItemType.GROUP)
  },

  updateGroup: (projectId, chartId, roundId, itemId, updates) => {
    const item = getPatternItem(projectId, chartId, roundId, itemId)
    if (!item || item.type !== PatternItemType.GROUP) return

    const updatedGroup: StitchGroup = { ...(item.data as StitchGroup), ...updates }
    useChartStore.getState().updatePatternItem(projectId, chartId, roundId, itemId, updatedGroup)
  },

  deleteGroup: (projectId, chartId, roundId, itemId) => {
    useChartStore.getState().deletePatternItem(projectId, chartId, roundId, itemId)
  },

  movePatternItemUp: (projectId, chartId, roundId, itemId) => {
    useChartStore.getState().movePatternItemUp(projectId, chartId, roundId, itemId)
  },

  movePatternItemDown: (projectId, chartId, roundId, itemId) => {
    useChartStore.getState().movePatternItemDown(projectId, chartId, roundId, itemId)
  },

  duplicatePatternItem: (projectId, chartId, roundId, itemId) => {
    useChartStore.getState().duplicatePatternItem(projectId, chartId, roundId, itemId)
  },
}))
