import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { Chart, CraftType, Project, ProjectPhoto } from '../types'
import { createChart, createProject } from '../utils'
import { mmkvStorage, STORAGE_KEYS } from './mmkvStorage'

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface ProjectState {
  projects: Project[]

  // ── 專案 CRUD ──────────────────────────────────────────────────────────────
  /** 新增專案（Req 1.4） */
  addProject: (params: {
    name: string
    craftType: CraftType
    roundStartNumber: 0 | 1
    source?: string
    notes?: string
  }) => Project

  /** 更新專案基本資訊（Req 1.5） */
  updateProject: (id: string, updates: Partial<Pick<Project, 'name' | 'craftType' | 'roundStartNumber' | 'source' | 'notes'>>) => void

  /** 刪除專案（Req 1.6） */
  deleteProject: (id: string) => void

  /** 依 ID 取得專案 */
  getProjectById: (id: string) => Project | undefined

  // ── 圖表管理 ───────────────────────────────────────────────────────────────
  /** 新增圖表到專案（Req 2.2） */
  addChart: (projectId: string, name: string, description?: string, roundStartNumber?: 0 | 1) => Chart | null

  /** 更新圖表資訊（包含段落資料） */
  updateChart: (projectId: string, chartId: string, updates: Partial<Pick<Chart, 'name' | 'description' | 'notes' | 'referenceImageUri' | 'rounds' | 'currentRound' | 'currentStitch'>>) => void

  /** 刪除圖表（Req 2.4） */
  deleteChart: (projectId: string, chartId: string) => void

  /** 切換目前作用中的圖表（Req 2.3） */
  setCurrentChart: (projectId: string, chartId: string) => void

  /** 標記圖表為完成 */
  markChartComplete: (projectId: string, chartId: string) => void

  // ── 照片管理 ───────────────────────────────────────────────────────────────
  /** 新增照片到專案（Req 6.3） */
  addPhoto: (projectId: string, photo: ProjectPhoto) => void

  /** 刪除照片（Req 6.5, 7.6） */
  deletePhoto: (projectId: string, photoId: string) => void

  /** 設定封面照片（Req 6.5） */
  setCoverPhoto: (projectId: string, photoId: string) => void

  // ── 完成狀態 ───────────────────────────────────────────────────────────────
  /** 標記專案完成（Req 4.5） */
  markProjectComplete: (projectId: string) => void

  /** 記錄 interstitial 廣告已顯示（Req 11.15） */
  markInterstitialShown: (projectId: string) => void

  // ── 匯入 ───────────────────────────────────────────────────────────────────
  /** 匯入專案（Req 8.3 — CREATE_NEW 模式） */
  importProject: (project: Project) => void

  /** 覆寫現有專案（Req 8.3 — OVERWRITE 模式） */
  overwriteProject: (project: Project) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],

      // ── 專案 CRUD ────────────────────────────────────────────────────────────

      addProject: (params) => {
        const project = createProject(params)
        set((state) => ({ projects: [...state.projects, project] }))
        return project
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }))
      },

      getProjectById: (id) => {
        return get().projects.find((p) => p.id === id)
      },

      // ── 圖表管理 ──────────────────────────────────────────────────────────────

      addChart: (projectId, name, description, roundStartNumber) => {
        const project = get().projects.find((p) => p.id === projectId)
        if (!project) return null

        const chart = createChart({ name, description, roundStartNumber })
        const now = new Date().toISOString()
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  charts: [...p.charts, chart],
                  currentChartId: p.currentChartId ?? chart.id,
                  updatedAt: now,
                }
              : p
          ),
        }))
        return chart
      },

      updateChart: (projectId, chartId, updates) => {
        const now = new Date().toISOString()
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  charts: p.charts.map((c) =>
                    c.id === chartId ? { ...c, ...updates, updatedAt: now } : c
                  ),
                  updatedAt: now,
                }
              : p
          ),
        }))
      },

      deleteChart: (projectId, chartId) => {
        const now = new Date().toISOString()
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const remaining = p.charts.filter((c) => c.id !== chartId)
            return {
              ...p,
              charts: remaining,
              // 若刪除的是目前圖表，切換到第一張
              currentChartId:
                p.currentChartId === chartId
                  ? remaining[0]?.id
                  : p.currentChartId,
              updatedAt: now,
            }
          }),
        }))
      },

      setCurrentChart: (projectId, chartId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, currentChartId: chartId, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      markChartComplete: (projectId, chartId) => {
        const now = new Date().toISOString()
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p
            const charts = p.charts.map((c) =>
              c.id === chartId ? { ...c, isCompleted: true, updatedAt: now } : c
            )
            const allComplete = charts.every((c) => c.isCompleted)
            return {
              ...p,
              charts,
              isCompleted: allComplete,
              updatedAt: now,
            }
          }),
        }))
      },

      // ── 照片管理 ────────────────────────────────────────────────────────────

      addPhoto: (projectId, photo) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  photos: [...p.photos, photo],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      deletePhoto: (projectId, photoId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  photos: p.photos.filter((ph) => ph.id !== photoId),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      setCoverPhoto: (projectId, photoId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  photos: p.photos.map((ph) => ({
                    ...ph,
                    isCover: ph.id === photoId,
                  })),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      // ── 完成狀態 ────────────────────────────────────────────────────────────

      markProjectComplete: (projectId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, isCompleted: true, updatedAt: new Date().toISOString() }
              : p
          ),
        }))
      },

      markInterstitialShown: (projectId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, interstitialShown: true } : p
          ),
        }))
      },

      // ── 匯入 ────────────────────────────────────────────────────────────────

      importProject: (project) => {
        set((state) => ({ projects: [...state.projects, project] }))
      },

      overwriteProject: (project) => {
        set((state) => {
          const exists = state.projects.some((p) => p.id === project.id)
          if (exists) {
            return {
              projects: state.projects.map((p) =>
                p.id === project.id ? project : p
              ),
            }
          }
          return { projects: [...state.projects, project] }
        })
      },
    }),
    {
      name: STORAGE_KEYS.PROJECTS,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
