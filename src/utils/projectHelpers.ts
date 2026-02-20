import {
  Chart,
  ChartSummary,
  CraftType,
  Project,
  ProjectPhoto,
} from '../types'
import { generateId } from './helpers'
import { calcRoundTotalStitches } from './patternHelpers'

// ─── Factory Functions ─────────────────────────────────────────────────────────

/** 建立新 Chart，帶有正確預設值 */
export function createChart(params: {
  name: string
  description?: string
}): Chart {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    name: params.name,
    description: params.description,
    rounds: [],
    currentRound: 0,
    currentStitch: 0,
    createdAt: now,
    updatedAt: now,
    isCompleted: false,
  }
}

/** 建立新 Project，帶有正確預設值 */
export function createProject(params: {
  name: string
  craftType: CraftType
  roundStartNumber: 0 | 1
  source?: string
  notes?: string
}): Project {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    name: params.name,
    craftType: params.craftType,
    roundStartNumber: params.roundStartNumber,
    source: params.source,
    notes: params.notes,
    charts: [],
    photos: [],
    sessions: [],
    createdAt: now,
    updatedAt: now,
    isCompleted: false,
  }
}

// ─── Progress Calculation ──────────────────────────────────────────────────────

/**
 * 計算單一 Chart 的進度（0–100）
 * 以「已完成針目數 / 總針目數」計算
 */
export function calcChartProgress(chart: Chart): number {
  if (chart.isCompleted) return 100
  if (chart.rounds.length === 0) return 0

  const totalStitches = chart.rounds.reduce(
    (sum, r) => sum + calcRoundTotalStitches(r.patternItems),
    0
  )
  if (totalStitches === 0) return 0

  // 已完成圈的針目數
  const completedRoundStitches = chart.rounds
    .slice(0, chart.currentRound)
    .reduce((sum, r) => sum + calcRoundTotalStitches(r.patternItems), 0)

  const completed = completedRoundStitches + chart.currentStitch
  return Math.min(100, Math.round((completed / totalStitches) * 100))
}

/**
 * 計算 Project 的整體進度（0–100）
 * 以所有 Chart 進度的平均值計算；無圖表時回傳 0
 */
export function calcProjectProgress(project: Project): number {
  if (project.isCompleted) return 100
  if (project.charts.length === 0) return 0

  const total = project.charts.reduce(
    (sum, chart) => sum + calcChartProgress(chart),
    0
  )
  return Math.round(total / project.charts.length)
}

// ─── Photo Helpers ─────────────────────────────────────────────────────────────

/** 取得封面照片；無封面時回傳 undefined */
export function getCoverPhoto(project: Project): ProjectPhoto | undefined {
  return project.photos.find((p) => p.isCover)
}

/** 計算所有照片的總佔用空間（bytes） */
export function getTotalPhotoSize(photos: ProjectPhoto[]): number {
  return photos.reduce((sum, p) => sum + p.fileSize, 0)
}

// ─── Chart Lookup ──────────────────────────────────────────────────────────────

/** 取得目前作用中的 Chart；找不到時回傳第一張圖表或 undefined */
export function getCurrentChart(project: Project): Chart | undefined {
  if (project.charts.length === 0) return undefined
  if (project.currentChartId) {
    const found = project.charts.find((c) => c.id === project.currentChartId)
    if (found) return found
  }
  return project.charts[0]
}

// ─── Chart Summary ─────────────────────────────────────────────────────────────

/** 將 Chart 轉換為 UI 用的摘要物件 */
export function getChartSummary(chart: Chart): ChartSummary {
  const totalStitches = chart.rounds.reduce(
    (sum, r) => sum + calcRoundTotalStitches(r.patternItems),
    0
  )
  return {
    id: chart.id,
    name: chart.name,
    roundCount: chart.rounds.length,
    totalStitches,
    currentProgress: calcChartProgress(chart),
    isCompleted: chart.isCompleted ?? false,
    updatedAt: chart.updatedAt,
  }
}
