import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { StitchGroup, StitchGroupTemplate, StitchInfo } from '../types'
import { mmkvStorage, STORAGE_KEYS } from './mmkvStorage'

// ─── 內部工具 ─────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ─── State & Actions Interface ─────────────────────────────────────────────────

interface TemplateState {
  templates: StitchGroupTemplate[]

  /** 新增樣板（Req 5.3） */
  addTemplate: (
    params: Pick<StitchGroupTemplate, 'name' | 'stitches' | 'repeatCount'> &
      Partial<Pick<StitchGroupTemplate, 'description' | 'category'>>
  ) => StitchGroupTemplate

  /** 更新樣板 */
  updateTemplate: (
    id: string,
    updates: Partial<Pick<StitchGroupTemplate, 'name' | 'description' | 'stitches' | 'repeatCount' | 'category'>>
  ) => void

  /** 刪除樣板 */
  deleteTemplate: (id: string) => void

  /** 即時名稱搜尋（Req 5.5） */
  searchTemplates: (query: string) => StitchGroupTemplate[]

  /**
   * 將樣板展開為 StitchGroup，可直接插入圈段（Req 5.4）
   * 展開時為每個 StitchInfo 產生新 ID，避免與原始樣板衝突
   */
  expandTemplate: (id: string) => StitchGroup | null

  /** 記錄使用（更新 lastUsed 與 useCount） */
  incrementUseCount: (id: string) => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: [],

      addTemplate: (params) => {
        const template: StitchGroupTemplate = {
          id: generateId(),
          name: params.name,
          stitches: params.stitches.map((s): StitchInfo => ({ ...s, id: generateId() })),
          repeatCount: params.repeatCount,
          ...(params.description !== undefined && { description: params.description }),
          ...(params.category !== undefined && { category: params.category }),
          createdAt: new Date().toISOString(),
          useCount: 0,
        }
        set((state) => ({ templates: [...state.templates, template] }))
        return template
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }))
      },

      searchTemplates: (query) => {
        const trimmed = query.trim().toLowerCase()
        if (!trimmed) return get().templates

        return get().templates.filter((t) =>
          t.name.toLowerCase().includes(trimmed)
        )
      },

      expandTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id)
        if (!template) return null

        const group: StitchGroup = {
          id: generateId(),
          name: template.name,
          stitches: template.stitches.map((s): StitchInfo => ({ ...s, id: generateId() })),
          repeatCount: template.repeatCount,
        }
        return group
      },

      incrementUseCount: (id) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id
              ? { ...t, useCount: t.useCount + 1, lastUsed: new Date().toISOString() }
              : t
          ),
        }))
      },
    }),
    {
      name: STORAGE_KEYS.TEMPLATES,
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
)
