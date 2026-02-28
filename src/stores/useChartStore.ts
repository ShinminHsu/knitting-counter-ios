import { create } from 'zustand'
import { PatternItem, PatternItemType, Round, StitchGroup, StitchInfo } from '../types'
import { useProjectStore } from './useProjectStore'

// ─── 內部工具 ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface ChartState {
  // ── 段落管理 ───────────────────────────────────────────────────────────────
  /** 新增段落到圖表末尾或指定位置（Req 3.2） */
  addRound: (projectId: string, chartId: string, insertAfterIndex?: number) => Round | null

  /** 更新段落備註（Req 3.1） */
  updateRound: (
    projectId: string,
    chartId: string,
    roundId: string,
    updates: Partial<Pick<Round, 'notes'>>
  ) => void

  /** 刪除段落（Req 3） */
  deleteRound: (projectId: string, chartId: string, roundId: string) => void

  /** 段落上移一格（Req 3.5） */
  moveRoundUp: (projectId: string, chartId: string, roundId: string) => void

  /** 段落下移一格（Req 3.5） */
  moveRoundDown: (projectId: string, chartId: string, roundId: string) => void

  /** 複製段落並插入其後（Req 3.6） */
  duplicateRound: (projectId: string, chartId: string, roundId: string) => Round | null

  // ── 針法項目管理 ───────────────────────────────────────────────────────────
  /** 新增針法或群組到段落（Req 3.3, 3.4） */
  addPatternItem: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemData: StitchInfo | StitchGroup,
    itemType: PatternItemType
  ) => void

  /** 更新段落內的針法項目（Req 3.3） */
  updatePatternItem: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string,
    data: StitchInfo | StitchGroup
  ) => void

  /** 刪除段落內的針法項目 */
  deletePatternItem: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string
  ) => void

  /** 針法項目上移一格（Req 3.5） */
  movePatternItemUp: (
    projectId: string,
    chartId: string,
    roundId: string,
    itemId: string
  ) => void

  /** 針法項目下移一格（Req 3.5） */
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

  /** 依提供的 ID 順序重新排列段落內的針法項目（Req 7.3） */
  reorderPatternItems: (
    projectId: string,
    chartId: string,
    roundId: string,
    orderedIds: string[]
  ) => void
}

// ─── 內部 Helper：取得圖表 ──────────────────────────────────────────────────────

function getChart(projectId: string, chartId: string) {
  const project = useProjectStore.getState().getProjectById(projectId)
  if (!project) return null
  return project.charts.find((c) => c.id === chartId) ?? null
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChartStore = create<ChartState>()(() => ({
  // ── 段落管理 ──────────────────────────────────────────────────────────────

  addRound: (projectId, chartId, insertAfterIndex) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return null

    const newRound: Round = {
      id: generateId(),
      roundNumber: 0, // 會在下方重新計算
      patternItems: [],
    }

    const rounds = [...chart.rounds]
    if (
      insertAfterIndex !== undefined &&
      insertAfterIndex >= 0 &&
      insertAfterIndex < rounds.length
    ) {
      rounds.splice(insertAfterIndex + 1, 0, newRound)
    } else {
      rounds.push(newRound)
    }

    const updatedRounds = rounds.map((r, idx) => ({ ...r, roundNumber: idx }))
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
    return newRound
  },

  updateRound: (projectId, chartId, roundId, updates) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const updatedRounds = chart.rounds.map((r) =>
      r.id === roundId ? { ...r, ...updates } : r
    )
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  deleteRound: (projectId, chartId, roundId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const filtered = chart.rounds.filter((r) => r.id !== roundId)
    const updatedRounds = filtered.map((r, idx) => ({ ...r, roundNumber: idx }))
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  moveRoundUp: (projectId, chartId, roundId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const idx = chart.rounds.findIndex((r) => r.id === roundId)
    if (idx <= 0) return

    const rounds = [...chart.rounds]
    ;[rounds[idx - 1], rounds[idx]] = [rounds[idx], rounds[idx - 1]]
    const updatedRounds = rounds.map((r, i) => ({ ...r, roundNumber: i }))
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  moveRoundDown: (projectId, chartId, roundId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const idx = chart.rounds.findIndex((r) => r.id === roundId)
    if (idx < 0 || idx >= chart.rounds.length - 1) return

    const rounds = [...chart.rounds]
    ;[rounds[idx], rounds[idx + 1]] = [rounds[idx + 1], rounds[idx]]
    const updatedRounds = rounds.map((r, i) => ({ ...r, roundNumber: i }))
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  duplicateRound: (projectId, chartId, roundId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return null

    const idx = chart.rounds.findIndex((r) => r.id === roundId)
    if (idx < 0) return null

    const original = chart.rounds[idx]
    const now = new Date().toISOString()

    const clonedItems: PatternItem[] = original.patternItems.map((item) => ({
      ...item,
      id: generateId(),
      createdAt: now,
    }))

    const duplicate: Round = {
      ...original,
      id: generateId(),
      patternItems: clonedItems,
    }

    const rounds = [...chart.rounds]
    rounds.push(duplicate)
    const updatedRounds = rounds.map((r, i) => ({ ...r, roundNumber: i }))
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
    return duplicate
  },

  // ── 針法項目管理 ────────────────────────────────────────────────────────────

  addPatternItem: (projectId, chartId, roundId, itemData, itemType) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const round = chart.rounds.find((r) => r.id === roundId)
    if (!round) return

    const now = new Date().toISOString()
    const newItem: PatternItem = {
      id: generateId(),
      type: itemType,
      order: round.patternItems.length,
      createdAt: now,
      data: itemData,
    }

    const updatedRounds = chart.rounds.map((r) =>
      r.id === roundId ? { ...r, patternItems: [...r.patternItems, newItem] } : r
    )
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  updatePatternItem: (projectId, chartId, roundId, itemId, data) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const updatedRounds = chart.rounds.map((r) =>
      r.id === roundId
        ? {
            ...r,
            patternItems: r.patternItems.map((item) =>
              item.id === itemId ? { ...item, data } : item
            ),
          }
        : r
    )
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  deletePatternItem: (projectId, chartId, roundId, itemId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return

    const updatedRounds = chart.rounds.map((r) =>
      r.id === roundId
        ? {
            ...r,
            patternItems: r.patternItems
              .filter((item) => item.id !== itemId)
              .map((item, idx) => ({ ...item, order: idx })),
          }
        : r
    )
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  movePatternItemUp: (projectId, chartId, roundId, itemId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return
    const updatedRounds = chart.rounds.map((r) => {
      if (r.id !== roundId) return r
      const items = [...r.patternItems].sort((a, b) => a.order - b.order)
      const idx = items.findIndex((i) => i.id === itemId)
      if (idx <= 0) return r
      ;[items[idx - 1], items[idx]] = [items[idx], items[idx - 1]]
      return { ...r, patternItems: items.map((item, i) => ({ ...item, order: i })) }
    })
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  movePatternItemDown: (projectId, chartId, roundId, itemId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return
    const updatedRounds = chart.rounds.map((r) => {
      if (r.id !== roundId) return r
      const items = [...r.patternItems].sort((a, b) => a.order - b.order)
      const idx = items.findIndex((i) => i.id === itemId)
      if (idx < 0 || idx >= items.length - 1) return r
      ;[items[idx], items[idx + 1]] = [items[idx + 1], items[idx]]
      return { ...r, patternItems: items.map((item, i) => ({ ...item, order: i })) }
    })
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  duplicatePatternItem: (projectId, chartId, roundId, itemId) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return
    const updatedRounds = chart.rounds.map((r) => {
      if (r.id !== roundId) return r
      const items = [...r.patternItems].sort((a, b) => a.order - b.order)
      const idx = items.findIndex((i) => i.id === itemId)
      if (idx < 0) return r
      const original = items[idx]
      const duplicate: PatternItem = {
        ...original,
        id: generateId(),
        createdAt: new Date().toISOString(),
        data: JSON.parse(JSON.stringify(original.data)),
      }
      items.push(duplicate)
      return { ...r, patternItems: items.map((item, i) => ({ ...item, order: i })) }
    })
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },

  reorderPatternItems: (projectId, chartId, roundId, orderedIds) => {
    const chart = getChart(projectId, chartId)
    if (!chart) return
    const updatedRounds = chart.rounds.map((r) => {
      if (r.id !== roundId) return r
      const reordered = orderedIds
        .map((id, idx) => {
          const item = r.patternItems.find((i) => i.id === id)
          return item ? { ...item, order: idx } : null
        })
        .filter(Boolean) as PatternItem[]
      return { ...r, patternItems: reordered }
    })
    useProjectStore.getState().updateChart(projectId, chartId, { rounds: updatedRounds })
  },
}))
